"use client";

import { useState } from "react";
import { resetPasswordValidationSchema } from "../utils/validationSchemas";
import { supabase } from "../utils/supabaseClient";
import { useRouter } from "next/navigation";

export default function ResetPasswordPage() {
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState<{ email?: string; submit?: string }>({});
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  console.log(window.location.href);
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    setErrors({});
    setSuccessMessage("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);

    try {
      await resetPasswordValidationSchema.validate({ email });

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.href}/update`,
      });

      if (error) {
        setErrors({ submit: error.message });
      } else {
        setSuccessMessage("A password reset link has been sent to your email.");
      }
    } catch (validationError: any) {
      setErrors({ email: validationError.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-white p-8 shadow-md rounded-lg"
      >
        {successMessage ? (
          <div>
            <p className="text-green-500 text-center text-sm mt-2">
              {successMessage}
            </p>
            <p
              className="text-indigo-500 text-center mt-3 underline cursor-pointer"
              onClick={() => {
                router.back();
              }}
            >
              Go back
            </p>
          </div>
        ) : (
          <>
            <h1 className="text-2xl font-bold text-center mb-4">
              Reset Password
            </h1>
            <input
              type="text"
              name="email"
              placeholder="Enter your email"
              value={email}
              onChange={handleChange}
              className={`w-full px-4 py-2 border ${
                errors.email ? "border-red-500" : "border-gray-300"
              } rounded-lg`}
            />
            {errors.email && (
              <p className="text-red-500 text-sm">{errors.email}</p>
            )}
            {errors.submit && (
              <p className="text-red-500 text-sm mt-2">{errors.submit}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-4 bg-indigo-500 text-white py-2 rounded-lg hover:bg-indigo-600"
            >
              {loading ? "Sending..." : "Send Reset Link"}
            </button>
          </>
        )}
      </form>
    </div>
  );
}
