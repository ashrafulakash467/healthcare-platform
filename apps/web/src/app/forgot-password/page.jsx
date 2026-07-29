"use client";

import Link from "next/link";
import { useState } from "react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [resetUrl, setResetUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setMessage("");
    setResetUrl("");
    setIsSubmitting(true);

    try {
      const response = await fetch("http://localhost:3001/patient/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });
      const result = await response.json();

      if (!response.ok) {
        setError(result.message ?? "Could not request a password reset.");
        return;
      }

      setMessage(result.message);
      if (result.resetUrl) {
        setResetUrl(result.resetUrl);
      }
    } catch {
      setError("Could not reach the API. Make sure the backend is running on port 3001.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="bg-white">
      <section className="mx-auto grid min-h-[calc(100vh-220px)] w-full max-w-7xl items-center gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-brand">
            Password Recovery
          </p>
          <h1 className="mt-4 max-w-xl text-4xl font-extrabold leading-tight text-slate-950 sm:text-5xl">
            Reset your patient password.
          </h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-slate-600">
            Enter your registered email address to create a secure reset link.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-lg border border-brand-soft bg-[#f7fbf8] p-5 shadow-[0_18px_50px_rgba(52,92,50,0.10)] sm:p-7"
        >
          {error ? (
            <p className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </p>
          ) : null}

          {message ? (
            <div className="mb-4 rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
              <p>{message}</p>
              {resetUrl ? (
                <Link
                  href={resetUrl}
                  className="mt-2 inline-flex font-semibold text-brand hover:text-brand-hover"
                >
                  Open development reset link
                </Link>
              ) : null}
            </div>
          ) : null}

          <label className="block">
            <span className="text-sm font-semibold text-slate-700">Email</span>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
              className="mt-2 h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-brand focus:ring-2 focus:ring-brand-soft"
            />
          </label>

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-6 inline-flex h-12 w-full items-center justify-center rounded-md bg-brand px-5 text-sm font-semibold text-brand-foreground transition hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting ? "Preparing reset..." : "Request reset link"}
          </button>

          <p className="mt-4 text-center text-sm text-slate-600">
            Remembered it?{" "}
            <Link href="/login" className="font-semibold text-brand hover:text-brand-hover">
              Log in
            </Link>
          </p>
        </form>
      </section>
    </main>
  );
}
