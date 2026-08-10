"use client";

export default function HospitalsPage({ hospitals }) {
  return (
    <PanelCard
      eyebrow="Hospital Management"
      title="Hospitals"
      description="Track onboarding status, location coverage, and operational size."
    >
      <div className="grid gap-4 lg:grid-cols-3">
        {hospitals.map((hospital) => (
          <div
            key={hospital.id}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-base font-bold text-slate-950">
                  {hospital.name}
                </p>
                <p className="mt-1 text-sm text-slate-500">{hospital.city}</p>
              </div>
              <Badge tone={hospital.status}>{hospital.status}</Badge>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <MiniMetric label="Doctors" value={hospital.doctors} tone="emerald" />
              <MiniMetric label="Beds" value={hospital.beds} tone="blue" />
            </div>
          </div>
        ))}
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

function MiniMetric({ label, value, tone = "slate" }) {
  const toneClasses =
    tone === "emerald"
      ? "bg-emerald-50 text-emerald-800"
      : tone === "amber"
        ? "bg-amber-50 text-amber-800"
        : tone === "blue"
          ? "bg-blue-50 text-blue-800"
          : "bg-slate-50 text-slate-800";

  return (
    <div className={`rounded-2xl px-4 py-3 ${toneClasses}`}>
      <p className="text-xs font-semibold uppercase tracking-wide opacity-70">
        {label}
      </p>
      <p className="mt-1 text-base font-bold">{value}</p>
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
