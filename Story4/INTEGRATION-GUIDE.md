# Story 4: Data Practitioner Salary Analysis - Integration Guide

This guide walks you through integrating the salary analysis into the Story 1 Next.js framework.

## Quick Start

### 1. Prepare Your Data

First, run the Python notebook analysis:

```bash
# Open data_practitioner_salary_analysis.ipynb
# Execute all cells through "Section 7. Summaries for analysis"
```

### 2. Export Data to JSON

At the end of the notebook, run the export to generate JSON files:

```python
from export_salary_data import export_salary_data

# After creating all the summaries:
export_salary_data(
    salary_by_role,
    salary_by_level_role,
    salary_by_region,
    salary_region_role,
    output_dir='path/to/Story1/chartjs-nextjs/public/data'
)
```

Or manually export each DataFrame:

```python
salary_by_role.to_json('salary-by-role.json', orient='records')
salary_by_level_role.to_json('salary-by-level-role.json')
salary_by_region.to_json('salary-by-region.json', orient='records')
salary_region_role.to_json('salary-region-role.json')
```

### 3. Set Up the Next.js Project

```bash
cd Story1/chartjs-nextjs

# Copy utility files
cp ../Story4/salaryDataUtils.js lib/
cp ../Story4/salaryTypes.ts lib/

# Copy data files
cp ../Story4/salary-*.json public/data/

# Create salary visualization directory
mkdir -p app/salary
mkdir -p app/salary-region
mkdir -p app/salary-level
```

### 4. Create Visualization Pages

Copy and adapt `example-salary-page.tsx` for your pages:

```bash
cp ../Story4/example-salary-page.tsx app/salary/page.tsx
# Edit to fit your needs
```

## File Structure

```
Story1/chartjs-nextjs/
├── app/
│   ├── page.tsx               # Home/intro
│   ├── salary/
│   │   └── page.tsx           # Role comparison
│   ├── salary-region/
│   │   └── page.tsx           # Regional analysis
│   ├── salary-level/
│   │   └── page.tsx           # Level × Role heatmap
│   └── ... (other existing pages)
├── public/
│   └── data/
│       ├── salary-by-role.json
│       ├── salary-by-level-role.json
│       ├── salary-by-region.json
│       ├── salary-region-role.json
│       └── ... (existing Story 1 data)
└── lib/
    ├── salaryDataUtils.js
    └── salaryTypes.ts
```

## Component Examples

### Page 1: Role Comparison

```tsx
'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { Chart as ChartJS, BarController, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js';
import { loadJSON, formatCurrency, getRoleColor } from '@/lib/salaryDataUtils';

ChartJS.register(BarController, BarElement, CategoryScale, LinearScale, Tooltip, Legend);

export default function SalaryRolePage() {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const data = await loadJSON('/data/salary-by-role.json');
      
      const config = {
        type: 'bar' as const,
        data: {
          labels: data.map(d => d.role),
          datasets: [{
            label: 'Average Salary',
            data: data.map(d => d.mean),
            backgroundColor: data.map(d => getRoleColor(d.role))
          }]
        },
        options: {
          responsive: true,
          plugins: {
            tooltip: {
              callbacks: {
                label: (ctx: any) => formatCurrency(ctx.raw)
              }
            }
          }
        }
      };

      new ChartJS(chartRef.current!, config);
      setLoading(false);
    };

    load();
  }, []);

  return (
    <div>
      <h1>Salary by Role</h1>
      {loading ? <p>Loading...</p> : <canvas ref={chartRef} />}
    </div>
  );
}
```

### Page 2: Regional Analysis

```tsx
'use client';

import { useState, useEffect } from 'react';
import { loadJSON, formatCurrency, getRegionColor } from '@/lib/salaryDataUtils';

export default function SalaryRegionPage() {
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    loadJSON('/data/salary-by-region.json').then(setData);
  }, []);

  return (
    <div>
      <h1>Salary by Region</h1>
      <table>
        <thead>
          <tr>
            <th>Region</th>
            <th>Average</th>
            <th>Median</th>
            <th>Count</th>
          </tr>
        </thead>
        <tbody>
          {data.sort((a, b) => b.mean - a.mean).map(d => (
            <tr key={d.region}>
              <td>{d.region}</td>
              <td>{formatCurrency(d.mean)}</td>
              <td>{formatCurrency(d.median)}</td>
              <td>{d.count}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

### Page 3: Heatmap (Level × Role)

```tsx
'use client';

import { useState, useEffect } from 'react';
import { loadJSON, formatCurrency, getLevelColor, getRoleColor } from '@/lib/salaryDataUtils';

export default function SalaryLevelPage() {
  const [levelRole, setLevelRole] = useState<any>(null);

  useEffect(() => {
    loadJSON('/data/salary-by-level-role.json').then(setLevelRole);
  }, []);

  if (!levelRole) return <p>Loading...</p>;

  const levels = ['Junior', 'Mid-Level', 'Senior'];
  const roles = Object.keys(levelRole.Junior || {});

  const maxSalary = Math.max(
    ...levels.flatMap(l => roles.map(r => levelRole[l]?.[r] || 0))
  );

  return (
    <div>
      <h1>Salary by Level and Role</h1>
      <table>
        <thead>
          <tr>
            <th>Level</th>
            {roles.map(r => <th key={r}>{r}</th>)}
          </tr>
        </thead>
        <tbody>
          {levels.map(l => (
            <tr key={l}>
              <td>{l}</td>
              {roles.map(r => {
                const salary = levelRole[l]?.[r];
                const intensity = salary ? salary / maxSalary : 0;
                return (
                  <td key={r} style={{
                    backgroundColor: `rgba(99, 102, 241, ${intensity * 0.6})`,
                    padding: '1rem',
                    textAlign: 'center'
                  }}>
                    {formatCurrency(salary)}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

## Data Flow

```
Python Notebook (data_practitioner_salary_analysis.ipynb)
    ↓
    ↓ (execute cells 1-7)
    ↓
summary DataFrames created
    ↓
    ↓ (export_salary_data.py)
    ↓
JSON files
    ↓
    ↓ (copy to public/data/)
    ↓
Next.js Frontend
    ↓
    ↓ (fetch via loadJSON())
    ↓
React Components
    ↓
    ↓ (render with Chart.js)
    ↓
Web Visualizations
```

## Key Functions Reference

### Data Loading
```typescript
loadJSON(path: string): Promise<any>
loadCSV(path: string): Promise<Array<Object>>
loadSalarySummaries(): Promise<SalarySummary>
```

### Formatting
```typescript
formatCurrency(value: number): string          // "$125,450"
formatCurrencyCompact(value: number): string   // "$125K"
```

### Colors
```typescript
getRoleColor(role: Role): string
getLevelColor(level: Level): string
getRegionColor(region: Region): string
hexToRgba(hex: string, alpha: number): string
```

### Data Transformation
```typescript
transformForRoleBarChart(data: SalaryRecord[]): BarChartData
transformForRegionBarChart(data: SalaryRecord[]): BarChartData
transformForRegionRoleHeatmap(data: SalaryMatrix): HeatmapData
transformForLevelRoleHeatmap(data: SalaryMatrix): HeatmapData
```

### Utilities
```typescript
calculateAverage(values: number[]): number
findMinMax(values: number[]): { min: number; max: number }
```

## Animation Settings

Match Story 1's animation style:

```typescript
const ANIM = {
  barDurationMs: 850,
  perBarStaggerMs: 35,
  labelLagMs: 120
};

// In Chart.js config:
animation: {
  duration: ANIM.barDurationMs,
  delay: (context) => {
    if (context.type !== 'data') return 0;
    return context.dataIndex * ANIM.perBarStaggerMs;
  }
}
```

## Navigation

Add links between salary pages in your main story:

```tsx
<nav>
  <Link href="/salary">By Role</Link>
  <Link href="/salary-region">By Region</Link>
  <Link href="/salary-level">By Level</Link>
</nav>
```

## Troubleshooting

### Data not loading
- Check that JSON files are in `public/data/`
- Verify file paths match exactly (case-sensitive)
- Open browser dev tools to see fetch errors

### Chart not rendering
- Make sure ChartJS plugins are registered
- Check that canvas ref is properly attached
- Verify data structure matches Chart.js expectations

### Type errors
- Import types from `salaryTypes.ts`
- Use type guards like `isSalaryRecord()` before accessing data
- Enable strict mode in tsconfig.json

### Colors not showing
- Verify color hex codes are valid
- Check CSS/tailwind conflicts
- Use `hexToRgba()` for transparency

## Next Steps

1. Create all visualization pages
2. Add story narrative and annotations
3. Link to/from other Story 1 pages
4. Export static images for presentations
5. Update README with new salary insights
6. Deploy to similar environment as Story 1

## Resources

- Chart.js documentation: https://www.chartjs.org/
- Next.js docs: https://nextjs.org/docs
- Python pandas JSON export: https://pandas.pydata.org/docs/reference/api/pandas.DataFrame.to_json.html
