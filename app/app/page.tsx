import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-16 text-center">
          <h1 className="text-4xl font-bold text-gray-900 md:text-5xl">
            CUNY 608: Data Stories
          </h1>
          <p className="mt-4 text-lg text-gray-600">
            Interactive data visualizations and analyses built with React, TypeScript, and Next.js
          </p>
        </div>

        {/* Stories Grid */}
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Story 4 */}
          <div className="rounded-2xl border-2 border-gray-200 bg-white p-8 shadow-lg transition hover:shadow-xl hover:border-gray-400">
            <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-lg bg-indigo-100">
              <span className="text-2xl font-bold text-indigo-700">4</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900">
              Data Practitioner Salaries
            </h2>
            <p className="mt-3 text-gray-600">
              How much do data scientists, engineers, analysts, and architects earn? This interactive story explores salary patterns across roles, experience levels, and geography using Bureau of Labor Statistics data.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              <span className="rounded-full bg-indigo-50 px-3 py-1 text-sm text-indigo-700">
                Interactive Charts
              </span>
              <span className="rounded-full bg-indigo-50 px-3 py-1 text-sm text-indigo-700">
                Regional Analysis
              </span>
              <span className="rounded-full bg-indigo-50 px-3 py-1 text-sm text-indigo-700">
                Career Progression
              </span>
            </div>
            <Link
              href="/608/Story4"
              className="mt-6 inline-flex items-center rounded-lg bg-indigo-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700"
            >
              Explore Story 4 →
            </Link>
          </div>

          {/* Story 5 */}
          <div className="rounded-2xl border-2 border-slate-200 bg-slate-900 p-8 shadow-lg transition hover:shadow-xl hover:border-slate-400">
            <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-lg bg-slate-700">
              <span className="text-2xl font-bold text-slate-100">5</span>
            </div>
            <h2 className="text-2xl font-bold text-white">
              Climate & Storms
            </h2>
            <p className="mt-3 text-slate-300">
              Does global warming make storms stronger? This story connects 75 years of temperature data with tornado frequency and hurricane intensity using NASA and NOAA datasets, plus a NASA Climate Spiral-inspired visualization.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              <span className="rounded-full bg-slate-700 px-3 py-1 text-sm text-slate-100">
                Climate Science
              </span>
              <span className="rounded-full bg-slate-700 px-3 py-1 text-sm text-slate-100">
                Animated Spiral
              </span>
              <span className="rounded-full bg-slate-700 px-3 py-1 text-sm text-slate-100">
                Correlation Analysis
              </span>
            </div>
            <Link
              href="/608/Story5"
              className="mt-6 inline-flex items-center rounded-lg bg-slate-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-500"
            >
              Explore Story 5 →
            </Link>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-16 border-t border-gray-200 pt-8 text-center text-sm text-gray-500">
          <p>Built with React, TypeScript, Next.js, and Tailwind CSS</p>
          <p className="mt-2">Data sources: BLS, NASA GISS, NOAA NCEI, NOAA IBTrACS</p>
        </div>
      </div>
    </main>
  );
}
