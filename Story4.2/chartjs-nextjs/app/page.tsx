import Link from "next/link";

import StoryShell from "@/components/StoryShell";
import { formatCurrency } from "@/lib/salaryData";

export default function Home() {
  return (
    <StoryShell
      currentPath="/"
      title="How Much Do Data Practitioners Get Paid?"
      subtitle="Geographic salary variation driven by population density and cost of living."
    >
      <div className="space-y-8">
        <section className="rounded-2xl border border-blue-200 bg-blue-50 p-6">
          <div className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-800">
            Focus
          </div>
          <p className="mt-2 text-sm leading-6 text-blue-900 md:text-base">
            This story argues that salary differences are mainly the result of a combination of
            <strong> cost of living </strong>
            and
            <strong> population density </strong>
            effects. The later slides test that claim step by step, first by establishing a role
            baseline and then by showing how geography changes the pattern.
          </p>
        </section>

        <div className="grid h-full gap-8 lg:grid-cols-[minmax(0,1.4fr)_minmax(260px,0.8fr)]">
        <section className="flex flex-col justify-center">
          <div className="max-w-3xl">
            <h2 className="text-2xl font-semibold text-gray-900 md:text-3xl">
              Location matters: density and cost of living drive salary differences.
            </h2>
            <p className="mt-5 text-base leading-7 text-gray-700">
              Data Practitioner salaries vary dramatically across geographies. This analysis tracks 
              how compensation correlates with <strong>cost of living (COLA)</strong> and <strong>population density</strong>. 
              Remote work, treated separately, offers an interesting baseline for comparison.
            </p>
            <p className="mt-4 text-base leading-7 text-gray-700">
              We start with role baseline pay, then reveal how location type (urban high-COLA vs. 
              rural low-COLA) reshapes the salary story, including direct scatter analysis of COLA 
              and density effects.
            </p>
            <div className="mt-8 flex flex-wrap gap-3 text-sm text-gray-600">
              <span className="rounded-full bg-red-50 px-4 py-2 text-red-700">
                Highest: {formatCurrency(135200)} (Urban High-COLA)
              </span>
              <span className="rounded-full bg-green-50 px-4 py-2 text-green-700">
                Lowest: {formatCurrency(98900)} (Rural Low-COLA)
              </span>
              <span className="rounded-full bg-slate-100 px-4 py-2 text-slate-700">
                Remote: {formatCurrency(118500)}
              </span>
            </div>
          </div>
        </section>

        <aside className="flex flex-col justify-center rounded-2xl border border-gray-200 bg-gray-50 p-6">
          <div className="text-sm font-semibold uppercase tracking-[0.18em] text-gray-500">
            Slide Roadmap
          </div>
          <ol className="mt-4 space-y-3 text-sm leading-6 text-gray-700">
            <li><strong>1. By Role</strong> – Establish the role baseline before testing the focus.</li>
            <li><strong>2. Location Context</strong> – Define the COLA and density categories behind the focus.</li>
            <li><strong>3. By Location Type</strong> – Show how average pay shifts once geography is introduced.</li>
            <li><strong>4. COLA Impact</strong> – Test whether cost of living explains salary differences.</li>
            <li><strong>5. Density Impact</strong> – Test whether population density adds explanatory power.</li>
            <li><strong>6. Sources</strong> – Clarify the assumptions used to support the focus.</li>
          </ol>
          <Link
            href="/salary-role"
            className="mt-6 inline-flex w-fit items-center rounded-full bg-gray-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-700"
          >
            Begin Analysis
          </Link>
        </aside>
        </div>
      </div>
    </StoryShell>
  );
}
