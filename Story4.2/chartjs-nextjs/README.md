# Story 4 Next.js Deck

Standalone Next.js + Chart.js implementation of Story 4.

## Reusable Slide System

This project now includes a generic slide shell and starter template for future presentation-style projects:

- [`components/SlideDeckShell.tsx`](./components/SlideDeckShell.tsx)
- [`components/SlideTemplate.tsx`](./components/SlideTemplate.tsx)
- [`app/slide-template/page.tsx`](./app/slide-template/page.tsx)
- [`docs/slide-style-guide.md`](./docs/slide-style-guide.md)
- [`docs/slide-template.md`](./docs/slide-template.md)

The key constraint is strict `16:9` composition. Slides should fit inside the frame without vertical scrolling.

## What You Need

- Node.js 20 or newer
- npm

## Local Run

1. Open a terminal in this folder.
2. Install dependencies:

```bash
npm install
```

3. Start the dev server:

```bash
npm run dev
```

4. Open `http://localhost:3000`.

## Local Build

Use this when you want the static export that gets published to S3:

```bash
npm run build
```

The export is written to `out/`.

## Deploy

The published site lives under the Story4.2 base path:

- Live URL: `https://cuny.drinkthesand.com/608/Story4.2/`
- S3 bucket: `cuny-drinkthesand-story4`
- Publish prefix: `608/Story4.2/`

The deployment flow is:

1. Run `npm run build`
2. Sync `out/` to `s3://cuny-drinkthesand-story4/608/Story4.2/`
3. Invalidate CloudFront for `/608/Story4.2` and `/608/Story4.2/*`

## Project Notes

- Data files live in `public/data/`
- Route links are base-path aware for Story4.2
- `loadJSON()` automatically resolves `/data/...` requests against `/608/Story4.2`
- The reusable shell keeps the slide inside a centered 16:9 frame
