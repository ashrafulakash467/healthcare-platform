export default function PaymentSummary({ appointment, payment }) {
  const amount = payment?.amount ?? appointment?.consultationFee ?? 0;
  const currency = payment?.currency ?? "BDT";
  const status = payment?.status ?? appointment?.paymentStatus ?? "Pending";
  const doctorName = appointment?.doctor?.name ?? appointment?.doctorName ?? "—";
  const patientName = appointment?.patient?.name ?? appointment?.patientName ?? "—";
  const appointmentDate = appointment?.appointmentDate ?? appointment?.date ?? "—";
  const appointmentTime = appointment?.appointmentTime ?? appointment?.time ?? "—";

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-bold text-slate-900">Payment Summary</h2>
      <p className="mt-1 text-sm text-slate-500">
        Review your appointment details before proceeding to payment.
      </p>

      <div className="mt-5 space-y-3">
        <SummaryRow label="Doctor" value={doctorName} />
        <SummaryRow label="Patient" value={patientName} />
        <SummaryRow label="Date" value={appointmentDate} />
        <SummaryRow label="Time" value={appointmentTime} />
        <SummaryRow label="Status" value={status} />
      </div>

      <div className="mt-5 flex items-center justify-between rounded-xl bg-emerald-50 px-4 py-3">
        <span className="text-sm font-semibold text-emerald-700">Total Amount</span>
        <span className="text-lg font-bold text-emerald-700">
          {currency} {Number(amount).toFixed(2)}
        </span>
      </div>
    </div>
  );
}

function SummaryRow({ label, value }) {
  return (
    <div className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
      <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">
        {label}
      </span>
      <span className="text-sm font-semibold text-slate-700">{value}</span>
    </div>
  );
}
