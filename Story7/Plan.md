# Plan

## Baseline
- The minimal `react-globe.gl` country-borders globe is the good baseline.
- Keep the globe as a single full-screen stage with local GeoJSON and no extra atlas routes in the core experience.
- The narrative globe navigator built on top of that baseline is also a good waypoint.

## Current Story Instructions
- Turn the globe into a narrative navigator instead of a slide deck.
- Use left and right caret buttons on the edges of the browser to move through the story.
- Use bottom dots to show the current story position and allow jumping to any section.
- Rotate and zoom the globe to a new focus point for each section.
- Keep the story order fixed:
  - US
  - China
  - South America
  - Russia
  - Europe
  - Back to US
- Turn off inherent auto-rotation when moving between story points.
- Resume inherent auto-rotation only on the last point in the narrative after idle time.
- Keep the globe full-screen, with the story UI floating over it.

## Execution Log
- `Base`: established the minimal choropleth globe as the clean starting point.
- `Local`: moved the country dataset into `public/datasets` so the app fetches locally.
- `Icon`: added a local favicon to remove the browser 404.
- `Story`: replaced the static globe with narrative navigation and camera jumps.
- `Waypoint`: froze the current six-step country narrative as a stable checkpoint.

## Notes
- `Base` means the stripped-down globe build, not the earlier atlas dashboard.
- `Story` means the camera moves are the narrative, not separate slides or pages.
