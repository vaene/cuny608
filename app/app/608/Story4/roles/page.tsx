'use client';

import { useEffect, useRef, useState } from "react";
import {
  BarController,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  type ChartConfiguration,
  LinearScale,
  Tooltip
} from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";

import StoryShell from "@/components/StoryShell";
import {
  formatCurrency,
  formatCurrencyCompact,
  getRoleColor,
  hexToRgba,
  loadJSON,
  type SalaryByRoleRecord
} from "@/lib/salaryData";

ChartJS.register(BarController, BarElement, CategoryScale, LinearScale, Tooltip, ChartDataLabels);

export default function SalaryRolePage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<ChartJS<"bar"> | null>(null);
  const [status, setStatus] = useState("Loading salary-by-role data...");

  useEffect(() => {
    let active = true;

    async function renderChart() {
      try {
        const data = await loadJSON<SalaryByRoleRecord[]>("/data/salary-by-role.json");
        if (!active || !canvasRef.current) return;

        const sorted = [...data].sort((a, b) => b.mean - a.mean);
        const colors = sorted.map((record) => getRoleColor(record.role));

        const config: ChartConfiguration<"bar", number[], string> = {
          type: "bar",
          data: {
            labels: sorted.map((record) => record.role),
            datasets: [
              {
                label: "Average annual salary",
                data: sorted.map((record) => record.mean),
                backgroundColor: colors.map((color) => hexToRgba(color, 0.82)),
                borderColor: colors,
                borderWidth: 1.5,
                borderRadius: 8
              }
            ]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            indexAxis: "y",
            animation: {
              duration: 850,
              delay(context) {
                return context.type === "data" ? context.dataIndex * 70 : 0;
              }
            },
            plugins: {
              legend: {
                display: false
              },
              tooltip: {
                callbacks: {
                  label(context) {
                    return `${context.label}: ${formatCurrency(context.parsed.x ?? 0)}`;
                  }
                }
              },
              datalabels: {
                anchor: "end",
                align: "right",
                color: "#111827",
                formatter(value: number) {
                  return formatCurrencyCompact(value);
                },
                font: {
                  weight: 700
                }
              }
            },
            scales: {
              x: {
                grid: {
                  color: "#E5E7EB"
                },
                ticks: {
                  callback(value) {
                    return formatCurrencyCompact(Number(value));
                  }
                }
              },
              y: {
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
        setStatus(error instanceof Error ? error.message : "Failed to render role chart.");
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
      currentPath="/608/Story4/roles"
      title="Role Descriptor Is The First Big Salary Split"
      subtitle="Data Architect and Data Scientist sit at the top of the ranking, while analyst roles trail by a wide margin."
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
            The salary spread is not subtle. Data Architect leads this set at roughly {formatCurrency(132800.5)},
            while Data Analyst is under {formatCurrency(80000)} on average.
          </p>
          <p className="mt-4 text-sm leading-6 text-gray-700">
            That gap suggests the term &ldquo;data practitioner&rdquo; hides several distinct labor markets.
            Role family matters before we even account for seniority or geography.
          </p>
        </aside>
      </div>
    </StoryShell>
  );
}
