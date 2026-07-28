# Rapport prompt 07 - Routes et redirections canoniques

Date : 2026-07-27.

## Objectif

Definir la strategie route V3 et les redirections testees, sans supprimer les anciennes pages.

## Fichiers analyses

- `src/data/contentRoutes.ts`
- `src/config/redirects.ts`
- `src/pages/college/[niveau]/[matiere]/[chapitre].astro`
- `src/pages/lycee/[niveau]/[matiere]/[chapitre].astro`
- `src/pages/physique-chimie/[cycle]/[niveau]/[matiere]/[chapitre].astro`
- `src/pages/404.astro`
- `scripts/verify-routes-and-content.mjs`
- `tests/route-symmetry.test.mjs`
- `docs/refonte-v3/reference/inventaire-routes-contenus.md`

## Decisions

- Physique-chimie V3 cible la route explicite `/physique-chimie/<cycle>/<niveau>/<matiere>/<chapitre>`.
- Les routes legacy `/<cycle>/<niveau>/<matiere>/<chapitre>` restent actives et ne sont pas supprimees.
- Les redirections physique-chimie legacy -> explicite sont preparees en `301`, mais non activees.
- Les redirections memorisation `/mega-quiz` et `/mega-flashcards` restent actives en `301`.
- La page `404` est conservee comme route technique noindex, hors carte canonique de publication.

## Modifications realisees

- `src/data/contentRoutes.ts`
  - Ajout de `V3_ROUTE_STRATEGY`.
  - Ajout de `PhysicalScienceChapterRouteInput`.
  - Ajout de `PhysicalScienceRoutePair`.
  - Ajout de `getPhysicalScienceRoutePair` et `getPhysicalScienceRoutePairs`.

- `src/config/redirects.ts`
  - Ajout de `normalizeRoutePath`.
  - Ajout de `getPhysicalScienceKnownRoutes`.
  - Ajout de `findRedirectTargetIssues`.
  - Typage des redirections preparees sur les entrees de chapitres physique-chimie.

- `tests/route-symmetry.test.mjs`
  - Test de strategie V3 : canonique explicite, legacy active-compatible, redirection prepared.
  - Test obligatoire : chaque redirection active ou preparee a une cible interne existante.
  - Test 404 : page presente et non utilisee comme cible canonique.

- `scripts/verify-routes-and-content.mjs`
  - Controle des redirections actives et preparees.
  - Verification que les routes legacy physique-chimie existent encore avant activation.
  - Ajout des compteurs `redirects` au rapport `verify:content`.

- `docs/refonte-v3/reference/carte-routes-redirections-v3.md`
  - Carte de routes V3, routes conservees, futures redirections et 404.

## Resultats

Etat verifie :

```text
Routes publiques attendues : 150
Routes dynamiques : 14
Chapitres physique-chimie : 101
Chapitres mathematiques : 11
Laboratoires : 25
Redirections actives : 2
Redirections physique-chimie preparees : 101
Cibles manquantes : 0
```

Comparaison avant / apres :

- Avant : routes legacy et explicites deja presentes, redirections memorisation actives, redirections PC preparees mais peu auditees globalement.
- Apres : meme comportement public, aucun retrait de route, mais controle systematique des cibles de redirection et de la conservation legacy.

## Validations

```text
npm.cmd run verify:content
Resultat : 34666 checks, 0 errors, 0 warnings
Note : Redirections verifiees : 2 actives, 101 preparees, 0 cible manquante
```

```text
npm.cmd run build
Resultat : 314 pages generees, build OK
```

```text
npm.cmd test
Resultat : 102 tests, 102 passes, 0 fail
```

## Points de vigilance

- Ne pas activer les 101 redirections physique-chimie tant que la navigation publique, le SEO et la progression locale n'ont pas ete valides sur les deux familles de routes.
- Si les routes legacy sont un jour retirees, elles devront d'abord sortir de `active-compatible` et entrer dans une phase d'activation documentee.
- Les breadcrumbs des pages legacy et explicites restent a harmoniser dans les prompts UI/navigation, sans changer les routes ici.

