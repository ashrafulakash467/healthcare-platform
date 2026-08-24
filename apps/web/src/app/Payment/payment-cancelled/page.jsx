"use client";

import { useSearchParams } from "next/navigation";
import PaymentStatus from "../components/PaymentStatus";

export default function PaymentCancelledPage() {
  const searchParams = useSearchParams();
  const message = searchParams.get("message") ?? "";

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10">
      <PaymentStatus
        type="cancelled"
        title="Payment Cancelled"
        description={
          message || "You cancelled the payment process. Your appointment remains unpaid."
        }
      />
    </main>
  );
}