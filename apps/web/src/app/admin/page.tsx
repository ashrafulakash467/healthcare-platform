"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch, clearAllAuthSessions, getStoredToken, persistAuthSession } from "@/lib/api";

type DoctorVerification = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  specialty: string;
  qualifications: string[];
  experienceYears: number;
  licenseNumber: string | null;
  licenseIssuedBy: string | null;
  profileSummary: string | null;
  location: string;
  gender: string;
  verificationStatus: string;
  rejectionReason: string | null;
  reviewedAt: string | null;
  verifiedAt: string | null;
  isAvailable: boolean;
  isVerified: boolean;
  isActive: boolean;
  imageUrl: string;
  createdAt: string;
};

type AdminUser = {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
};

const ADMIN_PORTAL_URL = "/admin/dashboard";

export default function AdminPage() {
  const router = useRouter();
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [token, setToken] = useState("");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [pendingDoctors, setPendingDoctors] = useState<DoctorVerification[]>([]);
  const [summary, setSummary] = useState({ pending: 0, approved: 0, rejected: 0 });
  const [rejectionReasons, setRejectionReasons] = useState<Record<string, string>>({});
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(() => Boolean(getStoredToken("admin")));
  const [savingId, setSavingId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const storedToken = getStoredToken("admin");
    const storedAdmin = localStorage.getItem("adminUser");

    if (!storedToken) {
      return;
    }

    if (storedAdmin) {
      try {
        queueMicrotask(() => {
          setAdmin(JSON.parse(storedAdmin));
        });
      } catch {
        // Ignore malformed cache.
      }
    }

    async function verifySession() {
      try {
        const response = await apiFetch("/admin/me", {}, storedToken);
        const result = await response.json();

        if (!response.ok) {
          clearAdminSession();
          return;
        }

        setAdmin(result.user ?? null);
        localStorage.setItem("adminUser", JSON.stringify(result.user ?? null));
        router.replace("/admin/dashboard");
      } catch {
        setError("Could not reach the API. Make sure the backend is running on port 3001.");
      } finally {
        setIsLoading(false);
      }
    }

    queueMicrotask(() => {
      setToken(storedToken);
      verifySession();
    });
  }, [router]);

  async function handleLogin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setError("");
    setMessage("");

    try {
      const response = await apiFetch("/admin/login", {
        method: "POST",
        body: JSON.stringify({ identifier, password }),
      });
      const result = await response.json();

      if (!response.ok) {
        setError(result.message ?? "Could not sign in.");
        return;
      }

      setToken(result.token);
      setAdmin(result.user ?? null);
      persistAuthSession("admin", result.token, result.user ?? null);
      setIdentifier("");
      setPassword("");
      router.replace("/admin/dashboard");
    } catch {
      setError("Could not reach the API. Make sure the backend is running on port 3001.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function loadQueue(authToken: string) {
    setIsLoading(true);
    setError("");

    try {
      const response = await apiFetch("/admin/doctor-verifications", {}, authToken);
      const result = await response.json();

      if (!response.ok) {
        setError(result.message ?? "Could not load doctor verification queue.");
        return;
      }

      setPendingDoctors(result.pendingDoctors ?? []);
      setSummary(result.summary ?? { pending: 0, approved: 0, rejected: 0 });
    } catch {
      setError("Could not reach the API. Make sure the backend is running on port 3001.");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleDecision(doctorId: string, decision: "approve" | "reject") {
    const rejectionReason = (rejectionReasons[doctorId] ?? "").trim();

    if (decision === "reject" && !rejectionReason) {
      setError("Add a rejection reason before rejecting a doctor.");
      return;
    }

    setSavingId(doctorId);
    setError("");
    setMessage("");

    try {
      const response = await apiFetch(
        `/admin/doctor-verifications/${doctorId}/decision`,
        {
          method: "PATCH",
          body: JSON.stringify({
            decision,
            rejectionReason: decision === "reject" ? rejectionReason : undefined,
          }),
        },
        token,
      );
      const result = await response.json();

      if (!response.ok) {
        setError(result.message ?? "Could not update verification status.");
        return;
      }

      setMessage(result.message ?? "Verification decision saved.");
      setRejectionReasons((current) => {
        const next = { ...current };
        delete next[doctorId];
        return next;
      });
      await loadQueue(token);
    } catch {
      setError("Could not reach the API. Make sure the backend is running on port 3001.");
    } finally {
      setSavingId("");
    }
  }

  function clearAdminSession() {
    clearAllAuthSessions();
    setAdmin(null);
    setToken("");
    setPendingDoctors([]);
    setSummary({ pending: 0, approved: 0, rejected: 0 });
  }

  function handleLogout() {
    clearAdminSession();
    setIdentifier("");
    setPassword("");
    router.replace("/login?role=admin");
  }

  if (isLoading && !admin) {
    return (
      <main className="min-h-screen bg-white px-4 py-10">
        <div className="mx-auto flex min-h-[60vh] max-w-xl items-center justify-center rounded-md border border-slate-200 bg-slate-50 text-sm font-medium text-slate-500">
          Loading admin dashboard...
        </div>
      </main>
    );
  }

  if (!admin) {
    return (
      <main className="min-h-screen bg-white">
        <div className="mx-auto grid min-h-screen w-full max-w-7xl items-center gap-10 px-4 py-10 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
          <section className="space-y-4">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-brand">
              Admin Dashboard
            </p>
            <h1 className="text-4xl font-bold text-slate-950">Sign in to review doctors.</h1>
            <p className="max-w-xl text-sm leading-6 text-slate-600">
              Use the demo admin account to approve or reject pending doctor registrations.
            </p>
            <p className="rounded-md border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
              Demo admin: <span className="font-semibold">admin@healthcare.com</span> /{" "}
              <span className="font-semibold">Admin@12345</span>
            </p>
          </section>

          <form
            onSubmit={handleLogin}
            className="rounded-md border border-brand-soft bg-[#f7fbf8] p-5 shadow-[0_18px_50px_rgba(52,92,50,0.10)] sm:p-7"
          >
            {error ? (
              <p className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </p>
            ) : null}

            <div className="grid gap-4">
              <Field
                label="Email"
                value={identifier}
                onChange={setIdentifier}
                autoComplete="username"
              />
              <Field
                label="Password"
                value={password}
                onChange={setPassword}
                type="password"
                autoComplete="current-password"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-6 inline-flex h-12 w-full items-center justify-center rounded-md bg-brand px-5 text-sm font-semibold text-white transition hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSubmitting ? "Signing in..." : "Log in"}
            </button>
          </form>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white">
      <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <header className="flex flex-col gap-4 border-b border-slate-200 pb-5 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-brand">
              Admin Doctor Verification
            </p>
            <h1 className="mt-3 text-3xl font-bold text-slate-950">Pending doctor applications</h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
              Review registration details, approve qualified doctors, or reject applicants with a stored reason.
            </p>
            <a
              href={ADMIN_PORTAL_URL}
              target="_blank"
              rel="noreferrer"
              className="mt-3 inline-flex text-sm font-semibold text-brand hover:text-brand-hover"
            >
              Open dedicated admin portal
            </a>
          </div>

          <div className="space-y-2 sm:text-right">
            <p className="text-sm font-semibold text-slate-900">{admin.name}</p>
            <p className="text-xs text-slate-500">{admin.email}</p>
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-md border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
            >
              Sign out
            </button>
          </div>
        </header>

        <section className="mt-6 grid gap-4 sm:grid-cols-3">
          <StatCard label="Pending" value={summary.pending} />
          <StatCard label="Approved" value={summary.approved} />
          <StatCard label="Rejected" value={summary.rejected} />
        </section>

        {error ? (
          <p className="mt-6 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </p>
        ) : null}

        {message ? (
          <p className="mt-6 rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {message}
          </p>
        ) : null}

        <section className="mt-6">
          {isLoading ? (
            <p className="rounded-md border border-slate-200 bg-slate-50 px-4 py-6 text-sm text-slate-500">
              Loading verification queue...
            </p>
          ) : pendingDoctors.length === 0 ? (
            <p className="rounded-md border border-slate-200 bg-slate-50 px-4 py-6 text-sm text-slate-500">
              No pending doctor applications.
            </p>
          ) : (
            <div className="space-y-4">
              {pendingDoctors.map((doctor) => (
                <article key={doctor.id} className="rounded-md border border-slate-200 bg-white">
                  <div className="grid gap-4 p-4 lg:grid-cols-[1.2fr_0.8fr]">
                    <div className="space-y-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-lg font-bold text-slate-950">{doctor.name}</h2>
                        <StatusBadge>{doctor.verificationStatus}</StatusBadge>
                      </div>
                      <p className="text-sm text-slate-600">
                        {doctor.specialty} - {doctor.location} - {doctor.gender}
                      </p>
                      <p className="text-sm text-slate-600">
                        {doctor.email ?? "No email"} - {doctor.phone ?? "No phone"}
                      </p>
                      <p className="text-sm text-slate-700">
                        Experience: {doctor.experienceYears} years
                      </p>
                      <p className="text-sm text-slate-700">
                        License: {doctor.licenseNumber ?? "N/A"} - {doctor.licenseIssuedBy ?? "N/A"}
                      </p>
                      <p className="text-sm leading-6 text-slate-600">
                        {doctor.profileSummary}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {doctor.qualifications.map((item) => (
                          <span
                            key={item}
                            className="rounded border border-slate-200 bg-slate-50 px-2 py-1 text-xs font-semibold text-slate-600"
                          >
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-3 border-t border-slate-100 pt-4 lg:border-l lg:border-t-0 lg:pl-4 lg:pt-0">
                      <label className="block">
                        <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Rejection reason
                        </span>
                        <textarea
                          rows={4}
                          value={rejectionReasons[doctor.id] ?? ""}
                          onChange={(event) =>
                            setRejectionReasons((current) => ({
                              ...current,
                              [doctor.id]: event.target.value,
                            }))
                          }
                          placeholder="Required only when rejecting"
                          className="mt-2 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-brand focus:ring-2 focus:ring-brand-soft"
                        />
                      </label>

                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => handleDecision(doctor.id, "approve")}
                          disabled={savingId === doctor.id}
                          className="rounded-md bg-brand px-4 py-2 text-xs font-semibold text-white transition hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {savingId === doctor.id ? "Saving..." : "Approve"}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDecision(doctor.id, "reject")}
                          disabled={savingId === doctor.id}
                          className="rounded-md border border-red-200 bg-red-50 px-4 py-2 text-xs font-semibold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          Reject
                        </button>
                      </div>

                      <div className="space-y-1 text-xs text-slate-500">
                        <p>Applied: {formatDate(doctor.createdAt)}</p>
                        {doctor.reviewedAt ? <p>Reviewed: {formatDate(doctor.reviewedAt)}</p> : null}
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}


function Field({
  label,
  value,
  onChange,
  type = "text",
  autoComplete,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  autoComplete?: string;
}) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-slate-700">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        autoComplete={autoComplete}
        className="mt-2 h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-brand focus:ring-2 focus:ring-brand-soft"
      />
    </label>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-md border border-slate-200 bg-slate-50 px-4 py-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-bold text-slate-950">{value}</p>
    </div>
  );
}

function StatusBadge({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex rounded border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-700">
      {children}
    </span>
  );
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}
