"use client";

import { useState } from "react";

export default function SidebarShell({
  title,
  subtitle,
  roleLabel,
  items = [],
  activeKey,
  onItemClick,
  isItemActive,
  renderIcon,
  user,
  onLogout,
  className = "",
}) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  function getIsActive(item) {
    if (typeof isItemActive === "function") {
      return Boolean(isItemActive(item));
    }

    return item.key === activeKey;
  }

  function getInitial() {
    const source = user?.name || roleLabel || "U";
    return source.trim().charAt(0).toUpperCase();
  }

  return (
    <aside
      className={[
        "flex w-full shrink-0 flex-col border-b border-slate-200 bg-white/95 px-4 py-4 shadow-[0_12px_40px_rgba(15,23,42,0.06)] backdrop-blur transition-all duration-300 lg:sticky lg:top-0 lg:h-screen lg:border-b-0 lg:border-r lg:px-4 lg:py-4",
        isCollapsed ? "lg:w-24" : "lg:w-80",
        className,
      ].join(" ")}
    >

      <nav className="flex-1 overflow-y-auto px-0 py-0">
        <div className="space-y-1">
          {items.map((item) => {
            const active = getIsActive(item);

            return (
              <button
                key={item.key}
                type="button"
                onClick={() => onItemClick?.(item)}
                title={isCollapsed ? item.label : undefined}
                className={[
                  "group flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-semibold transition",
                  active
                    ? "bg-slate-950 text-white shadow-lg shadow-slate-950/10"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-950",
                ].join(" ")}
              >
                <span
                  className={[
                    "flex h-9 w-9 flex-none items-center justify-center rounded-xl transition",
                    active
                      ? "bg-white/10 text-white"
                      : "bg-slate-50 text-slate-500 group-hover:bg-white group-hover:text-slate-900",
                  ].join(" ")}
                >
                  {renderIcon ? renderIcon(item, active) : null}
                </span>

                {!isCollapsed ? <span className="truncate">{item.label}</span> : null}
              </button>
            );
          })}
        </div>
      </nav>

      {user || onLogout ? (
        <div className="border-t border-slate-100 pt-4">
          {!isCollapsed ? (
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                {roleLabel ?? "Signed in as"}
              </p>
              <div className="mt-3 flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 font-bold text-white">
                  {getInitial()}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-slate-950">
                    {user?.name ?? roleLabel ?? "Team member"}
                  </p>
                  <p className="truncate text-xs text-slate-500">
                    {user?.email ?? "No email available"}
                  </p>
                </div>
              </div>

              {onLogout ? (
                <button
                  type="button"
                  onClick={onLogout}
                  className="mt-4 inline-flex w-full items-center justify-center rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
                >
                  Sign out
                </button>
              ) : null}
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 font-bold text-white">
                {getInitial()}
              </div>
              {onLogout ? (
                <button
                  type="button"
                  onClick={onLogout}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
                  aria-label="Sign out"
                  title="Sign out"
                >
                  X
                </button>
              ) : null}
            </div>
          )}
        </div>
      ) : null}
    </aside>
  );
}
