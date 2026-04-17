import Story5Shell from "@/components/Story5Shell";

export default function Story5Intro() {
  return (
    <Story5Shell
      currentPath="/608/Story5/intro"
      title="How Do Rising Temperatures Drive Cyclonic Storms?"
      subtitle="We have 75+ years of data, but this story focuses on the most recent 30 years to highlight modern trends."
    >
      <div className="space-y-3">
        <section className="flex flex-col justify-center">
          <div className="max-w-3xl">
            <h2 className="text-lg font-semibold text-white">
              Strong warming trend correlates with increased storm activity and intensity.
            </h2>
            <p className="mt-3 text-sm leading-6 text-slate-300">
              This story connects 75+ years of data (NASA temperature anomalies, NOAA tornadoes, IBTrACS hurricanes). For clarity and relevance, we focus on the most recent 30 years to highlight modern trends in storm activity.
            </p>
            <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-300">
              <span className="rounded-full bg-blue-900/40 border border-blue-600/50 px-3 py-1">
                Temp-Tornado: 0.852
              </span>
              <span className="rounded-full bg-purple-900/40 border border-purple-600/50 px-3 py-1">
                Temp-Hurricane wind: 0.515
              </span>
              <span className="rounded-full bg-red-900/40 border border-red-600/50 px-3 py-1">
                Data: 1950–2025
              </span>
            </div>
          </div>
        </section>

        <div className="border-t border-slate-700 pt-3">
          <div className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-3">
            7-Slide Journey
          </div>
          <ol className="space-y-1 text-xs leading-relaxed text-slate-300">
            <li><strong className="text-slate-200">1. Opening</strong></li>
            <li><strong className="text-blue-400">2. Intro</strong> — Why this story matters</li>
            <li><strong className="text-purple-400">3. Spirals</strong> — Interactive hurricane intensity spiral (1980-2025)</li>
            <li><strong className="text-green-400">4. Trends</strong> — Temperature, tornado, and hurricane long-term trends</li>
            <li><strong className="text-orange-400">5. Correlations</strong> — Statistical relationships between variables</li>
            <li><strong className="text-yellow-400">6. Analysis</strong> — Key statistics and findings</li>
            <li><strong className="text-slate-400">7. Sources</strong> — Data sources and methodology</li>
          </ol>
        </div>
      </div>
    </Story5Shell>
  );
}
