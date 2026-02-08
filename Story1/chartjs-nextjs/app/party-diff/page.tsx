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
  ChartConfiguration
} from 'chart.js';

ChartJS.register(BarController, BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const COLORS = {
  Biden: '#2166AC',
  Trump: '#B2182B',
  Unknown: '#777777'
};

const ANIM = {
  durationMs: 700
};

type ChartWithAnim = ChartJS & { $_stats?: GroupStats[] };

interface GroupStats {
  winner: string;
  mean: number;
  se: number;
  min: number;
  q1: number;
  median: number;
  q3: number;
  max: number;
}

async function loadJSON(path: string) {
  const res = await fetch(path);
  if (!res.ok) throw new Error(`Failed to load ${path}: ${res.status}`);
  return res.json();
}

async function loadText(path: string) {
  const res = await fetch(path);
  if (!res.ok) throw new Error(`Failed to load ${path}: ${res.status}`);
  return res.text();
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

function parsePopulationCSV(text: string): Map<string, number> {
  const map = new Map<string, number>();
  const lines = text.trim().split(/\r?\n/);
  for (let i = 1; i < lines.length; i++) {
    const [state, fy, pop] = lines[i].split(',');
    if (!state || !fy) continue;
    map.set(`${state}-${fy}`, Number(pop));
  }
  return map;
}

function formatDollars(v: number): string {
  if (v === null || v === undefined || Number.isNaN(v)) return '';
  const sign = v < 0 ? '-' : '';
  return `${sign}$${Math.abs(Math.round(v)).toLocaleString()}`;
}

function quantile(sorted: number[], q: number): number {
  if (!sorted.length) return 0;
  const pos = (sorted.length - 1) * q;
  const base = Math.floor(pos);
  const rest = pos - base;
  const next = sorted[base + 1] ?? sorted[base];
  return sorted[base] + rest * (next - sorted[base]);
}

function computeStats(values: number[]): { min: number; q1: number; median: number; q3: number; max: number } {
  const sorted = [...values].sort((a, b) => a - b);
  return {
    min: sorted[0] ?? 0,
    q1: quantile(sorted, 0.25),
    median: quantile(sorted, 0.5),
    q3: quantile(sorted, 0.75),
    max: sorted[sorted.length - 1] ?? 0
  };
}

const errorBarPlugin = {
  id: 'errorBars',
  afterDatasetsDraw(chart: ChartWithAnim) {
    const stats = chart.$_stats;
    if (!stats) return;
    const { ctx, scales } = chart;
    const x = scales.x;
    const y = scales.y;
    ctx.save();
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 1;
    stats.forEach((s, i) => {
      const xPos = x.getPixelForValue(i);
      const yLow = y.getPixelForValue(s.mean - 1.96 * s.se);
      const yHigh = y.getPixelForValue(s.mean + 1.96 * s.se);
      ctx.beginPath();
      ctx.moveTo(xPos, yLow);
      ctx.lineTo(xPos, yHigh);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(xPos - 6, yLow);
      ctx.lineTo(xPos + 6, yLow);
      ctx.moveTo(xPos - 6, yHigh);
      ctx.lineTo(xPos + 6, yHigh);
      ctx.stroke();
    });
    ctx.restore();
  }
};

const boxPlotPlugin = {
  id: 'boxPlot',
  afterDatasetsDraw(chart: ChartWithAnim) {
    const stats = chart.$_stats;
    if (!stats) return;
    const { ctx, scales } = chart;
    const x = scales.x;
    const y = scales.y;
    ctx.save();
    stats.forEach((s, i) => {
      const xPos = x.getPixelForValue(i);
      const boxWidth = 28;
      const yMin = y.getPixelForValue(s.min);
      const yQ1 = y.getPixelForValue(s.q1);
      const yMed = y.getPixelForValue(s.median);
      const yQ3 = y.getPixelForValue(s.q3);
      const yMax = y.getPixelForValue(s.max);

      // whiskers
      ctx.strokeStyle = '#555';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(xPos, yMin);
      ctx.lineTo(xPos, yQ1);
      ctx.moveTo(xPos, yQ3);
      ctx.lineTo(xPos, yMax);
      ctx.stroke();

      // box
      ctx.fillStyle = 'rgba(0,0,0,0.08)';
      ctx.strokeStyle = '#333';
      ctx.beginPath();
      ctx.rect(xPos - boxWidth / 2, yQ3, boxWidth, yQ1 - yQ3);
      ctx.fill();
      ctx.stroke();

      // median
      ctx.strokeStyle = '#111';
      ctx.beginPath();
      ctx.moveTo(xPos - boxWidth / 2, yMed);
      ctx.lineTo(xPos + boxWidth / 2, yMed);
      ctx.stroke();
    });
    ctx.restore();
  }
};

export default function PartyDiffPage() {
  const meanRef = useRef<HTMLCanvasElement>(null);
  const boxRef = useRef<HTMLCanvasElement>(null);
  const meanChart = useRef<ChartJS | null>(null);
  const boxChart = useRef<ChartJS | null>(null);
  const [status, setStatus] = useState('Loading data…');
  const [viewMode, setViewMode] = useState<'desc' | 'key'>('desc');
  const [displayedWords, setDisplayedWords] = useState(0);

  const chartDescription =
    'These charts compare spending deltas between 2020 Biden- and Trump-won states. The first chart shows mean differences with confidence intervals. The second shows the full distribution, highlighting overlap.';
  const keyObservations =
    'Key observations: Average deltas are close with overlapping uncertainty, and the distribution overlap is substantial. This supports the claim that 2020 outcomes did not systematically drive post-2020 spending changes.';
  const textToShow = viewMode === 'desc' ? chartDescription : keyObservations;
  const words = textToShow.split(' ');

  useEffect(() => {
    async function main() {
      try {
        setStatus('Loading population and winner data…');
        const [popText, states, winnerMap] = await Promise.all([
          loadText('/data/population_by_state_fy.csv'),
          loadJSON('/data/states_50.json'),
          loadJSON('/data/winner_2020.json')
        ]);

        const popMap = parsePopulationCSV(popText);
        const preYears = [2017, 2018, 2019, 2020];
        const bidenYears = [2021, 2022, 2023, 2024];
        const allYears = [...preYears, ...bidenYears];

        const yearMaps = new Map<number, Map<string, number>>();
        await Promise.all(
          allYears.map(async (fy) => {
            const m = await getStateObligations(fy);
            yearMaps.set(fy, m);
          })
        );

        const rows: { state: string; delta: number; winner: string }[] = [];
        for (const st of states) {
          const preAvg =
            preYears.reduce((s, fy) => {
              const pop = popMap.get(`${st}-${fy}`) ?? 0;
              const amt = yearMaps.get(fy)?.get(st) ?? 0;
              return s + (pop > 0 ? amt / pop : 0);
            }, 0) / preYears.length;

          const bidenAvg =
            bidenYears.reduce((s, fy) => {
              const pop = popMap.get(`${st}-${fy}`) ?? 0;
              const amt = yearMaps.get(fy)?.get(st) ?? 0;
              return s + (pop > 0 ? amt / pop : 0);
            }, 0) / bidenYears.length;

          const delta = bidenAvg - preAvg;
          const winner = (winnerMap[st] ?? 'Unknown') as string;
          if (Number.isFinite(delta)) rows.push({ state: st, delta, winner });
        }

        const groups = ['Biden', 'Trump'];
        const stats: GroupStats[] = groups.map((g) => {
          const vals = rows.filter((r) => r.winner === g).map((r) => r.delta);
          const mean = vals.reduce((a, b) => a + b, 0) / vals.length;
          const sd = Math.sqrt(vals.reduce((s, v) => s + (v - mean) ** 2, 0) / (vals.length - 1));
          const se = sd / Math.sqrt(vals.length);
          const dist = computeStats(vals);
          return { winner: g, mean, se, ...dist };
        });

        buildMeanChart(stats);
        buildBoxChart(stats);
        setStatus('');
      } catch (err) {
        console.error(err);
        setStatus(`Failed to load data: ${err instanceof Error ? err.message : 'Unknown error'}`);
      }
    }

    function buildMeanChart(stats: GroupStats[]) {
      if (!meanRef.current) return;
      if (meanChart.current) meanChart.current.destroy();
      const labels = stats.map((s) => s.winner);
      const data = stats.map((s) => s.mean);
      const config: ChartConfiguration<'bar', number[], string> = {
        type: 'bar',
        data: {
          labels,
          datasets: [
            {
              label: 'Mean delta',
              data,
              backgroundColor: labels.map((l) => COLORS[l as keyof typeof COLORS] ?? COLORS.Unknown)
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          animation: { duration: ANIM.durationMs, easing: 'easeOutQuart' },
          plugins: { legend: { display: false } },
          scales: {
            y: { ticks: { callback: (v: string | number) => formatDollars(Number(v)) }, grid: { display: false } },
            x: { grid: { display: false } }
          }
        },
        plugins: [errorBarPlugin]
      };
      const chart = new ChartJS(meanRef.current, config);
      (chart as ChartWithAnim).$_stats = stats;
      meanChart.current = chart;
    }

    function buildBoxChart(stats: GroupStats[]) {
      if (!boxRef.current) return;
      if (boxChart.current) boxChart.current.destroy();
      const labels = stats.map((s) => s.winner);
      const config: ChartConfiguration<'bar', number[], string> = {
        type: 'bar',
        data: {
          labels,
          datasets: [
            {
              label: 'Distribution',
              data: stats.map(() => 0),
              backgroundColor: 'rgba(0,0,0,0)'
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          animation: { duration: ANIM.durationMs, easing: 'easeOutQuart' },
          plugins: { legend: { display: false } },
          scales: {
            y: { ticks: { callback: (v: string | number) => formatDollars(Number(v)) }, grid: { display: false } },
            x: { grid: { display: false } }
          }
        },
        plugins: [boxPlotPlugin]
      };
      const chart = new ChartJS(boxRef.current, config);
      (chart as ChartWithAnim).$_stats = stats;
      boxChart.current = chart;
    }

    main();
  }, []);

  useEffect(() => {
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
  }, [words.length, viewMode]);

  return (
    <main className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="mx-auto max-w-6xl rounded-lg bg-white p-5 pb-16 shadow flex flex-col h-screen">
        <div className="mb-4">
          <h1 className="text-xl font-bold text-gray-900">Difference in Means & Distribution</h1>
          <p className="text-sm text-gray-500 mt-1">Spending delta by 2020 winner</p>
        </div>
        <div className="mb-2 text-sm text-gray-600">{status}</div>
        <div className="grid grid-rows-2 gap-4 flex-1">
          <div className="relative">
            <canvas ref={meanRef} className="w-full h-full"></canvas>
          </div>
          <div className="relative">
            <canvas ref={boxRef} className="w-full h-full"></canvas>
          </div>
        </div>
        <div className="mt-3 mb-2 rounded-lg border border-gray-100 bg-gray-50 px-4 py-3 text-sm leading-relaxed text-gray-700">
          {words.slice(0, displayedWords).map((word, idx) => (
            <span key={idx} className="inline animate-fadeIn">
              {word}{' '}
            </span>
          ))}
          {displayedWords < words.length && (
            <span className="inline-block h-4 w-0.5 ml-1 bg-blue-500 animate-pulse"></span>
          )}
          <div className="mt-2 text-[11px] text-gray-600">
            {viewMode === 'desc' ? (
              <button
                type="button"
                className="font-semibold italic underline underline-offset-2"
                onClick={() => setViewMode('key')}
              >
                Key observations...
              </button>
            ) : (
              <button
                type="button"
                className="font-semibold italic underline underline-offset-2"
                onClick={() => setViewMode('desc')}
              >
                Description...
              </button>
            )}
          </div>
        </div>

        <Link
          href="/per-capita"
          className="fixed left-4 md:left-8 top-1/2 -translate-y-1/2 z-20 text-gray-400 text-base transition duration-150 ease-out hover:text-gray-900 hover:scale-125"
          aria-label="Go to per-capita chart"
        >
          <span className="inline-block">‹</span>
        </Link>
        <Link
          href="/binned"
          className="fixed right-4 md:right-8 top-1/2 -translate-y-1/2 z-20 text-gray-400 text-base transition duration-150 ease-out hover:text-gray-900 hover:scale-125"
          aria-label="Go to binned scatter"
        >
          <span className="inline-block">›</span>
        </Link>
        <div className="fixed bottom-2 left-1/2 -translate-x-1/2 z-20 flex items-center gap-3 rounded-full border border-gray-200 bg-white/65 px-4 py-1 text-xs text-gray-600 shadow-md backdrop-blur scale-75 origin-bottom">
          <span className="font-semibold text-gray-900">5 / 11</span>
          <div className="flex items-center gap-2">
            <Link href="/intro" aria-label="Go to page 1">
              <span className="block h-2 w-2 rounded-full bg-gray-300 hover:bg-gray-400"></span>
            </Link>
            <Link href="/iija" aria-label="Go to page 2">
              <span className="block h-2 w-2 rounded-full bg-gray-300 hover:bg-gray-400"></span>
            </Link>
            <Link href="/totals" aria-label="Go to page 3">
              <span className="block h-2 w-2 rounded-full bg-gray-300 hover:bg-gray-400"></span>
            </Link>
            <Link href="/per-capita" aria-label="Go to page 4">
              <span className="block h-2 w-2 rounded-full bg-gray-300 hover:bg-gray-400"></span>
            </Link>
            <Link href="/party-diff" aria-label="Go to page 5">
              <span className="block h-2 w-2 rounded-full bg-gray-900"></span>
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
    </main>
  );
}
