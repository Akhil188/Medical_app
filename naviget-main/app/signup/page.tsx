"use client";

import { useState } from "react";
import Link from "next/link.js";
import { useRouter } from "next/navigation";
import {
  signupValidationSchemaB2B,
  signupValidationSchemaB2C,
} from "../utils/validationSchemas";
import * as Yup from "yup";
import { supabase } from "../utils/supabaseClient";

interface FormData {
  email: string;
  password: string;
  confirmPassword: string;
  companyName?: string;
}

interface Errors {
  email?: string;
  password?: string;
  confirmPassword?: string;
  companyName?: string;
  submit?: string;
}

export default function SignupPage() {
  const [formData, setFormData] = useState<FormData>({
    email: "",
    password: "",
    confirmPassword: "",
    companyName: "",
  });
  const [accountType, setAccountType] = useState<
    "personal" | "business" | null
  >(null);
  const [errors, setErrors] = useState<Errors>({});
  const [success, setSuccess] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  const handleSignup = async () => {
    setLoading(true);
    try {
      const { data: userData, error: supabaseError } =
        await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
        });

      if (supabaseError) {
        throw supabaseError;
      }

      const response = await fetch("/api/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          companyName: formData.companyName ? formData.companyName : null,
          b2b_customer: accountType === "business",
          userId: userData.user?.id,
        }),
      });

      if (!response.ok) {
        const signupError = await response.json();
        throw new Error(signupError.error);
      }

      setSuccess("Signup successful! Redirecting to Dashboard...");
      router.push("/dashboard");
    } catch (error: any) {
      setErrors({ submit: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setSuccess("");
    console.log("Submitting");
    try {
      if (accountType === "personal")
        await signupValidationSchemaB2C.validate(formData, {
          abortEarly: false,
        });
      else if (accountType === "business")
        await signupValidationSchemaB2B.validate(formData, {
          abortEarly: false,
        });
      else {
        throw new Error(
          "Account Type is missing. Please refresh and select your account type"
        );
      }
      console.log("Handling");
      handleSignup();
    } catch (validationError: any) {
      const validationErrors: Errors = {};
      if (validationError.inner) {
        validationError.inner.forEach((err: Yup.ValidationError) => {
          validationErrors[err.path as keyof FormData] = err.message;
        });
      } else {
        validationErrors.submit = validationError.message;
      }
      setErrors(validationErrors);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md bg-white shadow-md rounded-lg p-8">
        {!accountType ? (
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Choose Account Type</h1>
            <button
              onClick={() => setAccountType("personal")}
              className="w-full py-2 bg-blue-500 text-white rounded-lg mb-4 hover:bg-blue-600"
            >
              Personal Account
            </button>

            <button
              onClick={() => setAccountType("business")}
              className="w-full py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600"
            >
              Business Account
            </button>
          </div>
        ) : (
          <>
            <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">
              {accountType === "personal" ? "Personal" : "Business"} Account
            </h1>
            {loading ? (
              <div className="flex justify-center items-center">
                <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {accountType === "business" && (
                  <div>
                    <input
                      type="text"
                      name="companyName"
                      placeholder="Company Name"
                      value={formData.companyName || ""}
                      onChange={handleChange}
                      className={`w-full px-4 py-2 border ${
                        errors.companyName
                          ? "border-red-500"
                          : "border-gray-300"
                      } rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                    />
                    {errors.companyName && (
                      <p className="text-red-500 text-sm">
                        {errors.companyName}
                      </p>
                    )}
                  </div>
                )}
                <div>
                  <input
                    type="text"
                    name="email"
                    placeholder="Email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border ${
                      errors.email ? "border-red-500" : "border-gray-300"
                    } rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                  />
                  {errors.email && (
                    <p className="text-red-500 text-sm">{errors.email}</p>
                  )}
                </div>
                <div>
                  <input
                    type="password"
                    name="password"
                    placeholder="Password"
                    value={formData.password}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border ${
                      errors.password ? "border-red-500" : "border-gray-300"
                    } rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                  />
                  {errors.password && (
                    <p className="text-red-500 text-sm">{errors.password}</p>
                  )}
                </div>
                <div>
                  <input
                    type="password"
                    name="confirmPassword"
                    placeholder="Confirm Password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border ${
                      errors.confirmPassword
                        ? "border-red-500"
                        : "border-gray-300"
                    } rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                  />
                  {errors.confirmPassword && (
                    <p className="text-red-500 text-sm">
                      {errors.confirmPassword}
                    </p>
                  )}
                </div>

                {errors.submit && (
                  <p className="text-red-500 text-sm">{errors.submit}</p>
                )}
                {success && (
                  <p className="text-indigo-500 text-sm">{success}</p>
                )}
                <button
                  type="submit"
                  className="w-full bg-indigo-500 text-white font-semibold py-2 rounded-lg hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                >
                  Sign Up
                </button>
              </form>
            )}
          </>
        )}
        <div className="mt-3 text-center">
          <p>
            Already have an account?{" "}
            <Link className="text-blue-600" href="/login">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
