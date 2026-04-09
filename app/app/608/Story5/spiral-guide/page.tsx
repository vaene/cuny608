'use client';

import Story5Shell from "@/components/Story5Shell";

export default function SpiralGuidePage() {
  return (
    <Story5Shell
      currentPath="/608/Story5/spiral-guide"
      title="Understanding the Spiral"
      subtitle="How to read and interpret the NASA-inspired climate spiral visualization."
    >
      <div className="space-y-4">
        {/* Core Dimensions */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-slate-800/60 border border-slate-600 rounded-lg p-4">
            <div className="text-blue-300 font-semibold text-sm mb-2">📈 Time Dimension</div>
            <p className="text-slate-300 text-xs leading-relaxed">
              The spiral radiates outward from center to edge. Each ring represents one year: 1980 at the center, 2025 at the outer edge. This efficient circular layout displays 45+ years of data without overlapping.
            </p>
          </div>

          <div className="bg-slate-800/60 border border-slate-600 rounded-lg p-4">
            <div className="text-orange-300 font-semibold text-sm mb-2">🌪️ Intensity (Color)</div>
            <p className="text-slate-300 text-xs leading-relaxed">
              Colors encode hurricane wind speed using the Saffir-Simpson scale: yellow (tropical storm 39+ mph) → orange (Cat 1-2) → red (Cat 3-4) → dark red/purple (Cat 5 175+ mph). Darker = stronger storms.
            </p>
          </div>

          <div className="bg-slate-800/60 border border-slate-600 rounded-lg p-4">
            <div className="text-green-300 font-semibold text-sm mb-2">📅 Seasonal Cycle</div>
            <p className="text-slate-300 text-xs leading-relaxed">
              Each 60° wedge represents one month of the hurricane season (June through November in Northern Hemisphere). 6 months = 6 wedges = 360°. The spiral "grows" through the season.
            </p>
          </div>

          <div className="bg-slate-800/60 border border-slate-600 rounded-lg p-4">
            <div className="text-purple-300 font-semibold text-sm mb-2">• Size (Wind Speed)</div>
            <p className="text-slate-300 text-xs leading-relaxed">
              Each dot represents one hurricane track point. Larger dots = faster winds. Position: distance from center = time, angle from vertical = month. Clustering = multiple storms in same month/year.
            </p>
          </div>
        </div>

        {/* How to Read It */}
        <div className="bg-slate-900/40 border border-slate-700 rounded-lg p-4">
          <div className="text-slate-200 font-semibold text-sm mb-3">How to Interpret Patterns</div>
          <div className="grid grid-cols-2 gap-3 text-xs text-slate-300">
            <div className="flex items-start gap-2">
              <span className="text-blue-400 font-bold flex-shrink-0 mt-0.5">→</span>
              <span><strong>Denser outer rings:</strong> More storms in recent years</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-orange-400 font-bold flex-shrink-0 mt-0.5">→</span>
              <span><strong>More red/purple:</strong> Stronger storms becoming more common</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-green-400 font-bold flex-shrink-0 mt-0.5">→</span>
              <span><strong>September bias:</strong> Densest clustering at 270° (peak season)</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-purple-400 font-bold flex-shrink-0 mt-0.5">→</span>
              <span><strong>Spiral "swells":</strong> Some years show much more storm activity</span>
            </div>
          </div>
        </div>

        {/* Comparison */}
        <div className="bg-blue-900/20 border border-blue-600/30 rounded-lg p-4">
          <div className="text-blue-200 font-semibold text-sm mb-2">Why This Design?</div>
          <p className="text-slate-300 text-xs leading-relaxed">
            Traditional line charts force time left-to-right, wasting space. By using polar coordinates, the spiral fits years of seasonal data without scrolling. Pattern recognition becomes visual: you can immediately see if recent years look "different" (more intense or frequent) than historical years.
          </p>
        </div>
      </div>
    </Story5Shell>
  );
}
