"use client";

import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCalendarDays,
  faArrowUpRightFromSquare, } from "@fortawesome/free-solid-svg-icons";
import { Icon } from "../doctor_layouts/dashboard-shared";

const tabItems = [
  { key: "dashboard", label: "Dashboard", icon: "dashboard" },
  { key: "visit-site", label: "Visit Site", icon: "Visit Site" },
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

      {!sidebarCollapsed && (
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {tabItems.map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() =>  {
                if (item.key === "visit-site") {
                    window.location.href = "http://localhost:3000";
                    return;
                } onNavigateTab?.(item.key);
              }}
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
                ) : item.key === "visit-site" ? (
                    <FontAwesomeIcon icon={faArrowUpRightFromSquare} />
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
