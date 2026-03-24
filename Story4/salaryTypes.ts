/**
 * TypeScript type definitions and utilities for Salary Data
 * 
 * Use this file in your Next.js app if you want better type safety
 * 
 * Usage:
 *   import type { SalaryRecord, SalaryMatrix } from '@/lib/salaryTypes';
 *   import { loadJSON } from '@/lib/salaryDataUtils';
 *   
 *   const data: SalaryRecord[] = await loadJSON('/data/salary-by-role.json');
 */

/**
 * Single salary record with aggregate statistics
 */
export interface SalaryRecord {
  role?: string;
  region?: string;
  level?: string;
  mean: number;
  median: number;
  count: number;
}

/**
 * Salary matrix: nested object structure [dimension1][dimension2] = salary
 */
export type SalaryMatrix = Record<string, Record<string, number>>;

/**
 * Chart.js Bar Chart Data
 */
export interface BarChartData {
  labels: string[];
  datasets: Array<{
    label: string;
    data: number[];
    backgroundColor: string[];
    borderColor?: string[];
    borderWidth?: number;
    borderRadius?: number;
  }>;
}

/**
 * Chart.js Heatmap-style Data
 */
export interface HeatmapData {
  rowLabels: string[];
  colLabels: string[];
  matrix: (number | null)[][];
}

/**
 * Available roles
 */
export type Role = 
  | 'Data Scientist'
  | 'Data Engineer'
  | 'Data Analyst'
  | 'Data Architect'
  | 'Business Analyst';

/**
 * Career levels
 */
export type Level = 'Junior' | 'Mid-Level' | 'Senior';

/**
 * Geographic regions
 */
export type Region = 
  | 'Northeast'
  | 'Southeast'
  | 'Midwest'
  | 'Southwest'
  | 'West'
  | 'Remote';

/**
 * Summary statistics
 */
export interface SalarySummary {
  salary_by_role: SalaryRecord[];
  salary_by_level_role: SalaryMatrix;
  salary_by_region: SalaryRecord[];
  salary_region_role: SalaryMatrix;
}

/**
 * Salary range with min, max, mean
 */
export interface SalaryRange {
  min: number;
  max: number;
  mean: number;
  count: number;
}

/**
 * Chart configuration options
 */
export interface ChartOptions {
  animate?: boolean;
  animationDuration?: number;
  showDataLabels?: boolean;
  showLegend?: boolean;
  colorScheme?: 'default' | 'pastel' | 'vibrant';
}

/**
 * Helper: Get all available roles
 */
export const AVAILABLE_ROLES: Role[] = [
  'Data Scientist',
  'Data Engineer',
  'Data Analyst',
  'Data Architect',
  'Business Analyst'
];

/**
 * Helper: Get all available levels
 */
export const AVAILABLE_LEVELS: Level[] = [
  'Junior',
  'Mid-Level',
  'Senior'
];

/**
 * Helper: Get all available regions
 */
export const AVAILABLE_REGIONS: Region[] = [
  'Northeast',
  'Southeast',
  'Midwest',
  'Southwest',
  'West',
  'Remote'
];

/**
 * Type guard: Check if value is a valid Role
 */
export function isRole(value: any): value is Role {
  return AVAILABLE_ROLES.includes(value);
}

/**
 * Type guard: Check if value is a valid Level
 */
export function isLevel(value: any): value is Level {
  return AVAILABLE_LEVELS.includes(value);
}

/**
 * Type guard: Check if value is a valid Region
 */
export function isRegion(value: any): value is Region {
  return AVAILABLE_REGIONS.includes(value);
}

/**
 * Type guard: Check if object is a SalaryRecord
 */
export function isSalaryRecord(value: any): value is SalaryRecord {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof value.mean === 'number' &&
    typeof value.median === 'number' &&
    typeof value.count === 'number'
  );
}

/**
 * Type guard: Check if object is a SalaryMatrix
 */
export function isSalaryMatrix(value: any): value is SalaryMatrix {
  if (typeof value !== 'object' || value === null) return false;
  
  for (const key in value) {
    if (typeof value[key] !== 'object' || value[key] === null) return false;
    for (const subkey in value[key]) {
      if (typeof value[key][subkey] !== 'number') return false;
    }
  }
  
  return true;
}

/**
 * Validation: Check if salary data is complete
 */
export function validateSalarySummary(data: any): data is SalarySummary {
  return (
    Array.isArray(data.salary_by_role) &&
    data.salary_by_role.every(isSalaryRecord) &&
    isSalaryMatrix(data.salary_by_level_role) &&
    Array.isArray(data.salary_by_region) &&
    data.salary_by_region.every(isSalaryRecord) &&
    isSalaryMatrix(data.salary_region_role)
  );
}

/**
 * Export all types for star imports
 */
export {
  Role,
  Level,
  Region,
  SalaryRecord,
  SalaryMatrix,
  BarChartData,
  HeatmapData,
  SalarySummary,
  SalaryRange,
  ChartOptions
};
