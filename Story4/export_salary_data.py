"""
Export salary analysis data from Jupyter notebook to JSON files

This script demonstrates how to convert the pandas DataFrames from 
data_practitioner_salary_analysis.ipynb into JSON format for the 
JavaScript/Next.js visualizations.

Usage:
  python export_salary_data.py

This assumes you have:
1. Executed all cells in data_practitioner_salary_analysis.ipynb
2. The resulting DataFrame 'df' is in scope
3. The pivot tables are created
"""

import json
import pandas as pd


def export_salary_data(
    salary_by_role,
    salary_by_level_role,
    salary_by_region,
    salary_region_role,
    output_dir='.'
):
    """
    Export salary summary tables to JSON files
    
    Args:
        salary_by_role: DataFrame with columns [role, mean, median, count]
        salary_by_level_role: DataFrame indexed by level and role
        salary_by_region: DataFrame with columns [region, mean, median, count]
        salary_region_role: DataFrame indexed by region and role
        output_dir: Directory to write JSON files
    """
    
    # 1. Export salary by role
    print("Exporting salary_by_role...")
    role_data = salary_by_role.reset_index()
    role_data.columns = ['role', 'mean', 'median', 'count']
    role_json = role_data.to_json(
        orient='records',
        indent=2
    )
    with open(f'{output_dir}/salary-by-role.json', 'w') as f:
        f.write(role_json)
    print(f"✓ Wrote {output_dir}/salary-by-role.json")
    
    # 2. Export salary by level and role
    print("Exporting salary_by_level_role...")
    level_role_pivot = salary_by_level_role['mean'].to_dict()
    level_role_json = json.dumps(level_role_pivot, indent=2)
    with open(f'{output_dir}/salary-by-level-role.json', 'w') as f:
        f.write(level_role_json)
    print(f"✓ Wrote {output_dir}/salary-by-level-role.json")
    
    # 3. Export salary by region
    print("Exporting salary_by_region...")
    region_data = salary_by_region.reset_index()
    region_data.columns = ['region', 'mean', 'median', 'count']
    region_json = region_data.to_json(
        orient='records',
        indent=2
    )
    with open(f'{output_dir}/salary-by-region.json', 'w') as f:
        f.write(region_json)
    print(f"✓ Wrote {output_dir}/salary-by-region.json")
    
    # 4. Export region x role matrix
    print("Exporting salary_region_role...")
    region_role_pivot = salary_region_role['mean'].to_dict()
    region_role_json = json.dumps(region_role_pivot, indent=2)
    with open(f'{output_dir}/salary-region-role.json', 'w') as f:
        f.write(region_role_json)
    print(f"✓ Wrote {output_dir}/salary-region-role.json")
    
    print("\nAll data exported successfully!")
    print("Files are ready to be copied to chartjs-nextjs/public/data/")


# Example: How to call from notebook
def main():
    """
    Example runner - call this from your notebook after creating the summaries
    
    In your Jupyter notebook, after creating salary_by_role, etc.:
    
        # Add this at the end
        export_salary_data(
            salary_by_role,
            salary_by_level_role, 
            salary_by_region,
            salary_region_role,
            output_dir='.'
        )
    """
    print("This script should be called from the Jupyter notebook context")
    print("See docstring for usage instructions")


if __name__ == '__main__':
    main()
