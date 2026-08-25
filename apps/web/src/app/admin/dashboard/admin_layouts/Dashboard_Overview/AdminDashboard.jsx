"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Icon, formatCurrency } from "./dashboard-shared";
import UsersPage from "../Users/users-page";
import DoctorsPage from "../Doctors/doctors-page";
import ReportsPage from "../Doctors/reports-page";
import HospitalsPage from "../Hospitals/hospitals-page";
import AppointmentsPage from "../Appointments/appointments-page";
import PaymentsPage from "../Payments/payments-page";
import ContentPage from "../Content/content-page";
import NotificationsPage from "../Notifications/notifications-page";
import SupportPage from "../Support/support-page";
import RolesPage from "../Roles_&_permisions/roles-page";
import SettingsPage from "../All_Settings/settings-page";
import AuditPage from "../Audit_logs/audit-page";
import DashboardHeader from "../../../../Header_Sidebar-Admin-Doc-shareUi/header";
import { apiFetch, getStoredToken } from "@/lib/api";
import {
  createDoctorDirectoryChannel,
  getDoctorDirectoryUpdateEventName,
  notifyDoctorDirectoryUpdated,
} from "@/lib/doctor-directory";
import SidebarShell from "../../../../Header_Sidebar-Admin-Doc-shareUi/SidebarShell";
import { adminSidebarItems } from "../../../../Header_Sidebar-Admin-Doc-shareUi/sidebar-config";

const tabItems = adminSidebarItems;


const doctorsSeed = [
  {
    id: "doctor-1",
    name: "Dr. Sarah Jenkins",
    specialty: "Cardiology",
    hospital: "Central Care Hospital",
    license: "BMDC-112233",
    status: "Pending Review",
    notes: "Verify chamber availability and license authenticity.",
  },
  {
    id: "doctor-2",
    name: "Dr. Alan Grant",
    specialty: "Internal Medicine",
    hospital: "City Medical Center",
    license: "BMDC-998811",
    status: "Approved",
    notes: "Fully verified and active on the platform.",
  },
  {
    id: "doctor-3",
    name: "Dr. Meher Afroz",
    specialty: "Dermatology",
    hospital: "Metro Hospital",
    license: "BMDC-775544",
    status: "Needs Documents",
    notes: "Missing one uploaded credential document.",
  },
];

const hospitalsSeed = [
  { id: "hospital-1", name: "Central Care Hospital", city: "Dhaka", status: "Onboarded", doctors: 72, beds: 240 },
  { id: "hospital-2", name: "City Medical Center", city: "Chattogram", status: "Under Review", doctors: 48, beds: 180 },
  { id: "hospital-3", name: "Metro Hospital", city: "Sylhet", status: "Onboarded", doctors: 36, beds: 120 },
];

const appointmentsSeed = [
  { id: "apt-1", patient: "Nusrat Jahan", doctor: "Dr. Sarah Jenkins", time: "09:30 AM", type: "Initial Consultation", status: "Pending", payment: "Paid" },
  { id: "apt-2", patient: "Sabbir Ahmed", doctor: "Dr. Alan Grant", time: "10:15 AM", type: "Follow-up", status: "Confirmed", payment: "Pending" },
  { id: "apt-3", patient: "Hafsa Karim", doctor: "Dr. Meher Afroz", time: "11:00 AM", type: "Reschedule", status: "Reschedule Requested", payment: "Paid" },
];

const paymentsSeed = [
  { id: "pay-1", reference: "INV-2026-089", amountCents: 15000, status: "Paid", note: "Consultation fee" },
  { id: "pay-2", reference: "REF-2026-014", amountCents: 3500, status: "Refund Requested", note: "Partial refund for cancelled appointment" },
  { id: "pay-3", reference: "SET-2026-041", amountCents: 42000, status: "Settled", note: "Doctor payout batch" },
];

const contentSeed = [
  { id: "cms-1", title: "Homepage Banner", status: "Published", owner: "Marketing" },
  { id: "cms-2", title: "Doctor FAQ", status: "Draft", owner: "Support" },
  { id: "cms-3", title: "Hospital Onboarding Guide", status: "Review", owner: "Operations" },
];

const reportsSeed = [
  { id: "rep-1", title: "Daily Revenue Report", status: "Ready", owner: "Finance" },
  { id: "rep-2", title: "Doctor Verification Report", status: "Pending", owner: "Operations" },
  { id: "rep-3", title: "Appointment Funnel", status: "Ready", owner: "Analytics" },
];

const notificationsSeed = [
  { id: "note-1", title: "Pending doctor verification", message: "Three onboarding applications need manual review today." },
  { id: "note-2", title: "Refund queue update", message: "Two refund requests are waiting for finance approval." },
  { id: "note-3", title: "System health alert", message: "All services are green. No incident is currently open." },
];

const supportSeed = [
  { id: "ticket-1", subject: "Login OTP not received", requester: "A. Rahman", priority: "High", status: "Open" },
  { id: "ticket-2", subject: "Doctor profile update request", requester: "Dr. Sarah Khan", priority: "Medium", status: "In Progress" },
  { id: "ticket-3", subject: "Invoice mismatch", requester: "Finance Team", priority: "Low", status: "Waiting on User" },
];

const auditSeed = [
  { id: "audit-1", action: "Doctor approved", actor: "Admin", time: "2 minutes ago" },
  { id: "audit-2", action: "Hospital profile updated", actor: "Operations", time: "14 minutes ago" },
  { id: "audit-3", action: "Role permissions changed", actor: "Super Admin", time: "32 minutes ago" },
];

const rolesSeed = [
  { role: "Super Admin", permissions: ["All access", "Manage roles", "View audit logs", "Change settings"] },
  { role: "Operations Admin", permissions: ["Doctors", "Hospitals", "Appointments", "Reports"] },
  { role: "Finance Admin", permissions: ["Payments", "Refunds", "Reports"] },
  { role: "Support Admin", permissions: ["Tickets", "Notifications", "CMS updates"] },
];

const systemSettingsSeed = {
  mfaEnabled: true,
  doctorAutoReview: false,
  patientSignupOpen: true,
  maintenanceMode: false,
};

function formatDoctorListValue(value) {
  if (Array.isArray(value)) {
    return value.filter(Boolean).join("\n");
  }

  if (typeof value === "string") {
    return value;
  }

  return "";
}

function normalizeDoctorDateList(value) {
  if (Array.isArray(value)) {
    return value.filter(Boolean);
  }

  if (typeof value !== "string") {
    return [];
  }

  const trimmed = value.trim();

  if (!trimmed) {
    return [];
  }

  try {
    const parsed = JSON.parse(trimmed);
    if (Array.isArray(parsed)) {
      return parsed.filter(Boolean);
    }
  } catch {
    // fall through to line/comma splitting
  }

  return trimmed
    .split(/[\n,]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function getStoredAdminUser() {
  if (typeof window === "undefined") {
    return null;
  }

  const storedAdmin = localStorage.getItem("adminUser");

  if (storedAdmin) {
    try {
      return JSON.parse(storedAdmin);
    } catch {
      return { name: "Admin", email: "admin@healthcare.com", role: "Admin" };
    }
  }

  return { name: "Admin", email: "admin@healthcare.com", role: "Admin" };
}

export default function AdminDashboard() {
  const [admin] = useState(() => getStoredAdminUser());
  const [isReady, setIsReady] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [selectedAppointmentId, setSelectedAppointmentId] = useState(appointmentsSeed[0].id);
  const [selectedReportId, setSelectedReportId] = useState(reportsSeed[0].id);
  const [selectedTicketId, setSelectedTicketId] = useState(supportSeed[0].id);
  const [systemSettings, setSystemSettings] = useState(systemSettingsSeed);
  const [statusMessage, setStatusMessage] = useState("");
  const [toast, setToast] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [doctorsLoading, setDoctorsLoading] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    const storedToken = localStorage.getItem("adminToken");

    if (!storedToken) {
      window.location.replace("/login");
      return;
    }

    queueMicrotask(() => setIsReady(true));
  }, []);

  const loadDoctors = useCallback(async () => {
    const token = getStoredToken("admin");
    if (!token) return;

    setDoctorsLoading(true);
    try {
      const response = await apiFetch("/admin/doctors", {}, token);
      const result = await response.json();
      if (response.ok) {
        setDoctors(result.doctors ?? []);
      } else {
        setStatusMessage("Failed to load doctors.");
      }
    } catch {
      setStatusMessage("Failed to load doctors from the server.");
    } finally {
      setDoctorsLoading(false);
    }
  }, []);
  const loadSummary = useCallback(async () => {
    const token = getStoredToken("admin");
    if (!token) return;

    try {
      const response = await apiFetch("/admin/dashboard", {}, token);
      const result = await response.json();
      if (response.ok && result?.summary) {
        setSummary(result.summary);
      } else {
        setStatusMessage("Failed to load dashboard summary.");
      }
    } catch {
      // Keep fallback values when the API is unreachable.
    }
  }, []);

  useEffect(() => {
    void loadSummary();

    const interval = window.setInterval(() => {
      void loadSummary();
    }, 30000);

    return () => window.clearInterval(interval);
  }, [loadSummary]);

  useEffect(() => {
    if (activeTab === "doctors") {
      const timer = window.setTimeout(() => {
        void loadDoctors();
      }, 0);

      return () => window.clearTimeout(timer);
    }
  }, [activeTab, loadDoctors]);

  useEffect(() => {
    const handleDirectoryUpdate = () => {
      void loadDoctors();
    };

    const channel = createDoctorDirectoryChannel();

    if (channel) {
      channel.addEventListener("message", handleDirectoryUpdate);
    }

    window.addEventListener(getDoctorDirectoryUpdateEventName(), handleDirectoryUpdate);

    return () => {
      if (channel) {
        channel.removeEventListener("message", handleDirectoryUpdate);
        channel.close();
      }

      window.removeEventListener(getDoctorDirectoryUpdateEventName(), handleDirectoryUpdate);
    };
  }, [loadDoctors]);

  useEffect(() => {
    if (!toast) {
      return undefined;
    }

    const timer = window.setTimeout(() => {
      setToast(null);
    }, 3200);

    return () => window.clearTimeout(timer);
  }, [toast]);

  function showToast(message, tone = "success") {
    setToast({ message, tone });
  }

  async function handleUpdateDoctor(doctorId, formData) {
    const token = getStoredToken("admin");
    if (!token) return;

    const hasImageFile = formData?.imageFile instanceof File;
    const isCreateMode = !doctorId;
    const passwordValue = String(formData?.password ?? "").trim();
    const passwordConfirmationValue = String(formData?.passwordConfirmation ?? "").trim();

    if (isCreateMode && !passwordValue) {
      showToast("Please set a password for the doctor account.", "error");
      return;
    }

    if (passwordValue || passwordConfirmationValue) {
      if (!passwordValue || !passwordConfirmationValue) {
        showToast("Please fill in both password fields.", "error");
        return;
      }

      if (passwordValue !== passwordConfirmationValue) {
        showToast("Doctor passwords do not match.", "error");
        return;
      }
    }

    if (hasImageFile) {
      const payload = new FormData();

      const appendValue = (key, value) => {
        if (value !== undefined && value !== null && value !== "") {
          payload.append(key, value);
        }
      };

      appendValue("name", formData.name ?? "");
      appendValue("email", formData.email ?? "");
      appendValue("phone", formData.phone ?? "");
      appendValue("specialty", formData.specialty ?? "");
      appendValue("sub_specialty", formData.subSpecialty ?? "");
      appendValue("qualification", formData.qualification ?? "");
      appendValue("bio", formData.bio ?? "");
      appendValue("gender", formData.gender ?? "");
      appendValue(
        "consultation_fee",
        formData.consultationFee === "" || formData.consultationFee === null || formData.consultationFee === undefined
          ? ""
          : formData.consultationFee,
      );
      appendValue(
        "follow_up_fee",
        formData.followUpFee === "" || formData.followUpFee === null || formData.followUpFee === undefined
          ? ""
          : formData.followUpFee,
      );
      appendValue("hospital_ids", JSON.stringify(Array.isArray(formData.hospitalIds) ? formData.hospitalIds : []));
      appendValue("available_dates", formData.availableDates ?? "");
      appendValue("available_time_slots", formData.availableTimeSlots ?? "");
      appendValue("city", formData.city ?? "");
      appendValue("license_no", formData.licenseNo ?? "");
      appendValue("verification_status", formData.verificationStatus ?? "");
      appendValue("status", formData.status ?? "");
      appendValue("password", passwordValue);
      appendValue("password_confirmation", passwordConfirmationValue);
      payload.append("image", formData.imageFile);

      if (!isCreateMode) {
        payload.append("_method", "PUT");
      }

      try {
        const response = await apiFetch(
          isCreateMode ? "/admin/doctors" : `/admin/doctors/${doctorId}`,
          {
            method: isCreateMode ? "POST" : "POST",
            body: payload,
          },
          token,
        );
        const result = await response.json();

        if (response.ok) {
          setDoctors((current) =>
            isCreateMode
              ? [result.doctor, ...current]
              : current.map((doctor) => (doctor.id === doctorId ? result.doctor : doctor)),
          );
          notifyDoctorDirectoryUpdated({
            action: isCreateMode ? "created" : "updated",
            doctor: result.doctor,
          });
          setEditingDoctor(null);
          setEditForm({});
          showToast(isCreateMode ? "Doctor created successfully." : "Doctor updated successfully.");
        } else {
          showToast(result.message ?? (isCreateMode ? "Failed to create doctor." : "Failed to update doctor."), "error");
        }
      } catch {
        showToast(isCreateMode ? "Failed to create doctor." : "Failed to update doctor.", "error");
      }

      return;
    }

    const payload = {
      name: formData.name ?? "",
      email: formData.email ?? "",
      phone: formData.phone ?? "",
      specialty: formData.specialty ?? "",
      sub_specialty: formData.subSpecialty ?? null,
      qualification: formData.qualification ?? null,
      bio: formData.bio ?? null,
      gender: formData.gender ?? null,
      consultation_fee:
        formData.consultationFee === "" || formData.consultationFee === null || formData.consultationFee === undefined
          ? null
          : formData.consultationFee,
      follow_up_fee:
        formData.followUpFee === "" || formData.followUpFee === null || formData.followUpFee === undefined
          ? null
          : formData.followUpFee,
      hospital_ids: Array.isArray(formData.hospitalIds) ? formData.hospitalIds : [],
      available_dates: formData.availableDates ?? null,
      available_time_slots: formData.availableTimeSlots ?? null,
      city: formData.city ?? null,
      license_no: formData.licenseNo ?? null,
      verification_status: formData.verificationStatus ?? undefined,
      status: formData.status ?? undefined,
      password: passwordValue || undefined,
      password_confirmation: passwordValue ? passwordConfirmationValue : undefined,
    };

    if (formData.imagePath) {
      payload.image_path = formData.imagePath;
    }

    try {
      const response = await apiFetch(isCreateMode ? "/admin/doctors" : `/admin/doctors/${doctorId}`, {
        method: isCreateMode ? "POST" : "PUT",
        body: JSON.stringify(payload),
      }, token);
      const result = await response.json();

      if (response.ok) {
        setDoctors((current) =>
          isCreateMode
            ? [result.doctor, ...current]
            : current.map((doctor) => (doctor.id === doctorId ? result.doctor : doctor)),
        );
        notifyDoctorDirectoryUpdated({
          action: isCreateMode ? "created" : "updated",
          doctor: result.doctor,
        });
        setEditingDoctor(null);
        setEditForm({});
        showToast(isCreateMode ? "Doctor created successfully." : "Doctor updated successfully.");
      } else {
        showToast(result.message ?? (isCreateMode ? "Failed to create doctor." : "Failed to update doctor."), "error");
      }
    } catch {
      showToast(isCreateMode ? "Failed to create doctor." : "Failed to update doctor.", "error");
    }
  }

  async function handleDeleteDoctor(doctorId) {
    const token = getStoredToken("admin");
    if (!token) return;

    try {
      const response = await apiFetch(`/admin/doctors/${doctorId}`, {
        method: "DELETE",
      }, token);
      const result = await response.json();

      if (response.ok) {
        setDoctors((current) => current.filter((doctor) => doctor.id !== doctorId));
        notifyDoctorDirectoryUpdated({
          action: "deleted",
          doctor: { id: doctorId },
        });
        setDeleteConfirmId(null);
        showToast("Doctor deleted successfully.");
      } else {
        showToast(result.message ?? "Failed to delete doctor.", "error");
      }
    } catch {
      showToast("Failed to delete doctor.", "error");
    }
  }

  function openEditDoctor(doctor) {
    setEditingDoctor(doctor);
    setEditForm({
      name: doctor.name ?? "",
      email: doctor.email ?? "",
      phone: doctor.phone ?? "",
      specialty: doctor.specialty ?? "",
      subSpecialty: doctor.subSpecialty ?? "",
      qualification: doctor.qualification ?? "",
      gender: doctor.gender ?? "",
      consultationFee: doctor.consultationFee ?? "",
      followUpFee: doctor.followUpFee ?? "",
      hospitalIds: doctor.hospitalIds ?? doctor.hospital_ids ?? [],
      availableDates: normalizeDoctorDateList(doctor.availableDates ?? doctor.available_dates),
      availableTimeSlots: formatDoctorListValue(doctor.availableTimeSlots ?? doctor.available_time_slots),
      city: doctor.city ?? "",
      licenseNo: doctor.licenseNo ?? "",
      verificationStatus: doctor.verificationStatus ?? "pending",
      status: doctor.status ?? "active",
      imagePath: doctor.imagePath ?? doctor.imageUrl ?? "",
      imageFile: null,
      imagePreviewUrl: doctor.imageUrl ?? doctor.imagePath ?? "",
      password: "",
      passwordConfirmation: "",
    });
  }

  function openNewDoctor() {
    setEditingDoctor({
      id: null,
      name: "",
      email: "",
      phone: "",
      specialty: "",
      subSpecialty: "",
      qualification: "",
      gender: "",
      consultationFee: "",
      followUpFee: "",
      hospitalIds: [],
      availableDates: [],
      availableTimeSlots: "",
      city: "",
      licenseNo: "",
      verificationStatus: "pending",
      status: "active",
      imagePath: "",
      imageUrl: "",
      password: "",
      passwordConfirmation: "",
    });
    setEditForm({
      name: "",
      email: "",
      phone: "",
      specialty: "",
      subSpecialty: "",
      qualification: "",
      gender: "",
      consultationFee: "",
      followUpFee: "",
      hospitalIds: [],
      availableDates: [],
      availableTimeSlots: "",
      city: "",
      licenseNo: "",
      verificationStatus: "pending",
      status: "active",
      imagePath: "",
      imageFile: null,
      imagePreviewUrl: "",
      password: "",
      passwordConfirmation: "",
    });
    setActiveTab("doctors");
  }

  const totals = useMemo(() => {
    const fallback = {
      pendingDoctors: doctorsSeed.filter((item) =>
        item.status.toLowerCase().includes("pending") || item.status.toLowerCase().includes("document"),
      ).length,
      pendingRefunds: paymentsSeed.filter((item) => item.status.toLowerCase().includes("refund")).length,
      openTickets: supportSeed.filter((item) => item.status === "Open").length,
      patients: 12480,
      doctors: 386,
      hospitals: hospitalsSeed.length,
      todayAppointments: appointmentsSeed.length,
      revenueCents: 9650000,
    };

    return {
      patients: summary?.patients ?? fallback.patients,
      doctors: summary?.doctors ?? fallback.doctors,
      hospitals: summary?.hospitals ?? fallback.hospitals,
      todayAppointments: summary?.todayAppointments ?? fallback.todayAppointments,
      revenueCents: summary?.revenueCents ?? fallback.revenueCents,
      pendingDoctors: summary?.pendingDoctors ?? fallback.pendingDoctors,
      pendingRefunds: summary?.pendingRefunds ?? fallback.pendingRefunds,
      openTickets: summary?.openTickets ?? fallback.openTickets,
      systemHealth: summary?.systemHealth ?? (systemSettings.maintenanceMode ? 71 : 98),
    };
  }, [summary, systemSettings.maintenanceMode]);

  if (!isReady) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 text-sm font-medium text-slate-500">
        Loading admin dashboard...
      </main>
    );
  }

  function handleLogout() {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminUser");
    document.cookie = "adminToken=; path=/; max-age=0; SameSite=Lax";
    window.location.replace("/login");
  }

  function openModule(tabKey, message) {
    setActiveTab(tabKey);
    if (message) {
      setStatusMessage(message);
    }
  }

  function handleSidebarItemClick(item) {
    if (item.key === "visit-site") {
      window.location.href = "/";
      return;
    }

    setActiveTab(item.key);
  }

  function toggleSetting(settingKey) {
    setSystemSettings((current) => ({
      ...current,
      [settingKey]: !current[settingKey],
    }));
    setStatusMessage("System settings updated.");
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <DashboardHeader
        user={admin}
        title="Admin Dashboard"
        subtitle="Manage users, doctors, hospitals, and system operations."
        roleLabel="Admin"
        disableMobileSidebarToggle
        onLogout={handleLogout}
      />

      <div className="flex h-[calc(100vh-5rem)] w-full overflow-hidden bg-slate-50 text-slate-900">
        <SidebarShell
          title="Admin Dashboard"
          subtitle="Manage users, doctors, hospitals, and system operations."
          roleLabel="Admin"
          items={tabItems}
          activeKey={activeTab}
          renderIcon={(item) => <Icon name={item.icon} className="h-5 w-5 shrink-0" />}
          user={admin}
          onLogout={handleLogout}
          onItemClick={handleSidebarItemClick}
        />

        <main className="min-h-0 flex-1 overflow-y-auto px-6 py-8 lg:px-8">
          {statusMessage ? (
            <p className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              {statusMessage}
            </p>
          ) : null}

          {activeTab === "dashboard" && (
            <DashboardOverviewPanel admin={admin} totals={totals} onNavigate={openModule} />
          )}
          {activeTab === "users" && <UsersPage />}
          {activeTab === "doctors" && (
            <DoctorsPage
              doctors={doctors}
              loading={doctorsLoading}
              editingDoctor={editingDoctor}
              editForm={editForm}
              setEditForm={setEditForm}
              deleteConfirmId={deleteConfirmId}
              setDeleteConfirmId={setDeleteConfirmId}
              onEdit={openEditDoctor}
              onAddNew={openNewDoctor}
              onUpdate={handleUpdateDoctor}
              onDelete={handleDeleteDoctor}
              onRefresh={loadDoctors}
              onCancelEdit={() => {
                setEditingDoctor(null);
                setEditForm({});
              }}
              onMessage={setStatusMessage}
            />
          )}
          {activeTab === "hospitals" && <HospitalsPage hospitals={hospitalsSeed} />}
          {activeTab === "appointments" && (
            <AppointmentsPage
              appointments={appointmentsSeed}
              selectedAppointmentId={selectedAppointmentId}
              onSelectAppointment={setSelectedAppointmentId}
              onMessage={setStatusMessage}
            />
          )}
          {activeTab === "payments" && <PaymentsPage payments={paymentsSeed} />}
          {activeTab === "content" && <ContentPage content={contentSeed} />}
          {activeTab === "reports" && (
            <ReportsPage
              reports={reportsSeed}
              selectedReportId={selectedReportId}
              onSelectReport={setSelectedReportId}
            />
          )}
          {activeTab === "notifications" && <NotificationsPage notifications={notificationsSeed} />}
          {activeTab === "support" && (
            <SupportPage
              tickets={supportSeed}
              selectedTicketId={selectedTicketId}
              onSelectTicket={setSelectedTicketId}
              onMessage={setStatusMessage}
            />
          )}
          {activeTab === "roles" && <RolesPage roles={rolesSeed} />}
          {activeTab === "settings" && (
            <SettingsPage settings={systemSettings} onToggleSetting={toggleSetting} />
          )}
          {activeTab === "audit" && <AuditPage logs={auditSeed} />}
        </main>
      </div>

      {toast ? (
        <div
          className={`fixed bottom-6 right-6 z-50 w-[min(92vw,22rem)] rounded-2xl border px-4 py-3 shadow-[0_18px_40px_rgba(15,23,42,0.18)] ${
            toast.tone === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-800"
              : toast.tone === "error"
                ? "border-rose-200 bg-rose-50 text-rose-800"
                : "border-slate-200 bg-white text-slate-800"
          }`}
          role="status"
          aria-live="polite"
        >
          <p className="text-sm font-semibold">{toast.message}</p>
        </div>
      ) : null}
    </main>
  );
}

function DashboardOverviewPanel({ admin, totals, onNavigate }) {
  const kpiCards = [
    { key: "users", label: "Total Patients", value: totals.patients, tone: "blue" },
    { key: "doctors", label: "Total Doctors", value: totals.doctors, tone: "emerald" },
    { key: "hospitals", label: "Hospitals", value: totals.hospitals, tone: "slate" },
    { key: "appointments", label: "Today's Appointments", value: totals.todayAppointments, tone: "amber" },
    { key: "payments", label: "Revenue", value: formatCurrency(totals.revenueCents, "BDT"), tone: "emerald" },
    { key: "doctors", label: "Pending Verifications", value: totals.pendingDoctors, tone: "amber" },
    { key: "payments", label: "Refund Requests", value: totals.pendingRefunds, tone: "blue" },
    { key: "support", label: "Support Tickets", value: totals.openTickets, tone: "slate" },
    { key: "settings", label: "Update Profile", value: "98%", tone: "emerald" },
  ];

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm lg:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-3xl space-y-4">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">
              Admin Login and Dashboard Workflow
            </p>
            <h2 className="text-3xl font-bold tracking-tight text-slate-950">Admin Dashboard</h2>
            <p className="text-sm leading-7 text-slate-600">
              Welcome back, {admin?.name ?? "Admin"}.
            </p>
            <div className="flex flex-wrap gap-2">
              <ActionChip label="Users" onClick={() => onNavigate("users")} />
              <ActionChip label="Doctors" onClick={() => onNavigate("doctors")} />
              <ActionChip label="Hospitals" onClick={() => onNavigate("hospitals")} />
              <ActionChip label="Appointments" onClick={() => onNavigate("appointments")} />
              <ActionChip label="Payments" onClick={() => onNavigate("payments")} />
              <ActionChip label="Reports" onClick={() => onNavigate("reports")} />
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3 lg:w-[28rem]">
            <QuickStat label="RBAC" value="Enabled" detail="Role based access control" />
            <QuickStat label="MFA" value="Live" detail="OTP / second factor checks" />
            <QuickStat label="Health" value={`${totals.systemHealth}%`} detail="System stability score" />
          </div>
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {kpiCards.map((card) => (
          <KpiCard
            key={card.label}
            label={card.label}
            value={card.value}
            detail={card.detail}
            tone={card.tone}
            onClick={() => onNavigate(card.key)}
          />
        ))}
      </div>

    
    </div>
  );
}

function PanelCard({ eyebrow, title, description, children }) {
  return (
    <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
      <SectionHeader eyebrow={eyebrow} title={title} description={description} />
      <div className="mt-5">{children}</div>
    </section>
  );
}

function SectionHeader({ eyebrow, title, description }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">{eyebrow}</p>
      <h2 className="mt-2 text-2xl font-bold text-slate-950">{title}</h2>
      <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">{description}</p>
    </div>
  );
}

function WorkflowStep({ index, title }) {
  return (
    <div className="flex gap-4 rounded-2xl border border-slate-100 bg-slate-50/80 p-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-950 text-sm font-bold text-white">
        {index}
      </div>
      <div className="min-w-0">
        <h3 className="text-sm font-bold text-slate-950">{title}</h3>
      </div>
    </div>
  );
}

function KpiCard({ label, value, detail, tone = "slate", onClick }) {
  const toneClasses =
    tone === "emerald"
      ? "border-emerald-100 bg-emerald-50/70 text-emerald-800"
      : tone === "amber"
        ? "border-amber-100 bg-amber-50/70 text-amber-800"
        : tone === "blue"
          ? "border-blue-100 bg-blue-50/70 text-blue-800"
          : "border-slate-200 bg-white text-slate-800";

  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-2xl border p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${toneClasses}`}
    >
      <p className="text-xl font-semibold uppercase tracking-wide text-current/70">{label}</p>
      <p className="mt-2 text-3xl font-bold text-current">{value}</p>
      <p className="mt-2 text-sm text-current/80">{detail}</p>
     </button>
  );
}

function MiniMetric({ label, value, tone = "slate" }) {
  const toneClasses =
    tone === "emerald"
      ? "bg-emerald-50 text-emerald-800"
      : tone === "amber"
        ? "bg-amber-50 text-amber-800"
        : tone === "blue"
          ? "bg-blue-50 text-blue-800"
          : "bg-slate-50 text-slate-800";

  return (
    <div className={`rounded-2xl px-4 py-3 ${toneClasses}`}>
      <p className="text-xs font-semibold uppercase tracking-wide opacity-70">
        {label}
      </p>
      <p className="mt-1 text-base font-bold">{value}</p>
    </div>
  );
}

function QuickStat({ label, value, detail }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p className="mt-2 text-xl font-bold text-slate-950">{value}</p>
      <p className="mt-1 text-xs text-slate-500">{detail}</p>
    </div>
  );
}

function ActionChip({ label, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
    >
      {label}
    </button>
  );
}
