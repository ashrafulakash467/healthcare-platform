"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function BookAppointmentPage() {
  const [doctors, setDoctors] = useState([]);
  const [doctorId, setDoctorId] = useState("");
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

  useEffect(() => {
    const urlDoctorId = new URLSearchParams(window.location.search).get("doctorId") ?? "";
    setDoctorId(urlDoctorId);

    async function loadDoctors() {
      try {
        const response = await fetch("http://localhost:3001/doctor/search?limit=50&sort=name_asc");
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
      setBookingOptions(null);
      setClinicId("");
      setDates([]);
      setAppointmentDate("");
      setSlots([]);
      setSlotTime("");
      return;
    }

    async function loadOptions() {
      setIsLoading(true);
      setError("");
      setBookingOptions(null);
      setClinicId("");
      setDates([]);
      setAppointmentDate("");
      setSlots([]);
      setSlotTime("");

      try {
        const response = await fetch(
          `http://localhost:3001/appointment/booking-options?doctorId=${doctorId}`,
        );
        const result = await response.json();

        if (!response.ok) {
          setError(result.message ?? "Could not load booking options.");
          return;
        }

        setBookingOptions(result);
        if (result.clinics?.length === 1) {
          setClinicId(String(result.clinics[0].id));
        }
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
      setDates([]);
      setAppointmentDate("");
      return;
    }

    async function loadDates() {
      setError("");
      setDates([]);
      setAppointmentDate("");
      setSlots([]);
      setSlotTime("");

      try {
        const response = await fetch(
          `http://localhost:3001/appointment/available-dates?doctorId=${doctorId}&clinicId=${clinicId}`,
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
      setSlots([]);
      setSlotTime("");
      return;
    }

    async function loadSlots() {
      setError("");
      setSlots([]);
      setSlotTime("");

      try {
        const response = await fetch(
          `http://localhost:3001/appointment/available-slots?doctorId=${doctorId}&clinicId=${clinicId}&date=${appointmentDate}`,
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

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setConfirmation(null);

    const token = localStorage.getItem("patientToken");
    if (!token) {
      setError("Please log in before booking an appointment.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("http://localhost:3001/appointment/book", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          doctorId: Number(doctorId),
          clinicId: Number(clinicId),
          appointmentDate,
          slotTime,
        }),
      });
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
                disabled={!bookingOptions || isLoading}
                className="mt-2 h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none focus:border-brand disabled:opacity-60"
              >
                <option value="">Select clinic</option>
                {bookingOptions?.clinics?.map((clinic) => (
                  <option key={clinic.id} value={clinic.id}>
                    {clinic.name} - {clinic.location}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {bookingOptions?.doctor ? (
            <div className="mt-5 rounded-md border border-blue-100 bg-white p-4 text-sm text-slate-700">
              <p className="font-semibold text-slate-950">
                {bookingOptions.doctor.name}
              </p>
              <p>
                {bookingOptions.doctor.specialty} · {bookingOptions.doctor.location}
              </p>
            </div>
          ) : null}

          <div className="mt-6">
            <p className="text-sm font-semibold text-slate-700">Available dates</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {dates.map((date) => (
                <button
                  key={date}
                  type="button"
                  onClick={() => setAppointmentDate(date)}
                  className={`h-10 rounded border px-4 text-xs font-semibold ${
                    appointmentDate === date
                      ? "border-brand bg-brand text-brand-foreground"
                      : "border-slate-300 bg-white text-slate-700 hover:border-brand"
                  }`}
                >
                  {date}
                </button>
              ))}
              {clinicId && dates.length === 0 ? (
                <span className="text-sm text-slate-500">No dates available.</span>
              ) : null}
            </div>
          </div>

          <div className="mt-6">
            <p className="text-sm font-semibold text-slate-700">Available time slots</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {slots.map((slot) => (
                <button
                  key={slot.time}
                  type="button"
                  disabled={slot.isBooked}
                  onClick={() => setSlotTime(slot.time)}
                  className={`h-10 rounded border px-4 text-xs font-semibold disabled:cursor-not-allowed disabled:opacity-50 ${
                    slotTime === slot.time
                      ? "border-brand bg-brand text-brand-foreground"
                      : "border-slate-300 bg-white text-slate-700 hover:border-brand"
                  }`}
                >
                  {slot.time}
                  {slot.isBooked ? " booked" : ""}
                </button>
              ))}
              {appointmentDate && slots.length === 0 ? (
                <span className="text-sm text-slate-500">No slots available.</span>
              ) : null}
            </div>
          </div>

          <button
            type="submit"
            disabled={!doctorId || !clinicId || !appointmentDate || !slotTime || isSubmitting}
            className="mt-8 inline-flex h-12 w-full items-center justify-center rounded-md bg-brand px-5 text-sm font-semibold text-brand-foreground transition hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? "Booking..." : "Confirm appointment"}
          </button>
        </form>
      </section>
    </main>
  );
}
