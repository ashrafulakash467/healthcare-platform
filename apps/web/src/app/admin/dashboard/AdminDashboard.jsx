"use client";

import { useEffect, useMemo, useState } from "react";
import { Icon, formatCurrency } from "./admin_layouts/dashboard-shared";

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
  const [doctorDecisions, setDoctorDecisions] = useState({});
  const [doctorRejectionReasons, setDoctorRejectionReasons] = useState({});
  const [selectedDoctorId, setSelectedDoctorId] = useState(doctorsSeed[0].id);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState(appointmentsSeed[0].id);
  const [selectedReportId, setSelectedReportId] = useState(reportsSeed[0].id);
  const [selectedTicketId, setSelectedTicketId] = useState(supportSeed[0].id);
  const [systemSettings, setSystemSettings] = useState(systemSettingsSeed);
  const [statusMessage, setStatusMessage] = useState("");

  useEffect(() => {
    const storedToken = localStorage.getItem("adminToken");
    const storedAdmin = localStorage.getItem("adminUser");

    if (!storedToken) {
      window.location.replace("/admin");
      return;
    }

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
          {activeTab === "users" && <UsersPanel users={usersSeed} />}
          {activeTab === "doctors" && (
            <DoctorsPanel
              doctors={doctorsSeed}
              selectedDoctorId={selectedDoctorId}
              onSelectDoctor={setSelectedDoctorId}
              decisions={doctorDecisions}
              rejectionReasons={doctorRejectionReasons}
              onSetDecision={setDoctorDecisions}
              onSetRejectionReasons={setDoctorRejectionReasons}
              onMessage={setStatusMessage}
            />
          )}
          {activeTab === "hospitals" && <HospitalsPanel hospitals={hospitalsSeed} />}
          {activeTab === "appointments" && (
            <AppointmentsPanel
              appointments={appointmentsSeed}
              selectedAppointmentId={selectedAppointmentId}
              onSelectAppointment={setSelectedAppointmentId}
              onMessage={setStatusMessage}
            />
          )}
          {activeTab === "payments" && <PaymentsPanel payments={paymentsSeed} />}
          {activeTab === "content" && <ContentPanel content={contentSeed} />}
          {activeTab === "reports" && (
            <ReportsPanel
              reports={reportsSeed}
              selectedReportId={selectedReportId}
              onSelectReport={setSelectedReportId}
            />
          )}
          {activeTab === "notifications" && <NotificationsPanel notifications={notificationsSeed} />}
          {activeTab === "support" && (
            <SupportPanel
              tickets={supportSeed}
              selectedTicketId={selectedTicketId}
              onSelectTicket={setSelectedTicketId}
              onMessage={setStatusMessage}
            />
          )}
          {activeTab === "roles" && <RolesPanel roles={rolesSeed} />}
          {activeTab === "settings" && (
            <SettingsPanel settings={systemSettings} onToggleSetting={toggleSetting} />
          )}
          {activeTab === "audit" && <AuditPanel logs={auditSeed} />}
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

function UsersPanel({ users }) {
  return (
    <PanelCard eyebrow="User Management" title="Users" description="Monitor patients, doctors, hospital admins, and support roles.">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {users.map((user) => (
          <div key={user.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-base font-bold text-slate-950">{user.name}</p>
                <p className="mt-1 text-sm text-slate-500">{user.email}</p>
              </div>
              <Badge tone={user.status}>{user.status}</Badge>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <Tag>{user.role}</Tag>
              <Tag>{user.channel}</Tag>
            </div>
          </div>
        ))}
      </div>
    </PanelCard>
  );
}

function DoctorsPanel({
  doctors,
  selectedDoctorId,
  onSelectDoctor,
  decisions,
  rejectionReasons,
  onSetDecision,
  onSetRejectionReasons,
  onMessage,
}) {
  const selectedDoctor = doctors.find((doctor) => doctor.id === selectedDoctorId) ?? doctors[0];
  const selectedDoctorStatus = decisions[selectedDoctor?.id] ?? selectedDoctor?.status ?? "Waiting";

  function approveDoctor(doctorId) {
    onSetDecision((current) => ({ ...current, [doctorId]: "Approved" }));
    onMessage("Doctor verification approved.");
  }

  function rejectDoctor(doctorId) {
    const reason = (rejectionReasons[doctorId] ?? "").trim();
    if (!reason) {
      onMessage("Add a rejection reason before rejecting.");
      return;
    }

    onSetDecision((current) => ({ ...current, [doctorId]: "Rejected" }));
    onMessage("Doctor verification rejected.");
  }

  return (
    <PanelCard eyebrow="Doctor Management" title="Doctor Verification Queue" description="Review onboarding records, approve qualified doctors, or reject applications with a reason.">
      <div className="grid gap-6 xl:grid-cols-[1fr_0.95fr]">
        <section className="space-y-3">
          {doctors.map((doctor) => (
            <button
              key={doctor.id}
              type="button"
              onClick={() => onSelectDoctor(doctor.id)}
              className={`w-full rounded-2xl border p-5 text-left transition ${
                selectedDoctor?.id === doctor.id
                  ? "border-slate-950 bg-slate-950 text-white"
                  : "border-slate-200 bg-white hover:bg-slate-50"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-base font-bold">{doctor.name}</p>
                  <p className="mt-1 text-sm opacity-80">{doctor.specialty} - {doctor.hospital}</p>
                </div>
                <Badge tone={doctor.status}>{decisions[doctor.id] ?? doctor.status}</Badge>
              </div>
              <p className="mt-3 text-sm opacity-80">{doctor.notes}</p>
            </button>
          ))}
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Selected Doctor</p>
              <h3 className="mt-2 text-xl font-bold text-slate-950">{selectedDoctor?.name}</h3>
            </div>
            <Badge tone={selectedDoctorStatus}>{selectedDoctorStatus}</Badge>
          </div>

          <div className="mt-5 grid gap-3 text-sm text-slate-600">
            <InfoRow label="Specialty" value={selectedDoctor?.specialty} />
            <InfoRow label="Hospital" value={selectedDoctor?.hospital} />
            <InfoRow label="License" value={selectedDoctor?.license} />
            <InfoRow label="Decision" value={decisions[selectedDoctor?.id] ?? "Waiting"} />
          </div>

          <label className="mt-5 block">
            <span className="text-sm font-semibold text-slate-700">Rejection reason</span>
            <textarea
              rows={4}
              value={rejectionReasons[selectedDoctor?.id] ?? ""}
              onChange={(event) =>
                onSetRejectionReasons((current) => ({
                  ...current,
                  [selectedDoctor.id]: event.target.value,
                }))
              }
              placeholder="Add the exact reason before rejecting"
              className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-slate-400"
            />
          </label>

          <div className="mt-5 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => approveDoctor(selectedDoctor.id)}
              className="rounded-xl bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Approve
            </button>
            <button
              type="button"
              onClick={() => rejectDoctor(selectedDoctor.id)}
              className="rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-100"
            >
              Reject
            </button>
          </div>
        </section>
      </div>
    </PanelCard>
  );
}

function HospitalsPanel({ hospitals }) {
  return (
    <PanelCard eyebrow="Hospital Management" title="Hospitals" description="Track onboarding status, location coverage, and operational size.">
      <div className="grid gap-4 lg:grid-cols-3">
        {hospitals.map((hospital) => (
          <div key={hospital.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-base font-bold text-slate-950">{hospital.name}</p>
                <p className="mt-1 text-sm text-slate-500">{hospital.city}</p>
              </div>
              <Badge tone={hospital.status}>{hospital.status}</Badge>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <MiniMetric label="Doctors" value={hospital.doctors} tone="emerald" />
              <MiniMetric label="Beds" value={hospital.beds} tone="blue" />
            </div>
          </div>
        ))}
      </div>
    </PanelCard>
  );
}

function AppointmentsPanel({ appointments, selectedAppointmentId, onSelectAppointment, onMessage }) {
  const selectedAppointment = appointments.find((appointment) => appointment.id === selectedAppointmentId) ?? appointments[0];

  return (
    <PanelCard eyebrow="Appointment Management" title="Appointments" description="Open bookings, review details, and process accept, reject, or reschedule actions.">
      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <section className="space-y-3">
          {appointments.map((appointment) => (
            <button
              key={appointment.id}
              type="button"
              onClick={() => onSelectAppointment(appointment.id)}
              className={`w-full rounded-2xl border p-5 text-left transition ${
                selectedAppointment?.id === appointment.id
                  ? "border-slate-950 bg-slate-950 text-white"
                  : "border-slate-200 bg-white hover:bg-slate-50"
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-base font-bold">{appointment.patient}</p>
                <Badge tone={appointment.status}>{appointment.status}</Badge>
              </div>
              <p className="mt-2 text-sm opacity-80">{appointment.doctor} - {appointment.type}</p>
              <p className="mt-1 text-sm opacity-80">{appointment.time} - Payment {appointment.payment}</p>
            </button>
          ))}
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <SectionHeader
            eyebrow="Open Appointment"
            title={selectedAppointment?.patient ?? "Select appointment"}
            description="Review the selected appointment and move it through the workflow."
          />

          {selectedAppointment ? (
            <>
              <div className="mt-5 grid gap-3 text-sm text-slate-600">
                <InfoRow label="Doctor" value={selectedAppointment.doctor} />
                <InfoRow label="Time" value={selectedAppointment.time} />
                <InfoRow label="Type" value={selectedAppointment.type} />
                <InfoRow label="Payment" value={selectedAppointment.payment} />
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => onMessage("Patient details reviewed.")}
                  className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Review Patient Details
                </button>
                <button
                  type="button"
                  onClick={() => onMessage("Appointment accepted.")}
                  className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700"
                >
                  Accept
                </button>
                <button
                  type="button"
                  onClick={() => onMessage("Appointment rejected.")}
                  className="rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-100"
                >
                  Reject
                </button>
                <button
                  type="button"
                  onClick={() => onMessage("Appointment moved to reschedule queue.")}
                  className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-700 transition hover:bg-amber-100"
                >
                  Reschedule
                </button>
              </div>
            </>
          ) : null}
        </section>
      </div>
    </PanelCard>
  );
}

function PaymentsPanel({ payments }) {
  const totalRevenue = payments
    .filter((payment) => payment.status === "Paid" || payment.status === "Settled")
    .reduce((sum, payment) => sum + payment.amountCents, 0);

  return (
    <PanelCard eyebrow="Payment & Finance" title="Payments" description="Track revenue, refunds, and settlement batches.">
      <div className="grid gap-4 md:grid-cols-3">
        <MiniMetric label="Revenue" value={formatCurrency(totalRevenue, "BDT")} tone="emerald" />
        <MiniMetric label="Refund Queue" value={payments.filter((item) => item.status.includes("Refund")).length} tone="amber" />
        <MiniMetric label="Settlement Batches" value={payments.filter((item) => item.status === "Settled").length} tone="blue" />
      </div>

      <div className="mt-6 space-y-3">
        {payments.map((payment) => (
          <div key={payment.id} className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-bold text-slate-950">{payment.reference}</p>
              <p className="mt-1 text-sm text-slate-500">{payment.note}</p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <p className="text-base font-bold text-slate-950">{formatCurrency(payment.amountCents, "BDT")}</p>
              <Badge tone={payment.status}>{payment.status}</Badge>
            </div>
          </div>
        ))}
      </div>
    </PanelCard>
  );
}

function ContentPanel({ content }) {
  return (
    <PanelCard eyebrow="CMS" title="Content" description="Manage marketing pages, help docs, and onboarding content.">
      <div className="grid gap-4 md:grid-cols-3">
        {content.map((item) => (
          <div key={item.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-base font-bold text-slate-950">{item.title}</p>
            <p className="mt-2 text-sm text-slate-500">Owner: {item.owner}</p>
            <div className="mt-4 flex items-center justify-between gap-3">
              <Badge tone={item.status}>{item.status}</Badge>
              <button type="button" className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50">
                Edit
              </button>
            </div>
          </div>
        ))}
      </div>
    </PanelCard>
  );
}

function ReportsPanel({ reports, selectedReportId, onSelectReport }) {
  const selectedReport = reports.find((report) => report.id === selectedReportId) ?? reports[0];

  return (
    <PanelCard eyebrow="Reports & Analytics" title="Reports" description="View high level exports and analytics deliverables.">
      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <section className="space-y-3">
          {reports.map((report) => (
            <button
              key={report.id}
              type="button"
              onClick={() => onSelectReport(report.id)}
              className={`w-full rounded-2xl border p-5 text-left transition ${
                selectedReport?.id === report.id
                  ? "border-slate-950 bg-slate-950 text-white"
                  : "border-slate-200 bg-white hover:bg-slate-50"
              }`}
            >
              <p className="text-base font-bold">{report.title}</p>
              <p className="mt-1 text-sm opacity-80">Owner: {report.owner}</p>
              <p className="mt-3 text-sm opacity-80">Status: {report.status}</p>
            </button>
          ))}
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <SectionHeader
            eyebrow="Selected Report"
            title={selectedReport?.title ?? "Select report"}
            description="Use the report workspace to prepare downloads and exports."
          />
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <MiniMetric label="Owner" value={selectedReport?.owner ?? "-"} tone="blue" />
            <MiniMetric label="Status" value={selectedReport?.status ?? "-"} tone="emerald" />
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            <button type="button" className="rounded-xl bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800">
              Download
            </button>
            <button type="button" className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
              Share
            </button>
          </div>
        </section>
      </div>
    </PanelCard>
  );
}

function NotificationsPanel({ notifications }) {
  return (
    <PanelCard eyebrow="Notifications" title="Notifications" description="Broadcasts, reminders, and system messages.">
      <div className="space-y-3">
        {notifications.map((item) => (
          <article key={item.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-bold text-slate-950">{item.title}</p>
            <p className="mt-1 text-sm text-slate-500">{item.message}</p>
          </article>
        ))}
      </div>
    </PanelCard>
  );
}

function SupportPanel({ tickets, selectedTicketId, onSelectTicket, onMessage }) {
  const selectedTicket = tickets.find((ticket) => ticket.id === selectedTicketId) ?? tickets[0];

  return (
    <PanelCard eyebrow="Support" title="Support Tickets" description="Handle urgent issues, follow-ups, and customer support requests.">
      <div className="grid gap-6 xl:grid-cols-[1fr_0.95fr]">
        <section className="space-y-3">
          {tickets.map((ticket) => (
            <button
              key={ticket.id}
              type="button"
              onClick={() => onSelectTicket(ticket.id)}
              className={`w-full rounded-2xl border p-5 text-left transition ${
                selectedTicket?.id === ticket.id
                  ? "border-slate-950 bg-slate-950 text-white"
                  : "border-slate-200 bg-white hover:bg-slate-50"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-base font-bold">{ticket.subject}</p>
                  <p className="mt-1 text-sm opacity-80">{ticket.requester}</p>
                </div>
                <Badge tone={ticket.priority}>{ticket.priority}</Badge>
              </div>
              <p className="mt-3 text-sm opacity-80">Status: {ticket.status}</p>
            </button>
          ))}
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <SectionHeader
            eyebrow="Ticket Detail"
            title={selectedTicket?.subject ?? "Select a ticket"}
            description="Read the issue and respond with support actions."
          />
          {selectedTicket ? (
            <>
              <div className="mt-5 grid gap-3 text-sm text-slate-600">
                <InfoRow label="Requester" value={selectedTicket.requester} />
                <InfoRow label="Priority" value={selectedTicket.priority} />
                <InfoRow label="Status" value={selectedTicket.status} />
              </div>
              <div className="mt-5 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => onMessage("Support ticket marked in progress.")}
                  className="rounded-xl bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
                >
                  Mark In Progress
                </button>
                <button
                  type="button"
                  onClick={() => onMessage("Reply drafted for support ticket.")}
                  className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Draft Reply
                </button>
              </div>
            </>
          ) : null}
        </section>
      </div>
    </PanelCard>
  );
}

function RolesPanel({ roles }) {
  return (
    <PanelCard eyebrow="Roles & Permissions" title="Roles" description="RBAC groups and allowed actions for each admin role.">
      <div className="grid gap-4 lg:grid-cols-2">
        {roles.map((item) => (
          <div key={item.role} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-base font-bold text-slate-950">{item.role}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {item.permissions.map((permission) => (
                <Tag key={permission}>{permission}</Tag>
              ))}
            </div>
          </div>
        ))}
      </div>
    </PanelCard>
  );
}

function SettingsPanel({ settings, onToggleSetting }) {
  return (
    <PanelCard eyebrow="System Settings" title="Settings" description="Turn platform controls on or off and keep security policies in sync.">
      <div className="grid gap-4 lg:grid-cols-2">
        <ToggleCard
          title="MFA Enforcement"
          detail="Require OTP or a second factor for all admin logins."
          enabled={settings.mfaEnabled}
          onToggle={() => onToggleSetting("mfaEnabled")}
        />
        <ToggleCard
          title="Doctor Auto Review"
          detail="Automatically approve doctors that pass policy checks."
          enabled={settings.doctorAutoReview}
          onToggle={() => onToggleSetting("doctorAutoReview")}
        />
        <ToggleCard
          title="Patient Signup"
          detail="Allow new patients to register from the public portal."
          enabled={settings.patientSignupOpen}
          onToggle={() => onToggleSetting("patientSignupOpen")}
        />
        <ToggleCard
          title="Maintenance Mode"
          detail="Temporarily pause public access for planned maintenance."
          enabled={settings.maintenanceMode}
          onToggle={() => onToggleSetting("maintenanceMode")}
        />
      </div>
    </PanelCard>
  );
}

function AuditPanel({ logs }) {
  return (
    <PanelCard eyebrow="Audit Logs" title="Audit Trail" description="Track critical actions taken across the admin portal.">
      <div className="space-y-3">
        {logs.map((entry) => (
          <div key={entry.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-bold text-slate-950">{entry.action}</p>
                <p className="mt-1 text-sm text-slate-500">Actor: {entry.actor}</p>
              </div>
              <Tag>{entry.time}</Tag>
            </div>
          </div>
        ))}
      </div>
    </PanelCard>
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
      <p className="text-xs font-semibold uppercase tracking-wide opacity-70">{label}</p>
      <p className="mt-1 text-base font-bold">{value}</p>
    </div>
  );
}

function QuickStat({ label, value, detail }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
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

function Tag({ children }) {
  return (
    <span className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-600">
      {children}
    </span>
  );
}

function Badge({ children, tone }) {
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide ${badgeTone(tone)}`}>{children}</span>;
}

function ToggleCard({ title, detail, enabled, onToggle }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-base font-bold text-slate-950">{title}</p>
          <p className="mt-1 text-sm text-slate-500">{detail}</p>
        </div>
        <button
          type="button"
          onClick={onToggle}
          className={`rounded-full px-3 py-1.5 text-xs font-semibold ${enabled ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"}`}
        >
          {enabled ? "Enabled" : "Disabled"}
        </button>
      </div>
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-xl bg-slate-50 px-4 py-3">
      <span className="text-slate-500">{label}</span>
      <span className="text-right font-semibold text-slate-900">{value}</span>
    </div>
  );
}

function badgeTone(value) {
  const text = String(value ?? "").toLowerCase();
  if (text.includes("approved") || text.includes("paid") || text.includes("settled") || text.includes("active") || text.includes("onboarded") || text.includes("ready")) {
    return "bg-emerald-50 text-emerald-700";
  }
  if (text.includes("pending") || text.includes("review") || text.includes("refund") || text.includes("otp") || text.includes("high")) {
    return "bg-amber-50 text-amber-700";
  }
  if (text.includes("reject") || text.includes("suspend")) {
    return "bg-red-50 text-red-700";
  }
  if (text.includes("open") || text.includes("draft")) {
    return "bg-blue-50 text-blue-700";
  }
  return "bg-slate-100 text-slate-700";
}
