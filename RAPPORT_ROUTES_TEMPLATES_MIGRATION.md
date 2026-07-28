# Rapport routes et templates avant coexistence explicite

## 1. Resume executif

Cette passe reduit l'asymetrie entre Physique-Chimie et Mathematiques sans supprimer les URL historiques. Les chapitres Physique-Chimie restent servis par `/college/...` et `/lycee/...`, et une route explicite `/physique-chimie/{cycle}/{niveau}/{matiere}/{chapitre}` est preparee sur le meme contenu. Les pages de chapitres utilisent une facade commune afin d'eviter de multiplier quatre templates proches.

## 2. Cartographie des routes et chargeurs

| Famille | Routes publiques | Chargeur principal | Source de contenu | Canonical actuel |
|---|---|---|---|---|
| Physique-Chimie legacy college | `/college/[niveau]/[matiere]/[chapitre]` | `src/pages/college/[niveau]/[matiere]/[chapitre].astro` | `src/data/chapters/college/**` | URL legacy |
| Physique-Chimie legacy lycee | `/lycee/[niveau]/[matiere]/[chapitre]` | `src/pages/lycee/[niveau]/[matiere]/[chapitre].astro` | `src/data/chapters/lycee/**` | URL legacy |
| Physique-Chimie explicite | `/physique-chimie/[cycle]/[niveau]/[matiere]/[chapitre]` | `src/pages/physique-chimie/[cycle]/[niveau]/[matiere]/[chapitre].astro` | `src/data/chapters/**` | URL explicite |
| Mathematiques college | `/mathematiques/college/[niveau]/[chapitre]` | `src/pages/mathematiques/college/[niveau]/[chapitre].astro` | `src/data/mathematiques/chapters/college/**` | URL mathematiques |
| Mathematiques lycee | `/mathematiques/lycee/[niveau]/[chapitre]` | `src/pages/mathematiques/lycee/[niveau]/[chapitre].astro` | `src/data/mathematiques/chapters/lycee/**` | URL mathematiques |
| Laboratoire generique ou composant dedie | `/laboratoire/[slug]` | `src/pages/laboratoire/[slug].astro` | `src/data/laboratoire/apps.ts` | URL laboratoire |
| Laboratoire page explicite | `/laboratoire/{slug}` | `src/pages/laboratoire/{slug}.astro` | `src/data/laboratoire/apps.ts` | URL laboratoire |
| Memorisation canonique | `/memorisation/mega-quiz`, `/memorisation/mega-flashcards`, `/memorisation/revision-du-jour` | `src/pages/memorisation/*.astro` | `src/data/chapters/**` | URL memorisation |
| Memorisation legacy | `/mega-quiz`, `/mega-flashcards` | `src/pages/mega-quiz.astro`, `src/pages/mega-flashcards.astro` | redirection 301 | URL memorisation |

## 3. Couche commune de resolution

`src/data/contentRoutes.ts` centralise le contexte de route :

| Element | Role |
|---|---|
| `getPhysicalScienceRouteContext` | Construit le contexte discipline, cycle, niveau, matiere, chapitre et canonical Physique-Chimie |
| `getMathematicsRouteContext` | Construit le contexte Mathematiques sans matiere obligatoire |
| `getChapterNavigation` | Calcule precedent/suivant a partir de l'ordre des chapitres |
| `getPublishedMathematicsLevels` | Filtre les niveaux mathematiques publies selon statut et contenu reel |
| `getFuturePhysicalScienceRedirects` | Prepare les futures redirections legacy vers `/physique-chimie/...` |

## 4. Facade de template

`src/components/pedagogie/ChapterPageShell.astro` porte la structure commune des pages de chapitre : layout, fil d'Ariane, onglets, cours, exercices, quiz, flashcards et navigation precedent/suivant. Les pages Physique-Chimie et Mathematiques conservent leurs extensions propres par les props transmises a cette facade.

## 5. SEO et redirections

| Decision | Etat |
|---|---|
| Anciennes URL `/college` et `/lycee` | conservees et fonctionnelles |
| Nouvelles URL `/physique-chimie/...` | generees depuis la meme source de contenu |
| Canonical des URL legacy | conserve sur l'URL legacy pendant la coexistence |
| Canonical des URL explicites | pointe vers `/physique-chimie/...` |
| Redirections memorisation legacy | `/mega-quiz` et `/mega-flashcards` redirigent en 301 |
| Redirections PC legacy -> explicite | preparees dans `src/config/redirects.ts`, non activees globalement |

## 6. Laboratoire

La distinction des routes laboratoire ne depend plus d'une liste manuelle de slugs reserves dans `[slug].astro`. Le catalogue `src/data/laboratoire/apps.ts` porte maintenant l'intention de rendu avec `renderer`, ce qui permet de deriver les routes generiques, dediees ou explicites depuis les donnees.

## 7. Mathematiques

Les niveaux mathematiques restent dans la configuration, mais seuls les niveaux avec contenu publie sont exposes comme pages de niveau. Les niveaux sans chapitre restent planifies et ne produisent pas de page vide indexable.

## 8. Garde-fous ajoutes

| Controle | Fichier |
|---|---|
| Tests de contexte legacy/explicite, redirections, navigation, niveaux maths, laboratoire | `tests/route-symmetry.test.mjs` |
| Snapshot dist mis a jour pour 314 pages | `tests/fixtures/dist-routes.snapshot.json` |
| Audit des redirections et exception H1 miroir | `scripts/audit-dist.mjs` |
| Echantillon smoke de la route `/physique-chimie/...` | `tests/fixtures/dist-audit.config.json` |

