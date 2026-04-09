#!/usr/bin/env python3
"""
Story5: Climate Storm Analysis - Data Processing Pipeline
Consolidates hurricane/typhoon/tornado and temperature data for analysis
"""

import pandas as pd
import numpy as np
import os
import gzip
from pathlib import Path

# Directories
DATA_DIR = "/Users/randyhowk/Documents/CUNY/608/Story5/data"
WORK_DIR = "/Users/randyhowk/Documents/CUNY/608/Story5"

print("="*70)
print("CLIMATE STORM ANALYSIS - DATA PROCESSING")
print("="*70)

# ============================================================================
# 1. LOAD AND PROCESS TORNADO DATA
# ============================================================================
print("\n1. Processing Tornado Data...")
tornado_file = os.path.join(DATA_DIR, "tornado_data.csv")
if os.path.exists(tornado_file):
    tornado_df = pd.read_csv(tornado_file)
    print(f"   ✓ Loaded tornado data: {len(tornado_df)} records")
    
    # Extract year and summarize by year
    tornado_df['YEAR'] = pd.to_numeric(tornado_df['YEAR'], errors='coerce')
    tornado_by_year = tornado_df.groupby('YEAR').agg({
        'EVENT_ID': 'count',
        'INJURIES_DIRECT': 'sum',
        'DEATHS_DIRECT': 'sum',
        'DAMAGE_PROPERTY': lambda x: pd.to_numeric(x, errors='coerce').sum()
    }).rename(columns={
        'EVENT_ID': 'tornado_count',
        'INJURIES_DIRECT': 'tornado_injuries',
        'DEATHS_DIRECT': 'tornado_deaths',
        'DAMAGE_PROPERTY': 'tornado_damage'
    })
    print(f"   ✓ Tornado yearly summary: {len(tornado_by_year)} years")
    print(f"     Date range: {tornado_by_year.index.min():.0f} - {tornado_by_year.index.max():.0f}")
else:
    print(f"   ✗ Tornado file not found: {tornado_file}")
    tornado_by_year = None

# ============================================================================
# 2. LOAD AND PROCESS TEMPERATURE DATA
# ============================================================================
print("\n2. Processing Global Temperature Data...")
temp_file = os.path.join(DATA_DIR, "GLB.Ts+dSST.csv")
if os.path.exists(temp_file):
    # Read temperature file (GISS format)
    temp_df = pd.read_csv(temp_file, skiprows=1)
    print(f"   ✓ Loaded temperature data shape: {temp_df.shape}")
    
    # Extract year column (first column is 'Year')
    if 'Year' in temp_df.columns:
        temp_df.columns = temp_df.columns.str.strip()
        # Calculate annual anomaly (use annual mean if available)
        # Most GISS files have J-D (Jan-Dec) column for annual
        if 'J-D' in temp_df.columns:
            temp_annual = temp_df[['Year', 'J-D']].copy()
            temp_annual.columns = ['year', 'temp_anomaly']
            temp_annual['year'] = pd.to_numeric(temp_annual['year'], errors='coerce')
            temp_annual['temp_anomaly'] = pd.to_numeric(temp_annual['temp_anomaly'], errors='coerce')
            temp_annual = temp_annual.dropna()
            print(f"   ✓ Temperature yearly data: {len(temp_annual)} years")
            print(f"     Date range: {temp_annual['year'].min():.0f} - {temp_annual['year'].max():.0f}")
        else:
            print(f"   ✗ Could not find J-D (annual) column")
            print(f"     Available columns: {temp_df.columns.tolist()}")
    else:
        print(f"   ✗ Could not find Year column")
        print(f"     Columns: {temp_df.columns.tolist()}")
else:
    print(f"   ✗ Temperature file not found: {temp_file}")
    temp_annual = None

# ============================================================================
# 3. MERGE DATASETS FOR ANALYSIS
# ============================================================================
print("\n3. Merging Datasets...")
if tornado_by_year is not None and temp_annual is not None:
    # Merge on year
    merged_df = pd.merge(
        temp_annual,
        tornado_by_year.reset_index().rename(columns={'YEAR': 'year'}),
        on='year',
        how='inner'
    )
    print(f"   ✓ Merged dataset shape: {merged_df.shape}")
    print(f"     Overlapping years: {len(merged_df)}")
    
    # Save merged dataset
    merged_output = os.path.join(DATA_DIR, "climate_tornado_analysis.csv")
    merged_df.to_csv(merged_output, index=False)
    print(f"   ✓ Saved: {merged_output}")
    
    # Print summary statistics
    print("\n   Summary Statistics:")
    print(f"     Temperature anomaly range: {merged_df['temp_anomaly'].min():.2f}°C to {merged_df['temp_anomaly'].max():.2f}°C")
    print(f"     Total tornadoes: {merged_df['tornado_count'].sum():.0f}")
    print(f"     Total tornado deaths: {merged_df['tornado_deaths'].sum():.0f}")
    print(f"     Year with most tornadoes: {merged_df.loc[merged_df['tornado_count'].idxmax(), 'year']:.0f} ({merged_df['tornado_count'].max():.0f})")
    
    # Calculate correlation
    corr_count = merged_df['temp_anomaly'].corr(merged_df['tornado_count'])
    corr_deaths = merged_df['temp_anomaly'].corr(merged_df['tornado_deaths'])
    print(f"\n   Correlations:")
    print(f"     Temperature vs Tornado Count: {corr_count:.3f}")
    print(f"     Temperature vs Tornado Deaths: {corr_deaths:.3f}")
else:
    print("   ✗ Could not merge - missing data")

# ============================================================================
# 4. IBTrACS SUMMARY (Files available but need additional processing)
# ============================================================================
print("\n4. IBTrACS Data Files Available:")
ibtrac_files = [f for f in os.listdir(WORK_DIR) if f.startswith('IBTrACS')]
for f in sorted(ibtrac_files):
    fpath = os.path.join(WORK_DIR, f)
    fsize = os.path.getsize(fpath) / (1024*1024)  # MB
    print(f"   - {f} ({fsize:.1f} MB)")

print("\n   Note: IBTrACS files contain hurricane/typhoon track data")
print("   Next step: Convert NetCDF/shapefile to CSV for analysis")

# ============================================================================
# 5. DATA SUMMARY FOR PRESENTATION
# ============================================================================
print("\n5. Dataset Summary for High School Presentation:")
print(f"   Temperature data: {len(temp_annual) if temp_annual is not None else 'N/A'} years")
print(f"   Tornado data: {len(tornado_by_year) if tornado_by_year is not None else 'N/A'} years")
print(f"   Merged analysis period: {len(merged_df) if merged_df is not None else 'N/A'} years")
print(f"   Hurricane/Typhoon data: Available (IBTrACS format)")

print("\n" + "="*70)
print("Processing complete! Ready for analysis and visualization.")
print("="*70)
