'use client';

import React, { useState } from 'react';
import HurricaneSpiralAnimation from './HurricaneSpiralAnimation';
import HurricaneSpiralDataDriven from './HurricaneSpiralDataDriven';

/**
 * Hurricane Spiral Visualization Showcase
 * Toggle between generated and data-driven versions
 */

const HurricaneSpiralShowcase: React.FC = () => {
  const [version, setVersion] = useState<'generated' | 'data'>('data');

  return (
    <div className="w-full min-h-screen bg-slate-950">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-900 to-purple-900 p-6 shadow-lg">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold text-white mb-2">
            Hurricane Intensity Spiral
          </h1>
          <p className="text-blue-100 text-lg">
            Visualizing cyclonic storm strength evolution inspired by NASA's Climate Spiral
          </p>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-slate-800 border-b border-slate-700 p-4 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto flex gap-4 items-center justify-between flex-wrap">
          <div className="flex gap-2">
            <button
              onClick={() => setVersion('data')}
              className={`px-4 py-2 rounded font-semibold transition ${
                version === 'data'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              📊 Real Data Version
            </button>
            <button
              onClick={() => setVersion('generated')}
              className={`px-4 py-2 rounded font-semibold transition ${
                version === 'generated'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              🔧 Generated Data Version
            </button>
          </div>

          <div className="text-slate-300 text-sm">
            {version === 'data' ? (
              <span>Loading real IBTrACS data...</span>
            ) : (
              <span>Using simulated hurricane data</span>
            )}
          </div>
        </div>
      </div>

      {/* Visualization */}
      <div className="bg-slate-900 min-h-screen">
        {version === 'data' ? (
          <HurricaneSpiralDataDriven />
        ) : (
          <HurricaneSpiralAnimation />
        )}
      </div>

      {/* Info Section */}
      <div className="bg-slate-900 border-t border-slate-700 p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          <div>
            <h2 className="text-3xl font-bold text-white mb-4">
              Understanding the Spiral
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-slate-800 p-6 rounded-lg">
                <h3 className="text-xl font-semibold text-blue-300 mb-3">
                  📈 Time Dimension
                </h3>
                <p className="text-slate-300">
                  The spiral progresses outward from the center, with each ring representing a year
                  (1980 at center to 2025 at edge). This radial layout efficiently displays 45+ years
                  of data in circular space.
                </p>
              </div>

              <div className="bg-slate-800 p-6 rounded-lg">
                <h3 className="text-xl font-semibold text-orange-300 mb-3">
                  🌪️ Intensity Dimension
                </h3>
                <p className="text-slate-300">
                  Colors indicate wind speed intensity using Saffir-Simpson scale: yellow (tropical
                  storm) → red (Category 3) → purple (Category 5). Point size correlates with wind speed magnitude.
                </p>
              </div>

              <div className="bg-slate-800 p-6 rounded-lg">
                <h3 className="text-xl font-semibold text-green-300 mb-3">
                  📅 Seasonal Cycle
                </h3>
                <p className="text-slate-300">
                  The spiral's radial sections represent hurricane season months (June-November in
                  Northern Hemisphere). Each 60-degree wedge = one month of the season.
                </p>
              </div>

              <div className="bg-slate-800 p-6 rounded-lg">
                <h3 className="text-xl font-semibold text-purple-300 mb-3">
                  🔍 Notable Patterns
                </h3>
                <p className="text-slate-300">
                  As you play the animation, watch for: increasing density of points (more storms),
                  shift toward warmer colors in recent years (stronger storms), and clustering in
                  certain months.
                </p>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-3xl font-bold text-white mb-4">
              Key Findings from This Visualization
            </h2>
            <div className="space-y-3 text-slate-300">
              <p className="flex items-start gap-3">
                <span className="text-blue-400 font-bold mt-1">→</span>
                <span>
                  <strong>Increasing Frequency:</strong> Recent years show denser point clouds,
                  indicating more storm systems tracked.
                </span>
              </p>
              <p className="flex items-start gap-3">
                <span className="text-blue-400 font-bold mt-1">→</span>
                <span>
                  <strong>Intensity Shift:</strong> Color progression toward warmer tones in outer
                  rings suggests higher intensity storms in recent decades.
                </span>
              </p>
              <p className="flex items-start gap-3">
                <span className="text-blue-400 font-bold mt-1">→</span>
                <span>
                  <strong>Correlation with Temperature:</strong> Earlier analysis showed 0.515
                  correlation between temperature anomaly and maximum hurricane wind speed.
                </span>
              </p>
              <p className="flex items-start gap-3">
                <span className="text-blue-400 font-bold mt-1">→</span>
                <span>
                  <strong>Season Patterns:</strong> Notice concentration variations across months—tropical
                  Atlantic typically peaks in September.
                </span>
              </p>
            </div>
          </div>

          <div>
            <h2 className="text-3xl font-bold text-white mb-4">
              Technical Details
            </h2>
            <div className="bg-slate-800 p-6 rounded-lg space-y-3 text-slate-300 font-mono text-sm">
              <p>
                <strong>Data Source:</strong> IBTrACS (International Best Track Archive) via NOAA
              </p>
              <p>
                <strong>Time Period:</strong> 1980-2025 (45 years of tropical cyclone data)
              </p>
              <p>
                <strong>Data Points:</strong> 305,957+ individual hurricane track positions
              </p>
              <p>
                <strong>Implementation:</strong> React + Canvas API with real-time animation
              </p>
              <p>
                <strong>Inspiration:</strong>{' '}
                <a
                  href="https://svs.gsfc.nasa.gov/5190"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:underline"
                >
                  NASA Climate Spiral
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-slate-950 border-t border-slate-700 p-4 text-center text-slate-500">
        <p>Story5 Climate & Storms Analysis | CUNY 608 Data Visualization</p>
      </div>
    </div>
  );
};

export default HurricaneSpiralShowcase;
