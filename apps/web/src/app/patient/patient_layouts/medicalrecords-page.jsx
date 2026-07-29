"use client";

import { useEffect, useRef, useState } from "react";
import { Icon } from "./dashboard-shared";

export default function MedicalRecordsPage({
  records,
  recordCategory,
  setRecordCategory,
}) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const categories = [
    { key: "prescriptions", label: "Prescriptions" },
    { key: "diagnostics", label: "Diagnostic Reports" },
    { key: "notes", label: "Appointment Notes" },
    { key: "uploads", label: "Uploaded Documents" },
    { key: "invoices", label: "Invoices" },
  ];

  const currentRecords = records[recordCategory] || [];

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    }

    function handleEscape(event) {
      if (event.key === "Escape") {
        setIsMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-col justify-between gap-4 border-b border-slate-200 pb-5 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Medical Records</h1>
          <p className="mt-0.5 text-sm text-slate-500">
            View, download, share, or upload clinical documentation.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-slate-800">
            <Icon name="upload" className="h-4 w-4" />
            Upload Document
          </button>

          
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        {currentRecords.length === 0 ? (
          <p className="py-8 text-center text-sm text-slate-500">
            No records available in this category.
          </p>
        ) : (
          <div className="divide-y divide-slate-100">
            {currentRecords.map((item) => (
              <div
                key={item.id}
                className="flex flex-col justify-between gap-4 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-center"
              >
                <div>
                  <h4 className="text-sm font-bold text-slate-900">
                    {item.title}
                  </h4>
                  <p className="mt-0.5 text-xs text-slate-500">
                    {item.doctor ||
                      item.facility ||
                      item.amount ||
                      "System Record"}{" "}
                    - {item.date}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    title="View Record"
                    className="inline-flex items-center gap-1 rounded-md border border-slate-200 px-2.5 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-green-500"
                  >
                    <Icon name="eye" className="h-3.5 w-3.5" />
                    View
                  </button>
                  <button
                    title="Download"
                    className="inline-flex items-center gap-1 rounded-md border border-slate-200 px-2.5 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-green-500"
                  >
                    <Icon name="download" className="h-3.5 w-3.5" />
                    Download
                  </button>
                  <button
                    title="Share with Provider"
                    className="inline-flex items-center gap-1 rounded-md border border-slate-200 px-2.5 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-green-500"
                  >
                    <Icon name="share" className="h-3.5 w-3.5" />
                    Share
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
