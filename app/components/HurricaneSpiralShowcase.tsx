'use client';

import React from 'react';
import Story5TripleSpiral from './Story5TripleSpiral';

/**
 * Hurricane Spiral Visualization - Real Data Only
 */

const HurricaneSpiralShowcase: React.FC = () => {
  return (
    <div className="w-full flex flex-col items-center justify-center py-4">
      <div className="w-full max-w-6xl bg-slate-900 rounded border border-slate-700 p-4">
        <Story5TripleSpiral />
      </div>
    </div>
  );
};

export default HurricaneSpiralShowcase;
