import json
import re
from pathlib import Path

root = Path('.')
snapshot_path = root / 'tests/fixtures/dist-routes.snapshot.json'
config_path = root / 'tests/fixtures/dist-audit.config.json'

legacy_chapter = re.compile(r'^/(college|lycee)/[^/]+/(physique|chimie)/[^/]+$')

snapshot = json.loads(snapshot_path.read_text(encoding='utf-8'))
kept = [route for route in snapshot if not legacy_chapter.match(route)]
removed = [route for route in snapshot if legacy_chapter.match(route)]
if len(removed) != 101:
    raise SystemExit(f'expected 101 legacy PC chapter routes, got {len(removed)}')
if any(route.startswith('/physique-chimie/') for route in removed):
    raise SystemExit('canonical route selected for removal')
snapshot_path.write_text(json.dumps(kept, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')

config = json.loads(config_path.read_text(encoding='utf-8'))

# H1 exceptions tied to ES chapter pages must follow the canonical route.
allowed_h1 = config.get('allowedH1Counts', {})
new_allowed_h1 = {}
for route, count in allowed_h1.items():
    if legacy_chapter.match(route):
        route = '/physique-chimie' + route
    if route in new_allowed_h1:
        raise SystemExit(f'duplicate H1 route after migration: {route}')
    new_allowed_h1[route] = count
config['allowedH1Counts'] = new_allowed_h1

old_sample = '/college/4eme/chimie/atomes-molecules'
new_sample = '/physique-chimie/college/4eme/chimie/atomes-molecules'
config['a11ySampleRoutes'] = [new_sample if route == old_sample else route for route in config.get('a11ySampleRoutes', [])]

# Remove the obsolete duplicate smoke test of the legacy page. The explicit canonical sample remains.
smoke_samples = config.get('smokeSamples', [])
filtered_smoke = [sample for sample in smoke_samples if sample.get('route') != old_sample]
if len(smoke_samples) - len(filtered_smoke) != 1:
    raise SystemExit('expected exactly one legacy chapter smoke sample to remove')
config['smokeSamples'] = filtered_smoke

# C12 audit config must no longer ask the static build for redirect-only chapter pages.
def find_legacy_routes(value, found):
    if isinstance(value, dict):
        for item in value.values():
            find_legacy_routes(item, found)
    elif isinstance(value, list):
        for item in value:
            find_legacy_routes(item, found)
    elif isinstance(value, str) and legacy_chapter.match(value):
        found.append(value)

stale = []
find_legacy_routes(config, stale)
if stale:
    raise SystemExit(f'legacy chapter routes remain in dist audit config: {stale[:10]}')
if new_sample not in config.get('a11ySampleRoutes', []):
    raise SystemExit('canonical a11y chapter sample missing')

config_path.write_text(json.dumps(config, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print(f'removed legacy PC chapter routes from snapshot: {len(removed)}')
print(f'new snapshot route count: {len(kept)}')
