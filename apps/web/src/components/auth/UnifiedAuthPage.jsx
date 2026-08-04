"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { apiFetch, persistAuthSession } from "@/lib/api";

const ROUTES = {
  user: {
    login: "/login",
    register: "/register",
    loginEndpoint: "/patient/login",
    registerEndpoint: "/patient/register",
    dashboard: "/patient/dashboard",
  },
  doctor: {
    login: "/doctor/login",
    loginEndpoint: "/doctor/login",
    registerEndpoint: "/doctor/register",
    dashboard: "/doctor/dashboard",
  },
  admin: {
    login: "/login?role=admin",
    loginEndpoint: "/admin/login",
  },
};

const MODE_LABELS = {
  login: "Login",
  register: "Register",
};

const ROLE_LABELS = {
  user: "User",
  doctor: "Doctor",
  admin: "Admin",
};

export default function UnifiedAuthPage({ mode, initialRole = "user" }) {
  const router = useRouter();
  const normalizedInitialRole = normalizeRole(initialRole);
  const [role, setRole] = useState(() => normalizedInitialRole);
  const [form, setForm] = useState(() => createInitialForm(mode, normalizedInitialRole));
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isAdmin = role === "admin";
  const canRegister = role === "user";
  const pageCopy = useMemo(() => {
    if (mode === "register" && role === "doctor") {
      return {
        eyebrow: "Doctor Registration",
        title: "Create your doctor account.",
        description:
          "Submit your professional details and wait for admin verification before public listing.",
      };
    }

    if (mode === "login" && role === "doctor") {
      return {
        eyebrow: "Doctor Login",
        title: "Sign in to your doctor dashboard.",
        description:
          "Use your registered email or phone number to view appointments, earnings, and clinic updates. Demo:doctor@healthcare.com  pass :Doctor@12345",
      };
    }

    if (mode === "register") {
      return {
        eyebrow: "User Registration",
        title: "Create your account.",
        description:
          "Register to manage appointments, records, and follow-up care from one place.",
      };
    }

    return {
      eyebrow: "User Login",
      title: "Welcome back to Health Care.",
      description:
        "Sign in with your email or phone number to continue to your dashboard.",
    };
  }, [mode, role]);

  function updateField(event) {
    const { name, value } = event.target;
    setForm((currentForm) => ({ ...currentForm, [name]: value }));
    setErrors((currentErrors) => ({ ...currentErrors, [name]: "" }));
    setMessage("");
  }

  function switchMode(nextMode) {
    if (nextMode === "register" && !canRegister) {
      return;
    }

    const route = ROUTES[role]?.[nextMode];
    if (!route) {
      return;
    }

    router.push(route);
  }

  function switchRole(nextRole) {
    const normalized = normalizeRole(nextRole);
    setRole(normalized);
    const route = ROUTES[normalized]?.[mode];
    if (!route) {
      return;
    }

    router.push(route);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setIsSubmitting(true);
    setErrors({});
    setMessage("");

    if (isAdmin) {
      if (mode !== "login") {
        setErrors({
          form: "Admin accounts are provisioned manually.",
        });
        setIsSubmitting(false);
        return;
      }

      const payload = buildPayload(mode, role, form);

      if (!payload.ok) {
        setErrors(payload.errors);
        setIsSubmitting(false);
        return;
      }

      try {
        const response = await apiFetch(ROUTES.admin.loginEndpoint, {
          method: "POST",
          body: JSON.stringify(payload.body),
        });
        const result = await response.json();

        if (!response.ok) {
          setErrors(result.errors ?? { [result.field ?? "form"]: result.message });
          return;
        }

        persistAuthSession("admin", result.token, result.user);
        router.push("/admin/dashboard");
        return;
      } catch {
        setErrors({
          form: "Could not reach the API. Make sure the backend is running on port 3001.",
        });
      } finally {
        setIsSubmitting(false);
      }

      return;
    }

    const config = ROUTES[role];
    const payload = buildPayload(mode, role, form);

    if (!payload.ok) {
      setErrors(payload.errors);
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await apiFetch(
        mode === "register" ? config.registerEndpoint : config.loginEndpoint,
        { method: "POST", body: JSON.stringify(payload.body) },
      );
      const result = await response.json();

      if (!response.ok) {
        setErrors(result.errors ?? { [result.field ?? "form"]: result.message });
        return;
      }

      if (result.token && result.user) {
        persistAuthSession(role === "user" ? "patient" : role, result.token, result.user);
        router.push(config.dashboard);
        return;
      }

      setForm(createInitialForm(mode, role));
      setMessage(result.message ?? "Account created successfully.");
    } catch {
      setErrors({
        form: "Could not reach the API. Make sure the backend is running on port 3001.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  const registerFields = renderRegisterFields(role, form, errors, updateField);

  return (
    <main className="bg-white">
      <section className="mx-auto grid min-h-[calc(100vh-220px)] w-full max-w-7xl items-center gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
        <div className="space-y-4">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-brand">
            {pageCopy.eyebrow}
          </p>
          <h1 className="max-w-xl text-4xl font-extrabold leading-tight text-slate-950 sm:text-5xl">
            {pageCopy.title}
          </h1>
          <p className="max-w-xl text-base leading-7 text-slate-600">
            {pageCopy.description}
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-lg border border-brand-soft bg-[#f7fbf8] p-5 shadow-[0_18px_50px_rgba(52,92,50,0.10)] sm:p-7"
        >
          <div className="mb-5 flex flex-row gap-3">
            <SelectField
              label="Mode"
              options={canRegister ? ["login", "register"] : ["login"]}
              value={mode}
              onChange={switchMode}
            />
            <SelectField
              label="Role"
              options={["user", "doctor", "admin"]}
              value={role}
              onChange={switchRole}
            />
          </div>

          {errors.form ? (
            <p className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {errors.form}
            </p>
          ) : null}

          {message ? (
            <p className="mb-4 rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
              {message}
            </p>
          ) : null}

          {mode === "login" ? (
            <>
              <div className="grid gap-4">
                <Field
                  label="Email or phone"
                  name="identifier"
                  value={form.identifier}
                  onChange={updateField}
                  autoComplete="username"
                  error={errors.identifier}
                />
                <Field
                  label="Password"
                  name="password"
                  type="password"
                  value={form.password}
                  onChange={updateField}
                  autoComplete="current-password"
                  error={errors.password}
                />
              </div>

              {role === "admin" ? (
                <p className="mt-4 rounded-md border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                 Demo Admin:
                 admin@healthcare.com  pass:Admin@12345
                </p>
              ) : null}
            </>
          ) : role === "admin" ? (
            <p className="rounded-md border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
              Admin accounts are provisioned manually. There is no public admin registration flow.
            </p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {registerFields}
            </div>
          )}

          {mode === "login" ? (
            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-6 inline-flex h-12 w-full items-center justify-center rounded-md bg-brand px-5 text-sm font-semibold text-brand-foreground transition hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSubmitting
                ? "Signing in..."
                : role === "admin"
                  ? "Open admin portal"
                  : "Log in"}
            </button>
          ) : null}

          {mode === "register" && role !== "admin" && canRegister ? (
            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-6 inline-flex h-12 w-full items-center justify-center rounded-md bg-brand px-5 text-sm font-semibold text-brand-foreground transition hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSubmitting
                ? "Creating account..."
                : role === "doctor"
                  ? "Create doctor account"
                  : "Create account"}
            </button>
          ) : null}

          <div className="mt-4 flex flex-col items-center justify-center gap-2 text-sm text-slate-600 sm:flex-row sm:gap-4">
            {mode === "login" ? (
              <>
                {role === "user" ? (
                  <Link href="/forgot-password" className="font-semibold text-brand hover:text-brand-hover">
                    Forgot password?
                  </Link>
                ) : (
                  <span className="text-slate-500">Need a different account? use the top selector.</span>
                )}
                <span className="hidden text-slate-300 sm:inline">|</span>
                <button
                  type="button"
                  onClick={() => switchMode("register")}
                  className="font-semibold text-brand hover:text-brand-hover"
                >
                  Create an account
                </button>
              </>
            ) : canRegister ? (
              <>
                <span className="text-slate-500">
                  Already have an account?
                </span>
                <button
                  type="button"
                  onClick={() => switchMode("login")}
                  className="font-semibold text-brand hover:text-brand-hover"
                >
                  Log in
                </button>
              </>
            ) : (
              <span className="text-slate-500">
                Doctor registration is managed by the admin team.
              </span>
            )}
          </div>
        </form>
      </section>
    </main>
  );
}

function SelectField({ label, options, value, onChange }) {
  return (
    <label className="block flex-1">
      <span className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-800 outline-none transition focus:border-brand focus:ring-2 focus:ring-brand-soft"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {ROLE_LABELS[option] ?? MODE_LABELS[option] ?? option}
          </option>
        ))}
      </select>
    </label>
  );
}

function Field({
  label,
  name,
  value,
  onChange,
  type = "text",
  autoComplete,
  error,
}) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-slate-700">{label}</span>
      <input
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        autoComplete={autoComplete}
        className="mt-2 h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-brand focus:ring-2 focus:ring-brand-soft"
      />
      {error ? <span className="mt-1 block text-xs text-red-600">{error}</span> : null}
    </label>
  );
}

function TextAreaField({
  label,
  name,
  value,
  onChange,
  rows = 4,
  error,
  placeholder,
}) {
  return (
    <label className="block sm:col-span-2">
      <span className="text-sm font-semibold text-slate-700">{label}</span>
      <textarea
        name={name}
        rows={rows}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="mt-2 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-brand focus:ring-2 focus:ring-brand-soft"
      />
      {error ? <span className="mt-1 block text-xs text-red-600">{error}</span> : null}
    </label>
  );
}

function renderRegisterFields(role, form, errors, updateField) {
  if (role === "doctor") {
    return (
      <>
        <Field label="Name" name="name" value={form.name} onChange={updateField} autoComplete="name" error={errors.name} />
        <Field label="Email" name="email" type="email" value={form.email} onChange={updateField} autoComplete="email" error={errors.email} />
        <Field label="Phone" name="phone" value={form.phone} onChange={updateField} autoComplete="tel" error={errors.phone} />
        <Field label="Password" name="password" type="password" value={form.password} onChange={updateField} autoComplete="new-password" error={errors.password} />
        <Field label="Confirm password" name="confirmPassword" type="password" value={form.confirmPassword} onChange={updateField} autoComplete="new-password" error={errors.confirmPassword} />
        <Field label="Specialty" name="specialty" value={form.specialty} onChange={updateField} error={errors.specialty} />
        <TextAreaField label="Qualifications" name="qualifications" value={form.qualifications} onChange={updateField} error={errors.qualifications} placeholder="Enter qualifications separated by commas or new lines" />
        <Field label="Experience years" name="experienceYears" type="number" value={form.experienceYears} onChange={updateField} error={errors.experienceYears} />
        <Field label="License number" name="licenseNumber" value={form.licenseNumber} onChange={updateField} error={errors.licenseNumber} />
        <Field label="License issued by" name="licenseIssuedBy" value={form.licenseIssuedBy} onChange={updateField} error={errors.licenseIssuedBy} />
        <Field label="Location" name="location" value={form.location} onChange={updateField} error={errors.location} />
        <Field label="Gender" name="gender" value={form.gender} onChange={updateField} error={errors.gender} />
        <Field label="Profile image URL" name="imageUrl" value={form.imageUrl} onChange={updateField} error={errors.imageUrl} />
        <TextAreaField label="Profile summary" name="profileSummary" value={form.profileSummary} onChange={updateField} error={errors.profileSummary} placeholder="Write a short professional summary" />
      </>
    );
  }

  return (
    <>
      <Field label="Name" name="name" value={form.name} onChange={updateField} autoComplete="name" error={errors.name} />
      <Field label="Email" name="email" type="email" value={form.email} onChange={updateField} autoComplete="email" error={errors.email} />
      <Field label="Phone" name="phone" value={form.phone} onChange={updateField} autoComplete="tel" error={errors.phone} />
      <Field label="Password" name="password" type="password" value={form.password} onChange={updateField} autoComplete="new-password" error={errors.password} />
      <Field label="Confirm password" name="confirmPassword" type="password" value={form.confirmPassword} onChange={updateField} autoComplete="new-password" error={errors.confirmPassword} />
    </>
  );
}

function createInitialForm(mode, role) {
  if (mode === "login") {
    return {
      identifier: "",
      password: "",
    };
  }

  if (role === "doctor") {
    return {
      name: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
      specialty: "",
      qualifications: "",
      experienceYears: "",
      licenseNumber: "",
      licenseIssuedBy: "",
      profileSummary: "",
      location: "",
      gender: "",
      imageUrl: "",
    };
  }

  return {
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  };
}

function buildPayload(mode, role, form) {
  if (mode === "login") {
    const errors = {};

    if (!form.identifier?.trim()) {
      errors.identifier = "Email or phone is required.";
    }

    if (!form.password) {
      errors.password = "Password is required.";
    }

    if (Object.keys(errors).length > 0) {
      return { ok: false, errors };
    }

    return {
      ok: true,
      body: {
        identifier: form.identifier,
        password: form.password,
      },
    };
  }

  if (role === "doctor") {
    const errors = {};

    if (!form.name?.trim()) errors.name = "Name is required.";
    if (!form.email?.trim()) errors.email = "Email is required.";
    if (!form.phone?.trim()) errors.phone = "Phone is required.";
    if (!form.password) errors.password = "Password is required.";
    if (form.password !== form.confirmPassword) errors.confirmPassword = "Passwords do not match.";
    if (!form.specialty?.trim()) errors.specialty = "Specialty is required.";
    if (!form.qualifications?.trim()) errors.qualifications = "At least one qualification is required.";
    if (!form.experienceYears && form.experienceYears !== 0) errors.experienceYears = "Experience years is required.";
    if (!form.licenseNumber?.trim()) errors.licenseNumber = "License number is required.";
    if (!form.licenseIssuedBy?.trim()) errors.licenseIssuedBy = "License issuing authority is required.";
    if (!form.profileSummary?.trim()) errors.profileSummary = "Profile summary is required.";
    if (!form.location?.trim()) errors.location = "Location is required.";
    if (!form.gender?.trim()) errors.gender = "Gender is required.";

    if (Object.keys(errors).length > 0) {
      return { ok: false, errors };
    }

    return {
      ok: true,
      body: {
        name: form.name,
        email: form.email,
        phone: form.phone,
        password: form.password,
        confirmPassword: form.confirmPassword,
        specialty: form.specialty,
        qualifications: form.qualifications,
        experienceYears: Number(form.experienceYears),
        licenseNumber: form.licenseNumber,
        licenseIssuedBy: form.licenseIssuedBy,
        profileSummary: form.profileSummary,
        location: form.location,
        gender: form.gender,
        imageUrl: form.imageUrl,
      },
    };
  }

  const errors = {};

  if (!form.name?.trim()) errors.name = "Name is required.";
  if (!form.email?.trim()) errors.email = "Email is required.";
  if (!form.phone?.trim()) errors.phone = "Phone is required.";
  if (!form.password) errors.password = "Password is required.";
  if (form.password !== form.confirmPassword) errors.confirmPassword = "Passwords do not match.";

  if (Object.keys(errors).length > 0) {
    return { ok: false, errors };
  }

  return {
    ok: true,
    body: {
      name: form.name,
      email: form.email,
      phone: form.phone,
      password: form.password,
      confirmPassword: form.confirmPassword,
    },
  };
}

function normalizeRole(value) {
  if (Array.isArray(value)) {
    return normalizeRole(value[0]);
  }

  return ["user", "doctor", "admin"].includes(value) ? value : "user";
}
