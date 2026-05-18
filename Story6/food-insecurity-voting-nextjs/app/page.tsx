import Link from "next/link";

import SlideTemplate from "@/components/SlideTemplate";
import { FOOD_VOTE_SLIDES } from "@/lib/foodData";

export default function Home() {
  return (
    <SlideTemplate
      currentPath="/"
      slides={FOOD_VOTE_SLIDES}
      deckLabel="Affordability × Child Safety"
      title="Food insecurity is a pocketbook issue Democrats can win in red states"
      subtitle="USDA, Census, BLS, and CDC data show that grocery costs, child hunger, and long-run poverty are tied together in many Republican-leaning states."
    >
      <div className="grid h-full gap-6 lg:grid-cols-[minmax(0,1.25fr)_minmax(320px,0.75fr)]">
        <section className="flex min-h-0 flex-col justify-center">
          <div className="max-w-3xl space-y-5">
            <div className="rounded-2xl border border-rose-200 bg-rose-50 p-5">
              <div className="text-xs font-semibold uppercase tracking-[0.22em] text-rose-700">Story frame</div>
              <p className="mt-2 text-base leading-7 text-rose-950">
                The winning message is not “hunger as charity.” It is lower grocery bills, safer kids,
                and a stronger family budget. That frame can travel in places Democrats usually write off.
              </p>
            </div>
            <h2 className="text-3xl font-semibold tracking-tight text-slate-900 lg:text-4xl">
              If food insecurity is framed as affordability and child safety, it becomes a persuasive
              issue in Republican-leaning states.
            </h2>
            <p className="text-base leading-7 text-slate-700">
              The deck keeps the existing slide rhythm, but the story is now about where families feel
              squeezed, how children absorb the damage, and why Democrats can speak to pocketbooks
              without sounding abstract.
            </p>
            <div className="flex flex-wrap gap-3 text-sm font-medium">
              <span className="rounded-full bg-slate-100 px-4 py-2 text-slate-700">Unit: state + household</span>
              <span className="rounded-full bg-rose-100 px-4 py-2 text-rose-800">USDA: 2024 food security</span>
              <span className="rounded-full bg-amber-100 px-4 py-2 text-amber-800">BLS: April 2026 food inflation</span>
              <span className="rounded-full bg-blue-100 px-4 py-2 text-blue-800">Census: poverty by age</span>
            </div>
          </div>
        </section>

        <aside className="flex min-h-0 flex-col justify-center rounded-2xl border border-slate-200 bg-slate-50 p-5">
          <div className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Story road map</div>
          <ol className="mt-4 space-y-3 text-sm leading-6 text-slate-700">
            <li><strong>1. State burden</strong> - where food insecurity is concentrated in Trump-won states.</li>
            <li><strong>2. Affordability</strong> - why grocery prices keep the issue politically alive.</li>
            <li><strong>3. Children</strong> - how hunger reaches kids even when adults try to shield them.</li>
            <li><strong>4. Age trajectory</strong> - what happens as children age into adults.</li>
            <li><strong>5. Targets</strong> - the states where this message should land first.</li>
          </ol>
          <Link
            href="/scarcity-landscape"
            className="mt-6 inline-flex w-fit items-center rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700"
          >
            Begin analysis
          </Link>
        </aside>
      </div>
    </SlideTemplate>
  );
}
