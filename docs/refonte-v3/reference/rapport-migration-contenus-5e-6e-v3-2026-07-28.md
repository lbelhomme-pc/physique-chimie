# Rapport prompt 27 - Migration contenus 5e et 6e V3

Date : 2026-07-28

Prompt execute : `docs/refonte-v3/prompts/27-migration-contenus-5e-6e.md`

## Sources lues

- `docs/refonte-v3/README.md`
- `docs/refonte-v3/00-resume-executif.md`
- `docs/refonte-v3/prompts/27-migration-contenus-5e-6e.md`
- `docs/refonte-v3/reference/schema-contrat-donnees-v3.md`
- `src/data/chapters/college/5eme/`
- `src/data/chapters/college/6eme/`
- `BO/BO_College.pdf`

## Lot traite

16 chapitres physique-chimie college ont ete normalises :

- 5e chimie : `melanges-dissolution`, `proprietes-matiere`, `transformations-matiere`.
- 5e physique : `circuits-electriques`, `energie-stocks-transferts`, `lumiere-ombres`, `signaux-sonores`, `temps-mouvements`.
- 6e chimie : `etats-proprietes-matiere`, `masse-volume-longueur`, `melanges-solutions`.
- 6e physique : `astronomie`, `electricite`, `mouvements`, `signaux`, `sources-formes-energie`.

## Travaux realises

- Ajout d'une source officielle commune `bo-college-physique-chimie-2025` dans les `meta.json` et les ressources.
- Ajout des champs V3 : `access`, `objectives`, `prerequisites`, `competencies`, `competences`, `duration`, `updatedAt`, `links`, `lessons`.
- Ajout de trois lecons structurees par chapitre, avec blocs pedagogiques relies a la source officielle.
- Ajout de liens laboratoire ou outil pour chaque chapitre, sans creer de route.
- Ajout de `access`, `sources`, `competences`, `links` aux exercices, quiz et flashcards du lot quand ils manquaient.
- Ajout de `<desc>` aux SVG d'exercices qui avaient deja un `<title>`, pour renforcer l'alternative accessible.
- Conservation des routes, slugs, IDs existants, corrections, questions et cartes.

## Liens laboratoire/outils ajoutes

| Theme | Liens ajoutes |
| --- | --- |
| Melanges et solutions | `/laboratoire/melanges` |
| Propriete de la matiere | `/laboratoire/diffusion-temperature` |
| Transformations | `/laboratoire/test-ions` |
| Circuits electriques | `/laboratoire/loi-ohm` |
| Energie | `/laboratoire/chaines-energetiques` |
| Lumiere | `/laboratoire/refraction-lumiere` |
| Signaux sonores | `/laboratoire/oscilloscope` |
| Mouvement | `/laboratoire/chronophotographie` |
| Mesures 6e | `/outils-methodes/kit-scientifique` |
| Astronomie | `/laboratoire/systeme-solaire` |

## Validation

- `npm.cmd test -- tests\contenus-college-5e-6e-v3.test.mjs` : OK, 193 tests passes via le script global.
- `npm.cmd test` : OK, 193 tests passes.
- `npm.cmd run verify:content` : OK, 34 666 controles, 0 erreur, 0 avertissement.
- `npm.cmd run build` : OK, 314 pages generees.

Notes de `verify:content` : 112 chapitres controles, 101 PC, 11 mathematiques, 150 routes publiques attendues, 25 applications laboratoire. Le contrat contenu signale 16 chapitres `adaptes` et 0 bloquant : ce sont les 16 chapitres 5e-6e enrichis avec le contrat V3.

## Procedure de retour arriere

Revenir aux versions precedentes des fichiers JSON du lot :

- `src/data/chapters/college/5eme/**/{meta,exercices,quiz,flashcards}.json`
- `src/data/chapters/college/6eme/**/{meta,exercices,quiz,flashcards}.json`
- `tests/contenus-college-5e-6e-v3.test.mjs`
- ce rapport et l'entree README associee.

Aucune route, page active, composant ou contenu hors 5e-6e PC n'a ete modifie dans le cadre de ce prompt.

## Notes par critere

| Critere | Note | Justification |
| --- | ---: | --- |
| Architecture et maintenabilite | 9.4/10 | Les champs V3 sont ajoutes dans les donnees existantes sans nouvelle source de verite ni changement d'adaptateur. |
| UX, UI et coherence du design | 9.1/10 | Les liens labo/outils enrichissent les parcours sans modifier l'interface active ni les routes. |
| Qualite pedagogique et scientifique | 9.3/10 | Objectifs, prerequis et lecons sont alignes avec les domaines du BO college et adaptes aux niveaux 5e-6e. |
| Accessibilite et DYS | 9.4/10 | Les SVG d'exercices disposent de `title`, `desc`, `schemaAlt` ou `accessibility.altText`; le test le verifie. |
| Qualite technique globale | 9.5/10 | Pas de HTML dangereux ajoute, ressources en acces gratuit, IDs conserves, tests et build OK. |
| Completude, migration et validation | 9.6/10 | 16 chapitres, exercices, quiz, flashcards et liens traites ; 193 tests, verify content et build passent. |
