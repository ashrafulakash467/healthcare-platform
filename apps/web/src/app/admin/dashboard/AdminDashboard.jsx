"use client";

import { useEffect, useMemo, useState } from "react";
import { Icon, formatCurrency } from "./admin_layouts/dashboard-shared";
import UsersPage from "./admin_layouts/users-page";
import DoctorsPage from "./admin_layouts/doctors-page";
import ReportsPage from "./admin_layouts/reports-page";
import HospitalsPage from "./admin_layouts/hospitals-page";
import AppointmentsPage from "./admin_layouts/appointments-page";
import PaymentsPage from "./admin_layouts/payments-page";
import ContentPage from "./admin_layouts/content-page";
import NotificationsPage from "./admin_layouts/notifications-page";
import SupportPage from "./admin_layouts/support-page";
import RolesPage from "./admin_layouts/roles-page";
import SettingsPage from "./admin_layouts/settings-page";
import AuditPage from "./admin_layouts/audit-page";
import { apiFetch, getStoredToken } from "@/lib/api";

const tabItems = [
  { key: "dashboard", label: "Dashboard Overview", icon: "dashboard" },
  { key: "users", label: "Users", icon: "users" },
  { key: "doctors", label: "Doctors", icon: "doctors" },
  { key: "hospitals", label: "Hospitals", icon: "hospitals" },
  { key: "appointments", label: "Appointments", icon: "appointments" },
  { key: "payments", label: "Payments", icon: "payments" },
  { key: "content", label: "Content", icon: "content" },
  { key: "reports", label: "Reports", icon: "reports" },
  { key: "notifications", label: "Notifications", icon: "notifications" },
  { key: "support", label: "Support", icon: "support" },
  { key: "roles", label: "Roles & Permissions", icon: "roles" },
  { key: "settings", label: "System Settings", icon: "settings" },
  { key: "audit", label: "Audit Logs", icon: "audit" },
];

const loginWorkflow = [
  "Admin Login",
  "Enter Email / Username",
  "Enter Password",
  "Credential Validation",
  "MFA / OTP",
  "RBAC Permission Check",
  "Admin Dashboard",
];

const dashboardWorkflow = [
  "Load KPI Widgets",
  "Review Total Patients, Doctors, Hospitals, Revenue, and Alerts",
  "Select Widget",
  "Open Related Module",
];

const enterpriseNavigation = [
  "Dashboard Overview",
  "User Management",
  "Doctor Management",
  "Hospital Management",
  "Appointment Management",
  "Payment & Finance",
  "Patient Management",
  "Reviews & Ratings",
  "CMS",
  "Notifications",
  "Reports & Analytics",
  "Support Tickets",
  "Roles & Permissions",
  "System Settings",
  "Audit Logs",
];

const kpiCards = [
  {
    key: "users",
    label: "Total Patients",
    value: "12,480",
    detail: "Registered patients across web and mobile.",
    tone: "blue",
  },
  {
    key: "doctors",
    label: "Total Doctors",
    value: "386",
    detail: "Verified doctors currently active on the platform.",
    tone: "emerald",
  },
  {
    key: "hospitals",
    label: "Hospitals",
    value: "24",
    detail: "Partner hospitals and clinic networks.",
    tone: "slate",
  },
  {
    key: "appointments",
    label: "Today's Appointments",
    value: "128",
    detail: "Bookings scheduled to be handled today.",
    tone: "amber",
  },
  {
    key: "payments",
    label: "Revenue",
    value: formatCurrency(9650000, "BDT"),
    detail: "Gross consultation revenue collected this cycle.",
    tone: "emerald",
  },
  {
    key: "doctors",
    label: "Pending Verifications",
    value: "14",
    detail: "Doctor onboarding requests waiting for review.",
    tone: "amber",
  },
  {
    key: "payments",
    label: "Refund Requests",
    value: "6",
    detail: "Payment disputes and refund cases in progress.",
    tone: "blue",
  },
  {
    key: "support",
    label: "Support Tickets",
    value: "9",
    detail: "Open tickets waiting for support attention.",
    tone: "slate",
  },
  {
    key: "settings",
    label: "System Health",
    value: "98%",
    detail: "Core services are operating normally.",
    tone: "emerald",
  },
];

const usersSeed = [
  { id: "user-1", name: "Nadia Rahman", email: "nadia@example.com", role: "Patient", status: "Active", channel: "Mobile" },
  { id: "user-2", name: "Dr. Sarah Khan", email: "sarah.khan@example.com", role: "Doctor", status: "Pending MFA", channel: "Web" },
  { id: "user-3", name: "Mizanur Rahman", email: "mizanur@example.com", role: "Hospital Admin", status: "Active", channel: "Web" },
  { id: "user-4", name: "Ayesha Sultana", email: "ayesha@example.com", role: "Support Agent", status: "Suspended", channel: "Desktop" },
];

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

export default function AdminDashboard() {
  const [admin, setAdmin] = useState(null);
  const [isReady, setIsReady] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [selectedAppointmentId, setSelectedAppointmentId] = useState(appointmentsSeed[0].id);
  const [selectedReportId, setSelectedReportId] = useState(reportsSeed[0].id);
  const [selectedTicketId, setSelectedTicketId] = useState(supportSeed[0].id);
  const [systemSettings, setSystemSettings] = useState(systemSettingsSeed);
  const [statusMessage, setStatusMessage] = useState("");
  const [doctors, setDoctors] = useState([]);
  const [doctorsLoading, setDoctorsLoading] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  useEffect(() => {
    const storedToken = localStorage.getItem("adminToken");

    if (!storedToken) {
      window.location.replace("/admin");
      return;
    }

    const storedAdmin = localStorage.getItem("adminUser");

    if (storedAdmin) {
      try {
        setAdmin(JSON.parse(storedAdmin));
      } catch {
        setAdmin({ name: "Admin", email: "admin@healthcare.com", role: "Admin" });
      }
    } else {
      setAdmin({ name: "Admin", email: "admin@healthcare.com", role: "Admin" });
    }

    setIsReady(true);
  }, []);

  async function loadDoctors() {
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
  }

  useEffect(() => {
    if (activeTab === "doctors") {
      const timer = window.setTimeout(() => {
        void loadDoctors();
      }, 0);

      return () => window.clearTimeout(timer);
    }
  }, [activeTab]);

  async function handleUpdateDoctor(doctorId, formData) {
    const token = getStoredToken("admin");
    if (!token) return;

    const hasImageFile = formData?.imageFile instanceof File;
    const isCreateMode = !doctorId;

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
      appendValue("chamber_address", formData.chamberAddress ?? "");
      appendValue("city", formData.city ?? "");
      appendValue("license_no", formData.licenseNo ?? "");
      appendValue("verification_status", formData.verificationStatus ?? "");
      appendValue("status", formData.status ?? "");
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
          setEditingDoctor(null);
          setEditForm({});
          setStatusMessage(isCreateMode ? "Doctor created successfully." : "Doctor updated successfully.");
        } else {
          setStatusMessage(result.message ?? (isCreateMode ? "Failed to create doctor." : "Failed to update doctor."));
        }
      } catch {
        setStatusMessage(isCreateMode ? "Failed to create doctor." : "Failed to update doctor.");
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
      chamber_address: formData.chamberAddress ?? null,
      city: formData.city ?? null,
      license_no: formData.licenseNo ?? null,
      verification_status: formData.verificationStatus ?? undefined,
      status: formData.status ?? undefined,
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
        setEditingDoctor(null);
        setEditForm({});
        setStatusMessage(isCreateMode ? "Doctor created successfully." : "Doctor updated successfully.");
      } else {
        setStatusMessage(result.message ?? (isCreateMode ? "Failed to create doctor." : "Failed to update doctor."));
      }
    } catch {
      setStatusMessage(isCreateMode ? "Failed to create doctor." : "Failed to update doctor.");
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
        setDeleteConfirmId(null);
        setStatusMessage("Doctor deleted successfully.");
      } else {
        setStatusMessage(result.message ?? "Failed to delete doctor.");
      }
    } catch {
      setStatusMessage("Failed to delete doctor.");
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
      chamberAddress: doctor.chamberAddress ?? "",
      city: doctor.city ?? "",
      licenseNo: doctor.licenseNo ?? "",
      verificationStatus: doctor.verificationStatus ?? "pending",
      status: doctor.status ?? "active",
      imagePath: doctor.imagePath ?? doctor.imageUrl ?? "",
      imageFile: null,
      imagePreviewUrl: doctor.imageUrl ?? doctor.imagePath ?? "",
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
      chamberAddress: "",
      city: "",
      licenseNo: "",
      verificationStatus: "pending",
      status: "active",
      imagePath: "",
      imageUrl: "",
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
      chamberAddress: "",
      city: "",
      licenseNo: "",
      verificationStatus: "pending",
      status: "active",
      imagePath: "",
      imageFile: null,
      imagePreviewUrl: "",
    });
    setActiveTab("doctors");
  }

  const totals = useMemo(() => {
    const pendingDoctors = doctorsSeed.filter((item) =>
      item.status.toLowerCase().includes("pending") || item.status.toLowerCase().includes("document"),
    ).length;
    const pendingRefunds = paymentsSeed.filter((item) => item.status.toLowerCase().includes("refund")).length;
    const openTickets = supportSeed.filter((item) => item.status === "Open").length;

    return {
      patients: 12480,
      doctors: 386,
      hospitals: hospitalsSeed.length,
      todayAppointments: appointmentsSeed.length,
      revenueCents: 9650000,
      pendingDoctors,
      pendingRefunds,
      openTickets,
      systemHealth: systemSettings.maintenanceMode ? 71 : 98,
    };
  }, [systemSettings.maintenanceMode]);

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
    window.location.replace("/admin");
  }

  function openModule(tabKey, message) {
    setActiveTab(tabKey);
    if (message) {
      setStatusMessage(message);
    }
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
      <div className="mx-auto flex min-h-screen w-full max-w-[1600px] bg-slate-50 text-slate-900">
        <aside className="sticky top-0 flex h-screen w-72 shrink-0 flex-col border-r border-slate-200 bg-white">
          <div className="flex h-20 items-center border-b border-slate-100 px-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Admin Portal</p>
              <h1 className="text-xl font-bold text-slate-950">Healthcare</h1>
            </div>
          </div>

          <nav className="flex-1 space-y-1 overflow-y-auto p-4">
            {tabItems.map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => setActiveTab(item.key)}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold transition ${
                  activeTab === item.key
                    ? "bg-slate-950 text-white shadow-[0_10px_20px_rgba(15,23,42,0.18)]"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
                }`}
              >
                <Icon name={item.icon} className="h-5 w-5 shrink-0" />
                <span>{item.label}</span>
              </button>
            ))}
          </nav>

          <div className="border-t border-slate-100 p-4">
            <div className="rounded-2xl bg-slate-950 p-4 text-white">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-300">Signed in as</p>
              <p className="mt-2 text-sm font-bold">{admin?.name ?? "Admin"}</p>
              <p className="text-xs text-slate-300">{admin?.email ?? "admin@healthcare.com"}</p>
              <button
                type="button"
                onClick={handleLogout}
                className="mt-4 inline-flex items-center gap-2 rounded-lg bg-white/10 px-3 py-2 text-xs font-semibold text-white transition hover:bg-white/15"
              >
                <Icon name="logout" className="h-4 w-4" />
                Sign out
              </button>
            </div>
          </div>
        </aside>

        <main className="flex-1 overflow-y-auto px-6 py-8 lg:px-8">
          {statusMessage ? (
            <p className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              {statusMessage}
            </p>
          ) : null}

          {activeTab === "dashboard" && (
            <DashboardOverviewPanel admin={admin} totals={totals} onNavigate={openModule} />
          )}
          {activeTab === "users" && <UsersPage users={usersSeed} />}
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
    </main>
  );
}

function DashboardOverviewPanel({ admin, totals, onNavigate }) {
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
              Welcome back, {admin?.name ?? "Admin"}. This enterprise control panel follows the workflow from login and MFA through RBAC and module management.
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

      <div className="grid gap-6 xl:grid-cols-[1fr_0.95fr]">
        <PanelCard eyebrow="Workflow" title="Admin Login Workflow" description="This is the intended sign-in path before the admin reaches the dashboard.">
          <div className="mt-4 space-y-3">
            {loginWorkflow.map((step, index) => (
              <WorkflowStep key={step} index={index + 1} title={step} />
            ))}
          </div>
        </PanelCard>

        <PanelCard eyebrow="Navigation" title="Main Dashboard Navigation" description="The modules exposed from the sidebar and overview shortcuts.">
          <div className="mt-4 flex flex-wrap gap-2">
            {enterpriseNavigation.map((item) => (
              <span key={item} className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-600">
                {item}
              </span>
            ))}
          </div>
        </PanelCard>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <PanelCard eyebrow="Overview" title="Dashboard Overview Workflow" description="Load widgets, review KPIs, then open the related module.">
          <div className="mt-4 space-y-3">
            {dashboardWorkflow.map((step, index) => (
              <WorkflowStep key={step} index={index + 1} title={step} />
            ))}
          </div>
        </PanelCard>

        <PanelCard eyebrow="Health" title="Operational Snapshot" description="These quick status cards summarize the live admin queue.">
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <MiniMetric label="Patients" value={totals.patients} tone="blue" />
            <MiniMetric label="Doctors" value={totals.doctors} tone="emerald" />
            <MiniMetric label="Hospitals" value={totals.hospitals} tone="slate" />
            <MiniMetric label="Today" value={totals.todayAppointments} tone="amber" />
            <MiniMetric label="Pending Doctors" value={totals.pendingDoctors} tone="amber" />
            <MiniMetric label="Open Tickets" value={totals.openTickets} tone="blue" />
          </div>
        </PanelCard>
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
      <p className="text-xs font-semibold uppercase tracking-wide text-current/70">{label}</p>
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
