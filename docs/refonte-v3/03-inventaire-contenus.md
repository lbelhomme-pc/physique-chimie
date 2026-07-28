# Inventaire contenus

Physique-chimie detectee :

| Cycle | Niveau | Matiere | Chapitres |
|---|---|---:|---:|
| college | 6eme | chimie | 3 |
| college | 6eme | physique | 5 |
| college | 5eme | chimie | 3 |
| college | 5eme | physique | 5 |
| college | 4eme | chimie | 4 |
| college | 4eme | physique | 5 |
| college | 3eme | chimie | 6 |
| college | 3eme | physique | 6 |
| lycee | 2nde | chimie | 7 |
| lycee | 2nde | physique | 7 |
| lycee | 1ere-spe | chimie | 8 |
| lycee | 1ere-spe | physique | 5 |
| lycee | terminale-spe | chimie | 9 |
| lycee | terminale-spe | physique | 12 |
| lycee | enseignement scientifique | chimie/physique | 16 |

Mathematiques detectees : 11 chapitres de seconde sous `src/data/mathematiques/`.

Chaque chapitre physique-chimie possede generalement :

- `meta.json`
- `cours.mdx`
- `exercices.json`
- `quiz.json`
- `flashcards.json`

Constat cle : les formats historiques coexistent avec des formats plus recents. Le contrat commun actuel valide la publiabilite, mais tous les chapitres restent classes `incomplets-publiables`, ce qui justifie une normalisation V3 progressive.

## Complement prompt 04 - code mort et documentation

Inventaire detaille ajoute le 2026-07-27 :

- rapport : `docs/refonte-v3/reference/rapport-inventaire-code-mort-doc-2026-07-27.md` ;
- objectif : classer sans suppression les zones actives, legacy utiles, obsoletes probables et a verifier ;
- preuve principale : recherche d'imports/references, scripts `package.json`, styles importes, validation lint/build.

Synthese :

| Categorie | Zones principales | Decision |
|---|---|---|
| Actif | `src/pages`, `src/data`, `src/layouts/BaseLayout.astro`, `src/styles/design-system.css`, lecteurs pedagogiques, routes laboratoire dediees | Conserver |
| Legacy utile | rapports racine `RAPPORT_*`, audits `docs/audit-*`, scripts maths seconde de generation/validation | Conserver en reference jusqu'aux prompts migration |
| Obsolete probable | styles vides `src/styles/core.css`, `src/styles/components.css`, `src/styles/theme.css`, composants Astro pedagogiques non references | Ne pas supprimer avant prompt dedie |
| A verifier | PDFs et exports racine, fichiers `arbo.txt`/`fichier.txt`, logs dev, composants interactifs experimentaux peu references | Classer ou archiver apres validation utilisateur |

Point DYS/accessibilite : `AccessibilityPanel`, `ReadingGuide`, `a11y-engine`, `TextToSpeech` et les classes DYS du design-system sont actifs et doivent rester dans le socle V3.
