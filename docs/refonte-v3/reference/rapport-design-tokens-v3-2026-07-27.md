# Rapport - Design tokens V3

Date : 2026-07-27

Prompt execute : `docs/refonte-v3/prompts/08-design-tokens-v3.md`

## Objectif

Mettre en place une couche de design tokens V3 compatible avec le design system actuel, sans refactorisation active des composants ni rupture des variables historiques.

## Fichiers lus

- `src/styles/design-system.css`
- `src/data/accessibility/theme-tokens.ts`
- `src/components/accessibility/theme-tokens.ts`
- `docs/refonte-v3/06-design-system-v3.md`

## Fichiers crees

- `src/styles/tokens-v3.css`
- `src/data/accessibility/tokens-v3.ts`
- `docs/refonte-v3/reference/table-tokens-v3.md`
- `docs/refonte-v3/reference/rapport-design-tokens-v3-2026-07-27.md`
- `docs/refonte-v3/prototypes/tokens-v3-preview.html`
- `tests/design-tokens-v3.test.mjs`

## Fichiers modifies

- `src/styles/design-system.css`
- `src/data/accessibility/theme-tokens.ts`
- `src/components/accessibility/theme-tokens.ts`
- `docs/refonte-v3/README.md`

## Decisions

- Les tokens V3 sont prefixes par `--v3-*` pour eviter les collisions avec le systeme courant.
- Les variables historiques restent aliasees pour preparer la migration.
- `tokens-v3.css` est importe dans `design-system.css` avant les declarations existantes : les pages ont acces aux nouveaux tokens, mais les styles actifs conservent leur comportement historique.
- La cible V3 fixe `--v3-letter-spacing-body` a `0`.
- La pile DYS V3 ne depend pas d'un CDN de police.
- Les couleurs de pedagogie utilisent plusieurs familles de teintes : bleu, cyan, vert, violet, ambre et rouge. Cela evite une palette monotone.

## Prototype

Prototype statique : `docs/refonte-v3/prototypes/tokens-v3-preview.html`

Il presente :

- surfaces ;
- boutons et etats ;
- accents par discipline ;
- blocs pedagogiques ;
- exemple de rendu DYS ;
- focus clavier.

## Table de tokens

Voir `docs/refonte-v3/reference/table-tokens-v3.md`.

## Validations executees

- `npm.cmd test -- --test-reporter=spec tests/design-tokens-v3.test.mjs` : OK, 107 tests passes.
- `npm.cmd run check` : OK, 0 erreur, 23 indications deja presentes sur l'existant.
- `npm.cmd run build` : OK, 314 pages construites.
- Revue visuelle rapide du prototype avec Edge en mode headless :
  - desktop 1366 x 900 : pas de debordement horizontal, blocs alignes ;
  - mobile 390 x 844 : grille repliee en une colonne, largeur de page stable ;
  - `letter-spacing` rendu par defaut : `normal`, correspondant a la cible `0`.

## Points restants

- L'ancien `design-system.css` contient encore des imports de polices externes. Le prompt 8 cree la cible V3 sans CDN, mais ne supprime pas encore ces imports pour ne pas modifier brutalement le rendu actif.
- Les composants actifs pourront migrer progressivement de `--bg-*` et `--accent-*` vers `--v3-*`.
