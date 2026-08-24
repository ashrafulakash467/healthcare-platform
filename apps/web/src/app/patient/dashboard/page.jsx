"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import DashboardOverviewPage from "../patient_layouts/dashboardoverview-page";
import PatientDashboardShell from "../patient_layouts/patient-dashboard-shell";
import MyAppointmentPage from "./my_appointment";
import MedicalRecordsPage from "./Medical-Records";
import { apiFetch, getStoredToken } from "@/lib/api";

export default function PatientDashboardPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");
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
  const [activeTab, setActiveTab] = useState(() =>
    normalizeDashboardTab(tabParam),
  );

  useEffect(() => {
    setActiveTab(normalizeDashboardTab(tabParam));
  }, [tabParam]);

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

    if (!selectedAppointmentId) {
      return;
    }

    const selectedStillExists = appointments.some(
      (appointment) => appointment.id === selectedAppointmentId,
    );

    if (!selectedStillExists) {
      queueMicrotask(() => {
        setSelectedAppointmentId(appointments[0]?.id ?? "");
      });
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

  function handlePayAppointment(appointmentId) {
    if (!authToken) {
      setActionError("You need to be logged in to make a payment.");
      return;
    }

    // Redirect to the payment page with the appointment ID in the URL.
    router.push(`/Payment?appointmentId=${encodeURIComponent(appointmentId)}`);
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 font-medium text-slate-500">
        Loading dashboard...
      </div>
    );
  }

  return (
    <PatientDashboardShell
      patient={patient}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      navigationMode="tabs"
    >
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
            setActionError={setActionError}
            setActionMessage={setActionMessage}
            doctorContact={doctorContact}
            doctorContactError={doctorContactError}
            now={now}
          />
        )}

        {activeTab === "records" && <MedicalRecordsPage patient={patient} />}
      </PatientDashboardShell>
  );
}

function normalizeDashboardTab(value) {
  const tab = String(value ?? "").toLowerCase();

  if (tab === "appointments" || tab === "records" || tab === "dashboard") {
    return tab;
  }

  return "dashboard";
}
