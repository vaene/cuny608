'use client';

import { useEffect, useRef, useState } from "react";
import {
  BarController,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  type ChartConfiguration,
  Legend,
  LinearScale,
  Tooltip
} from "chart.js";

import StoryShell from "@/components/StoryShell";
import {
  REGION_ORDER,
  formatCurrency,
  formatCurrencyCompact,
  getRegionColor,
  hexToRgba,
  loadJSON,
  type SalaryByRegionRecord
} from "@/lib/salaryData";

ChartJS.register(BarController, BarElement, CategoryScale, LinearScale, Tooltip, Legend);

export default function SalaryRegionPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<ChartJS<"bar"> | null>(null);
  const [status, setStatus] = useState("Loading salary-by-region data...");

  useEffect(() => {
    let active = true;

    async function renderChart() {
      try {
        const data = await loadJSON<SalaryByRegionRecord[]>("/data/salary-by-region.json");
        if (!active || !canvasRef.current) return;

        const byRegion = new Map(data.map((record) => [record.region, record]));
        const ordered = REGION_ORDER.map((region) => byRegion.get(region)).filter(
          (record): record is SalaryByRegionRecord => Boolean(record)
        );

        const config: ChartConfiguration<"bar", number[], string> = {
          type: "bar",
          data: {
            labels: ordered.map((record) => record.region),
            datasets: [
              {
                label: "Mean salary",
                data: ordered.map((record) => record.mean),
                backgroundColor: ordered.map((record) => hexToRgba(getRegionColor(record.region), 0.82)),
                borderColor: ordered.map((record) => getRegionColor(record.region)),
                borderWidth: 1.5,
                borderRadius: 8
              },
              {
                label: "Median salary",
                data: ordered.map((record) => record.median),
                backgroundColor: ordered.map((record) => hexToRgba(getRegionColor(record.region), 0.35)),
                borderColor: ordered.map((record) => getRegionColor(record.region)),
                borderWidth: 1.5,
                borderRadius: 8
              }
            ]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: "bottom"
              },
              tooltip: {
                callbacks: {
                  label(context) {
                    return `${context.dataset.label}: ${formatCurrency(context.parsed.y)}`;
                  }
                }
              }
            },
            scales: {
              y: {
                ticks: {
                  callback(value) {
                    return formatCurrencyCompact(Number(value));
                  }
                },
                grid: {
                  color: "#E5E7EB"
                }
              },
              x: {
                grid: {
                  display: false
                }
              }
            }
          }
        };

        chartRef.current?.destroy();
        chartRef.current = new ChartJS(canvasRef.current, config);
        setStatus("");
      } catch (error) {
        setStatus(error instanceof Error ? error.message : "Failed to render region chart.");
      }
    }

    renderChart();

    return () => {
      active = false;
      chartRef.current?.destroy();
      chartRef.current = null;
    };
  }, []);

  return (
    <StoryShell
      currentPath="/salary-region"
      title="Geography Changes The Salary Baseline"
      subtitle="The West and Northeast lead the regional ranking, while the Southeast sits at the low end of this summary."
    >
      <div className="grid h-full gap-8 lg:grid-cols-[minmax(0,1.7fr)_minmax(280px,0.9fr)]">
        <section className="relative min-h-[420px] rounded-2xl border border-gray-200 bg-white p-4">
          {status ? (
            <div className="flex h-full items-center justify-center text-sm text-gray-500">{status}</div>
          ) : null}
          <canvas ref={canvasRef} className={status ? "hidden" : "h-full w-full"} />
        </section>

        <aside className="rounded-2xl border border-gray-200 bg-gray-50 p-6">
          <div className="text-sm font-semibold uppercase tracking-[0.18em] text-gray-500">
            Takeaway
          </div>
          <p className="mt-4 text-sm leading-6 text-gray-700">
            The West has the highest mean salary at roughly {formatCurrency(135200.45)}, ahead of the
            Northeast. The Southeast is lowest in this grouped view.
          </p>
          <p className="mt-4 text-sm leading-6 text-gray-700">
            The mean and median bars stay fairly close in each region, which suggests the broad ranking
            is not being driven by only a handful of extreme observations.
          </p>
        </aside>
      </div>
    </StoryShell>
  );
}
