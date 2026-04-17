import StoryShell from "@/components/StoryShell";
import { formatCurrency } from "@/lib/salaryData";
import salaryByLevelRole from "@/public/data/salary-by-level-role.json";
import salaryByRegion from "@/public/data/salary-by-region.json";
import salaryByRole from "@/public/data/salary-by-role.json";
import salaryRegionRole from "@/public/data/salary-region-role.json";

function formatDelta(value: number): string {
  const rounded = Math.round(value);
  return `${rounded >= 0 ? "+" : "-"}${formatCurrency(Math.abs(rounded))}`;
}

export default function SourcesPage() {
  const sortedRoles = [...salaryByRole].sort((a, b) => b.mean - a.mean);
  const topRole = sortedRoles[0];
  const bottomRole = sortedRoles[sortedRoles.length - 1];
  const roleGap = topRole.mean - bottomRole.mean;

  const architectCareerGain =
    salaryByLevelRole.Senior["Data Architect"] - salaryByLevelRole.Junior["Data Architect"];
  const analystCareerGain =
    salaryByLevelRole.Senior["Data Analyst"] - salaryByLevelRole.Junior["Data Analyst"];

  const sortedRegions = [...salaryByRegion].sort((a, b) => b.mean - a.mean);
  const topRegion = sortedRegions[0];
  const bottomRegion = sortedRegions[sortedRegions.length - 1];
  const regionGap = topRegion.mean - bottomRegion.mean;

  const roleNames = Object.keys(salaryRegionRole[Object.keys(salaryRegionRole)[0]]);
  const regionRoleSpreads = roleNames.map((role) => {
    const sortedEntries = Object.entries(salaryRegionRole)
      .map(([region, roleMap]) => [region, roleMap[role]] as const)
      .sort(([, a], [, b]) => b - a);
    const [bestRegion, bestValue] = sortedEntries[0];
    const [worstRegion, worstValue] = sortedEntries[sortedEntries.length - 1];

    return {
      role,
      bestRegion,
      bestValue,
      worstRegion,
      worstValue,
      spread: bestValue - worstValue
    };
  });

  const widestSpread = regionRoleSpreads.sort((a, b) => b.spread - a.spread)[0];

  const summaryCards = [
    {
      eyebrow: "Role gap",
      headline: `${topRole.role} vs ${bottomRole.role}`,
      value: formatDelta(roleGap),
      body: `${topRole.role} leads the role averages at ${formatCurrency(topRole.mean)}, while ${bottomRole.role} sits at ${formatCurrency(bottomRole.mean)}.`
    },
    {
      eyebrow: "Career lift",
      headline: "Senior vs junior architect",
      value: formatDelta(architectCareerGain),
      body: `Data Architect climbs from ${formatCurrency(salaryByLevelRole.Junior["Data Architect"])} to ${formatCurrency(salaryByLevelRole.Senior["Data Architect"])} across the level ladder.`
    },
    {
      eyebrow: "Regional gap",
      headline: `${topRegion.region} vs ${bottomRegion.region}`,
      value: formatDelta(regionGap),
      body: `${topRegion.region} posts the highest regional mean at ${formatCurrency(topRegion.mean)}, compared with ${formatCurrency(bottomRegion.mean)} in the ${bottomRegion.region}.`
    },
    {
      eyebrow: "Widest spread",
      headline: widestSpread.role,
      value: formatDelta(widestSpread.spread),
      body: `${widestSpread.role} varies from ${formatCurrency(widestSpread.worstValue)} in ${widestSpread.worstRegion} to ${formatCurrency(widestSpread.bestValue)} in ${widestSpread.bestRegion}.`
    },
    {
      eyebrow: "Analyst ladder",
      headline: "Senior vs junior analyst",
      value: formatDelta(analystCareerGain),
      body: `Data Analyst still gains ${formatCurrency(analystCareerGain)} from junior to senior, even though the ladder starts lower than the engineering and architecture tracks.`
    },
    {
      eyebrow: "Bottom line",
      headline: "Pay is not one story",
      value: "Role + level + place",
      body: "The end state is the point of the original deck: salary differences compound across job family, experience, and geography rather than coming from just one dimension."
    }
  ];

  return (
    <StoryShell
      currentPath="/608/Story4/sources"
      title="Where The Biggest Salary Differences Show Up"
      subtitle="The original ending worked best as a recap: one last grid that compresses the role, career-stage, and regional gaps into a quick closing view."
    >
      <div className="space-y-8">
        <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {summaryCards.map((card) => (
            <article
              key={card.eyebrow}
              className="rounded-2xl border border-gray-200 bg-gradient-to-br from-white to-gray-50 p-6 shadow-sm"
            >
              <div className="text-xs font-semibold uppercase tracking-[0.22em] text-gray-500">
                {card.eyebrow}
              </div>
              <h2 className="mt-3 text-xl font-semibold text-gray-900">{card.headline}</h2>
              <p className="mt-4 text-3xl font-semibold tracking-tight text-gray-900">{card.value}</p>
              <p className="mt-4 text-sm leading-6 text-gray-700">{card.body}</p>
            </article>
          ))}
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <article className="rounded-2xl border border-blue-200 bg-blue-50 p-6">
            <h2 className="text-lg font-semibold text-gray-900">Source and mapping note</h2>
            <p className="mt-3 text-sm leading-6 text-gray-700">
              Story 4 uses U.S. Bureau of Labor Statistics May 2024 wage estimates, mapped from broad
              practitioner labels onto the closest published occupations. That keeps the source credible,
              but it also means titles like Data Analyst and Business Analyst are analytical proxies.
            </p>
          </article>

          <article className="rounded-2xl border border-gray-200 bg-gray-50 p-6">
            <h2 className="text-lg font-semibold text-gray-900">Why this closing slide matters</h2>
            <p className="mt-3 text-sm leading-6 text-gray-700">
              The earlier charts unpack each dimension one at a time. This grid pulls the story back
              together so the audience leaves with the actual takeaway: the salary differences are large,
              visible, and layered rather than marginal.
            </p>
          </article>
        </section>
      </div>
    </StoryShell>
  );
}
