# Rapport - Accueil public V3

Date : 2026-07-27

Prompt execute : `docs/refonte-v3/prompts/11-accueil-public-v3.md`

## Objectif

Refondre l'accueil public pour presenter immediatement la promesse de la plateforme : comprendre, s'entrainer, reviser et experimenter, sans prix invente ni faux chiffres marketing.

## Fichiers lus

- `docs/refonte-v3/prompts/11-accueil-public-v3.md`
- `docs/refonte-v3/04-audit-design-images.md`
- `docs/refonte-v3/06-design-system-v3.md`
- `docs/refonte-v3/reference/table-tokens-v3.md`
- `docs/refonte-v3/reference/rapport-navigation-publique-v3-2026-07-27.md`
- `src/pages/index.astro`
- `src/components/home/SubjectGateCard.astro`

## Fichiers crees

- `tests/home-public-v3.test.mjs`
- `public/images/accueil-v3-hero-sciences-2026-07-27.png`
- `public/images/accueil-v3-hero-sciences-2026-07-27.webp`
- `docs/refonte-v3/reference/captures/accueil-v3-avant-prompt11-2026-07-27.png`
- `docs/refonte-v3/reference/captures/accueil-v3-apres-desktop-2026-07-27.png`
- `docs/refonte-v3/reference/captures/accueil-v3-apres-mobile-2026-07-27.png`
- `docs/refonte-v3/reference/rapport-accueil-public-v3-2026-07-27.md`

## Fichiers modifies

- `src/pages/index.astro`
- `docs/refonte-v3/README.md`

## Accueil livre

| Zone | Contenu |
| --- | --- |
| Hero | H1 unique, promesse claire, actions vers Physique-Chimie, Mathematiques et recherche |
| Visuel | Asset scientifique local, WebP optimise a environ 78 Ko, fallback PNG |
| Methode | Quatre etapes : comprendre, s'entrainer, reviser, experimenter |
| Matieres | Deux portes d'entree : Mathematiques et Physique-Chimie |
| Niveaux | Acces College, Lycee, Mathematiques seconde avec compteurs issus des contenus reels |
| Ressources | Cours, exercices, memorisation, laboratoire, methodes et recherche |
| Gratuit / options | Acces gratuit affirme, options avancees indiquees comme a definir sans prix |

## Accessibilite et DYS

- H1 unique.
- Ancre `#recherche` conservee.
- Texte principal en contraste fort sur desktop et mobile.
- Focus clavier verifie sur les premiers liens.
- Image avec alternative textuelle explicite.
- Mobile sans debordement horizontal.

## Performance et images

- Le hero utilise `picture` avec WebP prioritaire.
- Fallback PNG conserve pour compatibilite.
- Le fichier WebP est borne sous 150 Ko par test.
- Aucun asset externe n'est charge pour le hero.

## Validations executees

- `npm.cmd test -- --test-reporter=spec tests/home-public-v3.test.mjs` : 121 tests OK, 0 echec.
- `npm.cmd run check` : OK, 0 erreur, 23 hints deja presents dans le projet.
- `npm.cmd run lint` : OK, 0 erreur, 23 warnings deja presents dans le projet.
- `npm.cmd run build` : OK, 314 pages generees.

## Revue visuelle

- Avant : `docs/refonte-v3/reference/captures/accueil-v3-avant-prompt11-2026-07-27.png`
- Apres desktop : `docs/refonte-v3/reference/captures/accueil-v3-apres-desktop-2026-07-27.png`
- Apres mobile : `docs/refonte-v3/reference/captures/accueil-v3-apres-mobile-2026-07-27.png`
- Desktop 1366 x 900 : aucun debordement horizontal, hero image chargee, H1 unique, liens principaux presents.
- Mobile 390 x 844 : aucun debordement horizontal, hero en une colonne, visuel scientifique en fond discret, H1 lisible.
- Le bandeau de consentement analytique reste un element global existant et n'a pas ete modifie par ce prompt.

## Liens verifies

- `/college`
- `/lycee`
- `/mathematiques`
- `/mathematiques/lycee/2nde`
- `/laboratoire`
- `/outils-methodes`
- `/memorisation`
- `/profil`
- `#recherche`

## Evaluation selon les criteres du projet

| Critere | Note | Justification |
| --- | --- | --- |
| Coherence avec l'existant | 9/10 | Reutilise `BaseLayout`, la navigation V3, `SubjectGateCard`, `GlobalSearch`, `ResumeLearning` et `Dashboard`. |
| Qualite UX | 9/10 | Proposition de valeur immediate, chemins clairs par matiere, niveau et ressource. |
| Qualite UI | 9/10 | Direction lumineuse et scientifique, tokens V3, rayons moderes, visuel credible. |
| Accessibilite | 9/10 | H1 unique, focus clavier, alt image, ancre conservee, mobile sans debordement. |
| Performance | 9/10 | Hero WebP optimise, pas de dependance externe, build statique conservee. |
| Migration | 9/10 | Ancres utiles et anciennes routes conservees, aucun contenu de chapitre modifie. |

## Points restants

- Le bloc compte/options avancees reste volontairement prudent ; il devra etre precise lors des prompts comptes, premium et authentification.
- Le bandeau de consentement global peut masquer une partie basse du premier ecran mobile, mais il n'entre pas dans le perimetre de ce prompt.
