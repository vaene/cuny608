'use client';

import { useEffect, useRef, useState } from "react";
import {
  CategoryScale,
  Chart as ChartJS,
  type ChartConfiguration,
  Legend,
  LineController,
  LineElement,
  LinearScale,
  PointElement,
  Tooltip
} from "chart.js";

import StoryShell from "@/components/StoryShell";
import {
  LEVEL_ORDER,
  formatCurrency,
  formatCurrencyCompact,
  getRoleColor,
  loadJSON,
  type SalaryMatrix
} from "@/lib/salaryData";

ChartJS.register(LineController, LineElement, PointElement, CategoryScale, LinearScale, Tooltip, Legend);

export default function SalaryLevelPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<ChartJS<"line"> | null>(null);
  const [status, setStatus] = useState("Loading salary-by-level-role data...");

  useEffect(() => {
    let active = true;

    async function renderChart() {
      try {
        const data = await loadJSON<SalaryMatrix>("/data/salary-by-level-role.json");
        if (!active || !canvasRef.current) return;

        const roles = Object.keys(data[LEVEL_ORDER[0]] ?? {});

        const config: ChartConfiguration<"line", number[], string> = {
          type: "line",
          data: {
            labels: [...LEVEL_ORDER],
            datasets: roles.map((role) => ({
              label: role,
              data: LEVEL_ORDER.map((level) => data[level]?.[role] ?? 0),
              borderColor: getRoleColor(role),
              backgroundColor: getRoleColor(role),
              pointRadius: 5,
              pointHoverRadius: 6,
              tension: 0.28
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
        setStatus(error instanceof Error ? error.message : "Failed to render level chart.");
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
      currentPath="/608/Story4/levels"
      title="Experience Adds A Strong Premium Across Every Role"
      subtitle="The level progression is steep, but the absolute ceiling remains highest for architect and scientist paths."
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
            Seniority lifts every line. For example, Data Architect rises from about {formatCurrency(85000)}
            at junior level to {formatCurrency(182300)} at senior level.
          </p>
          <p className="mt-4 text-sm leading-6 text-gray-700">
            That means career stage and role family reinforce one another: the highest-paying specialties
            also preserve the largest high-end earning potential.
          </p>
        </aside>
      </div>
    </StoryShell>
  );
}
