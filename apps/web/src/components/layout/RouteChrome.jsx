"use client";

import { usePathname } from "next/navigation";
import Header from "./Header";
import Footer from "./Footer";

export default function RouteChrome({ children }) {
  const pathname = usePathname();

  const hideChrome =
    pathname.startsWith("/doctor") ||
    pathname.startsWith("/admin");

  if (hideChrome) {
    return <>{children}</>;
  }

  return (
    <>
      <Header />
      {children}
      <Footer />
    </>
  );
}