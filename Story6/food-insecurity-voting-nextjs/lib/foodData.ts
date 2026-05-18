export interface StateFoodVoteRecord {
  state: string;
  stateName: string;
  households: number;
  foodInsecurityRate: number;
  veryLowFoodSecurityRate: number;
  interviews: number;
  harrisVotes: number;
  trumpVotes: number;
  totalVotes: number;
  harrisShare: number;
  trumpShare: number;
  marginTrump: number;
  winner: "Trump" | "Harris";
  swingState: boolean;
  foodBand: "High" | "Above average" | "Below average";
  politicalBand: "Strong Trump" | "Lean Trump" | "Lean Harris" | "Strong Harris";
  under18PovertyRate: number;
  age18to64PovertyRate: number;
  age65plusPovertyRate: number;
  childAdultPovertyGap: number;
}

export interface SummaryData {
  nationalFoodInsecurityRate: number;
  correlationFoodTrumpMargin: number;
  averageFoodInsecurityByWinner: Record<"Trump" | "Harris", number>;
  countsByWinner: Record<"Trump" | "Harris", number>;
  householdsWithChildrenFoodInsecurityRate: number;
  householdsWithChildrenAdultsOnlyRate: number;
  householdsWithChildrenBothChildrenAdultsFoodInsecureRate: number;
  householdsWithChildrenVeryLowFoodSecurityAmongChildrenRate: number;
  singleMotherFoodInsecurityRate: number;
  singleFatherFoodInsecurityRate: number;
  marriedCoupleWithChildrenFoodInsecurityRate: number;
  singleMotherVeryLowFoodSecurityRate: number;
  singleFatherVeryLowFoodSecurityRate: number;
  marriedCoupleWithChildrenVeryLowFoodSecurityRate: number;
  foodAtHomeInflationYoYApr2026: number;
  foodAwayFromHomeInflationYoYApr2026: number;
  nationalPovertyUnder18Rate: number;
  nationalPovertyAge18to64Rate: number;
  nationalPovertyAge65PlusRate: number;
  correlationFoodUnder18Poverty: number;
  correlationFoodAge18to64Poverty: number;
  highestFoodInsecurityStates: StateFoodVoteRecord[];
  targetStates: StateFoodVoteRecord[];
  sources: { label: string; url: string }[];
}

export const FOOD_VOTE_SLIDES = [
  { href: "/", label: "Thesis" },
  { href: "/scarcity-landscape", label: "States" },
  { href: "/vote-correlation", label: "Affordability" },
  { href: "/swing-states", label: "Children" },
  { href: "/policy-targets", label: "Targets" },
  { href: "/sources", label: "Sources" }
] as const;

export const STORY6_BASE_PATH = "/Story6";

export function story6DataPath(path: string): string {
  if (!path.startsWith("/")) return path;
  return `${STORY6_BASE_PATH}${path}`;
}

export async function loadJSON<T>(path: string): Promise<T> {
  const resolvedPath = story6DataPath(path);
  const response = await fetch(resolvedPath);
  if (!response.ok) {
    throw new Error(`Failed to load ${resolvedPath}: ${response.status}`);
  }
  return response.json() as Promise<T>;
}

export function formatPercent(value: number, digits = 1): string {
  return `${value.toFixed(digits)}%`;
}

export function formatVotes(value: number): string {
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(value);
}

export function winnerColor(winner: string): string {
  return winner === "Trump" ? "#c2410c" : "#2563eb";
}

export function foodBandColor(band: string): string {
  if (band === "High") return "#991b1b";
  if (band === "Above average") return "#dc2626";
  return "#94a3b8";
}

export function sortByFoodDesc(records: StateFoodVoteRecord[]): StateFoodVoteRecord[] {
  return [...records].sort((a, b) => b.foodInsecurityRate - a.foodInsecurityRate);
}
