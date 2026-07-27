"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function RescheduleAppointmentPage() {
  const router = useRouter();
  const [appointmentId, setAppointmentId] = useState("");
  const [appointment, setAppointment] = useState(null);
  const [dates, setDates] = useState([]);
  const [appointmentDate, setAppointmentDate] = useState("");
  const [slots, setSlots] = useState([]);
  const [slotTime, setSlotTime] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const urlAppointmentId =
      new URLSearchParams(window.location.search).get("appointmentId") ?? "";
    setAppointmentId(urlAppointmentId);
  }, []);

  useEffect(() => {
    if (!appointmentId) {
      return;
    }

    async function loadOptions() {
      const token = localStorage.getItem("patientToken");
      if (!token) {
        router.replace("/login");
        return;
      }

      setIsLoading(true);
      setError("");

      try {
        const response = await fetch(
          `http://localhost:3001/appointment/reschedule-options?appointmentId=${appointmentId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );
        const result = await response.json();

        if (!response.ok) {
          setError(result.message ?? "Could not load reschedule options.");
          return;
        }

        setAppointment(result.appointment);
        setDates(result.dates ?? []);
      } catch {
        setError("Could not load reschedule options. Make sure the backend is running on port 3001.");
      } finally {
        setIsLoading(false);
      }
    }

    loadOptions();
  }, [appointmentId, router]);

  useEffect(() => {
    if (!appointmentId || !appointmentDate) {
      setSlots([]);
      setSlotTime("");
      return;
    }

    async function loadSlots() {
      const token = localStorage.getItem("patientToken");
      setError("");
      setSlots([]);
      setSlotTime("");

      try {
        const response = await fetch(
          `http://localhost:3001/appointment/reschedule-slots?appointmentId=${appointmentId}&date=${appointmentDate}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
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
  }, [appointmentId, appointmentDate]);

  async function handleSubmit(event) {
    event.preventDefault();
    const token = localStorage.getItem("patientToken");
    if (!token) {
      router.replace("/login");
      return;
    }

    setError("");
    setMessage("");
    setIsSubmitting(true);

    try {
      const response = await fetch("http://localhost:3001/appointment/reschedule", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          appointmentId,
          appointmentDate,
          slotTime,
        }),
      });
      const result = await response.json();

      if (!response.ok) {
        setError(result.message ?? "Could not reschedule appointment.");
        return;
      }

      setAppointment(result.appointment);
      setMessage(result.message ?? "Appointment rescheduled successfully.");
      setSlotTime("");
    } catch {
      setError("Could not reschedule appointment. Make sure the backend is running on port 3001.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="bg-white">
      <section className="mx-auto min-h-[calc(100vh-220px)] w-full max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-brand">
          Reschedule Appointment
        </p>
        <h1 className="mt-3 text-3xl font-extrabold text-slate-950">
          Choose a new time
        </h1>

        <form
          onSubmit={handleSubmit}
          className="mt-8 rounded-lg border border-brand-soft bg-[#f7fbf8] p-5 shadow-[0_18px_50px_rgba(52,92,50,0.10)]"
        >
          {error ? (
            <p className="mb-5 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </p>
          ) : null}

          {message ? (
            <p className="mb-5 rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
              {message}
            </p>
          ) : null}

          {isLoading ? (
            <p className="rounded-md border border-blue-100 bg-blue-50 px-4 py-5 text-sm text-blue-700">
              Loading appointment...
            </p>
          ) : null}

          {appointment ? (
            <div className="rounded-md border border-blue-100 bg-white p-4 text-sm text-slate-700">
              <p className="font-semibold text-slate-950">
                {appointment.doctor.name}
              </p>
              <p className="mt-1">
                {appointment.doctor.specialty} · {appointment.clinic.name}
              </p>
              <p className="mt-1">
                Current: {appointment.appointmentDate} at {appointment.slotTime}
              </p>
              <p className="mt-1 text-xs font-semibold uppercase tracking-[0.16em] text-brand">
                {appointment.status}
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
            </div>
          </div>

          <div className="mt-6">
            <p className="text-sm font-semibold text-slate-700">Available slots</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {slots.map((slot) => (
                <button
                  key={slot.time}
                  type="button"
                  onClick={() => setSlotTime(slot.time)}
                  className={`h-10 rounded border px-4 text-xs font-semibold ${
                    slotTime === slot.time
                      ? "border-brand bg-brand text-brand-foreground"
                      : "border-slate-300 bg-white text-slate-700 hover:border-brand"
                  }`}
                >
                  {slot.time}
                </button>
              ))}
              {appointmentDate && slots.length === 0 ? (
                <span className="text-sm text-slate-500">No slots available.</span>
              ) : null}
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <button
              type="submit"
              disabled={!appointmentDate || !slotTime || isSubmitting}
              className="inline-flex h-12 flex-1 items-center justify-center rounded-md bg-brand px-5 text-sm font-semibold text-brand-foreground transition hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? "Rescheduling..." : "Confirm reschedule"}
            </button>
            <Link
              href="/patient/dashboard"
              className="inline-flex h-12 items-center justify-center rounded-md border border-brand px-5 text-sm font-semibold text-brand transition hover:bg-brand hover:text-brand-foreground"
            >
              Back to dashboard
            </Link>
          </div>
        </form>
      </section>
    </main>
  );
}
