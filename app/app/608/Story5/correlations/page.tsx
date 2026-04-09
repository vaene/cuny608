'use client';

import Story5Shell from "@/components/Story5Shell";
import { KEY_FINDINGS } from "@/lib/climateData";

export default function CorrelationsPage() {
  return (
    <Story5Shell
      currentPath="/608/Story5/correlations"
      title="Temperature-Storm Correlations"
      subtitle="Statistical relationships between rising temperatures and storm activity."
    >
      <div className="space-y-4">
        {/* Correlation Bars */}
        <div className="space-y-3">
          {/* Tornado Count */}
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-slate-300 text-xs font-semibold">Temp ↔ Tornado Count</span>
              <span className="text-green-400 font-bold text-xs">{(KEY_FINDINGS.temperatureTornadoCorrelation).toFixed(3)}</span>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-2 overflow-hidden">
              <div
                className="bg-gradient-to-r from-green-500 to-emerald-400 h-2 rounded-full"
                style={{ width: `${KEY_FINDINGS.temperatureTornadoCorrelation * 100}%` }}
              />
            </div>
            <p className="text-slate-400 text-xs mt-1"><strong>Strong:</strong> As temperature rises, tornado frequency increases significantly.</p>
          </div>

          {/* Tornado Deaths */}
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-slate-300 text-xs font-semibold">Temp ↔ Tornado Deaths</span>
              <span className="text-yellow-400 font-bold text-xs">{(KEY_FINDINGS.temperatureTornadoDeathsCorrelation).toFixed(3)}</span>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-2 overflow-hidden">
              <div
                className="bg-gradient-to-r from-yellow-500 to-orange-400 h-2 rounded-full"
                style={{ width: `${KEY_FINDINGS.temperatureTornadoDeathsCorrelation * 100}%` }}
              />
            </div>
            <p className="text-slate-400 text-xs mt-1"><strong>Moderate:</strong> More tornadoes mean more fatalities in warmer periods.</p>
          </div>

          {/* Hurricane Max Wind */}
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-slate-300 text-xs font-semibold">Temp ↔ Max Hurricane Wind</span>
              <span className="text-red-400 font-bold text-xs">{(KEY_FINDINGS.temperatureMaxHurricaneWindCorrelation).toFixed(3)}</span>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-2 overflow-hidden">
              <div
                className="bg-gradient-to-r from-red-500 to-pink-400 h-2 rounded-full"
                style={{ width: `${KEY_FINDINGS.temperatureMaxHurricaneWindCorrelation * 100}%` }}
              />
            </div>
            <p className="text-slate-400 text-xs mt-1"><strong>Moderate:</strong> Warmer oceans fuel stronger peak hurricane winds.</p>
          </div>

          {/* Avg Hurricane Wind */}
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-slate-300 text-xs font-semibold">Temp ↔ Avg Hurricane Wind</span>
              <span className="text-slate-400 font-bold text-xs">{(KEY_FINDINGS.temperatureAvgHurricaneWindCorrelation).toFixed(3)}</span>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-2 overflow-hidden">
              <div
                className="bg-slate-600 h-2 rounded-full"
                style={{ width: `${Math.abs(KEY_FINDINGS.temperatureAvgHurricaneWindCorrelation) * 100}%` }}
              />
            </div>
            <p className="text-slate-400 text-xs mt-1"><strong>Weak/Negligible:</strong> Average intensity varies; peak storms show stronger correlation.</p>
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
