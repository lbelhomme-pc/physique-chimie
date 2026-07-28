# Rapport prompt 13 - Pages niveaux et catalogues V3

Date : 2026-07-27

## Objectif

Refondre les pages de niveaux et de catalogues sans modifier le lecteur de chapitre.
Les catalogues V3 doivent rester compatibles avec les routes existantes, conserver tous les chapitres publies et ameliorer la lecture rapide des parcours.

## Routes concernees

- `/college`
- `/college/[niveau]`
- `/college/[niveau]/[matiere]`
- `/lycee`
- `/lycee/[niveau]`
- `/lycee/[niveau]/[matiere]`
- `/mathematiques/college`
- `/mathematiques/lycee`
- `/mathematiques/college/[niveau]` pour les niveaux mathematiques publies
- `/mathematiques/lycee/[niveau]` pour les niveaux mathematiques publies

Les routes chapitre `/college/[niveau]/[matiere]/[chapitre]`, `/lycee/[niveau]/[matiere]/[chapitre]` et leurs equivalents mathematiques n'ont pas ete refondues dans ce prompt.

## Fichiers principaux crees ou modifies

- `src/components/catalogue/CatalogueChapterList.astro`
- `src/components/catalogue/types.ts`
- `src/pages/college/[niveau]/index.astro`
- `src/pages/college/[niveau]/[matiere]/index.astro`
- `src/pages/lycee/[niveau]/index.astro`
- `src/pages/lycee/[niveau]/[matiere]/index.astro`
- `src/pages/mathematiques/college/index.astro`
- `src/pages/mathematiques/lycee/index.astro`
- `src/pages/mathematiques/college/[niveau]/index.astro`
- `src/pages/mathematiques/lycee/[niveau]/index.astro`
- `src/components/mathematiques/MathLevelCard.astro`
- `src/styles/mathematiques/mathematics.css`
- `src/data/mathematiques/levels.ts`
- `src/data/mathematiques/types.ts`
- `tests/catalogues-v3.test.mjs`

## Choix UX et contenu

- Listes de chapitres ordonnees et semantiques avec `ol`.
- Filtres par ancres, sans recherche lourde cote client.
- Compteurs visibles par niveau et par regroupement.
- Badges de discipline reutilisant les identites V3.
- Etats vides explicites pour les catalogues sans chapitre.
- Niveaux mathematiques prevus visibles en cartes desactivees, sans lien vers des routes non publiees.
- Liens de chapitres conserves vers les lecteurs existants.
- Regroupements Enseignement scientifique rendus plus lisibles sans renommer les chemins historiques internes.

## Conservation des chapitres

Validation `verify:content` :

- Chapitres physique-chimie : 101
- Chapitres mathematiques : 11
- Total chapitres publies : 112
- Routes publiques attendues : 150
- Pages produites par le build : 314

Aucun chapitre publie n'a ete retire du catalogue. Les tris restent fondes sur `data.order ?? 99`.

## Validations executees

- `npm.cmd run check` : 0 erreur, 0 avertissement, 23 indications existantes.
- `npm.cmd test -- --test-reporter=spec tests/catalogues-v3.test.mjs` : 130 tests OK.
- `npm.cmd run verify:content` : 0 erreur, 0 avertissement.
- `npm.cmd run build` : build OK, 314 pages generees.

## Controle visuel

Captures produites apres build statique :

- `docs/refonte-v3/reference/captures/catalogues-v3-college-5e-2026-07-27.png`
- `docs/refonte-v3/reference/captures/catalogues-v3-lycee-es-2026-07-27.png`
- `docs/refonte-v3/reference/captures/catalogues-v3-maths-lycee-2026-07-27.png`

Resultats du controle navigateur :

- `/college/5eme/` : titre present, 2 listes catalogue, aucun debordement horizontal.
- `/lycee/1ere-ens-scientifique/` : titre present, 2 listes catalogue, aucun debordement horizontal.
- `/mathematiques/lycee/` : titre present, 9 cartes de niveau, 8 cartes prevues desactivees, aucun lien sur carte desactivee, aucun debordement horizontal.
- Regles `:focus-visible` detectees.

## Criteres AGENTS

- Respect de l'architecture existante : 10/10
- Reutilisation des conventions locales : 10/10
- Compatibilite des routes existantes : 10/10
- Non-modification du lecteur chapitre : 10/10
- Lisibilite et sobriete pedagogique des catalogues : 9/10
- Verification contenu, tests et build : 10/10

## Points restants

- Les catalogues affichent une progression visuelle structurelle, mais pas encore une progression utilisateur personnalisee.
- Les chemins historiques de l'Enseignement scientifique restent conserves pour compatibilite ; un renommage eventuel devra passer par un prompt dedie aux redirections.
