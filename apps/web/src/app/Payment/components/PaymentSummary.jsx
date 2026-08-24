import { FaUserMd, FaCalendarAlt, FaClock, FaStethoscope, FaMoneyBillWave } from "react-icons/fa";

export default function PaymentSummary({ appointment, payment }) {
  const amountCents = appointment?.amountCents ?? 0;
  const currency = appointment?.currency ?? "BDT";
  const formattedAmount = formatCurrency(amountCents, currency);

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 bg-emerald-50/60 px-6 py-5">
        <h2 className="text-lg font-bold text-slate-900">Payment Details</h2>
        <p className="mt-0.5 text-sm text-slate-500">
          Review your appointment and proceed to secure payment.
        </p>
      </div>

      <div className="space-y-5 px-6 py-6">
        {/* Doctor */}
        <div className="flex items-start gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
            <FaUserMd className="text-lg" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
              Doctor
            </p>
            <p className="mt-0.5 text-sm font-bold text-slate-900">
              {appointment?.doctor?.name ?? "Unknown Doctor"}
            </p>
            <p className="text-sm text-slate-500">
              {appointment?.doctor?.specialty ?? "General Medicine"}
            </p>
          </div>
        </div>

        {/* Appointment Date */}
        <div className="flex items-start gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
            <FaCalendarAlt className="text-lg" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
              Appointment Date
            </p>
            <p className="mt-0.5 text-sm font-bold text-slate-900">
              {appointment?.appointmentDate ?? "—"}
            </p>
          </div>
        </div>

        {/* Appointment Time */}
        <div className="flex items-start gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
            <FaClock className="text-lg" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
              Appointment Time
            </p>
            <p className="mt-0.5 text-sm font-bold text-slate-900">
              {appointment?.slotTime ?? "—"}
            </p>
          </div>
        </div>

        {/* Appointment Type */}
        <div className="flex items-start gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
            <FaStethoscope className="text-lg" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
              Appointment Type
            </p>
            <p className="mt-0.5 text-sm font-bold capitalize text-slate-900">
              {formatConsultationType(appointment?.consultationType)}
            </p>
          </div>
        </div>

        {/* Consultation Fee */}
        <div className="flex items-start gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
            <FaMoneyBillWave className="text-lg" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
              Consultation Fee
            </p>
            <p className="mt-0.5 text-sm font-bold text-slate-900">
              {formattedAmount}
            </p>
          </div>
        </div>

        {/* Payment Status */}
        <div className="flex items-start gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
            <span className="text-lg">💳</span>
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
              Payment Status
            </p>
            <span
              className={`mt-1 inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${getPaymentStatusTone(appointment?.paymentStatus)}`}
            >
              {appointment?.paymentStatus ?? "unknown"}
            </span>
          </div>
        </div>

        {payment?.transactionNo ? (
          <div className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
              Transaction
            </p>
            <p className="mt-0.5 text-sm font-semibold text-slate-700">
              {payment.transactionNo}
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function formatCurrency(amountCents, currency) {
  const amount = Number(amountCents) / 100;
  const symbol = currency === "BDT" ? "৳" : currency === "USD" ? "$" : `${currency} `;
  return `${symbol}${amount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function formatConsultationType(type) {
  if (!type) {
    return "In-person";
  }

  return type.replace(/_/g, " ");
}

function getPaymentStatusTone(status) {
  switch (status) {
    case "paid":
      return "bg-emerald-100 text-emerald-700";
    case "pending":
    case "processing":
      return "bg-amber-100 text-amber-700";
    case "failed":
      return "bg-red-100 text-red-700";
    case "cancelled":
      return "bg-slate-100 text-slate-600";
    default:
      return "bg-slate-100 text-slate-600";
  }
}