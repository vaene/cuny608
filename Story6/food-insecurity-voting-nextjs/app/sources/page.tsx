import SlideTemplate from "@/components/SlideTemplate";
import { FOOD_VOTE_SLIDES } from "@/lib/foodData";

const LOCAL_BUNDLE_URL = "https://cuny.drinkthesand.com/608/Story6/Story6-local-bundle.zip";

const sources = [
  {
    title: "USDA ERS household food security in 2024",
    note: "National prevalence of food insecurity, very low food security, and households with children.",
    url: "https://ers.usda.gov/publications/pub-details?pubid=113622"
  },
  {
    title: "USDA ERS state food insecurity file",
    note: "State-level three-year average food insecurity and very low food security rates.",
    url: "https://www.ers.usda.gov/media/6988/mapdata.xlsx"
  },
  {
    title: "Census poverty by age and state",
    note: "State poverty rates for people under 18, ages 18 to 64, and ages 65+ using the 2022-2024 average.",
    url: "https://www2.census.gov/programs-surveys/demo/tables/p60/287/spm_opm_state_by_age.xlsx"
  },
  {
    title: "BLS April 2026 CPI release",
    note: "Used for the affordability hook on food at home and food away from home inflation.",
    url: "https://www.bls.gov/news.release/archives/cpi_05122026.htm"
  },
  {
    title: "CDC school meal and child health brief",
    note: "Supports the child safety framing and the argument for school meals.",
    url: "https://stacks.cdc.gov/view/cdc/168587/cdc_168587_DS4.pdf"
  },
  {
    title: "FAO global framing source",
    note: "The assignment’s starting point, then reframed for the United States.",
    url: "https://openknowledge.fao.org/items/c0239a36-7f34-4170-87f7-2fcc179ef064"
  }
];

export default function SourcesPage() {
  return (
    <SlideTemplate
      currentPath="/sources"
      slides={FOOD_VOTE_SLIDES}
      deckLabel="Affordability × Child Safety"
      title="Sources, method, and limits"
      subtitle="The analysis is built for a political audience, but it keeps the evidence trail visible and the causal claims cautious."
    >
      <div className="grid h-full gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(340px,0.8fr)]">
        <section className="min-h-0 rounded-2xl border border-slate-200 bg-white p-5">
          <div className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Data inputs</div>
          <div className="mt-4 space-y-3">
            {sources.map((source) => (
              <div key={source.title} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="font-semibold text-slate-900">{source.title}</div>
                <p className="mt-1 text-sm leading-5 text-slate-700">{source.note}</p>
                <div className="mt-2 break-all text-[0.7rem] leading-4 text-slate-500">{source.url}</div>
              </div>
            ))}
          </div>
        </section>

        <aside className="flex min-h-0 flex-col gap-4">
          <div className="rounded-2xl border border-blue-200 bg-blue-50 p-5">
            <div className="text-xs font-semibold uppercase tracking-[0.22em] text-blue-700">Method</div>
            <ol className="mt-3 space-y-2 text-sm leading-6 text-blue-950">
              <li>1. Join USDA state food insecurity data to 2024 presidential results.</li>
              <li>2. Merge Census poverty rates by age for the same states.</li>
              <li>3. Compare child poverty with working-age poverty to show what happens as kids age.</li>
              <li>4. Use state patterns to guide a pocketbook-first political message.</li>
            </ol>
          </div>
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
            <div className="text-xs font-semibold uppercase tracking-[0.22em] text-amber-700">Limits</div>
            <p className="mt-3 text-sm leading-6 text-amber-950">
              This is state-level evidence, so it is best for messaging and targeting rather than causal proof.
              A county-level model with income, rurality, race, and program participation would sharpen the case further.
            </p>
          </div>
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-5">
            <div className="text-xs font-semibold uppercase tracking-[0.22em] text-rose-700">Political takeaway</div>
            <p className="mt-3 text-sm leading-6 text-rose-950">
              The most durable frame is affordability plus child safety: lower grocery bills, safer kids,
              and a family budget message that can travel in red and purple states.
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Repro bundle</div>
            <p className="mt-3 text-sm leading-6 text-slate-700">
              Download the reproducible Story 6 source bundle here:
            </p>
            <a
              href={LOCAL_BUNDLE_URL}
              className="mt-4 inline-flex w-fit items-center rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700"
            >
              Story 6 Bundle
            </a>
          </div>
        </aside>
      </div>
    </SlideTemplate>
  );
}
