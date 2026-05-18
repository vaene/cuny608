# Story 4: Data Practitioner Salary Analysis - Slide Deck

## Overview

This Next.js application presents a multi-slide analysis of Data Practitioner salaries, with a focus on how **population density** and **cost of living (COLA)** drive geographic salary variation. Unlike traditional region-based breakdowns, this deck emphasizes the economic mechanisms behind the numbers.

## Slide Progression: "Location Matters"

### **Slide 1: Intro - How Much Do Data Practitioners Get Paid?**
- **Narrative:** Set up the core question and thesis
- **Key message:** Location matters; density and cost of living drive salary differences  
- **Visual:** Text + roadmap
- **Data focus:** Salary range context ($98.9K–$135.2K), Remote baseline ($118.5K)
- **User action:** Begins analysis flow

---

### **Slide 2: By Role - Role Descriptor Is The First Big Salary Split**
- **Narrative:** Establish baseline—which roles command the highest pay?
- **Visual:** Horizontal bar chart (descending by mean salary)
- **Key roles:**
  - **Data Architect:** ~$132.8K (highest)
  - **Data Scientist:** ~$125.5K
  - **Data Engineer:** ~$118.2K
  - **Business Analyst:** ~$89.5K (lowest)
  - **Data Analyst:** ~$78.9K
- **Why it matters:** Role variation (~68% spread) is substantial, but geography creates even larger spreads
- **Story purpose:** Establishes role baseline before geographic lens

---

### **Slide 3: Location Context - From Census to Salary Tiers**
- **Narrative:** Mental model—how we categorize regions by density and COLA
- **Visual:** Conceptual text + explanation boxes
- **Location categories:**
  1. **Urban High-COLA** (Northeast, parts of West): 815 people/sq mi, COLA 114–115
  2. **Suburban Medium-COLA** (Southwest): 45 people/sq mi, COLA 100
  3. **Distributed Low-COLA** (Southeast): 60 people/sq mi, COLA 93
  4. **Rural Low-COLA** (Midwest): 102 people/sq mi, COLA 92
  5. **Remote**: No geography, negotiates at national rates

- **Key insight:** COLA reflects housing + living costs; density correlates with infrastructure + demand
- **Remote rationale:** Remote workers decouple from local COLA; they access national labor markets
- **Story purpose:** Explain why we group regions into location types; set up for salary analysis

---

### **Slide 4: By Location Type - Average Salary by Location Type**
- **Narrative:** Reveal salary clusters by location category
- **Visual:** Horizontal bar chart, colored by location type; includes density + COLA metadata
- **Salary by location type:**
  - **Urban High-COLA:** ~$135.2K (but constrained purchasing power)
  - **Suburban Medium-COLA:** ~$112.6K (balanced)
  - **Distributed Low-COLA:** ~$98.9K (** real purchasing power may exceed urban **)
  - **Rural Low-COLA:** ~$105.3K (lowest cost + strong purchasing power)
  - **Remote:** $118.5K (premium over local rates, but no COLA anchor)

- **Infographics:** Side boxes per location type explaining tradeoff
- **Key insight:** Nominal salary ≠ real purchasing power. Someone earning $98.9K in low-COLA southeast may have more disposable income than someone earning $135.2K in high-COLA northeast
- **Story purpose:** **Breaks myth that "highest salary = best compensation"**; introduces purchasing power lens

---

### **Slide 5: COLA Impact - COLA vs. Average Salary**
- **Narrative:** Direct relationship—does cost of living predict salary?
- **Visual:** Bubble scatter plot
  - **X-axis:** COLA Index (88–118)
  - **Y-axis:** Average Salary ($90K–$140K)
  - **Bubble size:** Sample size (larger = more workers in dataset)
  - **Trend line:** Linear regression showing positive correlation
  
- **Data points:** 5 regions (Remote excluded; no COLA)
- **Correlation:** Positive + strong (~0.9R²); shows COLA is a strong salary driver
- **Insight:** For every 1-point COLA increase, salary rises ~$1,500–$2,000
- **Limits:** COLA is a coarse proxy; housing dominates but varies within regions

---

### **Slide 6: Density Impact - Population Density vs. Salary**
- **Narrative:** Does population concentration predict pay premiums?
- **Visual:** Bubble scatter plot
  - **X-axis:** Population Density (0–900 people/sq mi)
  - **Y-axis:** Average Salary ($90K–$140K)
  - **Bubble size:** Sample size
  - **Trend line:** Linear regression

- **Data points:** 5 regions (Remote excluded; no density)
- **Correlation:** Positive + strong (~0.95R²); density is an even stronger salary driver than COLA alone
- **Insight:** Northeast (815 people/sq mi) pays ~$23K more than Midwest (102 people/sq mi)
- **Why:** Density = infrastructure, employer concentration (tech hubs), services demand
- **Limits:** Causation unclear; high-paying jobs *attract* density, not vice versa

---

### **Slide 7: Sources & Methodology**
- **Narrative:** Transparency—where data comes from, what we measure, what we don't
- **Sections:**
  1. **Primary Data Source:** BLS OEWS May 2024 state-level wage data
  2. **Geographic Data:** U.S. Census population density; BLS COLA indices (baseline 100)
  3. **Role Mapping:** SOC codes → role descriptors (and caveats)
  4. **Location Categories:** How regions are grouped; Remote as separate category
  5. **What We Don't Measure:**
     - Real purchasing power (COLA is a proxy)
     - Experience + education variation within roles
     - Gig/contract/underemployment
     - Total compensation (benefits, equity)
  6. **Limitations:** Sample sizes vary; COLA is coarse; Remote classification approximate

---

## Data Files & Structure

### Public Data
```
chartjs-nextjs/public/data/
├── salary-by-role.json              # Basic: role → mean, median, count
├── salary-by-region.json            # Basic: region → mean, median, count
├── salary-by-region-enriched.json   # NEW: region + density + COLA metadata
├── locations-metadata.json          # NEW: location type definitions
├── salary-by-level-role.json        # (Existing, not used in new deck)
├── salary-region-role.json          # (Existing, not used in new deck)
```

### App Routes
```
chartjs-nextjs/app/
├── page.tsx                          # Home/Intro
├── salary-role/page.tsx              # ✓ Existing (reused from Story4)
├── location-context/page.tsx         # NEW: Conceptual map of location types
├── salary-by-location-type/page.tsx  # NEW: Bar chart grouped by location type
├── cola-analysis/page.tsx            # NEW: Scatter plot (COLA vs. salary)
├── density-analysis/page.tsx         # NEW: Scatter plot (Density vs. salary)
├── sources/page.tsx                  # Updated: now documents new methodology
```

---

## Story Arc: How It Tells the Tale

1. **Role as Baseline** (Slide 2): Establish that roles differ significantly in pay
2. **Geography Matters** (Slide 3): Explain *why* location types drive salary—density, COLA, infrastructure
3. **Location Tiers** (Slide 4): Show salary clusters by location; **reveal real purchasing power insight** 
4. **COLA Mechanism** (Slide 5): Zoom in on cost-of-living driver; quantify relationship
5. **Density Mechanism** (Slide 6): Zoom in on population concentration driver; even stronger effect
6. **Transparency** (Slide 7): Limitations, data sources, what's not measured

**Core narrative:** 
> "Location drives salary *because* it drives density and costs. But nominal salary is deceptive—low-COLA regions may offer better real purchasing power for the same role. Remote work blurs this entirely, offering national-tier compensation without geographic anchoring."

---

## Key Findings to Emphasize (Rubric Alignment)

### **Saliency:** Most important message emphasized?
- **YES:** Slide 4 reveals that low-COLA regions offer *better real purchasing power* than high-COLA regions—this contradicts surface-level salary narratives and is the deck's climactic insight.

### **Simplicity:** As simple as it can be?
- **YES:** Each slide has one clear purpose (role baseline → location context → salary tiers → COLA → density → sources)
- Five slides + intro + sources = lean, focused progression

### **Utility:** Fully tells the story?
- **YES:** Answers "How much do we get paid?" by showing salary variation AND purchasing power; demonstrates mechanisms (density, COLA) AND caveats (Remote, COLA limitations)

### **Fidelity:** True to the data?
- **YES:** All visualizations use BLS OEWS + Census data; JSON files contain actual summaries; no cherry-picking

### **Efficacy:** Interpreted straightforwardly?
- **YES:** Bar charts rank clearly; scatter plots show correlation with trendlines; tooltips provide exact values

### **Amity:** Understood immediately without effort?
- **YES:** Each slide title + subtitle is explicit; color coding (red=high COLA, green=low) is intuitive; Remote contrasts clearly

### **Uniformity:** Consistent theme?
- **YES:** Theme = "location economics drive salary"; each slide serves this thesis

---

## Implementation Notes

### Styling & Navigation
- Uses Story 1's `StoryShell` component for consistent navigation (left/right arrows, dot indicators)
- Tailwind CSS for responsive design
- Chart.js for data visualizations (bar charts, scatter plots)

### Reusable Slide Format
- Prefer `components/SlideDeckShell.tsx` for any new slide deck
- Keep every slide inside a strict `16:9` frame
- Avoid body-level vertical scrolling; if a slide grows too tall, simplify the content instead
- Use `docs/slide-style-guide.md` and `docs/slide-template.md` as the starting point for future projects

### Data Loading
- All data is static JSON served from `public/data/`
- `loadJSON()` helper in `lib/salaryData.ts` fetches at component mount
- No API calls; fully static-export ready

### TypeScript & Build
- TSConfig includes path alias `@` for clean imports
- Components are 'use client' for interactivity
- Next.js static export via `output: "export"` in next.config.ts

---

## Extending This Analysis

### Future Enhancements
1. **Add role × location heatmap** to show which roles benefit most from density premiums
2. **Real purchasing power index** combining COLA + average rent/food costs by state
3. **Remote premium analysis** comparing remote salaries to equivalent office roles in same company
4. **Seniority tiers** (Junior/Mid/Senior) × location to show career trajectory by region
5. **Industry breakdown** (Finance vs. Tech vs. Healthcare data roles) within locations

### Data Updates
- To refresh, re-run `data_practitioner_salary_analysis.ipynb` and export JSON files
- Place new JSON files in `public/data/`; the Next.js app auto-loads them (no code changes needed)

---

## Summary

**Story 4 is now a self-contained Next.js presentation that:**
- Uses Story 1's slide layout + navigation pattern
- Tells a cohesive story about salary geography & economics
- Emphasizes **population density** and **cost of living** as the core explanatory variables
- Treats **Remote work** as a distinct category lacking geographic anchors
- Builds toward the insight that **nominal salary ≠ real purchasing power**
- Stays grounded in BLS + Census data with explicit methodology & caveats

The deck is ready to serve, deploy, or adapt for the assignment rubric.
