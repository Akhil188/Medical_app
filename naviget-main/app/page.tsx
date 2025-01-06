"use client";
import Link from "next/link";
import { useEffect } from "react";
import { useAuth } from "./context/AuthContext";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  const { user } = useAuth();

  return (
    <div>
      <div className="flex justify-end gap-4 p-6">
        <Link href="/signup">
          <button className="bg-indigo-700 btn-header hover:bg-indigo-800">
            Sign Up
          </button>
        </Link>
        <Link href="/login">
          <button className="bg-indigo-600 btn-header hover:bg-indigo-900">
            Log In
          </button>
        </Link>
      </div>
      <div className="flex h-[80vh] items-center justify-center">
        <h1 className="text-2xl md:text-5xl">Welcome to Naviget</h1>
      </div>
    </div>
  );
}
