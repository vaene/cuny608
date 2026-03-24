import Link from "next/link";

import StoryShell from "@/components/StoryShell";
import { formatCurrency } from "@/lib/salaryData";

export default function Home() {
  return (
    <StoryShell
      currentPath="/"
      title="How Much Do Data Practitioners Get Paid?"
      subtitle="Standalone Story 4 built in Next.js and Chart.js, borrowing the slide navigation pattern from Story 1 without living inside that app."
    >
      <div className="grid h-full gap-8 lg:grid-cols-[minmax(0,1.4fr)_minmax(260px,0.8fr)]">
        <section className="flex flex-col justify-center">
          <div className="max-w-3xl">
            <h2 className="text-2xl font-semibold text-gray-900 md:text-3xl">
              Salary differences are substantial across role, level, and geography.
            </h2>
            <p className="mt-5 text-base leading-7 text-gray-700">
              This deck turns Story 4 into its own self-contained presentation. The next slides rank
              roles, show how compensation grows from junior to senior levels, compare regions, and
              break regional patterns back out by role.
            </p>
            <p className="mt-4 text-base leading-7 text-gray-700">
              The app uses static JSON served locally, so the visual story is deployable without a
              notebook runtime while remaining separate from Story 1.
            </p>
            <div className="mt-8 flex flex-wrap gap-3 text-sm text-gray-600">
              <span className="rounded-full bg-indigo-50 px-4 py-2 text-indigo-700">
                Top role avg: {formatCurrency(132800.5)}
              </span>
              <span className="rounded-full bg-emerald-50 px-4 py-2 text-emerald-700">
                Senior architect: {formatCurrency(182300)}
              </span>
              <span className="rounded-full bg-slate-100 px-4 py-2 text-slate-700">
                Highest region avg: {formatCurrency(135200.45)}
              </span>
            </div>
          </div>
        </section>

        <aside className="flex flex-col justify-center rounded-2xl border border-gray-200 bg-gray-50 p-6">
          <div className="text-sm font-semibold uppercase tracking-[0.18em] text-gray-500">
            Slide Roadmap
          </div>
          <ol className="mt-4 space-y-3 text-sm leading-6 text-gray-700">
            <li>1. Role ranking shows which job families command the highest average pay.</li>
            <li>2. Career level progression reveals how salary growth stacks across roles.</li>
            <li>3. Regional comparison shows where salary premiums are strongest.</li>
            <li>4. Region-by-role detail separates broad market effects from role mix.</li>
            <li>5. Sources and limitations keep the occupational mapping explicit.</li>
          </ol>
          <Link
            href="/salary-role"
            className="mt-6 inline-flex w-fit items-center rounded-full bg-gray-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-700"
          >
            Start Story 4
          </Link>
        </aside>
      </div>
    </StoryShell>
  );
}
