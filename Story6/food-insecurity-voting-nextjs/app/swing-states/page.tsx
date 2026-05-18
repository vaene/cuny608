'use client';

import { useMemo } from "react";
import type { ChartConfiguration } from "chart.js";

import FoodVoteChart from "@/components/FoodVoteChart";
import SlideTemplate from "@/components/SlideTemplate";
import { FOOD_VOTE_SLIDES } from "@/lib/foodData";

export default function SwingStatesPage() {
  const config = useMemo<ChartConfiguration>(() => ({
    type: "doughnut",
    data: {
      labels: [
        "Food secure",
        "Adults only food insecure",
        "Adults and children food insecure",
        "Very low food security among children"
      ],
      datasets: [{
        label: "Households with children",
        data: [
          81.6,
          9.3,
          9.1,
          0.9
        ],
        backgroundColor: [
          "rgba(15,118,110,0.88)",
          "rgba(249,115,22,0.86)",
          "rgba(220,38,38,0.84)",
          "rgba(127,29,29,0.92)"
        ],
        borderColor: "#ffffff",
        borderWidth: 2,
        datalabels: {
          display: false
        }
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: "62%",
      plugins: {
        legend: { position: "bottom" },
        tooltip: {
          callbacks: {
            label: (ctx) => `${ctx.label}: ${Number(ctx.raw).toFixed(1)}%`
          }
        }
      }
    }
  }), []);

  return (
    <SlideTemplate
      currentPath="/swing-states"
      slides={FOOD_VOTE_SLIDES}
      deckLabel="Affordability × Child Safety"
      title="Children absorb the shock, but they do not escape it"
      subtitle="Most parents try to shield children from hunger, yet the USDA still finds that 18.4% of households with children were food insecure in 2024."
    >
      <div className="grid h-full gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(360px,0.85fr)]">
        <section className="min-h-0 rounded-2xl border border-slate-200 bg-white p-5">
          <div className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Households with children</div>
          <div className="h-[28rem]">
            <FoodVoteChart config={config} />
          </div>
        </section>

        <aside className="flex min-h-0 flex-col gap-4">
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-5">
            <div className="text-xs font-semibold uppercase tracking-[0.22em] text-rose-700">Child safety frame</div>
            <p className="mt-3 text-sm leading-6 text-rose-950">
              The pain point is not just hunger. CDC says food insecurity is linked to poorer physical
              and mental health, more hospitalizations, worse academic performance, and behavioral problems.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Metric label="Food insecure" value="18.4%" />
            <Metric label="Adults only" value="9.3%" />
            <Metric label="Both adults + kids" value="9.1%" />
            <Metric label="Very low among kids" value="0.9%" />
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 text-sm leading-6 text-slate-700">
            <strong>Why this matters politically:</strong> the strongest pro-family message is not punitive.
            It is “school meals, SNAP, and WIC keep children safe while parents work the budget math.”
          </div>
        </aside>
      </div>
    </SlideTemplate>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-slate-500">{label}</div>
      <div className="mt-2 text-2xl font-semibold text-slate-900">{value}</div>
    </div>
  );
}
