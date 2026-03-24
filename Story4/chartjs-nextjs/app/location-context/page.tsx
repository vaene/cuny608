'use client';

import StoryShell from "@/components/StoryShell";

export default function LocationContextPage() {
  return (
    <StoryShell
      currentPath="/location-context"
      title="Location Context: From Census to Salary Tiers"
      subtitle="How we categorize regions by population density and cost of living."
    >
      <div className="flex h-full flex-col justify-center">
        <div className="space-y-8">
          <section>
            <h2 className="mb-4 text-xl font-semibold text-gray-900">
              Why Density and COLA Matter for Data Practitioner Pay
            </h2>
            <p className="mb-4 text-base leading-7 text-gray-700">
              High-density urban areas (Northeast, parts of West Coast) have elevated costs of living 
              to support infrastructure and demand. Employers in those areas pay higher salaries, but 
              purchasing power is compressed. Low-density regions have lower absolute salaries but 
              also lower living costs, creating a tradeoff in real economic value.
            </p>
            <p className="text-base leading-7 text-gray-700">
              Remote workers introduce a wildcard: they often command premium pay relative to their 
              home location (since they access national-tier labor markets), yet have no fixed geography 
              to reference for COLA or density.
            </p>
          </section>

          <section>
            <h2 className="mb-6 text-xl font-semibold text-gray-900">Location Categories</h2>
            <div className="space-y-4">
              <div className="rounded-lg border-l-4 border-red-600 bg-red-50 p-4">
                <h3 className="font-semibold text-red-900">Urban High-COLA (Northeast, some West)</h3>
                <p className="mt-1 text-sm text-red-800">
                  <strong>Density:</strong> 815 people/sq mi (Northeast)
                  <br />
                  <strong>COLA Index:</strong> 114–115
                  <br />
                  <strong>Examples:</strong> Boston, NYC, Philadelphia, San Francisco Bay Area
                  <br />
                  Highest nominal salaries, but real purchasing power is eaten by extreme housing and costs.
                </p>
              </div>

              <div className="rounded-lg border-l-4 border-amber-500 bg-amber-50 p-4">
                <h3 className="font-semibold text-amber-900">Suburban Medium-COLA (Southwest)</h3>
                <p className="mt-1 text-sm text-amber-800">
                  <strong>Density:</strong> 45 people/sq mi
                  <br />
                  <strong>COLA Index:</strong> 100
                  <br />
                  <strong>Examples:</strong> Phoenix, Albuquerque, Denver metro
                  <br />
                  Growing tech markets with moderate costs and emerging data hubs.
                </p>
              </div>

              <div className="rounded-lg border-l-4 border-green-600 bg-green-50 p-4">
                <h3 className="font-semibold text-green-900">Distributed & Rural Low-COLA (Southeast, Midwest)</h3>
                <p className="mt-1 text-sm text-green-800">
                  <strong>Density:</strong> 60–102 people/sq mi
                  <br />
                  <strong>COLA Index:</strong> 92–93
                  <br />
                  <strong>Examples:</strong> Atlanta, Charlotte, Nashville, Austin, Midwest cities
                  <br />
                  Lowest cost of living with growing tech talent. Real purchasing power may exceed urban.
                </p>
              </div>

              <div className="rounded-lg border-l-4 border-slate-500 bg-slate-50 p-4">
                <h3 className="font-semibold text-slate-900">Remote (No Geography)</h3>
                <p className="mt-1 text-sm text-slate-800">
                  <strong>Density:</strong> N/A
                  <br />
                  <strong>COLA Index:</strong> N/A
                  <br />
                  <strong>Rationale:</strong> Remote workers negotiate with national/global rates, disconnected 
                  from local COLA. Often pay premium vs. office roles in the same company.
                  <br />
                  Bridge between pure market rates and geographic anchors.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="mb-4 text-lg font-semibold text-gray-900">Next: Salary by Location Type</h2>
            <p className="text-sm text-gray-600">
              The next slide shows average salaries clustered by location category, revealing the geographic 
              premium (high-COLA premium vs. real purchasing power for low-COLA regions).
            </p>
          </section>
        </div>
      </div>
    </StoryShell>
  );
}
