#!/usr/bin/env python3
"""
Story5: Read IBTrACS DBF File Directly and Convert to CSV
"""

import struct
import os
import pandas as pd

DATA_DIR = "/Users/randyhowk/Documents/CUNY/608/Story5/data"
EXTRACT_DIR = "/Users/randyhowk/Documents/CUNY/608/Story5/ibtrac_extracted"

print("="*70)
print("READING IBTRAC DBF FILE DIRECTLY")
print("="*70)

dbf_file = os.path.join(EXTRACT_DIR, "IBTrACS.since1980.list.v04r01.points.dbf")

# Try using geopandas if available
try:
    import geopandas as gpd
    print("\n✓ GeoPandas available - reading shapefile...")
    
    # Read the shapefile with geopandas
    shp_file = os.path.join(EXTRACT_DIR, "IBTrACS.since1980.list.v04r01.points.shp")
    gdf = gpd.read_file(shp_file)
    
    print(f"✓ Loaded shapefile: {gdf.shape}")
    print(f"Columns:\n{gdf.columns.tolist()}")
    
    # Convert to dataframe (drop geometry)
    df = pd.DataFrame(gdf.drop(columns='geometry'))
    
    # Save to CSV
    output_file = os.path.join(DATA_DIR, "ibtrac_hurricane_data.csv")
    df.to_csv(output_file, index=False)
    print(f"\n✓ Saved to: {output_file}")
    
    # Print sample
    print(f"\nDataset shape: {df.shape}")
    print(f"Sample records:\n{df.head(3)}")
    
except ImportError:
    print("GeoPandas not available, trying pure Python DBF read...")
    
    # Pure Python DBF reader
    try:
        with open(dbf_file, 'rb') as f:
            # Read DBF header
            data = f.read(32)
            version, num_records, header_len, record_len = struct.unpack('<B3xI2xHH', data)
            
            print(f"DBF Version: {version}")
            print(f"Number of records: {num_records:,}")
            print(f"Record length: {record_len} bytes")
            print(f"Header length: {header_len} bytes")
            
            # Read field definitions
            f.seek(32)
            fields = []
            while True:
                field_data = f.read(32)
                if field_data[0:1] == b'\r':  # End of field definitions
                    break
                
                field_name = field_data[0:11].decode('latin-1').rstrip('\x00')
                field_type = chr(field_data[11])
                field_length = field_data[16]
                field_decimals = field_data[17]
                
                fields.append({
                    'name': field_name,
                    'type': field_type,
                    'length': field_length,
                    'decimals': field_decimals
                })
            
            print(f"\nFound {len(fields)} fields:")
            for i, f in enumerate(fields[:15]):  # Print first 15
                print(f"  {i}: {f['name']} ({f['type']}, len={f['length']})")
            if len(fields) > 15:
                print(f"  ... and {len(fields)-15} more fields")
                
    except Exception as e:
        print(f"Error: {e}")

except Exception as e:
    print(f"Error: {e}")
    import traceback
    traceback.print_exc()

print("\n" + "="*70)
