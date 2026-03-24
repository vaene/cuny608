import StoryShell from "@/components/StoryShell";

export default function SourcesPage() {
  return (
    <StoryShell
      currentPath="/sources"
      title="Sources, Methodology, & Analytical Choices"
      subtitle="The story of location-driven salary variation demands clear assumptions."
    >
      <div className="space-y-6">
        <section className="rounded-2xl border border-gray-200 bg-gray-50 p-6">
          <h2 className="text-lg font-semibold text-gray-900">Primary Data Source</h2>
          <p className="mt-3 text-sm leading-6 text-gray-700">
            <strong>Bureau of Labor Statistics (BLS) Occupational Employment and Wage Statistics (OEWS):</strong>
          </p>
          <p className="mt-2 text-sm leading-6 text-gray-700">
            May 2024 state-level wage estimates for standard occupation codes aligned with Data Practitioner roles 
            (Data Scientist, Data Engineer, Data Analyst, Business Analyst, Data Architect).
          </p>
        </section>

        <section className="rounded-2xl border border-gray-200 bg-gray-50 p-6">
          <h2 className="text-lg font-semibold text-gray-900">Geographic & Economic Data</h2>
          <p className="mt-3 text-sm leading-6 text-gray-700">
            <strong>Population Density:</strong> U.S. Census Bureau state-level population density (2024 estimates).
          </p>
          <p className="mt-2 text-sm leading-6 text-gray-700">
            <strong>Cost of Living (COLA Index):</strong> BLS Average Energy Prices; state-level housing and general 
            cost of living proxies (2024 baseline = 100, U.S. average).
          </p>
        </section>

        <section className="rounded-2xl border border-gray-200 bg-gray-50 p-6">
          <h2 className="text-lg font-semibold text-gray-900">Role-to-Occupation Mapping</h2>
          <p className="mt-3 text-sm leading-6 text-gray-700">
            Broad role descriptors map to BLS standard occupational categories:
          </p>
          <ul className="mt-2 space-y-1 text-sm leading-6 text-gray-700">
            <li>• <strong>Data Scientist</strong> → 15-2051 (Computer Scientists & IT Researchers)</li>
            <li>• <strong>Data Engineer</strong> → 15-1252 (Software Developers)</li>
            <li>• <strong>Data Analyst</strong> → 13-1111 (Management Analysts)</li>
            <li>• <strong>Business Analyst</strong> → 13-1111 (Management Analysts)</li>
            <li>• <strong>Data Architect</strong> → 15-1243 (Database Architects)</li>
          </ul>
          <p className="mt-2 text-sm leading-6 text-gray-700">
            This is an <em>analytical approximation</em>, not an exhaustive labor market census. Real practitioners 
            span multiple roles and titles.
          </p>
        </section>

        <section className="rounded-2xl border border-gray-200 bg-gray-50 p-6">
          <h2 className="text-lg font-semibold text-gray-900">Location Categories & "Remote"</h2>
          <p className="mt-3 text-sm leading-6 text-gray-700">
            <strong>Remote work:</strong> Treated as its own category because remote workers negotiate with 
            national labor markets, not local COLA. This disconnects them from geographic anchors (density, COLA).
          </p>
          <p className="mt-2 text-sm leading-6 text-gray-700">
            <strong>Regional grouping:</strong> Northeast, Southeast, Midwest, Southwest, and West are aggregated 
            into location types (Urban High-COLA, Suburban Medium-COLA, etc.) to reveal patterns. This is a 
            simplification; high heterogeneity exists within regions.
          </p>
        </section>

        <section className="rounded-2xl border border-gray-200 bg-gray-50 p-6">
          <h2 className="text-lg font-semibold text-gray-900">What We Don't Measure</h2>
          <ul className="mt-3 space-y-2 text-sm leading-6 text-gray-700">
            <li>• <strong>Real purchasing power:</strong> COLA provides a proxy, but individual costs vary (e.g., 
            some earn higher remote salaries while living in low-COLA areas).</li>
            <li>• <strong>Experience & education:</strong> BLS averages mask variation within roles across 
            seniority levels.</li>
            <li>• <strong>Underemployment & underreporting:</strong> Gig workers, contract roles, and informal 
            arrangements are not captured.</li>
            <li>• <strong>Benefits, equity, and total compensation:</strong> The analysis is salary-only.</li>
          </ul>
        </section>

        <section className="rounded-2xl border border-gray-200 bg-gray-50 p-6">
          <h2 className="text-lg font-semibold text-gray-900">Data Pipeline</h2>
          <p className="mt-3 text-sm leading-6 text-gray-700">
            The notebook <code>data_practitioner_salary_analysis.ipynb</code> fetches BLS OEWS data via API, 
            aggregates by role and state, enriches with COLA and density metadata, and exports to JSON. 
            The Next.js app then reads these static JSON files and renders interactive visualizations.
          </p>
        </section>

        <section className="rounded-2xl border border-gray-200 bg-gray-50 p-6">
          <h2 className="text-lg font-semibold text-gray-900">Limitations & Next Steps</h2>
          <ul className="mt-3 space-y-2 text-sm leading-6 text-gray-700">
            <li>• COLA is a coarse proxy for living costs; housing costs dominate but vary drastically within 
            regions.</li>
            <li>• Sample sizes vary by occupation and region (see "count" in JSON), affecting reliability.</li>
            <li>• Remote salary classification is approximate; many "remote" roles may be hybrid or constrained 
            to certain regions.</li>
            <li>• Future work: compare salaries to career trajectory, retention, and actual cost-of-living burden 
            by location.</li>
          </ul>
        </section>
      </div>
    </StoryShell>
  );
}
