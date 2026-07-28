# Inventaire routes et contenus

## Routes sensibles statiques

- `/`
- `/college`
- `/lycee`
- `/mathematiques`
- `/mathematiques/college`
- `/mathematiques/lycee`
- `/laboratoire`
- `/outils-methodes`
- `/memorisation`
- `/memorisation/revision-du-jour`
- `/memorisation/mega-quiz`
- `/memorisation/mega-flashcards`
- `/profil`

## Routes dynamiques verifiees

`verify:content` controle 14 fichiers de routes dynamiques, dont :

- `src/pages/college/[niveau]/index.astro`
- `src/pages/college/[niveau]/[matiere]/index.astro`
- `src/pages/college/[niveau]/[matiere]/[chapitre].astro`
- `src/pages/lycee/[niveau]/index.astro`
- `src/pages/lycee/[niveau]/[matiere]/index.astro`
- `src/pages/lycee/[niveau]/[matiere]/[chapitre].astro`
- `src/pages/physique-chimie/[cycle]/[niveau]/[matiere]/[chapitre].astro`
- `src/pages/mathematiques/lycee/[niveau]/[chapitre].astro`
- `src/pages/laboratoire/[slug].astro`

## Contenus physique-chimie

| Cycle | Niveau | Matiere | Chapitres |
|---|---|---|---:|
| college | 3eme | chimie | 6 |
| college | 3eme | physique | 6 |
| college | 4eme | chimie | 4 |
| college | 4eme | physique | 5 |
| college | 5eme | chimie | 3 |
| college | 5eme | physique | 5 |
| college | 6eme | chimie | 3 |
| college | 6eme | physique | 5 |
| lycee | 1ere-ens-scientifique | chimie | 4 |
| lycee | 1ere-ens-scientifique | physique | 9 |
| lycee | 1ere-spe | chimie | 8 |
| lycee | 1ere-spe | physique | 5 |
| lycee | 2nde | chimie | 7 |
| lycee | 2nde | physique | 7 |
| lycee | terminale-ens-scientifique | chimie | 1 |
| lycee | terminale-ens-scientifique | physique | 2 |
| lycee | terminale-spe | chimie | 9 |
| lycee | terminale-spe | physique | 12 |

Total physique-chimie : 101 chapitres.

## Contenus mathematiques

`verify:content` detecte 11 chapitres mathematiques, tous sous la route publique `/mathematiques/lycee/2nde/...`.

## Laboratoire

25 routes laboratoire sont referencees par `src/data/laboratoire/apps.ts`, dont :

- `/laboratoire/circuit-rc`
- `/laboratoire/lois-kepler`
- `/laboratoire/gaz-parfaits`
- `/laboratoire/diffusion-temperature`
- `/laboratoire/systeme-solaire`
- `/laboratoire/melanges`
- `/laboratoire/chronophotographie`
- `/laboratoire/chaines-energetiques`
- `/laboratoire/decroissance-radioactive`
- `/laboratoire/refraction-lumiere`
- `/laboratoire/loi-ohm`
- `/laboratoire/titrage-ph-metrique`
- `/laboratoire/escape-energie`

## Programmes officiels disponibles

- `BO/BO_College.pdf`
- `BO/BO_Seconde.pdf`
- `BO/BO_Premiere_ES.pdf`
- `BO/BO_Premiere_SPE.pdf`
- `BO/BO_Term_ES.pdf`
- `BO/BO_Term_Spe.pdf`
- `BO/terminale-enseignement-scientifique.pdf`
- `BO/Seconde/spe634_annexe_1062989.pdf`

Point de vigilance : l'ancien audit de mai indiquait l'absence du BO ; ce point est devenu obsolete.
