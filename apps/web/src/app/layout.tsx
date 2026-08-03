import type { Metadata } from "next";
import "./globals.css";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";

export const metadata: Metadata = {
  title: "Health Care Platform",
  description: "A calm, palette-driven healthcare booking experience.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body
       
        className="h-full bg-green-500 font-sans text-slate-900 antialiased"
      >
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}
