'use client';

/**
 * Example component showing how to use salaryDataUtils with the Story 1 Next.js framework
 * 
 * To use this in your chartjs-nextjs app/salary/ folder:
 * 1. Copy this file to app/salary/page.tsx
 * 2. Copy salaryDataUtils.js to a lib/ or utils/ folder
 * 3. Update imports as needed for your project structure
 */

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import {
  Chart as ChartJS,
  BarController,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  ChartConfiguration
} from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';

ChartJS.register(BarController, BarElement, CategoryScale, LinearScale, Tooltip, Legend, ChartDataLabels);

// Import from your utils folder
import {
  loadJSON,
  formatCurrency,
  getRoleColor,
  getRegionColor,
  transformForRoleBarChart,
  transformForRegionBarChart,
  hexToRgba
} from '@/lib/salaryDataUtils';

export default function SalaryRolePage() {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const chartInstance = useRef<ChartJS | null>(null);

  const ANIM = {
    barDurationMs: 850,
    perBarStaggerMs: 35,
    labelLagMs: 120
  };

  useEffect(() => {
    const loadAndRender = async () => {
      try {
        setLoading(true);
        const salaryByRole = await loadJSON('/data/salary-by-role.json');
        
        if (!chartRef.current) return;

        // Transform data for chart
        const { labels, datasets } = transformForRoleBarChart(salaryByRole);

        // Create bar chart
        const config: ChartConfiguration<'bar'> = {
          type: 'bar',
          data: {
            labels,
            datasets: [{
              label: 'Average Annual Salary',
              data: salaryByRole.map(d => d.mean),
              backgroundColor: salaryByRole.map(d => getRoleColor(d.role)),
              borderColor: salaryByRole.map(d => getRoleColor(d.role)),
              borderWidth: 2,
              borderRadius: 4,
              hoverBackgroundColor: salaryByRole.map(d => hexToRgba(getRoleColor(d.role), 0.8))
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: true,
            indexAxis: 'y' as const,
            animation: {
              duration: ANIM.barDurationMs,
              delay: (context: any) => {
                if (context.type !== 'data') return 0;
                return context.dataIndex * ANIM.perBarStaggerMs;
              }
            },
            plugins: {
              legend: {
                display: true,
                position: 'bottom' as const
              },
              tooltip: {
                callbacks: {
                  label: (context: any) => {
                    return formatCurrency(context.raw);
                  }
                }
              },
              datalabels: {
                color: 'black',
                anchor: 'end' as const,
                align: 'end' as const,
                font: { size: 12, weight: 'bold' as const },
                formatter: (value: number) => formatCurrency(value)
              }
            },
            scales: {
              x: {
                beginAtZero: true,
                ticks: {
                  callback: (value: any) => formatCurrency(value as number)
                }
              }
            }
          }
        };

        if (chartInstance.current) {
          chartInstance.current.destroy();
        }

        chartInstance.current = new ChartJS(chartRef.current, config);
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data');
        setLoading(false);
      }
    };

    loadAndRender();

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, []);

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Data Practitioner Salaries by Role</h1>
      
      <nav style={{ marginBottom: '1rem' }}>
        <Link href="/" style={{ marginRight: '1rem' }}>← Back</Link>
        <Link href="/salary-region" style={{ marginRight: '1rem' }}>By Region →</Link>
      </nav>

      {loading && <p>Loading salary data...</p>}
      {error && <p style={{ color: 'red' }}>Error: {error}</p>}

      <canvas ref={chartRef} style={{ maxWidth: '100%', height: '600px' }} />

      <div style={{ marginTop: '2rem', padding: '1rem', backgroundColor: '#f5f5f5' }}>
        <h2>About this visualization</h2>
        <p>
          Average annual salary for data practitioners by role descriptor,
          using Bureau of Labor Statistics OEWS API data aggregated across all regions.
        </p>
      </div>
    </div>
  );
}
