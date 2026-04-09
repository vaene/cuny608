'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import {
  Chart as ChartJS,
  BarController,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  TooltipItem,
  ChartConfiguration
} from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';

ChartJS.register(BarController, BarElement, CategoryScale, LinearScale, Tooltip, Legend, ChartDataLabels);

const COLORS = {
  Biden: '#2166AC',
  Trump: '#B2182B',
  Unknown: '#777777'
};

const ANIM = {
  barDurationMs: 850,
  perBarStaggerMs: 35,
  labelLagMs: 120
};

interface SpendingData {
  stateOrder: string[];
  preByState: Map<string, number>;
  bidenByState: Map<string, number>;
  winnerMap: Record<string, string>;
}

function hexToRgba(hex: string, alpha: number): string {
  const h = hex.replace('#', '').trim();
  const bigint = parseInt(h, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgba(${r},${g},${b},${alpha})`;
}

function formatMoneyCompact(v: number): string {
  if (v === null || v === undefined || Number.isNaN(v)) return '';
  const abs = Math.abs(v);
  if (abs >= 1e12) return `$${(v / 1e12).toFixed(2)}T`;
  if (abs >= 1e9) return `$${(v / 1e9).toFixed(1)}B`;
  if (abs >= 1e6) return `$${(v / 1e6).toFixed(0)}M`;
  return `$${Math.round(v).toLocaleString()}`;
}

async function loadJSON(path: string) {
  const res = await fetch(path);
  if (!res.ok) throw new Error(`Failed to load ${path}: ${res.status}`);
  return res.json();
}

async function usaspendingPost(endpoint: string, body: object) {
  const res = await fetch(`https://api.usaspending.gov${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  if (!res.ok) {
    const txt = await res.text().catch(() => '');
    throw new Error(`USAspending error ${res.status}: ${txt.slice(0, 200)}`);
  }
  return res.json();
}

const OBLIG_CACHE = new Map<number, Map<string, number>>();
const CACHE_TTL_MS = 1000 * 60 * 60 * 24;
const cacheKey = (fy: number) => `usaspending_oblig_${fy}`;

function loadCachedObligations(fy: number): Map<string, number> | null {
  const mem = OBLIG_CACHE.get(fy);
  if (mem) return mem;
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(cacheKey(fy));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { ts: number; data: [string, number][] };
    if (!parsed || Date.now() - parsed.ts > CACHE_TTL_MS) return null;
    const map = new Map<string, number>(parsed.data);
    OBLIG_CACHE.set(fy, map);
    return map;
  } catch {
    return null;
  }
}

function saveCachedObligations(fy: number, map: Map<string, number>) {
  OBLIG_CACHE.set(fy, map);
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(cacheKey(fy), JSON.stringify({ ts: Date.now(), data: Array.from(map.entries()) }));
  } catch {
    // ignore storage errors
  }
}

async function getStateObligations(fy: number): Promise<Map<string, number>> {
  const cached = loadCachedObligations(fy);
  if (cached) return cached;

  const body = {
    scope: 'place_of_performance',
    geo_layer: 'state',
    filters: {
      time_period: [{
        start_date: `${fy - 1}-10-01`,
        end_date: `${fy}-09-30`
      }]
    }
  };

  const out = await usaspendingPost('/api/v2/search/spending_by_geography/', body);
  const results = out.results || [];
  const map = new Map();
  for (const r of results) {
    const st = String(r.shape_code || '').toUpperCase();
    const amt = Number(r.aggregated_amount ?? 0);
    map.set(st, amt);
  }
  saveCachedObligations(fy, map);
  return map;
}

type ChartWithAnim = ChartJS & { $_animStart?: number; $_completedFlatIndex?: number };

const labelsAfterBars = {
  id: 'labelsAfterBars',
  beforeDatasetsDraw(chart: ChartWithAnim) {
    const meta0 = chart.getDatasetMeta(0);
    if (!meta0?.data?.length) return;

    const now = performance.now();
    if (!chart.$_animStart) chart.$_animStart = now;
    const t = now - chart.$_animStart;

    const perBarWindow = ANIM.barDurationMs + ANIM.perBarStaggerMs;
    const completed = Math.floor((t - ANIM.labelLagMs) / perBarWindow);
    chart.$_completedFlatIndex = completed;
  }
};

function labelDisplay(ctx: { chart: ChartWithAnim; dataIndex: number; datasetIndex: number }) {
  const chart = ctx.chart;
  const flat = ctx.dataIndex * 2 + ctx.datasetIndex;
  const completed = chart.$_completedFlatIndex ?? -1;
  return flat <= completed;
}

function animationDelay(ctx: { type?: string; dataIndex: number; datasetIndex: number }) {
  if (ctx.type !== 'data') return 0;
  const flat = ctx.dataIndex * 2 + ctx.datasetIndex;
  return flat * ANIM.perBarStaggerMs;
}

export default function Home() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<ChartJS | null>(null);
  const pendingTimeouts = useRef<number[]>([]);
  const preMapRef = useRef<Map<string, number>>(new Map());
  const bidenMapRef = useRef<Map<string, number>>(new Map());
  const orderByPreRef = useRef<string[]>([]);
  const orderByBidenRef = useRef<string[]>([]);
  const [status, setStatus] = useState('Loading USAspending data…');
  const [loading, setLoading] = useState(true);
  const stages = [
    'A better comparison is total federal obligations: average 2017–2020 versus average 2021–2024.',
    'We see similar patterns by state, which lets us test whether any bias is evident.',
    'Now the 2021–2024 average grows in under the 2017–2020 baseline.'
  ];
  const [stageIndex, setStageIndex] = useState(0);
  const [displayedWords, setDisplayedWords] = useState(0);
  const words = stages[stageIndex].split(' ');
  const chartDescription =
    'Why it matters: totals provide scale but can hide per-person differences, so this chart sets the baseline for later per-capita and delta views.';
  const sources =
    'USAspending.gov API (FY2017–FY2024), state list, 2020 presidential winner map.';
  const methods =
    'Compute FY2017–FY2020 average and FY2021–FY2024 average; order by totals; color by 2020 winner.';

  function setChartData(
    labels: string[],
    pre: number[],
    biden: number[],
    preHidden: boolean,
    bidenHidden: boolean,
    animate = true
  ) {
    if (!chartRef.current) return;
    chartRef.current.data.labels = labels;
    if (chartRef.current.data.datasets[0]) {
      chartRef.current.data.datasets[0].data = pre;
      chartRef.current.data.datasets[0].hidden = preHidden;
    }
    if (chartRef.current.data.datasets[1]) {
      chartRef.current.data.datasets[1].data = biden;
      chartRef.current.data.datasets[1].hidden = bidenHidden;
    }
    chartRef.current.update(animate ? undefined : 'none');
  }

  function clearPendingTimeouts() {
    pendingTimeouts.current.forEach((t) => clearTimeout(t));
    pendingTimeouts.current = [];
  }

  useEffect(() => {
    async function main() {
      try {
        setStatus('Loading winner map…');
        const [states, winnerMap] = await Promise.all([
          loadJSON('/data/states_50.json'),
          loadJSON('/data/winner_2020.json')
        ]);

        setStatus('Fetching USAspending FY2017–FY2024…');
        const preYears = [2017, 2018, 2019, 2020];
        const bidenYears = [2021, 2022, 2023, 2024];
        const allYears = [...preYears, ...bidenYears];
        const yearMaps = new Map<number, Map<string, number>>();
        for (let i = 0; i < allYears.length; i++) {
          const fy = allYears[i];
          setStatus(`Fetching FY${fy} (${i + 1}/${allYears.length})…`);
          yearMaps.set(fy, await getStateObligations(fy));
        }

        const preByState = new Map();
        for (const st of states) {
          const vals = preYears.map((yr) => yearMaps.get(yr)?.get(st) ?? 0);
          preByState.set(st, vals.reduce((s, v) => s + v, 0) / vals.length);
        }

        const bidenByState = new Map();
        for (const st of states) {
          const vals = bidenYears.map((yr) => yearMaps.get(yr)?.get(st) ?? 0);
          bidenByState.set(st, vals.reduce((s, v) => s + v, 0) / vals.length);
        }

        const stateOrder = [...states].sort(
          (a, b) => (bidenByState.get(b) ?? 0) - (bidenByState.get(a) ?? 0)
        );

        buildChart({ stateOrder, preByState, bidenByState, winnerMap });
        setStatus('');
        setLoading(false);
      } catch (err) {
        console.error(err);
        setStatus(`Failed to load data: ${err instanceof Error ? err.message : 'Unknown error'}`);
      }
    }

    function buildChart({ stateOrder, preByState, bidenByState, winnerMap }: SpendingData) {
      if (!canvasRef.current) return;

      if (chartRef.current) {
        chartRef.current.destroy();
      }

      preMapRef.current = new Map(preByState);
      bidenMapRef.current = new Map(bidenByState);
      orderByBidenRef.current = [...stateOrder];
      orderByPreRef.current = [...stateOrder].sort(
        (a, b) => (preByState.get(b) ?? 0) - (preByState.get(a) ?? 0)
      );

      const labels = stateOrder;
      const pre = labels.map((st) => preByState.get(st) ?? 0);
      const biden = labels.map((st) => bidenByState.get(st) ?? 0);

      const preColors = labels.map((st) =>
        hexToRgba(COLORS[(winnerMap[st] ?? 'Unknown') as keyof typeof COLORS] ?? COLORS.Unknown, 0.4)
      );
      const bidenColors = labels.map((st) =>
        hexToRgba(COLORS[(winnerMap[st] ?? 'Unknown') as keyof typeof COLORS] ?? COLORS.Unknown, 0.7)
      );

      const config: ChartConfiguration<'bar', number[], string> = {
        type: 'bar',
        data: {
          labels,
          datasets: [
            {
              label: 'FY2017–FY2020 avg',
              data: pre,
              backgroundColor: preColors,
              borderWidth: 0,
              barPercentage: 0.9,
              categoryPercentage: 0.82
            },
            {
              label: 'FY2021–FY2024 avg',
              data: biden,
              backgroundColor: bidenColors,
              borderWidth: 0,
              barPercentage: 0.9,
              categoryPercentage: 0.82
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          devicePixelRatio: window.devicePixelRatio || 1,
          indexAxis: 'y' as const,
          layout: { padding: { left: 6, right: 12, top: 8, bottom: 6 } },
          animation: {
            duration: ANIM.barDurationMs,
            easing: 'easeOutQuart',
            delay: animationDelay
          },
          plugins: {
            legend: { display: false },
            tooltip: {
              callbacks: {
                title: (items: TooltipItem<'bar'>[]) => items?.[0]?.label ?? '',
                label: (c: TooltipItem<'bar'>) => `${c.dataset.label}: ${formatMoneyCompact(c.raw as number)}`
              }
            },
            datalabels: {
              display: labelDisplay,
              anchor: 'end',
              align: 'right',
              color: '#111',
              font: { size: 8, weight: 600 },
              formatter: (v: number) => formatMoneyCompact(v),
              clamp: true
            }
          },
          scales: {
            x: {
              display: false,
              grid: { display: false },
              border: { display: false },
              offset: false,
              stacked: false
            },
            y: {
              grid: { display: false },
              border: { display: false },
              offset: true,
              ticks: {
                color: '#111',
                font: { size: 8, weight: 700 },
                padding: 4
              }
            }
          }
        },
        plugins: [labelsAfterBars]
      };

      chartRef.current = new ChartJS(canvasRef.current, config);
    }

    main();
  }, []);

  useEffect(() => {
    if (loading) return;
    setDisplayedWords(0);
    let wordIndex = 0;
    const wordInterval = setInterval(() => {
      wordIndex++;
      setDisplayedWords(wordIndex);
      if (wordIndex >= words.length) {
        clearInterval(wordInterval);
      }
    }, 60);
    return () => clearInterval(wordInterval);
  }, [loading, words.length, stageIndex]);

  useEffect(() => {
    if (loading || !chartRef.current) return;
    clearPendingTimeouts();
    const preByState = preMapRef.current;
    const bidenByState = bidenMapRef.current;
    const orderByPre = orderByPreRef.current;
    const orderByBiden = orderByBidenRef.current;

    if (stageIndex === 0) {
      const biden = orderByBiden.map((st) => bidenByState.get(st) ?? 0);
      const preZeros = orderByBiden.map(() => 0);
      setChartData(orderByBiden, preZeros, biden, true, false, true);
      return;
    }

    if (stageIndex === 1) {
      const zeros = orderByBiden.map(() => 0);
      setChartData(orderByBiden, zeros, zeros, true, true, true);
      const t1 = window.setTimeout(() => {
        const pre = orderByPre.map((st) => preByState.get(st) ?? 0);
        const bidenZeros = orderByPre.map(() => 0);
        setChartData(orderByPre, pre, bidenZeros, false, true, true);
      }, ANIM.barDurationMs + 150);
      pendingTimeouts.current.push(t1);
      return;
    }

    if (stageIndex >= 2) {
      const pre = orderByPre.map((st) => preByState.get(st) ?? 0);
      const biden = orderByPre.map((st) => bidenByState.get(st) ?? 0);
      setChartData(orderByPre, pre, biden, false, false, true);
    }
  }, [loading, stageIndex]);

  return (
    <main className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="mx-auto max-w-6xl rounded-lg bg-white p-5 pb-16 shadow flex flex-col h-screen">
        <div className="mb-4">
          <h1 className="text-xl font-bold text-gray-900">
            Federal Obligations by State: FY2021–FY2024 vs FY2017–FY2020
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Average FY2017–FY2020 versus average FY2021–FY2024, colored by 2020 presidential winner
          </p>
</div>
        <div className="mb-4">
          <div className="text-sm text-gray-600">{status}</div>
        </div>
        <div className="relative flex-1 pb-4">
          <canvas ref={canvasRef} id="barTotal" className="w-full h-full"></canvas>
          {!loading && (
            <div className="absolute top-1/3 right-4 md:right-8 w-72 md:w-80 h-auto z-10 bg-white rounded-lg p-4 shadow-md md:shadow-lg">
              <p className="text-sm leading-relaxed text-gray-700 whitespace-normal break-normal">
                {words.slice(0, displayedWords).map((word, idx) => (
                  <span key={idx} className="inline animate-fadeIn">
                    {word}{' '}
                  </span>
                ))}
                {displayedWords < words.length && (
                  <span className="inline-block h-4 w-0.5 ml-1 bg-blue-500 animate-pulse"></span>
                )}
              </p>
            </div>
          )}
          {stageIndex > 0 ? (
            <button
              type="button"
              onClick={() => setStageIndex((s) => Math.max(s - 1, 0))}
              className="fixed left-4 md:left-8 top-1/2 -translate-y-1/2 z-20 text-gray-400 text-base transition duration-150 ease-out hover:text-gray-900 hover:scale-125"
              aria-label="Previous text"
            >
              <span className="inline-block">‹</span>
            </button>
          ) : (
            <Link
              href="/question"
              className="fixed left-4 md:left-8 top-1/2 -translate-y-1/2 z-20 text-gray-400 text-base transition duration-150 ease-out hover:text-gray-900 hover:scale-125"
              aria-label="Go to question page"
            >
              <span className="inline-block">‹</span>
            </Link>
          )}
          {stageIndex < stages.length - 1 ? (
            <button
              type="button"
              onClick={() => setStageIndex((s) => Math.min(s + 1, stages.length - 1))}
              className="fixed right-4 md:right-8 top-1/2 -translate-y-1/2 z-20 text-gray-400 text-base transition duration-150 ease-out hover:text-gray-900 hover:scale-125"
              aria-label="Advance text"
            >
              <span className="inline-block">›</span>
            </button>
          ) : (
            <Link
              href="/per-capita"
              className="fixed right-4 md:right-8 top-1/2 -translate-y-1/2 z-20 text-gray-400 text-base transition duration-150 ease-out hover:text-gray-900 hover:scale-125"
              aria-label="Go to per capita chart"
            >
              <span className="inline-block">›</span>
            </Link>
          )}
          <div className="fixed bottom-2 left-1/2 -translate-x-1/2 z-20 flex items-center gap-3 rounded-full border border-gray-200 bg-white/65 px-4 py-1 text-xs text-gray-600 shadow-md backdrop-blur scale-75 origin-bottom">
            <span className="font-semibold text-gray-900"> 3 / 11 </span>
            <div className="flex items-center gap-2">
              <Link href="/intro" aria-label="Go to page 1">
                <span className="block h-2 w-2 rounded-full bg-gray-300 hover:bg-gray-400"></span>
              </Link>
              <Link href="/question" aria-label="Go to page 2">
                <span className="block h-2 w-2 rounded-full bg-gray-300 hover:bg-gray-400"></span>
              </Link>
              <Link href="/totals" aria-label="Go to page 3">
                <span className="block h-2 w-2 rounded-full bg-gray-900"></span>
              </Link>
              <Link href="/per-capita" aria-label="Go to page 4">
                <span className="block h-2 w-2 rounded-full bg-gray-300 hover:bg-gray-400"></span>
              </Link>
              <Link href="/party-diff" aria-label="Go to page 5">
                <span className="block h-2 w-2 rounded-full bg-gray-300 hover:bg-gray-400"></span>
              </Link>
              <Link href="/binned" aria-label="Go to page 6">
                <span className="block h-2 w-2 rounded-full bg-gray-300 hover:bg-gray-400"></span>
              </Link>
              <Link href="/scatter-pres" aria-label="Go to page 7">
                <span className="block h-2 w-2 rounded-full bg-gray-300 hover:bg-gray-400"></span>
              </Link>
              <Link href="/scatter-house" aria-label="Go to page 8">
                <span className="block h-2 w-2 rounded-full bg-gray-300 hover:bg-gray-400"></span>
              </Link>
              <Link href="/residuals" aria-label="Go to page 9">
                <span className="block h-2 w-2 rounded-full bg-gray-300 hover:bg-gray-400"></span>
              </Link>
              <Link href="/delta-biden" aria-label="Go to page 10">
                <span className="block h-2 w-2 rounded-full bg-gray-300 hover:bg-gray-400"></span>
              </Link>
              <Link href="/sources" aria-label="Go to page 11">
                <span className="block h-2 w-2 rounded-full bg-gray-300 hover:bg-gray-400"></span>
              </Link>
            </div>
          </div>
        </div>
        <details className="mt-3 rounded-lg border border-gray-100 bg-gray-50 px-4 py-3 text-sm text-gray-700">
          <summary className="cursor-pointer font-semibold text-gray-900">
            Chart context, sources, and methods
          </summary>
          <div className="mt-2">{chartDescription}</div>
          <div className="mt-2 text-xs text-gray-600">Sources: {sources}</div>
          <div className="mt-1 text-xs text-gray-600">Methods: {methods}</div>
        </details>
      </div>
    </main>
  );
}
