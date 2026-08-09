"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCalendarDays } from "@fortawesome/free-solid-svg-icons";
import { Icon } from "../patient_layouts/dashboard-shared";
import DashboardOverviewPage from "../patient_layouts/dashboardoverview-page";
import MyAppointmentPage from "../patient_layouts/myappointment-page";
import MedicalRecordsPage from "./Medical-Records";
import { apiFetch, getStoredToken } from "@/lib/api";

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
  const [activeTab, setActiveTab] = useState("dashboard");

  useEffect(() => {
    async function loadPatient() {
      const token = getStoredToken("patient");

      if (!token) {
        router.replace("/login");
        return;
      }

      try {
        const response = await apiFetch("/patient/me", {}, token);
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
        queueMicrotask(() => setSelectedAppointmentId(""));
      }
      return;
    }

    const selectedStillExists = appointments.some(
      (appointment) => appointment.id === selectedAppointmentId,
    );

    if (!selectedStillExists) {
      queueMicrotask(() => setSelectedAppointmentId(appointments[0].id));
    }
  }, [activeTab, appointments, selectedAppointmentId]);

  useEffect(() => {
    const selectedAppointment = appointments.find(
      (appointment) => appointment.id === selectedAppointmentId,
    );

    if (!selectedAppointment?.doctor) {
      queueMicrotask(() => {
        setDoctorContact(null);
        setDoctorContactError("");
      });
      return;
    }

    queueMicrotask(() => {
      setDoctorContact(selectedAppointment.doctor);
      setDoctorContactError("");
    });
  }, [appointments, selectedAppointmentId]);

  async function loadAppointments(token) {
    try {
      const response = await apiFetch("/appointment/my", {}, token);
      const result = await response.json();

      if (response.ok) {
        setAppointments(result.appointments ?? []);
      }
    } catch (error) {
      console.error("Failed to fetch appointments:", error);
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
      const response = await apiFetch(
        "/appointment/cancel",
        {
          method: "POST",
          body: JSON.stringify({ appointmentId, reason }),
        },
        authToken,
      );
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
    } catch {
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
      const response = await apiFetch(
        `/appointment/${appointmentId}/payment`,
        { method: "POST" },
        authToken,
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

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 font-medium text-slate-500">
        Loading dashboard...
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-7xl bg-slate-50 font-sans text-slate-900">
      <aside className="sticky top-0 flex h-165 w-64 flex-shrink-0 flex-col justify-between border-r border-slate-200 bg-white">
        <div>
          <div className="flex h-16 items-center border-b border-slate-100 px-6">
            <span className="text-lg font-bold text-slate-900">
              HealthPortal
            </span>
          </div>

          <nav className="space-y-1 p-4">
            <button
              type="button"
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
              type="button"
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

            <button
              type="button"
              onClick={() => setActiveTab("records")}
              className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition ${
                activeTab === "records"
                  ? "bg-slate-900 text-white"
                  : "text-slate-600 hover:bg-slate-300 hover:text-slate-900"
              }`}
            >
              <Icon name="records" />
              Medical Records
            </button>

            <Link
              href="/find-doctor"
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-300 hover:text-slate-900"
            >
              <Icon name="doctors" />
              Find Doctors
            </Link>
          </nav>
        </div>

        <div className="border-t border-slate-100 p-4">
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

        {activeTab === "records" && <MedicalRecordsPage patient={patient} />}
      </main>
    </div>
  );
}
