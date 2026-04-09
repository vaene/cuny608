'use client';

import { useEffect, useState } from 'react';
import Story5Shell from "@/components/Story5Shell";
import { loadClimateStomsData, KEY_FINDINGS, type ClimateStorm } from "@/lib/climateData";

export default function TrendsPage() {
  const [data, setData] = useState<ClimateStorm[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadClimateStomsData().then(setData).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <Story5Shell currentPath="/608/Story5/trends" title="Trends" subtitle="Loading...">
        <div className="flex items-center justify-center h-full text-slate-300">Loading trend data...</div>
      </Story5Shell>
    );
  }

  const tempEntries = data.filter((entry) => typeof entry.temp_anomaly === 'number');
  const tempStartEntry = tempEntries[0];
  const temp2025Entry = tempEntries.find((entry) => entry.year === 2025) ?? tempEntries[tempEntries.length - 1];
  const tempLatestEntry = temp2025Entry;
  const tempIncrease = tempStartEntry && tempLatestEntry
    ? (tempLatestEntry.temp_anomaly - tempStartEntry.temp_anomaly).toFixed(2)
    : '0.00';
  const tempStartYear = tempStartEntry?.year ?? data[0]?.year ?? 1950;
  const tempLatestYear = 2025;
  const tempStartAnomaly = tempStartEntry?.temp_anomaly?.toFixed(2) ?? '0.00';
  const tempLatestAnomaly = tempLatestEntry?.temp_anomaly?.toFixed(2)
    ?? '0.00';
  const tornadoEntries = data.filter((entry) => typeof entry.tornado_count === 'number');
  const tornado2025Entry = tornadoEntries.find((entry) => entry.year === 2025);
  const tornadoWindowEndYear = 2025;
  const tornadoWindowStartYear = tornadoWindowEndYear - 29;
  // limit tornado comparisons to the most recent 30 years to minimize inflation from detection changes
  const tornadoWindowEntries = tornadoEntries.filter(
    (entry) => entry.year >= tornadoWindowStartYear && entry.year <= tornadoWindowEndYear
  );
  const tornadoStartEntry = tornadoWindowEntries[0];
  const tornadoLatestWindowEntry = tornadoWindowEntries[tornadoWindowEntries.length - 1];
  const tornadoStartCount = tornadoStartEntry?.tornado_count || 0;
  const tornadoLatestCount = tornado2025Entry?.tornado_count ?? tornadoLatestWindowEntry?.tornado_count ?? tornadoStartCount;
  const tornadoChange = tornadoStartCount > 0
    ? ((tornadoLatestCount - tornadoStartCount) / tornadoStartCount * 100).toFixed(0)
    : '0';
  const tornadoStartYear = tornadoStartEntry?.year ?? tornadoWindowStartYear;
  const tornadoLatestYear = tornadoWindowEndYear;

  return (
    <Story5Shell
      currentPath="/608/Story5/trends"
      title="Long-Term Trends"
      subtitle="Temperature (1950–2025) and tornado/hurricane patterns (1950–2025)."
    >
      <div className="space-y-4">
        {/* Temperature Trend */}
        <div className="bg-gradient-to-r from-blue-900/30 to-blue-800/20 border border-blue-600/40 rounded-lg p-4">
          <div className="flex items-start justify-between mb-2">
            <div>
              <div className="text-blue-300 font-semibold text-sm">🌡️ Global Temperature Anomaly</div>
              <p className="text-slate-400 text-xs mt-1">Relative to 1951-1980 baseline</p>
            </div>
            <div className="text-right">
              <div className="text-blue-100 font-bold text-lg">{tempIncrease}°C</div>
              <div className="text-blue-400 text-xs">increase</div>
            </div>
          </div>
          <div className="space-y-1 text-xs text-slate-300">
            <p>• {tempStartYear}: {tempStartAnomaly}°C (baseline era)</p>
            <p>• {tempLatestYear}: {tempLatestAnomaly}°C (current)</p>
            <p>• <strong>Clear warming trend:</strong> accelerating in recent decades</p>
          </div>
        </div>

        {/* Tornado Trend */}
        <div className="bg-gradient-to-r from-orange-900/30 to-orange-800/20 border border-orange-600/40 rounded-lg p-4">
          <div className="flex items-start justify-between mb-2">
            <div>
              <div className="text-orange-300 font-semibold text-sm">⛈️ Tornado Frequency</div>
              <p className="text-slate-400 text-xs mt-1">Annual count in United States</p>
            </div>
            <div className="text-right">
              <div className="text-orange-100 font-bold text-lg">{tornadoChange}%</div>
              <div className="text-orange-400 text-xs">increase</div>
            </div>
          </div>
          <div className="space-y-1 text-xs text-slate-300">
            <p>• {tornadoStartYear}: {Math.round(tornadoStartCount)} tornadoes/year (reported)</p>
            <p>• {tornadoLatestYear}: {Math.round(tornadoLatestCount)} tornadoes/year (detected)</p>
            <p>• <strong>Note:</strong> Increase partly due to improved detection technology post-1990</p>
          </div>
        </div>

        {/* Hurricane Trend */}
        <div className="bg-gradient-to-r from-red-900/30 to-red-800/20 border border-red-600/40 rounded-lg p-4">
          <div className="flex items-start justify-between mb-2">
            <div>
              <div className="text-red-300 font-semibold text-sm">🌀 Hurricane Intensity</div>
              <p className="text-slate-400 text-xs mt-1">Maximum wind speed in tracked storms (1980-2025)</p>
            </div>
            <div className="text-right">
              <div className="text-red-100 font-bold text-lg">{KEY_FINDINGS.avgMaxWindSpeed.toFixed(0)}</div>
              <div className="text-red-400 text-xs">avg knots</div>
            </div>
          </div>
          <div className="space-y-1 text-xs text-slate-300">
            <p>• Peak observed: 175 knots (Category 5 equiv.)</p>
            <p>• {KEY_FINDINGS.totalStorms} storms × 305,957 track points</p>
            <p>• <strong>Stronger storms:</strong> Warmer oceans provide more energy for intensification</p>
          </div>
        </div>

        {/* Key Insight */}
        <div className="bg-slate-800/40 border border-slate-600/60 rounded-lg p-4">
          <div className="text-slate-200 font-semibold text-sm mb-2">📊 What These Trends Tell Us</div>
          <ul className="space-y-1 text-xs text-slate-300">
            <li>• <strong>Temperature:</strong> Rising steadily since 1950, with acceleration since 1980</li>
            <li>• <strong>Tornadoes:</strong> Increased frequency, but causation complex (detection improvements, urbanization, atmospheric changes)</li>
            <li>• <strong>Hurricanes:</strong> More intense storms in recent years; warmer oceans (2-3°F increase) fuel stronger cyclones</li>
            <li>• <strong>Timing matters:</strong> All three show strongest trends in the most recent 20-30 years</li>
          </ul>
        </div>
      </div>
    </Story5Shell>
  );
}
