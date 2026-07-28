# Rapport migration contenus 4e-3e V3 - 2026-07-28

## Perimetre

Prompt execute : `docs/refonte-v3/prompts/28-migration-contenus-4e-3e.md`.

Sources relues avant execution :

- `docs/refonte-v3/README.md`
- `docs/refonte-v3/00-resume-executif.md`
- `docs/refonte-v3/reference/schema-contrat-donnees-v3.md`
- `src/data/chapters/college/4eme/`
- `src/data/chapters/college/3eme/`
- `BO/BO_College.pdf`, programme physique-chimie cycle 4

Le prompt demandait de normaliser le lot physique-chimie 4e-3e vers le contrat V3 sans toucher au lycee ni aux mathematiques.

## Lot migre

21 chapitres ont ete normalises :

- 4e chimie : `atomes-molecules`, `echelles-microscopiques`, `reactifs-produits-conservation`, `solubilite`
- 4e physique : `interactions-forces-aimants`, `mouvement-vitesse`, `ondes-signaux`, `puissance-electrique`, `puissance-transferts-energie`
- 3e chimie : `atome`, `ions`, `masse-volumique`, `molecules`, `ph`, `transformations-chimiques`
- 3e physique : `energie-mecanique`, `loi-ohm`, `mouvements`, `puissance-energie`, `signaux`, `sources-energies`

Fichiers normalises dans chaque chapitre :

- `meta.json`
- `exercices.json`
- `quiz.json`
- `flashcards.json`

Le fichier `src/data/chapters/college/3eme/chimie/atome/atome-structure.svg` a aussi ete corrige pour l'accessibilite et les libelles scientifiques.

## Changements appliques

- Ajout des champs V3 communs : `access`, `sources`, `objectives`, `prerequisites`, `competencies`, `competences`, `duration`, `updatedAt`, `links`, `tags`, `lessons`.
- Conservation des routes canoniques existantes sous `/college/{niveau}/{matiere}/{slug}`.
- Conservation des identifiants locaux des exercices, quiz et flashcards.
- Ajout de la source officielle `bo-college-physique-chimie-2025` sur les metas et les ressources.
- Ajout de liens internes vers les laboratoires ou outils V3 pertinents : loi d'Ohm, pH, test des ions, tableau periodique, chronophotographie, puissance-energie, chaines energetiques, etc.
- Ajout d'un marqueur `brevet` sur les chapitres et ressources de 3e, avec une lecon `methode-brevet` dans chaque `meta.json` de 3e.
- Ajout de textes alternatifs aux schemas SVG integres dans les exercices : `role="img"`, `title`, `desc`, `schemaAlt` ou `accessibility.altText`.
- Suppression du risque de schema muet : aucun schema du lot ne repose sur `aria-hidden="true"`.
- Correction du SVG autonome de structure atomique : titre, description, role image, labels `p+`, `n`, `e-`.

## Tests ajoutes

Nouveau fichier :

- `tests/contenus-college-4e-3e-v3.test.mjs`

Le test couvre :

- presence des fichiers de chapitre ;
- conservation des routes et IDs canoniques ;
- champs editoriaux V3 dans les metas ;
- sources officielles BO ;
- liens internes vers laboratoire ou outil ;
- marqueur brevet pour la 3e ;
- formules avec texte accessible ;
- exercices, quiz et flashcards normalises ;
- schemas SVG accessibles et sans HTML dangereux ;
- audit de contrat sans champ editorial manquant sur le lot 4e-3e.

## Validations

Commandes executees :

- `npm.cmd test` : 198 tests passes, 0 echec.
- `npm.cmd run verify:content` : 34 666 controles, 0 erreur, 0 avertissement.
- `npm.cmd run build` : build Astro reussi, 314 pages generees.

Points specifiques observes :

- `verify:content` compte 112 chapitres, dont 37 adaptes au contrat commun apres les lots 5e-6e puis 4e-3e.
- Les routes 3e et 4e ont ete generees dans le build pour les chemins explicites `/college/...` et `/physique-chimie/college/...`.
- Les redirections preparees restent valides : 101 cibles preparees, 0 cible manquante.

## Limites et retour arriere

Le travail reste dans le perimetre documentaire et contenu college physique-chimie. Aucune route active n'a ete supprimee et aucun contenu mathematiques ou lycee n'a ete modifie dans le cadre de ce prompt.

Retour arriere possible par restauration des fichiers touches dans :

- `src/data/chapters/college/4eme/`
- `src/data/chapters/college/3eme/`
- `tests/contenus-college-4e-3e-v3.test.mjs`
- `docs/refonte-v3/reference/rapport-migration-contenus-4e-3e-v3-2026-07-28.md`
- `docs/refonte-v3/README.md`

## Notation obligatoire

| Critere | Note | Preuves |
| --- | ---: | --- |
| Architecture et maintenabilite | 9.5/10 | Contrat V3 applique aux 21 chapitres sans nouvelle source de verite ; routes et IDs verifies par `tests/contenus-college-4e-3e-v3.test.mjs`. |
| UX, UI et coherence du design | 9/10 | Liens internes vers outils et laboratoires coherents ; schemas SVG conserves avec descriptions ; build des pages college 3e-4e reussi. |
| Qualite pedagogique et scientifique | 9/10 | Alignement avec `BO/BO_College.pdf` cycle 4 ; objectifs, prerequis, competences et preparation brevet ajoutes ; formules clefs dotees d'un texte accessible. |
| Accessibilite et DYS | 9.5/10 | SVG autonome avec `role="img"`, `title`, `desc` ; schemas d'exercices sans `aria-hidden="true"` ; test dedie sur textes alternatifs et HTML dangereux. |
| Qualite technique globale | 9.5/10 | `npm.cmd test`, `npm.cmd run verify:content` et `npm.cmd run build` passent ; sanitization SVG verifiee par les tests existants et le nouveau test. |
| Completude, migration et validation | 9.5/10 | 21 chapitres traites ; exercices, quiz, flashcards et metas normalises ; 34 666 controles contenu sans erreur ni avertissement ; 314 pages construites. |
