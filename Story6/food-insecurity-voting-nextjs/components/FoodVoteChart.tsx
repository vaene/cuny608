'use client';

import { useEffect, useRef } from "react";
import {
  ArcElement,
  BarController,
  BarElement,
  CategoryScale,
  Chart,
  DoughnutController,
  LinearScale,
  LineController,
  LineElement,
  PointElement,
  PieController,
  ScatterController,
  Tooltip,
  Legend,
  type ChartConfiguration
} from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";

Chart.register(
  ArcElement,
  BarController,
  BarElement,
  CategoryScale,
  DoughnutController,
  LinearScale,
  LineController,
  LineElement,
  PointElement,
  PieController,
  ScatterController,
  Tooltip,
  Legend,
  ChartDataLabels
);

export default function FoodVoteChart({ config }: { config: ChartConfiguration }) {
  const ref = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!ref.current) return;
    const chart = new Chart(ref.current, config);
    return () => chart.destroy();
  }, [config]);

  return <canvas ref={ref} />;
}
