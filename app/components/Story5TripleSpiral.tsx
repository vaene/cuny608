'use client';

import React from 'react';
import ClimateSpiralAnimation from './ClimateSpiralAnimation';
import TornadoSpiralAnimation from './TornadoSpiralAnimation';
import HurricaneSpiralVisual from './HurricaneSpiralVisual';

const Story5TripleSpiral: React.FC = () => {
  return (
    <div className="w-full grid grid-cols-1 lg:grid-cols-3 gap-4">
      <div className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3">
        <div className="text-xs font-semibold text-slate-300 uppercase tracking-wide mb-2">
          Temperature Spiral
        </div>
        <ClimateSpiralAnimation compact />
      </div>

      <div className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3">
        <div className="text-xs font-semibold text-slate-300 uppercase tracking-wide mb-2">
          Tornado Spiral
        </div>
        <TornadoSpiralAnimation compact />
      </div>

      <div className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3">
        <div className="text-xs font-semibold text-slate-300 uppercase tracking-wide mb-2">
          Hurricane Spiral
        </div>
        <HurricaneSpiralVisual compact />
      </div>
    </div>
  );
};

export default Story5TripleSpiral;
