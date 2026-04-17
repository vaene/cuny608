export interface SalaryRecord {
  mean: number;
  median: number;
  count: number;
}

export interface SalaryByRoleRecord extends SalaryRecord {
  role: string;
}

export interface SalaryByRegionRecord extends SalaryRecord {
  region: string;
}

export interface SalaryByRegionEnrichedRecord extends SalaryByRegionRecord {
  locationName: string;
  popDensity: number | null;
  popDensityCategory: string;
  cola: number | null;
  colaCategory: string;
}

export type SalaryMatrix = Record<string, Record<string, number>>;

export const ROLE_COLORS: Record<string, string> = {
  "Data Scientist": "#4F46E5",
  "Data Engineer": "#DB2777",
  "Data Analyst": "#D97706",
  "Data Architect": "#7C3AED",
  "Business Analyst": "#059669"
};

export const REGION_COLORS: Record<string, string> = {
  Northeast: "#2563EB",
  Southeast: "#DC2626",
  Midwest: "#16A34A",
  Southwest: "#EA580C",
  West: "#7C3AED",
  Remote: "#475569"
};

// Location type colors (for COLA/Density-based view)
export const LOCATION_TYPE_COLORS: Record<string, string> = {
  "Urban High-COLA": "#DC2626",      // Red - most expensive
  "Suburban Medium-COLA": "#F59E0B",  // Amber - moderate
  "Distributed Low-COLA": "#10B981",  // Green - lower cost
  "Rural Low-COLA": "#30A46C",        // Darker green - lowest cost
  "Remote (No Geography)": "#6B7280"  // Gray - neutral
};

export const LEVEL_ORDER = ["Junior", "Mid-Level", "Senior"] as const;
export const REGION_ORDER = ["Northeast", "Southeast", "Midwest", "Southwest", "West", "Remote"] as const;
export const LOCATION_TYPE_ORDER = [
  "Urban High-COLA",
  "Suburban Medium-COLA",
  "Distributed Low-COLA",
  "Rural Low-COLA",
  "Remote (No Geography)"
] as const;

export const STORY4_BASE_PATH = "/608/Story4.2";

export const STORY4_SLIDES = [
  { href: "/", label: "Intro" },
  { href: "/salary-role", label: "By Role" },
  { href: "/location-context", label: "Location Context" },
  { href: "/salary-by-location-type", label: "By Location Type" },
  { href: "/cola-analysis", label: "COLA Impact" },
  { href: "/density-analysis", label: "Density Impact" },
  { href: "/sources", label: "Sources" }
] as const;

export function story4DataPath(path: string): string {
  if (!path.startsWith("/")) return path;
  return `${STORY4_BASE_PATH}${path}`;
}

export async function loadJSON<T>(path: string): Promise<T> {
  const resolvedPath = story4DataPath(path);
  const response = await fetch(resolvedPath);
  if (!response.ok) {
    throw new Error(`Failed to load ${resolvedPath}: ${response.status}`);
  }
  return response.json() as Promise<T>;
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value);
}

export function formatCurrencyCompact(value: number): string {
  const abs = Math.abs(value);
  if (abs >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (abs >= 1_000) return `$${(value / 1_000).toFixed(0)}K`;
  return formatCurrency(value);
}

export function hexToRgba(hex: string, alpha: number): string {
  const normalized = hex.replace("#", "").trim();
  const bigint = parseInt(normalized, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function getRoleColor(role: string): string {
  return ROLE_COLORS[role] ?? "#6B7280";
}

export function getRegionColor(region: string): string {
  return REGION_COLORS[region] ?? "#6B7280";
}

export function getLocationTypeColor(locationType: string): string {
  return LOCATION_TYPE_COLORS[locationType] ?? "#6B7280";
}

export function getSalaryDifference(salary: number, avgSalary: number): string {
  const diff = salary - avgSalary;
  if (diff > 0) return `+${formatCurrencyCompact(diff)}`;
  if (diff < 0) return `${formatCurrencyCompact(diff)}`;
  return "Neutral";
}
