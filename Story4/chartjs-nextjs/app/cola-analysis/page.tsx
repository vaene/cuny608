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

export default function ColaAnalysisPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<ChartJS<"bubble"> | null>(null);
  const [status, setStatus] = useState("Loading data...");

  useEffect(() => {
    let active = true;

    async function renderChart() {
      try {
        const data = await loadJSON<SalaryByRegionEnrichedRecord[]>("/data/salary-by-region-enriched.json");
        if (!active || !canvasRef.current) return;

        // Filter out Remote since it has no COLA
        const regions = data.filter((r) => r.cola !== null);

        // Calculate simple linear relationship for trendline
        const xs = regions.map((r) => r.cola!);
        const ys = regions.map((r) => r.mean);
        const n = xs.length;

        const meanX = xs.reduce((a, b) => a + b) / n;
        const meanY = ys.reduce((a, b) => a + b) / n;
        const numerator = xs.reduce((sum, x, i) => sum + (x - meanX) * (ys[i] - meanY), 0);
        const denominator = xs.reduce((sum, x) => sum + (x - meanX) ** 2, 0);
        const slope = denominator !== 0 ? numerator / denominator : 0;
        const intercept = meanY - slope * meanX;

        const colaMin = Math.min(...xs);
        const colaMax = Math.max(...xs);
        const trendlineData = [
          { x: colaMin - 2, y: slope * (colaMin - 2) + intercept },
          { x: colaMax + 2, y: slope * (colaMax + 2) + intercept }
        ];

        const datasets = regions.map((region) => {
          const color = getLocationTypeColor(region.locationName);
          return {
            label: region.region,
            data: [
              {
                x: region.cola!,
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
                    return `COLA: ${point.x} | Avg Salary: ${formatCurrency(point.y)}`;
                  }
                }
              }
            },
            scales: {
              x: {
                type: "linear",
                title: {
                  display: true,
                  text: "Cost of Living Index (U.S. average = 100)"
                },
                min: 88,
                max: 118,
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
      currentPath="/cola-analysis"
      title="COLA Impact on Salary Levels"
      subtitle="Do higher cost-of-living regions command proportionally higher pay?"
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
              <strong>X-axis (COLA Index):</strong> U.S. average = 100. Higher values mean higher cost of living.
              <br />
              <strong>Y-axis (Average Salary):</strong> Nominal annual compensation.
              <br />
              <strong>Bubble size:</strong> Represents sample size (larger = more workers).
            </p>
          </div>

          <div className="rounded-lg bg-amber-50 p-4">
            <h3 className="font-semibold text-amber-900">Key Finding</h3>
            <p className="mt-2 text-sm text-amber-800">
              Salaries <strong>do increase</strong> with COLA, but not proportionally. A 15-point COLA 
              increase (92→107, Midwest to Northeast) corresponds to roughly a +{formatCurrency(22500)} 
              salary increase. This is significant but incomplete—real purchasing power remains compressed 
              in high-COLA regions due to housing and living cost premiums.
            </p>
          </div>

          <p className="text-xs text-gray-600">
            Remote workers are excluded from this analysis since they lack geographic COLA anchoring. 
            See the next slide for population density effects.
          </p>
        </div>
      </div>
    </StoryShell>
  );
}
