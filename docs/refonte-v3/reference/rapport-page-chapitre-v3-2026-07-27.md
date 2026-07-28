# Rapport prompt 14 - Page chapitre V3

Date : 2026-07-27

## Objectif

Refondre le shell commun des pages chapitre V3 sans migrer les contenus eux-memes.
Le lecteur continue d'accepter les memes donnees d'entree : cours MDX, exercices JSON, quiz JSON, flashcards JSON et meta JSON.

## Routes concernees

- `/college/[niveau]/[matiere]/[chapitre]`
- `/lycee/[niveau]/[matiere]/[chapitre]`
- `/physique-chimie/[cycle]/[niveau]/[matiere]/[chapitre]`
- `/mathematiques/college/[niveau]/[chapitre]`
- `/mathematiques/lycee/[niveau]/[chapitre]`

## Fichiers modifies ou crees

- `src/components/pedagogie/ChapterPageShell.astro`
- `src/components/pedagogie/ChapterTabs.astro`
- `src/pages/college/[niveau]/[matiere]/[chapitre].astro`
- `src/pages/lycee/[niveau]/[matiere]/[chapitre].astro`
- `src/pages/physique-chimie/[cycle]/[niveau]/[matiere]/[chapitre].astro`
- `src/pages/mathematiques/college/[niveau]/[chapitre].astro`
- `src/pages/mathematiques/lycee/[niveau]/[chapitre].astro`
- `tests/chapter-shell-v3.test.mjs`

## Changements realises

- Ajout d'une vue d'ensemble avant les activites.
- Affichage explicite de l'objectif, des prerequis et des competences.
- Ajout d'un sommaire clavier avec `aria-current="step"`.
- Ajout d'un parcours recommande fonde sur les activites disponibles.
- Ajout de reperes rapides : matiere, niveau, duree, XP et outils quand les donnees existent.
- Synchronisation du sommaire avec les onglets existants, sans ajouter de nouvelle hydratation React.
- Passage des metadonnees pedagogiques depuis les routes chapitre physiques, chimiques et mathematiques.

## Garanties de migration

- Les contenus MDX ne sont pas modifies.
- Les fichiers d'exercices, quiz et flashcards ne sont pas modifies.
- Les quatre entrees existantes du shell restent presentes : `CoursContent`, `exercices`, `quizData`, `flashData`.
- Les lecteurs React existants restent les seuls ilots hydrates du shell.
- La navigation precedent / suivant et retour catalogue reste conservee.

## Validations executees

- `npm.cmd run check` : 0 erreur, 0 avertissement, 23 indications connues.
- `npm.cmd test` : 135 tests OK.
- `npm.cmd run build` : build OK, 314 pages generees.

## Controle visuel

Captures finales :

- `docs/refonte-v3/reference/captures/chapitre-v3-college-chimie-5e-2026-07-27.png`
- `docs/refonte-v3/reference/captures/chapitre-v3-lycee-es-2026-07-27.png`
- `docs/refonte-v3/reference/captures/chapitre-v3-maths-2nde-mobile-2026-07-27.png`

Resultats navigateur :

- `/college/5eme/chimie/proprietes-matiere/` : vue d'ensemble, sommaire, parcours recommande, 4 onglets, aucun debordement horizontal.
- `/lycee/1ere-ens-scientifique/physique/rayonnement-solaire/` : vue d'ensemble, sommaire, parcours recommande, 4 onglets, aucun debordement horizontal.
- `/mathematiques/lycee/2nde/fonctions-generalites/` en mobile : vue d'ensemble, sommaire, parcours recommande, 4 onglets, aucun debordement horizontal.

## Criteres AGENTS

- Respect de l'architecture existante : 10/10
- Reutilisation du shell et des onglets existants : 10/10
- Conservation des donnees et activites : 10/10
- Accessibilite clavier et `aria-current` : 9/10
- Densite visuelle et lisibilite pedagogique : 9/10
- Verification tests, check, build et captures : 10/10

## Points restants

- Le sommaire indique l'activite active dans le shell, mais ne suit pas encore la position fine a l'interieur du cours long.
- Les libelles de competences restent dependants de la qualite des metadonnees existantes ; les chapitres sans champ dedie utilisent un fallback sobre.
