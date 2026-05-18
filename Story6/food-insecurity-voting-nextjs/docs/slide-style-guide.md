# Slide Style Guide

This project uses a reusable 16:9 slide format for presentation-style pages.

## Core Rules

1. Every slide must fit inside a strict 16:9 frame.
2. Content should not scroll vertically.
3. Each slide should communicate one primary idea.
4. Leave visible breathing room around charts, text, and controls.
5. Prefer a single hero visual plus a compact support panel over dense layouts.

## Canonical Frame

- Outer page: full viewport background and padding
- Inner slide: a centered `16:9` card
- Slide content: fills the card with `overflow-hidden`
- Header: compact title block at the top
- Body: flexible content area in the middle
- Footer: navigation and slide count anchored at the bottom

## Layout Budget

Use these rough proportions when designing new pages:

- Header: 15 to 20 percent of height
- Body: 60 to 70 percent of height
- Footer: 8 to 12 percent of height

If content does not fit, simplify the content rather than letting the page grow taller.

## Spacing Guidance

- Keep the main grid to two columns at most.
- Prefer `gap-4` to `gap-8`.
- Use compact text sizes for annotations and support copy.
- Avoid large fixed-height blocks unless they are the intended focus.

## Visual Hierarchy

- One dominant title
- One supporting subtitle
- One central data story
- One short supporting panel or legend

## Do

- Use `aspect-video` or an equivalent 16:9 wrapper.
- Keep legends, labels, and notes close to the chart.
- Use concise lists instead of paragraphs.
- Make the slide readable at a glance.

## Do Not

- Do not let body content exceed the frame and require scrolling.
- Do not stack multiple unrelated charts on one slide.
- Do not rely on default page height and hope it fits.
- Do not use full-width text blocks without a visual anchor.

## Reuse Pattern

- Start with the slide template in `app/slide-template/page.tsx`.
- Wrap every future slide in the generic shell from `components/SlideDeckShell.tsx`.
- Keep slide order in a single array so navigation stays consistent.

