# Story 4: Data Practitioner Salary Analysis - JavaScript Framework

This folder contains utilities and data files to integrate the salary analysis into the Story 1 Next.js framework (chartjs-nextjs).

## Files

### Core Utility
- **salaryDataUtils.js** - JavaScript utility library for loading, transforming, and formatting salary data
  - `loadJSON()` - Load JSON data files
  - `loadCSV()` - Load and parse CSV files
  - `loadSalarySummaries()` - Load all salary data at once
  - Chart transformation functions (heatmaps, bar charts)
  - Color and formatting helpers

### Data Files
- **salary-by-role.json** - Average, median, and count by role (Data Scientist, Data Engineer, etc.)
- **salary-by-level-role.json** - Salary matrix: Career Levels × Roles
- **salary-by-region.json** - Average, median, and count by geographic region (including Remote)
- **salary-region-role.json** - Salary matrix: Regions × Roles

### Example Component
- **example-salary-page.tsx** - React component showing how to use the utilities with Chart.js

## Integration with Story 1 Framework

### Setup Steps

1. **Copy files to chartjs-nextjs project:**
   ```bash
   cp salaryDataUtils.js chartjs-nextjs/lib/
   cp salary-*.json chartjs-nextjs/public/data/
   ```

2. **Create salary pages in app folder:**
   ```bash
   mkdir -p chartjs-nextjs/app/salary
   mkdir -p chartjs-nextjs/app/salary-region
   mkdir -p chartjs-nextjs/app/salary-level
   ```

3. **Create your pages** based on `example-salary-page.tsx`, adapting for different visualizations:
   - `app/salary/page.tsx` - Basic role comparison
   - `app/salary-region/page.tsx` - Regional analysis
   - `app/salary-level/page.tsx` - Level × Role heatmap

4. **Add navigation** to the main story intro page

## Usage Examples

### In a React Component

```typescript
import { loadJSON, formatCurrency, getRoleColor } from '@/lib/salaryDataUtils';

export default function SalaryChart() {
  useEffect(async () => {
    // Load salary data
    const data = await loadJSON('/data/salary-by-role.json');
    
    // Format for display
    data.forEach(record => {
      console.log(`${record.role}: ${formatCurrency(record.mean)}`);
      console.log(`  Color: ${getRoleColor(record.role)}`);
    });
  }, []);
}
```

### Transforming Data for Charts

```typescript
import { transformForRoleBarChart, transformForRegionBarChart } from '@/lib/salaryDataUtils';

// For bar charts
const roleChartData = transformForRoleBarChart(salaryByRole);
const regionChartData = transformForRegionBarChart(salaryByRegion);

// Use with Chart.js
const chart = new ChartJS(ctx, {
  type: 'bar',
  data: roleChartData,
  // ... chart config
});
```

### Heatmap Visualizations

```typescript
import { transformForRegionRoleHeatmap, transformForLevelRoleHeatmap } from '@/lib/salaryDataUtils';

// Region × Role matrix
const regionRole = await loadJSON('/data/salary-region-role.json');
const heatmapData = transformForRegionRoleHeatmap(regionRole);
// heatmapData.regionLabels - ["Northeast", "West", ...]
// heatmapData.roleLabels - ["Data Scientist", ...]
// heatmapData.matrix - 2D array of salary values
```

## Generating Data from Python Notebook

To regenerate the JSON data files from your Python analysis:

1. Run the notebook cells up through the summary calculations
2. Export each summary to JSON:

```python
# In the notebook
import json

salary_by_role.to_json('salary-by-role.json', orient='records')
salary_by_level_role.to_json('salary-by-level-role.json', orient='split')
salary_by_region.to_json('salary-by-region.json', orient='records')
salary_region_role.to_json('salary-region-role.json', orient='split')
```

Then copy the generated files to `chartjs-nextjs/public/data/`

## Color Scheme

The utilities provide consistent colors across visualizations:

**Roles:**
- Data Scientist: Indigo (#6366F1)
- Data Engineer: Pink (#EC4899)
- Data Analyst: Amber (#F59E0B)
- Data Architect: Purple (#8B5CF6)
- Business Analyst: Green (#10B981)

**Levels:**
- Junior: Amber (#FBBF24)
- Mid-Level: Blue (#60A5FA)
- Senior: Emerald (#34D399)

**Regions:**
- Northeast: Blue (#2563EB)
- Southeast: Red (#DC2626)
- Midwest: Green (#16A34A)
- Southwest: Orange (#EA580C)
- West: Violet (#7C3AED)
- Remote: Purple (#8B5CF6)

## Component Patterns

### Basic Bar Chart
```tsx
const config: ChartConfiguration<'bar'> = {
  type: 'bar',
  data: { labels, datasets: [...] },
  options: {
    responsive: true,
    plugins: {
      datalabels: {
        formatter: (value) => formatCurrency(value)
      }
    },
    scales: {
      x: {
        ticks: {
          callback: (value) => formatCurrency(value as number)
        }
      }
    }
  }
};
```

### Heatmap with Canvas
```tsx
// Use canvas-based rendering for heatmap
const imageData = ctx.createImageData(width, height);
// Fill with color values based on salary ranges
ctx.putImageData(imageData, 0, 0);
```

## Notes

- All salary values are in USD
- Data is aggregated by role, level, and region
- Remote is treated as a distinct geographic category
- Color functions prevent undefined roles/regions by returning a default gray color
- Utility functions are async where they involve fetching

## Next Steps

1. Create visualization pages for each analysis perspective
2. Add navigation between salary views
3. Integrate with story narrative and annotations
4. Export heatmaps as static images if needed
5. Test data accuracy against Python notebook calculations
