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

export default function PolicyTargetsPage() {
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

  const targets = useMemo(
    () => [...(summary?.targetStates ?? [])].sort((a, b) => b.foodInsecurityRate - a.foodInsecurityRate).slice(0, 4),
    [summary]
  );

  const chartStates = useMemo(
    () => [...records].sort((a, b) => b.foodInsecurityRate - a.foodInsecurityRate).slice(0, 8),
    [records]
  );

  const config = useMemo<ChartConfiguration>(() => ({
    type: "bar",
    data: {
      labels: chartStates.map((d) => d.state),
      datasets: [
        {
          label: "Under 18 poverty",
          data: chartStates.map((d) => d.under18PovertyRate),
          backgroundColor: "rgba(153,27,27,0.82)",
          borderColor: "#991b1b",
          borderWidth: 1
        },
        {
          label: "Ages 18-64 poverty",
          data: chartStates.map((d) => d.age18to64PovertyRate),
          backgroundColor: "rgba(249,115,22,0.72)",
          borderColor: "#f97316",
          borderWidth: 1
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      indexAxis: "y",
      plugins: {
        legend: { position: "bottom" },
        tooltip: {
          callbacks: {
            label: (ctx: TooltipItem<"bar">) => `${ctx.dataset.label}: ${Number(ctx.parsed.x).toFixed(1)}%`
          }
        }
      },
      scales: {
        x: {
          title: { display: true, text: "Poverty rate (%)" },
          grid: { display: false }
        },
        y: { grid: { display: false } }
      }
    }
  }), [chartStates]);

  return (
    <SlideTemplate
      currentPath="/policy-targets"
      slides={FOOD_VOTE_SLIDES}
      deckLabel="Affordability × Child Safety"
      title="Child poverty stays elevated as kids age into adulthood"
      subtitle="In the same high-scarcity states, under-18 poverty sits above working-age poverty, which is why the message has to connect child safety to affordability."
    >
      {status ? (
        <div className="flex h-full items-center justify-center text-sm text-slate-500">{status}</div>
      ) : (
        <div className="grid h-full gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(350px,0.8fr)]">
          <section className="min-h-0 rounded-2xl border border-slate-200 bg-white p-5">
            <div className="h-[29rem]">
              <FoodVoteChart config={config} />
            </div>
          </section>
          <aside className="flex min-h-0 flex-col gap-4">
            <div className="rounded-2xl border border-rose-200 bg-rose-50 p-5">
              <div className="text-xs font-semibold uppercase tracking-[0.22em] text-rose-700">Policy frame</div>
              <p className="mt-3 text-sm leading-6 text-rose-950">
                Protect SNAP, WIC, school meals, Summer EBT, and food-bank capacity as affordability tools,
                then use the map to defend those programs first in the states where child poverty is highest.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Metric label="Under 18 national" value={summary ? formatPercent(summary.nationalPovertyUnder18Rate) : "14.8%"} />
              <Metric label="18-64 national" value={summary ? formatPercent(summary.nationalPovertyAge18to64Rate) : "10.0%"} />
              <Metric label="Food insecurity avg" value={summary ? formatPercent(summary.averageFoodInsecurityByWinner.Trump) : "13.7%"} />
              <Metric label="Child safety ask" value="Keep meals free" />
            </div>
            <div className="min-h-0 flex-1 overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <div className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Priority states</div>
              <div className="mt-4 space-y-2">
                {targets.map((d) => (
                  <div key={d.state} className="rounded-xl bg-white px-3 py-2 ring-1 ring-slate-200">
                    <div className="flex justify-between gap-2 font-semibold text-slate-900">
                      <span>{d.state}</span>
                      <span>{formatPercent(d.foodInsecurityRate)}</span>
                    </div>
                    <div className="mt-1 text-slate-500">
                      Child gap {d.childAdultPovertyGap > 0 ? "+" : ""}
                      {d.childAdultPovertyGap.toFixed(1)} pts
                    </div>
                  </div>
                ))}
              </div>
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
