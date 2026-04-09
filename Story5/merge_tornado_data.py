#!/usr/bin/env python3
"""
Story5 Tornado Data Consolidation Script
Merges all gzip-compressed tornado CSV files into a single dataset
"""

import gzip
import pandas as pd
import os

tornado_dir = "/Users/randyhowk/Documents/CUNY/608/Story5/tornado"
data_dir = "/Users/randyhowk/Documents/CUNY/608/Story5/data"

# Get all gzip files
gz_files = sorted([f for f in os.listdir(tornado_dir) if f.endswith('.csv.gz')])

print(f"Found {len(gz_files)} compressed tornado files to process...")

# Read and concatenate all files
all_data = []
for i, gz_file in enumerate(gz_files, 1):
    file_path = os.path.join(tornado_dir, gz_file)
    try:
        df = pd.read_csv(gzip.open(file_path, 'rb'))
        all_data.append(df)
        print(f"  [{i}/{len(gz_files)}] Processed: {gz_file} ({len(df)} rows)")
    except Exception as e:
        print(f"  Error processing {gz_file}: {e}")

# Merge all dataframes
merged_df = pd.concat(all_data, ignore_index=True)
print(f"\nMerged dataset: {len(merged_df)} total rows, {len(merged_df.columns)} columns")

# Save to data directory
output_file = os.path.join(data_dir, "tornado_data.csv")
merged_df.to_csv(output_file, index=False)
print(f"✓ Saved to: {output_file}")
print(f"\nColumns in merged dataset:")
print(merged_df.columns.tolist())
