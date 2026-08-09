"use client";

import { useEffect, useState } from "react";
import { Icon } from "../patient_layouts/dashboard-shared";
import {
  createMedicalRecordsChannel,
  emptyMedicalRecords,
  fetchMedicalRecords,
} from "@/lib/medical-records";

const categories = [
  { key: "prescriptions", label: "Prescriptions" },
  { key: "diagnostics", label: "Diagnostic Reports" },
  { key: "notes", label: "Appointment Notes" },
  { key: "uploads", label: "Uploaded Documents" },
  { key: "invoices", label: "Invoices" },
];

export default function MedicalRecordsPage({ patient }) {
  const [recordCategory, setRecordCategory] = useState("prescriptions");
  const [records, setRecords] = useState(emptyMedicalRecords());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadRecords() {
      try {
        setError("");
        const nextRecords = await fetchMedicalRecords("patient");
        if (isMounted) {
          setRecords(nextRecords);
        }
      } catch (requestError) {
        if (isMounted) {
          setError(requestError instanceof Error ? requestError.message : "Failed to load medical records.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadRecords();

    const channel = createMedicalRecordsChannel();
    if (channel) {
      channel.onmessage = () => {
        loadRecords();
      };
    }

    return () => {
      isMounted = false;
      channel?.close();
    };
  }, []);

  const currentRecords = records[recordCategory] ?? [];

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-col justify-between gap-4 border-b border-slate-200 pb-5 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Medical Records</h1>
          <p className="mt-0.5 text-sm text-slate-500">
            Your prescriptions and memos are stored in MySQL and synced from the
            doctor dashboard.
          </p>
        </div>

        <div className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
          {patient?.name ? `Connected for ${patient.name}` : "Connected records"}
        </div>
      </div>

      {error ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      ) : null}

      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat.key}
              type="button"
              onClick={() => setRecordCategory(cat.key)}
              className={`rounded-lg px-3 py-2 text-xs font-semibold transition ${
                recordCategory === cat.key
                  ? "bg-slate-900 text-white"
                  : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        {isLoading ? (
          <p className="py-8 text-center text-sm text-slate-500">
            Loading records...
          </p>
        ) : currentRecords.length === 0 ? (
          <p className="py-8 text-center text-sm text-slate-500">
            {recordCategory === "prescriptions"
              ? "No prescriptions have been uploaded by your doctor yet."
              : "No records available in this category."}
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
                    {recordCategory === "prescriptions"
                      ? item.doctorName || item.doctor || "Doctor"
                      : item.doctor || item.facility || item.amount || "System Record"}{" "}
                    - {item.date || item.issuedAt?.slice(0, 10)}
                  </p>
                  {recordCategory === "prescriptions" && item.summary ? (
                    <p className="mt-1 max-w-2xl text-xs leading-5 text-slate-500">
                      {item.summary}
                    </p>
                  ) : null}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    title="View Record"
                    className="inline-flex items-center gap-1 rounded-md border border-slate-200 px-2.5 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                  >
                    <Icon name="eye" className="h-3.5 w-3.5" />
                    View
                  </button>
                  <button
                    title="Download"
                    className="inline-flex items-center gap-1 rounded-md border border-slate-200 px-2.5 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                  >
                    <Icon name="download" className="h-3.5 w-3.5" />
                    Download
                  </button>
                  <button
                    title="Share with Provider"
                    className="inline-flex items-center gap-1 rounded-md border border-slate-200 px-2.5 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
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
