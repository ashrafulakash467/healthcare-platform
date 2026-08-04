"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import DoctorCardDetails from "@/components/shared/DoctorCardDetails";
import { apiFetch, getStoredToken } from "@/lib/api";

export default function BookAppointmentPage() {
  const searchParams = useSearchParams();
  const [doctors, setDoctors] = useState([]);
  const [doctorId, setDoctorId] = useState(() => searchParams.get("doctorId") ?? "");
  const [bookingOptions, setBookingOptions] = useState(null);
  const [clinicId, setClinicId] = useState("");
  const [dates, setDates] = useState([]);
  const [appointmentDate, setAppointmentDate] = useState("");
  const [slots, setSlots] = useState([]);
  const [slotTime, setSlotTime] = useState("");
  const [error, setError] = useState("");
  const [confirmation, setConfirmation] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPatientLoggedIn, setIsPatientLoggedIn] = useState(false);

  useEffect(() => {
    const syncAuth = () => {
      setIsPatientLoggedIn(
        Boolean(
          getStoredToken("admin") || getStoredToken("doctor") || getStoredToken("patient"),
        ),
      );
    };

    syncAuth();
    window.addEventListener("auth-change", syncAuth);
    window.addEventListener("storage", syncAuth);

    return () => {
      window.removeEventListener("auth-change", syncAuth);
      window.removeEventListener("storage", syncAuth);
    };
  }, []);

  useEffect(() => {
    async function loadDoctors() {
      try {
        const response = await apiFetch("/doctor/search?limit=50&sort=name_asc");
        const result = await response.json();
        if (response.ok) {
          setDoctors(result.data ?? []);
        }
      } catch {
        setError("Could not load doctors. Make sure the backend is running on port 3001.");
      }
    }

    loadDoctors();
  }, []);

  useEffect(() => {
    if (!doctorId) {
      return;
    }

    async function loadOptions() {
      setIsLoading(true);
      setError("");
      setBookingOptions(null);
      setDates([]);
      setAppointmentDate("");
      setSlots([]);
      setSlotTime("");

      try {
        const response = await apiFetch(
          `/appointment/booking-options?doctorId=${doctorId}`,
        );
        const result = await response.json();

        if (!response.ok) {
          setError(result.message ?? "Could not load booking options.");
          return;
        }

        setBookingOptions(result);
      } catch {
        setError("Could not load booking options. Make sure the backend is running on port 3001.");
      } finally {
        setIsLoading(false);
      }
    }

    loadOptions();
  }, [doctorId]);

  useEffect(() => {
    if (!doctorId || !clinicId) {
      return;
    }

    async function loadDates() {
      setError("");
      setDates([]);
      setAppointmentDate("");
      setSlots([]);
      setSlotTime("");

      try {
        const response = await apiFetch(
          `/appointment/available-dates?doctorId=${doctorId}&clinicId=${clinicId}`,
        );
        const result = await response.json();

        if (!response.ok) {
          setError(result.message ?? "Could not load dates.");
          return;
        }

        setDates(result.dates ?? []);
      } catch {
        setError("Could not load dates. Make sure the backend is running on port 3001.");
      }
    }

    loadDates();
  }, [doctorId, clinicId]);

  useEffect(() => {
    if (!doctorId || !clinicId || !appointmentDate) {
      return;
    }

    async function loadSlots() {
      setError("");
      setSlots([]);
      setSlotTime("");

      try {
        const response = await apiFetch(
          `/appointment/available-slots?doctorId=${doctorId}&clinicId=${clinicId}&date=${appointmentDate}`,
        );
        const result = await response.json();

        if (!response.ok) {
          setError(result.message ?? "Could not load time slots.");
          return;
        }

        setSlots(result.slots ?? []);
      } catch {
        setError("Could not load slots. Make sure the backend is running on port 3001.");
      }
    }

    loadSlots();
  }, [doctorId, clinicId, appointmentDate]);

  const selectedDoctor =
    bookingOptions?.doctor ??
    doctors.find((doctor) => String(doctor.id) === String(doctorId)) ??
    null;
  const selectedDoctorClinicAddress =
    selectedDoctor?.chamberAddress ?? selectedDoctor?.chamber_address ?? "";
  useEffect(() => {
    setClinicId(selectedDoctorClinicAddress);
  }, [selectedDoctorClinicAddress]);
  const selectedDoctorAvailableDates =
    selectedDoctor?.availableDates ?? selectedDoctor?.available_dates ?? [];
  const selectedDoctorAvailableTimeSlots =
    selectedDoctor?.availableTimeSlots ?? selectedDoctor?.available_time_slots ?? [];
  const normalizeSlotLabel = (value) => value.split("-")[0].trim().toLowerCase();

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setConfirmation(null);

    const token = getStoredToken("admin") || getStoredToken("doctor") || getStoredToken("patient");
    if (!token) {
      setError("Please log in before booking an appointment.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await apiFetch(
        "/appointment/book",
        {
          method: "POST",
          body: JSON.stringify({
            doctorId: Number(doctorId),
            clinicId,
            appointmentDate,
            slotTime,
          }),
        },
        token,
      );
      const result = await response.json();

      if (!response.ok) {
        setError(result.message ?? "Could not book appointment.");
        return;
      }

      setConfirmation(result.appointment);
      setSlotTime("");
      setSlots((currentSlots) =>
        currentSlots.map((slot) =>
          slot.time === result.appointment.slotTime ? { ...slot, isBooked: true } : slot,
        ),
      );
    } catch {
      setError("Could not book appointment. Make sure the backend is running on port 3001.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="bg-white">
      <section className="mx-auto min-h-[calc(100vh-220px)] w-full max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-brand">
          Appointment Booking
        </p>
        <h1 className="mt-3 text-3xl font-extrabold text-slate-950">
          Book an appointment
        </h1>

        <form
          onSubmit={handleSubmit}
          className="mt-8 rounded-lg border border-brand-soft bg-[#f7fbf8] p-5 shadow-[0_18px_50px_rgba(52,92,50,0.10)]"
        >
          {!isPatientLoggedIn ? (
            <div className="mb-5 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              <p className="font-semibold">Login required to confirm booking</p>
              <p className="mt-1">
                You can review doctor details, dates, and slots, but booking will only work after login.
              </p>
              <Link href="/login" className="mt-2 inline-flex font-semibold text-brand">
                Go to login
              </Link>
            </div>
          ) : null}

          {error ? (
            <div className="mb-5 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              <p>{error}</p>
              {error.includes("log in") ? (
                <Link href="/login" className="mt-2 inline-flex font-semibold text-brand">
                  Go to login
                </Link>
              ) : null}
            </div>
          ) : null}

          {confirmation ? (
            <div className="mb-5 rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
              <p className="font-semibold">Booking confirmed</p>
              <p className="mt-1">
                {confirmation.doctor.name} at {confirmation.clinic.name} on{" "}
                {confirmation.appointmentDate} at {confirmation.slotTime}.
              </p>
              <p className="mt-1">Appointment ID: {confirmation.id}</p>
              <p>Status: {confirmation.status}</p>
            </div>
          ) : null}

          <div className="grid gap-5 md:grid-cols-2">
            <label className="block">
              <span className="text-sm font-semibold text-slate-700">Doctor</span>
              <select
                value={doctorId}
                onChange={(event) => setDoctorId(event.target.value)}
                className="mt-2 h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none focus:border-brand"
              >
                <option value="">Select doctor</option>
                {doctors.map((doctor) => (
                  <option key={doctor.id} value={doctor.id}>
                    {doctor.name} - {doctor.specialty}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="text-sm font-semibold text-slate-700">
                Hospital / Clinic
              </span>
              <select
                value={clinicId}
                onChange={(event) => setClinicId(event.target.value)}
                disabled={isLoading || !selectedDoctorClinicAddress}
                className="mt-2 h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none focus:border-brand disabled:opacity-60"
              >
                <option value="">{selectedDoctorClinicAddress || "Select clinic"}</option>
                {selectedDoctorClinicAddress ? (
                  <option value={selectedDoctorClinicAddress}>{selectedDoctorClinicAddress}</option>
                ) : null}
              </select>
            </label>
          </div>

          {selectedDoctor ? (
            <div className="mt-5">
              <DoctorCardDetails doctor={selectedDoctor} />
            </div>
          ) : null}

          <div className="mt-6 rounded-xl border border-slate-200 bg-white p-4">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-semibold text-slate-700">Available dates</p>
              {appointmentDate ? (
                <span className="text-xs font-medium text-brand">
                  Selected: {appointmentDate}
                </span>
              ) : null}
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
              {selectedDoctorAvailableDates.length === 0 ? (
                <p className="col-span-full text-sm text-slate-500">
                  No dates available.
                </p>
              ) : (
                selectedDoctorAvailableDates.map((date) => (
                  <button
                    key={date}
                    type="button"
                    onClick={() => setAppointmentDate(date)}
                    className={`h-10 rounded-full border px-3 text-xs font-semibold transition ${
                      appointmentDate === date
                        ? "border-brand bg-brand text-brand-foreground"
                        : "border-slate-300 bg-slate-50 text-slate-700 hover:border-brand hover:bg-white"
                    }`}
                  >
                    {date}
                  </button>
                ))
              )}
            </div>
          </div>

          <div className="mt-6 rounded-xl border border-slate-200 bg-white p-4">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-semibold text-slate-700">Available time slots</p>
              {slotTime ? (
                <span className="text-xs font-medium text-brand">
                  Selected: {slotTime}
                </span>
              ) : null}
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
              {selectedDoctorAvailableTimeSlots.length === 0 ? (
                <p className="col-span-full text-sm text-slate-500">
                  No slots available.
                </p>
              ) : !appointmentDate ? (
                <p className="col-span-full text-sm text-slate-500">
                  Choose a date to see available time slots.
                </p>
              ) : (
                selectedDoctorAvailableTimeSlots.map((slot) => (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => setSlotTime(normalizeSlotLabel(slot))}
                    className={`h-10 rounded-full border px-3 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${
                      slotTime === normalizeSlotLabel(slot)
                        ? "border-brand bg-brand text-brand-foreground"
                        : "border-slate-300 bg-slate-50 text-slate-700 hover:border-brand hover:bg-white"
                    }`}
                  >
                    {normalizeSlotLabel(slot)}
                  </button>
                ))
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={
              !isPatientLoggedIn ||
              !doctorId ||
              !clinicId ||
              !appointmentDate ||
              !slotTime ||
              isSubmitting
            }
            className="mt-8 inline-flex h-12 w-full items-center justify-center rounded-md bg-brand px-5 text-sm font-semibold text-brand-foreground transition hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-60"
          >
            {!isPatientLoggedIn
              ? "Log in to book"
              : isSubmitting
                ? "Booking..."
                : "Confirm appointment"}
          </button>
        </form>
      </section>
    </main>
  );
}
