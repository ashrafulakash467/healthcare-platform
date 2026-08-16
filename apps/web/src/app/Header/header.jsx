"use client";

import { useEffect, useRef, useState } from "react";

export default function DashboardHeader({
  user,
  title,
  subtitle,
  roleLabel,
  onLogout,
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const displayName = user?.name || roleLabel || "User";
  const displayEmail = user?.email || "";
  const avatarSrc = user?.avatar || user?.image || "";
  const avatarFallback = displayName?.charAt(0)?.toUpperCase() || "U";

  function handleLogoutClick() {
    setMenuOpen(false);
    onLogout?.();
  }

  return (
<header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
  <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">

    {/* Left: Doctor Dashboard Info */}
    <div className="min-w-0">
      <div className="rounded-2xl bg-slate-50 px-4 py-3">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
          Doctor
        </p>

        <h1 className="truncate text-xl font-bold text-slate-950">
          Doctor Dashboard
        </h1>

        <p className="truncate text-sm text-slate-500">
          Welcome back.
        </p>
      </div>
    </div>

    {/* Right: Hamburger + Profile */}

      {/* 3 Line Button */}
      <button
        type="button"
        onClick={() => setSidebarOpen((prev) => !prev)}
        className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:bg-slate-50"
      >
        <span className="flex flex-col gap-1.5">
          <span className="block h-0.5 w-5 rounded bg-current" />
          <span className="block h-0.5 w-5 rounded bg-current" />
          <span className="block h-0.5 w-5 rounded bg-current" />
        </span>
      </button>

      {/* Profile */}
      <div className="relative" ref={menuRef}>
        <button
          type="button"
          onClick={() => setMenuOpen((prev) => !prev)}
          className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-left shadow-sm transition hover:bg-slate-50"
        >
          <span className="h-11 w-11 overflow-hidden rounded-full bg-emerald-100">
            {avatarSrc ? (
              <img
                src={avatarSrc}
                alt={displayName}
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="flex h-full w-full items-center justify-center bg-slate-900 text-sm font-bold text-white">
                {avatarFallback}
              </span>
            )}
          </span>

          <span className="hidden min-w-0 sm:block">
            <span className="block truncate text-sm font-semibold text-slate-950">
              {displayName}
            </span>

            <span className="block truncate text-xs text-slate-500">
              {displayEmail || "Doctor"}
            </span>
          </span>
        </button>

        {/* Profile Dropdown */}
        {menuOpen ? (
          <div className="absolute right-0 top-full mt-2 w-56 rounded-2xl border border-slate-200 bg-white p-2 shadow-lg">
            <div className="px-3 py-2">
              <p className="text-sm font-semibold text-slate-950">
                {displayName}
              </p>

              <p className="truncate text-xs text-slate-500">
                {displayEmail || "Doctor"}
              </p>
            </div>

            <button
              type="button"
              onClick={handleLogoutClick}
              className="flex w-full items-center rounded-xl px-3 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50"
            >
              Logout
            </button>
          </div>
        ) : null}
      </div>

  </div>
</header>
  );
}
