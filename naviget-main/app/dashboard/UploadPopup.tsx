import { User } from "@supabase/supabase-js";
import React from "react";

interface UploadPopupProps {
  onClose: Function;
  user: User | null;
}
export const UploadPopup = (props: UploadPopupProps) => {
  const { onClose, user } = props;
  const userEmail = user?.email;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
        <h2 className="text-xl text-indigo-500 font-semibold mb-4">
          Upload Complete!
        </h2>
        <p className="text-gray-700 mb-3">
          Estimated Conversion Time: 5 minutes
        </p>
        <p className="text-gray-700 mb-6">
          A notification will be sent to <strong>{userEmail}</strong>
        </p>
        <button
          onClick={() => onClose()}
          className="bg-indigo-500 text-white py-2 px-4 rounded-lg hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-300"
        >
          Close
        </button>
      </div>
    </div>
  );
};
