# Inventaire canonique des chemins et conventions du site Astro

## 1. Resume

- Fichiers source analyses : environ 842 fichiers dans `src/`, `laboratoire/`, `tests/` et `public/`.
- Dossiers source analyses : environ 233 dossiers dans les memes zones.
- Routes dynamiques reperees : 13 fichiers Astro dynamiques avec `getStaticPaths`.
- Zones a risque eleve : 8 zones principales.
- Conventions concurrentes reperees : 7 familles de conventions.
- Scripts verifies dans `package.json` : `dev`, `build`, `preview`, `astro`.
- Commande de build reelle : `npm run build`.
- Dossiers exclus de l'analyse detaillee : `node_modules/`, `dist/`, `.astro/`, `.git/`.
- `tmp/` : considere comme dossier d'artefacts, non inventorie en detail.

## 2. Routes dynamiques

| Route publique | Fichier Astro | Source de donnees | Methode de generation | Risque |
|---|---|---|---|---|
| `/college/[niveau]` | `src/pages/college/[niveau]/index.astro` | `src/data/levels.ts`, `src/data/chapters/**/meta.json` | `getStaticPaths()` depuis `collegeLevels`; chapitres filtres par segments de chemins | Eleve : depend des slugs de niveaux et des dossiers de chapitres |
| `/college/[niveau]/[matiere]` | `src/pages/college/[niveau]/[matiere]/index.astro` | `src/data/levels.ts`, `src/data/chapters/**/meta.json` | `getStaticPaths()` depuis `collegeLevels` et `matieres`; filtrage par `cycle/niveau/matiere` | Eleve : matiere et niveau doivent rester alignes avec les dossiers |
| `/college/[niveau]/[matiere]/[chapitre]` | `src/pages/college/[niveau]/[matiere]/[chapitre].astro` | `src/data/chapters/**/{meta.json,cours.mdx,exercices.json,quiz.json,flashcards.json}` | `getStaticPaths()` depuis `meta.json`; contenu charge par `basePath` | Tres eleve : route publique, SEO, progression et contenus dependent du meme slug |
| `/lycee/[niveau]` | `src/pages/lycee/[niveau]/index.astro` | `src/data/levels.ts`, `src/data/chapters/**/meta.json` | `getStaticPaths()` depuis `lyceeLevels`; chapitres filtres par cycle | Eleve : niveaux lycee sensibles et deja publics |
| `/lycee/[niveau]/[matiere]` | `src/pages/lycee/[niveau]/[matiere]/index.astro` | `src/data/levels.ts`, `src/data/chapters/**/meta.json` | `getStaticPaths()` depuis `lyceeLevels` et `matieres` | Eleve : dependance directe aux dossiers et aux slugs |
| `/lycee/[niveau]/[matiere]/[chapitre]` | `src/pages/lycee/[niveau]/[matiere]/[chapitre].astro` | `src/data/chapters/**/{meta.json,cours.mdx,exercices.json,quiz.json,flashcards.json}` | `getStaticPaths()` depuis `meta.json`; contenu charge par `basePath`; pagination entre chapitres | Tres eleve : route, canonical, navigation et progression |
| `/mathematiques/college/[niveau]` | `src/pages/mathematiques/college/[niveau]/index.astro` | `src/data/mathematiques/levels.ts`, `src/data/mathematiques/chapters/**/meta.json` | `getStaticPaths()` depuis `getMathematicsLevelsByCycle("college")` | Eleve : nouvelle arborescence a stabiliser |
| `/mathematiques/college/[niveau]/[chapitre]` | `src/pages/mathematiques/college/[niveau]/[chapitre].astro` | `src/data/mathematiques/chapters/college/**/{meta.json,cours.mdx,exercices.json,quiz.json,flashcards.json}` | `getStaticPaths()` depuis `chapterEntryFromGlob()` | Tres eleve : convention maths differente de la physique-chimie |
| `/mathematiques/lycee/[niveau]` | `src/pages/mathematiques/lycee/[niveau]/index.astro` | `src/data/mathematiques/levels.ts`, `src/data/mathematiques/chapters/**/meta.json` | `getStaticPaths()` depuis `getMathematicsLevelsByCycle("lycee")` | Eleve : chemins publics definis dans les donnees de niveaux |
| `/mathematiques/lycee/[niveau]/[chapitre]` | `src/pages/mathematiques/lycee/[niveau]/[chapitre].astro` | `src/data/mathematiques/chapters/lycee/**/{meta.json,cours.mdx,exercices.json,quiz.json,flashcards.json}` | `getStaticPaths()` depuis `chapterEntryFromGlob()` | Tres eleve : canonical, progression et contenu lies |
| `/laboratoire/[slug]` | `src/pages/laboratoire/[slug].astro` | `src/data/laboratoire/apps.ts`, `src/data/laboratoire/genericConfigs.ts` | `getStaticPaths()` depuis `labApps`, hors routes explicites | Tres eleve : coexistence entre pages Astro migrees et legacy `laboratoire/` |
| `/outils-methodes/methodes-maths-college/[fiche]` | `src/pages/outils-methodes/methodes-maths-college/[fiche].astro` | `src/data/methodesMathsCollege.ts` | `getStaticPaths()` depuis `methodesMathsCollege` | Moyen : fiches publiques dependantes de slugs TypeScript |
| `/outils-methodes/methodes-maths-lycee/[fiche]` | `src/pages/outils-methodes/methodes-maths-lycee/[fiche].astro` | `src/data/methodesMathsLycee.ts` | `getStaticPaths()` depuis `methodesMathsLycee` | Moyen : fiches publiques dependantes de slugs TypeScript |

Routes publiques statiques sensibles a conserver : `/`, `/college`, `/lycee`, `/mathematiques`, `/mathematiques/college`, `/mathematiques/lycee`, `/laboratoire`, `/outils-methodes`, `/memorisation/*`, `/profil`.

## 3. Sources de contenu

| Zone | Chemin actuel | Type de contenu | Format dominant | Route associee | Risque de deplacement |
|---|---|---|---|---|---|
| Physique-chimie college | `src/data/chapters/college/{niveau}/{matiere}/{chapitre}/` | Cours, exercices, quiz, flashcards, SEO | `meta.json`, `cours.mdx`, `exercices.json`, `quiz.json`, `flashcards.json` | `/college/[niveau]/[matiere]/[chapitre]` | Tres eleve |
| Physique-chimie lycee | `src/data/chapters/lycee/{niveau}/{matiere}/{chapitre}/` | Cours, exercices, quiz, flashcards, fragments HTML legacy | `meta.json`, `cours.mdx`, `cours.fragment.html`, JSON | `/lycee/[niveau]/[matiere]/[chapitre]` | Tres eleve |
| Mathematiques college | `src/data/mathematiques/chapters/college/{niveau}/{chapitre}/` | Cours, exercices, quiz, flashcards | Meme famille de fichiers, sans segment `matiere` | `/mathematiques/college/[niveau]/[chapitre]` | Eleve |
| Mathematiques lycee | `src/data/mathematiques/chapters/lycee/{niveau}/{chapitre}/` | Cours, exercices, quiz, flashcards | `meta.json`, `cours.mdx`, `exercices.json`, `quiz.json`, `flashcards.json` | `/mathematiques/lycee/[niveau]/[chapitre]` | Eleve |
| Laboratoire Astro | `src/components/laboratoire/`, `src/scripts/laboratoire/`, `src/styles/laboratoire/`, `src/data/laboratoire/` | Simulations migrees, configurations, scripts modeles | Astro, JS, CSS, TypeScript | `/laboratoire`, `/laboratoire/[slug]` | Tres eleve |
| Laboratoire legacy | `laboratoire/` | Anciennes simulations autonomes HTML/CSS/JS | HTML, CSS, JS | References par `legacyPath` dans `src/data/laboratoire/apps.ts` | Tres eleve |
| Outils et methodes | `src/pages/outils-methodes/`, `src/data/outilsMethodes.ts`, `src/data/methodesMathsCollege.ts`, `src/data/methodesMathsLycee.ts` | Pages methodologiques, fiches dynamiques | Astro et TypeScript | `/outils-methodes/*` | Moyen |
| Memorisation | `src/pages/memorisation/`, `src/pages/mega-quiz.astro`, `src/pages/mega-flashcards.astro`, `src/components/pedagogie/*Player.tsx` | Revision, quiz globaux, flashcards globales | Astro, React, JSON globs | `/memorisation/*`, `/mega-quiz`, `/mega-flashcards` | Eleve |
| Assets publics | `public/` | Favicons, manifest, images publiques | PNG, SVG, ICO, TXT | Toutes les routes via assets absolus | Moyen |
| Artefacts temporaires | `tmp/` | Artefacts de travail | Varie | Aucune route publique directe identifiee | Faible, mais ne pas lister en detail |

Comptages de contenus releves :

| Famille de fichiers | `src/data/chapters/` | `src/data/mathematiques/chapters/` |
|---|---:|---:|
| `meta.json` | 101 | 11 |
| `cours.mdx` | 101 | 11 |
| `cours.fragment.html` | 21 | 0 |
| `exercices.json` | 101 | 11 |
| `quiz.json` | 101 | 11 |
| `flashcards.json` | 101 | 11 |

## 4. Fichiers de donnees structurants

| Fichier | Role organisationnel | Utilise par | Sensibilite |
|---|---|---|---|
| `src/data/levels.ts` | Definit niveaux college/lycee PC et matieres `physique`, `chimie`; les slugs doivent correspondre aux dossiers | Pages `src/pages/college/**`, `src/pages/lycee/**`, dashboard | Tres elevee |
| `src/data/mathematiques/levels.ts` | Definit niveaux maths, labels, chemins publics et activation | Pages `src/pages/mathematiques/**` | Tres elevee |
| `src/data/mathematiques/content.ts` | Convertit les chemins de `meta.json` en entrees de chapitres; normalise exercices, quiz, flashcards | Routes de chapitres et niveaux maths | Tres elevee |
| `src/data/mathematiques/paths.ts` | Centralise `MATHEMATICS_ROOT`, chemins et `chapterId` maths | Cartes maths, routes de chapitres maths | Elevee |
| `src/data/laboratoire/apps.ts` | Catalogue des simulations, routes publiques, slugs, `legacyPath`, statuts | `/laboratoire`, `/laboratoire/[slug]`, pages de simulations dediees | Tres elevee |
| `src/data/laboratoire/genericConfigs.ts` | Configuration des simulateurs generiques par slug laboratoire | `src/pages/laboratoire/[slug].astro`, `GenericLabSimulator.astro` | Tres elevee |
| `src/data/gamification/engine.ts` | Moteur XP, progression par `chapterId`, dernier chapitre | `CoursTracker`, `QuizPlayer`, `FlashcardsPlayer`, `Dashboard` | Tres elevee |
| `src/data/gamification/srs.ts` | Stockage SRS par `chapterId::cardId` | Flashcards et revision | Tres elevee |
| `src/data/outilsMethodes.ts` | Liste des pages outils et methodes | Index `/outils-methodes` | Moyenne |
| `src/data/methodesMathsCollege.ts` | Slugs et contenus des fiches dynamiques college | `/outils-methodes/methodes-maths-college/[fiche]` | Moyenne |
| `src/data/methodesMathsLycee.ts` | Slugs et contenus des fiches dynamiques lycee | `/outils-methodes/methodes-maths-lycee/[fiche]` | Moyenne |
| `src/data/accessibility/theme-tokens.ts` | Tokens de theme accessibilite | Composants accessibilite | Moyenne |
| `src/components/accessibility/theme-tokens.ts` | Convention concurrente avec le fichier de donnees accessibilite | Composants accessibilite | Moyenne |

## 5. Globs et chemins codes en dur

| Fichier | Expression trouvee | Chemin dependant | Impact si deplacement |
|---|---|---|---|
| `src/pages/index.astro` | `import.meta.glob("/src/data/chapters/**/meta.json")` | `src/data/chapters/` | Dashboard et compteurs PC incomplets |
| `src/pages/index.astro` | `import.meta.glob("/src/data/chapters/**/flashcards.json")` | `src/data/chapters/**/flashcards.json` | Perte des IDs de flashcards SRS |
| `src/pages/index.astro` | `import.meta.glob("/src/data/mathematiques/chapters/**/meta.json")` | `src/data/mathematiques/chapters/` | Compteurs maths faux |
| `src/pages/college/[niveau]/[matiere]/[chapitre].astro` | `import.meta.glob("/src/data/chapters/**/cours.mdx")` et JSON associes | `src/data/chapters/college/...` | Chapitres college vides ou 404 |
| `src/pages/lycee/[niveau]/[matiere]/[chapitre].astro` | `import.meta.glob("/src/data/chapters/**/cours.mdx")` et JSON associes | `src/data/chapters/lycee/...` | Chapitres lycee vides ou 404 |
| `src/pages/college/[niveau]/[matiere]/[chapitre].astro` | ``basePath = `/src/data/chapters/college/${niveau}/${matiere}/${chapitre}``` | Structure PC a 4 segments | Tout deplacement casse le chargement |
| `src/pages/lycee/[niveau]/[matiere]/[chapitre].astro` | ``basePath = `/src/data/chapters/lycee/${niveau}/${matiere}/${chapitre}``` | Structure PC a 4 segments | Tout deplacement casse le chargement |
| `src/pages/mathematiques/college/[niveau]/[chapitre].astro` | `import.meta.glob("/src/data/mathematiques/chapters/college/**/meta.json")` | Structure maths college a 3 segments | Routes maths college non generees |
| `src/pages/mathematiques/lycee/[niveau]/[chapitre].astro` | `import.meta.glob("/src/data/mathematiques/chapters/lycee/**/meta.json")` | Structure maths lycee a 3 segments | Routes maths lycee non generees |
| `src/data/mathematiques/content.ts` | `.replace("/src/data/mathematiques/chapters/", "")` | Racine maths exacte | Parsing des segments invalide |
| `src/pages/mega-quiz.astro` | `import.meta.glob("../data/chapters/**/quiz.json")` | Quiz PC uniquement | Mega quiz ignore un nouveau chemin |
| `src/pages/mega-flashcards.astro` | `import.meta.glob("../data/chapters/**/flashcards.json")` | Flashcards PC uniquement | Mega flashcards ignore un nouveau chemin |
| `src/data/laboratoire/apps.ts` | `route: "/laboratoire/..."` | Routes publiques laboratoire | Slug public casse si renomme |
| `src/data/laboratoire/apps.ts` | `legacyPath: "laboratoire/.../*.html"` | Dossier legacy racine `laboratoire/` | Perte du lien d'audit ou de fallback legacy |
| `src/components/laboratoire/*Simulator.astro` | `import "../../scripts/laboratoire/*.js"` | `src/scripts/laboratoire/` | Simulations migrees non initialisees |
| `src/components/laboratoire/*Simulator.astro` | `import "../../styles/laboratoire/*.css"` | `src/styles/laboratoire/` | Simulations sans styles |
| `src/scripts/pyodide-worker.ts` | `https://cdn.jsdelivr.net/pyodide/v${PYODIDE_VERSION}/full/` | CDN Pyodide externe | Python navigateur casse si version/URL change |
| `src/components/pedagogie/PyodideLab.tsx` | `new URL("../../scripts/pyodide-worker.ts", import.meta.url)` | Worker Pyodide | Laboratoire Python casse si chemin change |
| `tests/laboratoire/*.test.mjs` | `../../src/scripts/laboratoire/*-model.js` | Modeles de simulation | Tests laboratoire cassent si scripts bougent |
| `src/data/chapters/**/cours.mdx` | Liens Markdown `/laboratoire/...` | Routes laboratoire publiques | Liens de cours cassent si routes changent |

## 6. Imports relatifs profonds

| Fichier | Import profond | Cible | Risque |
|---|---|---|---|
| `src/pages/college/[niveau]/index.astro` | `../../../layouts/BaseLayout.astro`, `../../../components/ui/Breadcrumb.astro`, `../../../data/levels` | Layout, fil d'Ariane, niveaux | Moyen : sensible a un deplacement des pages niveau |
| `src/pages/college/[niveau]/[matiere]/index.astro` | `../../../../layouts/BaseLayout.astro`, `../../../../data/levels` | Layout et niveaux PC | Eleve |
| `src/pages/college/[niveau]/[matiere]/[chapitre].astro` | `../../../../components/pedagogie/*`, `../../../../data/levels` | Lecteurs cours/exercices/quiz/flashcards | Tres eleve |
| `src/pages/lycee/[niveau]/index.astro` | `../../../layouts/BaseLayout.astro`, `../../../data/levels` | Layout et niveaux lycee | Moyen |
| `src/pages/lycee/[niveau]/[matiere]/index.astro` | `../../../../layouts/BaseLayout.astro`, `../../../../data/levels` | Layout et niveaux PC | Eleve |
| `src/pages/lycee/[niveau]/[matiere]/[chapitre].astro` | `../../../../components/pedagogie/*`, `../../../../data/levels` | Lecteurs et progression | Tres eleve |
| `src/pages/mathematiques/college/index.astro` | `../../../data/mathematiques/*`, `../../../styles/mathematiques/mathematics.css` | Donnees et style maths | Moyen |
| `src/pages/mathematiques/college/[niveau]/index.astro` | `../../../../data/mathematiques/*`, `../../../../styles/mathematiques/mathematics.css` | Niveaux et chapitres maths | Eleve |
| `src/pages/mathematiques/college/[niveau]/[chapitre].astro` | `../../../../components/pedagogie/*`, `../../../../data/mathematiques/*` | Contenu, progression et styles maths | Tres eleve |
| `src/pages/mathematiques/lycee/index.astro` | `../../../data/mathematiques/*`, `../../../styles/mathematiques/mathematics.css` | Donnees et style maths | Moyen |
| `src/pages/mathematiques/lycee/[niveau]/index.astro` | `../../../../data/mathematiques/*`, `../../../../styles/mathematiques/mathematics.css` | Niveaux et chapitres maths | Eleve |
| `src/pages/mathematiques/lycee/[niveau]/[chapitre].astro` | `../../../../components/pedagogie/*`, `../../../../data/mathematiques/*` | Contenu, progression et styles maths | Tres eleve |
| `src/pages/outils-methodes/methodes-maths-college/[fiche].astro` | `../../../layouts/BaseLayout.astro`, `../../../data/methodesMathsCollege` | Fiches methodes college | Moyen |
| `src/pages/outils-methodes/methodes-maths-lycee/[fiche].astro` | `../../../layouts/BaseLayout.astro`, `../../../data/methodesMathsLycee` | Fiches methodes lycee | Moyen |
| `src/data/chapters/college/3eme/chimie/atome/cours.mdx` | `../../../../../../components/pedagogie/TableauPeriodique.tsx` | Composant pedagogique depuis MDX profond | Tres eleve |
| `src/data/chapters/lycee/terminale-spe/**/cours.mdx` | `../../../../../../components/pedagogie/RawHtml.astro` | `RawHtml` depuis MDX profond | Tres eleve |
| `src/data/chapters/lycee/terminale-spe/**/cours.mdx` | `./cours.fragment.html?raw` | Fragment HTML local | Tres eleve : couplage cours MDX + fragment |

## 7. Conventions actuelles a preserver temporairement

- `src/data/chapters/{cycle}/{niveau}/{matiere}/{chapitre}/`.
- `src/data/mathematiques/chapters/{cycle}/{niveau}/{chapitre}/`.
- Fichiers de chapitre : `meta.json`, `cours.mdx`, `exercices.json`, `quiz.json`, `flashcards.json`.
- Fichiers de transition lycee : `cours.fragment.html` charge depuis `cours.mdx` avec `?raw`.
- Routes publiques en `kebab-case`.
- Slugs sans accents dans les chemins publics.
- Slugs de niveaux PC definis dans `src/data/levels.ts`.
- Slugs de niveaux maths et chemins publics definis dans `src/data/mathematiques/levels.ts`.
- `chapterId` PC au format `cycle/niveau/matiere/chapitre`.
- `chapterId` maths au format `mathematiques:cycle:niveau:chapitre`.
- Catalogue laboratoire dans `src/data/laboratoire/apps.ts`, avec `slug`, `route`, `legacyPath` et `status`.
- Dossier legacy `laboratoire/` conserve tant que les `legacyPath` existent.
- Globs PC de `src/pages/mega-quiz.astro` et `src/pages/mega-flashcards.astro`.

## 8. Conventions concurrentes a resoudre plus tard

| Convention A | Convention B | Chemins concernes | Risque | Priorite |
|---|---|---|---|---|
| Chapitres PC avec segment `matiere` | Chapitres maths sans segment `matiere` | `src/data/chapters/...`, `src/data/mathematiques/chapters/...` | Confusion lors d'une migration generique | Haute |
| `chapterId` PC avec `/` | `chapterId` maths avec `mathematiques:` | `src/pages/*/[chapitre].astro`, `src/data/mathematiques/paths.ts`, gamification | Progression et SRS non compatibles | Haute |
| `meta.seo.canonical` PC valide par fallback | `chapter.seo?.canonical` maths utilise directement | Routes chapitres PC et maths | Divergence SEO en cas de mauvais canonical | Haute |
| Contenu MDX direct | MDX wrapper + `cours.fragment.html?raw` + `RawHtml` | `src/data/chapters/lycee/terminale-spe/**` | Imports profonds et fragments couples | Haute |
| Laboratoire Astro migre | Laboratoire legacy racine | `src/components/laboratoire/`, `src/scripts/laboratoire/`, `laboratoire/` | Doubles sources de verite et chemins legacy | Haute |
| Routes memorisation sous `/memorisation/*` | Anciennes routes racine `/mega-quiz`, `/mega-flashcards` | `src/pages/memorisation/`, `src/pages/mega-quiz.astro`, `src/pages/mega-flashcards.astro` | Routes publiques concurrentes, contenus pas equivalents | Moyenne |
| Tokens accessibilite dans `src/data/accessibility/` | Tokens accessibilite dans `src/components/accessibility/` | `src/data/accessibility/theme-tokens.ts`, `src/components/accessibility/theme-tokens.ts` | Ambiguite d'import et duplication de role | Moyenne |

## 9. Table de migration preparatoire

| Ancien chemin | Role | Route publique liee | Chemin cible possible | Risque | Migration recommandee maintenant ? |
|---|---|---|---|---|---|
| `src/data/chapters/college/` | Contenus PC college | `/college/*` | `src/content/physique-chimie/college/` | Tres eleve | Non |
| `src/data/chapters/lycee/` | Contenus PC lycee | `/lycee/*` | `src/content/physique-chimie/lycee/` | Tres eleve | Non |
| `src/data/mathematiques/chapters/` | Contenus maths | `/mathematiques/*` | `src/content/mathematiques/` | Eleve | Non |
| `src/data/levels.ts` | Niveaux et matieres PC | `/college/*`, `/lycee/*` | `src/data/physique-chimie/levels.ts` | Eleve | A etudier |
| `src/data/mathematiques/levels.ts` | Niveaux maths et chemins publics | `/mathematiques/*` | `src/data/mathematiques/navigation.ts` | Moyen | A etudier |
| `src/pages/mega-quiz.astro` | Mega quiz PC racine | `/mega-quiz` | Redirection ou rattachement a `/memorisation/mega-quiz` | Moyen | A etudier |
| `src/pages/mega-flashcards.astro` | Mega flashcards PC racine | `/mega-flashcards` | Redirection ou rattachement a `/memorisation/mega-flashcards` | Moyen | A etudier |
| `src/pages/memorisation/mega-quiz.astro` | Page memorisation actuellement minimale | `/memorisation/mega-quiz` | Reutilisation du player global | Moyen | A etudier |
| `laboratoire/` | Simulations legacy | Indirect par `legacyPath`, anciens liens HTML | `public/laboratoire-legacy/` ou archive documentee | Tres eleve | Non |
| `src/scripts/laboratoire/` | Modeles et initialisation des simulations Astro | `/laboratoire/*` | `src/features/laboratoire/scripts/` | Eleve | Non |
| `src/styles/laboratoire/` | Styles simulations Astro | `/laboratoire/*` | `src/features/laboratoire/styles/` | Eleve | Non |
| `src/components/laboratoire/` | UI simulations Astro | `/laboratoire/*` | `src/features/laboratoire/components/` | Eleve | Non |
| `src/data/accessibility/theme-tokens.ts` | Tokens accessibilite | Global UI | Fusion avec convention unique | Moyen | A etudier |
| `src/components/accessibility/theme-tokens.ts` | Tokens accessibilite doublonnes | Global UI | Fusion avec convention unique | Moyen | A etudier |
| `src/data/chapters/**/cours.fragment.html` | Fragments HTML importes par MDX | `/lycee/terminale-spe/*` | Conversion progressive en MDX natif | Tres eleve | Non |

## 10. Zones a ne pas toucher sans audit dedie

- Routes de chapitre : `src/pages/college/[niveau]/[matiere]/[chapitre].astro`, `src/pages/lycee/[niveau]/[matiere]/[chapitre].astro`, `src/pages/mathematiques/college/[niveau]/[chapitre].astro`, `src/pages/mathematiques/lycee/[niveau]/[chapitre].astro`.
- Dossiers de chapitres : `src/data/chapters/` et `src/data/mathematiques/chapters/`.
- Canoniques SEO : `seo.canonical` dans les `meta.json`, `canonical` dans les pages Astro, `src/layouts/BaseLayout.astro`.
- Laboratoire legacy : `laboratoire/` et `legacyPath` dans `src/data/laboratoire/apps.ts`.
- Globs de quiz et flashcards : routes de chapitres, `src/pages/mega-quiz.astro`, `src/pages/mega-flashcards.astro`, dashboard.
- Imports MDX profonds : `src/data/chapters/**/cours.mdx`, notamment `RawHtml` et `TableauPeriodique`.
- Pyodide : `src/scripts/pyodide-worker.ts`, `src/components/pedagogie/PyodideLab.tsx`, `src/components/pedagogie/PythonExercisesRunner.tsx`.
- Tests laboratoire : `tests/laboratoire/*.test.mjs`.

## 11. Recommandation de sequence

| Ordre | Migration future | Risque | Dependances |
|---|---|---|---|
| 1 | Geler une table officielle des routes publiques et canoniques | Faible | Inventaire present, `BaseLayout`, `meta.json` |
| 2 | Ajouter des tests ou scripts de verification des routes generees, sans deplacement | Moyen | `getStaticPaths`, globs de chapitres |
| 3 | Documenter et stabiliser les deux formats de `chapterId` | Moyen | Gamification, SRS, lecteurs pedagogiques |
| 4 | Harmoniser les pages `/memorisation/*` avec les anciennes routes racine | Moyen | `MegaQuizPlayer`, `MegaFlashcardsPlayer`, globs PC |
| 5 | Auditer le laboratoire legacy avant tout deplacement | Eleve | `legacyPath`, pages HTML legacy, tests laboratoire |
| 6 | Remplacer progressivement les imports MDX profonds ou fragments HTML | Tres eleve | `RawHtml`, `cours.fragment.html`, terminale-spe |
| 7 | Etudier une organisation cible des contenus, avec aliases ou adaptateurs temporaires | Tres eleve | Toutes les routes de chapitres et globs |
| 8 | Migrer seulement apres redirections, tests de build et verification SEO | Tres eleve | Routes publiques, sitemap, canoniques |

