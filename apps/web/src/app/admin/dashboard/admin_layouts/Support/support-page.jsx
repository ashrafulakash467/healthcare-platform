"use client";

export default function SupportPage({ tickets, selectedTicketId, onSelectTicket, onMessage }) {
  const selectedTicket = tickets.find((ticket) => ticket.id === selectedTicketId) ?? tickets[0];

  return (
    <PanelCard
      eyebrow="Support"
      title="Support Tickets"
      description="Handle urgent issues, follow-ups, and customer support requests."
    >
      <div className="grid gap-6 xl:grid-cols-[1fr_0.95fr]">
        <section className="space-y-3">
          {tickets.map((ticket) => (
            <button
              key={ticket.id}
              type="button"
              onClick={() => onSelectTicket(ticket.id)}
              className={`w-full rounded-2xl border p-5 text-left transition ${
                selectedTicket?.id === ticket.id
                  ? "border-slate-950 bg-slate-950 text-white"
                  : "border-slate-200 bg-white hover:bg-slate-50"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-base font-bold">{ticket.subject}</p>
                  <p className="mt-1 text-sm opacity-80">{ticket.requester}</p>
                </div>
                <Badge tone={ticket.priority}>{ticket.priority}</Badge>
              </div>
              <p className="mt-3 text-sm opacity-80">Status: {ticket.status}</p>
            </button>
          ))}
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <SectionHeader
            eyebrow="Ticket Detail"
            title={selectedTicket?.subject ?? "Select a ticket"}
            description="Read the issue and respond with support actions."
          />
          {selectedTicket ? (
            <>
              <div className="mt-5 grid gap-3 text-sm text-slate-600">
                <InfoRow label="Requester" value={selectedTicket.requester} />
                <InfoRow label="Priority" value={selectedTicket.priority} />
                <InfoRow label="Status" value={selectedTicket.status} />
              </div>
              <div className="mt-5 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => onMessage("Support ticket marked in progress.")}
                  className="rounded-xl bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
                >
                  Mark In Progress
                </button>
                <button
                  type="button"
                  onClick={() => onMessage("Reply drafted for support ticket.")}
                  className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Draft Reply
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
