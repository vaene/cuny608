# Story5: Climate & Storms Analysis - Data Processing Complete ✓

## Master Dataset Ready
**File:** `data/climate_storms_analysis.csv`
- **77 years** of data (1950-2026)
- **11 columns** ready for analysis
- **Strong correlations** identified

## Data Coverage

### Temperature Data
- Source: GISS Global Surface Temperature (GLB.Ts+dSST.csv)
- Period: 1880-2025 (145+ years)
- Metric: Annual temperature anomaly

### Tornado Data  
- Source: National Weather Service Storm Events Database
- Period: 1950-2025 (75 years)
- Records: 2,088,138 events
- Key metrics: Count, injuries, deaths, damage

### Hurricane/Typhoon Data
- Source: IBTrACS (International Best Track Archive)
- Period: 1980-2026 (46 years)  
- Records: 305,957 data points from 4,929 unique storms
- Key metrics: Wind speed, pressure, category

## Key Findings: Temperature vs Storms

| Relationship | Correlation | Years | Interpretation |
|--------------|-------------|-------|-----------------|
| **Temp → Tornado Count** | **0.852** | 75 | ⬆️ Strong positive |
| Temp → Tornado Deaths | 0.699 | 75 | ⬆️ Moderate positive |
| Temp → Max Hurricane Wind | 0.515 | 45 | ⬆️ Moderate positive |
| Temp → Hurricane Count | -0.244 | 45 | ↔️ Weak negative |
| Temp → Avg Hurricane Wind | -0.029 | 45 | ↔️ Negligible |

## Files in `/data/` Directory

| File | Size | Records | Purpose |
|------|------|---------|---------|
| **climate_storms_analysis.csv** | 5.3K | 77 rows | ✓ MASTER - All storms + temperature |
| tornado_data.csv | 1.5G | 2.1M | Raw tornado events (reference) |
| ibtrac_hurricane_data.csv | 115M | 306K | Raw hurricane track points (reference) |
| climate_tornado_analysis.csv | 2.2K | 75 rows | Tornado + temp (1950-2025) |
| hurricane_yearly_summary.csv | 2.7K | 47 rows | Hurricane aggregates (1980-2026) |
| GLB.Ts+dSST.csv | 13K | 146 rows | Temperature source data |

## Data Summary Statistics

### Tornado Statistics (1950-2025)
- Total events: 2,088,138
- Deaths: 24,161
- Most active year: 2022 (139,774 events)

### Hurricane Statistics (1980-2026)
- Unique storms: 4,929
- Average per year: 106.5
- Peak year: 131 storms
- Avg max wind: 154.3 knots

### Temperature Statistics (1950-2025)
- Anomaly range: -0.20°C to +1.28°C
- Most recent trend: Warming
- Strong correlation with tornado activity

## Ready for Visualization

✓ Data cleaned and formatted
✓ Correlations calculated
✓ Yearly aggregations complete
✓ All datasets merged and aligned
✓ Ready for high-school friendly presentation

## Processing Scripts Available

1. `merge_tornado_data.py` - Consolidate tornado files
2. `process_climate_data.py` - Merge temperature + tornado
3. `read_ibtrac_dbf.py` - Convert IBTrACS shapefile to CSV
4. `process_hurricane_data.py` - Analyze hurricane trends and merge

## Next Steps

1. Create Jupyter notebook with visualizations
2. Generate charts for high school audience
3. Convert to NextJS slide presentation
4. Add storm damage imagery
5. Write accessible narrative

---
**Status:** Data processing COMPLETE ✓ Ready for analysis and visualization
