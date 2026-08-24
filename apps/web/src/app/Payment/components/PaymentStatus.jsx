import Link from "next/link";
import { FaCheckCircle, FaTimesCircle, FaBan } from "react-icons/fa";

export default function PaymentStatus({ type, title, description, transactionId, amount, currency }) {
  const isSuccess = type === "success";
  const isFailed = type === "failed";
  const isCancelled = type === "cancelled";

  const icon = isSuccess ? (
    <FaCheckCircle className="text-6xl text-emerald-500" />
  ) : isFailed ? (
    <FaTimesCircle className="text-6xl text-red-500" />
  ) : (
    <FaBan className="text-6xl text-slate-400" />
  );

  const formattedAmount = amount != null ? formatCurrency(amount, currency) : null;

  return (
    <div className="mx-auto w-full max-w-md">
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col items-center gap-4 px-6 py-10 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-slate-50">
            {icon}
          </div>

          <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
          <p className="text-sm text-slate-500">{description}</p>

          {transactionId ? (
            <div className="w-full rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                Transaction ID
              </p>
              <p className="mt-0.5 break-all text-sm font-semibold text-slate-700">
                {transactionId}
              </p>
            </div>
          ) : null}

          {formattedAmount ? (
            <div className="w-full rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                Amount
              </p>
              <p className="mt-0.5 text-sm font-bold text-slate-900">{formattedAmount}</p>
            </div>
          ) : null}

          <div className="mt-2 flex w-full flex-col gap-2">
            {isSuccess ? (
              <Link
                href="/patient/dashboard?tab=appointments"
                className="inline-flex w-full items-center justify-center rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700"
              >
                View My Appointment
              </Link>
            ) : (
              <>
                <Link
                  href="/patient/dashboard?tab=appointments"
                  className="inline-flex w-full items-center justify-center rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700"
                >
                  Try Again
                </Link>
                <Link
                  href="/patient/dashboard?tab=appointments"
                  className="inline-flex w-full items-center justify-center rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Back to Appointments
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function formatCurrency(amount, currency) {
  const symbol = currency === "BDT" ? "৳" : currency === "USD" ? "$" : `${currency} `;
  return `${symbol}${Number(amount).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}