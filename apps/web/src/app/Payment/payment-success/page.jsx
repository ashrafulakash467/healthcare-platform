"use client";

import { useSearchParams } from "next/navigation";
import PaymentStatus from "../components/PaymentStatus";

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams();
  const transactionId = searchParams.get("transaction_id") ?? "";
  const message = searchParams.get("message") ?? "";

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10">
      <PaymentStatus
        type="success"
        title="Payment Successful"
        description={
          message ||
          "Your appointment payment has been completed successfully."
        }
        transactionId={transactionId}
      />
    </main>
  );
}