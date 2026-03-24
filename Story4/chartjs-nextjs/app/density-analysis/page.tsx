'use client';

import { useEffect, useState } from "react";

import StoryShell from "@/components/StoryShell";
import {
  formatCurrency,
  loadJSON,
  type SalaryByRegionEnrichedRecord,
  type SalaryMatrix
} from "@/lib/salaryData";

interface HeatmapCell {
  region: string;
  role: string;
  nominal: number;
  cola: number;
  real: number;
}

const ROLE_ORDER = [
  "Data Architect",
  "Data Scientist",
  "Data Engineer",
  "Business Analyst",
  "Data Analyst"
] as const;

const REGION_ORDER = [
  "West",
  "Northeast",
  "Southwest",
  "Midwest",
  "Southeast"
] as const;

function getHeatColor(value: number, min: number, max: number): string {
  const range = max - min || 1;
  const t = Math.max(0, Math.min(1, (value - min) / range));

  const red = Math.round(248 - t * 156);
  const green = Math.round(250 - t * 26);
  const blue = Math.round(240 - t * 154);

  return `rgb(${red}, ${green}, ${blue})`;
}

function getTextColor(value: number, min: number, max: number): string {
  const range = max - min || 1;
  const t = Math.max(0, Math.min(1, (value - min) / range));
  return t > 0.58 ? "#ffffff" : "#111827";
}

export default function DensityAnalysisPage() {
  const [cells, setCells] = useState<HeatmapCell[]>([]);
  const [status, setStatus] = useState("Loading data...");

  useEffect(() => {
    let active = true;

    async function loadData() {
      try {
        const [matrix, enriched] = await Promise.all([
          loadJSON<SalaryMatrix>("/data/salary-region-role.json"),
          loadJSON<SalaryByRegionEnrichedRecord[]>("/data/salary-by-region-enriched.json")
        ]);

        if (!active) return;

        const colaByRegion = Object.fromEntries(
          enriched.filter((record) => record.cola !== null).map((record) => [record.region, record.cola as number])
        );

        const realCells: HeatmapCell[] = [];

        for (const region of REGION_ORDER) {
          const cola = colaByRegion[region];
          if (!cola || !matrix[region]) continue;

          for (const role of ROLE_ORDER) {
            const nominal = matrix[region][role];
            if (!nominal) continue;

            realCells.push({
              region,
              role,
              nominal,
              cola,
              real: nominal / (cola / 100)
            });
          }
        }

        setCells(realCells);
        setStatus("");
      } catch (error) {
        console.error("Error loading real purchasing power data:", error);
        setStatus(`Error: ${error instanceof Error ? error.message : "Unknown error"}`);
      }
    }

    loadData();

    return () => {
      active = false;
    };
  }, []);

  const realValues = cells.map((cell) => cell.real);
  const minReal = realValues.length ? Math.min(...realValues) : 0;
  const maxReal = realValues.length ? Math.max(...realValues) : 0;

  return (
    <StoryShell
      currentPath="/density-analysis"
      title="Real Purchasing Power by Role and Region"
      subtitle="COLA-adjusted salary reveals which role-region combinations stretch furthest after local costs are considered"
    >
      <div className="flex h-full flex-col">
        <section className="mb-8 rounded-2xl border border-blue-200 bg-blue-50 p-6">
          <div className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-800">
            Focus
          </div>
          <p className="mt-2 text-sm leading-6 text-blue-900">
            This slide brings the focus together by translating nominal salary into
            <strong> COLA-adjusted purchasing power </strong>
            for each role-region combination. It shows where the combination of salary level and local cost
            structure produces the strongest real economic value.
          </p>
        </section>

        <div className="rounded-2xl border border-gray-200 bg-white p-5">
          {status ? (
            <div className="flex min-h-[24rem] items-center justify-center text-sm text-gray-500">{status}</div>
          ) : (
            <div className="space-y-4">
              <div
                className="grid gap-3"
                style={{
                  gridTemplateColumns: `minmax(140px, 1.15fr) repeat(${ROLE_ORDER.length}, minmax(120px, 1fr))`
                }}
              >
                <div className="px-2 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-gray-500">
                  Region
                </div>
                {ROLE_ORDER.map((role) => (
                  <div
                    key={role}
                    className="px-2 py-3 text-center text-xs font-semibold uppercase tracking-[0.12em] text-gray-500"
                  >
                    {role}
                  </div>
                ))}

                {REGION_ORDER.map((region) => (
                  <FragmentRow
                    key={region}
                    region={region}
                    roleOrder={ROLE_ORDER}
                    cells={cells.filter((cell) => cell.region === region)}
                    minReal={minReal}
                    maxReal={maxReal}
                  />
                ))}
              </div>

              <div className="flex items-center justify-between gap-4 rounded-xl bg-gray-50 px-4 py-3 text-xs text-gray-600">
                <span>Lower real purchasing power</span>
                <div className="h-3 flex-1 rounded-full bg-gradient-to-r from-[#f8faf0] via-[#b6dcb3] to-[#5ca36c]" />
                <span>Higher real purchasing power</span>
              </div>
            </div>
          )}
        </div>

        <div className="mt-8 space-y-4 border-t border-gray-200 pt-6">
          <div className="rounded-lg bg-blue-50 p-4">
            <h3 className="font-semibold text-blue-900">Interpretation</h3>
            <p className="mt-2 text-sm text-blue-800">
              Each cell shows nominal salary adjusted by local COLA using
              <strong> salary / (COLA / 100)</strong>.
              Darker green cells indicate stronger real purchasing power after accounting for local costs.
              Remote is excluded because it has no geographic COLA anchor.
            </p>
          </div>

          <div className="rounded-lg bg-green-50 p-4">
            <h3 className="font-semibold text-green-900">Key Finding</h3>
            <p className="mt-2 text-sm text-green-800">
              High nominal salaries do not always produce the strongest real outcome. Roles in the
              Midwest and Southwest often hold up well after COLA adjustment, while some high-salary
              coastal roles lose ground once local costs are accounted for.
            </p>
          </div>

          <p className="text-xs text-gray-600">
            This final view complements the earlier nominal salary charts by showing the practical buying power
            of each role-region combination, not just the posted salary level.
          </p>
        </div>
      </div>
    </StoryShell>
  );
}

function FragmentRow({
  region,
  roleOrder,
  cells,
  minReal,
  maxReal
}: {
  region: string;
  roleOrder: readonly string[];
  cells: HeatmapCell[];
  minReal: number;
  maxReal: number;
}) {
  const cola = cells[0]?.cola;

  return (
    <>
      <div className="flex items-center px-2 py-4 text-sm font-semibold text-gray-900">
        <div>
          <div>{region}</div>
          <div className="text-xs font-normal text-gray-500">COLA {cola}</div>
        </div>
      </div>

      {roleOrder.map((role) => {
        const cell = cells.find((entry) => entry.role === role);
        if (!cell) {
          return <div key={`${region}-${role}`} className="rounded-xl border border-gray-100 bg-gray-50 p-4" />;
        }

        return (
          <div
            key={`${region}-${role}`}
            className="rounded-xl border border-white/60 p-4 text-center shadow-sm"
            style={{
              backgroundColor: getHeatColor(cell.real, minReal, maxReal),
              color: getTextColor(cell.real, minReal, maxReal)
            }}
            title={`${region} | ${role} | Nominal ${formatCurrency(cell.nominal)} | Real ${formatCurrency(cell.real)}`}
          >
            <div className="text-lg font-semibold">{formatCurrency(cell.real)}</div>
            <div className="mt-1 text-xs opacity-80">Nominal {formatCurrency(cell.nominal)}</div>
          </div>
        );
      })}
    </>
  );
}
