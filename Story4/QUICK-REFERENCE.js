// QUICK REFERENCE: Salary Data Utils

// ============================================================================
// LOADING DATA
// ============================================================================

// Load single JSON file
const data = await loadJSON('/data/salary-by-role.json');

// Load single CSV file
const csv = await loadCSV('/data/salaries.csv');

// Load all summaries at once
const {
  salary_by_role,
  salary_by_level_role,
  salary_by_region,
  salary_region_role
} = await loadSalarySummaries();


// ============================================================================
// FORMATTING FOR DISPLAY
// ============================================================================

// Currency formatting
formatCurrency(125450)              // "$125,450"
formatCurrencyCompact(125450)       // "$125K"

// Both handle null/undefined/NaN gracefully
formatCurrency(null)                // ""


// ============================================================================
// COLORS
// ============================================================================

// Get consistent colors
getRoleColor('Data Scientist')      // "#6366F1"
getLevelColor('Senior')             // "#34D399"
getRegionColor('West')              // "#7C3AED"

// Convert hex to RGBA for transparency
hexToRgba('#6366F1', 0.5)           // "rgba(99, 102, 241, 0.5)"


// ============================================================================
// DATA TRANSFORMATION FOR CHARTS
// ============================================================================

// Bar charts
const roleChart = transformForRoleBarChart(salary_by_role);
// Returns: { labels: [...], datasets: [...] }

const regionChart = transformForRegionBarChart(salary_by_region);
// Returns: { labels: [...], datasets: [...] }

// Heatmaps
const regionRoleHeat = transformForRegionRoleHeatmap(salary_region_role);
// Returns: { regionLabels: [...], roleLabels: [...], matrix: [[...]] }

const levelRoleHeat = transformForLevelRoleHeatmap(salary_by_level_role);
// Returns: { levelLabels: [...], roleLabels: [...], matrix: [[...]] }


// ============================================================================
// UTILITIES
// ============================================================================

// Calculate average
calculateAverage([100, 120, 140])   // 120

// Find min/max
findMinMax([100, 120, 140])         // { min: 100, max: 140 }


// ============================================================================
// EXAMPLE: React Component with Chart.js
// ============================================================================

import { useEffect, useRef, useState } from 'react';
import { Chart as ChartJS, BarController, BarElement, CategoryScale, LinearScale } from 'chart.js';
import { loadJSON, getRoleColor, formatCurrency } from '@/lib/salaryDataUtils';

ChartJS.register(BarController, BarElement, CategoryScale, LinearScale);

export default function SalaryChart() {
  const canvasRef = useRef(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const data = await loadJSON('/data/salary-by-role.json');
      
      new ChartJS(canvasRef.current, {
        type: 'bar',
        data: {
          labels: data.map(d => d.role),
          datasets: [{
            label: 'Average Salary',
            data: data.map(d => d.mean),
            backgroundColor: data.map(d => getRoleColor(d.role))
          }]
        },
        options: {
          plugins: {
            tooltip: {
              callbacks: {
                label: (ctx) => formatCurrency(ctx.raw)
              }
            }
          }
        }
      });

      setLoading(false);
    })();
  }, []);

  return (
    <div>
      <h1>Salary by Role</h1>
      {loading ? <p>Loading...</p> : <canvas ref={canvasRef} />}
    </div>
  );
}


// ============================================================================
// EXAMPLE: Table Component
// ============================================================================

import { useEffect, useState } from 'react';
import { loadJSON, formatCurrency } from '@/lib/salaryDataUtils';

export default function SalaryTable() {
  const [data, setData] = useState([]);

  useEffect(() => {
    loadJSON('/data/salary-by-region.json').then(d => 
      setData(d.sort((a, b) => b.mean - a.mean))
    );
  }, []);

  return (
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
        {data.map(d => (
          <tr key={d.region}>
            <td>{d.region}</td>
            <td>{formatCurrency(d.mean)}</td>
            <td>{formatCurrency(d.median)}</td>
            <td>{d.count}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}


// ============================================================================
// EXAMPLE: Heatmap with CSS
// ============================================================================

import { useEffect, useState } from 'react';
import { loadJSON, formatCurrency } from '@/lib/salaryDataUtils';

export default function SalaryHeatmap() {
  const [data, setData] = useState(null);

  useEffect(() => {
    loadJSON('/data/salary-by-level-role.json').then(setData);
  }, []);

  if (!data) return <p>Loading...</p>;

  const levels = ['Junior', 'Mid-Level', 'Senior'];
  const roles = Object.keys(data.Junior || {});
  const maxSalary = Math.max(
    ...levels.flatMap(l => roles.map(r => data[l]?.[r] || 0))
  );

  return (
    <div>
      <h1>Heatmap: Level × Role</h1>
      <table className="heatmap">
        <thead>
          <tr>
            <th></th>
            {roles.map(r => <th key={r}>{r}</th>)}
          </tr>
        </thead>
        <tbody>
          {levels.map(l => (
            <tr key={l}>
              <th>{l}</th>
              {roles.map(r => {
                const salary = data[l]?.[r] || 0;
                const intensity = salary / maxSalary;
                return (
                  <td
                    key={r}
                    style={{
                      backgroundColor: `rgba(99, 102, 241, ${intensity})`,
                      padding: '1rem',
                      textAlign: 'center'
                    }}
                  >
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


// ============================================================================
// CONSTANTS
// ============================================================================

// Available roles
AVAILABLE_ROLES = [
  'Data Scientist',
  'Data Engineer',
  'Data Analyst',
  'Data Architect',
  'Business Analyst'
];

// Available levels
AVAILABLE_LEVELS = ['Junior', 'Mid-Level', 'Senior'];

// Available regions (including Remote)
AVAILABLE_REGIONS = [
  'Northeast',
  'Southeast',
  'Midwest',
  'Southwest',
  'West',
  'Remote'
];


// ============================================================================
// TYPE GUARDS (TypeScript)
// ============================================================================

import type { 
  SalaryRecord, 
  SalaryMatrix, 
  BarChartData, 
  Role, 
  Level, 
  Region 
} from '@/lib/salaryTypes';

import {
  isSalaryRecord,
  isSalaryMatrix,
  validateSalarySummary
} from '@/lib/salaryTypes';

// Validate data structure
if (validateSalarySummary(data)) {
  const { salary_by_role } = data;
  // TypeScript knows salary_by_role is SalaryRecord[]
}

// Check individual record
if (isSalaryRecord(record)) {
  const avg: number = record.mean;
}


// ============================================================================
// COMMON PATTERNS
// ============================================================================

// Pattern: Load and display sorted list
const data = await loadJSON('/data/salary-by-role.json');
data
  .sort((a, b) => b.mean - a.mean)
  .forEach(d => console.log(`${d.role}: ${formatCurrency(d.mean)}`));

// Pattern: Find highest/lowest paying
const highest = data.reduce((a, b) => a.mean > b.mean ? a : b);
const lowest = data.reduce((a, b) => a.mean < b.mean ? a : b);

// Pattern: Calculate totals
const total = data.reduce((sum, d) => sum + d.mean * d.count, 0);
const avgAcrossAll = total / data.reduce((sum, d) => sum + d.count, 0);

// Pattern: Group relationships
const byRole = {};
data.forEach(d => {
  byRole[d.role] = d;
});

// Pattern: Compare regions
const byRegion = await loadJSON('/data/salary-by-region.json');
const westVsEast = {
  west: byRegion.find(r => r.region === 'West')?.mean,
  northeast: byRegion.find(r => r.region === 'Northeast')?.mean
};
const diff = westVsEast.west - westVsEast.northeast;
console.log(`West pays ${formatCurrency(Math.abs(diff))} more`);


// ============================================================================
// STYLING COLORS IN CSS/TAILWIND
// ============================================================================

/* Add to your CSS or Tailwind config */

:root {
  --color-data-scientist: #6366F1;
  --color-data-engineer: #EC4899;
  --color-data-analyst: #F59E0B;
  --color-data-architect: #8B5CF6;
  --color-business-analyst: #10B981;
  
  --color-junior: #FBBF24;
  --color-mid-level: #60A5FA;
  --color-senior: #34D399;
  
  --color-northeast: #2563EB;
  --color-southeast: #DC2626;
  --color-midwest: #16A34A;
  --color-southwest: #EA580C;
  --color-west: #7C3AED;
  --color-remote: #8B5CF6;
}

/* In components */
<div style={{ backgroundColor: 'var(--color-data-scientist)' }} />


// ============================================================================
// FILES & PATHS
// ============================================================================

salaryDataUtils.js              - Main utility library (import this)
salaryTypes.ts                  - TypeScript type definitions
salary-by-role.json             - Array of roles with salary stats
salary-by-level-role.json       - Nested: {level: {role: salary}}
salary-by-region.json           - Array of regions with salary stats
salary-region-role.json         - Nested: {region: {role: salary}}

export_salary_data.py           - Script to generate JSON from notebook
example-salary-page.tsx         - Example React component


// ============================================================================
// NOTES
// ============================================================================

// All salary values are in USD
// All data is aggregated statistics (no PII)
// Remote is treated as a distinct geographic region
// Levels are: Junior, Mid-Level, Senior
// No individual records, only aggregates (mean, median, count)
