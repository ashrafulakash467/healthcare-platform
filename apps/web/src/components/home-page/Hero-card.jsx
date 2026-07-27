"use client";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";

const specialties = [
  { title: "Gynecologist & Obstetrician", icon: <GyneIcon /> },
  { title: "Medicine Specialist", icon: <MedicineIcon /> },
  { title: "Cardiologist", icon: <CardioIcon /> },
  { title: "Pediatrician", icon: <ChildIcon /> },
  { title: "General Surgeon", icon: <SurgeryIcon /> },
  { title: "Otolaryngologists (ENT)", icon: <EntIcon /> },
];

const emergencyCards = [
  {
    title: "AC Ambulance",
    items: [
      "Get ambulance within 30 minutes*",
      "24/7 affordable quality service",
      "We are just a call away: 01405600700",
    ],
    accent: "#ff5f6d",
  },
  {
    title: "ICU Ambulance",
    items: [
      "Get ambulance within 30 minutes*",
      "24/7 affordable quality service",
      "We are just a call away: 01405600700",
    ],
    accent: "#305fbd",
  },
  {
    title: "AIR Ambulance",
    items: [
      "Get ambulance within 60 minutes*",
      "24/7 affordable quality service",
      "We are just a call away: 01405600700",
    ],
    accent: "#ff8a34",
  },
];

const diagnostics = [
  "CT Scan",
  "Blood Tests",
  "Endoscopy",
  "Ultrasound",
  "X-Ray",
  "Microbiology",
];

const recentSearches = [
  "Physical Medicine Specialist",
  "Arthritis and Pain Management",
];

const services = [
  {
    title: "General physician",
    description: "Start a consultation from anywhere.",
    accent: "from-brand-soft to-brand-muted",
       icon: "/images/doctors/doctor-and-corona-virus-vaccine-concept-free-vector (1).jpg",
  },
  {
    title: "Gynecologist",
    description: "Book a clinic visit in a few taps.",
    accent: "from-brand-muted to-brand-strong",
    icon: "/images/doctors/young-man-nurse-wearing-scrubs-260nw-2540364355.jpg",
  },
  {
    title: "Dermatologist",
    description: "Get clinical care where you are.",
    accent: "from-brand-strong to-brand",
    icon: "/images/doctors/fale-doctor-with-stethoscope.jpg",
  },
  {
    title: "Neurologist",
    description: "Fast response when every minute counts.",
    accent: "from-brand-soft to-brand",
    icon: "/images/doctors/illustration-of-cute-male-doctor-with-stethoscope-kawaii-cartoon-character-design-vector.jpg",
  },
  {
    title: "Pediatricians",
    description: "Rehab and support tailored at home.",
    accent: "from-brand-muted to-brand-soft",
    icon: "/images/doctors/woman-doctor-in-protection-mask-with-stethoscope-warns-isolated-vector (1).jpg",
  },
];

function CheckIcon({ className = "" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="m20 6-11 11-5-5" />
    </svg>
  );
}

function ArrowRightIcon({ className = "" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M5 12h13" />
      <path d="m13 6 6 6-6 6" />
    </svg>
  );
}

function SpecialtyIconShell({ children }) {
  return (
    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#1e96ff] text-white shadow-[0_12px_26px_rgba(30,150,255,0.35)]">
      {children}
    </div>
  );
}

function GyneIcon() {
  return (
    <SpecialtyIconShell>
      <svg
        viewBox="0 0 48 48"
        className="h-9 w-9"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M18 20c2-5 10-5 12 0" />
        <path d="M14 28c3 4 6 6 10 6s7-2 10-6" />
        <path d="M24 34v8" />
        <path d="M19 42h10" />
        <circle cx="24" cy="16" r="4" />
      </svg>
    </SpecialtyIconShell>
  );
}

function MedicineIcon() {
  return (
    <SpecialtyIconShell>
      <svg
        viewBox="0 0 48 48"
        className="h-9 w-9"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M16 14 34 32" />
        <rect x="10" y="18" width="16" height="24" rx="8" />
        <rect x="22" y="6" width="16" height="24" rx="8" />
      </svg>
    </SpecialtyIconShell>
  );
}

function CardioIcon() {
  return (
    <SpecialtyIconShell>
      <svg
        viewBox="0 0 48 48"
        className="h-9 w-9"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M24 38s-12-7-12-17a7 7 0 0 1 12-4 7 7 0 0 1 12 4c0 10-12 17-12 17Z" />
        <path d="M18 23h4l2-5 3 11 2-6h5" />
      </svg>
    </SpecialtyIconShell>
  );
}

function ChildIcon() {
  return (
    <SpecialtyIconShell>
      <svg
        viewBox="0 0 48 48"
        className="h-9 w-9"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="24" cy="20" r="10" />
        <path d="M16 32c2-3 5-4 8-4s6 1 8 4" />
        <circle cx="20" cy="18" r="1.5" fill="currentColor" stroke="none" />
        <circle cx="28" cy="18" r="1.5" fill="currentColor" stroke="none" />
        <path d="M21 24c1 1 5 1 6 0" />
      </svg>
    </SpecialtyIconShell>
  );
}

function SurgeryIcon() {
  return (
    <SpecialtyIconShell>
      <svg
        viewBox="0 0 48 48"
        className="h-9 w-9"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="m30 10 8 8" />
        <path d="M18 30 34 14" />
        <path d="M10 38h8" />
        <path d="M14 30v8" />
        <path d="m31 13 4-4 4 4-4 4" />
      </svg>
    </SpecialtyIconShell>
  );
}

function EntIcon() {
  return (
    <SpecialtyIconShell>
      <svg
        viewBox="0 0 48 48"
        className="h-9 w-9"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M18 35c-4-2-6-5-6-10 0-7 5-13 12-13s12 6 12 13c0 5-2 8-6 10" />
        <path d="M24 29v9" />
        <path d="M24 15c0 4-3 6-3 9 0 3 2 5 5 5" />
      </svg>
    </SpecialtyIconShell>
  );
}

function DiagnosticIcon({ index }) {
  const icons = [
    <svg
      key="ct"
      viewBox="0 0 48 48"
      className="h-10 w-10"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="8" y="13" width="32" height="22" rx="4" />
      <path d="M13 35h22" />
      <path d="M18 18h12" />
      <circle cx="24" cy="24" r="6" />
    </svg>,
    <svg
      key="blood"
      viewBox="0 0 48 48"
      className="h-10 w-10"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 10h16" />
      <path d="M24 10v10l-8 14" />
      <path d="M12 36h24" />
      <circle cx="18" cy="29" r="3" />
      <circle cx="29" cy="33" r="3" />
    </svg>,
    <svg
      key="endo"
      viewBox="0 0 48 48"
      className="h-10 w-10"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 34c6-1 10-8 12-14l4-8" />
      <path d="M31 11h5l-2 11" />
      <circle cx="20" cy="26" r="4" />
    </svg>,
    <svg
      key="us"
      viewBox="0 0 48 48"
      className="h-10 w-10"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="8" y="12" width="24" height="18" rx="2" />
      <path d="M14 35h20" />
      <path d="M19 18c2 5 5 7 9 8" />
      <circle cx="20" cy="19" r="4" />
    </svg>,
    <svg
      key="xray"
      viewBox="0 0 48 48"
      className="h-10 w-10"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="8" y="10" width="32" height="28" rx="3" />
      <path d="M16 38V10" />
      <path d="M32 10v28" />
      <path d="M16 19c4 0 6 4 8 8s4 8 8 8" />
    </svg>,
    <svg
      key="micro"
      viewBox="0 0 48 48"
      className="h-10 w-10"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M16 34h16" />
      <path d="M20 34V19l-6-7" />
      <path d="M24 18h10" />
      <circle cx="34" cy="18" r="4" />
      <circle cx="33" cy="27" r="7" />
    </svg>,
  ];

  return icons[index] ?? icons[0];
}



export default function HeroCard() {
  const [doctors, setDoctors] = useState([]);

  useEffect(() => {
    async function loadDoctors() {
      try {
        const response = await fetch(
          "http://localhost:3001/doctor/search?page=1&limit=50&sort=name_asc"
        );

        const result = await response.json();

        if (response.ok) {
          setDoctors(result.data ?? []);
        }
      } catch (error) {
        console.error("Failed to load doctors:", error);
      }
    }

    loadDoctors();
  }, []);
  return (
    <main className="bg-white">
      <section className="relative overflow-hidden bg-[linear-gradient(180deg,var(--brand-soft)_0%,#eff8ff_52%,#ffffff_100%)]">
      <div className="absolute inset-x-0 top-0 h-56 bg-[radial-gradient(circle_at_top_left,rgba(167,240,221,0.7),transparent_38%),radial-gradient(circle_at_top_right,rgba(156,172,84,0.22),transparent_30%)]" />

      <div className="relative mx-auto flex w-full max-w-7xl flex-col px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <div className="rounded-[2rem] border border-white/80 bg-white/70 px-5 py-10 shadow-[0_24px_90px_rgba(52,92,50,0.12)] backdrop-blur-md sm:px-8 lg:px-14 lg:py-14">
          <div className="mx-auto flex max-w-4xl flex-col items-center text-center">
            <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-brand-strong/30 bg-brand-soft px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-brand">
              Home care booking
            </span>
            <h1 className="max-w-4xl text-4xl font-extrabold tracking-tight text-brand sm:text-5xl lg:text-6xl">
              Book care faster with a calm, nature-inspired interface.
            </h1>
            <p className="mt-5 max-w-3xl text-base leading-8 text-slate-600 sm:text-lg">
              Use the new palette to make the experience feel trusted, fresh,
              and easy to scan while keeping the home-care journey front and
              center.
            </p>

            <div className="mt-10 w-full max-w-3xl">
              <div className="flex items-center gap-3 rounded-full border border-white bg-white px-4 py-3 shadow-[0_18px_40px_rgba(52,92,50,0.10)]">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand-soft text-brand">
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 24 24"
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <circle cx="11" cy="11" r="7" />
                    <path d="m20 20-3.5-3.5" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Search doctors, hospitals, clinics..."
                  className="w-full border-0 bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400 sm:text-base"
                />
                <button className="hidden rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-brand-foreground transition hover:bg-brand-hover sm:inline-flex">
                  Search
                </button>
              </div>

              <div className="mt-4 flex flex-col items-center gap-3 text-sm sm:flex-row sm:justify-center">
                <span className="text-slate-500">Recent:</span>
                <div className="flex flex-wrap justify-center gap-2">
                  {recentSearches.map((item) => (
                    <Link
                      key={item}
                      href="#"
                      className="rounded-full border border-brand-strong bg-brand-soft px-4 py-2 text-brand transition hover:bg-brand-soft"
                    >
                      {item}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-12 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
              {services.map((service) => (
                <article
                  key={service.title}
                  className="group overflow-hidden rounded-[1.75rem] bg-white shadow-[0_16px_50px_rgba(52,92,50,0.08)] ring-1 ring-brand/8 transition-transform duration-300 hover:-translate-y-1"
                >
                  {/* Image Frame */}
                  <div
                    className={`relative h-56 overflow-hidden bg-gradient-to-br ${service.accent}`}
                  >
                    {/* Doctor Image */}
                    <img
                      src={service.icon}
                      alt={service.title}
                      className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.45),transparent_28%),radial-gradient(circle_at_70%_70%,rgba(255,255,255,0.2),transparent_25%)]" />
                  </div>

                  {/* Content */}
                  <div className="p-5 text-center">
                    <h2 className="text-xl font-extrabold text-slate-900">
                      {service.title}
                    </h2>

                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      {service.description}
                    </p>
                  </div>
                </article>
              ))}
          </div>
        </div>
      </div>
      </section>
      <section className="bg-[#dff0ff] py-10">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-[2.1rem]">
                Consult our top specialized doctors
              </h2>
              <p className="mt-2 text-base text-slate-600">
                Our doctors are ready to serve you 24/7
              </p>
            </div>
            <Link
              href="#"
              className="hidden items-center gap-2 text-base font-semibold text-[#0b63c8] transition hover:text-[#084c99] sm:inline-flex"
            >
              View all
              <ArrowRightIcon className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-10 grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-6 lg:gap-8">
            {specialties.map((item) => (
              <article key={item.title} className="text-center">
                <div className="mx-auto flex h-28 w-28 items-center justify-center rounded-full bg-[#d7ecff] shadow-[0_10px_24px_rgba(11,99,200,0.10)] ring-8 ring-[#eef7ff]">
                  <div className="text-[#1b8fe0]">{item.icon}</div>
                </div>
                <h3 className="mt-5 text-lg font-extrabold leading-6 text-slate-900">
                  {item.title}
                </h3>
                <Link
                  href="#"
                  className="mt-4 inline-flex text-sm font-medium text-[#0b63c8] transition hover:text-[#084c99]"
                >
                  Consult Now
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

<section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-50 via-white to-brand-soft">
  <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
    {/* Hero Content */}
    <div className="relative">
      {/* Badge */}
      <span className="inline-flex rounded-full bg-white px-3 py-1 text-xs font-semibold text-brand shadow-sm ring-1 ring-slate-200">
        Find the right doctor for you
      </span>

      <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="max-w-xl">
          {/* Heading */}
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl">
            Meet our trusted doctors
          </h1>

          {/* Description */}
          <p className="mt-3 text-sm leading-6 text-slate-600">
            Browse our verified doctors and find the right specialist for your
            healthcare needs.
          </p>
        </div>

        <Link
          href="/find-doctor"
          className="inline-flex shrink-0 items-center justify-center rounded-full border border-brand px-5 py-2.5 text-sm font-semibold text-brand transition-all hover:bg-brand hover:text-brand-foreground"
        >
          View All Doctors --
        </Link>
      </div>

      {/* Doctor Cards */}
      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
  {doctors.map((doctor) => (
    <article
      key={doctor.id}
      className="group overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 transition duration-300 hover:-translate-y-1 hover:shadow-lg"
    >
      {/* Doctor Image */}
      <div className="relative h-56 overflow-hidden bg-[#edf2ff]">
        <Image
          src={doctor.imageUrl}
          alt={doctor.name}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          className="object-contain object-bottom px-4 pt-4 transition-transform duration-300 group-hover:scale-105"
        />
      </div>

      {/* Doctor Information */}
      <div className="p-5">
        {/* Availability */}
        <div className="flex items-center gap-2">
          <span
            className={`h-2 w-2 rounded-full ${
              doctor.isAvailable
                ? "bg-green-500"
                : "bg-slate-400"
            }`}
          />

          <span
            className={`text-xs font-medium ${
              doctor.isAvailable
                ? "text-green-600"
                : "text-slate-500"
            }`}
          >
            {doctor.isAvailable ? "Available" : "Unavailable"}
          </span>
        </div>

        {/* Doctor Name */}
        <h2 className="mt-2 truncate text-base font-bold text-slate-950">
          {doctor.name}
        </h2>

        {/* Specialty */}
        <p className="mt-1 truncate text-sm text-slate-600">
          {doctor.specialty}
        </p>

        {/* Book Button */}
        <Link
          href={`/appointment/book?doctorId=${doctor.id}`}
          className="mt-4 flex h-10 w-full items-center justify-center rounded-lg bg-brand text-sm font-semibold text-brand-foreground transition hover:bg-brand-hover"
        >
          Book Appointment
        </Link>
      </div>
    </article>
  ))}
</div>
    </div>
  </div>

</section>

      <section className="bg-[#0a3a63] py-14 text-white">
        <div className="mx-auto grid w-full max-w-7xl items-center gap-8 px-4 sm:px-6 lg:grid-cols-[420px_1fr] lg:px-8">
          <div className="overflow-hidden rounded-md bg-gradient-to-br from-[#d8eef9] to-[#c7dff0] p-3 shadow-[0_18px_50px_rgba(0,0,0,0.18)]">
            <div className="flex h-[240px] items-end justify-center rounded-md bg-[radial-gradient(circle_at_35%_25%,rgba(255,255,255,0.95),transparent_35%),linear-gradient(180deg,#f4f8fb_0%,#dbe4ea_100%)]">
              <div className="relative h-full w-full overflow-hidden rounded-md">
                <div className="absolute left-4 top-8 h-20 w-20 rounded-full bg-[#2d7dd2]/20 blur-xl" />
                <div className="absolute right-10 top-10 h-24 w-24 rounded-full bg-[#9cc9ff]/30 blur-2xl" />
                <div className="absolute bottom-0 left-8 h-36 w-24 rounded-t-[2rem] bg-[#6ea0c8]" />
                <div className="absolute bottom-0 left-24 h-28 w-28 rounded-t-[2rem] bg-[#24364c]" />
                <div className="absolute bottom-5 left-14 h-16 w-16 rounded-full border-4 border-[#245b94] bg-[#f4d0b4]" />
                <div className="absolute bottom-10 left-12 h-24 w-12 rounded-[2rem] bg-[#2f8ad8]" />
                <div className="absolute bottom-0 right-7 h-40 w-28 rounded-t-[2rem] bg-[#e8f0f7]" />
                <div className="absolute right-6 top-8 h-10 w-10 rounded-full bg-[#f2c4a5]" />
                <div className="absolute bottom-8 right-11 h-20 w-18 rounded-[1.5rem] bg-[#20364f]" />
                <div className="absolute left-10 bottom-14 h-14 w-20 rounded-[1.2rem] bg-[#ffffff] shadow-lg" />
              </div>
            </div>
          </div>

          <div>
            <h2 className="max-w-4xl text-3xl font-extrabold leading-tight sm:text-4xl">
              Need a Doctor to Visit your Loved One at Home? Dial - 09611 530
              530
            </h2>
            <p className="mt-5 max-w-3xl text-base leading-7 text-white/90 sm:text-lg">
              Sasthya Seba Limited has introduced a brand-new health program in
              Bangladesh called Home-Centric Primary Care, where a doctor and a
              paramedic will visit patients at home with necessary medical
              equipment&apos;s four days a month.
            </p>
            <Link
              href="#"
              className="mt-8 inline-flex rounded-md bg-[#1e96ff] px-8 py-4 text-sm font-semibold text-white transition hover:bg-[#1587eb]"
            >
              Request
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-white py-14">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-[2.1rem]">
                Get timely, cost-effective, and high quality diagnostic care
              </h2>
              <p className="mt-2 text-base text-slate-600">
                Book tests with top labs, get sample pick up, share reports with
                doctors online
              </p>
            </div>
            <Link
              href="#"
              className="hidden items-center gap-2 text-base font-semibold text-[#0b63c8] transition hover:text-[#084c99] sm:inline-flex"
            >
              View all
              <ArrowRightIcon className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-10 grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-6">
            {diagnostics.map((item, index) => (
              <article key={item} className="text-center">
                <div
                  className={`mx-auto flex h-36 w-36 items-center justify-center rounded-2xl ${
                    index % 2 === 0 ? "bg-[#fff7e9]" : "bg-[#dff3ff]"
                  } shadow-[0_12px_26px_rgba(11,99,200,0.08)]`}
                >
                  <div className="text-[#0b63c8]">
                    <DiagnosticIcon index={index} />
                  </div>
                </div>
                <h3 className="mt-5 text-lg font-extrabold text-slate-900">
                  {item}
                </h3>
                <Link
                  href="#"
                  className="mt-4 inline-flex text-sm font-medium text-[#0b63c8] transition hover:text-[#084c99]"
                >
                  Check Prices
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

