'use client';

import { useEffect, useState } from 'react';
import Story5Shell from "@/components/Story5Shell";
import { loadClimateStomsData, KEY_FINDINGS, type ClimateStorm } from "@/lib/climateData";

export default function AnalysisPage() {
  const [data, setData] = useState<ClimateStorm[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadClimateStomsData().then(setData).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <Story5Shell
        currentPath="/608/Story5/analysis"
        title="Data Analysis"
        subtitle="Loading..."
      >
        <div className="flex items-center justify-center h-full">
          <div className="text-slate-300">Loading analysis data...</div>
        </div>
      </Story5Shell>
    );
  }

  const earliestYear = data.length > 0 ? data[0].year : 1950;
  const latestYear = data.length > 0 ? data[data.length - 1].year : 2025;
  const totalTornadoes = data.reduce((sum, d) => sum + (d.tornado_count || 0), 0);
  const avgTornadoesPerYear = (totalTornadoes / data.length).toFixed(0);
  const totalHurricanes = data.reduce((sum, d) => sum + (d.hurricane_count || 0), 0);
  const avgHurricanesPerYear = (totalHurricanes / data.filter(d => d.hurricane_count).length).toFixed(1);

  return (
    <Story5Shell
      currentPath="/608/Story5/analysis"
      title="Data Analysis & Key Findings"
      subtitle="Statistical correlations between global temperature anomalies (1950-2025) and storm activity (1950-2025)."
    >
      <div className="space-y-8">
        {/* Key Statistics */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-slate-900/50 border border-slate-600 rounded-lg p-4">
            <div className="text-slate-400 text-sm">Data Period</div>
            <div className="text-2xl font-bold text-white">
              {earliestYear}–{latestYear}
            </div>
            <div className="text-slate-400 text-xs">{data.length} years</div>
          </div>

          <div className="bg-slate-900/50 border border-slate-600 rounded-lg p-4">
            <div className="text-slate-400 text-sm">Temperature Anomaly</div>
            <div className="text-2xl font-bold text-blue-400">
              {KEY_FINDINGS.temperatureAnomalyRange.min}°C to +{KEY_FINDINGS.temperatureAnomalyRange.max}°C
            </div>
            <div className="text-slate-400 text-xs">Range (1951-1980 baseline)</div>
          </div>

          <div className="bg-slate-900/50 border border-slate-600 rounded-lg p-4">
            <div className="text-slate-400 text-sm">Total Tornadoes</div>
            <div className="text-2xl font-bold text-orange-400">
              {(totalTornadoes / 1000000).toFixed(1)}M
            </div>
            <div className="text-slate-400 text-xs">{avgTornadoesPerYear}/year avg</div>
          </div>

          <div className="bg-slate-900/50 border border-slate-600 rounded-lg p-4">
            <div className="text-slate-400 text-sm">Total Hurricanes</div>
            <div className="text-2xl font-bold text-purple-400">
              {totalHurricanes.toLocaleString()}
            </div>
            <div className="text-slate-400 text-xs">{avgHurricanesPerYear}/year avg</div>
          </div>
        </section>

        {/* Correlations */}
        <section className="bg-slate-900/50 border border-slate-600 rounded-lg p-6">
          <h3 className="text-xl font-bold text-white mb-6">Temperature Correlations with Storm Activity</h3>

          <div className="space-y-4">
            {/* Tornado Count */}
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-slate-300">Temperature vs <strong>Tornado Frequency</strong></span>
                <span className="text-green-400 font-bold">{(KEY_FINDINGS.temperatureTornadoCorrelation).toFixed(3)}</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full"
                  style={{ width: `${KEY_FINDINGS.temperatureTornadoCorrelation * 100}%` }}
                />
              </div>
              <p className="text-slate-400 text-sm mt-1">
                Strong positive correlation: As temperature increases, tornado count increases significantly.
              </p>
            </div>

            {/* Tornado Deaths */}
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-slate-300">Temperature vs <strong>Tornado Deaths</strong></span>
                <span className="text-yellow-400 font-bold">{(KEY_FINDINGS.temperatureTornadoDeathsCorrelation).toFixed(3)}</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-yellow-500 to-orange-500 h-2 rounded-full"
                  style={{ width: `${KEY_FINDINGS.temperatureTornadoDeathsCorrelation * 100}%` }}
                />
              </div>
              <p className="text-slate-400 text-sm mt-1">
                Moderate positive correlation: Warmer temperatures associate with more tornado-related fatalities.
              </p>
            </div>

            {/* Hurricane Wind */}
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-slate-300">Temperature vs <strong>Max Hurricane Wind</strong></span>
                <span className="text-red-400 font-bold">{(KEY_FINDINGS.temperatureMaxHurricaneWindCorrelation).toFixed(3)}</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-red-500 to-pink-500 h-2 rounded-full"
                  style={{ width: `${KEY_FINDINGS.temperatureMaxHurricaneWindCorrelation * 100}%` }}
                />
              </div>
              <p className="text-slate-400 text-sm mt-1">
                Moderate positive correlation: Warmer oceans fuel stronger hurricane winds.
              </p>
            </div>

            {/* Average Hurricane Wind */}
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-slate-300">Temperature vs <strong>Avg Hurricane Wind</strong></span>
                <span className="text-slate-400 font-bold">{(KEY_FINDINGS.temperatureAvgHurricaneWindCorrelation).toFixed(3)}</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${KEY_FINDINGS.temperatureAvgHurricaneWindCorrelation > 0 ? 'bg-slate-600' : 'bg-slate-500'}`}
                  style={{ width: `${Math.abs(KEY_FINDINGS.temperatureAvgHurricaneWindCorrelation) * 100}%` }}
                />
              </div>
              <p className="text-slate-400 text-sm mt-1">
                Negligible correlation: Average intensity shows minimal relationship, but peak intensities are increasing.
              </p>
            </div>
          </div>
        </section>

        {/* Key Insights */}
        <section className="bg-gradient-to-br from-blue-900/30 to-purple-900/30 border border-slate-600 rounded-lg p-6">
          <h3 className="text-xl font-bold text-white mb-4">Takeaways</h3>
          <ul className="space-y-3 text-slate-300">
            <li className="flex gap-3">
              <span className="text-green-400 font-bold">✓</span>
              <span>Rising global temperature correlates strongly (0.852) with increased tornado frequency over 75 years.</span>
            </li>
            <li className="flex gap-3">
              <span className="text-orange-400 font-bold">✓</span>
              <span>More tornadoes mean more injuries and deaths—a direct human impact of climate change.</span>
            </li>
            <li className="flex gap-3">
              <span className="text-red-400 font-bold">✓</span>
              <span>Stronger hurricanes (higher wind speeds) show a moderate positive correlation (0.515) with temperature.</span>
            </li>
            <li className="flex gap-3">
              <span className="text-purple-400 font-bold">✓</span>
              <span>The data spans over 75 years, showing a robust long-term trend, not just short-term variation.</span>
            </li>
            <li className="flex gap-3">
              <span className="text-blue-400 font-bold">✓</span>
              <span>Warmer oceans have more energy available to fuel stronger cyclonic storms.</span>
            </li>
          </ul>
        </section>

        {/* Technical Details */}
        <section className="bg-slate-900/50 border border-slate-600 rounded-lg p-6">
          <h3 className="text-lg font-bold text-white mb-4">Data Specifications</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm text-slate-300">
            <div>
              <div className="text-slate-400 font-semibold">Tornado Data</div>
              <div className="text-slate-500">{KEY_FINDINGS.totalTornadoEvents.toLocaleString()} events</div>
              <div className="text-slate-500">{KEY_FINDINGS.totalTornadoDeaths.toLocaleString()} deaths recorded</div>
            </div>
            <div>
              <div className="text-slate-400 font-semibold">Hurricane Data</div>
              <div className="text-slate-500">{KEY_FINDINGS.totalStorms.toLocaleString()} unique storms</div>
              <div className="text-slate-500">Avg {KEY_FINDINGS.avgHurricanesPerYear.toFixed(1)}/year</div>
            </div>
            <div>
              <div className="text-slate-400 font-semibold">Peak Activity</div>
              <div className="text-slate-500">{KEY_FINDINGS.maxHurricanesInAYear} storms (1 year)</div>
              <div className="text-slate-500">Avg wind: {KEY_FINDINGS.avgMaxWindSpeed.toFixed(1)} knots</div>
            </div>
          </div>
        </section>
      </div>
    </Story5Shell>
  );
}
