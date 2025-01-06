"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../utils/supabaseClient";
import { loginValidationSchema } from "../utils/validationSchemas";
import * as Yup from "yup";
import Link from "next/link";

export default function LoginPage() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
    submit?: string;
  }>({});
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);

    try {
      await loginValidationSchema.validate(formData, { abortEarly: false });

      const { error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (error) {
        setErrors({ submit: error.message });
      } else {
        router.push("/dashboard");
      }
    } catch (validationError: any) {
      const validationErrors: { email?: string; password?: string } = {};
      validationError.inner.forEach((err: Yup.ValidationError) => {
        validationErrors[err.path as "email" | "password"] = err.message;
      });
      setErrors(validationErrors);
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
        <h1 className="text-2xl font-bold text-center mb-4">Login</h1>
        <div className="space-y-4">
          <input
            type="text"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            className={`w-full px-4 py-2 border ${
              errors.email ? "border-red-500" : "border-gray-300"
            } rounded-lg`}
          />
          {errors.email && (
            <p className="text-red-500 text-sm">{errors.email}</p>
          )}

          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            className={`w-full px-4 py-2 border ${
              errors.password ? "border-red-500" : "border-gray-300"
            } rounded-lg`}
          />
          {errors.password && (
            <p className="text-red-500 text-sm">{errors.password}</p>
          )}
        </div>
        {errors.submit && (
          <p className="text-red-500 text-sm mt-2">{errors.submit}</p>
        )}
        <button
          type="submit"
          disabled={loading}
          className="w-full mt-4 bg-indigo-500 text-white py-2 rounded-lg hover:bg-indigo-600"
        >
          {loading ? "Logging in..." : "Login"}
        </button>
        <p className="text-center text-sm mt-4">
          Forgot your password?{" "}
          <Link href="/reset-password" className="text-indigo-500 underline">
            Reset it here
          </Link>
        </p>
      </form>
    </div>
  );
}
