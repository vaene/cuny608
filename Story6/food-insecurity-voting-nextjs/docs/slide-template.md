# Slide Template

Use this template for any new presentation slide in Story4.2-style projects.

## Files

- `components/SlideDeckShell.tsx` provides the reusable 16:9 frame and navigation.
- `components/SlideTemplate.tsx` is the starter wrapper you can copy into new projects.
- `app/slide-template/page.tsx` is the reference example.

## Recommended Page Structure

```tsx
<SlideTemplate
  currentPath="/your-slide"
  slides={slides}
  deckLabel="Deck Label"
  title="Slide title"
  subtitle="Short explanatory subtitle"
  theme="light"
>
  <div className="grid h-full gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
    <section>{main content}</section>
    <aside>{supporting content}</aside>
  </div>
</SlideTemplate>
```

## Implementation Checklist

- Use the template shell.
- Keep a slide array for previous and next navigation.
- Keep everything inside the 16:9 frame.
- Avoid `min-h-screen` on inner slide content.
- Prefer `h-full`, `min-h-0`, and compact spacing.

## Good Defaults

- `deckLabel`: short project name
- `title`: the slide's one-sentence takeaway
- `subtitle`: a short framing sentence
- `theme`: `light` for charts and white pages, `dark` for cinematic pages

