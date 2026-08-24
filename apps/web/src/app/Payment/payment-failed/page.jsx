"use client";

import { useSearchParams } from "next/navigation";
import PaymentStatus from "../components/PaymentStatus";

export default function PaymentFailedPage() {
  const searchParams = useSearchParams();
  const message = searchParams.get("message") ?? "";

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10">
      <PaymentStatus
        type="failed"
        title="Payment Failed"
        description={
          message || "Your payment could not be completed. Please try again."
        }
      />
    </main>
  );
}