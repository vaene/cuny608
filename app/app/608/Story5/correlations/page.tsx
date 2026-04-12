'use client';

import Story5Shell from "@/components/Story5Shell";
import { KEY_FINDINGS } from "@/lib/climateData";

export default function CorrelationsPage() {
  const correlationCards = [
    {
      label: "Temp ↔ Tornado Count",
      value: KEY_FINDINGS.temperatureTornadoCorrelation,
      color: "from-emerald-400 to-green-500",
      note: "Strongest relationship",
    },
    {
      label: "Temp ↔ Tornado Deaths",
      value: KEY_FINDINGS.temperatureTornadoDeathsCorrelation,
      color: "from-amber-400 to-orange-500",
      note: "Human impact signal",
    },
    {
      label: "Temp ↔ Max Hurricane Wind",
      value: KEY_FINDINGS.temperatureMaxHurricaneWindCorrelation,
      color: "from-rose-400 to-red-500",
      note: "Peak intensity link",
    },
    {
      label: "Temp ↔ Avg Hurricane Wind",
      value: KEY_FINDINGS.temperatureAvgHurricaneWindCorrelation,
      color: "from-slate-400 to-slate-500",
      note: "Near-zero average",
    },
  ];

  return (
    <Story5Shell
      currentPath="/608/Story5/correlations"
      title="Temperature-Storm Correlations"
      subtitle="Statistical relationships between rising temperatures and storm activity."
    >
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.2fr] gap-4">
        {/* Correlation How-To */}
        <div className="bg-slate-900/60 border border-slate-700 rounded-lg p-4">
          <div className="text-slate-200 font-semibold text-sm mb-3">How Correlation Is Calculated</div>
          <div className="bg-black/50 border border-slate-700 rounded-md p-3 text-slate-200 text-sm font-mono">
            r = cov(X, Y) / (σₓ · σᵧ)
          </div>
          <div className="mt-3 space-y-2 text-xs text-slate-300">
            <div>1. Center each series: (xᵢ − x̄), (yᵢ − ȳ)</div>
            <div>2. Multiply pairs and average → covariance</div>
            <div>3. Divide by both standard deviations</div>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2 text-[10px] text-slate-400">
            <div className="bg-slate-900/60 border border-slate-700 rounded px-2 py-1">
              r = 1 → perfect positive
            </div>
            <div className="bg-slate-900/60 border border-slate-700 rounded px-2 py-1">
              r = 0 → no linear link
            </div>
            <div className="bg-slate-900/60 border border-slate-700 rounded px-2 py-1">
              r = −1 → perfect negative
            </div>
            <div className="bg-slate-900/60 border border-slate-700 rounded px-2 py-1">
              |r| closer to 1 = stronger
            </div>
          </div>
        </div>

        {/* Correlation Ladder */}
        <div className="bg-slate-900/60 border border-slate-700 rounded-lg p-4">
          <div className="text-slate-200 font-semibold text-sm mb-3">Correlation Ladder (0 = none, 1 = strong)</div>
          <div className="relative h-72">
            <div className="absolute left-3 top-4 bottom-6 w-px bg-slate-600/70" />
            <div className="absolute left-0 top-1 text-[10px] text-slate-400">1.0</div>
            <div className="absolute left-0 bottom-4 text-[10px] text-slate-500">0.0</div>

            {correlationCards.map((item) => {
              const value = Math.max(0, Math.min(1, item.value));
              const bottom = 16 + value * 220;
              const size = 10 + value * 12;
              return (
                <div
                  key={item.label}
                  className="absolute left-3 flex items-center gap-3"
                  style={{ bottom: `${bottom}px` }}
                >
                  <div
                    className={`rounded-full bg-gradient-to-r ${item.color} shadow-lg`}
                    style={{ width: `${size}px`, height: `${size}px` }}
                  />
                  <div className="bg-slate-900/80 border border-slate-700 rounded-md px-2 py-1">
                    <div className="text-slate-200 text-xs font-semibold">{item.label}</div>
                    <div className="text-slate-400 text-[10px]">{item.note}</div>
                  </div>
                  <div className="text-slate-200 text-xs font-bold tabular-nums">
                    {item.value.toFixed(3)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Interpretation */}
        <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-600 rounded-lg p-4">
          <div className="text-slate-200 font-semibold text-sm mb-2">📈 What This Means</div>
          <ul className="space-y-1 text-xs text-slate-300">
            <li>• <strong>Tornado link is strongest (0.852):</strong> Rising temps directly increase atmospheric instability, producing more tornadic storms</li>
            <li>• <strong>Hurricane peak wind (0.515):</strong> Warmer sea surface temperatures add energy; "most intense" storms get stronger</li>
            <li>• <strong>Deaths correlate with frequency:</strong> More storms = more exposure × more fatalities (multiplicative effect)</li>
            <li>• <strong>Causation:</strong> Temperature doesn't directly cause storms, but affects atmospheric/oceanic conditions that do</li>
          </ul>
        </div>

        {/* Time Periods */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-blue-900/20 border border-blue-600/30 rounded-lg p-3">
            <div className="text-blue-200 font-semibold text-xs mb-1">Tornadoes & Temp</div>
            <p className="text-slate-300 text-xs">1950–2025 (76 years) — overlapping full range</p>
          </div>
          <div className="bg-red-900/20 border border-red-600/30 rounded-lg p-3">
            <div className="text-red-200 font-semibold text-xs mb-1">Hurricanes & Temp</div>
            <p className="text-slate-300 text-xs">1980–2025 (46 years) — satellite era data</p>
          </div>
        </div>

        {/* StatisticalNote */}
        <div className="bg-slate-900/40 border border-slate-700/60 rounded-lg p-3">
          <div className="text-slate-300 text-xs leading-relaxed">
            <strong>Note:</strong> Pearson correlation does not imply causation. These correlations show association, not direct cause-and-effect. Multiple factors influence storm formation (atmospheric pressure, wind shear, ocean currents). Temperature is one significant variable among many.
          </div>
        </div>
      </div>
    </Story5Shell>
  );
}
