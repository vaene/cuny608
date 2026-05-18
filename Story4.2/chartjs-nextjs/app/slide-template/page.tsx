import SlideTemplate from "@/components/SlideTemplate";

const slides = [
  { href: "/slide-template", label: "Template" }
];

export default function SlideTemplatePage() {
  return (
    <SlideTemplate
      currentPath="/slide-template"
      slides={slides}
      deckLabel="Reusable Slide Template"
      title="Title goes here"
      subtitle="Use this page as the starting point for new 16:9 slides."
      theme="light"
    >
      <div className="grid h-full gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
        <section className="flex min-h-0 flex-col justify-center">
          <div className="max-w-2xl space-y-4">
            <h2 className="text-2xl font-semibold tracking-tight text-slate-900 lg:text-3xl">
              One slide. One message.
            </h2>
            <p className="text-sm leading-6 text-slate-700 lg:text-base">
              Keep the center-left area for the main claim, chart, or visual narrative.
              Use the right rail for supporting explanation, definitions, or a short roadmap.
            </p>
            <div className="flex flex-wrap gap-2 text-xs font-medium text-slate-600">
              <span className="rounded-full bg-slate-100 px-3 py-1">16:9 frame</span>
              <span className="rounded-full bg-slate-100 px-3 py-1">Single focal point</span>
              <span className="rounded-full bg-slate-100 px-3 py-1">No vertical scroll</span>
            </div>
          </div>
        </section>

        <aside className="flex min-h-0 flex-col justify-center rounded-2xl border border-slate-200 bg-slate-50 p-5">
          <div className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
            Companion panel
          </div>
          <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-700">
            <li>• Keep text short and punchy.</li>
            <li>• Use a single chart or a tight grid.</li>
            <li>• Reserve 12 to 18 percent of the slide for breathing room.</li>
          </ul>
        </aside>
      </div>
    </SlideTemplate>
  );
}
