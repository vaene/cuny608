#!/usr/bin/env python3
"""
Story5: Process Hurricane/Typhoon Data and Merge with Temperature
Analyze hurricane count, intensity, and trends by year
"""

import pandas as pd
import numpy as np
import os
from datetime import datetime

DATA_DIR = "/Users/randyhowk/Documents/CUNY/608/Story5/data"

print("="*70)
print("HURRICANE/TYPHOON DATA ANALYSIS")
print("="*70)

# ============================================================================
# 1. LOAD HURRICANE DATA
# ============================================================================
print("\n1. Loading IBTrACS Hurricane Data...")
ibtrac_file = os.path.join(DATA_DIR, "ibtrac_hurricane_data.csv")

if os.path.exists(ibtrac_file):
    hurricane_df = pd.read_csv(ibtrac_file)
    print(f"   ✓ Loaded: {len(hurricane_df)} records")
    print(f"     Columns: {hurricane_df.shape[1]}")
    print(f"     Years: {hurricane_df['year'].min():.0f} - {hurricane_df['year'].max():.0f}")
else:
    print(f"   ✗ File not found: {ibtrac_file}")
    hurricane_df = None

# ============================================================================
# 2. IDENTIFY KEY INTENSITY METRICS
# ============================================================================
print("\n2. Extracting Intensity Metrics...")

if hurricane_df is not None:
    # Use USA wind speeds (most reliable) or fallback to WMO
    hurricane_df['wind_speed'] = hurricane_df['USA_WIND'].fillna(hurricane_df['WMO_WIND'])
    hurricane_df['pressure'] = hurricane_df['USA_PRES'].fillna(hurricane_df['WMO_PRES'])
    
    # Extract year
    hurricane_df['year'] = pd.to_numeric(hurricane_df['year'], errors='coerce')
    
    # Get unique storms (identified by SID)
    print(f"   Unique storm IDs: {hurricane_df['SID'].nunique()}")
    print(f"   Years covered: {hurricane_df['year'].min():.0f} - {hurricane_df['year'].max():.0f}")
    
    # Count records with wind data
    wind_records = hurricane_df['wind_speed'].notna().sum()
    print(f"   Records with wind speed: {wind_records:,}")
    
    # ========================================================================
    # 3. YEARLY HURRICANE SUMMARY
    # ========================================================================
    print("\n3. Creating Yearly Hurricane Statistics...")
    
    # Count unique storms per year (storms may span multiple days)
    storms_per_year = hurricane_df.groupby('year')['SID'].nunique().rename('hurricane_count')
    
    # Average intensity (wind speed) per year
    avg_wind_per_year = hurricane_df.groupby('year')['wind_speed'].mean().rename('avg_wind')
    max_wind_per_year = hurricane_df.groupby('year')['wind_speed'].max().rename('max_wind')
    
    # Average pressure (lower = stronger)
    avg_pressure_per_year = hurricane_df.groupby('year')['pressure'].mean().rename('avg_pressure')
    min_pressure_per_year = hurricane_df.groupby('year')['pressure'].min().rename('min_pressure')
    
    # Combine into yearly dataframe
    hurricane_yearly = pd.concat([
        storms_per_year,
        avg_wind_per_year,
        max_wind_per_year,
        avg_pressure_per_year,
        min_pressure_per_year
    ], axis=1)
    
    hurricane_yearly = hurricane_yearly.reset_index()
    
    print(f"   ✓ Yearly summary: {len(hurricane_yearly)} years")
    print(f"\n   Sample statistics:")
    print(f"     Average hurricanes/year: {hurricane_yearly['hurricane_count'].mean():.1f}")
    print(f"     Max hurricanes in a year: {hurricane_yearly['hurricane_count'].max():.0f}")
    print(f"     Min hurricanes in a year: {hurricane_yearly['hurricane_count'].min():.0f}")
    print(f"     Average max wind speed: {hurricane_yearly['max_wind'].mean():.1f} knots")
    
    # Save yearly summary
    summary_file = os.path.join(DATA_DIR, "hurricane_yearly_summary.csv")
    hurricane_yearly.to_csv(summary_file, index=False)
    print(f"\n   ✓ Saved yearly summary: {summary_file}")
    
else:
    hurricane_yearly = None
    print("   ✗ Could not process - hurricane data empty")

# ============================================================================
# 4. LOAD AND PREPARE TEMPERATURE & TORNADO DATA
# ============================================================================
print("\n4. Loading Climate and Tornado Data...")

temp_file = os.path.join(DATA_DIR, "climate_tornado_analysis.csv")
tornado_file = os.path.join(DATA_DIR, "tornado_data.csv")

if os.path.exists(temp_file):
    climate_df = pd.read_csv(temp_file)
    print(f"   ✓ Climate-tornado data: {len(climate_df)} years ({climate_df['year'].min():.0f}-{climate_df['year'].max():.0f})")
else:
    print(f"   ✗ File not found: {temp_file}")
    climate_df = None

# ============================================================================
# 5. MERGE ALL DATASETS
# ============================================================================
print("\n5. Merging All Datasets...")

if climate_df is not None and hurricane_yearly is not None:
    # Merge on year
    merged_all = pd.merge(
        climate_df,
        hurricane_yearly,
        left_on='year',
        right_on='year',
        how='outer'
    )
    
    merged_all = merged_all.sort_values('year')
    merged_all = merged_all.dropna(subset=['year'])
    
    print(f"   ✓ Merged all data: {len(merged_all)} years")
    print(f"     Year range: {merged_all['year'].min():.0f} - {merged_all['year'].max():.0f}")
    
    # Save combined dataset
    combined_file = os.path.join(DATA_DIR, "climate_storms_analysis.csv")
    merged_all.to_csv(combined_file, index=False)
    print(f"   ✓ Saved: {combined_file}")
    
    # Calculate correlations
    print("\n6. Correlation Analysis:")
    
    # Temperature vs Hurricane count
    if 'temp_anomaly' in merged_all.columns and 'hurricane_count' in merged_all.columns:
        subset = merged_all.dropna(subset=['temp_anomaly', 'hurricane_count'])
        if len(subset) > 2:
            corr = subset['temp_anomaly'].corr(subset['hurricane_count'])
            print(f"   Temperature vs Hurricane Count: {corr:.3f} (n={len(subset)})")
    
    # Temperature vs Tornado count
    if 'temp_anomaly' in merged_all.columns and 'tornado_count' in merged_all.columns:
        subset = merged_all.dropna(subset=['temp_anomaly', 'tornado_count'])
        if len(subset) > 2:
            corr = subset['temp_anomaly'].corr(subset['tornado_count'])
            print(f"   Temperature vs Tornado Count: {corr:.3f} (n={len(subset)})")
    
    # Temperature vs Average hurricane wind
    if 'temp_anomaly' in merged_all.columns and 'avg_wind' in merged_all.columns:
        subset = merged_all.dropna(subset=['temp_anomaly', 'avg_wind'])
        if len(subset) > 2:
            corr = subset['temp_anomaly'].corr(subset['avg_wind'])
            print(f"   Temperature vs Avg Hurricane Wind: {corr:.3f} (n={len(subset)})")
    
    # Temperature vs Maximum hurricane wind
    if 'temp_anomaly' in merged_all.columns and 'max_wind' in merged_all.columns:
        subset = merged_all.dropna(subset=['temp_anomaly', 'max_wind'])
        if len(subset) > 2:
            corr = subset['temp_anomaly'].corr(subset['max_wind'])
            print(f"   Temperature vs Max Hurricane Wind: {corr:.3f} (n={len(subset)})")
    
    print("\n7. Dataset Summary:")
    print(f"   Columns: {merged_all.columns.tolist()}")
    print(f"\n   Data preview (first year with all data):")
    filled_row = merged_all.dropna()
    if len(filled_row) > 0:
        print(merged_all[merged_all['year'] == filled_row.iloc[0]['year']])
    
else:
    print("   ✗ Could not merge - missing data")

print("\n" + "="*70)
print("Hurricane data processing complete!")
print("="*70)
