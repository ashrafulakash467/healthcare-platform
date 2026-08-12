"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCalendarDays } from "@fortawesome/free-solid-svg-icons";
import { Icon } from "./dashboard-shared";

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
  { key: "settings", label: "Settings", icon: "settings" },
];

export default function DoctorDashboardSidebar({
  doctor,
  activeTab = "dashboard",
  recordCategory = "diagnostics",
  onNavigateTab,
}) {
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

  return (
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
              onClick={() => onNavigateTab?.(item.key)}
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
  );
}
