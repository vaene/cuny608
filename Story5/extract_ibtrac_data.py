#!/usr/bin/env python3
"""
Story5: IBTrACS Hurricane/Typhoon Data Extraction and Processing
Converts shapefile data to CSV for analysis
"""

import os
import zipfile
import pandas as pd
import numpy as np
from pathlib import Path

DATA_DIR = "/Users/randyhowk/Documents/CUNY/608/Story5/data"
WORK_DIR = "/Users/randyhowk/Documents/CUNY/608/Story5"
EXTRACT_DIR = os.path.join(WORK_DIR, "ibtrac_extracted")

print("="*70)
print("IBTRAC HURRICANE/TYPHOON DATA - EXTRACTION & PROCESSING")
print("="*70)

# Create extraction directory
os.makedirs(EXTRACT_DIR, exist_ok=True)
print(f"\n✓ Created extraction directory: {EXTRACT_DIR}")

# ============================================================================
# 1. EXTRACT IBTRAC SHAPEFILES
# ============================================================================
print("\n1. Extracting IBTrACS Shapefile Data...")

# Use the "since1980" points data (more recent, manageable size)
ibtrac_zip = os.path.join(WORK_DIR, "IBTrACS.since1980.list.v04r01.points.zip")

if os.path.exists(ibtrac_zip):
    print(f"   Extracting: IBTrACS.since1980.list.v04r01.points.zip")
    with zipfile.ZipFile(ibtrac_zip, 'r') as zip_ref:
        zip_ref.extractall(EXTRACT_DIR)
    
    # List extracted files
    extracted_files = os.listdir(EXTRACT_DIR)
    print(f"   ✓ Extracted files:")
    for f in sorted(extracted_files):
        fpath = os.path.join(EXTRACT_DIR, f)
        fsize = os.path.getsize(fpath) / (1024*1024)
        print(f"     - {f} ({fsize:.1f} MB)")
else:
    print(f"   ✗ IBTrACS zip file not found: {ibtrac_zip}")

# ============================================================================
# 2. PROCESS SHAPEFILE DATA WITH SHAPEFILE LIBRARY
# ============================================================================
print("\n2. Reading Shapefile Data...")

shp_file = os.path.join(EXTRACT_DIR, "IBTrACS.since1980.list.v04r01.points.shp")
dbf_file = os.path.join(EXTRACT_DIR, "IBTrACS.since1980.list.v04r01.points.dbf")

# Try to read with pure Python shapefile library
try:
    import shapefile
    print("   ✓ Shapefile library available")
    
    # Read shapefile (note: don't include extension, shapefile library adds it)
    shp_base = os.path.join(EXTRACT_DIR, "IBTrACS.since1980.list.v04r01.points")
    sf = shapefile.Reader(shp_base)
    
    print(f"   Records in shapefile: {len(sf.records())}")
    
    # Get field names
    field_names = [field[0] for field in sf.fields[1:]]
    print(f"   Fields: {len(field_names)}")
    print(f"   Sample fields: {field_names[:10]}")
    
    # Convert to dataframe
    records = []
    for shape_record in sf.shapeRecords():
        record = dict(zip(field_names, shape_record.record))
        # Add lat/lon from geometry
        record['lon'] = shape_record.shape.points[0][0]
        record['lat'] = shape_record.shape.points[0][1]
        records.append(record)
    
    ibtrac_df = pd.DataFrame(records)
    print(f"\n   ✓ Converted to DataFrame: {ibtrac_df.shape}")
    
    # Look for year column
    print(f"\n   Columns: {ibtrac_df.columns.tolist()}")
    
except ImportError:
    print("   ✗ Shapefile library not installed, attempting pandas read_shapefile...")
    ibtrac_df = None
except Exception as e:
    print(f"   ✗ Error reading shapefile: {e}")
    ibtrac_df = None

# ============================================================================
# 3. PROCESS DBF FILE DIRECTLY WITH PANDAS
# ============================================================================
print("\n3. Attempting DBF File Read...")

try:
    import simpledbf
    print("   ✓ simpledbf library available")
    dbf = simpledbf.Dbf5(dbf_file)
    ibtrac_df = dbf.to_pandas()
    print(f"   ✓ Read DBF file: {ibtrac_df.shape}")
except ImportError:
    print("   ✗ simpledbf not installed")
except Exception as e:
    print(f"   ✗ Error reading DBF: {e}")

# ============================================================================
# 4. ANALYZE AND PROCESS HURRICANE DATA
# ============================================================================
if ibtrac_df is not None:
    print("\n4. Processing Hurricane/Typhoon Data...")
    
    # Display columns
    print(f"   Available columns:")
    for i, col in enumerate(ibtrac_df.columns):
        print(f"     {i}: {col}")
    
    # Try to find year/date columns
    year_cols = [col for col in ibtrac_df.columns if 'year' in col.lower() or 'date' in col.lower()]
    print(f"\n   Potential date columns: {year_cols}")
    
    # Look for intensity columns (wind, pressure, category)
    intensity_cols = [col for col in ibtrac_df.columns if any(x in col.lower() for x in ['wind', 'pressure', 'category', 'iso_time', 'time'])]
    print(f"   Potential intensity columns: {intensity_cols}")
    
    # Save sample data for inspection
    sample_file = os.path.join(DATA_DIR, "ibtrac_sample.csv")
    ibtrac_df.head(100).to_csv(sample_file, index=False)
    print(f"\n   ✓ Sample data saved: {sample_file}")
    
else:
    print("\n4. Could not process - DataFrame empty")
    print("\n   Attempting alternative: Create stub from available data")
    
    # List all files in extraction directory for manual inspection
    print(f"\n   Files available for manual conversion:")
    for f in os.listdir(EXTRACT_DIR):
        print(f"     - {f}")

# ============================================================================
# 5. INSTALLATION RECOMMENDATIONS
# ============================================================================
print("\n5. Installing Required Libraries for Shapefile Processing...")
print("\n   Run these commands:")
print("   pip install shapefile")
print("   pip install simpledbf")
print("   pip install pyogrio")
print("   pip install geopandas")

print("\n" + "="*70)
print("Next: Re-run with shapefile libraries installed")
print("="*70)
