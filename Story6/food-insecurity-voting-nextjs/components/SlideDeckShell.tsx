import Link from "next/link";
import type { ReactNode } from "react";

export interface DeckSlide {
  href: string;
  label: string;
}

export interface SlideDeckShellProps {
  currentPath: string;
  slides: readonly DeckSlide[];
  deckLabel: string;
  title: string;
  subtitle: string;
  children: ReactNode;
  theme?: "light" | "dark";
}

export default function SlideDeckShell({
  currentPath,
  slides,
  deckLabel,
  title,
  subtitle,
  children,
  theme = "light"
}: SlideDeckShellProps) {
  const currentIndex = slides.findIndex((slide) => slide.href === currentPath);
  const prevSlide = currentIndex > 0 ? slides[currentIndex - 1] : null;
  const nextSlide = currentIndex < slides.length - 1 ? slides[currentIndex + 1] : null;
  const isDark = theme === "dark";

  return (
    <main
      className={`min-h-screen ${isDark ? "bg-slate-950 text-slate-100" : "bg-slate-100 text-slate-900"} p-2 sm:p-4`}
    >
      <div className="mx-auto flex min-h-[calc(100vh-1rem)] max-w-[calc(100vh*16/9)] items-center justify-center sm:min-h-[calc(100vh-2rem)]">
        <section
          className={`slide-frame relative flex w-full overflow-hidden rounded-[1.75rem] shadow-2xl ${
            isDark ? "bg-slate-950 ring-1 ring-white/10" : "bg-white ring-1 ring-black/5"
          }`}
        >
          <div className="flex h-full w-full flex-col p-4 sm:p-6 lg:p-8">
            <header
              className={`slide-header mb-4 border-b pb-4 sm:mb-5 sm:pb-5 ${
                isDark ? "border-white/10" : "border-slate-200"
              }`}
            >
              <div
                className={`mb-2 text-[0.65rem] font-semibold uppercase tracking-[0.28em] ${
                  isDark ? "text-slate-400" : "text-slate-500"
                }`}
              >
                {deckLabel}
              </div>
              <h1 className="text-2xl font-semibold leading-tight sm:text-3xl lg:text-[2.15rem]">
                {title}
              </h1>
              <p className={`mt-2 max-w-3xl text-sm leading-6 sm:text-base ${isDark ? "text-slate-300" : "text-slate-600"}`}>
                {subtitle}
              </p>
            </header>

            <div className="slide-body min-h-0 flex-1 overflow-hidden">{children}</div>

            <footer className="mt-4 flex items-center justify-between gap-3">
              <div
                className={`rounded-full px-3 py-1 text-[0.7rem] font-semibold uppercase tracking-[0.22em] ${
                  isDark ? "bg-white/5 text-slate-400" : "bg-slate-100 text-slate-500"
                }`}
              >
                {currentIndex + 1} / {slides.length}
              </div>

              <div className="flex items-center gap-1.5">
                {slides.map((slide, index) => (
                  <Link key={slide.href} href={slide.href} aria-label={`Go to slide ${index + 1}`}>
                    <span
                      className={`block h-2.5 w-2.5 rounded-full transition ${
                        slide.href === currentPath
                          ? isDark ? "bg-slate-100" : "bg-slate-900"
                          : isDark ? "bg-slate-700 hover:bg-slate-500" : "bg-slate-300 hover:bg-slate-500"
                      }`}
                    />
                  </Link>
                ))}
              </div>
            </footer>
          </div>

          {prevSlide ? (
            <Link
              href={prevSlide.href}
              className={`slide-nav slide-nav-left ${isDark ? "text-slate-400 hover:text-slate-100" : "text-slate-400 hover:text-slate-900"}`}
              aria-label={`Go to ${prevSlide.label}`}
            >
              ‹
            </Link>
          ) : null}

          {nextSlide ? (
            <Link
              href={nextSlide.href}
              className={`slide-nav slide-nav-right ${isDark ? "text-slate-400 hover:text-slate-100" : "text-slate-400 hover:text-slate-900"}`}
              aria-label={`Go to ${nextSlide.label}`}
            >
              ›
            </Link>
          ) : null}
        </section>
      </div>
    </main>
  );
}
