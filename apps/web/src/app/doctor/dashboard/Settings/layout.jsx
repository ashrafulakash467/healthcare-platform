"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardHeader from "../../../Header_Sidebar-Admin-Doc-shareUi/header";
import { getStoredUser } from "@/lib/api";
import SidebarShell from "../../../Header_Sidebar-Admin-Doc-shareUi/SidebarShell";
import { doctorSidebarItems } from "../../../Header_Sidebar-Admin-Doc-shareUi/sidebar-config";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowUpRightFromSquare, faCalendarDays } from "@fortawesome/free-solid-svg-icons";
import { Icon } from "../doctor_layouts/dashboard-shared";

function renderDoctorSidebarIcon(item) {
  if (item.key === "today") {
    return <FontAwesomeIcon icon={faCalendarDays} />;
  }

  if (item.key === "visit-site") {
    return <FontAwesomeIcon icon={faArrowUpRightFromSquare} />;
  }

  return <Icon name={item.icon} className="h-5 w-5" />;
}

function isDoctorSidebarItemActive(item, activeTab) {
  if (item.key === "settings") {
    return activeTab === "settings";
  }

  return activeTab === item.key;
}

export default function SettingsLayout({ children }) {
  const router = useRouter();
  const [doctor, setDoctor] = useState(() => getStoredDoctor());

  useEffect(() => {
    function syncDoctor() {
      setDoctor(getStoredDoctor());
    }

    syncDoctor();
    window.addEventListener("auth-change", syncDoctor);

    return () => {
      window.removeEventListener("auth-change", syncDoctor);
    };
  }, []);

  function handleNavigateTab(tabKey) {
    if (tabKey === "settings") {
      router.push("/doctor/dashboard/Settings");
      return;
    }

    router.push("/doctor/dashboard");
  }

  function handleLogout() {
    localStorage.removeItem("doctorToken");
    localStorage.removeItem("doctorUser");
    document.cookie = "doctorToken=; path=/; max-age=0; SameSite=Lax";
    window.dispatchEvent(new Event("auth-change"));
    router.replace("/doctor/login");
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <DashboardHeader
        user={doctor}
        title="Doctor Dashboard"
        subtitle="Manage your profile and settings."
        roleLabel="Doctor"
        onLogout={handleLogout}
      />

      <div className="grid min-h-[calc(100vh-92px)] w-full grid-cols-1 lg:grid-cols-[320px_1fr]">
        <SidebarShell
          title="Doctor Dashboard"
          subtitle="Manage your profile and settings."
          roleLabel="Doctor"
          items={doctorSidebarItems}
          activeKey="settings"
          isItemActive={(item) => isDoctorSidebarItemActive(item, "settings")}
          renderIcon={renderDoctorSidebarIcon}
          user={doctor}
          onLogout={handleLogout}
          onItemClick={(item) => {
            if (item.key === "visit-site") {
              window.location.href = "/";
              return;
            }

            handleNavigateTab(item.key);
          }}
        />

        <main className="min-w-0 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}

function getStoredDoctor() {
  if (typeof window === "undefined") {
    return null;
  }

  return getStoredUser("doctor");
}
