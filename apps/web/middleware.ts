import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const ROUTE_RULES = [
  { prefix: "/admin/dashboard", tokenKey: "adminToken", login: "/login?role=admin" },
  { prefix: "/doctor/dashboard", tokenKey: "doctorToken", login: "/doctor/login" },
  { prefix: "/patient/dashboard", tokenKey: "patientToken", login: "/login" },
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const routeRule = ROUTE_RULES.find((rule) => pathname.startsWith(rule.prefix));

  if (!routeRule) {
    return NextResponse.next();
  }

  const token = request.cookies.get(routeRule.tokenKey)?.value;

  if (token) {
    return NextResponse.next();
  }

  const redirectUrl = request.nextUrl.clone();
  redirectUrl.pathname = routeRule.login.split("?")[0];
  redirectUrl.search = routeRule.login.includes("?")
    ? routeRule.login.slice(routeRule.login.indexOf("?"))
    : "";

  return NextResponse.redirect(redirectUrl);
}

export const config = {
  matcher: ["/admin/dashboard/:path*", "/doctor/dashboard/:path*", "/patient/dashboard/:path*"],
};
