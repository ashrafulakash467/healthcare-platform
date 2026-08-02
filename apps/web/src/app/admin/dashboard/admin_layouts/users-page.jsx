"use client";

export default function UsersPage({ users }) {
  return (
    <PanelCard
      eyebrow="User Management"
      title="Users"
      description="Monitor patients, doctors, hospital admins, and support roles."
    >
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {users.map((user) => (
          <div
            key={user.id}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-base font-bold text-slate-950">{user.name}</p>
                <p className="mt-1 text-sm text-slate-500">{user.email}</p>
              </div>
              <Badge tone={user.status}>{user.status}</Badge>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <Tag>{user.role}</Tag>
              <Tag>{user.channel}</Tag>
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

function Tag({ children }) {
  return (
    <span className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-600">
      {children}
    </span>
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

function badgeTone(tone) {
  if (tone === "Active") {
    return "bg-emerald-100 text-emerald-700";
  }

  if (tone === "Pending MFA" || tone === "Pending Review") {
    return "bg-amber-100 text-amber-700";
  }

  if (tone === "Suspended") {
    return "bg-red-100 text-red-700";
  }

  return "bg-slate-100 text-slate-700";
}
