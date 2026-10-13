"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function AuthForm() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [nombre, setNombre] = useState("");

  
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setIsError(false);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        setMessage("Login successful.");
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              nombre: nombre.trim(),
            },
          },
        });

        if (error) throw error;

        setMessage(
          data.session
            ? "Registration successful."
            : "Check your email to confirm your account."
        );
      }
    } catch (error) {
      setIsError(true);
      setMessage(
        error instanceof Error
          ? error.message
          : "An unexpected error occurred."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
      <h1 className="mb-2 text-center text-2xl font-bold text-gray-900">
        {isLogin ? "Welcome back" : "Create your account"}
      </h1>

      <p className="mb-6 text-center text-sm text-gray-500">
        {isLogin
          ? "Sign in to access your social network."
          : "Join the community and share your thoughts."}
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        {!isLogin && (
          <div>
            <label
              htmlFor="auth-name"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              Full name
            </label>

            <input
              id="auth-name"
              type="text"
              autoComplete="name"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Your name"
              maxLength={100}
              required
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>
        )}
        <div>
          <label
            htmlFor="auth-email"
            className="mb-1 block text-sm font-medium text-gray-700"
          >
            Email
          </label>
          <input
            id="auth-email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </div>

        <div>
          <label
            htmlFor="auth-password"
            className="mb-1 block text-sm font-medium text-gray-700"
          >
            Password
          </label>
          <input
            id="auth-password"
            type="password"
            autoComplete={isLogin ? "current-password" : "new-password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={6}
            required
            placeholder="Enter your password"
            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </div>

        {message && (
          <p
            role={isError ? "alert" : "status"}
            className={`break-words rounded-lg p-3 text-sm ${
              isError
                ? "bg-red-50 text-red-700"
                : "bg-blue-50 text-blue-700"
            }`}
          >
            {message}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-blue-600 px-4 py-2.5 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading
            ? "Please wait..."
            : isLogin
              ? "Sign In"
              : "Create Account"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-600">
        {isLogin
          ? "Don't have an account?"
          : "Already have an account?"}{" "}
        <button
          type="button"
          onClick={() => {
            setIsLogin((current) => !current);
            setMessage("");
            setIsError(false);
          }}
          className="font-semibold text-blue-600 hover:text-blue-800"
        >
          {isLogin ? "Sign Up" : "Sign In"}
        </button>
      </p>
    </section>
  );
}