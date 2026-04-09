/**
 * Example: How to use the Hurricane Spiral components in a Next.js page
 * File location: app/visualizations/hurricane-spiral/page.tsx
 */

'use client';

import HurricaneSpiralShowcase from '@/components/HurricaneSpiralShowcase';

/**
 * Option 1: Full Showcase (Recommended)
 */
export default function HurricaneSpiralPage() {
  return <HurricaneSpiralShowcase />;
}

/**
 * Option 2: Just the Animation Component
 * Replace above with:
 */
/*
import HurricaneSpiralAnimation from '@/components/HurricaneSpiralAnimation';

export default function HurricaneSpiralPage() {
  return <HurricaneSpiralAnimation />;
}
*/

/**
 * Option 3: Data-Driven Version (Real Data)
 * Replace above with:
 */
/*
import HurricaneSpiralDataDriven from '@/components/HurricaneSpiralDataDriven';

export default function HurricaneSpiralPage() {
  return <HurricaneSpiralDataDriven />;
}
*/

/**
 * Option 4: In a Slide Presentation
 * For NextJS slide format (like Story1/2)
 */
/*
import HurricaneSpiralAnimation from '@/components/HurricaneSpiralAnimation';

export default function Slide5ClimateStorms() {
  return (
    <div className="h-screen w-full flex flex-col">
      <div className="h-1/6 bg-gradient-to-r from-blue-900 to-purple-900 p-8 flex items-center">
        <div>
          <h1 className="text-4xl font-bold text-white">Hurricane Intensity Trends</h1>
          <p className="text-blue-100 text-lg">Rising Storm Strength with Global Temperature</p>
        </div>
      </div>
      
      <div className="flex-1 bg-slate-900">
        <HurricaneSpiralAnimation />
      </div>

      <div className="h-1/6 bg-slate-800 p-6 text-white">
        <h3 className="font-bold mb-2">Key Finding:</h3>
        <p>Wind speed and category intensities show strong upward trends, correlating with temperature anomalies (r=0.515)</p>
      </div>
    </div>
  );
}
*/

/**
 * Installation Steps:
 * 
 * 1. Copy component files:
 *    cp HurricaneSpiralAnimation.tsx app/components/
 *    cp HurricaneSpiralDataDriven.tsx app/components/
 *    cp HurricaneSpiralShowcase.tsx app/components/
 * 
 * 2. Copy data file:
 *    mkdir -p public/data
 *    cp data/hurricane_yearly_summary.csv public/data/
 * 
 * 3. Update tailwindcss if needed (already included in components)
 * 
 * 4. Create page.tsx and import component
 * 
 * 5. Run: npm run dev
 *    Visit: http://localhost:3000/visualizations/hurricane-spiral
 */

/**
 * Customization Examples:
 */

// Example: Limit animation speed in showcase
const FASTER_ANIMATION = `
// In HurricaneSpiralShowcase.tsx, modify interval:
setInterval(() => {
  setAnimationProgress((prev) => {
    return prev >= 1 ? 0 : prev + 0.01; // Changed from 0.005
  });
}, 50);
`;

// Example: Load different CSV file
const CUSTOM_DATA = `
const response = await fetch('/data/your-custom-data.csv');
// Then parse and use in component
`;

// Example: Embedded in slide deck
const SLIDE_INTEGRATION = `
// In your slide component
import HurricaneSpiralAnimation from '@/components/HurricaneSpiralAnimation';

<div className="slide">
  <HurricaneSpiralAnimation />
</div>
`;
