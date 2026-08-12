"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DoctorDashboardSidebar from "../doctor_layouts/doctor-dashboard-sidebar";
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

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto grid min-h-screen max-w-7xl grid-cols-1 lg:grid-cols-[280px_1fr]">
        <DoctorDashboardSidebar
          doctor={doctor}
          activeTab="settings"
          recordCategory="diagnostics"
          onNavigateTab={handleNavigateTab}
        />

        <main className="p-4 sm:p-6 lg:p-8">{children}</main>
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
