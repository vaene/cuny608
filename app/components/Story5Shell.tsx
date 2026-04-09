import Link from "next/link";
import type { ReactNode } from "react";

import { STORY5_SLIDES } from "@/lib/climateData";

interface Story5ShellProps {
  currentPath: string;
  title: string;
  subtitle: string;
  children: ReactNode;
}

export default function Story5Shell({
  currentPath,
  title,
  subtitle,
  children
}: Story5ShellProps) {
  const currentIndex = STORY5_SLIDES.findIndex((slide) => slide.href === currentPath);
  const prevSlide = currentIndex > 0 ? STORY5_SLIDES[currentIndex - 1] : null;
  const nextSlide = currentIndex < STORY5_SLIDES.length - 1 ? STORY5_SLIDES[currentIndex + 1] : null;

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-4 md:p-8">
      <div className="mx-auto flex min-h-[calc(100vh-2rem)] max-w-6xl flex-col rounded-lg bg-slate-950 p-8 shadow-2xl md:min-h-[calc(100vh-4rem)] border border-slate-700">
        <header className="mb-6 border-b border-slate-700 pb-5">
          <div className="mb-2 text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
            Story 5: Climate & Storms
          </div>
          <h1 className="text-3xl font-semibold leading-tight text-white md:text-4xl">
            {title}
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-300 md:text-base">
            {subtitle}
          </p>
        </header>

        <div className="flex-1">{children}</div>

        {nextSlide ? (
          <Link
            href={nextSlide.href}
            className="fixed right-4 top-1/2 z-20 -translate-y-1/2 text-base text-slate-500 transition duration-150 ease-out hover:scale-125 hover:text-white md:right-8"
            aria-label={`Go to ${nextSlide.label}`}
          >
            <span className="inline-block">›</span>
          </Link>
        ) : (
          <div
            className="fixed right-4 top-1/2 z-20 -translate-y-1/2 select-none text-base text-slate-500 opacity-25 md:right-8"
            aria-hidden="true"
          >
            ›
          </div>
        )}

        {prevSlide ? (
          <Link
            href={prevSlide.href}
            className="fixed left-4 top-1/2 z-20 -translate-y-1/2 text-base text-slate-500 transition duration-150 ease-out hover:scale-125 hover:text-white md:left-8"
            aria-label={`Go to ${prevSlide.label}`}
          >
            <span className="inline-block">‹</span>
          </Link>
        ) : (
          <div
            className="fixed left-4 top-1/2 z-20 -translate-y-1/2 select-none text-base text-slate-500 opacity-25 md:left-8"
            aria-hidden="true"
          >
            ‹
          </div>
        )}

        <div className="fixed bottom-2 left-1/2 z-20 flex -translate-x-1/2 items-center gap-3 rounded-full border border-slate-600 bg-slate-900/65 px-4 py-1 text-xs text-slate-300 shadow-md backdrop-blur scale-75 origin-bottom">
          <span className="font-semibold text-white">
            {currentIndex + 1} / {STORY5_SLIDES.length}
          </span>
          <div className="flex items-center gap-2">
            {STORY5_SLIDES.map((slide, index) => (
              <Link key={slide.href} href={slide.href} aria-label={`Go to page ${index + 1}`}>
                <span
                  className={`block h-2 w-2 rounded-full ${
                    slide.href === currentPath ? "bg-white" : "bg-slate-600 hover:bg-slate-500"
                  }`}
                />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
