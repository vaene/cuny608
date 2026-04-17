'use client';

import Story5Shell from "@/components/Story5Shell";

export default function SourcesPage() {
  return (
    <Story5Shell
      currentPath="/608/Story5/sources"
      title="Data Sources & Methodology"
      subtitle="Detailed information about all datasets, citations, and processing methodology."
    >
      <div className="space-y-8">
        {/* Overview */}
        <section className="bg-gradient-to-br from-slate-800/50 to-slate-900/30 border border-slate-600 rounded-lg p-6">
          <h3 className="text-lg font-bold text-white mb-3">About This Analysis</h3>
          <p className="text-slate-300 leading-relaxed">
            This climate-storms analysis integrates three authoritative datasets from the United States government to examine 
            long-term correlations between rising global temperatures and storm activity. Data spans from 1950 to 2025, 
            with overlap periods carefully analyzed to identify climate patterns. All data is publicly available and 
            downloadable from the sources cited below.
          </p>
        </section>

        {/* Data Sources */}
        <div className="space-y-6">
          {/* GISS Temperature */}
          <section className="bg-slate-900/50 border border-blue-600/30 rounded-lg p-6">
            <div className="flex items-start gap-3 mb-4">
              <div className="text-blue-400 text-2xl">🌍</div>
              <div>
                <h4 className="text-lg font-bold text-white">Global Temperature Anomalies</h4>
                <p className="text-slate-400 text-sm">NASA Goddard Institute for Space Studies (GISS)</p>
              </div>
            </div>

            <div className="space-y-3 text-slate-300">
              <div>
                <span className="font-semibold text-slate-200">Dataset:</span> GLB.Ts+dSST (Global Land-Ocean Temperature Index)
              </div>
              <div>
                <span className="font-semibold text-slate-200">Time Period:</span> 1880-2025 (monthly data)
              </div>
              <div>
                <span className="font-semibold text-slate-200">Used In Analysis:</span> 1950-2025 (aligned to storm data availability)
              </div>
              <div>
                <span className="font-semibold text-slate-200">Baseline:</span> 1951-1980 average (standard climate reference period)
              </div>
              <div>
                <span className="font-semibold text-slate-200">Source:</span> Combined satellite, ocean buoy, and station measurements
              </div>

              <div className="pt-3">
                <p className="text-sm text-slate-400 mb-2">
                  Temperature anomalies represent deviations from the 1951-1980 baseline, allowing comparison of warming trends 
                  across time. Data is aggregated to annual averages for correlation analysis with storm metrics.
                </p>
              </div>

              <div className="bg-slate-800/50 rounded p-3 border-l-2 border-blue-400">
                <a
                  href="https://data.giss.nasa.gov/gistemp/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 underline font-mono text-sm"
                >
                  data.giss.nasa.gov/gistemp/
                </a>
              </div>
            </div>
          </section>

          {/* NOAA Storm Events */}
          <section className="bg-slate-900/50 border border-orange-600/30 rounded-lg p-6">
            <div className="flex items-start gap-3 mb-4">
              <div className="text-orange-400 text-2xl">⛈️</div>
              <div>
                <h4 className="text-lg font-bold text-white">Tornado Data</h4>
                <p className="text-slate-400 text-sm">NOAA National Centers for Environmental Information (NCEI)</p>
              </div>
            </div>

            <div className="space-y-3 text-slate-300">
              <div>
                <span className="font-semibold text-slate-200">Database:</span> Storm Events Database
              </div>
              <div>
                <span className="font-semibold text-slate-200">Time Period:</span> 1950-2025 (ongoing)
              </div>
              <div>
                <span className="font-semibold text-slate-200">Coverage:</span> United States (50 states + territories)
              </div>
              <div>
                <span className="font-semibold text-slate-200">Record Count:</span> 2,088,138 tornado events
              </div>
              <div>
                <span className="font-semibold text-slate-200">Data Points:</span> Date, location, wind speed, injuries, deaths, damage
              </div>

              <div className="pt-3">
                <p className="text-sm text-slate-400 mb-2">
                  Data comes from 79 gzip-compressed CSV files (one per month from 1950 onwards). This study consolidates 
                  all tornado records and aggregates by year for correlation analysis. Death counts and frequency metrics 
                  are tracked separately.
                </p>
              </div>

              <div className="bg-slate-800/50 rounded p-3 border-l-2 border-orange-400">
                <a
                  href="https://www.ncei.noaa.gov/products/severe-weather-data-inventory"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-orange-400 hover:text-orange-300 underline font-mono text-sm"
                >
                  ncei.noaa.gov/products/severe-weather-data-inventory
                </a>
              </div>
            </div>
          </section>

          {/* IBTrACS */}
          <section className="bg-slate-900/50 border border-purple-600/30 rounded-lg p-6">
            <div className="flex items-start gap-3 mb-4">
              <div className="text-purple-400 text-2xl">🌀</div>
              <div>
                <h4 className="text-lg font-bold text-white">Hurricane Data</h4>
                <p className="text-slate-400 text-sm">NOAA International Best Track Archive for Climate Stewardship (IBTrACS)</p>
              </div>
            </div>

            <div className="space-y-3 text-slate-300">
              <div>
                <span className="font-semibold text-slate-200">Database:</span> IBTrACS v4.11
              </div>
              <div>
                <span className="font-semibold text-slate-200">Time Period:</span> 1980-2025 (data available)
              </div>
              <div>
                <span className="font-semibold text-slate-200">Storm Count:</span> 4,929 unique cyclones
              </div>
              <div>
                <span className="font-semibold text-slate-200">Track Points:</span> 305,957 individual measurements
              </div>
              <div>
                <span className="font-semibold text-slate-200">Data Points:</span> Time, latitude, longitude, wind speed, pressure, category
              </div>

              <div className="pt-3">
                <p className="text-sm text-slate-400 mb-2">
                  IBTrACS is the authoritative source for historical and current tropical cyclone data, maintained by NOAA. 
                  Data comes from multiple agencies (UNISYS, JMA, CMA, others) harmonized into a unified format. This study 
                  uses maximum sustained wind speeds to track intensity over time and correlate with temperature anomalies.
                </p>
              </div>

              <div className="bg-slate-800/50 rounded p-3 border-l-2 border-purple-400">
                <a
                  href="https://www.ncei.noaa.gov/products/international-best-track-archive"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-purple-400 hover:text-purple-300 underline font-mono text-sm"
                >
                  ncei.noaa.gov/products/international-best-track-archive
                </a>
              </div>
            </div>
          </section>
        </div>

        {/* Processing Methodology */}
        <section className="bg-slate-900/50 border border-slate-600 rounded-lg p-6">
          <h3 className="text-lg font-bold text-white mb-4">Analysis Methodology</h3>

          <div className="space-y-4 text-slate-300">
            <div>
              <h4 className="font-semibold text-slate-200 mb-2">1. Data Consolidation</h4>
              <p className="text-sm ml-4 border-l border-slate-600 pl-4">
                79 NOAA StormEvents files (monthly gzip CSVs) were decompressed and merged into a single tornado dataset. 
                Duplicate records removed based on event date and location.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-slate-200 mb-2">2. Hurricane Shapefile Extraction</h4>
              <p className="text-sm ml-4 border-l border-slate-600 pl-4">
                IBTrACS shapefile data (.shp, .dbf format) was extracted using GeoPandas with pyogrio backend. All 
                geographic features and storm attributes converted to tabular CSV format for easier analysis.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-slate-200 mb-2">3. Temporal Aggregation</h4>
              <p className="text-sm ml-4 border-l border-slate-600 pl-4">
                Daily temperature data aggregated to annual averages. Tornado events counted and summed per year. 
                Hurricane data aggregated to annual maximums and averages of wind speed, pressure, and point density.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-slate-200 mb-2">4. Overlap Period Selection</h4>
              <p className="text-sm ml-4 border-l border-slate-600 pl-4">
                All three datasets merged on year field. Temperature (1880+) and tornado (1950+) data fully overlap. 
                Hurricane data begins 1980, creating three analysis windows: 1950-1980 (tornado-temp), 1980-2025 (all three).
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-slate-200 mb-2">5. Correlation Calculation</h4>
              <p className="text-sm ml-4 border-l border-slate-600 pl-4">
                Pearson correlation coefficients computed between temperature anomalies and: (a) tornado frequency, 
                (b) tornado deaths, (c) max hurricane wind speed, (d) average hurricane wind speed. Range: -1.0 to +1.0.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-slate-200 mb-2">6. Visualization</h4>
              <p className="text-sm ml-4 border-l border-slate-600 pl-4">
                Canvas-based spiral plot maps hurricane data (1980-2025) in polar coordinates: radius = year, 
                angle = month (60° per month), point size = wind speed, color = Saffir-Simpson category.
              </p>
            </div>
          </div>
        </section>

        {/* Data Quality Notes */}
        <section className="bg-amber-900/20 border border-amber-600/30 rounded-lg p-6">
          <h3 className="text-lg font-bold text-amber-100 mb-4">Data Quality & Limitations</h3>

          <ul className="space-y-2 text-slate-300 text-sm">
            <li className="flex gap-2">
              <span className="text-amber-400">⚠️</span>
              <span><strong>Completeness:</strong> Tornado reporting improved significantly post-1990. Early frequency numbers likely undercount.</span>
            </li>
            <li className="flex gap-2">
              <span className="text-amber-400">⚠️</span>
              <span><strong>Geographic Bias:</strong> Data covers US territory only. Global storms (Atlantic/Pacific) included; Indian Ocean excluded.</span>
            </li>
            <li className="flex gap-2">
              <span className="text-amber-400">⚠️</span>
              <span><strong>Instrumentation:</strong> Early storm measurements less precise than satellite-era data (post-1970s).</span>
            </li>
            <li className="flex gap-2">
              <span className="text-amber-400">⚠️</span>
              <span><strong>Correlation ≠ Causation:</strong> Statistical correlations show relationships, not necessarily direct cause-effect.</span>
            </li>
            <li className="flex gap-2">
              <span className="text-amber-400">⚠️</span>
              <span><strong>Confounding Factors:</strong> Population growth, urban development, improved detection also drive storm reporting increases.</span>
            </li>
          </ul>
        </section>

        {/* Processing Code */}
        <section className="bg-slate-900/50 border border-slate-600 rounded-lg p-6">
          <h3 className="text-lg font-bold text-white mb-4">Processing Tools</h3>

          <p className="text-slate-300 text-sm mb-4">
            All data processing performed in Python using open-source libraries:
          </p>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
            <div className="bg-slate-800/50 p-3 rounded border border-slate-700">
              <div className="font-mono text-green-400">pandas</div>
              <div className="text-slate-400">Data frame operations, merging, aggregation</div>
            </div>
            <div className="bg-slate-800/50 p-3 rounded border border-slate-700">
              <div className="font-mono text-blue-400">geopandas</div>
              <div className="text-slate-400">Shapefile reading, geographic data</div>
            </div>
            <div className="bg-slate-800/50 p-3 rounded border border-slate-700">
              <div className="font-mono text-purple-400">pyogrio</div>
              <div className="text-slate-400">Geospatial I/O, vector format support</div>
            </div>
            <div className="bg-slate-800/50 p-3 rounded border border-slate-700">
              <div className="font-mono text-orange-400">scipy</div>
              <div className="text-slate-400">Statistical analysis, correlation</div>
            </div>
            <div className="bg-slate-800/50 p-3 rounded border border-slate-700">
              <div className="font-mono text-red-400">numpy</div>
              <div className="text-slate-400">Numerical computation, arrays</div>
            </div>
            <div className="bg-slate-800/50 p-3 rounded border border-slate-700">
              <div className="font-mono text-cyan-400">matplotlib</div>
              <div className="text-slate-400">Static visualization and plotting</div>
            </div>
          </div>
        </section>

        {/* Downloads */}
        <section className="bg-slate-900/50 border border-slate-600 rounded-lg p-6">
          <h3 className="text-lg font-bold text-white mb-4">Project Files</h3>
          <p className="text-slate-300 text-sm mb-4">
            Download the full project bundle with all files needed to recreate the Story5 site locally, including data,
            processing scripts, and a step-by-step README.
          </p>
          <a
            href="/artifacts/Story5.zip"
            className="inline-flex items-center rounded-md bg-slate-700 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-600"
          >
            Download Story5 Project (ZIP)
          </a>
        </section>

        {/* Attribution */}
        <section className="bg-slate-900/50 border border-slate-600 rounded-lg p-6">
          <h3 className="text-lg font-bold text-white mb-4">Attribution & Acknowledgments</h3>

          <p className="text-slate-300 mb-4">
            This analysis is a student project for data science and climate education. All data comes from official 
            US government sources:
          </p>

          <ul className="space-y-2 text-slate-300 text-sm">
            <li>• <strong>NASA GISS:</strong> Part of NOAA's climate monitoring and research mission</li>
            <li>• <strong>NOAA NCEI:</strong> National Centers for Environmental Information, part of the National Weather Service</li>
            <li>• <strong>NOAA IBTrACS:</strong> International partnership archiving tropical cyclone data since 1851</li>
          </ul>

          <div className="mt-4 pt-4 border-t border-slate-600 text-slate-400 text-xs">
            <p>Project created as part of CUNY Data Science curriculum. Data sources and methods follow scientific standards.</p>
          </div>
        </section>
      </div>
    </Story5Shell>
  );
}
