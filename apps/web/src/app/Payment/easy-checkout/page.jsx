"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { apiFetch, getStoredToken } from "@/lib/api";
import PaymentSummary from "../components/PaymentSummary";

/**
 * EasyCheckout (Popup) payment page.
 *
 * Based on the SSLCommerz EasyCheckout (Popup) integration.
 * Calls POST /pay-via-ajax which returns JSON containing the gateway URL.
 * The popup is then opened via the SSLCommerz embed script.
 */
export default function EasyCheckoutPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const appointmentId = searchParams.get("appointmentId") ?? "";

  const [appointment, setAppointment] = useState(null);
  const [payment, setPayment] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPaying, setIsPaying] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!appointmentId) {
      return;
    }

    const token = getStoredToken("patient");

    if (!token) {
      router.replace("/login");
      return;
    }

    let cancelled = false;

    async function loadPaymentDetails() {
      setIsLoading(true);
      setError("");

      try {
        const response = await apiFetch(
          `/appointments/${encodeURIComponent(appointmentId)}/payment-details`,
          {},
          token,
        );
        const result = await response.json();

        if (cancelled) {
          return;
        }

        if (!response.ok) {
          setError(result.message ?? "Could not load payment details.");
          return;
        }

        setAppointment(result.appointment ?? null);
        setPayment(result.payment ?? null);
      } catch {
        if (!cancelled) {
          setError(
            "Could not load payment details. Make sure the backend is running on port 3001.",
          );
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    loadPaymentDetails();

    return () => {
      cancelled = true;
    };
  }, [appointmentId, router]);

  async function handlePayNow() {
    if (!appointmentId) {
      setError("No appointment selected.");
      return;
    }

    const token = getStoredToken("patient");

    if (!token) {
      router.replace("/login");
      return;
    }

    setIsPaying(true);
    setError("");

    try {
      const response = await apiFetch(
        "/pay-via-ajax",
        {
          method: "POST",
          body: JSON.stringify({ appointment_id: appointmentId }),
        },
        token,
      );
      const result = await response.json();

      if (!response.ok) {
        setError(result.message ?? "Could not initiate payment.");
        return;
      }

      if (result.gateway_url) {
        window.location.href = result.gateway_url;
      } else if (typeof window !== "undefined" && window.sslcommerz) {
        window.sslcommerz.init(result);
      } else {
        setError("Payment gateway did not return a valid response.");
      }
    } catch {
      setError(
        "Could not initiate payment. Make sure the backend is running on port 3001.",
      );
    } finally {
      setIsPaying(false);
    }
  }

  if (!appointmentId) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-50">
            <span className="text-3xl">⚠️</span>
          </div>
          <h1 className="mt-4 text-xl font-bold text-slate-900">No Appointment Selected</h1>
          <p className="mt-2 text-sm text-slate-500">Please select an appointment to proceed with payment.</p>
          <button
            type="button"
            onClick={() => router.push("/patient/dashboard?tab=appointments")}
            className="mt-6 inline-flex w-full items-center justify-center rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700"
          >
            Back to Appointments
          </button>
        </div>
      </main>
    );
  }

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-emerald-200 border-t-emerald-600" />
          <p className="mt-4 text-sm text-slate-500">Loading payment details...</p>
        </div>
      </main>
    );
  }

  if (error && !appointment) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-50">
            <span className="text-3xl">⚠️</span>
          </div>
          <h1 className="mt-4 text-xl font-bold text-slate-900">Payment Unavailable</h1>
          <p className="mt-2 text-sm text-slate-500">{error}</p>
          <button
            type="button"
            onClick={() => router.push("/patient/dashboard?tab=appointments")}
            className="mt-6 inline-flex w-full items-center justify-center rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700"
          >
            Back to Appointments
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-2xl">
        <div className="mb-8 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-emerald-600">EasyCheckout (Popup)</p>
          <h1 className="mt-2 text-3xl font-extrabold text-slate-900">Pay via EasyCheckout</h1>
          <p className="mt-2 text-sm text-slate-500">You will be shown a secure popup to complete your payment through SSLCOMERZ.</p>
        </div>

        {error ? (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
        ) : null}

        <PaymentSummary appointment={appointment} payment={payment} />

        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
              <span className="text-sm">🔒</span>
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">Secure SSLCOMERZ EasyCheckout</p>
              <p className="mt-0.5 text-xs text-slate-500">A secure popup will appear for you to enter your payment details. We never store your card information.</p>
            </div>
          </div>

          <button
            type="button"
            onClick={handlePayNow}
            disabled={isPaying || appointment?.paymentStatus === "paid"}
            className="mt-6 inline-flex h-12 w-full items-center justify-center rounded-lg bg-emerald-600 px-5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isPaying ? "Processing..." : appointment?.paymentStatus === "paid" ? "Already Paid" : "Pay Now (Popup)"}
          </button>

          <button
            type="button"
            onClick={() => router.push("/patient/dashboard?tab=appointments")}
            className="mt-3 inline-flex w-full items-center justify-center rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Back to Appointments
          </button>
        </div>
      </div>
    </main>
  );
}
