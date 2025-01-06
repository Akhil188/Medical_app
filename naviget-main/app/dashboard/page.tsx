"use client";

import { useRef, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { UploadPopup } from "./UploadPopup";
import { FileExplorer } from "./FileExplorer";
import { useDropzone } from "react-dropzone";
import JSZip, { file } from "jszip";

interface ExtendedFile extends File {
  path?: string;
}

const FileUploadPage = () => {
  const [files, setFiles] = useState<ExtendedFile[]>([]);
  const [uploading, setUploading] = useState<boolean>(false);
  const [status, setStatus] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const downloadLink = useRef<HTMLAnchorElement | null>(null);
  const { user } = useAuth();
  const [showUploadPopup, setShowUploadPopup] = useState(false);
  const [abortController, setAbortController] =
    useState<AbortController | null>(null);
  const fileName =
    files[0] && (files[0]?.path ? files[0]?.path.split("/")[1] : files[0].name);
  const onClose = () => {
    setShowUploadPopup(false);
  };

  const handleDrop = (acceptedFiles: ExtendedFile[]) => {
    setFiles(acceptedFiles);
    setStatus("Files ready for upload");
  };

  const handleUpload = async () => {
    if (!navigator.onLine) {
      setStatus("No internet connection. Please check your network.");
      return;
    }

    if (files.length === 0) {
      setStatus("No files selected");
      return;
    }

    setUploading(true);
    setStatus("Zipping files...");
    let fileToUpload;

    try {
      if (files.length === 1) {
        fileToUpload = files[0];
      } else {
        const zip = new JSZip();
        files.forEach((file) => {
          if (file.path) {
            const filePathArr = file.path.split("/").slice(1);
            const filePath = filePathArr.join("/");
            if (filePath) {
              zip.file(filePath, file);
            }
          } else {
            throw new Error(
              "Invalid file structure. Please reupload the folder."
            );
          }
        });
        const zippedFile = await zip.generateAsync({ type: "blob" });
        const zipBlob = new Blob([zippedFile], { type: "application/zip" });
        fileToUpload = zipBlob;
        if (downloadLink.current) {
          downloadLink.current.href = URL.createObjectURL(zipBlob);
          downloadLink.current.download = fileName;
        }
      }

      setStatus("Preparing for upload...");
      const response = await fetch("/api/upload-dicom", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileName: fileName,
          fileType: fileToUpload.type,
          userId: user?.id,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get upload URL");
      }

      const { url } = await response.json();
      setStatus("Uploading to S3...");

      const xhr = new XMLHttpRequest();
      const controller = new AbortController();
      setAbortController(controller);

      const handleOffline = () => {
        xhr.abort();
        setUploading(false);
        setStatus("Connection lost during upload. Upload canceled.");
        window.removeEventListener("offline", handleOffline);
      };

      window.addEventListener("offline", handleOffline);

      xhr.open("PUT", url, true);
      xhr.setRequestHeader("Content-Type", "application/zip");

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percentComplete = Math.round(
            (event.loaded / event.total) * 100
          );
          setProgress(percentComplete);
        }
      };

      xhr.onload = () => {
        window.removeEventListener("offline", handleOffline);
        if (xhr.status === 200) {
          setStatus("Upload successful");
        } else {
          setStatus("Upload failed");
        }
        setUploading(false);
      };
      controller.signal.addEventListener("abort", () => {
        xhr.abort();
        setUploading(false);
        setStatus("Upload canceled");
      });
      xhr.onerror = () => {
        window.removeEventListener("offline", handleOffline);
        setStatus("An error occurred during upload");
        setUploading(false);
      };

      xhr.send(fileToUpload);
    } catch (error) {
      console.error(error);
      setStatus("An unexpected error occurred. Please try again.");
      setUploading(false);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: handleDrop,
  });

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      {showUploadPopup && <UploadPopup onClose={onClose} user={user} />}

      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-6">Dashboard</h1>

        <div className="bg-white shadow-md rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Upload Files</h2>
          <a ref={downloadLink}>Download Link</a>
          <div
            {...getRootProps()}
            className={`border-2 ${
              isDragActive ? "border-indigo-500" : "border-gray-300"
            } border-dashed rounded-lg p-6 text-center mb-4`}
          >
            <input {...getInputProps()} />
            {isDragActive ? (
              <p className="text-indigo-500">Drop folders here...</p>
            ) : (
              <p>Drag & drop files here, or click to select files</p>
            )}
          </div>

          <div className="mb-4">
            <p className="text-sm text-gray-600">
              {files.length !== 0 &&
                (files.length === 1
                  ? `Upload file: ${files[0].name}`
                  : `Uploading folder: ${fileName}`)}
            </p>
          </div>
          {!uploading && (
            <button
              onClick={handleUpload}
              className={`w-full py-2 px-4 rounded-md text-white font-semibold ${
                uploading
                  ? "bg-indigo-400 cursor-not-allowed"
                  : "bg-indigo-600 hover:bg-indigo-700"
              }`}
            >
              Upload
            </button>
          )}

          {status && (
            <div
              className={`mt-4 text-center font-semibold text-sm ${
                status.includes("success")
                  ? "text-green-500"
                  : status.includes("error")
                  ? "text-red-500"
                  : "text-indigo-500"
              }`}
            >
              {status}
            </div>
          )}

          {uploading && (
            <div className="mt-4">
              <div className="w-full rounded-full bg-slate-200">
                <div
                  className="h-5 rounded-full bg-indigo-500 transition-all duration-200"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <button
                className="mt-4 py-2 px-4 rounded-full text-white bg-red-500"
                onClick={() => {
                  abortController?.abort();
                  setUploading(false);
                }}
              >
                Cancel Upload
              </button>
            </div>
          )}
        </div>

        <FileExplorer></FileExplorer>
      </div>
    </div>
  );
};

export default FileUploadPage;
