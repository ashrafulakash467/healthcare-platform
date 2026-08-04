"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const slides = [
  {
    src: "/images/image001.jpg",
    alt: "Healthcare banner slide 1",
  },
  {
    src: "/images/image002.jpg",
    alt: "Healthcare banner slide 2",
  },
  {
    src: "/images/image003.jpg",
    alt: "Healthcare banner slide 3",
  },
  {
    src: "/images/image001.jpg",
    alt: "Healthcare banner slide 4",
  },
].map((slide) => ({
  ...slide,
  src: encodeURI(slide.src),
}));

export default function HomeHeroBanner() {
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveSlide((current) => (current + 1) % slides.length);
    }, 4000);

    return () => window.clearInterval(timer);
  }, []);

  function goToPreviousSlide() {
    setActiveSlide((current) => (current - 1 + slides.length) % slides.length);
  }

  function goToNextSlide() {
    setActiveSlide((current) => (current + 1) % slides.length);
  }

  return (
    <div className="relative overflow-hidden border border-slate-200 bg-white shadow-[0_24px_90px_rgba(52,92,50,0.12)]">
      <div className="grid min-h-[360px] lg:min-h-[420px] lg:grid-cols-[0.9fr_1.1fr]">
        <div className="relative flex items-end overflow-hidden bg-[linear-gradient(180deg,#8db6eb_0%,#79a4de_48%,#6d96d5_100%)] px-6 py-8 text-white sm:px-8 lg:px-10 lg:py-12">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_25%,rgba(255,255,255,0.18),transparent_28%),radial-gradient(circle_at_80%_20%,rgba(255,255,255,0.14),transparent_22%),radial-gradient(circle_at_24%_84%,rgba(255,255,255,0.12),transparent_30%)]" />

          <div className="relative z-10 max-w-xl">
            <span className="inline-flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.26em] text-white/88">
              <span className="h-px w-8 bg-white/80" />
              Well care
            </span>

            <h1 className="mt-4 text-4xl font-extrabold uppercase leading-[0.9] tracking-tight sm:text-5xl lg:text-6xl">
              PROVIDING
              <br />
              TOTAL LAB
              <br />
              SOLUTION
            </h1>

            <p className="mt-6 max-w-md text-sm font-semibold uppercase tracking-[0.22em] text-white/80 sm:text-[13px]">
              + Caring your reports
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/find-doctor"
                className="inline-flex items-center justify-center rounded-full bg-green-900 text-white  px-5 py-2.5 text-sm font-semibold text-brand transition hover:bg-transparent hover:text-black hover:border hover:border-black"
              >
                View all doctors
              </Link>
              <Link
                href="#all-doctor"
                className="inline-flex items-center justify-center rounded-full border px-5 py-2.5 text-sm font-semibold text-black transition hover:bg-green-900 hover:text-white"
              >
                Jump to cards
              </Link>
            </div>
          </div>
        </div>

        <div className="relative min-h-[260px] overflow-hidden bg-slate-100 sm:min-h-[320px] lg:min-h-full">
          {slides.map((slide, index) => (
            <div
              key={slide.src}
              className={`absolute inset-0 bg-cover bg-center bg-no-repeat transition-opacity duration-700 ${
                index === activeSlide ? "opacity-100" : "opacity-0"
              }`}
              aria-hidden={index !== activeSlide}
              role="img"
              aria-label={slide.alt}
              style={{
                backgroundImage: `url("${slide.src}")`,
              }}
            >
            </div>
          ))}

          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.1)_0%,rgba(255,255,255,0.02)_30%,rgba(8,34,74,0.14)_100%)]" />
        </div>
      </div>

      <button
        type="button"
        onClick={goToPreviousSlide}
        className="absolute left-3 top-1/2 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full border border-slate-200 bg-transparent text-slate-900 shadow-[0_10px_24px_rgba(15,23,42,0.18)] transition hover:bg-slate-50"
        aria-label="Previous slide"
      >
        <span className="text-2xl leading-none">‹</span>
      </button>

      <button
        type="button"
        onClick={goToNextSlide}
        className="absolute right-3 top-1/2 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full border border-slate-200 bg-transparent text-slate-900 shadow-[0_10px_24px_rgba(15,23,42,0.18)] transition hover:bg-slate-50"
        aria-label="Next slide"
      >
        <span className="text-2xl leading-none">›</span>
      </button>

      <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-2">
        {slides.map((slide, index) => (
          <span
            key={slide.src}
            className={`h-2.5 rounded-full transition-all ${
              index === activeSlide ? "w-8 bg-white" : "w-2.5 bg-white/55"
            }`}
            aria-hidden="true"
          />
        ))}
      </div>
    </div>
  );
}
