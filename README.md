# CUNY/608

This repo contains coursework materials and project assets for CUNY DATA 608.

## Large data files (not in git)

To keep the repo size manageable, large raw data files are **not** committed. If you need them, place them in the exact paths below or regenerate them using the scripts in `Story5/`.

Not tracked:
- `Story5/data/tornado_data.csv`
- `Story5/data/ibtrac_hurricane_data.csv`
- `app/public/data/ibtrac_hurricane_data.csv`

Notes:
- `Story5/DATA_READY.md` documents sources, coverage, and the processing scripts available.
- Processing scripts live in `Story5/` (see `merge_tornado_data.py`, `process_climate_data.py`, `read_ibtrac_dbf.py`, `process_hurricane_data.py`).

If you already have the raw files, copy them into the paths above before running the Story5 analyses or app pages that depend on them.
