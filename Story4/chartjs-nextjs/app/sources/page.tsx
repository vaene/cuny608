import StoryShell from "@/components/StoryShell";

export default function SourcesPage() {
  return (
    <StoryShell
      currentPath="/sources"
      title="Sources, Mapping Choices, And Limits"
      subtitle="This Story 4 deck now runs entirely inside its own Next.js app, but the methodological caveats from the original analysis still matter."
    >
      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-gray-200 bg-gray-50 p-6">
          <h2 className="text-lg font-semibold text-gray-900">Primary source</h2>
          <p className="mt-3 text-sm leading-6 text-gray-700">
            The underlying analysis uses U.S. Bureau of Labor Statistics Occupational Employment and Wage
            Statistics data, specifically the May 2024 state wage estimates referenced in Story 4.
          </p>
          <p className="mt-3 text-sm leading-6 text-gray-700">
            The Next.js app serves precomputed JSON summaries from `public/data`, so the presentation is
            static and deployable without a notebook runtime.
          </p>
        </section>

        <section className="rounded-2xl border border-gray-200 bg-gray-50 p-6">
          <h2 className="text-lg font-semibold text-gray-900">Role mapping</h2>
          <p className="mt-3 text-sm leading-6 text-gray-700">
            The analysis maps broad role descriptors like Data Analyst or Business Analyst onto the
            closest available BLS occupational categories. That preserves a credible public source, but it
            is still an analytical approximation rather than a title-by-title labor market census.
          </p>
        </section>

        <section className="rounded-2xl border border-gray-200 bg-gray-50 p-6">
          <h2 className="text-lg font-semibold text-gray-900">Why this version</h2>
          <p className="mt-3 text-sm leading-6 text-gray-700">
            This implementation keeps the slide shell from Story 1, but the app, routes, data loading,
            and build output are all owned by Story 4.
          </p>
        </section>

        <section className="rounded-2xl border border-gray-200 bg-gray-50 p-6">
          <h2 className="text-lg font-semibold text-gray-900">Open caveats</h2>
          <p className="mt-3 text-sm leading-6 text-gray-700">
            The JSON files currently reflect summarized outputs already sitting in the repo. If you rerun
            the notebook and export fresh files, the deck will update automatically as long as the same
            file names and shapes are preserved.
          </p>
        </section>
      </div>
    </StoryShell>
  );
}
