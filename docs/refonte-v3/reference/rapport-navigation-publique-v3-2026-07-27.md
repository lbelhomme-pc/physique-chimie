# Rapport - Navigation publique V3

Date : 2026-07-27

Prompt execute : `docs/refonte-v3/prompts/10-navigation-publique-v3.md`

## Objectif

Concevoir et integrer une navigation publique V3 claire pour les matieres, niveaux, ressources, recherche, laboratoire et futur compte, sans supprimer les anciennes routes.

## Fichiers lus

- `docs/refonte-v3/prompts/10-navigation-publique-v3.md`
- `docs/refonte-v3/07-arborescence-fonctionnelle-v3.md`
- `docs/refonte-v3/08-arborescence-technique-v3.md`
- `src/layouts/BaseLayout.astro`
- `src/components/navigation/SubjectSwitcher.astro`
- `src/components/navigation/SubjectContext.ts`
- `src/pages/index.astro`

## Fichiers crees

- `src/components/navigation/PublicNavigationV3.astro`
- `tests/public-navigation-v3.test.mjs`
- `docs/refonte-v3/reference/rapport-navigation-publique-v3-2026-07-27.md`
- `docs/refonte-v3/reference/captures/navigation-v3-desktop-2026-07-27.png`
- `docs/refonte-v3/reference/captures/navigation-v3-mobile-2026-07-27.png`

## Fichiers modifies

- `src/layouts/BaseLayout.astro`
- `docs/refonte-v3/README.md`

## Navigation livree

| Zone | Contenu |
| --- | --- |
| Marque | Retour accueil, nom court du site, signal "Sciences et maths" |
| Switch matiere | Reutilisation de `SubjectSwitcher` |
| Menu Matieres | Mathematiques, Physique-Chimie, Enseignement scientifique |
| Menu Niveaux | College, 6e, 5e, 4e, 3e, lycee, 2nde, 1ere spe, Terminale spe |
| Menu Ressources | Methodes, kit scientifique, memorisation, methodes maths, tableau periodique |
| Liens directs | Recherche, laboratoire, compte futur |
| Contexte | Matiere, cycle, niveau et type de ressource inferes depuis la route |

## Accessibilite

- Lien d'evitement vers le contenu principal.
- Navigation declaree avec `aria-label`.
- Menus natifs `details/summary`, utilisables au clavier sans script global.
- Liens et resumes avec focus visible via tokens V3.
- Contexte de navigation explicite pour lecteur d'ecran.

## Migration

- Les routes V2 `/college`, `/lycee`, `/laboratoire`, `/outils-methodes`, `/memorisation` et `/profil` restent accessibles.
- Les routes explicites V3 `/mathematiques` et `/physique-chimie/...` restent compatibles avec les travaux precedents.
- Aucun contenu de chapitre n'a ete modifie.

## Validations executees

- `npm.cmd test -- --test-reporter=spec tests/public-navigation-v3.test.mjs` : 117 tests OK, 0 echec.
- `npm.cmd run check` : OK, 0 erreur, 23 hints deja presents dans le projet.
- `npm.cmd run lint` : OK, 0 erreur, 23 warnings deja presents dans le projet.
- `npm.cmd run build` : OK, 314 pages generees.

## Revue visuelle

- Captures :
  - `docs/refonte-v3/reference/captures/navigation-v3-desktop-2026-07-27.png`
  - `docs/refonte-v3/reference/captures/navigation-v3-mobile-2026-07-27.png`
- Desktop 1366 x 900 : navigation chargee avec styles V3, menu `Matieres` ouvert, aucun debordement horizontal (`scrollWidth = bodyWidth = 1366`), focus clavier visible.
- Mobile 390 x 844 : navigation en grille deux colonnes, menu `Niveaux` ouvert pleine largeur, panneau long borne a 420 px avec defilement interne, aucun debordement horizontal (`scrollWidth = bodyWidth = 390`).
- Le bandeau de consentement analytique reste un element global existant et n'est pas modifie par ce prompt.

## Points restants

- Le compte est expose comme entree future et renvoie vers le profil existant.
- Une page dediee "Enseignement scientifique" pourra etre creee plus tard ; la navigation pointe pour l'instant vers le niveau publie `1ere-ens-scientifique`.
