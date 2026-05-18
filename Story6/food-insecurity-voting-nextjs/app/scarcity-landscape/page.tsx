'use client';

import { useEffect, useMemo, useState } from "react";
import type { ChartConfiguration, TooltipItem } from "chart.js";

import FoodVoteChart from "@/components/FoodVoteChart";
import SlideTemplate from "@/components/SlideTemplate";
import {
  FOOD_VOTE_SLIDES,
  formatPercent,
  loadJSON,
  sortByFoodDesc,
  type StateFoodVoteRecord,
  type SummaryData
} from "@/lib/foodData";

export default function ScarcityLandscapePage() {
  const [records, setRecords] = useState<StateFoodVoteRecord[]>([]);
  const [summary, setSummary] = useState<SummaryData | null>(null);
  const [status, setStatus] = useState("Loading data...");

  useEffect(() => {
    Promise.all([
      loadJSON<StateFoodVoteRecord[]>("/data/story6-state-data.json"),
      loadJSON<SummaryData>("/data/story6-summary.json")
    ])
      .then(([r, s]) => {
        setRecords(r);
        setSummary(s);
        setStatus("");
      })
      .catch((error) => setStatus(error instanceof Error ? error.message : "Unable to load data"));
  }, []);

  const top = useMemo(() => sortByFoodDesc(records).slice(0, 10), [records]);

  const config = useMemo<ChartConfiguration>(() => ({
    type: "bar",
    data: {
      labels: top.map((d) => d.state),
      datasets: [
        {
          label: "Food insecurity rate",
          data: top.map((d) => d.foodInsecurityRate),
          backgroundColor: top.map((d) => d.winner === "Trump" ? "rgba(194,65,12,0.78)" : "rgba(37,99,235,0.78)"),
          borderColor: top.map((d) => d.winner === "Trump" ? "#c2410c" : "#2563eb"),
          borderWidth: 1.5,
          datalabels: { display: false }
        },
        {
          type: "line",
          label: "National baseline (13.7%)",
          data: top.map(() => 13.7),
          borderColor: "#dc2626",
          backgroundColor: "transparent",
          borderWidth: 2,
          pointRadius: 0,
          pointHoverRadius: 0,
          borderDash: [5, 5],
          datalabels: {
            display: true,
            anchor: "end",
            align: "end",
            offset: 5,
            font: { size: 11, weight: "bold" },
            color: "#dc2626",
            formatter: (_value, context) => context.dataIndex === 0 ? "13.7%" : ""
          }
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      indexAxis: "y",
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (ctx: TooltipItem<"bar">) => `${Number(ctx.parsed.x).toFixed(1)}% food insecure`
          }
        }
      },
      scales: {
        x: {
          min: 0,
          max: 22,
          title: { display: true, text: "Food insecurity rate (%)" },
          grid: { display: false }
        },
        y: { grid: { display: false } }
      }
    }
  }), [top]);

  return (
    <SlideTemplate
      currentPath="/scarcity-landscape"
      slides={FOOD_VOTE_SLIDES}
      deckLabel="Affordability × Child Safety"
      title="The highest-food-insecurity states are already Republican-leaning"
      subtitle="The same states that struggle most with food insecurity also lean red in 2024, which is why affordability language can open doors for Democrats."
    >
      {status ? (
        <div className="flex h-full items-center justify-center text-sm text-slate-500">{status}</div>
      ) : (
        <div className="grid h-full gap-6 lg:grid-cols-[minmax(0,1.25fr)_minmax(300px,0.75fr)]">
          <section className="min-h-0 rounded-2xl border border-slate-200 bg-white p-5">
            <div className="mb-3 flex items-end justify-between gap-4">
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Ranked states</div>
                <h2 className="mt-1 text-xl font-semibold text-slate-900">Top 10 by food insecurity</h2>
              </div>
              <div className="text-right text-xs text-slate-500">
                The top 10 are all Trump-won states, so the affordability message starts where the opposition already dominates.
              </div>
            </div>
            <div className="h-[27rem]">
              <FoodVoteChart config={config} />
            </div>
          </section>

          <aside className="flex min-h-0 flex-col gap-4">
            <div className="rounded-2xl border border-rose-200 bg-rose-50 p-5">
              <div className="text-xs font-semibold uppercase tracking-[0.22em] text-rose-700">Key message</div>
              <p className="mt-3 text-sm leading-6 text-rose-950">
                If Democrats speak in the language of grocery bills, family budgets, and child safety,
                the issue becomes a pocketbook fight in places that are not naturally blue.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Metric label="Highest" value="AR 19.4%" />
              <Metric label="Lowest" value="ND 9.0%" />
              <Metric
                label="Trump average"
                value={summary ? formatPercent(summary.averageFoodInsecurityByWinner.Trump) : "13.7%"}
              />
              <Metric
                label="Harris average"
                value={summary ? formatPercent(summary.averageFoodInsecurityByWinner.Harris) : "11.5%"}
              />
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 text-sm leading-6 text-slate-700">
              <strong>Lobbying angle:</strong> the map does not say “these voters are unreachable.” It says
              the problem is concentrated where cost-of-living arguments can be made most forcefully.
            </div>
          </aside>
        </div>
      )}
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
