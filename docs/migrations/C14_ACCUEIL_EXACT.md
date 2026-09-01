# C14 — Accueil exact : CTA neutre et couverture réelle

## CONTEXTE / COMMIT DE DÉPART

- Dépôt : `lbelhomme-pc/physique-chimie`
- Branche de travail : `audit-2026-c01-route-snapshot`
- Base C14 : `af4f4b7a8ea2ccb00b6af55017ee6c94639e71d8` (`C13: document Unicode JSON-LD GO`)
- Mission du plan : corriger l’accueil afin que le CTA principal soit neutre entre Mathématiques et Physique-Chimie et qu’aucune promesse de couverture ne dépasse les contenus réellement publiés.

## OBJECTIF UNIQUE

Rendre la page d’accueil factuellement exacte sans modifier les routes, la progression, les contenus pédagogiques ni le design structurel :

1. supprimer le biais du CTA principal vers Physique-Chimie ;
2. rendre la promesse Mathématiques dépendante des niveaux réellement publiés ;
3. retirer les formulations marketing non démontrées ;
4. rendre les compteurs visibles dépendants des données actives plutôt que de valeurs éditoriales arbitraires.

## DÉFAUTS CONSTATÉS AVANT C14

Dans `src/pages/index.astro` :

- le CTA principal était `Explorer la Physique-Chimie` et pointait vers `/physique-chimie` ;
- la carte Mathématiques promettait `Cours, méthodes et entraînement pour progresser du collège au lycée` alors que la publication Maths était limitée aux niveaux réellement disponibles ;
- la description et le hero utilisaient `plateforme complète` ;
- la section disciplines annonçait `pour tous les niveaux` ;
- la section méthode utilisait `Une méthode éprouvée` et `parcours d'apprentissage complet` ;
- la section statistiques utilisait `recommandé par les enseignants` et `conforme aux programmes officiels` sans preuve directe à afficher sur l’accueil ;
- `labCount` était fixé manuellement à `25`.

## MODIFICATIONS APPLIQUÉES

### CTA principal

Le CTA principal est désormais :

- libellé : `Choisir une matière` ;
- cible : `#plateforme`.

Le CTA secondaire reste :

- libellé : `Rechercher un chapitre` ;
- cible : `#recherche`.

Le hero ne favorise donc plus une discipline avant le choix utilisateur.

### Promesse Mathématiques calculée depuis l’état publié

L’accueil réutilise désormais le contrat déjà présent :

- `getPublishedMathematicsLevels(...)` ;
- les métadonnées de chapitres réellement chargées ;
- le filtre `publishedMathLevelKeys`.

Une collection `publishedMathChapters` est construite à partir des seuls chapitres appartenant à des niveaux disponibles. La carte Mathématiques utilise ensuite `mathCoverageText`, calculé depuis :

- `publishedMathChapters.length` ;
- les labels de `publishedMathLevels`.

Ainsi, C14 n’introduit pas une nouvelle promesse figée telle que « Seconde uniquement ». Lorsque les missions de contenus ultérieures publieront réellement d’autres niveaux, le texte d’accueil s’élargira automatiquement à partir du même état de publication.

### Formulations rendues factuelles

Les formulations non démontrées ont été remplacées par des informations observables :

- `plateforme complète` → description des ressources et indication que seuls les niveaux publiés sont affichés ;
- `pour tous les niveaux` → les cartes reflètent les contenus actuellement publiés ;
- `Une méthode éprouvée` → `Un parcours pour apprendre et réviser` ;
- `parcours d'apprentissage complet` → liste des familles de ressources selon disponibilité ;
- `Conçu pour les élèves, recommandé par les enseignants` → `Ce qui est actuellement publié` ;
- la conformité globale non démontrée depuis l’accueil est remplacée par une explication de la provenance des compteurs.

### Compteur laboratoire

`labCount = 25` a été remplacé par :

`labApps.filter((app) => app.status === "migrated").length`

Le nombre affiché dépend donc désormais du manifeste actif des laboratoires migrés.

## ÉTAT À PRÉSERVER

- un seul H1 ;
- les deux cartes Mathématiques et Physique-Chimie ;
- l’Enseignement scientifique rattaché à l’espace Physique-Chimie ;
- la recherche globale ;
- le visuel hero WebP + fallback PNG ;
- les routes publiques existantes ;
- le layout et la charte visuelle de l’accueil ;
- les compteurs de chapitres/niveaux calculés depuis les ressources ;
- aucune modification de progression ou de contenu pédagogique.

## INTERDICTIONS RESPECTÉES

- aucune création de contenu Maths fictif ;
- aucun niveau `planned` présenté comme publié ;
- aucun changement des routes canoniques ;
- aucun changement de localStorage/progression ;
- aucune duplication d’un second système de publication ;
- aucun chiffre marketing inventé ;
- aucune modification visuelle structurelle nécessaire à C14.

## TESTS RENFORCÉS

`tests/home-public-v3.test.mjs` vérifie désormais explicitement :

1. le CTA principal `Choisir une matière` vers `#plateforme` ;
2. l’absence d’un CTA principal vers `/physique-chimie` ;
3. la construction de la promesse Maths à partir de `getPublishedMathematicsLevels`, `publishedMathChapters` et `mathCoverageText` ;
4. l’absence de l’ancienne promesse `du collège au lycée` dans la carte Maths ;
5. l’absence des formulations `plateforme complète`, `pour tous les niveaux`, `méthode éprouvée`, `parcours d'apprentissage complet`, `recommandé par les enseignants` et `conforme aux programmes officiels` ;
6. la dérivation de `labCount` depuis `labApps` migrés ;
7. la conservation des routes publiques et des ancres `#recherche` / `#plateforme` ;
8. le visuel hero optimisé et accessible ;
9. l’absence de faux chiffres/prix marketing ;
10. l’absence des anciens menus dupliqués.

## COMMITS C14

- `556bdf9eef03c5fe964e24186e2ca57918226a65` — `C14: make homepage claims exact and CTA neutral`
- `b40720cda4916728020035601089f308c9c5a3f5` — `C14: lock neutral homepage CTA and exact claims`

## VALIDATION CI

Workflow GitHub Actions : run `33527014673` sur le commit `b40720cda4916728020035601089f308c9c5a3f5`.

- `quality` : PASS ;
- `dist-fast` : PASS ;
- `dist-a11y` : PASS.

## MIGRATION / RETOUR ARRIÈRE

Retour arrière complet C14 : revenir au commit `af4f4b7a8ea2ccb00b6af55017ee6c94639e71d8`.

Un retour arrière partiel supprimant seulement les tests n’est pas recommandé : l’accueil pourrait de nouveau sur-promettre silencieusement la couverture Mathématiques lors d’une modification éditoriale future.

## CRITÈRES GO / NO-GO

### GO

- CTA principal neutre entre les deux disciplines ;
- aucune carte ou phrase n’annonce des niveaux Maths non publiés ;
- la promesse Maths évolue depuis le contrat de publication existant ;
- aucun chiffre visible n’est maintenu manuellement lorsqu’une source active existe ;
- absence des formulations marketing non démontrées ciblées ;
- `quality`, `dist-fast` et `dist-a11y` verts ;
- aucune route, progression ou ressource pédagogique cassée.

### NO-GO

- CTA principal favorisant à nouveau une discipline ;
- mention `Mathématiques du collège au lycée` sans corpus correspondant ;
- niveau `planned` présenté comme disponible ;
- compteur de laboratoire désynchronisé de `labApps` ;
- retour d’une promesse marketing bloquée par les tests ;
- échec d’un des trois checks obligatoires.

## VALIDATION FINALE

**Décision : GO.**

C14 rend l’accueil cohérent avec l’état réel de publication tout en préparant sa montée en charge future : les prochaines missions de contenus Maths n’exigeront pas de réécrire manuellement la promesse de couverture si elles utilisent correctement le contrat de niveaux publiés.

**C14 est terminé et validé.**
