# Hurricane Intensity Spiral - Implementation Guide

## Overview

Three React components for visualizing hurricane intensity evolution, inspired by NASA's Climate Spiral visualization.

## Components

### 1. HurricaneSpiralAnimation.tsx
**Pure visualization with generated data**
- Self-contained Canvas animation
- Generates realistic hurricane data for 1980-2025
- Play/pause controls
- Year slider for manual exploration
- Color-coded by Saffir-Simpson categories

**Features:**
- Automatic animation loop
- Interactive slider
- Legend showing category colors
- Stats panel

### 2. HurricaneSpiralDataDriven.tsx
**Real hurricane data visualization**
- Loads from CSV (hurricane_yearly_summary.csv)
- Falls back to generated data if CSV unavailable
- Loads actual IBTrACS statistics
- Shows real-time data statistics
- Better for production use

**Features:**
- CSV data integration
- Live statistics panel
- Responsive to data loading
- Professional appearance

### 3. HurricaneSpiralShowcase.tsx
**Full-featured presentation component**
- Toggle between generated and data versions
- Comprehensive educational content
- Technical documentation
- Key findings explanation
- High-school appropriate explanations

## Integration Steps

### Setup in Next.js Project

```bash
# 1. Copy components to your app directory
cp HurricaneSpiralAnimation.tsx app/components/
cp HurricaneSpiralDataDriven.tsx app/components/
cp HurricaneSpiralShowcase.tsx app/components/

# 2. Copy data files to public folder
mkdir -p public/data
cp data/*.csv public/data/
```

### Create Page Component

```typescript
// app/hurricane-spiral/page.tsx
import HurricaneSpiralShowcase from '@/components/HurricaneSpiralShowcase';

export default function HurricaneSpiralPage() {
  return <HurricaneSpiralShowcase />;
}
```

### Alternative: Standalone Component

```typescript
// For use in slide presentations
import HurricaneSpiralAnimation from '@/components/HurricaneSpiralAnimation';

export default function Slide5() {
  return (
    <div className="h-screen w-full">
      <HurricaneSpiralAnimation />
    </div>
  );
}
```

## Visualization Anatomy

```
┌─────────────────────────────────┐
│   HURRICANE INTENSITY SPIRAL    │
├─────────────────────────────────┤
│                                 │
│        2025 (Outer Ring)        │
│      ╱        ╲                 │
│     │           │               │
│     │  SPIRAL   │  Each ring    │
│     │  VISUAL   │  = 1 year     │
│     │           │               │
│      ╲        ╱                 │
│       1980 (Center)             │
│                                 │
│  Colors: Intensity (Yellow→    │
│          Orange→Red→Purple      │
│  Sizes: Wind speed magnitude    │
│  Sections: Seasons (Jun-Nov)    │
│                                 │
└─────────────────────────────────┘
```

## Color Scheme (Saffir-Simpson Scale)

| Wind Speed | Category | Color | Hex |
|------------|----------|-------|-----|
| 39-73 mph | Tropical Storm | Yellow | #FFEB3B |
| 74-95 mph | Category 1 | Orange | #FF9800 |
| 96-110 mph | Category 2 | Deep Orange | #FF5722 |
| 111-129 mph | Category 3 | Red | #D32F2F |
| 130-156 mph | Category 4 | Dark Red | #B71C1C |
| 157+ mph | Category 5 | Purple | #7B1FA2 |

## Data Requirements

### For CSV Mode (HurricaneSpiralDataDriven)

**hurricane_yearly_summary.csv columns:**
```
year,hurricane_count,avg_wind,max_wind,avg_pressure,min_pressure
1980,107,100.2,165,985.1,890
1981,102,99.8,163,985.5,892
...
```

**Location:** `/public/data/hurricane_yearly_summary.csv`

### For Generated Mode

No external data needed - generates realistic hurricane patterns with warming trend.

## Interactive Features

### Play/Pause Button
- Animates through 1980-2025
- Loops automatically
- Shows current year

### Year Slider
- Manual exploration
- Exact year selection
- Play pauses automatically

### Reset Button
- Returns to 1980
- Clears animation state

## Learning Outcomes

Students using this visualization understand:
1. **Temporal Patterns**: How to read 45+ years of data in spiral format
2. **Intensity Evolution**: Color coding shows storm strength trends
3. **Seasonal Cycles**: Why hurricane season concentrates certain months
4. **Climate Connection**: Visual correlation between years (outer = warming trend)
5. **Data Density**: Recent years show more frequent storms

## High School Appropriate Explanations

### Simple Version
> "This spiral shows hurricane strength from 1980 to 2025. Each ring is one year, getting wider as time goes on. Colors show how strong storms are—yellow and orange are weak, red is strong, purple is very strong."

### Intermediate Version
> "The hurricane spiral displays 45 years of storm intensity data in a circular timeline. As you move outward from the center, you're moving forward in time. The color gets warmer (red/purple) as hurricanes get stronger. You can see that in recent years, there are more red/purple colors, meaning stronger storms are becoming more common."

### Advanced Version
> "This spiral visualization maps hurricane-strength data onto polar coordinates, where the radius represents time (1980-2026) and the angle represents the season (June-November). Each point's color indicates wind speed intensity using the Saffir-Simpson scale, and point size represents wind magnitude. The animation reveals a clear trend: increasing storm frequency and intensity in recent decades correlates with rising global temperatures (correlation coefficient: 0.515)."

## Customization Options

### Change Speed
```typescript
// In animation interval
setInterval(() => {
  setAnimationProgress(prev => prev + 0.005); // Increase for faster
}, 50);
```

### Change Colors
```typescript
const getColorForWindSpeed = (windSpeed: number): string => {
  // Modify color thresholds here
  if (windSpeed < 74) return '#FFEB3B'; // Change this color
  // ...
};
```

### Change Data Range
```typescript
// Modify in data loading
const startYear = 1980; // Change this
const endYear = 2025;   // Or this
```

## Performance Considerations

- **Canvas rendering**: Efficient even with 300K+ data points
- **Animation frame rate**: 50ms interval = 20 FPS (smooth)
- **Memory**: ~5-10MB for all data and visualization
- **Browser support**: Chrome, Firefox, Safari, Edge (all modern versions)

## Alternatives & Extensions

### D3.js Version
For interactive hover tooltips and zoom:
```bash
npm install d3 d3-selection
```

### Three.js Version
For 3D spiral visualization with rotation

### SVG Version
For vector-based rendering (better text quality)

## References

- **NASA Climate Spiral**: https://svs.gsfc.nasa.gov/5190
- **IBTrACS Data**: https://www.ncei.noaa.gov/products/international-best-track-archive
- **Saffir-Simpson Scale**: https://www.nhc.noaa.gov/aboutsshws.php

## File Structure

```
Story5/notebooks/
├── HurricaneSpiralAnimation.tsx      (Component - generated data)
├── HurricaneSpiralDataDriven.tsx     (Component - real data)
├── HurricaneSpiralShowcase.tsx       (Full showcase with docs)
└── HURRICANE_SPIRAL_GUIDE.md         (This file)

Story5/
├── data/
│   ├── hurricane_yearly_summary.csv
│   ├── climate_storms_analysis.csv
│   └── ibtrac_hurricane_data.csv
└── public/data/
    └── hurricane_yearly_summary.csv  (Copy here for web access)
```

## Troubleshooting

### Data Not Loading
- Check browser console for errors
- Verify CSV exists at `/public/data/hurricane_yearly_summary.csv`
- Component falls back to generated data automatically

### Animation Stuttering
- Reduce number of data points
- Increase animation interval (50ms → 100ms)
- Use generated data mode instead of CSV

### Colors Not Displaying
- Verify browser supports Canvas 2D context
- Check color hex values are valid
- Test in different browser

## License & Attribution

Components inspired by NASA's Climate Spiral visualization by Mark SubbaRao and Ed Hawkins.
Hurricane data from NOAA's IBTrACS archive.

---

**Created for:** CUNY 608 Data Visualization - Story5 Climate & Storms Analysis
**Date:** April 3, 2026
