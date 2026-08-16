"use client";

import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCalendarDays } from "@fortawesome/free-solid-svg-icons";
import { Icon } from "../doctor_layouts/dashboard-shared";

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
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  function getTabActiveState(tabKey) {
    if (tabKey === "records") {
      return activeTab === "records" && recordCategory !== "prescriptions";
    }

    if (tabKey === "prescriptions") {
      return activeTab === "records" && recordCategory === "prescriptions";
    }

    return activeTab === tabKey;
  }

  return (
    <aside
      className="flex w-full flex-col border-b border-slate-200 bg-white/95 shadow-[0_12px_40px_rgba(15,23,42,0.06)] backdrop-blur transition-all duration-300 lg:sticky lg:top-0 lg:h-screen lg:w-80 lg:border-b-0 lg:border-r"
    >
      <div
        className={`border-b border-slate-100 p-4 ${
          sidebarCollapsed ? "pb-4" : ""
        }`}
      >
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <div className="h-11 w-11 shrink-0 overflow-hidden rounded-2xl bg-emerald-100">
              <img
                src={doctor?.avatar || doctor?.image || "/images/default-doctor.png"}
                alt={doctor?.name || "Doctor"}
                className="h-full w-full object-cover"
              />
            </div>

            <div className="min-w-0">
              <div
                className={`rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50 to-white ${
                  sidebarCollapsed ? "p-2" : "p-3"
                }`}
              >
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-700">
                  Active profile
                </p>
                <p className="mt-1 truncate text-sm font-bold text-slate-950">
                  Dr. {doctor?.name || "Unavailable"}
                </p>
                <p className="truncate text-xs text-slate-500">
                  {doctor?.specialty || "Doctor"}
                </p>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setSidebarCollapsed((prev) => !prev)}
            aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl hover:bg-emerald-50"
          >
            <span className="flex flex-col gap-1">
              <span className="h-0.5 w-5 rounded-full bg-slate-600" />
              <span className="h-0.5 w-5 rounded-full bg-slate-600" />
              <span className="h-0.5 w-5 rounded-full bg-slate-600" />
            </span>
          </button>
        </div>
      </div>

      {!sidebarCollapsed && (
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {tabItems.map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => onNavigateTab?.(item.key)}
              className={`group flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-semibold transition ${
                getTabActiveState(item.key)
                  ? "bg-slate-950 text-white shadow-lg shadow-slate-950/10"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
              }`}
            >
              <span
                className={`flex h-9 w-9 flex-none items-center justify-center rounded-xl transition ${
                  getTabActiveState(item.key)
                    ? "bg-white/10 text-white"
                    : "bg-slate-50 text-slate-500 group-hover:bg-white group-hover:text-slate-900"
                }`}
              >
                {item.key === "today" ? (
                  <FontAwesomeIcon icon={faCalendarDays} />
                ) : (
                  <Icon name={item.icon} className="h-5 w-5" />
                )}
              </span>

              <span className="truncate">{item.label}</span>
            </button>
          ))}
        </nav>
      )}

      {!sidebarCollapsed && (
        <div className="border-t border-slate-100 p-4">
          <div className="flex items-center gap-3 rounded-2xl bg-slate-50 px-3 py-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-900 font-bold text-white">
              {doctor?.name?.charAt(0) || "D"}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-slate-950">
                {doctor?.name || "Doctor"}
              </p>
              <p className="truncate text-xs text-slate-500">
                {doctor?.email || "No email available"}
              </p>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
