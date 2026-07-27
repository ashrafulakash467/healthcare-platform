"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

const initialForm = {
  identifier: "",
  password: "",
};

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function updateField(event) {
    const { name, value } = event.target;
    setForm((currentForm) => ({ ...currentForm, [name]: value }));
    setError("");
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const response = await fetch("http://localhost:3001/patient/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });
      const result = await response.json();

      if (!response.ok) {
        setError(result.message ?? "Invalid email/phone or password.");
        return;
      }

      localStorage.setItem("patientToken", result.token);
      localStorage.setItem("patientUser", JSON.stringify(result.user));

      window.dispatchEvent(new Event("auth-change"));
      
      router.push("/patient/dashboard");
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
            Patient Login
          </p>
          <h1 className="mt-4 max-w-xl text-4xl font-extrabold leading-tight text-slate-950 sm:text-5xl">
            Welcome back to Health Care.
          </h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-slate-600">
            Sign in with your email or phone number to continue to your patient
            dashboard.
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

          <div className="grid gap-4">
            <Field
              label="Email or phone"
              name="identifier"
              value={form.identifier}
              onChange={updateField}
              autoComplete="username"
            />
            <Field
              label="Password"
              name="password"
              type="password"
              value={form.password}
              onChange={updateField}
              autoComplete="current-password"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-6 inline-flex h-12 w-full items-center justify-center rounded-md bg-brand px-5 text-sm font-semibold text-brand-foreground transition hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting ? "Signing in..." : "Log in"}
          </button>

          <div className="mt-4 flex flex-col items-center justify-center gap-2 text-sm text-slate-600 sm:flex-row sm:gap-4">
            <Link href="/forgot-password" className="font-semibold text-brand hover:text-brand-hover">
              Forgot password?
            </Link>
            <span className="hidden text-slate-300 sm:inline">|</span>
            <p>
            New patient?{" "}
            <Link href="/register" className="font-semibold text-brand hover:text-brand-hover">
              Create an account
            </Link>
            </p>
          </div>
        </form>
      </section>
    </main>
  );
}

function Field({
  label,
  name,
  value,
  onChange,
  type = "text",
  autoComplete,
}) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-slate-700">{label}</span>
      <input
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        autoComplete={autoComplete}
        className="mt-2 h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-brand focus:ring-2 focus:ring-brand-soft"
      />
    </label>
  );
}
