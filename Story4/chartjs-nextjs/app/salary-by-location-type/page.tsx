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
  getLocationTypeColor,
  hexToRgba,
  loadJSON,
  type SalaryByRegionEnrichedRecord
} from "@/lib/salaryData";

ChartJS.register(BarController, BarElement, CategoryScale, LinearScale, Tooltip, ChartDataLabels);

export default function SalaryByLocationTypePage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<ChartJS<"bar"> | null>(null);
  const [status, setStatus] = useState("Loading data...");

  useEffect(() => {
    let active = true;

    async function renderChart() {
      try {
        const data = await loadJSON<SalaryByRegionEnrichedRecord[]>("/data/salary-by-region-enriched.json");
        if (!active || !canvasRef.current) return;

        // Sort by mean salary (descending) except Remote goes at end
        const sorted = [...data].sort((a, b) => {
          if (a.region === "Remote") return 1;
          if (b.region === "Remote") return -1;
          return b.mean - a.mean;
        });

        const colors = sorted.map((record) => getLocationTypeColor(record.locationName));

        const config: ChartConfiguration<"bar", number[], string> = {
          type: "bar",
          data: {
            labels: sorted.map((record) => {
              const density = record.popDensity ? `${record.popDensity}/sq mi` : "N/A";
              const cola = record.cola ? `${record.cola}` : "N/A";
              return `${record.locationName}\n${density} | COLA ${cola}`;
            }),
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
                  title(context: any) {
                    return context[0]?.label?.split("\n")[0] || "";
                  },
                  label(context: any) {
                    const record = sorted[context.dataIndex];
                    return `Average: ${formatCurrency(context.parsed.x)}`;
                  },
                  afterLabel(context: any) {
                    const record = sorted[context.dataIndex];
                    if (record.popDensity !== null && record.cola !== null) {
                      return `Density: ${record.popDensity}/sq mi | COLA: ${record.cola}`;
                    }
                    return "Remote - no geography";
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
                  callback(value: any) {
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

        if (chartRef.current) {
          chartRef.current.destroy();
        }

        chartRef.current = new ChartJS(canvasRef.current, config);
        setStatus("");
      } catch (error) {
        console.error("Error rendering chart:", error);
        setStatus(`Error: ${error instanceof Error ? error.message : "Unknown error"}`);
      }
    }

    renderChart();

    return () => {
      active = false;
      if (chartRef.current) {
        chartRef.current.destroy();
      }
    };
  }, []);

  return (
    <StoryShell
      currentPath="/salary-by-location-type"
      title="Average Salary by Location Type"
      subtitle="High-COLA vs. Low-COLA regions reveal the geographic premium"
    >
      <div className="flex h-full flex-col">
        <div className="relative flex-1">
          {status && (
            <div className="flex items-center justify-center text-sm text-gray-500">
              {status}
            </div>
          )}
          <canvas ref={canvasRef} />
        </div>

        <div className="mt-8 space-y-4 border-t border-gray-200 pt-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-lg bg-red-50 p-4">
              <h3 className="font-semibold text-red-900">Urban High-COLA</h3>
              <p className="mt-1 text-sm text-red-800">
                Northeast & West Coast: Highest nominal pay ({formatCurrency(135200)}) 
                but constrained purchasing power due to extreme housing costs.
              </p>
            </div>

            <div className="rounded-lg bg-green-50 p-4">
              <h3 className="font-semibold text-green-900">Rural & Distributed Low-COLA</h3>
              <p className="mt-1 text-sm text-green-800">
                Southeast & Midwest: Lower nominal pay ({formatCurrency(98900)}–{formatCurrency(105300)}) 
                but superior real purchasing power given low COLA.
              </p>
            </div>

            <div className="rounded-lg bg-amber-50 p-4">
              <h3 className="font-semibold text-amber-900">Suburban Medium</h3>
              <p className="mt-1 text-sm text-amber-800">
                Southwest: Middle ground ({formatCurrency(112600)}), growing tech markets 
                with balanced costs.
              </p>
            </div>

            <div className="rounded-lg bg-slate-50 p-4">
              <h3 className="font-semibold text-slate-900">Remote</h3>
              <p className="mt-1 text-sm text-slate-800">
                {formatCurrency(118500)}: Premium compensation driven by access to national 
                labor markets, not local COLA anchoring.
              </p>
            </div>
          </div>

          <p className="text-sm text-gray-600">
            <strong>Key insight:</strong> Nominal salary differences don't tell the full story. 
            Real purchasing power depends on COLA. Someone earning {formatCurrency(135200)} in the 
            Northeast may have less disposable income than someone earning {formatCurrency(105300)} 
            in the Midwest.
          </p>
        </div>
      </div>
    </StoryShell>
  );
}
