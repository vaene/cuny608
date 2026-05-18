# Affordability × Child Safety

This is a Next.js static slide deck that reuses the Story4.2-style 16:9 frame, but reframes food insecurity as a family-budget and child-safety issue in Republican-leaning states.

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Build static export

```bash
npm run build
```

The static site will be exported to `out/`.

## Data

Data files are stored in `public/data/`:

- `story6-state-data.json` - USDA ERS state food insecurity data merged with Census poverty-by-age data and 2024 presidential vote results.
- `story6-summary.json` - national child-hunger, poverty, inflation, and targeting summaries.

## Story arc

1. Thesis and political framing
2. State burden in Republican-leaning states
3. Food insecurity and GOP margin correlation
4. Children, child hunger, and school meals
5. Child poverty as kids age into adulthood
6. Sources, method, and limits
