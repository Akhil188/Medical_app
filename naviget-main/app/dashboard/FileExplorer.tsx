"use client";
import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";

interface Files {
  name: string;
  size: number;
  lastModified: Date;
  url: string;
  status: string;
}

export const FileExplorer = () => {
  const [files, setFiles] = useState<Files[] | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchFiles = async () => {
      if (!user) return;
      try {
        const response = await fetch(`/api/account/files?userId=${user.id}`);
        if (response.ok) {
          const data = await response.json();
          setFiles(data);
        } else {
          console.error("Error fetching files:", await response.text());
        }
      } catch (error) {
        console.error("Error fetching files:", error);
      }
    };
    fetchFiles();
  }, []);

  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-4">File Explorer</h2>
      {files &&
        files
          .filter((file) => file.name)
          .map((file, index) => (
            <div
              key={index}
              className="grid grid-cols-12 gap-4 items-center bg-gray-50 p-4 rounded-lg mb-4 shadow-sm"
            >
              <div className="col-span-4 truncate">
                <span className="font-medium text-gray-700">{file.name}</span>
              </div>

              <div className="col-span-2 text-sm text-gray-500">
                {(file.size / 1024).toFixed(2)} KB
              </div>

              <div className="col-span-3 text-sm text-gray-500">
                {new Date(file.lastModified).toLocaleString()}
              </div>

              <div className="col-span-2">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold block text-center ${
                    file.status === "Converting"
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-green-100 text-green-800"
                  }`}
                >
                  {file.status}
                </span>
              </div>

              <div className="col-span-1 text-right">
                <a
                  href={file.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-600 hover:underline text-sm font-medium"
                >
                  Download
                </a>
              </div>
            </div>
          ))}
    </div>
  );
};
