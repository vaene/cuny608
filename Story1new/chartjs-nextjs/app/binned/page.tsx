'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import {
  Chart as ChartJS,
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Tooltip,
  Legend,
  ChartConfiguration
} from 'chart.js';

ChartJS.register(LineController, LineElement, PointElement, LinearScale, CategoryScale, Tooltip, Legend);

const ANIM = { durationMs: 700 };

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

function parseCSV(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    const next = text[i + 1];
    if (ch === '"') {
      if (inQuotes && next === '"') {
        cur += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }
    if (ch === ',' && !inQuotes) {
      row.push(cur);
      cur = '';
      continue;
    }
    if (ch === '\n' && !inQuotes) {
      row.push(cur);
      rows.push(row);
      row = [];
      cur = '';
      continue;
    }
    if (ch === '\r') continue;
    cur += ch;
  }
  if (cur.length > 0 || row.length > 0) {
    row.push(cur);
    rows.push(row);
  }
  return rows;
}

function mapPresMargins(csvText: string): Map<string, number> {
  const rows = parseCSV(csvText);
  const header = rows[0] ?? [];
  const idxSt = header.indexOf('ST');
  const idxDem = header.indexOf('Votes_Dem_2024');
  const idxGop = header.indexOf('Votes_GOP_2024');
  const out = new Map<string, number>();
  for (let i = 1; i < rows.length; i++) {
    const r = rows[i];
    const st = r[idxSt];
    if (!st) continue;
    const dem = Number(r[idxDem] || 0);
    const gop = Number(r[idxGop] || 0);
    const total = dem + gop;
    if (total === 0) continue;
    out.set(st, (dem - gop) / total);
  }
  return out;
}

function mapHouseMargins(csvText: string): Map<string, number> {
  const rows = parseCSV(csvText);
  const header = rows[0] ?? [];
  const idxSt = header.indexOf('ST');
  const idxDem = header.indexOf('Votes_Dem_2024');
  const idxGop = header.indexOf('Votes_GOP_2024');
  const totals = new Map<string, { dem: number; gop: number }>();
  for (let i = 1; i < rows.length; i++) {
    const r = rows[i];
    const st = r[idxSt];
    if (!st) continue;
    const dem = Number(r[idxDem] || 0);
    const gop = Number(r[idxGop] || 0);
    const cur = totals.get(st) ?? { dem: 0, gop: 0 };
    cur.dem += Number.isNaN(dem) ? 0 : dem;
    cur.gop += Number.isNaN(gop) ? 0 : gop;
    totals.set(st, cur);
  }
  const out = new Map<string, number>();
  for (const [st, t] of totals) {
    const total = t.dem + t.gop;
    if (total === 0) continue;
    out.set(st, (t.dem - t.gop) / total);
  }
  return out;
}

function formatDollars(v: number): string {
  if (v === null || v === undefined || Number.isNaN(v)) return '';
  const sign = v < 0 ? '-' : '';
  return `${sign}$${Math.abs(Math.round(v)).toLocaleString()}`;
}

function formatPercent(v: number): string {
  if (v === null || v === undefined || Number.isNaN(v)) return '';
  return `${(v * 100).toFixed(1)}%`;
}

export default function BinnedPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<ChartJS | null>(null);
  const [status, setStatus] = useState('Loading data…');
  const chartDescription =
    'Why it matters: binned averages smooth noise to reveal whether any systematic relationship exists.';
  const sources =
    'USAspending.gov API (FY2017–FY2024), Census population by fiscal year, 2024 presidential and House results.';
  const methods =
    'Compute per-capita delta; sort and bin states into eight equal-count bins; plot average presidential and House margins per bin.';

  useEffect(() => {
    async function main() {
      try {
        const [popText, states, presCsv, houseCsv] = await Promise.all([
          loadText('/data/population_by_state_fy.csv'),
          loadJSON('/data/states_50.json'),
          loadText('/data/2024-electoral-states.csv'),
          loadText('/data/2024-electoral-districts.csv')
        ]);

        const popMap = parsePopulationCSV(popText);
        const presMargins = mapPresMargins(presCsv);
        const houseMargins = mapHouseMargins(houseCsv);

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

        const rows: { delta: number; pres: number; house: number }[] = [];
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
          const pres = presMargins.get(st);
          const house = houseMargins.get(st);
          if (pres === undefined || house === undefined) continue;
          rows.push({ delta, pres, house });
        }

        rows.sort((a, b) => a.delta - b.delta);
        const bins = 8;
        const binned: { avgDelta: number; avgPres: number; avgHouse: number }[] = [];
        for (let i = 0; i < bins; i++) {
          const start = Math.floor((rows.length * i) / bins);
          const end = Math.floor((rows.length * (i + 1)) / bins);
          const slice = rows.slice(start, end);
          const avgDelta = slice.reduce((s, r) => s + r.delta, 0) / slice.length;
          const avgPres = slice.reduce((s, r) => s + r.pres, 0) / slice.length;
          const avgHouse = slice.reduce((s, r) => s + r.house, 0) / slice.length;
          binned.push({ avgDelta, avgPres, avgHouse });
        }

        buildChart(binned);
        setStatus('');
      } catch (err) {
        console.error(err);
        setStatus(`Failed to load data: ${err instanceof Error ? err.message : 'Unknown error'}`);
      }
    }

    function buildChart(binned: { avgDelta: number; avgPres: number; avgHouse: number }[]) {
      if (!canvasRef.current) return;
      if (chartRef.current) chartRef.current.destroy();
      const labels = binned.map((b) => formatDollars(b.avgDelta));
      const config: ChartConfiguration<'line', number[], string> = {
        type: 'line',
        data: {
          labels,
          datasets: [
            {
              label: 'Presidential margin',
              data: binned.map((b) => b.avgPres),
              borderColor: '#2166AC',
              backgroundColor: '#2166AC',
              tension: 0.2,
              pointRadius: 3
            },
            {
              label: 'House margin',
              data: binned.map((b) => b.avgHouse),
              borderColor: '#B2182B',
              backgroundColor: '#B2182B',
              tension: 0.2,
              pointRadius: 3
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          animation: { duration: ANIM.durationMs, easing: 'easeOutQuart' },
          plugins: { legend: { display: true } },
          scales: {
            y: {
              ticks: { callback: (v: string | number) => formatPercent(Number(v)) },
              grid: { display: false }
            },
            x: { grid: { display: false } }
          }
        }
      };
      chartRef.current = new ChartJS(canvasRef.current, config);
    }

    main();
  }, []);

  return (
    <main className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="mx-auto max-w-6xl rounded-lg bg-white p-5 pb-16 shadow flex flex-col h-screen">
        <div className="mb-4">
          <h1 className="text-xl font-bold text-gray-900">Binned Averages</h1>
          <p className="text-sm text-gray-500 mt-1">Spending delta bins vs 2024 margins</p>
</div>
        <div className="mb-2 text-sm text-gray-600">{status}</div>
        <div className="relative flex-1 pb-4">
          <canvas ref={canvasRef} className="w-full h-full"></canvas>
        </div>
        <details className="mt-3 rounded-lg border border-gray-100 bg-gray-50 px-4 py-3 text-sm text-gray-700">
          <summary className="cursor-pointer font-semibold text-gray-900">
            Chart context, sources, and methods
          </summary>
          <div className="mt-2">{chartDescription}</div>
          <div className="mt-2 text-xs text-gray-600">Sources: {sources}</div>
          <div className="mt-1 text-xs text-gray-600">Methods: {methods}</div>
        </details>

        <Link
          href="/party-diff"
          className="fixed left-4 md:left-8 top-1/2 -translate-y-1/2 z-20 text-gray-400 text-base transition duration-150 ease-out hover:text-gray-900 hover:scale-125"
          aria-label="Go to party diff"
        >
          <span className="inline-block">‹</span>
        </Link>
        <Link
          href="/scatter-pres"
          className="fixed right-4 md:right-8 top-1/2 -translate-y-1/2 z-20 text-gray-400 text-base transition duration-150 ease-out hover:text-gray-900 hover:scale-125"
          aria-label="Go to presidential scatter"
        >
          <span className="inline-block">›</span>
        </Link>
        <div className="fixed bottom-2 left-1/2 -translate-x-1/2 z-20 flex items-center gap-3 rounded-full border border-gray-200 bg-white/65 px-4 py-1 text-xs text-gray-600 shadow-md backdrop-blur scale-75 origin-bottom">
          <span className="font-semibold text-gray-900"> 6 / 11 </span>
          <div className="flex items-center gap-2">
              <Link href="/intro" aria-label="Go to page 1">
                <span className="block h-2 w-2 rounded-full bg-gray-300 hover:bg-gray-400"></span>
              </Link>
              <Link href="/question" aria-label="Go to page 2">
                <span className="block h-2 w-2 rounded-full bg-gray-300 hover:bg-gray-400"></span>
              </Link>
              <Link href="/totals" aria-label="Go to page 3">
                <span className="block h-2 w-2 rounded-full bg-gray-300 hover:bg-gray-400"></span>
              </Link>
              <Link href="/per-capita" aria-label="Go to page 4">
                <span className="block h-2 w-2 rounded-full bg-gray-300 hover:bg-gray-400"></span>
              </Link>
              <Link href="/party-diff" aria-label="Go to page 5">
                <span className="block h-2 w-2 rounded-full bg-gray-300 hover:bg-gray-400"></span>
              </Link>
              <Link href="/binned" aria-label="Go to page 6">
                <span className="block h-2 w-2 rounded-full bg-gray-900"></span>
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
