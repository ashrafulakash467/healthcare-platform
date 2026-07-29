"use client";

import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCalendarDays } from "@fortawesome/free-solid-svg-icons";
import { Icon } from "./admin_layouts/dashboard-shared";
import DashboardOverviewPage from "./admin_layouts/dashboardoverview-page";
import MyAppointmentPage from "./admin_layouts/myappointment-page";
import MedicalRecordsPage from "./admin_layouts/medicalrecords-page";
import ScheduleManagementPage from "./admin_layouts/schedule-management-page";

const tabItems = [
  { key: "dashboard", label: "Dashboard", icon: "dashboard" },
  { key: "today", label: "Today's Appointments", icon: "calendar" },
  { key: "upcoming", label: "Upcoming Appointments", icon: "calendar" },
  { key: "pending", label: "Pending Requests", icon: "clipboard" },
  { key: "records", label: "Patient Records", icon: "records" },
  { key: "prescriptions", label: "Prescriptions", icon: "records" },
  { key: "schedule", label: "Schedule Management", icon: "stethoscope" },
  { key: "earnings", label: "Earnings", icon: "wallet" },
  { key: "notifications", label: "Notifications", icon: "bell" },
];

const notificationsSeed = [
  {
    id: "note-1",
    title: "New consultation request",
    message: "One patient is waiting for review this morning.",
  },
  {
    id: "note-2",
    title: "Follow-up reminder",
    message: "Two patients are due for follow-up scheduling today.",
  },
  {
    id: "note-3",
    title: "Earnings update",
    message: "Your clinic summary is ready for review.",
  },
];

export default function DoctorDashboardClient() {
  const [doctor, setDoctor] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [recordCategory, setRecordCategory] = useState("diagnostics");
  const [selectedAppointmentId, setSelectedAppointmentId] = useState("");
  const [now, setNow] = useState(Date.now());

  const [records] = useState({
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
    async function loadDoctor() {
      const token = localStorage.getItem("doctorToken");

      if (!token) {
        window.location.replace("/doctor/login");
        return;
      }

      try {
        const response = await fetch("http://localhost:3001/doctor/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const result = await response.json();

        if (!response.ok) {
          localStorage.removeItem("doctorToken");
          localStorage.removeItem("doctorUser");
          window.location.replace("/doctor/login");
          return;
        }

        setDoctor(result.user ?? null);
        await loadAppointments(token);
      } catch {
        const cachedDoctor = localStorage.getItem("doctorUser");
        if (cachedDoctor) {
          setDoctor(JSON.parse(cachedDoctor));
        }
      } finally {
        setIsLoading(false);
      }
    }

    loadDoctor();
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setNow(Date.now());
    }, 60_000);

    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!selectedAppointmentId) {
      const firstAppointment = getAppointmentsForActiveTab(activeTab, appointments)[0];
      if (firstAppointment) {
        setSelectedAppointmentId(firstAppointment.id);
      }
      return;
    }

    const visibleAppointments = getAppointmentsForActiveTab(activeTab, appointments);
    const stillVisible = visibleAppointments.some(
      (appointment) => appointment.id === selectedAppointmentId,
    );

    if (!stillVisible && visibleAppointments[0]) {
      setSelectedAppointmentId(visibleAppointments[0].id);
    }
  }, [activeTab, appointments, selectedAppointmentId]);

  const todayString = new Date().toISOString().slice(0, 10);
  const todayAppointments = appointments.filter(
    (appointment) => appointment.appointmentDate === todayString,
  );
  const upcomingAppointments = appointments.filter(
    (appointment) => appointment.appointmentDate > todayString,
  );
  const pendingRequests = appointments.filter(
    (appointment) => (appointment.status ?? "").toLowerCase() === "pending",
  );
  const paidAppointmentTotal = appointments.filter(
    (appointment) => (appointment.paymentStatus ?? "").toLowerCase() === "paid",
  ).length * 12500;
  const notificationItems = notificationsSeed.map((item, index) => ({
    ...item,
    id: `${item.id}-${index}`,
    detail: item.message,
  }));
  const workflowSteps = [
    {
      title: "Open Appointment",
      detail: "Select the appointment from today's, upcoming, or pending queues.",
    },
    {
      title: "Review Patient Details",
      detail: "Check the booking info, clinic details, and supporting records.",
    },
    {
      title: "Accept / Reject / Reschedule",
      detail: "Confirm the consultation, decline it, or move it to another slot.",
    },
    {
      title: "Conduct Consultation",
      detail: "Carry out the live consultation and capture the clinical discussion.",
    },
    {
      title: "Add Clinical Notes",
      detail: "Document your observations, assessment, and treatment plan.",
    },
    {
      title: "Issue Prescription",
      detail: "Generate prescriptions or instructions for the patient.",
    },
    {
      title: "Mark Appointment Complete",
      detail: "Close the consultation once everything has been addressed.",
    },
    {
      title: "Schedule Follow-up",
      detail: "Set the next review date if the patient needs one.",
    },
  ];

  function handleTabChange(nextTab) {
    if (nextTab === "prescriptions") {
      setRecordCategory("prescriptions");
      setActiveTab("records");
      return;
    }

    if (nextTab === "records") {
      setRecordCategory("diagnostics");
      setActiveTab("records");
      return;
    }

    setActiveTab(nextTab);
  }

  function getTabActiveState(tabKey) {
    if (tabKey === "records") {
      return activeTab === "records" && recordCategory !== "prescriptions";
    }

    if (tabKey === "prescriptions") {
      return activeTab === "records" && recordCategory === "prescriptions";
    }

    if (tabKey === "schedule") {
      return activeTab === "schedule";
    }

    return activeTab === tabKey;
  }

  function loadAppointments(token) {
    return fetch("http://localhost:3001/appointment/my", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((response) => response.json().then((result) => ({ response, result })))
      .then(({ response, result }) => {
        if (response.ok) {
          setAppointments(result.appointments ?? []);
        }
      })
      .catch((error) => {
        console.error("Failed to fetch appointments:", error);
      });
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 font-medium text-slate-500">
        Loading doctor dashboard...
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
            {tabItems.map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => handleTabChange(item.key)}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition ${
                  getTabActiveState(item.key)
                    ? "bg-slate-900 text-white"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                {item.key === "today" ? (
                  <FontAwesomeIcon icon={faCalendarDays} />
                ) : (
                  <Icon name={item.icon} />
                )}
                {item.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="border-t border-slate-100 p-4">
          <div className="flex items-center gap-3 px-2 py-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-200 font-bold text-slate-700">
              {doctor?.name?.charAt(0) || "D"}
            </div>
            <div className="overflow-hidden">
              <p className="truncate text-sm font-bold text-slate-900">
                {doctor?.name}
              </p>
              <p className="truncate text-xs text-slate-500">
                {doctor?.email}
              </p>
            </div>
          </div>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto p-8">
        {activeTab === "dashboard" && (
          <DashboardOverviewPage
            doctor={doctor}
            records={records}
            todayAppointments={todayAppointments}
            upcomingAppointments={upcomingAppointments}
            pendingRequests={pendingRequests}
            paidAppointmentTotal={paidAppointmentTotal}
            notifications={notificationItems}
            workflowSteps={workflowSteps}
            onNavigateSection={handleTabChange}
            onNavigateTab={handleTabChange}
          />
        )}

        {activeTab === "today" && (
          <MyAppointmentPage
            appointments={todayAppointments}
            selectedAppointmentId={selectedAppointmentId}
            onSelectAppointment={setSelectedAppointmentId}
            mode="today"
            now={now}
          />
        )}

        {activeTab === "upcoming" && (
          <MyAppointmentPage
            appointments={upcomingAppointments}
            selectedAppointmentId={selectedAppointmentId}
            onSelectAppointment={setSelectedAppointmentId}
            mode="upcoming"
            now={now}
          />
        )}

        {activeTab === "pending" && (
          <MyAppointmentPage
            appointments={pendingRequests}
            selectedAppointmentId={selectedAppointmentId}
            onSelectAppointment={setSelectedAppointmentId}
            mode="pending"
            now={now}
          />
        )}

        {activeTab === "records" && (
          <MedicalRecordsPage
            title={
              recordCategory === "prescriptions"
                ? "Prescriptions"
                : "Patient Records"
            }
            description={
              recordCategory === "prescriptions"
                ? "Medication files and prescription history."
                : "Diagnostic reports, notes, uploads, and invoices for your patients."
            }
            records={records}
            recordCategory={recordCategory}
            setRecordCategory={setRecordCategory}
          />
        )}

        {activeTab === "schedule" && (
          <ScheduleManagementPage
            doctor={doctor}
            onNavigateSection={handleTabChange}
          />
        )}

        {activeTab === "earnings" && (
          <EarningsPanel
            summary={{
              earningsCents: paidAppointmentTotal,
              pending: pendingRequests.length,
            }}
            appointments={appointments}
            onNavigateTab={handleTabChange}
          />
        )}

        {activeTab === "notifications" && (
          <NotificationsPanel
            notifications={notificationItems}
            onNavigateTab={handleTabChange}
          />
        )}
      </main>
    </div>
  );
}

function getAppointmentsForActiveTab(activeTab, appointments) {
  const todayString = new Date().toISOString().slice(0, 10);

  if (activeTab === "today") {
    return appointments.filter(
      (appointment) => appointment.appointmentDate === todayString,
    );
  }

  if (activeTab === "upcoming") {
    return appointments.filter(
      (appointment) => appointment.appointmentDate > todayString,
    );
  }

  if (activeTab === "pending") {
    return appointments.filter(
      (appointment) => (appointment.status ?? "").toLowerCase() === "pending",
    );
  }

  return appointments;
}

function EarningsPanel({ summary, appointments, onNavigateTab }) {
  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div className="flex flex-col gap-4 border-b border-slate-200 pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Earnings</h1>
          <p className="mt-0.5 text-sm text-slate-500">
            Review appointment revenue and payout status.
          </p>
        </div>
        <button
          type="button"
          onClick={() => onNavigateTab("dashboard")}
          className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          Back to dashboard
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Estimated earnings
          </p>
          <p className="mt-1 text-2xl font-bold text-slate-900">
            ${(summary.earningsCents / 100).toFixed(0)}
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Total appointments
          </p>
          <p className="mt-1 text-2xl font-bold text-slate-900">
            {appointments.length}
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Pending requests
          </p>
          <p className="mt-1 text-2xl font-bold text-slate-900">
            {summary.pending}
          </p>
        </div>
      </div>

      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900">Revenue notes</h2>
        <p className="mt-2 text-sm text-slate-500">
          This section can later be wired to real payout analytics, but the
          dashboard flow is already in place.
        </p>
      </section>
    </div>
  );
}

function NotificationsPanel({ notifications, onNavigateTab }) {
  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div className="flex flex-col gap-4 border-b border-slate-200 pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Notifications</h1>
          <p className="mt-0.5 text-sm text-slate-500">
            Keep an eye on new requests, reminders, and follow-ups.
          </p>
        </div>
        <button
          type="button"
          onClick={() => onNavigateTab("dashboard")}
          className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          Back to dashboard
        </button>
      </div>

      <div className="space-y-3">
        {notifications.length === 0 ? (
          <p className="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-4 py-5 text-sm text-slate-500">
            No notifications right now.
          </p>
        ) : (
          notifications.map((item) => (
            <div
              key={item.id}
              className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <p className="text-sm font-bold text-slate-900">{item.title}</p>
              <p className="mt-1 text-sm text-slate-500">{item.message}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
