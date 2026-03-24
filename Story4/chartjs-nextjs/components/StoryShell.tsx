import Link from "next/link";
import type { ReactNode } from "react";

import { STORY4_SLIDES } from "@/lib/salaryData";

interface StoryShellProps {
  currentPath: string;
  title: string;
  subtitle: string;
  children: ReactNode;
}

export default function StoryShell({
  currentPath,
  title,
  subtitle,
  children
}: StoryShellProps) {
  const currentIndex = STORY4_SLIDES.findIndex((slide) => slide.href === currentPath);
  const prevSlide = currentIndex > 0 ? STORY4_SLIDES[currentIndex - 1] : null;
  const nextSlide = currentIndex < STORY4_SLIDES.length - 1 ? STORY4_SLIDES[currentIndex + 1] : null;

  return (
    <main className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="mx-auto flex min-h-[calc(100vh-2rem)] max-w-6xl flex-col rounded-lg bg-white p-8 shadow md:min-h-[calc(100vh-4rem)]">
        <header className="mb-6 border-b border-gray-100 pb-5">
          <div className="mb-2 text-xs font-semibold uppercase tracking-[0.24em] text-gray-500">
            Story 4
          </div>
          <h1 className="text-3xl font-semibold leading-tight text-gray-900 md:text-4xl">
            {title}
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-gray-600 md:text-base">
            {subtitle}
          </p>
        </header>

        <div className="flex-1">{children}</div>

        {nextSlide ? (
          <Link
            href={nextSlide.href}
            className="fixed right-4 top-1/2 z-20 -translate-y-1/2 text-base text-gray-400 transition duration-150 ease-out hover:scale-125 hover:text-gray-900 md:right-8"
            aria-label={`Go to ${nextSlide.label}`}
          >
            <span className="inline-block">›</span>
          </Link>
        ) : (
          <div
            className="fixed right-4 top-1/2 z-20 -translate-y-1/2 select-none text-base text-gray-400 opacity-25 md:right-8"
            aria-hidden="true"
          >
            ›
          </div>
        )}

        {prevSlide ? (
          <Link
            href={prevSlide.href}
            className="fixed left-4 top-1/2 z-20 -translate-y-1/2 text-base text-gray-400 transition duration-150 ease-out hover:scale-125 hover:text-gray-900 md:left-8"
            aria-label={`Go to ${prevSlide.label}`}
          >
            <span className="inline-block">‹</span>
          </Link>
        ) : (
          <div
            className="fixed left-4 top-1/2 z-20 -translate-y-1/2 select-none text-base text-gray-400 opacity-25 md:left-8"
            aria-hidden="true"
          >
            ‹
          </div>
        )}

        <div className="fixed bottom-2 left-1/2 z-20 flex -translate-x-1/2 items-center gap-3 rounded-full border border-gray-200 bg-white/65 px-4 py-1 text-xs text-gray-600 shadow-md backdrop-blur scale-75 origin-bottom">
          <span className="font-semibold text-gray-900">
            {currentIndex + 1} / {STORY4_SLIDES.length}
          </span>
          <div className="flex items-center gap-2">
            {STORY4_SLIDES.map((slide, index) => (
              <Link key={slide.href} href={slide.href} aria-label={`Go to page ${index + 1}`}>
                <span
                  className={`block h-2 w-2 rounded-full ${
                    slide.href === currentPath ? "bg-gray-900" : "bg-gray-300 hover:bg-gray-400"
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
