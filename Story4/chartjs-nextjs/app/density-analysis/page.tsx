'use client';

import { useEffect, useRef, useState } from "react";
import {
  ScatterController,
  BubbleController,
  Chart as ChartJS,
  type ChartConfiguration,
  LinearScale,
  PointElement,
  Tooltip,
  Legend
} from "chart.js";

import StoryShell from "@/components/StoryShell";
import {
  formatCurrency,
  getLocationTypeColor,
  hexToRgba,
  loadJSON,
  type SalaryByRegionEnrichedRecord
} from "@/lib/salaryData";

ChartJS.register(ScatterController, BubbleController, LinearScale, PointElement, Tooltip, Legend);

export default function DensityAnalysisPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<ChartJS<"bubble"> | null>(null);
  const [status, setStatus] = useState("Loading data...");

  useEffect(() => {
    let active = true;

    async function renderChart() {
      try {
        const data = await loadJSON<SalaryByRegionEnrichedRecord[]>("/data/salary-by-region-enriched.json");
        if (!active || !canvasRef.current) return;

        // Filter out Remote since it has no density
        const regions = data.filter((r) => r.popDensity !== null);

        // Calculate simple linear relationship for trendline
        const xs = regions.map((r) => r.popDensity!);
        const ys = regions.map((r) => r.mean);
        const n = xs.length;

        const meanX = xs.reduce((a, b) => a + b) / n;
        const meanY = ys.reduce((a, b) => a + b) / n;
        const numerator = xs.reduce((sum, x, i) => sum + (x - meanX) * (ys[i] - meanY), 0);
        const denominator = xs.reduce((sum, x) => sum + (x - meanX) ** 2, 0);
        const slope = denominator !== 0 ? numerator / denominator : 0;
        const intercept = meanY - slope * meanX;

        const densityMin = Math.min(...xs);
        const densityMax = Math.max(...xs);
        const trendlineData = [
          { x: densityMin - 100, y: slope * (densityMin - 100) + intercept },
          { x: densityMax + 100, y: slope * (densityMax + 100) + intercept }
        ];

        const datasets = regions.map((region) => {
          const color = getLocationTypeColor(region.locationName);
          return {
            label: region.region,
            data: [
              {
                x: region.popDensity!,
                y: region.mean,
                r: Math.sqrt(region.count) * 2
              }
            ],
            backgroundColor: hexToRgba(color, 0.6),
            borderColor: color,
            borderWidth: 2
          };
        });

        // Add trendline
        datasets.push({
          label: "Trend",
          data: trendlineData,
          type: "line" as any,
          borderColor: "#9CA3AF",
          borderWidth: 2,
          borderDash: [5, 5],
          fill: false,
          pointRadius: 0,
          tension: 0
        } as any);

        const config: ChartConfiguration<"bubble"> = {
          type: "bubble",
          data: {
            datasets
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: {
              duration: 850
            },
            plugins: {
              legend: {
                position: "right" as const,
                labels: {
                  usePointStyle: true
                }
              },
              tooltip: {
                callbacks: {
                  title() {
                    return "";
                  },
                  label(context: any) {
                    const point = context.raw as any;
                    return `Density: ${point.x.toFixed(0)} people/sq mi | Avg Salary: ${formatCurrency(point.y)}`;
                  }
                }
              }
            },
            scales: {
              x: {
                type: "linear",
                title: {
                  display: true,
                  text: "Population Density (people per sq mi)"
                },
                min: 0,
                max: 900,
                ticks: {
                  callback(value: any) {
                    return String(value);
                  }
                }
              },
              y: {
                title: {
                  display: true,
                  text: "Average Salary ($)"
                },
                min: 90000,
                max: 140000,
                ticks: {
                  callback(value: any) {
                    return formatCurrency(Number(value));
                  }
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
      currentPath="/density-analysis"
      title="Population Density Impact on Salary"
      subtitle="Does higher density correlate with higher compensation?"
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
          <div className="rounded-lg bg-blue-50 p-4">
            <h3 className="font-semibold text-blue-900">Interpretation</h3>
            <p className="mt-2 text-sm text-blue-800">
              <strong>X-axis (Population Density):</strong> People per square mile. Higher = more urban.
              <br />
              <strong>Y-axis (Average Salary):</strong> Nominal annual compensation.
              <br />
              <strong>Bubble size:</strong> Represents sample size (larger = more workers).
            </p>
          </div>

          <div className="rounded-lg bg-purple-50 p-4">
            <h3 className="font-semibold text-purple-900">Key Finding</h3>
            <p className="mt-2 text-sm text-purple-800">
              <strong>Strong positive correlation:</strong> Higher density regions command higher salaries. 
              The Northeast ({formatCurrency(128450)} at 815 people/sq mi) outpaces the Midwest ({formatCurrency(105300)} at 102 people/sq mi) 
              by {formatCurrency(23150)}, roughly proportional to the 8x density difference. However, this reflects 
              both infrastructure cost premiums <em>and</em> concentration of tech hubs in dense regions.
            </p>
          </div>

          <div className="rounded-lg bg-green-50 p-4">
            <h3 className="font-semibold text-green-900">Real Purchasing Power Note</h3>
            <p className="mt-2 text-sm text-green-800">
              While density strongly predicts salary, it doesn't predict <em>real wealth</em>. A {formatCurrency(105300)} 
              salary in the low-density Midwest (COLA 92) may provide more disposable income than {formatCurrency(128450)} 
              in the Northeast (COLA 114). The interaction of both factors determines actual purchasing power.
            </p>
          </div>

          <p className="text-xs text-gray-600">
            Remote workers are excluded from this analysis. The next slide summarizes findings 
            and connects salary variation back to the original assignment focus.
          </p>
        </div>
      </div>
    </StoryShell>
  );
}
