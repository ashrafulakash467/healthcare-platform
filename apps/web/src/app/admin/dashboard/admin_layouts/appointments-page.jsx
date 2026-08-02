"use client";

export default function AppointmentsPage({
  appointments,
  selectedAppointmentId,
  onSelectAppointment,
  onMessage,
}) {
  const selectedAppointment =
    appointments.find((appointment) => appointment.id === selectedAppointmentId) ??
    appointments[0];

  return (
    <PanelCard
      eyebrow="Appointment Management"
      title="Appointments"
      description="Open bookings, review details, and process accept, reject, or reschedule actions."
    >
      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <section className="space-y-3">
          {appointments.map((appointment) => (
            <button
              key={appointment.id}
              type="button"
              onClick={() => onSelectAppointment(appointment.id)}
              className={`w-full rounded-2xl border p-5 text-left transition ${
                selectedAppointment?.id === appointment.id
                  ? "border-slate-950 bg-slate-950 text-white"
                  : "border-slate-200 bg-white hover:bg-slate-50"
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-base font-bold">{appointment.patient}</p>
                <Badge tone={appointment.status}>{appointment.status}</Badge>
              </div>
              <p className="mt-2 text-sm opacity-80">
                {appointment.doctor} - {appointment.type}
              </p>
              <p className="mt-1 text-sm opacity-80">
                {appointment.time} - Payment {appointment.payment}
              </p>
            </button>
          ))}
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <SectionHeader
            eyebrow="Open Appointment"
            title={selectedAppointment?.patient ?? "Select appointment"}
            description="Review the selected appointment and move it through the workflow."
          />

          {selectedAppointment ? (
            <>
              <div className="mt-5 grid gap-3 text-sm text-slate-600">
                <InfoRow label="Doctor" value={selectedAppointment.doctor} />
                <InfoRow label="Time" value={selectedAppointment.time} />
                <InfoRow label="Type" value={selectedAppointment.type} />
                <InfoRow label="Payment" value={selectedAppointment.payment} />
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => onMessage("Patient details reviewed.")}
                  className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Review Patient Details
                </button>
                <button
                  type="button"
                  onClick={() => onMessage("Appointment accepted.")}
                  className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700"
                >
                  Accept
                </button>
                <button
                  type="button"
                  onClick={() => onMessage("Appointment rejected.")}
                  className="rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-100"
                >
                  Reject
                </button>
                <button
                  type="button"
                  onClick={() => onMessage("Appointment moved to reschedule queue.")}
                  className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-700 transition hover:bg-amber-100"
                >
                  Reschedule
                </button>
              </div>
            </>
          ) : null}
        </section>
      </div>
    </PanelCard>
  );
}

function PanelCard({ eyebrow, title, description, children }) {
  return (
    <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
      <SectionHeader eyebrow={eyebrow} title={title} description={description} />
      <div className="mt-5">{children}</div>
    </section>
  );
}

function SectionHeader({ eyebrow, title, description }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
        {eyebrow}
      </p>
      <h2 className="mt-2 text-2xl font-bold text-slate-950">{title}</h2>
      <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
        {description}
      </p>
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-xl bg-slate-50 px-4 py-3">
      <span className="text-slate-500">{label}</span>
      <span className="text-right font-semibold text-slate-900">{value}</span>
    </div>
  );
}

function Badge({ children, tone }) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide ${badgeTone(tone)}`}
    >
      {children}
    </span>
  );
}

function badgeTone(value) {
  const text = String(value ?? "").toLowerCase();

  if (
    text.includes("approved") ||
    text.includes("paid") ||
    text.includes("settled") ||
    text.includes("active") ||
    text.includes("onboarded") ||
    text.includes("ready")
  ) {
    return "bg-emerald-50 text-emerald-700";
  }

  if (
    text.includes("pending") ||
    text.includes("review") ||
    text.includes("refund") ||
    text.includes("otp") ||
    text.includes("high")
  ) {
    return "bg-amber-50 text-amber-700";
  }

  if (text.includes("reject") || text.includes("suspend")) {
    return "bg-red-50 text-red-700";
  }

  if (text.includes("open") || text.includes("draft")) {
    return "bg-blue-50 text-blue-700";
  }

  return "bg-slate-100 text-slate-700";
}
