from pathlib import Path

REPLACEMENTS = {
    "src/pages/outils-methodes/cours-python.astro": {
        "/lycee/2nde/physique/mesure-incertitudes": "/physique-chimie/lycee/2nde/physique/mesure-incertitudes",
        "/lycee/2nde/physique/decrire-mouvement": "/physique-chimie/lycee/2nde/physique/decrire-mouvement",
        "/lycee/2nde/physique/signaux-capteurs": "/physique-chimie/lycee/2nde/physique/signaux-capteurs",
    },
    "src/data/kitScientifique.ts": {
        "/college/5eme/chimie/proprietes-matiere/": "/physique-chimie/college/5eme/chimie/proprietes-matiere/",
        "/college/5eme/physique/circuits-electriques/": "/physique-chimie/college/5eme/physique/circuits-electriques/",
        "/lycee/2nde/chimie/solutions-concentrations/": "/physique-chimie/lycee/2nde/chimie/solutions-concentrations/",
        "/lycee/2nde/physique/signaux-capteurs/": "/physique-chimie/lycee/2nde/physique/signaux-capteurs/",
    },
    "src/pages/outils-methodes/python-lab.astro": {
        "/lycee/2nde/physique/mesure-incertitudes": "/physique-chimie/lycee/2nde/physique/mesure-incertitudes",
        "/lycee/2nde/physique/signaux-capteurs": "/physique-chimie/lycee/2nde/physique/signaux-capteurs",
    },
    "src/pages/outils-methodes/seconde-numerique.astro": {
        "/lycee/2nde/physique/mesure-incertitudes": "/physique-chimie/lycee/2nde/physique/mesure-incertitudes",
        "/lycee/2nde/physique/decrire-mouvement": "/physique-chimie/lycee/2nde/physique/decrire-mouvement",
        "/lycee/2nde/physique/signaux-capteurs": "/physique-chimie/lycee/2nde/physique/signaux-capteurs",
    },
    "src/data/chapters/lycee/1ere-spe/chimie/savons-amphiphilie-tensioactifs/cours.mdx": {
        "/lycee/1ere-spe/chimie/structure-polarite-solubilite": "/physique-chimie/lycee/1ere-spe/chimie/structure-polarite-solubilite",
    },
}

EXPECTED_BY_FILE = {
    "src/pages/outils-methodes/cours-python.astro": 3,
    "src/data/kitScientifique.ts": 4,
    "src/pages/outils-methodes/python-lab.astro": 2,
    "src/pages/outils-methodes/seconde-numerique.astro": 4,
    "src/data/chapters/lycee/1ere-spe/chimie/savons-amphiphilie-tensioactifs/cours.mdx": 1,
}

changed_total = 0
for filename, replacements in REPLACEMENTS.items():
    path = Path(filename)
    text = path.read_text(encoding="utf-8")
    changed = 0
    for old, new in replacements.items():
        count = text.count(old)
        if count:
            text = text.replace(old, new)
            changed += count
    expected = EXPECTED_BY_FILE[filename]
    if changed != expected:
        raise SystemExit(f"{filename}: expected {expected} replacements, got {changed}")
    path.write_text(text, encoding="utf-8")
    changed_total += changed
    print(f"{filename}: {changed} legacy link(s) migrated")

if changed_total != 14:
    raise SystemExit(f"expected 14 replacements total, got {changed_total}")

print("C12 legacy links migrated: 14/14")
