"use client";

export default function SettingsPage({ settings, onToggleSetting }) {
  return (
    <PanelCard
      eyebrow="System Settings"
      title="Settings"
      description="Turn platform controls on or off and keep security policies in sync."
    >
      <div className="grid gap-4 lg:grid-cols-2">
        <ToggleCard
          title="MFA Enforcement"
          detail="Require OTP or a second factor for all admin logins."
          enabled={settings.mfaEnabled}
          onToggle={() => onToggleSetting("mfaEnabled")}
        />
        <ToggleCard
          title="Doctor Auto Review"
          detail="Automatically approve doctors that pass policy checks."
          enabled={settings.doctorAutoReview}
          onToggle={() => onToggleSetting("doctorAutoReview")}
        />
        <ToggleCard
          title="Patient Signup"
          detail="Allow new patients to register from the public portal."
          enabled={settings.patientSignupOpen}
          onToggle={() => onToggleSetting("patientSignupOpen")}
        />
        <ToggleCard
          title="Maintenance Mode"
          detail="Temporarily pause public access for planned maintenance."
          enabled={settings.maintenanceMode}
          onToggle={() => onToggleSetting("maintenanceMode")}
        />
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

function ToggleCard({ title, detail, enabled, onToggle }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-base font-bold text-slate-950">{title}</p>
          <p className="mt-1 text-sm text-slate-500">{detail}</p>
        </div>
        <button
          type="button"
          onClick={onToggle}
          className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
            enabled
              ? "bg-emerald-50 text-emerald-700"
              : "bg-slate-100 text-slate-600"
          }`}
        >
          {enabled ? "Enabled" : "Disabled"}
        </button>
      </div>
    </div>
  );
}
