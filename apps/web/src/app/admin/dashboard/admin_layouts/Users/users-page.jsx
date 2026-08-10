"use client";

import { useEffect, useMemo, useState } from "react";
import { apiFetch, getStoredToken } from "@/lib/api";
import UpdateUserPage from "./update-user-page";

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [refreshTick, setRefreshTick] = useState(0);

  useEffect(() => {
    let isMounted = true;

    async function loadUsers() {
      const token = getStoredToken("admin");

      if (!token) {
        if (isMounted) {
          setError("Admin session not found.");
          setLoading(false);
        }
        return;
      }

      if (isMounted) {
        setLoading(true);
        setError("");
      }

      try {
        const response = await apiFetch("/admin/users", {}, token);
        const result = await response.json();

        if (!isMounted) {
          return;
        }

        if (response.ok) {
          const nextUsers = Array.isArray(result.users) ? result.users : [];
          setUsers(nextUsers);
          setSelectedUserId((current) =>
            current && nextUsers.some((user) => user.id === current)
              ? current
              : nextUsers[0]?.id ?? null,
          );
        } else {
          setError(result.message ?? "Failed to load users.");
        }
      } catch {
        if (isMounted) {
          setError("Failed to load users from the server.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    void loadUsers();

    return () => {
      isMounted = false;
    };
  }, [refreshTick]);

  useEffect(() => {
    if (!notice) {
      return undefined;
    }

    const timer = window.setTimeout(() => {
      setNotice(null);
    }, 3200);

    return () => window.clearTimeout(timer);
  }, [notice]);

  const filteredUsers = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    if (!query) {
      return users;
    }

    return users.filter((user) => getUserSearchText(user).includes(query));
  }, [searchQuery, users]);

  const selectedUser = useMemo(() => {
    if (!filteredUsers.length) {
      return null;
    }

    return filteredUsers.find((user) => user.id === selectedUserId) ?? filteredUsers[0];
  }, [filteredUsers, selectedUserId]);

  const stats = useMemo(() => {
    const total = users.length;
    const active = users.filter((user) => String(user.status ?? "").toLowerCase() === "active").length;
    const doctors = users.filter((user) => getUserRoles(user).includes("doctor")).length;
    const patients = users.filter((user) => getUserRoles(user).includes("patient")).length;
    const hospitalAdmins = users.filter((user) =>
      getUserRoles(user).some((role) => role === "hospital" || role === "hospital admin"),
    ).length;
    const twoFactorEnabled = users.filter((user) => Boolean(user.twoFactorEnabled)).length;

    return { total, active, doctors, patients, hospitalAdmins, twoFactorEnabled };
  }, [users]);

  function openEditUser(user) {
    setEditingUser(user);
    setEditForm(buildUserForm(user));
    setSelectedUserId(user?.id ?? null);
  }

  function openNewUser() {
    const emptyUser = {
      id: null,
      name: "",
      email: "",
      phone: "",
      status: "active",
      role: "user",
      roles: ["user"],
      twoFactorEnabled: false,
      doctor: null,
      patient: null,
      createdHospitals: [],
    };

    setEditingUser(emptyUser);
    setEditForm(buildUserForm(emptyUser));
  }

  function cancelEdit() {
    setEditingUser(null);
    setEditForm({});
  }

  async function handleSaveUser(userId, formData) {
    const token = getStoredToken("admin");
    if (!token) {
      setNotice({ message: "Admin session not found.", tone: "error" });
      return;
    }

    const isCreateMode = !userId;
    const passwordValue = String(formData?.password ?? "").trim();
    const passwordConfirmationValue = String(formData?.passwordConfirmation ?? "").trim();
    const roles = parseRoleList(formData?.rolesText ?? formData?.role ?? "user");
    const primaryRole = String(formData?.role ?? roles[0] ?? "user").trim().toLowerCase() || "user";

    if (passwordValue || passwordConfirmationValue) {
      if (!passwordValue || !passwordConfirmationValue) {
        setNotice({ message: "Please fill in both password fields.", tone: "error" });
        return;
      }

      if (passwordValue !== passwordConfirmationValue) {
        setNotice({ message: "User passwords do not match.", tone: "error" });
        return;
      }
    }

    const payload = {
      name: String(formData?.name ?? "").trim(),
      email: String(formData?.email ?? "").trim(),
      phone: String(formData?.phone ?? "").trim(),
      status: String(formData?.status ?? "active").trim().toLowerCase() || "active",
      role: primaryRole,
      roles,
      two_factor_enabled: String(formData?.twoFactorEnabled ?? "").toLowerCase() === "enabled",
      password: passwordValue || undefined,
      password_confirmation: passwordValue ? passwordConfirmationValue : undefined,
    };

    const doctorSpecialty = String(formData?.doctorSpecialty ?? "").trim();
    const doctorLicenseNo = String(formData?.doctorLicenseNo ?? "").trim();
    const doctorGender = String(formData?.doctorGender ?? "").trim();
    const doctorVerificationStatus = String(formData?.doctorVerificationStatus ?? "").trim();
    const patientMrn = String(formData?.patientMrn ?? "").trim();
    const patientGender = String(formData?.patientGender ?? "").trim();
    const patientBloodGroup = String(formData?.patientBloodGroup ?? "").trim();
    const patientDateOfBirth = String(formData?.patientDateOfBirth ?? "").trim();
    const patientCity = String(formData?.patientCity ?? "").trim();

    if (doctorSpecialty) {
      payload.doctor_specialty = doctorSpecialty;
    }
    if (doctorLicenseNo) {
      payload.doctor_license_no = doctorLicenseNo;
    }
    if (doctorGender) {
      payload.doctor_gender = doctorGender;
    }
    if (doctorVerificationStatus) {
      payload.doctor_verification_status = doctorVerificationStatus;
    }
    if (patientMrn) {
      payload.patient_mrn = patientMrn;
    }
    if (patientGender) {
      payload.patient_gender = patientGender;
    }
    if (patientBloodGroup) {
      payload.patient_blood_group = patientBloodGroup;
    }
    if (patientDateOfBirth) {
      payload.patient_date_of_birth = patientDateOfBirth;
    }
    if (patientCity) {
      payload.patient_city = patientCity;
    }

    try {
      const response = await apiFetch(
        isCreateMode ? "/admin/users" : `/admin/users/${userId}`,
        {
          method: isCreateMode ? "POST" : "PUT",
          body: JSON.stringify(payload),
        },
        token,
      );
      const result = await response.json();

      if (response.ok) {
        const nextUser = result.user ?? result.data ?? result.profile ?? null;

        if (nextUser) {
          setUsers((current) =>
            isCreateMode
              ? [nextUser, ...current]
              : current.map((user) => (user.id === userId ? nextUser : user)),
          );
          setSelectedUserId(nextUser.id ?? userId ?? null);
        } else {
          setRefreshTick((current) => current + 1);
        }

        setEditingUser(null);
        setEditForm({});
        setNotice({
          message: isCreateMode ? "User created successfully." : "User updated successfully.",
          tone: "success",
        });
      } else {
        setNotice({
          message: result.message ?? (isCreateMode ? "Failed to create user." : "Failed to update user."),
          tone: "error",
        });
      }
    } catch {
      setNotice({
        message: isCreateMode ? "Failed to create user." : "Failed to update user.",
        tone: "error",
      });
    }
  }

  return (
    <PanelCard
      eyebrow="User Management"
      title="Users"
      description="Browse every account, inspect nested doctor or patient data, and open a dynamic edit form when you need to update a profile."
    >
      <div className="space-y-6">
        {notice ? (
          <div
            className={`rounded-2xl border px-4 py-3 text-sm font-medium ${
              notice.tone === "success"
                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                : "border-rose-200 bg-rose-50 text-rose-700"
            }`}
          >
            {notice.message}
          </div>
        ) : null}

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          <StatCard label="Total Users" value={stats.total} tone="slate" />
          <StatCard label="Active" value={stats.active} tone="emerald" />
          <StatCard label="Doctors" value={stats.doctors} tone="blue" />
          <StatCard label="Patients" value={stats.patients} tone="amber" />
          <StatCard label="Hospital Admins" value={stats.hospitalAdmins} tone="rose" />
        </div>

        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <label className="w-full lg:max-w-md">
            <span className="sr-only">Search users</span>
            <input
              type="search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search by name, email, role, phone, or MRN"
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400"
            />
          </label>

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={openNewUser}
              className="inline-flex w-full items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 sm:w-auto"
            >
              Add New User
            </button>

            <button
              type="button"
              onClick={() => setRefreshTick((current) => current + 1)}
              className="inline-flex w-full items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 sm:w-auto"
            >
              Refresh
            </button>
          </div>
        </div>

        {loading ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-6 py-14 text-center text-sm font-medium text-slate-500">
            Loading users from the database...
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-6 py-14 text-center">
            <p className="text-sm font-semibold text-rose-700">{error}</p>
            <button
              type="button"
              onClick={() => setRefreshTick((current) => current + 1)}
              className="mt-4 inline-flex rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-rose-700"
            >
              Try Again
            </button>
          </div>
        ) : editingUser ? (
          <UpdateUserPage
            key={editingUser.id ?? "new-user"}
            user={editingUser}
            form={editForm}
            setForm={setEditForm}
            onSave={() => handleSaveUser(editingUser.id, editForm)}
            onCancel={cancelEdit}
          />
        ) : filteredUsers.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-6 py-14 text-center text-sm font-medium text-slate-500">
            No users match &quot;{searchQuery}&quot;. Try another search term.
          </div>
        ) : (
          <div className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
            <div className="grid gap-3 md:grid-cols-2">
              {filteredUsers.map((user) => {
                const isSelected = user.id === selectedUser?.id;
                const roleNames = getUserRoles(user);

                return (
                  <button
                    key={user.id}
                    type="button"
                    onClick={() => setSelectedUserId(user.id)}
                    className={`flex min-h-[11.25rem] flex-col justify-between rounded-[24px] border p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${
                      isSelected
                        ? "border-slate-950 bg-slate-950 text-white"
                        : "border-slate-200 bg-white text-slate-900"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className={`text-[1.05rem] font-bold ${isSelected ? "text-white" : "text-slate-950"}`}>
                          {user.name ?? "Unnamed User"}
                        </p>
                        <p className={`mt-1 text-sm ${isSelected ? "text-slate-200" : "text-slate-500"}`}>
                          {user.email ?? "No email"}
                        </p>
                      </div>
                      <Badge tone={user.status} selected={isSelected}>
                        {formatStatusLabel(user.status)}
                      </Badge>
                    </div>

                    <div className="space-y-3">
                      <div className="flex flex-wrap gap-2">
                        {roleNames.length ? (
                          roleNames.slice(0, 3).map((role) => (
                            <Tag key={role} selected={isSelected}>
                              {formatRoleLabel(role)}
                            </Tag>
                          ))
                        ) : (
                          <Tag selected={isSelected}>User</Tag>
                        )}
                        <Tag selected={isSelected}>{user.twoFactorEnabled ? "2FA On" : "2FA Off"}</Tag>
                      </div>

                      <div className={`space-y-1.5 text-sm ${isSelected ? "text-slate-200" : "text-slate-600"}`}>
                        <p>{user.phone ?? "No phone number"}</p>
                        <p>{formatShortDate(user.createdAt)}</p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
              {selectedUser ? (
                <div className="space-y-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                        Selected User
                      </p>
                      <h3 className="mt-2 text-2xl font-bold text-slate-950">{selectedUser.name}</h3>
                      <p className="mt-1 text-sm text-slate-500">{selectedUser.email}</p>
                    </div>

                    <div className="text-right">
                      <Badge tone={selectedUser.status}>{formatStatusLabel(selectedUser.status)}</Badge>
                      <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                        {formatRoleLabel(getPrimaryRole(selectedUser))}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {getUserRoles(selectedUser).length ? (
                      getUserRoles(selectedUser).map((role) => (
                        <Tag key={role}>{formatRoleLabel(role)}</Tag>
                      ))
                    ) : (
                      <Tag>User</Tag>
                    )}
                    <Tag>{selectedUser.twoFactorEnabled ? "2FA Enabled" : "2FA Disabled"}</Tag>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <InfoPair label="Phone" value={selectedUser.phone ?? "N/A"} />
                    <InfoPair label="Created" value={formatLongDate(selectedUser.createdAt)} />
                    <InfoPair label="Last Login" value={formatLongDate(selectedUser.lastLoginAt)} />
                    <InfoPair label="Status" value={formatStatusLabel(selectedUser.status)} />
                  </div>

                  <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                      Account Flags
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Tag>{selectedUser.twoFactorEnabled ? "2FA On" : "2FA Off"}</Tag>
                      <Tag>{selectedUser.status ? formatStatusLabel(selectedUser.status) : "Active"}</Tag>
                    </div>
                  </div>

                  {selectedUser.doctor ? (
                    <DetailSection title="Doctor Profile">
                      <div className="grid gap-3 sm:grid-cols-2">
                        <InfoPair label="Specialty" value={selectedUser.doctor.specialty ?? "N/A"} />
                        <InfoPair label="License" value={selectedUser.doctor.licenseNo ?? "N/A"} />
                        <InfoPair label="Gender" value={selectedUser.doctor.gender ?? "N/A"} />
                        <InfoPair
                          label="Verification"
                          value={formatStatusLabel(selectedUser.doctor.verificationStatus ?? "N/A")}
                        />
                      </div>
                      {selectedUser.doctor.hospital ? (
                        <InfoPair
                          label="Primary Hospital"
                          value={[
                            selectedUser.doctor.hospital.name,
                            selectedUser.doctor.hospital.city,
                          ]
                            .filter(Boolean)
                            .join(" - ")}
                        />
                      ) : null}
                    </DetailSection>
                  ) : null}

                  {selectedUser.patient ? (
                    <DetailSection title="Patient Profile">
                      <div className="grid gap-3 sm:grid-cols-2">
                        <InfoPair label="MRN" value={selectedUser.patient.mrn ?? "N/A"} />
                        <InfoPair label="Gender" value={selectedUser.patient.gender ?? "N/A"} />
                        <InfoPair label="Blood Group" value={selectedUser.patient.bloodGroup ?? "N/A"} />
                        <InfoPair label="Date of Birth" value={selectedUser.patient.dateOfBirth ?? "N/A"} />
                      </div>
                      <InfoPair label="City" value={selectedUser.patient.city ?? "N/A"} />
                      {selectedUser.patient.hospital ? (
                        <InfoPair
                          label="Hospital"
                          value={[
                            selectedUser.patient.hospital.name,
                            selectedUser.patient.hospital.city,
                          ]
                            .filter(Boolean)
                            .join(" - ")}
                        />
                      ) : null}
                    </DetailSection>
                  ) : null}

                  {Array.isArray(selectedUser.createdHospitals) && selectedUser.createdHospitals.length ? (
                    <DetailSection title="Created Hospitals">
                      <div className="space-y-2">
                        {selectedUser.createdHospitals.map((hospital) => (
                          <div
                            key={hospital.id}
                            className="rounded-xl border border-slate-200 bg-white px-4 py-3"
                          >
                            <p className="text-sm font-semibold text-slate-900">{hospital.name}</p>
                            <p className="mt-1 text-xs text-slate-500">
                              {[hospital.city, hospital.status].filter(Boolean).join(" - ") || "Hospital record"}
                            </p>
                          </div>
                        ))}
                      </div>
                    </DetailSection>
                  ) : null}

                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => openEditUser(selectedUser)}
                      className="inline-flex rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
                    >
                      Edit User
                    </button>
                    <button
                      type="button"
                      onClick={() => setRefreshTick((current) => current + 1)}
                      className="inline-flex rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                    >
                      Refresh List
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex min-h-[22rem] items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-6 py-10 text-center text-sm text-slate-500">
                  Click a user card to view the full profile.
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </PanelCard>
  );
}

function PanelCard({ eyebrow, title, description, children }) {
  return (
    <section className="rounded-[28px] border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-5 shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
      <SectionHeader eyebrow={eyebrow} title={title} description={description} />
      <div className="mt-5">{children}</div>
    </section>
  );
}

function SectionHeader({ eyebrow, title, description }) {
  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-[0.22em] text-slate-500">{eyebrow}</p>
      <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">{title}</h2>
      <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">{description}</p>
    </div>
  );
}

function StatCard({ label, value, tone = "slate" }) {
  const toneClasses =
    tone === "emerald"
      ? "border-emerald-100 bg-emerald-50/70 text-emerald-800"
      : tone === "blue"
        ? "border-blue-100 bg-blue-50/70 text-blue-800"
        : tone === "amber"
          ? "border-amber-100 bg-amber-50/70 text-amber-800"
          : tone === "rose"
            ? "border-rose-100 bg-rose-50/70 text-rose-800"
            : "border-slate-200 bg-white text-slate-800";

  return (
    <div className={`rounded-2xl border p-4 shadow-sm ${toneClasses}`}>
      <p className="text-xs font-semibold uppercase tracking-wide text-current/70">{label}</p>
      <p className="mt-2 text-2xl font-bold text-current">{value}</p>
    </div>
  );
}

function InfoPair({ label, value }) {
  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-1 text-sm font-semibold text-slate-800">{value}</p>
    </div>
  );
}

function DetailSection({ title, children }) {
  return (
    <section className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">{title}</p>
      <div className="mt-4 space-y-3">{children}</div>
    </section>
  );
}

function Tag({ children, selected = false }) {
  return (
    <span
      className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${
        selected
          ? "border-white/20 bg-white/10 text-white"
          : "border-slate-200 bg-slate-50 text-slate-600"
      }`}
    >
      {children}
    </span>
  );
}

function Badge({ children, tone, selected = false }) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide ${
        selected ? badgeToneOnDark(tone) : badgeTone(tone)
      }`}
    >
      {children}
    </span>
  );
}

function badgeTone(tone) {
  const text = String(tone ?? "").toLowerCase();

  if (text === "active" || text === "approved") {
    return "bg-emerald-100 text-emerald-700";
  }

  if (text.includes("pending")) {
    return "bg-amber-100 text-amber-700";
  }

  if (text.includes("suspend") || text.includes("inactive") || text.includes("deleted")) {
    return "bg-rose-100 text-rose-700";
  }

  return "bg-slate-100 text-slate-700";
}

function badgeToneOnDark(tone) {
  const text = String(tone ?? "").toLowerCase();

  if (text === "active" || text === "approved") {
    return "bg-white/10 text-white";
  }

  if (text.includes("pending")) {
    return "bg-white/10 text-white";
  }

  if (text.includes("suspend") || text.includes("inactive") || text.includes("deleted")) {
    return "bg-white/10 text-white";
  }

  return "bg-white/10 text-white";
}

function normalizeRoleNames(roles) {
  if (!Array.isArray(roles)) {
    return [];
  }

  return roles
    .map((role) => String(role ?? "").trim().toLowerCase())
    .filter(Boolean);
}

function getUserRoles(user) {
  const roles = normalizeRoleNames(user?.roles);

  if (roles.length) {
    return roles;
  }

  const primaryRole = String(user?.role ?? "").trim().toLowerCase();
  return primaryRole ? [primaryRole] : [];
}

function getPrimaryRole(user) {
  const roleNames = getUserRoles(user);
  const primaryRole = String(user?.role ?? "user").trim().toLowerCase();

  return roleNames[0] ?? primaryRole ?? "user";
}

function getUserSearchText(user) {
  const roleText = getUserRoles(user).join(" ");
  const hospitalText = Array.isArray(user?.createdHospitals)
    ? user.createdHospitals
        .map((hospital) => [hospital?.name, hospital?.city, hospital?.status].filter(Boolean).join(" "))
        .join(" ")
    : "";

  return [
    user?.name,
    user?.email,
    user?.phone,
    user?.status,
    user?.roleLabel,
    user?.role,
    roleText,
    user?.doctor?.specialty,
    user?.doctor?.licenseNo,
    user?.doctor?.gender,
    user?.doctor?.verificationStatus,
    user?.patient?.mrn,
    user?.patient?.bloodGroup,
    user?.patient?.gender,
    user?.patient?.city,
    user?.patient?.dateOfBirth,
    hospitalText,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function parseRoleList(value) {
  if (Array.isArray(value)) {
    return value
      .map((item) => String(item ?? "").trim().toLowerCase())
      .filter(Boolean);
  }

  if (typeof value !== "string") {
    return [];
  }

  return value
    .split(/[\n,]/)
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);
}

function buildUserForm(user) {
  const roleNames = getUserRoles(user);
  const primaryRole = roleNames[0] ?? String(user?.role ?? "user").trim().toLowerCase();
  const normalizedPrimaryRole = primaryRole || "user";

  return {
    name: user?.name ?? "",
    email: user?.email ?? "",
    phone: user?.phone ?? "",
    status: String(user?.status ?? "active").trim().toLowerCase() || "active",
    role: normalizedPrimaryRole,
    rolesText: roleNames.length ? roleNames.join(", ") : normalizedPrimaryRole,
    twoFactorEnabled: user?.twoFactorEnabled ? "enabled" : "disabled",
    password: "",
    passwordConfirmation: "",
    doctorSpecialty: user?.doctor?.specialty ?? "",
    doctorLicenseNo: user?.doctor?.licenseNo ?? "",
    doctorGender: String(user?.doctor?.gender ?? "").trim().toLowerCase(),
    doctorVerificationStatus: String(user?.doctor?.verificationStatus ?? "").trim().toLowerCase(),
    patientMrn: user?.patient?.mrn ?? "",
    patientGender: String(user?.patient?.gender ?? "").trim().toLowerCase(),
    patientBloodGroup: String(user?.patient?.bloodGroup ?? "").trim().toLowerCase(),
    patientDateOfBirth: user?.patient?.dateOfBirth ?? "",
    patientCity: user?.patient?.city ?? "",
  };
}

function formatRoleLabel(role) {
  const text = String(role ?? "").trim().toLowerCase();

  return (
    {
      "super-admin": "Super Admin",
      admin: "Admin",
      doctor: "Doctor",
      patient: "Patient",
      hospital: "Hospital Admin",
      "hospital admin": "Hospital Admin",
      support: "Support",
      user: "User",
    }[text] ?? text.replace(/(^|\s)\w/g, (match) => match.toUpperCase())
  );
}

function formatStatusLabel(status) {
  const text = String(status ?? "").trim();

  if (!text) {
    return "Active";
  }

  return text.replace(/_/g, " ").replace(/(^|\s)\w/g, (match) => match.toUpperCase());
}

function formatShortDate(value) {
  if (!value) {
    return "No date available";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function formatLongDate(value) {
  if (!value) {
    return "N/A";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}
