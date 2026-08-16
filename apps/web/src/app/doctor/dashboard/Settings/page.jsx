"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch, getStoredToken, getStoredUser } from "@/lib/api";
import { DOCTOR_IMAGE_FALLBACK, resolveDoctorImageSrc } from "@/components/shared/DoctorCard";

export default function SettingsPage() {
  const router = useRouter();
  const [profile, setProfile] = useState(() => normalizeDoctorUser(getStoredUser("doctor")));
  const [form, setForm] = useState(() => buildProfileForm(getStoredUser("doctor")));
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [error, setError] = useState("");

  const doctor = profile?.doctor ?? {};
  const imageSrc = resolveDoctorImageSrc(doctor);
  const completion = calculateCompletion(form);

  useEffect(() => {
    if (!toastMessage) {
      return undefined;
    }

    const timer = window.setTimeout(() => {
      setToastMessage("");
    }, 3000);

    return () => window.clearTimeout(timer);
  }, [toastMessage]);

  useEffect(() => {
    if (!error) {
      return undefined;
    }

    const timer = window.setTimeout(() => {
      setError("");
    }, 3500);

    return () => window.clearTimeout(timer);
  }, [error]);

  useEffect(() => {
    async function loadDoctorProfile() {
      const token = getStoredToken("doctor");

      if (!token) {
        router.replace("/doctor/login");
        return;
      }

      try {
        const response = await apiFetch("/doctor/me", {}, token);
        const result = await response.json();

        if (!response.ok) {
          clearDoctorCache();
          router.replace("/doctor/login");
          return;
        }

        const nextUser = normalizeDoctorUser(result.user);
        setProfile(nextUser);
        setForm(buildProfileForm(nextUser));
        syncDoctorCache(nextUser);
      } catch {
        const cachedDoctor = normalizeDoctorUser(getStoredUser("doctor"));
        setProfile(cachedDoctor);
        setForm(buildProfileForm(cachedDoctor));
      } finally {
        setIsLoading(false);
      }
    }

    loadDoctorProfile();
  }, [router]);

  function updateField(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setError("");
    setToastMessage("");
  }

  function resetForm() {
    const cachedDoctor = normalizeDoctorUser(getStoredUser("doctor")) ?? profile;
    setForm(buildProfileForm(cachedDoctor));
    setError("");
    setToastMessage("");
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const token = getStoredToken("doctor");
    if (!token) {
      setError("Your session expired. Please sign in again.");
      return;
    }

    const payload = buildProfilePayload(form);
    const validationError = validateProfilePayload(payload);

    if (validationError) {
      setError(validationError);
      return;
    }

    setIsSaving(true);
    setError("");
    setToastMessage("");

    try {
      const response = await apiFetch(
        "/doctor/me",
        {
          method: "PUT",
          body: JSON.stringify(payload),
        },
        token,
      );

      let result = {};
      try {
        result = await response.json();
      } catch {
        result = {};
      }

      if (!response.ok) {
        setError(result.message ?? "Could not update your doctor profile.");
        return;
      }

      const nextUser = normalizeDoctorUser(result.user);
      setProfile(nextUser);
      setForm(buildProfileForm(nextUser));
      syncDoctorCache(nextUser);
      setToastMessage(result.message ?? "Profile updated successfully.");
    } catch {
      setError("Could not update your profile. Please try again.");
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 text-sm font-medium text-slate-500">
        Loading settings...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-emerald-50/30 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="rounded-[28px] border border-slate-200 bg-white px-5 py-5 shadow-[0_18px_50px_rgba(15,23,42,0.08)] sm:px-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0">
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-emerald-600">
                Doctor Settings
              </p>
              <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
                Manage your profile
              </h1>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <StatusPill tone={doctor?.verificationStatus}>
                {doctor?.verificationStatus ?? "pending"}
              </StatusPill>
              <StatusPill tone={doctor?.status}>
                {doctor?.status ?? "inactive"}
              </StatusPill>
              <Link
                href="/doctor/dashboard"
                className="inline-flex items-center rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
              >
                Back to dashboard
              </Link>
            </div>
          </div>
        </header>

        <div className="space-y-6">
          <aside className="hidden rounded-[28px] border border-slate-200 bg-white p-5">      

            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
              <div className="relative flex h-64 items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imageSrc}
                  alt={doctor?.name ?? "Doctor"}
                  className="h-full w-full object-contain p-5"
                  onError={(event) => {
                    event.currentTarget.src = DOCTOR_IMAGE_FALLBACK;
                  }}
                />
              </div>
            </div>

            <div className="mt-4 space-y-1">
              <h2 className="text-2xl font-bold text-slate-950">
                {doctor?.name ?? "Doctor"}
              </h2>
              <p className="mt-1 truncate text-sm text-slate-500">
                {profile?.email ?? "No email available"}
              </p>

              <div className="mt-3 flex flex-wrap gap-2">
                {doctor?.specialty ? <Tag>{doctor.specialty}</Tag> : <Tag>General Medicine</Tag>}
                {doctor?.city ? <Tag>{doctor.city}</Tag> : <Tag>Location unavailable</Tag>}
              </div>
            </div>

            <div className="grid gap-3 border-t border-slate-100 pt-5">
              <InfoCard label="Profile Completion" value={`${completion}%`} />
              <InfoCard label="License No" value={doctor?.licenseNo ?? "Not provided"} />
              <InfoCard
                label="Consultation Fee"
                value={formatCurrencyDisplay(doctor?.consultationFee)}
              />
              <InfoCard
                label="Follow-up Fee"
                value={formatCurrencyDisplay(doctor?.followUpFee)}
              />
            </div>

            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                Clinics & Hospitals
              </p>
              <div className="mt-3 space-y-2">
                {Array.isArray(doctor?.clinics) && doctor.clinics.length ? (
                  doctor.clinics.map((clinic) => (
                    <div key={clinic.id ?? `${clinic.name}-${clinic.location}`} className="rounded-xl border border-slate-200 bg-white p-3">
                      <p className="text-sm font-semibold text-slate-900">
                        {clinic.name ?? "Unnamed Clinic"}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {clinic.location ?? "Location not available"}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="rounded-xl border border-dashed border-slate-200 bg-white p-3 text-sm text-slate-500">
                    No clinic or hospital available.
                  </p>
                )}
              </div>
            </div>
          </aside>

          <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_18px_50px_rgba(15,23,42,0.08)] sm:p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <SettingsSection
                title="Personal Information"
                description="Update your basic contact information."
              >
                <div className="grid gap-4 md:grid-cols-2">
                  <Field label="Name" name="name" value={form.name} onChange={updateField} placeholder="Doctor name" />
                  <Field label="Email" name="email" type="email" value={form.email} onChange={updateField} placeholder="doctor@example.com" />
                  <Field label="Phone" name="phone" value={form.phone} onChange={updateField} placeholder="01700000000" />
                  <Field label="City" name="city" value={form.city} onChange={updateField} placeholder="Dhaka" />
                  <Field label="State" name="state" value={form.state} onChange={updateField} placeholder="Dhaka Division" />
                  <Field label="Country" name="country" value={form.country} onChange={updateField} placeholder="Bangladesh" />
                </div>
              </SettingsSection>

              <SettingsSection
                title="Professional Information"
                description="Keep your doctor profile up to date."
              >
                <div className="grid gap-4 md:grid-cols-2">
                  <Field label="Specialty" name="specialty" value={form.specialty} onChange={updateField} placeholder="Cardiology" />
                  <Field label="Sub Specialty" name="subSpecialty" value={form.subSpecialty} onChange={updateField} placeholder="Interventional Cardiology" />
                  <Field label="Qualification" name="qualification" value={form.qualification} onChange={updateField} placeholder="MBBS, FCPS" />
                  <Field label="License No" name="licenseNo" value={form.licenseNo} onChange={updateField} placeholder="BMDC-123456" />
                  <Field label="Chamber Address" name="chamberAddress" value={form.chamberAddress} onChange={updateField} placeholder="House 12, Road 3" />
                  <Field label="Gender" name="gender" value={form.gender} onChange={updateField} placeholder="Select gender" options={["Male", "Female", "Other"]} />
                  <TextareaField
                    label="Bio"
                    name="bio"
                    value={form.bio}
                    onChange={updateField}
                    placeholder="Write a short professional bio"
                    className="md:col-span-2"
                  />
                </div>
              </SettingsSection>

              <SettingsSection
                title="Availability"
                description="Store your available dates and time slots."
              >
                <div className="grid gap-4 md:grid-cols-2">
                  <TextareaField
                    label="Available Dates"
                    name="availableDates"
                    value={form.availableDates}
                    onChange={updateField}
                    placeholder={"2026-08-15\n2026-08-16"}
                    hint="Use one date per line or separate with commas."
                  />
                  <TextareaField
                    label="Available Time Slots"
                    name="availableTimeSlots"
                    value={form.availableTimeSlots}
                    onChange={updateField}
                    placeholder={"09:00 AM\n02:00 PM"}
                    hint="Use one slot per line or separate with commas."
                  />
                </div>
              </SettingsSection>

              <SettingsSection
                title="Consultation Fees"
                description="Manage your consultation and follow-up charges."
              >
                <div className="grid gap-4 md:grid-cols-2">
                  <Field
                    label="Consultation Fee"
                    name="consultationFee"
                    type="number"
                    value={form.consultationFee}
                    onChange={updateField}
                    placeholder="1200"
                  />
                  <Field
                    label="Follow-up Fee"
                    name="followUpFee"
                    type="number"
                    value={form.followUpFee}
                    onChange={updateField}
                    placeholder="600"
                  />
                </div>
              </SettingsSection>

              <SettingsSection
                title="Account Security"
                description="Change your doctor account password."
              >
                <div className="grid gap-4 md:grid-cols-2">
                  <Field
                    label="Current Password"
                    name="currentPassword"
                    type="password"
                    value={form.currentPassword}
                    onChange={updateField}
                    placeholder="Enter current password"
                  />
                  <Field
                    label="New Password"
                    name="newPassword"
                    type="password"
                    value={form.newPassword}
                    onChange={updateField}
                    placeholder="Enter new password"
                  />
                  <Field
                    label="Confirm Password"
                    name="confirmPassword"
                    type="password"
                    value={form.confirmPassword}
                    onChange={updateField}
                    placeholder="Confirm new password"
                  />
                </div>
              </SettingsSection>

              <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Reset
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSaving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </section>
        </div>

        <div className="fixed bottom-4 right-4 z-50 flex w-full max-w-sm flex-col gap-3 px-4 sm:px-0">
          {error ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700 shadow-[0_16px_40px_rgba(15,23,42,0.18)]">
              {error}
            </div>
          ) : null}

          {toastMessage ? (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700 shadow-[0_16px_40px_rgba(15,23,42,0.18)]">
              {toastMessage}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function SettingsSection({ title, description, children }) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="mb-5 border-b border-slate-100 pb-4">
        <h2 className="text-lg font-bold text-slate-950">{title}</h2>
        <p className="mt-1 text-sm text-slate-500">{description}</p>
      </div>
      {children}
    </section>
  );
}

function Field({ label, name, value, onChange, type = "text", placeholder, options }) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-slate-700">{label}</span>
      {options?.length ? (
        <select
          name={name}
          value={value}
          onChange={onChange}
          className="mt-2 h-11 w-full rounded-xl border border-slate-300 bg-slate-50 px-3 text-sm text-slate-900 outline-none transition focus:border-emerald-400 focus:bg-white focus:ring-2 focus:ring-emerald-100"
        >
          <option value="" disabled hidden>
            {placeholder ?? "Select"}
          </option>
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      ) : (
        <input
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="mt-2 h-11 w-full rounded-xl border border-slate-300 bg-slate-50 px-3 text-sm text-slate-900 outline-none transition focus:border-emerald-400 focus:bg-white focus:ring-2 focus:ring-emerald-100"
        />
      )}
    </label>
  );
}

function TextareaField({
  label,
  name,
  value,
  onChange,
  placeholder,
  hint,
  className = "",
}) {
  return (
    <label className={`block ${className}`}>
      <span className="text-sm font-semibold text-slate-700">{label}</span>
      <textarea
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={4}
        className="mt-2 w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-400 focus:bg-white focus:ring-2 focus:ring-emerald-100"
      />
      {hint ? <p className="mt-2 text-xs leading-5 text-slate-500">{hint}</p> : null}
    </label>
  );
}

function InfoCard({ label, value }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </p>
      <p className="mt-1 text-sm font-bold text-slate-900">{value}</p>
    </div>
  );
}

function Tag({ children }) {
  return (
    <span className="inline-flex rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700">
      {children}
    </span>
  );
}

function StatusPill({ children, tone = "" }) {
  const value = String(tone ?? "").toLowerCase();

  const toneClasses = value.includes("approved") || value.includes("active")
    ? "bg-emerald-50 text-emerald-700"
    : value.includes("pending") || value.includes("review")
      ? "bg-amber-50 text-amber-700"
      : value.includes("reject") || value.includes("inactive") || value.includes("suspend")
        ? "bg-rose-50 text-rose-700"
        : "bg-slate-100 text-slate-700";

  return (
    <span className={`inline-flex items-center rounded-full px-4 py-2 text-xs font-bold capitalize ${toneClasses}`}>
      {children}
    </span>
  );
}

function buildProfileForm(user) {
  const normalizedUser = normalizeDoctorUser(user);
  const doctor = normalizedUser?.doctor ?? {};

  return {
    name: normalizedUser?.name ?? "",
    email: normalizedUser?.email ?? "",
    phone: normalizedUser?.phone ?? "",
    specialty: doctor.specialty ?? "",
    subSpecialty: doctor.subSpecialty ?? "",
    qualification: doctor.qualification ?? "",
    bio: doctor.bio ?? "",
    gender: doctor.gender ?? "",
    consultationFee: doctor.consultationFee ?? "",
    followUpFee: doctor.followUpFee ?? "",
    licenseNo: doctor.licenseNo ?? "",
    chamberAddress: doctor.chamberAddress ?? "",
    availableDates: formatListForInput(doctor.availableDates),
    availableTimeSlots: formatListForInput(doctor.availableTimeSlots),
    city: doctor.city ?? "",
    state: doctor.state ?? "",
    country: doctor.country ?? "Bangladesh",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  };
}

function buildProfilePayload(form) {
  return {
    name: trimValue(form.name),
    email: trimValue(form.email),
    phone: optionalValue(form.phone),
    specialty: optionalValue(form.specialty),
    subSpecialty: optionalValue(form.subSpecialty),
    qualification: optionalValue(form.qualification),
    bio: optionalValue(form.bio),
    gender: optionalValue(form.gender),
    consultationFee: numberOrNull(form.consultationFee),
    followUpFee: numberOrNull(form.followUpFee),
    licenseNo: optionalValue(form.licenseNo),
    chamberAddress: optionalValue(form.chamberAddress),
    availableDates: splitList(form.availableDates),
    availableTimeSlots: splitList(form.availableTimeSlots),
    city: optionalValue(form.city),
    state: optionalValue(form.state),
    country: optionalValue(form.country) ?? "Bangladesh",
    currentPassword: optionalValue(form.currentPassword),
    newPassword: optionalValue(form.newPassword),
    confirmPassword: optionalValue(form.confirmPassword),
  };
}

function validateProfilePayload(payload) {
  if (!payload.name) {
    return "Name is required.";
  }

  if (!payload.email) {
    return "Email is required.";
  }

  const passwordFieldsFilled = [payload.currentPassword, payload.newPassword, payload.confirmPassword].some(Boolean);

  if (passwordFieldsFilled) {
    if (!payload.currentPassword) {
      return "Current password is required.";
    }

    if (!payload.newPassword) {
      return "New password is required.";
    }

    if (String(payload.newPassword).length < 8) {
      return "New password must be at least 8 characters.";
    }

    if (!payload.confirmPassword) {
      return "Confirm password is required.";
    }

    if (payload.newPassword !== payload.confirmPassword) {
      return "New password and confirm password must match.";
    }
  }

  return "";
}

function calculateCompletion(form) {
  const values = [
    form.name,
    form.email,
    form.phone,
    form.specialty,
    form.qualification,
    form.licenseNo,
    form.city,
    form.state,
    form.country,
    form.bio,
    form.availableDates,
    form.availableTimeSlots,
  ];

  const filledCount = values.filter((value) => String(value ?? "").trim() !== "").length;
  return Math.round((filledCount / values.length) * 100);
}

function formatListForInput(value) {
  if (Array.isArray(value)) {
    return value.filter(Boolean).join("\n");
  }

  if (typeof value === "string") {
    return value;
  }

  return "";
}

function splitList(value) {
  return String(value ?? "")
    .split(/[\n,]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function trimValue(value) {
  return String(value ?? "").trim();
}

function optionalValue(value) {
  const trimmed = trimValue(value);
  return trimmed === "" ? null : trimmed;
}

function numberOrNull(value) {
  const trimmed = trimValue(value);

  if (trimmed === "") {
    return null;
  }

  const numeric = Number(trimmed);
  return Number.isFinite(numeric) ? numeric : null;
}

function formatCurrencyDisplay(value) {
  if (value === null || value === undefined || value === "") {
    return "N/A";
  }

  const numeric = typeof value === "string" ? Number(value) : Number(value);

  if (!Number.isFinite(numeric)) {
    return String(value);
  }

  return `BDT ${new Intl.NumberFormat("en-BD", {
    maximumFractionDigits: 0,
  }).format(Math.round(numeric))}`;
}

function normalizeDoctorUser(user) {
  if (!user || typeof user !== "object") {
    return null;
  }

  return user;
}

function syncDoctorCache(user) {
  if (typeof window === "undefined" || !user) {
    return;
  }

  localStorage.setItem("doctorUser", JSON.stringify(user));
  window.dispatchEvent(new Event("auth-change"));
}

function clearDoctorCache() {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.removeItem("doctorToken");
  localStorage.removeItem("doctorUser");
  document.cookie = "doctorToken=; path=/; max-age=0; SameSite=Lax";
  window.dispatchEvent(new Event("auth-change"));
}
