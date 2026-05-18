'use client';

import { useEffect, useMemo, useState } from "react";
import type { ChartConfiguration, TooltipItem } from "chart.js";

import FoodVoteChart from "@/components/FoodVoteChart";
import SlideTemplate from "@/components/SlideTemplate";
import {
  FOOD_VOTE_SLIDES,
  formatPercent,
  loadJSON,
  type StateFoodVoteRecord,
  type SummaryData
} from "@/lib/foodData";

function regression(records: StateFoodVoteRecord[]) {
  const n = records.length || 1;
  const xs = records.map((d) => d.foodInsecurityRate);
  const ys = records.map((d) => d.marginTrump);
  const mx = xs.reduce((a, b) => a + b, 0) / n;
  const my = ys.reduce((a, b) => a + b, 0) / n;
  const slope = xs.reduce((sum, x, i) => sum + (x - mx) * (ys[i] - my), 0) / xs.reduce((sum, x) => sum + (x - mx) ** 2, 0);
  const intercept = my - slope * mx;
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  return [
    { x: minX, y: slope * minX + intercept },
    { x: maxX, y: slope * maxX + intercept }
  ];
}

export default function VoteCorrelationPage() {
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

  const margins = records.map((d) => d.marginTrump);
  const minMargin = margins.length ? Math.min(...margins) : 0;
  const maxMargin = margins.length ? Math.max(...margins) : 0;

  const config = useMemo<ChartConfiguration>(() => ({
    type: "scatter",
    data: {
      datasets: [
        {
          type: "line",
          label: "National baseline (13.7%)",
          data: [
            { x: 13.7, y: minMargin },
            { x: 13.7, y: maxMargin }
          ],
          borderColor: "#dc2626",
          backgroundColor: "transparent",
          borderWidth: 2,
          borderDash: [5, 5],
          pointRadius: 0,
          pointHoverRadius: 0,
          datalabels: {
            display: (context) => context.dataIndex === 1,
            anchor: "end",
            align: "right",
            offset: 6,
            color: "#dc2626",
            font: { size: 11, weight: "bold" },
            formatter: () => "13.7%"
          }
        },
        {
          type: "scatter",
          label: "Trump-won states",
          data: records.filter((d) => d.winner === "Trump").map((d) => ({ x: d.foodInsecurityRate, y: d.marginTrump, state: d.stateName })),
          pointRadius: 5,
          pointHoverRadius: 7,
          backgroundColor: "rgba(194,65,12,0.75)",
          borderColor: "#c2410c",
          datalabels: { display: false }
        },
        {
          type: "scatter",
          label: "Harris-won states",
          data: records.filter((d) => d.winner === "Harris").map((d) => ({ x: d.foodInsecurityRate, y: d.marginTrump, state: d.stateName })),
          pointRadius: 5,
          pointHoverRadius: 7,
          backgroundColor: "rgba(37,99,235,0.75)",
          borderColor: "#2563eb",
          datalabels: { display: false }
        },
        {
          type: "line",
          label: "Trend line",
          data: regression(records),
          borderColor: "#0f172a",
          backgroundColor: "#0f172a",
          pointRadius: 0,
          borderWidth: 2,
          tension: 0,
          datalabels: { display: false }
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: "bottom" },
        tooltip: {
          callbacks: {
            label: (ctx: TooltipItem<"scatter">) => {
              const raw = ctx.raw as { x: number; y: number; state?: string };
              if (!raw.state) return ctx.dataset.label ?? "Line";
              return `${raw.state}: ${raw.x.toFixed(1)}% food insecure; Trump margin ${raw.y.toFixed(1)} pts`;
            }
          }
        }
      },
      scales: {
        x: {
          title: { display: true, text: "Food insecurity rate (%)" },
          grid: { color: "rgba(148,163,184,0.25)" }
        },
        y: {
          title: { display: true, text: "Trump margin, percentage points" },
          grid: { color: "rgba(148,163,184,0.25)" }
        }
      }
    }
  }), [records, minMargin, maxMargin]);

  return (
    <SlideTemplate
      currentPath="/vote-correlation"
      slides={FOOD_VOTE_SLIDES}
      deckLabel="Affordability × Child Safety"
      title="Food insecurity and Republican margins move together"
      subtitle="The relationship is not causal, but it is strong enough to guide where affordability messaging can do real political work."
    >
      {status ? (
        <div className="flex h-full items-center justify-center text-sm text-slate-500">{status}</div>
      ) : (
        <div className="grid h-full gap-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(300px,0.65fr)]">
          <section className="min-h-0 rounded-2xl border border-slate-200 bg-white p-5">
            <div className="h-[30rem]">
              <FoodVoteChart config={config} />
            </div>
          </section>
          <aside className="flex min-h-0 flex-col justify-center gap-4">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <div className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Correlation</div>
              <div className="mt-2 text-5xl font-semibold tracking-tight text-slate-900">
                r = {summary?.correlationFoodTrumpMargin.toFixed(2)}
              </div>
              <p className="mt-3 text-sm leading-6 text-slate-700">
                Food insecurity and Trump margin move together at the state level, so affordability language
                can be aimed at voters who already live in higher-pressure states.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Metric label="Trump avg" value={formatPercent(summary?.averageFoodInsecurityByWinner.Trump ?? 13.7)} />
              <Metric label="Harris avg" value={formatPercent(summary?.averageFoodInsecurityByWinner.Harris ?? 11.5)} />
              <Metric label="Food at home" value="2.9% YoY" />
              <Metric label="Away from home" value="3.6% YoY" />
            </div>
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-950">
              <strong>Interpretation:</strong> the point is not that voters behave the same way everywhere.
              The point is that the grocery bill stays salient, which gives Democrats a pocketbook message in states they need to move.
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
