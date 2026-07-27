<<<<<<< HEAD
import Link from "next/link";
=======
"use client";
import Link from "next/link";
import { useRouter } from "next/navigation"; // ADD THIS
import { useEffect, useState } from "react"; // ADD THIS
>>>>>>> 907910e (add health care patient login,dashboard,booking system,add doctors)

const utilityLinks = [
  "Health Checkup & Insurance",
  "Domiciliary Services",
  "Diagnostic Home Services",
];

const primaryLinks = [
<<<<<<< HEAD
  { label: "Find Doctor", href: "#doctors" },
  { label: "Find Hospital", href: "#hospitals" },
  { label: "Find Ambulance", href: "#ambulance" },
];

export default function Header() {
=======
  { label: "HOME", href: "/" },
  { label: "ALL DOCTORS", href: "/find-doctor" },
  { label: "ABOUT", href: "/About" },
  { label: "CONTACT", href: "/Contact" },
];

export default function Header() {

  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    function checkAuth() {
      const token = localStorage.getItem("patientToken");
      setIsLoggedIn(!!token);
    }

    checkAuth();
    window.addEventListener("auth-change", checkAuth);
    return () => window.removeEventListener("auth-change", checkAuth);
  }, []);

  function handleLogout() {
    localStorage.removeItem("patientToken");
    localStorage.removeItem("patientUser");
    setIsLoggedIn(false);
    window.dispatchEvent(new Event("auth-change"));
    router.push("/login");
  }

>>>>>>> 907910e (add health care patient login,dashboard,booking system,add doctors)
  return (
    <header className="sticky top-0 z-50 border-b border-white/70 bg-white/90 backdrop-blur-xl">
      <div className="border-b border-brand-strong/20 bg-brand-soft">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-2 text-[13px] text-slate-600 sm:px-6 lg:px-8">
          <nav className="flex flex-wrap items-center gap-x-6 gap-y-1">
            {utilityLinks.map((item) => (
              <Link
                key={item}
                href="#"
                className="transition-colors hover:text-brand"
              >
                {item}
              </Link>
            ))}
          </nav>
          <nav className="flex items-center gap-6">
            <Link href="#" className="transition-colors hover:text-brand">
              Get the app
            </Link>
            <Link href="#" className="transition-colors hover:text-brand">
              Support
            </Link>
          </nav>
        </div>
      </div>

      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand text-lg font-semibold text-brand-foreground shadow-lg shadow-brand/25">
            HC
          </span>
          <span className="leading-tight">
            <span className="block text-base font-semibold tracking-wide text-brand">
              Health Care
            </span>
            <span className="block text-xs uppercase tracking-[0.24em] text-slate-500">
              Wellness made simple
            </span>
          </span>
        </Link>

<<<<<<< HEAD
        <nav className="hidden items-center gap-8 text-[15px] font-medium text-slate-700 md:flex">
=======
        <nav className="hidden items-center gap-8 text-[15px] font-bold text-slate-700 md:flex">
>>>>>>> 907910e (add health care patient login,dashboard,booking system,add doctors)
          {primaryLinks.map((item) => (
            <Link
              key={item.label}
              href={item.href}
<<<<<<< HEAD
              className="transition-colors hover:text-brand"
=======
              className="transition-colors hover:text-brand hover:text-green-600 transition-colors duration-200"
>>>>>>> 907910e (add health care patient login,dashboard,booking system,add doctors)
            >
              {item.label}
            </Link>
          ))}
        </nav>

<<<<<<< HEAD
        <Link
          href="#login"
          className="inline-flex items-center justify-center rounded-full border border-brand px-5 py-2.5 text-sm font-semibold text-brand transition-all hover:bg-brand hover:text-brand-foreground"
        >
          Login/Register
        </Link>
=======
        {isLoggedIn ? (
          <div className="flex items-center gap-3">
            <Link
              href="/patient/dashboard"
              className="inline-flex items-center justify-center rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-brand-foreground transition-all hover:bg-brand-hover"
            >
              Dashboard
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center justify-center rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition-all hover:bg-slate-100"
            >
              Log out
            </button>
          </div>
    ) : (
          <Link
            href="/login"
            className="inline-flex items-center justify-center rounded-full border border-brand px-5 py-2.5 text-sm font-semibold text-brand transition-all hover:bg-brand hover:text-brand-foreground"
          >
            Login/Register
          </Link>
        )}

>>>>>>> 907910e (add health care patient login,dashboard,booking system,add doctors)
      </div>
    </header>
  );
}
