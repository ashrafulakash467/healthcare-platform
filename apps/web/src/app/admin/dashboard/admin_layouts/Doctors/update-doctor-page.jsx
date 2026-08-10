"use client";

import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCalendarDays } from "@fortawesome/free-solid-svg-icons";
import { useEffect, useRef, useState } from "react";
import { apiFetch, getStoredToken } from "@/lib/api";
import { resolveDoctorImageSrc } from "@/components/shared/DoctorCard";

const verificationStatusOptions = [
  { value: "approved", label: "Approved" },
  { value: "pending", label: "Pending" },
  { value: "suspended", label: "Suspended" },
  { value: "unavailable", label: "Unavailable" },
];

const statusOptions = [
  { value: "active", label: "Active" },
  { value: "offline", label: "Offline" },
  { value: "unavailable", label: "Unavailable" },
];

const genderOptions = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "other", label: "Other" },
  { value: "prefer_not_to_say", label: "Prefer not to say" },
];

const DOCTOR_IMAGE_FALLBACK = "/images/doctors/doc1.png";

export default function UpdateDoctorPage({ doctor, form, setForm, onSave, onCancel }) {
  const fileInputRef = useRef(null);
  const initialImagePreviewSrc = resolveDoctorImageSrc(doctor);
  const imagePreviewRef = useRef(initialImagePreviewSrc);
  const [showImageControls, setShowImageControls] = useState(true);
  const [imagePreviewSrc, setImagePreviewSrc] = useState(initialImagePreviewSrc);
  const [hospitalOptions, setHospitalOptions] = useState([]);
  const [hospitalsLoading, setHospitalsLoading] = useState(false);

  const currentValue = (key, fallback = "") => {
    const value = form?.[key];
    if (value !== undefined && value !== null && value !== "") {
      return value;
    }
    return fallback;
  };

  const updateField = (key, value) => {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
  };

  useEffect(() => {
    let cancelled = false;

    async function loadHospitals() {
      const token = getStoredToken("admin");
      if (!token) {
        return;
      }

      setHospitalsLoading(true);

      try {
        const response = await apiFetch("/admin/hospitals", {}, token);
        const result = await response.json();

        if (response.ok && !cancelled) {
          setHospitalOptions(Array.isArray(result.hospitals) ? result.hospitals : []);
        }
      } catch {
        if (!cancelled) {
          setHospitalOptions([]);
        }
      } finally {
        if (!cancelled) {
          setHospitalsLoading(false);
        }
      }
    }

    void loadHospitals();

    return () => {
      cancelled = true;
    };
  }, []);

  const imagePath = currentValue("imagePath", doctor.imagePath ?? "");
  const formPreviewUrl = currentValue("imagePreviewUrl", "");
  const imagePreviewUrl = imagePreviewSrc || formPreviewUrl || resolveDoctorImageSrc(doctor);
  const selectedImageLabel =
    form?.imageFile?.name || (imagePath ? imagePath.split("/").filter(Boolean).pop() : "No image selected");
  const selectedHospitalIds = normalizeHospitalIdList(currentValue("hospitalIds", doctor.hospitalIds ?? []));

  useEffect(() => {
    return () => {
      const currentPreview = imagePreviewRef.current;
      if (typeof currentPreview === "string" && currentPreview.startsWith("blob:")) {
        URL.revokeObjectURL(currentPreview);
      }
    };
  }, []);

  const updatePreviewSrc = (nextPreview) => {
    const currentPreview = imagePreviewRef.current;

    if (typeof currentPreview === "string" && currentPreview.startsWith("blob:")) {
      URL.revokeObjectURL(currentPreview);
    }

    imagePreviewRef.current = nextPreview;
    setImagePreviewSrc(nextPreview);
  };

  const handleImageChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    updatePreviewSrc(previewUrl);
    setForm((current) => ({
      ...current,
      imageFile: file,
      imagePreviewUrl: previewUrl,
      imagePath: "",
    }));

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 pb-28 shadow-sm">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
            {doctor?.id ? "Edit Doctor" : "Add New Doctor"}
          </p>
          <h3 className="mt-1 text-lg font-bold text-slate-900">
            {doctor?.id ? (doctor.name ?? "Unnamed Doctor") : "Create a new doctor"}
          </h3>
        </div>

        <Badge tone={badgeTone(form?.verificationStatus ?? doctor.verificationStatus ?? doctor.status).color}>
          {form?.verificationStatus ?? doctor.verificationStatus ?? doctor.status ?? "Pending"}
        </Badge>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Field
          label="Name"
          value={currentValue("name", doctor.name)}
          onChange={(value) => updateField("name", value)}
          placeholder="Doctor name"
        />
        <Field
          label="Email"
          value={currentValue("email", doctor.email)}
          onChange={(value) => updateField("email", value)}
          placeholder="doctor@example.com"
          type="email"
        />
        <SelectField
          label="Gender"
          value={currentValue("gender", doctor.gender ?? "")}
          onChange={(value) => updateField("gender", value)}
          options={genderOptions}
        />
        <Field
          label={doctor?.id ? "New Password" : "Password"}
          value={currentValue("password", "")}
          onChange={(value) => updateField("password", value)}
          placeholder={doctor?.id ? "Leave blank to keep current password" : "Set a login password"}
          type="password"
        />
        <Field
          label={doctor?.id ? "Confirm New Password" : "Confirm Password"}
          value={currentValue("passwordConfirmation", "")}
          onChange={(value) => updateField("passwordConfirmation", value)}
          placeholder="Re-enter password"
          type="password"
        />
        <Field
          label="Specialty"
          value={currentValue("specialty", doctor.specialty ?? doctor.speciality)}
          onChange={(value) => updateField("specialty", value)}
          placeholder="Cardiology"
        />
        <div className="md:col-span-2 rounded-2xl border border-slate-100 bg-slate-50 p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                Clinics &amp; Hospitals
              </p>
              <p className="mt-1 text-sm text-slate-500">
                Select the clinics and hospitals this doctor belongs to. The selection is saved in MySQL.
              </p>
            </div>
            <p className="text-xs font-medium text-slate-600">
              Selected: {selectedHospitalIds.length}
            </p>
          </div>

          {hospitalsLoading ? (
            <div className="mt-4 rounded-xl border border-dashed border-slate-200 bg-white px-4 py-6 text-sm text-slate-500">
              Loading clinics and hospitals from MySQL...
            </div>
          ) : hospitalOptions.length ? (
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              {hospitalOptions.map((hospital) => {
                const isSelected = selectedHospitalIds.includes(String(hospital.id));

                return (
                  <button
                    key={hospital.id}
                    type="button"
                    onClick={() => updateField("hospitalIds", toggleHospitalIdField(selectedHospitalIds, hospital.id))}
                    className={`flex items-start gap-3 rounded-xl border px-4 py-3 text-left transition ${
                      isSelected
                        ? "border-emerald-300 bg-emerald-50"
                        : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                    }`}
                  >
                    <span
                      className={`mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[10px] font-bold ${
                        isSelected
                          ? "border-emerald-500 bg-emerald-500 text-white"
                          : "border-slate-300 bg-white text-slate-400"
                      }`}
                    >
                      {isSelected ? "✓" : ""}
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-semibold text-slate-900">
                        {hospital.name}
                      </span>
                      <span className="block truncate text-xs text-slate-500">
                        {[hospital.city, hospital.status].filter(Boolean).join(" - ") || "Hospital"}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="mt-4 rounded-xl border border-dashed border-slate-200 bg-white px-4 py-6 text-sm text-slate-500">
              No hospitals found in MySQL.
            </div>
          )}

          <div className="mt-4 flex flex-wrap gap-2">
            {selectedHospitalIds.length ? (
              selectedHospitalIds.map((hospitalId) => {
                const hospital = hospitalOptions.find((item) => String(item.id) === String(hospitalId));
                return (
                  <Tag key={hospitalId}>
                    {hospital?.name ?? `Hospital #${hospitalId}`}
                  </Tag>
                );
              })
            ) : (
              <Tag>None selected</Tag>
            )}
          </div>
        </div>
        <CalendarField
          label="Available dates"
          value={currentValue("availableDates", parseDoctorDateList(doctor.availableDates ?? doctor.available_dates))}
          onChange={(value) => updateField("availableDates", value)}
          hint="Click dates on the calendar to select or unselect multiple days."
        />
        <TextareaField
          label="Available time slots"
          value={currentValue("availableTimeSlots", formatDoctorList(doctor.availableTimeSlots ?? doctor.available_time_slots))}
          onChange={(value) => updateField("availableTimeSlots", value)}
          placeholder={"09:00 AM\n02:00 PM"}
          hint="Add one slot per line or separate by commas."
        />
        <Field
          label="Consultation Fee"
          value={currentValue("consultationFee", doctor.consultationFee ?? "")}
          onChange={(value) => updateField("consultationFee", value)}
          placeholder="1200"
          type="number"
        />
        <Field
          label="Follow-up Fee"
          value={currentValue("followUpFee", doctor.followUpFee ?? "")}
          onChange={(value) => updateField("followUpFee", value)}
          placeholder="600"
          type="number"
        />
        <Field
          label="Phone"
          value={currentValue("phone", doctor.phone)}
          onChange={(value) => updateField("phone", value)}
          placeholder="01700000000"
        />
        <Field
          label="City"
          value={currentValue("city", doctor.city)}
          onChange={(value) => updateField("city", value)}
          placeholder="Dhaka"
        />
        <Field
          label="License No"
          value={currentValue("licenseNo", doctor.licenseNo)}
          onChange={(value) => updateField("licenseNo", value)}
          placeholder="BMDC-123456"
        />
        <SelectField
          label="Verification Status"
          value={currentValue("verificationStatus", doctor.verificationStatus ?? "pending")}
          onChange={(value) => updateField("verificationStatus", value)}
          options={verificationStatusOptions}
        />
        <SelectField
          label="Status"
          value={currentValue("status", doctor.status ?? "active")}
          onChange={(value) => updateField("status", value)}
          options={statusOptions}
        />
        <div className="md:col-span-2 rounded-xl border border-amber-100 bg-amber-50 px-4 py-3 text-xs leading-5 text-amber-800">
          {doctor?.id
            ? "Leave the password fields blank to keep the current doctor login. Fill both fields to update it."
            : "Set the doctor login password here. The doctor can sign in with this email and password right away."}
        </div>
        <div className="md:col-span-2">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Doctor Image
              </p>
              {showImageControls ? (
                <p className="mt-1 text-sm text-slate-500">
                  Upload a doctor image from your computer.
                </p>
              ) : null}
            </div>
            <p className="text-xs font-medium text-slate-600">
              Selected: {selectedImageLabel}
            </p>
          </div>

          <div className="mt-3 flex flex-col gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div className="relative h-28 w-full overflow-hidden rounded-xl border border-slate-200 bg-white sm:h-36">
              {/* Use a plain image tag so blob previews render instantly during upload. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imagePreviewUrl || DOCTOR_IMAGE_FALLBACK}
                alt={doctor.name ?? "Doctor"}
                className="h-full w-full object-contain p-3"
              />
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <button
                type="button"
                onClick={() => {
                  setShowImageControls((current) => !current);
                }}
                className="inline-flex items-center gap-2 rounded-lg bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
              >
                {showImageControls ? "Hide Image" : "Choose Image"}
              </button>
            </div>

            {showImageControls ? (
              <div className="space-y-3">
                <label className="flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-dashed border-slate-300 bg-white px-4 py-3 text-sm text-slate-600 transition hover:border-slate-400 hover:bg-slate-50">
                  <span>Choose image file</span>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                    Browse
                  </span>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageChange}
                  />
                </label>

                <p className="text-xs text-slate-500">
                  Pick an image file from your computer. It will be saved in the doctor record.
                </p>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <div className="fixed bottom-4 left-1/2 z-40 w-[min(92vw,24rem)] -translate-x-1/2 px-4 py-3">
        <div className="flex flex-wrap justify-center gap-2">
          <button
            type="button"
            onClick={onSave}
            className="inline-flex min-w-32 items-center justify-center rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            {doctor?.id ? "Save Changes" : "Create Doctor"}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex min-w-24 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, placeholder, type = "text" }) {
  return (
    <label className="block">
      <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400"
      />
    </label>
  );
}

function TextareaField({ label, value, onChange, placeholder, hint }) {
  return (
    <label className="block md:col-span-2">
      <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </span>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        rows={4}
        className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400"
      />
      {hint ? <p className="mt-1 text-xs text-slate-400">{hint}</p> : null}
    </label>
  );
}

function Tag({ children }) {
  return (
    <span className="inline-flex rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700">
      {children}
    </span>
  );
}

function CalendarField({ label, value, onChange, hint }) {
  const fieldRef = useRef(null);
  const [selectedDates, setSelectedDates] = useState(() => parseDoctorDateList(value));
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  useEffect(() => {
    const handlePointerDown = (event) => {
      if (!isCalendarOpen) {
        return;
      }

      if (fieldRef.current && !fieldRef.current.contains(event.target)) {
        setIsCalendarOpen(false);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setIsCalendarOpen(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isCalendarOpen]);

  const toggleCalendar = () => {
    setIsCalendarOpen((current) => !current);
  };

  const toggleDate = (dateStr) => {
    const nextDates = selectedDates.includes(dateStr)
      ? selectedDates.filter((item) => item !== dateStr)
      : [...selectedDates, dateStr].sort();

    setSelectedDates(nextDates);
    onChange(nextDates);
  };

  const clearDates = () => {
    setSelectedDates([]);
    onChange([]);
  };

  const displaySelectedDates = selectedDates.length
    ? selectedDates.map((date) => formatDoctorDateLabel(date)).join(", ")
    : "";

  return (
    <div ref={fieldRef} className="relative md:col-span-2">
      <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </div>
      <button
        type="button"
        aria-label={isCalendarOpen ? "Close available dates calendar" : "Open available dates calendar"}
        aria-expanded={isCalendarOpen}
        onClick={toggleCalendar}
        className="mt-2 flex min-h-10 w-full items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2 text-left text-sm text-slate-900 outline-none transition hover:border-slate-400 focus:border-slate-400"
      >
        <span className={selectedDates.length ? "text-slate-900" : "text-slate-400"}>
          {displaySelectedDates || "Select available dates"}
        </span>
        <span className="ml-auto inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-50 text-slate-600 transition hover:bg-slate-100">
          <FontAwesomeIcon icon={faCalendarDays} className="h-4 w-4" />
        </span>
      </button>

      {isCalendarOpen ? (
        <div className="absolute left-0 right-0 top-full z-20 mt-2 w-full max-w-[38rem] overflow-hidden rounded-xl border border-slate-200 bg-white p-3 shadow-[0_16px_40px_rgba(15,23,42,0.14)]">
          <FullCalendar
            className="fc-compact-calendar"
            plugins={[dayGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            height="auto"
            fixedWeekCount={true}
            showNonCurrentDates={true}
            dayMaxEventRows={1}
            headerToolbar={{
              left: "title",
              center: "",
              right: "prev,next",
            }}
            dayHeaderFormat={{ weekday: "short" }}
            dateClick={(info) => toggleDate(info.dateStr)}
            dayCellClassNames={(arg) => {
              const dateKey = getLocalDateKey(arg.date);
              const isSelected = selectedDates.includes(dateKey);
              const isToday = arg.isToday;

              return [
                "rounded-lg transition",
                isSelected ? "!bg-blue-100 ring-2 ring-inset ring-blue-500" : "",
                isToday ? "ring-1 ring-inset ring-amber-400" : "",
              ];
            }}
            events={selectedDates.map((date) => ({
              id: date,
              start: date,
              allDay: true,
              display: "background",
              backgroundColor: "#dbeafe",
            }))}
          />
        </div>
      ) : null}

      <style jsx global>{`
        .fc-compact-calendar .fc-toolbar {
          margin-bottom: 0.35rem;
        }

        .fc-compact-calendar .fc-toolbar-title {
          font-size: 0.82rem;
          line-height: 1rem;
          font-weight: 600;
          color: rgb(15 23 42);
        }

        .fc-compact-calendar .fc-button {
          padding: 0.18rem 0.45rem;
          font-size: 0.7rem;
          line-height: 1rem;
          border-radius: 9999px;
          border-color: rgb(226 232 240);
          background: rgb(255 255 255);
          color: rgb(51 65 85);
          box-shadow: none;
        }

        .fc-compact-calendar .fc-col-header-cell-cushion {
          padding: 0.22rem 0;
          font-size: 0.66rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: rgb(100 116 139);
        }

        .fc-compact-calendar .fc-daygrid-day-number {
          padding: 0.08rem 0.18rem;
          font-size: 0.68rem;
          color: rgb(15 23 42);
        }

        .fc-compact-calendar .fc-daygrid-day-frame {
          min-height: 2.1rem;
        }

        .fc-compact-calendar .fc-daygrid-day-top {
          padding: 0.04rem 0.1rem;
        }

        .fc-compact-calendar .fc-daygrid-body-balanced .fc-daygrid-day-events {
          display: none;
        }

        .fc-compact-calendar .fc-scrollgrid,
        .fc-compact-calendar .fc-scrollgrid-section > td,
        .fc-compact-calendar .fc-scrollgrid-section > th {
          border-color: rgb(226 232 240);
        }

        .fc-compact-calendar .fc-scroller,
        .fc-compact-calendar .fc-scroller-liquid-absolute {
          overflow: hidden !important;
        }

        .fc-compact-calendar .fc-daygrid-day.fc-day-today {
          background: rgb(239 246 255);
        }

        .fc-compact-calendar .fc-daygrid-day.fc-day-selected,
        .fc-compact-calendar .fc-daygrid-day.fc-day-selected:hover {
          background: rgb(219 234 254);
        }
      `}</style>

      <div className="mt-2 flex flex-wrap items-center gap-2">
        {selectedDates.length ? (
          selectedDates.map((date) => (
            <button
              key={date}
              type="button"
              onClick={() => toggleDate(date)}
              className="rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700 transition hover:bg-blue-100"
            >
              {formatDoctorDateLabel(date)}
            </button>
          ))
        ) : (
          <p className="text-xs text-slate-400">Select available dates</p>
        )}

        {selectedDates.length ? (
          <button
            type="button"
            onClick={clearDates}
            className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900"
          >
            Clear all dates
          </button>
        ) : null}
      </div>

      {hint ? <p className="mt-1 text-xs text-slate-400">{hint}</p> : null}
    </div>
  );
}

function SelectField({ label, value, onChange, options }) {
  return (
    <label className="block">
      <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-slate-400"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function Badge({ children, tone = "slate", className = "" }) {
  const toneClasses = {
    emerald: "bg-emerald-50 text-emerald-700 border-emerald-100",
    blue: "bg-blue-50 text-blue-700 border-blue-100",
    amber: "bg-amber-50 text-amber-700 border-amber-100",
    rose: "bg-rose-50 text-rose-700 border-rose-100",
    slate: "bg-slate-100 text-slate-700 border-slate-200",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${toneClasses[tone] ?? toneClasses.slate} ${className}`}
    >
      {children}
    </span>
  );
}

function badgeTone(label) {
  const text = String(label ?? "").toLowerCase();

  if (text.includes("approved") || text.includes("active")) {
    return {
      color: "emerald",
      icon: "text-emerald-500",
      text: "text-emerald-700",
    };
  }

  if (text.includes("pending") || text.includes("review") || text.includes("waiting")) {
    return {
      color: "amber",
      icon: "text-amber-500",
      text: "text-amber-700",
    };
  }

  if (text.includes("reject") || text.includes("suspend") || text.includes("inactive")) {
    return {
      color: "rose",
      icon: "text-rose-500",
      text: "text-rose-700",
    };
  }

  return {
    color: "slate",
    icon: "text-slate-400",
    text: "text-slate-600",
  };
}

function formatDoctorList(value) {
  if (Array.isArray(value)) {
    return value.filter(Boolean).join("\n");
  }

  if (typeof value === "string") {
    return value;
  }

  return "";
}

function parseDoctorDateList(value) {
  if (Array.isArray(value)) {
    return value.filter(Boolean);
  }

  if (typeof value !== "string") {
    return [];
  }

  const trimmed = value.trim();

  if (!trimmed) {
    return [];
  }

  try {
    const parsed = JSON.parse(trimmed);
    if (Array.isArray(parsed)) {
      return parsed.filter(Boolean);
    }
  } catch {
    // fall through to line/comma splitting
  }

  return trimmed
    .split(/[\n,]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function normalizeHospitalIdList(value) {
  if (Array.isArray(value)) {
    return value.map((item) => String(item)).filter(Boolean);
  }

  if (typeof value === "string") {
    return value
      .split(/[\n,]/)
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
}

function toggleHospitalIdField(value, hospitalId) {
  const next = new Set(normalizeHospitalIdList(value));
  const id = String(hospitalId);

  if (next.has(id)) {
    next.delete(id);
  } else {
    next.add(id);
  }

  return Array.from(next);
}

function getLocalDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function formatDoctorDateLabel(dateString) {
  const date = new Date(`${dateString}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return dateString;
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(date);
}

