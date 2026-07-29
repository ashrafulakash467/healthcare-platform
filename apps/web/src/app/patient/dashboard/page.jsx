"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCalendarDays, faCircleCheck } from "@fortawesome/free-solid-svg-icons";
import { Icon } from "../patient_layouts/dashboard-shared";
import DashboardOverviewPage from "../patient_layouts/dashboardoverview-page";
import MyAppointmentPage from "../patient_layouts/myappointment-page";
import MedicalRecordsPage from "../patient_layouts/medicalrecords-page";

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
  const [isPayingId, setIsPayingId] = useState("");
  const [selectedAppointmentId, setSelectedAppointmentId] = useState("");
  const [doctorContact, setDoctorContact] = useState(null);
  const [doctorContactError, setDoctorContactError] = useState("");
  const [now, setNow] = useState(Date.now());
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Layout & Category Navigation States
  const [activeTab, setActiveTab] = useState("dashboard"); // 'dashboard' | 'appointments' | 'records'
  const [recordCategory, setRecordCategory] = useState("prescriptions"); // 'prescriptions' | 'diagnostics' | 'notes' | 'uploads' | 'invoices'
  const categories = [
    { key: "prescriptions", label: "Prescriptions" },
    { key: "diagnostics", label: "Diagnostic Reports" },
    { key: "notes", label: "Appointment Notes" },
    { key: "uploads", label: "Uploaded Documents" },
    { key: "invoices", label: "Invoices" },
  ];

  // Mock Medical Records State
  const [records, setRecords] = useState({
    prescriptions: [
      {
        id: "rx-1",
        title: "Amoxicillin 500mg",
        doctor: "Dr. Sarah Jenkins",
        date: "2026-06-12",
        fileUrl: "#",
      },
    ],
    diagnostics: [
      {
        id: "diag-1",
        title: "Complete Blood Count (CBC)",
        facility: "Central Diagnostics",
        date: "2026-05-20",
        fileUrl: "#",
      },
    ],
    notes: [
      {
        id: "note-1",
        title: "Annual Physical Assessment",
        doctor: "Dr. Alan Grant",
        date: "2026-04-10",
        fileUrl: "#",
      },
    ],
    uploads: [
      {
        id: "up-1",
        title: "Previous Vaccination History.pdf",
        date: "2026-01-15",
        fileUrl: "#",
      },
    ],
    invoices: [
      {
        id: "inv-1",
        title: "Invoice #INV-2026-089",
        amount: "$150.00",
        status: "Paid",
        date: "2026-06-12",
        fileUrl: "#",
      },
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

  useEffect(() => {
    const timer = window.setInterval(() => {
      setNow(Date.now());
    }, 60_000);

    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (activeTab !== "appointments") {
      return;
    }

    if (appointments.length === 0) {
      if (selectedAppointmentId) {
        setSelectedAppointmentId("");
      }
      return;
    }

    const selectedStillExists = appointments.some(
      (appointment) => appointment.id === selectedAppointmentId,
    );

    if (!selectedStillExists) {
      setSelectedAppointmentId(appointments[0].id);
    }
  }, [activeTab, appointments, selectedAppointmentId]);

  useEffect(() => {
    if (activeTab !== "appointments") {
      return;
    }

    const selectedAppointment = appointments.find(
      (appointment) => appointment.id === selectedAppointmentId,
    );

    if (!selectedAppointment?.doctor?.id) {
      setDoctorContact(null);
      setDoctorContactError("");
      return;
    }

    let isActive = true;

    async function loadDoctorContact() {
      setDoctorContact(null);
      setDoctorContactError("");

      try {
        const response = await fetch(
          `http://localhost:3001/doctor/dashboard?doctorId=${selectedAppointment.doctor.id}`,
        );
        const result = await response.json();

        if (!response.ok) {
          if (isActive) {
            setDoctorContactError(
              result.message ?? "Could not load doctor contact details.",
            );
          }
          return;
        }

        if (isActive) {
          setDoctorContact(result.doctor ?? null);
        }
      } catch {
        if (isActive) {
          setDoctorContactError("Could not load doctor contact details.");
        }
      }
    }

    loadDoctorContact();

    return () => {
      isActive = false;
    };
  }, [activeTab, appointments, selectedAppointmentId]);

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
      setActionError(
        "Could not cancel appointment. Make sure the backend is running on port 3001.",
      );
    } finally {
      setIsCancellingId("");
    }
  }

  async function handlePayAppointment(appointmentId) {
    if (!authToken) {
      setActionError("You need to be logged in to make a payment.");
      return;
    }

    setIsPayingId(appointmentId);
    setActionError("");
    setActionMessage("");

    try {
      const response = await fetch(
        `http://localhost:3001/appointment/${appointmentId}/payment`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        },
      );
      const result = await response.json();

      if (!response.ok) {
        setActionError(result.message ?? "Could not create payment.");
        return;
      }

      setActionMessage(result.message ?? "Payment created successfully.");
      await loadAppointments(authToken);
      setSelectedAppointmentId(appointmentId);
    } catch {
      setActionError(
        "Could not create payment. Make sure the backend is running on port 3001.",
      );
    } finally {
      setIsPayingId("");
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
            <span className="text-lg font-bold text-slate-900">
              HealthPortal
            </span>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1">
            <button
              onClick={() => setActiveTab("dashboard")}
              className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition ${
                activeTab === "dashboard"
                  ? "bg-slate-900 text-white"
                  : "text-slate-600 hover:bg-slate-300 hover:text-slate-900"
              }`}
            >
              <Icon name="dashboard" />
              Dashboard Overview
            </button>

            <button
              onClick={() => setActiveTab("appointments")}
              className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition ${
                activeTab === "appointments"
                  ? "bg-slate-900 text-white"
                  : "text-slate-600 hover:bg-slate-300 hover:text-slate-900"
              }`}
            >
              <FontAwesomeIcon icon={faCalendarDays} />
              My Appointment
            </button>
            <div>
              <button
                type="button"
                onClick={() => {
                  setActiveTab("records");
                  setIsMenuOpen((current) => !current);
                }}
                aria-expanded={isMenuOpen}
                aria-controls="medical-records-accordion"
                className={`flex w-full items-center justify-between gap-3 px-3 py-2.5 text-sm font-semibold transition ${
                  activeTab === "records" || isMenuOpen
                    ? "bg-slate-900 text-white"
                    : "text-slate-600 hover:bg-slate-300 hover:text-slate-900"
                }`}
              >
                <span className="flex items-center gap-3">
                  <span
                    className={`inline-flex h-8 w-8 items-center justify-center rounded-md border ${
                      activeTab === "records" || isMenuOpen
                        ? "border-white/20 bg-white/10 text-white"
                        : "border-slate-200 bg-green-100 text-slate-500"
                    }`}
                  >
                    <Icon name="records" className="h-4 w-4" />
                  </span>
                  Medical Records
                </span>
                <span
                  className={`text-sm leading-none transition-transform ${
                    isMenuOpen ? "rotate-180 text-white/80" : "text-slate-400"
                  }`}
                >
                  ▾
                </span>
              </button>

              <div
                id="medical-records-accordion"
                className={`grid transition-all duration-200 ease-out ${
                  isMenuOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                }`}
              >
                <div className="overflow-hidden">
                  <div className="border-t border-slate-200 bg-slate-50 p-2">
                    <p className="px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">                    
                    </p>
                    {categories.map((cat) => (
                      <button
                        key={cat.key}
                        type="button"
                        onClick={() => {
                          setActiveTab("records");
                          setRecordCategory(cat.key);
                          setIsMenuOpen(true);
                        }}
                        className={`flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm transition ${
                          recordCategory === cat.key
                            ? "bg-slate-900 text-white"
                            : "text-slate-700 hover:bg-white hover:text-slate-950"
                        }`}
                      >
                        <span>{cat.label}</span>
                        {recordCategory === cat.key ? (
                          <span className="text-xs font-semibold">
                            <FontAwesomeIcon icon={faCircleCheck} />
                          </span>
                        ) : null}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <Link
              href="/find-doctor"
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-300 hover:text-slate-900"
            >
              <Icon name="doctors" />
              Find Doctors
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
              <p className="truncate text-sm font-bold text-slate-900">
                {patient?.name}
              </p>
              <p className="truncate text-xs text-slate-500">
                {patient?.email}
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 overflow-y-auto p-8">
        {activeTab === "dashboard" && (
          <DashboardOverviewPage
            patient={patient}
            appointments={appointments}
            onNavigateRecords={() => setActiveTab("records")}
            onNavigateAppointments={() => setActiveTab("appointments")}
            cancellationReasons={cancellationReasons}
            setCancellationReasons={setCancellationReasons}
            handleCancelAppointment={handleCancelAppointment}
            isCancellingId={isCancellingId}
            actionMessage={actionMessage}
            actionError={actionError}
          />
        )}

        {activeTab === "appointments" && (
          <MyAppointmentPage
            appointments={appointments}
            selectedAppointmentId={selectedAppointmentId}
            onSelectAppointment={setSelectedAppointmentId}
            cancellationReasons={cancellationReasons}
            setCancellationReasons={setCancellationReasons}
            handleCancelAppointment={handleCancelAppointment}
            handlePayAppointment={handlePayAppointment}
            isCancellingId={isCancellingId}
            isPayingId={isPayingId}
            actionMessage={actionMessage}
            actionError={actionError}
            doctorContact={doctorContact}
            doctorContactError={doctorContactError}
            now={now}
          />
        )}

        {activeTab === "records" && (
          <MedicalRecordsPage
            records={records}
            recordCategory={recordCategory}
            setRecordCategory={setRecordCategory}
          />
        )}
      </main>
    </div>
  );
}
