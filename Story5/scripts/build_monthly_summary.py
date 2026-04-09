import json
import shapefile

sf = shapefile.Reader('IBTrACS.since1980.list.v04r01.points.shp')
field_names = [field[0] for field in sf.fields if field[0] != 'DeletionFlag']
storm_month_max = {}
storm_month_meta = {}
wind_keys = ['WMO_WIND','USA_WIND','NEW_WIND','TOK_WIND','CMA_WIND','KMA_WIND','BOM_WIND','REU_WIND','NAD_WIND','WEL_WIND','DS8_WIND','TD5_WIND','TD6_WIND']
for sr in sf.shapeRecords():
    rec = dict(zip(field_names, sr.record))
    year = rec.get('year')
    month = rec.get('month')
    if year is None or month is None:
        continue
    try:
        year = int(year)
        month = int(month)
    except ValueError:
        continue
    storm_id = rec.get('SID')
    if not storm_id:
        continue
    key = (storm_id, year, month)
    candidates = []
    for k in wind_keys:
        val = rec.get(k)
        if isinstance(val, (int, float)) and val > 0:
            candidates.append(val)
    if not candidates:
        continue
    wind = max(candidates)
    if key not in storm_month_max or wind > storm_month_max[key]:
        storm_month_max[key] = wind
        storm_month_meta[key] = {
            'name': rec.get('NAME') or None,
            'basin': rec.get('BASIN'),
            'date': rec.get('ISO_TIME'),
            'wind': wind
        }
monthly = {}
for (storm_id, year, month), wind in storm_month_max.items():
    key = (year, month)
    entry = monthly.setdefault(key, {'strongest': None, 'cat1': set(), 'cat3': set()})
    meta = storm_month_meta.get((storm_id, year, month))
    if not meta:
        continue
    if not entry['strongest'] or wind > entry['strongest']['wind']:
        entry['strongest'] = {
            'stormId': storm_id,
            'wind': wind,
            'name': meta['name'],
            'basin': meta['basin'],
            'date': meta['date']
        }
    if wind >= 74:
        entry['cat1'].add(storm_id)
    if wind >= 111:
        entry['cat3'].add(storm_id)
result = []
for key in sorted(monthly):
    year, month = key
    entry = monthly[key]
    result.append({
        'year': year,
        'month': month,
        'strongestStorm': entry['strongest'],
        'cat1plusCount': len(entry['cat1']),
        'cat3plusCount': len(entry['cat3'])
    })
with open('../app/public/data/Story5_IBTrACS_monthly_summary.json', 'w') as f:
    json.dump(result, f)
print('months', len(result))
