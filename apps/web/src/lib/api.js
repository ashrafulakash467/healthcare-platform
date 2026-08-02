const FALLBACK_API_BASE_URL = "http://localhost:3001";

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || FALLBACK_API_BASE_URL;

export function apiUrl(path = "") {
  if (!path) {
    return API_BASE_URL;
  }

  return `${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

export async function apiFetch(path, options = {}, token) {
  const headers = new Headers(options.headers ?? {});
  const hasBody = options.body !== undefined && options.body !== null;

  if (!headers.has("Accept")) {
    headers.set("Accept", "application/json");
  }

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  if (hasBody && !(options.body instanceof FormData) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  return fetch(apiUrl(path), {
    ...options,
    headers,
  });
}

export function getStoredToken(role) {
  if (typeof window === "undefined") {
    return "";
  }

  const key = `${role}Token`;
  return localStorage.getItem(key) ?? readCookie(key) ?? "";
}

export function getStoredUser(role) {
  if (typeof window === "undefined") {
    return null;
  }

  const key = `${role}User`;
  const rawValue = localStorage.getItem(key);

  if (!rawValue) {
    return null;
  }

  try {
    return JSON.parse(rawValue);
  } catch {
    return null;
  }
}

export function persistAuthSession(role, token, user) {
  if (typeof window === "undefined") {
    return;
  }

  clearAllAuthSessions();

  const tokenKey = `${role}Token`;
  const userKey = `${role}User`;

  localStorage.setItem(tokenKey, token);
  localStorage.setItem(userKey, JSON.stringify(user ?? null));
  document.cookie = `${tokenKey}=${encodeURIComponent(token)}; path=/; max-age=2592000; SameSite=Lax`;
  window.dispatchEvent(new Event("auth-change"));
}

export function clearAuthSession(role) {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.removeItem(`${role}Token`);
  localStorage.removeItem(`${role}User`);
  document.cookie = `${role}Token=; path=/; max-age=0; SameSite=Lax`;
  window.dispatchEvent(new Event("auth-change"));
}

export function clearAllAuthSessions() {
  if (typeof window === "undefined") {
    return;
  }

  for (const role of ["patient", "doctor", "admin"]) {
    localStorage.removeItem(`${role}Token`);
    localStorage.removeItem(`${role}User`);
    document.cookie = `${role}Token=; path=/; max-age=0; SameSite=Lax`;
  }

  window.dispatchEvent(new Event("auth-change"));
}

export function getActiveDashboardPath() {
  if (typeof window === "undefined") {
    return "/login";
  }

  if (getStoredToken("admin")) {
    return "/admin/dashboard";
  }

  if (getStoredToken("doctor")) {
    return "/doctor/dashboard";
  }

  if (getStoredToken("patient")) {
    return "/patient/dashboard";
  }

  return "/login";
}

function readCookie(name) {
  if (typeof document === "undefined") {
    return "";
  }

  const entry = document.cookie
    .split("; ")
    .find((part) => part.startsWith(`${name}=`));

  if (!entry) {
    return "";
  }

  return decodeURIComponent(entry.slice(name.length + 1));
}
