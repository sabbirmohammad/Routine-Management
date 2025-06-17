"use client";

import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const loginSchema = z.object({
  username: z.string().min(2, "Username is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    try {
      const result = await signIn("credentials", {
        username: data.username,
        password: data.password,
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid username or password");
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch (error) {
      setError("An error occurred. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 via-blue-100 to-purple-200">
      <div className="w-full max-w-md mx-auto bg-white/90 rounded-3xl shadow-2xl p-8 sm:p-10 flex flex-col items-center">
        {/* Logo/Icon */}
        <div className="bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-full w-16 h-16 flex items-center justify-center mb-6 shadow-lg">
          {/* Academic cap SVG */}
          <svg className="w-9 h-9 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5zm0 0v6m0 0c-4.418 0-8-1.79-8-4V10m8 10c4.418 0 8-1.79 8-4V10" />
          </svg>
        </div>
        <h1 className="text-3xl font-extrabold text-gray-900 text-center mb-2">Welcome Back</h1>
        <p className="text-gray-500 text-center mb-8">Sign in to your University Routine account</p>
        <form className="w-full space-y-6" onSubmit={handleSubmit(onSubmit)} autoComplete="off">
          <div className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                Username
              </label>
              <input
                {...register("username")}
                id="username"
                type="text"
                autoComplete="username"
                className={`block w-full rounded-lg border px-4 py-2 text-gray-900 shadow-sm focus:ring-2 focus:ring-indigo-400 focus:border-indigo-500 transition placeholder-gray-400 bg-white ${errors.username ? "border-red-400" : "border-gray-300"}`}
                placeholder="admin"
                disabled={isSubmitting}
              />
              {errors.username && (
                <p className="mt-1 text-xs text-red-600">{errors.username.message}</p>
              )}
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  {...register("password")}
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  className={`block w-full rounded-lg border px-4 py-2 text-gray-900 shadow-sm focus:ring-2 focus:ring-indigo-400 focus:border-indigo-500 transition placeholder-gray-400 bg-white ${errors.password ? "border-red-400" : "border-gray-300"}`}
                  placeholder="password"
                  disabled={isSubmitting}
                />
                <button
                  type="button"
                  tabIndex={-1}
                  className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-400 hover:text-indigo-500 focus:outline-none"
                  onClick={() => setShowPassword(v => !v)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-5.523 0-10-4.03-10-7s4.477-7 10-7c1.042 0 2.05.13 3.003.375M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.07 4.93a10.05 10.05 0 012.93 7.07c0 2.97-4.477 7-10 7a10.05 10.05 0 01-3.003-.375M9 15l-6 6m0 0l6-6m-6 6h.01" /></svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>
              )}
            </div>
          </div>

          {error && (
            <div className="text-red-600 text-sm text-center font-medium bg-red-50 border border-red-200 rounded-lg py-2 px-3">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex justify-center py-3 px-4 border border-transparent text-base font-semibold rounded-lg text-white bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-400 disabled:opacity-60 disabled:cursor-not-allowed shadow-lg transition"
          >
            {isSubmitting ? "Signing in..." : "Sign in"}
          </button>
        </form>
        <div className="mt-8 text-center text-xs text-gray-400">
          &copy; {new Date().getFullYear()} UniRoutine. All rights reserved.
        </div>
      </div>
    </div>
  );
}
