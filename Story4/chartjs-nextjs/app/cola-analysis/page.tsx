'use client';

import { useEffect, useRef, useState } from "react";
import {
  ScatterController,
  BubbleController,
  Chart as ChartJS,
  type ChartConfigurationCustomTypesPerDataset,
  type ChartDataset,
  type BubbleDataPoint,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
  LineController,
  LineElement,
  type Point,
  type TooltipItem
} from "chart.js";

import StoryShell from "@/components/StoryShell";
import {
  formatCurrency,
  getLocationTypeColor,
  hexToRgba,
  loadJSON,
  type SalaryByRegionEnrichedRecord
} from "@/lib/salaryData";

ChartJS.register(
  ScatterController,
  BubbleController,
  LineController,
  LineElement,
  LinearScale,
  PointElement,
  Tooltip,
  Legend
);

export default function ColaAnalysisPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<ChartJS | null>(null);
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
        const maxBubbleRadius = Math.max(...regions.map((region) => Math.sqrt(region.count) * 2));
        const xPadding = Math.max(8, Math.ceil(maxBubbleRadius / 4));
        const trendlineData = [
          { x: colaMin - xPadding, y: slope * (colaMin - xPadding) + intercept },
          { x: colaMax + xPadding, y: slope * (colaMax + xPadding) + intercept }
        ];

        const bubbleDatasets: ChartDataset<"bubble", BubbleDataPoint[]>[] = regions.map((region) => {
          const color = getLocationTypeColor(region.locationName);
          return {
            type: "bubble",
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
            borderWidth: 2,
            clip: false
          };
        });

        const trendlineDataset: ChartDataset<"line", Point[]> = {
          label: "Trend",
          data: trendlineData,
          type: "line",
          borderColor: "#9CA3AF",
          borderWidth: 2,
          borderDash: [5, 5],
          fill: false,
          pointRadius: 0,
          tension: 0
        };

        const config: ChartConfigurationCustomTypesPerDataset = {
          data: {
            datasets: [...bubbleDatasets, trendlineDataset]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: {
              duration: 850
            },
            layout: {
              padding: {
                top: 36,
                right: 40,
                bottom: 36,
                left: 28
              }
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
                  label(context: TooltipItem<"bubble" | "line">) {
                    const point = context.raw as BubbleDataPoint;
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
                min: Math.floor(colaMin - xPadding),
                max: Math.ceil(colaMax + xPadding),
                offset: true,
                grace: "10%",
                ticks: {
                  callback(value: string | number) {
                    return String(value);
                  }
                }
              },
              y: {
                title: {
                  display: true,
                  text: "Average Salary ($)"
                },
                min: 75000,
                max: 160000,
                offset: true,
                grace: 0,
                ticks: {
                  callback(value: string | number) {
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

        if (canvasRef.current) {
          chartRef.current = new ChartJS(canvasRef.current, config);
        }
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
        <section className="mb-8 rounded-2xl border border-blue-200 bg-blue-50 p-6">
          <div className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-800">
            Focus
          </div>
          <p className="mt-2 text-sm leading-6 text-blue-900">
            This slide tests one half of the claim directly. If salary
            differences are mainly driven by COLA and density, then this chart should show that
            <strong> COLA alone explains a meaningful share </strong>
            of the geographic salary pattern.
          </p>
        </section>

        <div className="relative flex-none" style={{ height: "32rem" }}>
          {status && (
            <div className="flex items-center justify-center text-sm text-gray-500">
              {status}
            </div>
          )}
          <canvas ref={canvasRef} className="h-full w-full" />
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
              <br />
              <strong>Bubbles near the line:</strong> When a region sits close to the trend line, its salary is close
              to what COLA alone would predict. That means COLA is a strong and fairly consistent explanation for
              salary differences on this slide.
            </p>
          </div>

          <div className="rounded-lg bg-amber-50 p-4">
            <h3 className="font-semibold text-amber-900">Key Finding</h3>
            <p className="mt-2 text-sm text-amber-800">
              Salaries <strong>do increase</strong> with COLA, but not proportionally. A 15-point COLA 
              increase (92→107, Midwest to Northeast) corresponds to roughly a +{formatCurrency(22500)} 
              salary increase. This is significant but incomplete—real purchasing power remains compressed 
              in high-COLA regions due to housing and living cost premiums. In the story focus, this slide
              shows that COLA explains an important share of salary differences, but not the whole pattern by itself.
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
