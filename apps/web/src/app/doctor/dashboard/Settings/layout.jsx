"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardHeader from "../../../Header/header";
import DoctorDashboardSidebar from "../sidebar/sidebar";
import { getStoredUser } from "@/lib/api";

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

      <div className="mx-auto grid min-h-[calc(100vh-92px)] max-w-7xl grid-cols-1 lg:grid-cols-[320px_1fr]">
        <DoctorDashboardSidebar
          doctor={doctor}
          activeTab="settings"
          recordCategory="diagnostics"
          onNavigateTab={handleNavigateTab}
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
