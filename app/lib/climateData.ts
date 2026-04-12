// Story5: Climate & Storms Analysis Data Configuration

export const STORY5_SLIDES = [
  { href: "/608/Story5/opening", label: "Opening" },
  { href: "/608/Story5", label: "Intro" },
  { href: "/608/Story5/hurricane-spiral", label: "Spirals" },
  { href: "/608/Story5/trends", label: "Trends" },
  { href: "/608/Story5/correlations", label: "Correlations" },
  { href: "/608/Story5/analysis", label: "Analysis" },
  { href: "/608/Story5/sources", label: "Sources" }
] as const;

export interface ClimateStorm {
  year: number;
  temp_anomaly: number;
  tornado_count: number;
  tornado_injuries: number;
  tornado_deaths: number;
  tornado_damage: number;
  hurricane_count: number;
  avg_wind: number;
  max_wind: number;
  avg_pressure: number;
  min_pressure: number;
}

export interface HurricaneYearly {
  year: number;
  hurricane_count: number;
  avg_wind: number;
  max_wind: number;
  avg_pressure: number;
  min_pressure: number;
}

export async function loadClimateStomsData(): Promise<ClimateStorm[]> {
  const response = await fetch('/data/climate_storms_analysis.csv');
  const csv = await response.text();
  
  const lines = csv.trim().split('\n');
  const headers = lines[0].split(',');
  
  const data: ClimateStorm[] = [];
  
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',');
    const obj: any = {};
    
    headers.forEach((header, index) => {
      const value = values[index];
      obj[header.trim()] = isNaN(Number(value)) ? value : Number(value);
    });
    
    if (obj.year) {
      data.push(obj as ClimateStorm);
    }
  }
  
  return data.filter((entry) => entry.year <= 2025);
}

export async function loadHurricaneYearlyData(): Promise<HurricaneYearly[]> {
  const response = await fetch('/data/hurricane_yearly_summary.csv');
  const csv = await response.text();
  
  const lines = csv.trim().split('\n');
  const headers = lines[0].split(',');
  
  const data: HurricaneYearly[] = [];
  
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',');
    const obj: any = {};
    
    headers.forEach((header, index) => {
      const value = values[index];
      obj[header.trim()] = isNaN(Number(value)) ? value : Number(value);
    });
    
    if (obj.year) {
      data.push(obj as HurricaneYearly);
    }
  }
  
  return data.filter((entry) => entry.year <= 2025);
}

export const KEY_FINDINGS = {
  temperatureTornadoCorrelation: 0.852,
  temperatureTornadoDeathsCorrelation: 0.699,
  temperatureMaxHurricaneWindCorrelation: 0.515,
  temperatureAvgHurricaneWindCorrelation: -0.029,
  tornadoDataYears: { start: 1950, end: 2025 },
  hurricaneDataYears: { start: 1980, end: 2025 },
  totalTornadoEvents: 2088138,
  totalTornadoDeaths: 24161,
  totalStorms: 4929,
  avgHurricanesPerYear: 106.5,
  maxHurricanesInAYear: 131,
  avgMaxWindSpeed: 154.3,
  temperatureAnomalyRange: { min: -0.20, max: 1.28 }
};
