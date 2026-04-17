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
  getRoleColor,
  loadJSON,
  type SalaryMatrix
} from "@/lib/salaryData";

ChartJS.register(BarController, BarElement, CategoryScale, LinearScale, Tooltip, Legend);

export default function SalaryRegionRolePage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<ChartJS<"bar"> | null>(null);
  const [status, setStatus] = useState("Loading salary-region-role data...");

  useEffect(() => {
    let active = true;

    async function renderChart() {
      try {
        const data = await loadJSON<SalaryMatrix>("/data/salary-region-role.json");
        if (!active || !canvasRef.current) return;

        const roles = Object.keys(data[REGION_ORDER[0]] ?? {});

        const config: ChartConfiguration<"bar", number[], string> = {
          type: "bar",
          data: {
            labels: [...REGION_ORDER],
            datasets: roles.map((role) => ({
              label: role,
              data: REGION_ORDER.map((region) => data[region]?.[role] ?? 0),
              backgroundColor: getRoleColor(role),
              borderRadius: 6
            }))
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
              mode: "index",
              intersect: false
            },
            plugins: {
              legend: {
                position: "bottom"
              },
              tooltip: {
                callbacks: {
                  label(context) {
                    return `${context.dataset.label}: ${formatCurrency(context.parsed.y ?? 0)}`;
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
                stacked: false,
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
        setStatus(error instanceof Error ? error.message : "Failed to render region-by-role chart.");
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
      currentPath="/salary-region-role"
      title="Region Still Matters After You Control For Role"
      subtitle="The ordering is broadly stable across roles: western and northeastern markets tend to pay more, while southern and midwestern markets usually sit lower."
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
            The grouped bars show that role alone does not explain the entire salary pattern. The same
            role tends to earn more in western and northeastern markets than in the Southeast or Midwest.
          </p>
          <p className="mt-4 text-sm leading-6 text-gray-700">
            Data Architect remains the top-paid role in every region shown here, while Data Analyst stays
            at the lower end across the board.
          </p>
        </aside>
      </div>
    </StoryShell>
  );
}
