"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

// --- SVG Icons Component Helper ---
function Icon({ name, className = "w-5 h-5" }) {
  const icons = {
    dashboard: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
    ),
    records: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    ),
    calendar: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    ),
    doctors: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
    ),
    logout: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
    ),
    download: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    ),
    share: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
    ),
    upload: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
    ),
    eye: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    ),
  };

  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      {icons[name] || null}
    </svg>
  );
}

export default function PatientDashboardPage() {
  const router = useRouter();
  const [patient, setPatient] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [authToken, setAuthToken] = useState("");
  const [cancellationReasons, setCancellationReasons] = useState({});
  const [actionMessage, setActionMessage] = useState("");
  const [actionError, setActionError] = useState("");
  const [isCancellingId, setIsCancellingId] = useState("");

  // Layout & Category Navigation States
  const [activeTab, setActiveTab] = useState("dashboard"); // 'dashboard' | 'records'
  const [recordCategory, setRecordCategory] = useState("prescriptions"); // 'prescriptions' | 'diagnostics' | 'notes' | 'uploads' | 'invoices'

  // Mock Medical Records State
  const [records, setRecords] = useState({
    prescriptions: [
      { id: "rx-1", title: "Amoxicillin 500mg", doctor: "Dr. Sarah Jenkins", date: "2026-06-12", fileUrl: "#" },
    ],
    diagnostics: [
      { id: "diag-1", title: "Complete Blood Count (CBC)", facility: "Central Diagnostics", date: "2026-05-20", fileUrl: "#" },
    ],
    notes: [
      { id: "note-1", title: "Annual Physical Assessment", doctor: "Dr. Alan Grant", date: "2026-04-10", fileUrl: "#" },
    ],
    uploads: [
      { id: "up-1", title: "Previous Vaccination History.pdf", date: "2026-01-15", fileUrl: "#" },
    ],
    invoices: [
      { id: "inv-1", title: "Invoice #INV-2026-089", amount: "$150.00", status: "Paid", date: "2026-06-12", fileUrl: "#" },
    ],
  });

  useEffect(() => {
    async function loadPatient() {
      const token = localStorage.getItem("patientToken");

      if (!token) {
        router.replace("/login");
        return;
      }

      try {
        const response = await fetch("http://localhost:3001/patient/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const result = await response.json();

        if (!response.ok) {
          localStorage.removeItem("patientToken");
          localStorage.removeItem("patientUser");
          router.replace("/login");
          return;
        }

        setPatient(result.user);
        setAuthToken(token);
        await loadAppointments(token);
      } catch {
        const cachedPatient = localStorage.getItem("patientUser");
        if (cachedPatient) {
          setPatient(JSON.parse(cachedPatient));
          setAuthToken(token);
        }
      } finally {
        setIsLoading(false);
      }
    }

    loadPatient();
  }, [router]);

  async function loadAppointments(token) {
    try {
      const response = await fetch("http://localhost:3001/appointment/my", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await response.json();

      if (response.ok) {
        setAppointments(result.appointments ?? []);
      }
    } catch (e) {
      console.error("Failed to fetch appointments:", e);
    }
  }

  async function handleCancelAppointment(appointmentId) {
    const reason = (cancellationReasons[appointmentId] ?? "").trim();

    if (!reason) {
      setActionError("Please enter a cancellation reason first.");
      return;
    }

    if (!authToken) {
      setActionError("You need to be logged in to cancel an appointment.");
      return;
    }

    setIsCancellingId(appointmentId);
    setActionError("");
    setActionMessage("");

    try {
      const response = await fetch("http://localhost:3001/appointment/cancel", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ appointmentId, reason }),
      });
      const result = await response.json();

      if (!response.ok) {
        setActionError(result.message ?? "Could not cancel appointment.");
        return;
      }

      setActionMessage(result.message ?? "Appointment cancelled successfully.");
      setCancellationReasons((currentReasons) => {
        const nextReasons = { ...currentReasons };
        delete nextReasons[appointmentId];
        return nextReasons;
      });
      await loadAppointments(authToken);
    } catch (error) {
      setActionError("Could not cancel appointment. Make sure the backend is running on port 3001.");
    } finally {
      setIsCancellingId("");
    }
  }

  function handleLogout() {
    localStorage.removeItem("patientToken");
    localStorage.removeItem("patientUser");
    router.push("/login");
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 text-slate-500 font-medium">
        Loading dashboard...
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-7xl min-h-screen bg-slate-50 font-sans text-slate-900">
      {/* LEFT SIDEBAR NAVIGATION */}
      <aside className="sticky top-0 h-165 w-64 flex flex-col justify-between flex-shrink-0 border-r border-slate-200 bg-white ">
        <div>
          {/* Dashboard Header/Logo */}
          <div className="flex h-16 items-center px-6 border-b border-slate-100">
            <span className="text-lg font-bold text-slate-900">HealthPortal</span>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1">
            <button
              onClick={() => setActiveTab("dashboard")}
              className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition ${
                activeTab === "dashboard"
                  ? "bg-slate-900 text-white"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              <Icon name="dashboard" />
              Dashboard Overview
            </button>

            <button
              onClick={() => setActiveTab("records")}
              className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition ${
                activeTab === "records"
                  ? "bg-slate-900 text-white"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              <Icon name="records" />
              Medical Records
            </button>

            <Link
              href="/find-doctor"
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
            >
              <Icon name="doctors" />
              Find & Book Doctors
            </Link>
          </nav>
        </div>

        {/* User Info & Logout Button */}
        <div className="p-4 border-t border-slate-100">
          <div className="flex items-center gap-3 px-2 py-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-200 font-bold text-slate-700">
              {patient?.name?.charAt(0) || "P"}
            </div>
            <div className="overflow-hidden">
              <p className="truncate text-sm font-bold text-slate-900">{patient?.name}</p>
              <p className="truncate text-xs text-slate-500">{patient?.email}</p>
            </div>
          </div>
            <button
            onClick={handleLogout}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-50 hover:border-red-200"
          >
            <Icon name="logout" className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 overflow-y-auto p-8">
        {activeTab === "dashboard" && (
          <DashboardOverviewView
            patient={patient}
            appointments={appointments}
            onNavigateRecords={() => setActiveTab("records")}
            cancellationReasons={cancellationReasons}
            setCancellationReasons={setCancellationReasons}
            handleCancelAppointment={handleCancelAppointment}
            isCancellingId={isCancellingId}
            actionMessage={actionMessage}
            actionError={actionError}
          />
        )}

        {activeTab === "records" && (
          <MedicalRecordsView
            records={records}
            recordCategory={recordCategory}
            setRecordCategory={setRecordCategory}
          />
        )}
      </main>
    </div>
  );
}

// --- SUB-COMPONENTS ---

function DashboardOverviewView({
  patient,
  appointments,
  onNavigateRecords,
  cancellationReasons,
  setCancellationReasons,
  handleCancelAppointment,
  isCancellingId,
  actionMessage,
  actionError,
}) {
  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Top Banner Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Welcome back, {patient?.name}</h1>
          <p className="text-sm text-slate-500 mt-0.5">Manage your health records and active consultations.</p>
        </div>
        <Link
          href="/find-doctor"
          className="inline-flex items-center rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700 shadow-sm"
        >
          Book Appointment
        </Link>
      </div>

      {actionError ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {actionError}
        </p>
      ) : null}

      {actionMessage ? (
        <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {actionMessage}
        </p>
      ) : null}

      {/* Info Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <InfoCard title="Phone Number" value={patient?.phone || "N/A"} />
        <InfoCard title="Primary Email" value={patient?.email || "N/A"} />
        <InfoCard title="Patient Role" value={patient?.role || "Patient"} />
      </div>

      {/* Appointments List Section */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Upcoming Appointments</h2>
            <p className="text-sm text-slate-500">View and reschedule upcoming consultations.</p>
          </div>
        </div>

        {appointments.length === 0 ? (
          <p className="rounded-lg border border-slate-100 bg-slate-50 p-6 text-center text-sm text-slate-500">
            No scheduled appointments found.
          </p>
        ) : (
          <div className="space-y-3">
            {appointments.map((appointment) => (
              <article
                key={appointment.id}
                className="flex flex-col gap-4 rounded-lg border border-slate-100 bg-slate-50/50 p-4 transition hover:border-slate-200 sm:flex-row sm:items-start sm:justify-between"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-slate-900">{appointment.doctor?.name}</p>
                    <span
                      className={`rounded px-2 py-0.5 text-xs font-semibold uppercase tracking-wide ${
                        appointment.status === "cancelled"
                          ? "bg-red-50 text-red-700"
                          : appointment.status === "confirmed"
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-blue-50 text-blue-700"
                      }`}
                    >
                      {appointment.status}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 mt-1">
                    {appointment.doctor?.specialty} · {appointment.clinic?.name}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    {appointment.appointmentDate} at {appointment.slotTime}
                  </p>
                  {appointment.status === "cancelled" && appointment.cancellationReason ? (
                    <p className="mt-2 text-xs leading-5 text-slate-500">
                      Cancelled reason: {appointment.cancellationReason}
                    </p>
                  ) : null}
                </div>

                <div className="flex w-full flex-col gap-3 sm:w-80">
                  {appointment.isCancellable ? (
                    <textarea
                      value={cancellationReasons[appointment.id] ?? ""}
                      onChange={(event) =>
                        setCancellationReasons((currentReasons) => ({
                          ...currentReasons,
                          [appointment.id]: event.target.value,
                        }))
                      }
                      placeholder="Reason for cancellation"
                      rows={3}
                      className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-xs text-slate-700 outline-none transition focus:border-slate-400"
                    />
                  ) : null}

                  <div className="flex flex-wrap gap-2">
                    {appointment.isReschedulable ? (
                      <Link
                        href={`/appointment/reschedule?appointmentId=${appointment.id}`}
                        className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 shadow-sm"
                      >
                        Reschedule
                      </Link>
                    ) : (
                      <span className="text-xs font-medium text-slate-400">Not Eligible for Reschedule</span>
                    )}

                    {appointment.isCancellable ? (
                      <button
                        type="button"
                        onClick={() => handleCancelAppointment(appointment.id)}
                        disabled={isCancellingId === appointment.id}
                        className="rounded-md border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {isCancellingId === appointment.id ? "Cancelling..." : "Cancel"}
                      </button>
                    ) : null}
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      {/* Quick Access Link to Medical Records Workflow */}
      <div className="rounded-xl border border-emerald-100 bg-emerald-50/50 p-6 flex items-center justify-between">
        <div>
          <h3 className="font-bold text-emerald-950">Medical Records Workflow</h3>
          <p className="text-xs text-emerald-800 mt-0.5">Access prescriptions, test reports, and invoices in one place.</p>
        </div>
        <button
          onClick={onNavigateRecords}
          className="rounded-lg bg-emerald-700 px-4 py-2 text-xs font-bold text-white transition hover:bg-emerald-800"
        >
          View Records
        </button>
      </div>
    </div>
  );
}

function MedicalRecordsView({ records, recordCategory, setRecordCategory }) {
  const categories = [
    { key: "prescriptions", label: "Prescriptions" },
    { key: "diagnostics", label: "Diagnostic Reports" },
    { key: "notes", label: "Appointment Notes" },
    { key: "uploads", label: "Uploaded Documents" },
    { key: "invoices", label: "Invoices" },
  ];

  const currentRecords = records[recordCategory] || [];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Medical Records</h1>
          <p className="text-sm text-slate-500 mt-0.5">View, download, share, or upload clinical documentation.</p>
        </div>
        <button className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold text-white transition hover:bg-slate-800 shadow-sm">
          <Icon name="upload" className="w-4 h-4" />
          Upload Document
        </button>
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-2">
        {categories.map((cat) => (
          <button
            key={cat.key}
            onClick={() => setRecordCategory(cat.key)}
            className={`rounded-lg px-3.5 py-2 text-xs font-bold transition ${
              recordCategory === cat.key
                ? "bg-slate-900 text-white"
                : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Records Table / Action List */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        {currentRecords.length === 0 ? (
          <p className="text-center text-sm text-slate-500 py-8">No records available in this category.</p>
        ) : (
          <div className="divide-y divide-slate-100">
            {currentRecords.map((item) => (
              <div key={item.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-4 first:pt-0 last:pb-0">
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">{item.title}</h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {item.doctor || item.facility || item.amount || "System Record"} · {item.date}
                  </p>
                </div>

                {/* Workflow Action Buttons (View, Download, Share) */}
                <div className="flex items-center gap-2">
                  <button title="View Record" className="inline-flex items-center gap-1 rounded-md border border-slate-200 px-2.5 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50">
                    <Icon name="eye" className="w-3.5 h-3.5" />
                    View
                  </button>
                  <button title="Download" className="inline-flex items-center gap-1 rounded-md border border-slate-200 px-2.5 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50">
                    <Icon name="download" className="w-3.5 h-3.5" />
                    Download
                  </button>
                  <button title="Share with Provider" className="inline-flex items-center gap-1 rounded-md border border-slate-200 px-2.5 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50">
                    <Icon name="share" className="w-3.5 h-3.5" />
                    Share
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function InfoCard({ title, value }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{title}</p>
      <p className="mt-1 text-base font-bold text-slate-900">{value}</p>
    </div>
  );
}
