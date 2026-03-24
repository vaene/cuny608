'use client';

import { useEffect, useRef, useState } from "react";
import {
  BarController,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  type ChartConfiguration,
  type Plugin,
  LinearScale,
  Tooltip,
  type TooltipItem
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

type FloatingBarValue = [number, number];

const remoteBaselinePlugin: Plugin<"bar"> = {
  id: "remoteBaseline",
  afterDatasetsDraw(chart) {
    const xScale = chart.scales.x;
    if (!xScale) return;

    const x = xScale.getPixelForValue(118500.2);
    const { top, bottom } = chart.chartArea;
    const ctx = chart.ctx;

    ctx.save();
    ctx.strokeStyle = "#475569";
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 6]);
    ctx.beginPath();
    ctx.moveTo(x, top);
    ctx.lineTo(x, bottom);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = "#334155";
    ctx.font = "600 12px Arial";
    ctx.textAlign = "left";
    ctx.textBaseline = "bottom";
    ctx.fillText("Remote average", x + 8, top - 6);
    ctx.restore();
  }
};

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

        const remote = data.find((record) => record.region === "Remote");
        if (!remote) {
          throw new Error("Remote baseline not found in salary-by-region-enriched.json");
        }

        const comparisonRegions = data
          .filter((record) => record.region !== "Remote")
          .map((record) => ({
            ...record,
            deltaFromRemote: record.mean - remote.mean
          }))
          .sort((a, b) => b.deltaFromRemote - a.deltaFromRemote);

        const labels = comparisonRegions.map((record) => `${record.region} - ${record.locationName}`);
        const floatingBars: FloatingBarValue[] = comparisonRegions.map((record) => [remote.mean, record.mean]);
        const barColors = comparisonRegions.map((record) => {
          const baseColor = getLocationTypeColor(record.locationName);
          return hexToRgba(baseColor, 0.82);
        });
        const borderColors = comparisonRegions.map((record) => getLocationTypeColor(record.locationName));

        const config: ChartConfiguration<"bar", FloatingBarValue[], string> = {
          type: "bar",
          data: {
            labels,
            datasets: [
              {
                label: "Difference from remote average",
                data: floatingBars,
                backgroundColor: barColors,
                borderColor: borderColors,
                borderWidth: 1.5,
                borderRadius: 10,
                borderSkipped: false
              }
            ]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            indexAxis: "y",
            animation: {
              duration: 900,
              delay(context) {
                return context.type === "data" ? context.dataIndex * 80 : 0;
              }
            },
            layout: {
              padding: {
                top: 24,
                right: 28,
                bottom: 8,
                left: 8
              }
            },
            plugins: {
              legend: {
                display: false
              },
              tooltip: {
                callbacks: {
                  title(context: TooltipItem<"bar">[]) {
                    return context[0]?.label ?? "";
                  },
                  label(context: TooltipItem<"bar">) {
                    const record = comparisonRegions[context.dataIndex];
                    const direction = record.deltaFromRemote >= 0 ? "above" : "below";
                    return `${record.region}: ${formatCurrency(record.mean)} (${formatCurrency(Math.abs(record.deltaFromRemote))} ${direction} remote)`;
                  },
                  afterLabel(context: TooltipItem<"bar">) {
                    const record = comparisonRegions[context.dataIndex];
                    return `Density: ${record.popDensity}/sq mi | COLA: ${record.cola}`;
                  }
                }
              },
              datalabels: {
                anchor(context) {
                  const record = comparisonRegions[context.dataIndex];
                  return record.deltaFromRemote >= 0 ? "end" : "start";
                },
                align(context) {
                  const record = comparisonRegions[context.dataIndex];
                  return record.deltaFromRemote >= 0 ? "right" : "left";
                },
                clamp: true,
                color: "#111827",
                formatter(_value: unknown, context) {
                  const record = comparisonRegions[context.dataIndex];
                  const sign = record.deltaFromRemote >= 0 ? "+" : "-";
                  return `${sign}${formatCurrencyCompact(Math.abs(record.deltaFromRemote))}`;
                },
                font: {
                  weight: 700
                }
              }
            },
            scales: {
              x: {
                min: 90000,
                max: 140000,
                grid: {
                  color: "#E5E7EB"
                },
                ticks: {
                  callback(value: string | number) {
                    return formatCurrencyCompact(Number(value));
                  }
                },
                title: {
                  display: true,
                  text: "Average salary with remote average as baseline"
                }
              },
              y: {
                grid: {
                  display: false
                }
              }
            }
          },
          plugins: [remoteBaselinePlugin]
        };

        chartRef.current?.destroy();
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
      chartRef.current?.destroy();
      chartRef.current = null;
    };
  }, []);

  return (
    <StoryShell
      currentPath="/salary-by-location-type"
      title="Average Salary by Location Type"
      subtitle="Remote is the baseline here, so each region group is shown by how far it falls above or below the remote average across the mapped job titles"
    >
      <div className="flex h-full flex-col">
        <section className="mb-8 rounded-2xl border border-blue-200 bg-blue-50 p-6">
          <div className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-800">
            Focus
          </div>
          <p className="mt-2 text-sm leading-6 text-blue-900">
            This slide uses the
            <strong> remote average salary </strong>
            as a reference point. It shows which region groups sit above that benchmark and which fall below it,
            making the geography story easier to compare after averaging across roles.
          </p>
        </section>

        <div className="relative flex-none rounded-2xl border border-gray-200 bg-white p-4" style={{ height: "32rem" }}>
          {status ? (
            <div className="flex h-full items-center justify-center text-sm text-gray-500">{status}</div>
          ) : null}
          <canvas ref={canvasRef} className={status ? "hidden" : "h-full w-full"} />
        </div>

        <div className="mt-8 space-y-4 border-t border-gray-200 pt-6">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-lg bg-red-50 p-4">
              <h3 className="font-semibold text-red-900">Urban High-COLA Regions</h3>
              <p className="mt-1 text-sm text-red-800">
                <strong>West</strong> and <strong>Northeast</strong> both belong to the Urban High-COLA group,
                but they are shown separately because they are different regional averages inside that same
                category. Both sit above the remote benchmark.
              </p>
            </div>

            <div className="rounded-lg bg-amber-50 p-4">
              <h3 className="font-semibold text-amber-900">Middle Tier</h3>
              <p className="mt-1 text-sm text-amber-800">
                Southwest sits closest to remote, suggesting that medium-COLA, medium-density markets can
                approach national rates without the largest coastal premium.
              </p>
            </div>

            <div className="rounded-lg bg-green-50 p-4">
              <h3 className="font-semibold text-green-900">Below Remote</h3>
              <p className="mt-1 text-sm text-green-800">
                Midwest and Southeast fall below the remote benchmark, showing how lower-COLA, lower-density
                regions trade lower nominal salaries for stronger purchasing power.
              </p>
            </div>
          </div>

          <p className="text-sm text-gray-600">
            <strong>Key insight:</strong> This chart is intentionally different from the role ranking and the
            later bubble charts. By centering the story on the remote average ({formatCurrency(118500)}), it
            becomes immediately clear which regional salary clusters pay a premium over national remote rates
            and which fall short. That makes the combined effect of COLA and density easier to read than a
            standard bar chart.
          </p>
        </div>
      </div>
    </StoryShell>
  );
}
