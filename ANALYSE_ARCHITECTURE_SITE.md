# Analyse descriptive de l'architecture du site de physique-chimie

Date de lecture du dépôt : 17 juillet 2026.

Ce fichier décrit l'architecture actuellement constatée dans le dépôt Astro. Il ne contient pas de recommandation, de notation, de proposition de refonte ou de plan de correction. Les formulations ci-dessous distinguent autant que possible les éléments observés directement dans le code et les déductions issues des imports, routes et structures de données.

## 1. Présentation générale

Le projet est un site pédagogique de physique-chimie construit avec Astro. Il contient des pages pour le collège, le lycée, des chapitres avec cours, exercices, quiz et flashcards, un espace d'outils et méthodes, un laboratoire de simulations scientifiques, un tableau périodique, un espace Python et des fonctionnalités de mémorisation et de progression locale.

Technologies constatées :

- Astro 5 avec sortie statique, configurée dans `astro.config.mjs`.
- MDX pour des cours rédigés dans `src/data/chapters/**/cours.mdx`.
- React pour les composants interactifs hydratés côté navigateur.
- TypeScript pour une partie des composants, données et moteurs client.
- KaTeX pour le rendu mathématique.
- JavaScript modulaire pour les simulations scientifiques.
- CSS global et CSS propres aux simulations.

Résumé court pour reprise dans ChatGPT :

- Les chapitres sont stockés dans `src/data/chapters/{cycle}/{niveau}/{matiere}/{chapitre}/`.
- Une page de chapitre est générée par `src/pages/college/[niveau]/[matiere]/[chapitre].astro` ou `src/pages/lycee/[niveau]/[matiere]/[chapitre].astro`.
- Chaque chapitre peut contenir `meta.json`, `cours.mdx`, `exercices.json`, `quiz.json`, `flashcards.json` et parfois `cours.fragment.html`.
- Le layout global est `src/layouts/BaseLayout.astro`.
- Les onglets de chapitre sont rendus par `src/components/pedagogie/ChapterTabs.astro`.
- Les exercices, quiz et flashcards sont des composants React : `ExercicesPlayer.tsx`, `QuizPlayer.tsx`, `FlashcardsPlayer.tsx`.
- Le laboratoire utilise `src/data/laboratoire/apps.ts`, `src/data/laboratoire/genericConfigs.ts`, des routes dans `src/pages/laboratoire/`, des composants dans `src/components/laboratoire/` et des scripts dans `src/scripts/laboratoire/`.
- Le site utilise `localStorage` pour la progression, la gamification, les flashcards espacées et les préférences d'accessibilité.

## 2. Arborescence générale

Arborescence synthétique constatée :

```text
site-v2/
├── astro.config.mjs
├── package.json
├── tsconfig.json
├── README.md
├── BO/
│   ├── BO_College.pdf
│   ├── BO_Seconde.pdf
│   ├── BO_Premiere_ES.pdf
│   ├── BO_Premiere_SPE.pdf
│   ├── BO_Term_ES.pdf
│   ├── BO_Term_Spe.pdf
│   └── autres fichiers officiels ou extraits texte
├── docs/
│   ├── audits, résumés, feuilles de route et documents projet
│   └── Avancement/
├── laboratoire/
│   ├── anciennes simulations autonomes HTML/CSS/JS
│   └── dossiers par simulation
├── public/
│   ├── favicon, manifest, robots.txt
│   ├── icônes PWA
│   └── og-image.png
├── spe/
│   ├── chimie/
│   └── physique/
├── src/
│   ├── components/
│   │   ├── accessibility/
│   │   ├── laboratoire/
│   │   ├── outils/
│   │   ├── pedagogie/
│   │   └── ui/
│   ├── content/
│   ├── data/
│   │   ├── accessibility/
│   │   ├── chapters/
│   │   ├── gamification/
│   │   ├── laboratoire/
│   │   ├── levels.ts
│   │   ├── methodesMathsCollege.ts
│   │   ├── methodesMathsLycee.ts
│   │   └── outilsMethodes.ts
│   ├── layouts/
│   │   └── BaseLayout.astro
│   ├── pages/
│   │   ├── college/
│   │   ├── laboratoire/
│   │   ├── lycee/
│   │   ├── memorisation/
│   │   ├── outils-methodes/
│   │   └── pages racine
│   ├── scripts/
│   │   ├── pyodide-worker.ts
│   │   └── laboratoire/
│   ├── styles/
│   │   ├── design-system.css
│   │   └── laboratoire/
│   └── utils/
│       └── rehypeCourseSections.mjs
├── tests/
│   └── laboratoire/
├── dist/
├── node_modules/
├── output/
└── tmp/
```

`dist/`, `.astro/`, `node_modules/`, `output/` et `tmp/` sont présents dans le dépôt local observé. Leur rôle exact est lié respectivement aux sorties, caches, dépendances installées ou fichiers temporaires selon leur contenu et leurs noms.

## 3. Rôle des dossiers

| Dossier | Rôle constaté | Relations principales |
|---|---|---|
| `src/pages/` | Déclare les routes Astro. | Charge les layouts, composants et données. |
| `src/layouts/` | Contient le layout global `BaseLayout.astro`. | Importé par la majorité des routes. |
| `src/components/` | Contient les composants Astro et React. | Utilisé par les routes et parfois par les cours MDX. |
| `src/data/chapters/` | Stocke les données pédagogiques par cycle, niveau, matière et chapitre. | Scanné par `import.meta.glob` depuis les routes dynamiques. |
| `src/data/laboratoire/` | Stocke le catalogue des simulations et les configurations des simulations génériques. | Utilisé par `/laboratoire` et `/laboratoire/[slug]`. |
| `src/data/gamification/` | Stocke le moteur XP, badges, rangs, streaks et SRS. | Utilisé par les composants React de cours, exercices, quiz et flashcards. |
| `src/data/accessibility/` | Stocke le moteur de préférences d'accessibilité. | Utilisé par `AccessibilityPanel.tsx`. |
| `src/scripts/laboratoire/` | Contient les modèles et contrôleurs JavaScript des simulations. | Importé depuis les composants de simulation Astro. |
| `src/styles/` | Contient les styles globaux et les styles du laboratoire. | Importé depuis `BaseLayout.astro`, `LabAppLayout.astro` et les composants de simulation. |
| `src/utils/` | Contient un plugin Rehype local. | Référencé dans `astro.config.mjs`. |
| `public/` | Contient les fichiers statiques accessibles directement par URL. | Référencé par `BaseLayout.astro` et les métadonnées web. |
| `laboratoire/` | Contient des simulations autonomes HTML/CSS/JS antérieures ou parallèles au site Astro. | Les chemins sont référencés par `legacyPath` dans `src/data/laboratoire/apps.ts`. |
| `BO/` | Contient des documents officiels PDF et texte. | Aucune route Astro directe n'a été observée vers ces fichiers dans les lectures réalisées. |
| `docs/` | Contient des audits, résumés, prompts et documents projet. | Dossier documentaire du dépôt. |
| `spe/` | Contient des ressources de spécialité par chimie et physique. | Certains `meta.json` de terminale spécialité contiennent une propriété `source` pointant vers `spe/...`. |
| `tests/laboratoire/` | Contient des tests des modèles scientifiques du laboratoire. | Les scripts npm de `package.json` ne déclarent pas de commande `test`. |

## 4. Configuration du projet

### `package.json`

Constaté dans `package.json` :

- Nom : `site-v2`.
- Type de module : `"type": "module"`.
- Scripts :
  - `npm run dev` lance `astro dev`.
  - `npm run build` lance `astro build`.
  - `npm run preview` lance `astro preview`.
  - `npm run astro` lance la CLI Astro.
- Dépendances principales :
  - `astro` pour le framework.
  - `@astrojs/mdx` pour les fichiers MDX.
  - `@astrojs/react` pour les composants React hydratés.
  - `@astrojs/sitemap` pour le sitemap.
  - `react` et `react-dom` pour les composants interactifs.
  - `katex`, `remark-math`, `rehype-katex` pour les formules.
  - `@types/react` et `@types/react-dom` pour les types React.

### `astro.config.mjs`

Constaté :

- `site` vaut `https://physique-chimie-belhomme.vercel.app/`.
- Intégrations : `react()`, `mdx()`, `sitemap(...)`.
- Sortie : `output: "static"`.
- Markdown :
  - `remarkPlugins: [remarkMath]`
  - `rehypePlugins: [rehypeKatex, rehypeCourseSections]`
- Le plugin local `rehypeCourseSections` provient de `src/utils/rehypeCourseSections.mjs`.
- Le sitemap exclut les URL contenant `/404`, avec `changefreq: "weekly"` et `priority: 0.7`.

### TypeScript

Constaté dans `tsconfig.json` :

- Extension de `astro/tsconfigs/strict`.
- Inclusion de `.astro/types.d.ts` et de tous les fichiers.
- Exclusion de `dist`.
- `jsx: "react-jsx"`.
- `jsxImportSource: "react"`.

### Variables d'environnement

Recherche effectuée dans `src`, `astro.config.mjs`, `package.json` et `README.md` avec les motifs `import.meta.env`, `process.env`, `PUBLIC_`, `SUPABASE`, `API_`. Aucun usage direct de variable d'environnement n'a été observé dans ces fichiers. Le fichier `.env.example` n'a pas été trouvé lors de cette lecture.

### Services et ressources externes configurés dans le code

- `src/layouts/BaseLayout.astro` charge Google Tag Manager / Google Analytics via `https://www.googletagmanager.com/gtag/js?id=G-9JPGPYQZ3C`.
- `src/styles/design-system.css` importe la police Plus Jakarta Sans depuis Google Fonts.
- `src/styles/design-system.css` charge OpenDyslexic depuis jsDelivr.
- `src/scripts/pyodide-worker.ts` charge Pyodide depuis `https://cdn.jsdelivr.net/pyodide/v314.0.2/full/`.

## 5. Génération des pages

### Familles de routes

| URL ou type d'URL | Fichier de route | Données utilisées | Layout | Composants principaux |
|---|---|---|---|---|
| `/` | `src/pages/index.astro` | `src/data/chapters/**/meta.json`, `flashcards.json` | `BaseLayout` | `Dashboard` |
| `/college` | `src/pages/college/index.astro` | `src/data/chapters/college/**/meta.json`, `levels.ts` | `BaseLayout` | cartes de niveaux écrites dans la page |
| `/college/[niveau]` | `src/pages/college/[niveau]/index.astro` | `meta.json`, `collegeLevels` | `BaseLayout` | `Breadcrumb`, cartes de matières et chapitres |
| `/college/[niveau]/[matiere]` | `src/pages/college/[niveau]/[matiere]/index.astro` | `meta.json`, `levels.ts` | `BaseLayout` | `Breadcrumb`, liste de chapitres |
| `/college/[niveau]/[matiere]/[chapitre]` | `src/pages/college/[niveau]/[matiere]/[chapitre].astro` | `meta.json`, `cours.mdx`, `exercices.json`, `quiz.json`, `flashcards.json` | `BaseLayout` | `ChapterTabs`, `CoursTracker`, `ExercicesPlayer`, `QuizPlayer`, `FlashcardsPlayer` |
| `/lycee` | `src/pages/lycee/index.astro` | `src/data/chapters/lycee/**/meta.json`, `levels.ts` | `BaseLayout` | cartes de niveaux écrites dans la page |
| `/lycee/[niveau]` | `src/pages/lycee/[niveau]/index.astro` | `meta.json`, `lyceeLevels` | `BaseLayout` | `Breadcrumb`, cartes de matières et chapitres |
| `/lycee/[niveau]/[matiere]` | `src/pages/lycee/[niveau]/[matiere]/index.astro` | `meta.json`, `levels.ts` | `BaseLayout` | `Breadcrumb`, liste de chapitres |
| `/lycee/[niveau]/[matiere]/[chapitre]` | `src/pages/lycee/[niveau]/[matiere]/[chapitre].astro` | `meta.json`, `cours.mdx`, `exercices.json`, `quiz.json`, `flashcards.json` | `BaseLayout` | `ChapterTabs`, `CoursTracker`, `ExercicesPlayer`, `QuizPlayer`, `FlashcardsPlayer` |
| `/laboratoire` | `src/pages/laboratoire.astro` | `src/data/laboratoire/apps.ts` | `BaseLayout` | `LabAppCard` |
| `/laboratoire/[slug]` | `src/pages/laboratoire/[slug].astro` | `labApps`, `genericLabConfigs` | `LabAppLayout` puis `BaseLayout` | `GenericLabSimulator`, `TitrationPhSimulator`, `RadioactiveDecaySimulator` |
| `/laboratoire/circuit-rc` | `src/pages/laboratoire/circuit-rc.astro` | entrée `circuit-rc` de `labApps` | `LabAppLayout` | `CircuitRcSimulator` |
| `/laboratoire/lois-kepler` | `src/pages/laboratoire/lois-kepler.astro` | entrée `lois-kepler` de `labApps` | `LabAppLayout` | `KeplerLawsSimulator` |
| `/laboratoire/gaz-parfaits` | `src/pages/laboratoire/gaz-parfaits.astro` | entrée `gaz-parfaits` de `labApps` | `LabAppLayout` | `IdealGasSimulator` |
| `/laboratoire/diffusion-temperature` | `src/pages/laboratoire/diffusion-temperature.astro` | entrée `diffusion-temperature` de `labApps` | `LabAppLayout` | `DiffusionTemperatureSimulator` |
| `/outils-methodes` | `src/pages/outils-methodes.astro` | tableau local `spaces` | `BaseLayout` | cartes écrites dans la page |
| `/outils-methodes/college` | `src/pages/outils-methodes/college.astro` | `outilsMethodes.ts` | `BaseLayout` | `OutilsMethodesListing` |
| `/outils-methodes/lycee` | `src/pages/outils-methodes/lycee.astro` | `outilsMethodes.ts` | `BaseLayout` | `OutilsMethodesListing` |
| `/outils-methodes/transverses` | `src/pages/outils-methodes/transverses.astro` | `outilsMethodes.ts` | `BaseLayout` | `OutilsMethodesListing` |
| `/outils-methodes/methodes-maths-lycee/[fiche]` | `src/pages/outils-methodes/methodes-maths-lycee/[fiche].astro` | `methodesMathsLycee.ts` | `BaseLayout` | page de fiche méthode |
| `/outils-methodes/methodes-maths-college/[fiche]` | `src/pages/outils-methodes/methodes-maths-college/[fiche].astro` | `methodesMathsCollege.ts` | `BaseLayout` | page de fiche méthode |
| `/outils-methodes/python-lab` | `src/pages/outils-methodes/python-lab.astro` | composant React interne | `BaseLayout` | `PyodideLab` |
| `/outils-methodes/tableau-periodique` | `src/pages/outils-methodes/tableau-periodique.astro` | composant React interne | `BaseLayout` | `TableauPeriodique` |
| `/mega-quiz` | `src/pages/mega-quiz.astro` | tous les `quiz.json` et `meta.json` | `BaseLayout` | `MegaQuizPlayer` |
| `/mega-flashcards` | `src/pages/mega-flashcards.astro` | tous les `flashcards.json` et `meta.json` | `BaseLayout` | `MegaFlashcardsPlayer` |
| `/profil` | `src/pages/profil.astro` | état local via React | `BaseLayout` | `ProfilePage` |
| `/memorisation` | `src/pages/memorisation/index.astro` | aucune donnée externe observée | `BaseLayout` | contenu simple |
| `/404` | `src/pages/404.astro` | non analysé en détail | non déterminé | non déterminé |

### Routes dynamiques des chapitres

Constaté dans les routes de chapitre :

- Les fichiers `src/pages/college/[niveau]/[matiere]/[chapitre].astro` et `src/pages/lycee/[niveau]/[matiere]/[chapitre].astro` utilisent `import.meta.glob("/src/data/chapters/**/meta.json", { eager: true })`.
- `getStaticPaths()` découpe les chemins sous `/src/data/chapters/`.
- Les segments de chemin donnent `cycle`, `niveau`, `matiere`, `chapitre`.
- La route collège conserve les entrées dont `cycle === "college"`.
- La route lycée conserve les entrées dont `cycle === "lycee"`.
- La page reconstitue un `basePath` :
  - collège : `/src/data/chapters/college/${niveau}/${matiere}/${chapitre}`
  - lycée : `/src/data/chapters/lycee/${niveau}/${matiere}/${chapitre}`
- La page cherche ensuite les fichiers du dossier courant dans des glob séparés :
  - `meta.json`
  - `cours.mdx`
  - `exercices.json`
  - `quiz.json`
  - `flashcards.json`
- Les tableaux JSON peuvent être lus directement ou via une propriété (`exercices`, `questions`, `cards`) grâce à une fonction utilitaire locale `getArray`.

Déduit du code :

```text
src/data/chapters/lycee/1ere-spe/chimie/composition-systeme-beer-lambert/
        ↓
meta.json, cours.mdx, exercices.json, quiz.json, flashcards.json
        ↓
src/pages/lycee/[niveau]/[matiere]/[chapitre].astro
        ↓
BaseLayout
        ↓
Breadcrumb + en-tête du chapitre
        ↓
ChapterTabs
        ↓
CoursTracker + ExercicesPlayer + QuizPlayer + FlashcardsPlayer
        ↓
HTML statique Astro + composants React hydratés avec client:load
```

### Routes dynamiques du laboratoire

Constaté :

- `src/pages/laboratoire/[slug].astro` exclut quatre routes explicites dans `getStaticPaths()` : `circuit-rc`, `lois-kepler`, `gaz-parfaits`, `diffusion-temperature`.
- Les autres simulations déclarées dans `labApps` passent par la route générique.
- `app.slug === "titrage-ph-metrique"` utilise `TitrationPhSimulator`.
- `app.slug === "decroissance-radioactive"` utilise `RadioactiveDecaySimulator`.
- Les autres simulations génériques utilisent `GenericLabSimulator` avec `genericLabConfigs[app.slug]`.

## 6. Layouts

### `src/layouts/BaseLayout.astro`

Rôle constaté :

- Layout principal du site.
- Reçoit les propriétés :
  - `title`
  - `description`
  - `canonical`
  - `ogImage`
  - `schemaType`
  - `noindex`
- Importe :
  - `DailyLoginTracker.tsx`
  - `AccessibilityPanel.tsx`
  - `ReadingGuide.tsx`
  - `ScrollToTop.tsx`
  - `katex/dist/katex.min.css`
  - `src/styles/design-system.css`
- Définit les métadonnées de base, Open Graph, Twitter Card, favicon, manifest et couleur de thème.
- Insère un JSON-LD de type `Course` quand `schemaType === "EducationalContent"`.
- Insère sinon un JSON-LD de type `WebSite`.
- Contient la navigation principale :
  - `/`
  - `/college`
  - `/lycee`
  - `/outils-methodes`
  - `/laboratoire`
- La fonction locale `isActive(href)` compare `Astro.url.pathname` aux chemins de navigation.
- Rend le contenu dans `<main class="page-container"><slot /></main>`.
- Rend le footer.
- Hydrate quatre composants globaux avec `client:load`.

Chaîne d'assemblage générale :

```text
Route Astro
        ↓
données chargées par import ou import.meta.glob
        ↓
BaseLayout
        ↓
head SEO + navigation principale + page-container + footer
        ↓
slot de la route
        ↓
composants Astro et/ou React
        ↓
scripts client liés aux composants hydratés ou aux modules importés
```

### `src/components/laboratoire/LabAppLayout.astro`

Ce fichier se trouve dans `src/components/laboratoire/` et non dans `src/layouts/`, mais il joue un rôle d'enveloppe pour les simulations.

Constaté :

- Importe `BaseLayout`.
- Importe `src/styles/laboratoire/global-lab.css`.
- Reçoit `title`, `description`, `icon`, `level`, `concept`, `objective`, `legacyPath`.
- Rend un fil d'Ariane vers `/laboratoire`.
- Rend un en-tête de simulation.
- Place le simulateur dans son `<slot />`.
- Ajoute `data-legacy-path={legacyPath}` sur l'article.

Chaîne d'assemblage d'une simulation dédiée :

```text
src/pages/laboratoire/circuit-rc.astro
        ↓
recherche de l'entrée circuit-rc dans labApps
        ↓
LabAppLayout
        ↓
BaseLayout
        ↓
CircuitRcSimulator
        ↓
script et modèle du circuit RC côté navigateur
```

## 7. Composants

### Vue d'ensemble

| Composant | Fonction | Propriétés principales | Utilisé par |
|---|---|---|---|
| `src/components/ui/Breadcrumb.astro` | Fil d'Ariane générique. | `items` | routes collège, lycée et autres pages |
| `src/components/ui/SearchBar.tsx` | Recherche côté client. | selon composant appelant | `Dashboard.tsx` |
| `src/components/ui/ScrollToTop.tsx` | Bouton de retour en haut. | aucune prop principale observée | `BaseLayout.astro` |
| `src/components/pedagogie/Dashboard.tsx` | Tableau de bord d'accueil. | `chapters` | `src/pages/index.astro` |
| `src/components/pedagogie/ChapterTabs.astro` | Onglets Cours, Exercices, Quiz, Flashcards. | `hasCours`, `hasExercices`, `hasQuiz`, `hasFlashcards`, compteurs, retour | routes de chapitre |
| `src/components/pedagogie/CoursTracker.tsx` | Suit la lecture du cours et affiche le TTS du cours. | `chapterId`, `xpConfig`, `children` | routes de chapitre |
| `src/components/pedagogie/ExercicesPlayer.tsx` | Lecteur d'exercices interactif avec réponse élève, correction et aides. | `data`, `title`, `chapterId`, `xpConfig` | routes de chapitre |
| `src/components/pedagogie/QuizPlayer.tsx` | Lecteur de quiz chapitre. | `data`, `title`, `chapterId`, `xpConfig` | routes de chapitre |
| `src/components/pedagogie/FlashcardsPlayer.tsx` | Lecteur de flashcards avec SRS. | `data`, `title`, `chapterId`, `xpConfig` | routes de chapitre |
| `src/components/pedagogie/MegaQuizPlayer.tsx` | Quiz global. | `allQuestions` | `src/pages/mega-quiz.astro` |
| `src/components/pedagogie/MegaFlashcardsPlayer.tsx` | Flashcards globales. | `allCards` | `src/pages/mega-flashcards.astro` |
| `src/components/pedagogie/MathText.tsx` | Rend LaTeX dans les textes issus de JSON. | `text`, `block`, `style`, `className` | quiz, exercices, flashcards |
| `src/components/pedagogie/TextToSpeech.tsx` | Lecture audio via navigateur. | texte et options | cours, quiz, exercices, flashcards |
| `src/components/pedagogie/XPToast.tsx` | Notifications XP, badges, rangs. | `toasts`, `onDismiss` | lecteurs pédagogiques |
| `src/components/pedagogie/RawHtml.astro` | Rend des fragments HTML importés en brut et applique KaTeX. | `html` | cours MDX de terminale spécialité |
| `src/components/pedagogie/PyodideLab.tsx` | Console Python avec worker Pyodide. | aucune prop principale observée | `/outils-methodes/python-lab` |
| `src/components/pedagogie/TableauPeriodique.tsx` | Tableau périodique interactif. | données internes au composant | `/outils-methodes/tableau-periodique` |
| `src/components/accessibility/AccessibilityPanel.tsx` | Panneau de préférences d'accessibilité. | aucune prop principale observée | `BaseLayout.astro` |
| `src/components/accessibility/ReadingGuide.tsx` | Guide de lecture. | non analysé en détail | `BaseLayout.astro` |
| `src/components/outils/OutilsMethodesListing.astro` | Liste de ressources méthodes/outils par niveau. | `level`, `eyebrow`, `title`, `description` | pages outils collège, lycée, transverses |
| `src/components/laboratoire/LabAppCard.astro` | Carte de simulation du catalogue. | `app` | `src/pages/laboratoire.astro` |
| `src/components/laboratoire/LabAppLayout.astro` | Enveloppe de simulation. | métadonnées de simulation | routes laboratoire |
| `src/components/laboratoire/GenericLabSimulator.astro` | Interface générique pour plusieurs simulations. | `app`, `config` | `/laboratoire/[slug]` |
| `src/components/laboratoire/CircuitRcSimulator.astro` | Simulation dédiée circuit RC. | aucune prop principale observée | `/laboratoire/circuit-rc` |
| `src/components/laboratoire/KeplerLawsSimulator.astro` | Simulation dédiée lois de Kepler. | aucune prop principale observée | `/laboratoire/lois-kepler` |
| `src/components/laboratoire/IdealGasSimulator.astro` | Simulation dédiée gaz parfaits. | aucune prop principale observée | `/laboratoire/gaz-parfaits` |
| `src/components/laboratoire/DiffusionTemperatureSimulator.astro` | Simulation dédiée diffusion et température. | aucune prop principale observée | `/laboratoire/diffusion-temperature` |
| `src/components/laboratoire/TitrationPhSimulator.astro` | Simulation dédiée titrage pH-métrique. | aucune prop principale observée | `/laboratoire/titrage-ph-metrique` |
| `src/components/laboratoire/RadioactiveDecaySimulator.astro` | Simulation dédiée décroissance radioactive. | aucune prop principale observée | `/laboratoire/decroissance-radioactive` |

### `ChapterTabs.astro`

Constaté :

- Rend un conteneur `data-chapter-tabs`.
- Rend un bouton de retour si `backUrl` est fourni.
- Rend un `nav` avec `role="tablist"`.
- Chaque onglet est un bouton avec `role="tab"` et `data-tab`.
- Chaque panneau a `role="tabpanel"` et `data-panel`.
- Un script local :
  - attend `DOMContentLoaded`,
  - ajoute des classes à certains titres de cours selon leur texte,
  - active les onglets au clic,
  - prend en charge les touches `ArrowRight`, `ArrowDown`, `ArrowLeft`, `ArrowUp`, `Home`, `End`,
  - met à jour `aria-selected`, `tabindex`, `hidden` et la classe `active`.

### `RawHtml.astro`

Constaté :

- Importe `katex`.
- Reçoit une chaîne HTML brute via la prop `html`.
- Transforme les formules `$...$`, `$$...$$`, `\(...\)` et `\[...\]`.
- Nettoie ou transforme certaines sections dans `normalizeImportedContent`.
- Rend le résultat avec `set:html` dans `<div class="spe-imported-content">`.
- Utilisé par des cours MDX qui importent `cours.fragment.html?raw`.

## 8. Organisation pédagogique

### Niveaux et matières

Constaté dans `src/data/levels.ts` :

- `collegeLevels` contient `6eme`, `5eme`, `4eme`, `3eme`.
- `lyceeLevels` contient `2nde`, `1ere-ens-scientifique`, `1ere-spe`, `terminale-ens-scientifique`, `terminale-spe`.
- `matieres` contient `chimie` et `physique`.
- `getLevelLabel`, `getLevelCycle` et `getMatiereLabel` convertissent les slugs en libellés ou cycles.
- Le commentaire du fichier indique que les slugs doivent correspondre aux noms de dossiers dans `src/data/chapters/`.

### Structure des chapitres

Structure constatée :

```text
src/data/chapters/
├── college/
│   ├── 6eme/
│   │   ├── chimie/
│   │   └── physique/
│   ├── 5eme/
│   ├── 4eme/
│   └── 3eme/
└── lycee/
    ├── 2nde/
    ├── 1ere-ens-scientifique/
    ├── 1ere-spe/
    ├── terminale-ens-scientifique/
    └── terminale-spe/
```

Dans chaque chapitre, le paquet standard observé contient :

```text
meta.json
cours.mdx
exercices.json
quiz.json
flashcards.json
```

Certains chapitres de terminale spécialité contiennent aussi :

```text
cours.fragment.html
```

Dans ce cas, `cours.mdx` importe `RawHtml` et le fragment brut :

```mdx
import RawHtml from "../../../../../../components/pedagogie/RawHtml.astro";
import html from "./cours.fragment.html?raw";

<RawHtml html={html} />
```

### Volumes de chapitres observés

Comptage par présence d'un `meta.json` :

| Cycle | Niveau | Matière | Nombre de chapitres |
|---|---|---:|---:|
| collège | 6eme | chimie | 3 |
| collège | 6eme | physique | 5 |
| collège | 5eme | chimie | 3 |
| collège | 5eme | physique | 5 |
| collège | 4eme | chimie | 4 |
| collège | 4eme | physique | 5 |
| collège | 3eme | chimie | 6 |
| collège | 3eme | physique | 6 |
| lycée | 2nde | chimie | 7 |
| lycée | 2nde | physique | 7 |
| lycée | 1ere-ens-scientifique | chimie | 4 |
| lycée | 1ere-ens-scientifique | physique | 9 |
| lycée | 1ere-spe | chimie | 8 |
| lycée | 1ere-spe | physique | 5 |
| lycée | terminale-ens-scientifique | chimie | 1 |
| lycée | terminale-ens-scientifique | physique | 2 |
| lycée | terminale-spe | chimie | 9 |
| lycée | terminale-spe | physique | 12 |

Fichiers pédagogiques comptés dans `src/data/chapters/` :

| Extension | Nombre |
|---|---:|
| `.json` | 404 |
| `.mdx` | 101 |
| `.html` | 21 |
| `.svg` | 1 |

### Exemple concret de chapitre

Chapitre observé :

```text
src/data/chapters/lycee/1ere-spe/chimie/composition-systeme-beer-lambert/
├── cours.mdx
├── exercices.json
├── flashcards.json
├── meta.json
└── quiz.json
```

`meta.json` contient notamment :

- `title`
- `description`
- `theme`
- `niveau`
- `matiere`
- `slug`
- `order`
- `duration`
- `xp`
- `tags`
- `prerequisites`
- `seo`

Parcours déduit :

```text
meta.json
        ↓
src/pages/lycee/[niveau]/[matiere]/[chapitre].astro
        ↓
URL /lycee/1ere-spe/chimie/composition-systeme-beer-lambert
        ↓
BaseLayout avec title, description, canonical et schemaType issus de meta.seo
        ↓
ChapterTabs
        ↓
cours.mdx dans CoursTracker
        ↓
exercices.json dans ExercicesPlayer
        ↓
quiz.json dans QuizPlayer
        ↓
flashcards.json dans FlashcardsPlayer
```

## 9. Données

### Données de chapitres

Formats observés :

- `meta.json` : métadonnées du chapitre, navigation, SEO, XP, tags et prérequis selon les chapitres.
- `cours.mdx` : contenu de cours, parfois MDX direct, parfois import de fragment HTML brut.
- `exercices.json` : tableau d'exercices ou objet contenant `exercices`.
- `quiz.json` : tableau de questions ou objet contenant `questions`.
- `flashcards.json` : tableau de cartes ou objet contenant `cards`.

Exemple de structure d'exercice observée :

```json
{
  "id": "beer-lambert-exo-04",
  "title": "Utiliser $A=k c$",
  "difficulty": 2,
  "difficultyLabel": "Application",
  "consigne": "...",
  "correction": ["...", "..."],
  "schemaSvg": null,
  "schemaCaption": null
}
```

Le composant `ExercicesPlayer.tsx` accepte aussi :

- `titre` comme alias de `title`,
- `difficulte` comme alias de `difficulty`,
- `niveau` comme alias de `difficultyLabel`,
- `aide`,
- `aides.indice`,
- `aides.methode`,
- `aides.erreurFrequente`,
- `aides.rappelCours`,
- `schemaSvg`,
- `schemaCaption`,
- `schemaAlt`.

Exemple de structure de quiz observée :

```json
{
  "id": "beer-lambert-q01",
  "type": "mcq",
  "question": "...",
  "choices": ["...", "..."],
  "answer": 0,
  "explanation": "..."
}
```

Exemple de structure de flashcard observée :

```json
{
  "id": "beer-lambert-f01",
  "front": "Spectre d'absorption",
  "back": "Graphique qui représente l'absorbance A en fonction de la longueur d'onde lambda.",
  "difficulty": 1,
  "tags": ["spectre"]
}
```

`FlashcardsPlayer.tsx` accepte aussi des alias :

- `recto`, `question` pour le recto,
- `verso`, `answer` pour le verso.

### Données outils et méthodes

`src/data/outilsMethodes.ts` définit :

- `OutilMethodeType` : `outil` ou `methode`.
- `OutilMethodeLevel` : `college`, `lycee`, `transverse`.
- `OutilMethodeResource` avec `title`, `href`, `type`, `levels`, `theme`, `description`, `details`, `symbol`.
- `outilsMethodesResources`, tableau de ressources.
- `getResourcesByLevel(level)`.
- `getResourcesByType(resources, type)`.

Ressources observées dans ce tableau :

- Kit scientifique.
- Tableau périodique interactif.
- Méthodes maths physique-chimie collège.
- Formulaires collège.
- Méthodes numériques - Seconde.
- Méthodes maths physique-chimie lycée.
- Python en physique-chimie.
- Cours Python lycée.
- Laboratoire Python.

`src/data/methodesMathsLycee.ts` définit une interface `LyceeMathMethod` et un tableau `methodesMathsLycee`. Les routes dynamiques de fiches utilisent `slug`, `number`, `family`, `title`, `shortTitle`, `levels`, `description`, `objective`, `why`, `typicalUses`, `steps`, `examples`, `commonMistakes`, `tip`, `miniExercise`, `competencies`, `remember`.

### Données laboratoire

`src/data/laboratoire/apps.ts` définit le type `LabApp` :

```ts
{
  slug: string;
  title: string;
  route: string;
  icon: string;
  theme: "physique" | "chimie";
  level: string;
  levels: Array<"college" | "lycee">;
  concept: string;
  topics: Array<...>;
  tags: string[];
  simKind?: string;
  objective: string;
  legacyPath: string;
  status: "migrated" | "pending";
}
```

`src/data/laboratoire/genericConfigs.ts` définit `GenericLabConfig` :

```ts
{
  controlA: string;
  unitA?: string;
  minA: number;
  maxA: number;
  stepA?: number;
  valueA: number;
  controlB: string;
  unitB?: string;
  minB: number;
  maxB: number;
  stepB?: number;
  valueB: number;
  modeLabel: string;
  modes: string[];
  observation: string;
}
```

### Données de progression

`src/data/gamification/engine.ts` déclare un état utilisateur stocké dans `localStorage` sous la clé `gamification_state`. L'état contient :

- `xp`
- `badges`
- `streak`
- `combo`
- `stats`
- `progress`
- `lastChapter`

`src/data/gamification/config.ts` déclare :

- XP par défaut.
- rangs.
- sous-niveaux.
- bonus de streak.
- multiplicateurs de combo.
- badges.

`src/data/gamification/srs.ts` est utilisé par `FlashcardsPlayer.tsx` pour la révision espacée.

### Content Collections Astro

Le dossier `src/content/` existe mais aucune définition `defineCollection` ou utilisation `getCollection` n'a été observée dans les fichiers analysés. Aucun fichier `src/content/config.*` n'a été relevé pendant la recherche.

## 10. Ressources statiques

### `public/`

Fichiers statiques observés :

- `public/favicon.ico`
- `public/favicon.svg`
- `public/favicon.zip`
- `public/icon-192.png`
- `public/icon-512.png`
- `public/icon-maskable-512.png`
- `public/manifest.json`
- `public/og-image.png`
- `public/robots.txt`
- `public/favicon/apple-touch-icon.png`
- `public/favicon/favicon-96x96.png`
- `public/favicon/favicon.ico`
- `public/favicon/favicon.svg`
- `public/favicon/icon-192.png`
- `public/favicon/icon-512.png`
- `public/favicon/site.webmanifest`

Références observées :

- `BaseLayout.astro` référence `/favicon.svg`, `/favicon-32x32.png`, `/apple-touch-icon.png`, `/manifest.json`, `/og-image.png`.
- `astro.config.mjs` configure le domaine de référence pour les URL canoniques et le sitemap.

### `src/assets/`

Le dossier `src/assets/` n'a pas été trouvé dans l'arborescence `src/` observée. Les ressources statiques relevées sont principalement dans `public/`, `BO/`, `docs/`, `laboratoire/`, `spe/` et les contenus inline des fichiers MDX ou JSON.

### `BO/`

Fichiers observés :

- `BO/BO_College.pdf`
- `BO/BO_Seconde.pdf`
- `BO/BO_Premiere_ES.pdf`
- `BO/BO_Premiere_SPE.pdf`
- `BO/BO_Term_ES.pdf`
- `BO/BO_Term_Spe.pdf`
- `BO/terminale-enseignement-scientifique.pdf`
- `BO/terminale-enseignement-scientifique.txt`
- `BO/Seconde/spe634_annexe_1062989.pdf`

### `laboratoire/`

Le dossier racine `laboratoire/` contient des versions autonomes HTML/CSS/JS de simulations. Exemples de dossiers observés :

- `circuit_rc`
- `diffusion`
- `gaz_parfaits`
- `loi_kepler`
- `loi_ohm`
- `titrage_ph`
- `titrage_conductimetrie`
- `systeme_solaire`
- `melanges`
- `ph`
- `lentille`
- `decroissance_radioactive`
- `diffraction_interference`
- `lunette_afocale`
- `thermodynamique`

Ces chemins sont reliés au catalogue Astro par la propriété `legacyPath` dans `src/data/laboratoire/apps.ts`.

## 11. Styles

### Fichiers de style

| Fichier de style | Portée | Chargé depuis | Éléments concernés |
|---|---|---|---|
| `src/styles/design-system.css` | globale | `BaseLayout.astro` | corps du site, navigation, cartes, boutons, cours, blocs pédagogiques, accessibilité |
| `src/styles/core.css` | fichier présent, taille 0 | non déterminé | non déterminé |
| `src/styles/components.css` | fichier présent, taille 0 | non déterminé | non déterminé |
| `src/styles/theme.css` | fichier présent, taille 0 | non déterminé | non déterminé |
| `src/styles/laboratoire/global-lab.css` | laboratoire | `LabAppLayout.astro` et `laboratoire.astro` | catalogue et pages de laboratoire |
| `src/styles/laboratoire/circuit-rc.css` | simulation dédiée | `CircuitRcSimulator.astro` | circuit RC |
| `src/styles/laboratoire/kepler-laws.css` | simulation dédiée | `KeplerLawsSimulator.astro` | lois de Kepler |
| `src/styles/laboratoire/ideal-gas.css` | simulation dédiée | `IdealGasSimulator.astro` | gaz parfaits |
| `src/styles/laboratoire/diffusion-temperature.css` | simulation dédiée | `DiffusionTemperatureSimulator.astro` | diffusion et température |
| `src/styles/laboratoire/titration-ph.css` | simulation dédiée | `TitrationPhSimulator.astro` | titrage pH-métrique |
| `src/styles/laboratoire/radioactive-decay.css` | simulation dédiée | `RadioactiveDecaySimulator.astro` | décroissance radioactive |

### `design-system.css`

Constaté :

- Importe Plus Jakarta Sans depuis Google Fonts.
- Déclare OpenDyslexic via `@font-face` depuis jsDelivr.
- Définit des variables CSS dans `:root` et dans plusieurs classes de thème :
  - `a11y-theme-light`
  - `a11y-theme-gray-light`
  - `a11y-theme-gray`
  - `a11y-theme-dark`
  - `a11y-theme-sepia`
  - `a11y-theme-blue-light`
- Définit des classes de police, taille, interlignage, espacement, largeur de ligne et aides d'accessibilité.
- Définit les styles globaux du corps, liens, navigation, breadcrumb, cartes, boutons, formulaires, blocs de cours et blocs de formules.
- Contient des media queries autour de `768px`, `480px`, `700px`, `780px` et d'autres points selon les sections.

Cheminement des styles pour une page de chapitre :

```text
BaseLayout.astro
        ↓
katex/dist/katex.min.css
        +
src/styles/design-system.css
        ↓
styles locaux de la route ou du composant Astro
        ↓
styles inline éventuels des composants React
        ↓
rendu dans le navigateur
```

Cheminement des styles pour une simulation dédiée :

```text
BaseLayout.astro
        ↓
design-system.css + katex.css
        ↓
LabAppLayout.astro
        ↓
global-lab.css
        ↓
composant de simulation
        ↓
feuille dédiée, par exemple circuit-rc.css
        ↓
DOM/SVG/canvas de la simulation
```

## 12. Scripts et interactions

### Scripts globaux et composants hydratés

Constaté :

- `BaseLayout.astro` insère le script Google Tag en inline.
- `BaseLayout.astro` hydrate `DailyLoginTracker`, `AccessibilityPanel`, `ReadingGuide` et `ScrollToTop` avec `client:load`.
- Les routes de chapitre hydratent `CoursTracker`, `ExercicesPlayer`, `QuizPlayer` et `FlashcardsPlayer` avec `client:load`.
- Les pages `/mega-quiz` et `/mega-flashcards` hydratent respectivement `MegaQuizPlayer` et `MegaFlashcardsPlayer`.
- `/profil` hydrate `ProfilePage`.
- `/outils-methodes/python-lab` hydrate `PyodideLab`.
- `/outils-methodes/tableau-periodique` hydrate `TableauPeriodique`.

### Interaction des onglets de chapitre

```text
Clic ou touche clavier sur un onglet
        ↓
script local de ChapterTabs.astro
        ↓
retrait de active sur tous les onglets et panneaux
        ↓
mise à jour de aria-selected, tabindex et hidden
        ↓
affichage du panneau demandé
```

### Interaction des exercices

Constaté dans `ExercicesPlayer.tsx` :

- Lit les données d'exercices depuis la prop `data`.
- Normalise les noms de propriétés.
- Gère l'exercice courant, la réponse élève, l'affichage de la correction, l'auto-évaluation, les filtres de difficulté, les aides ouvertes et les notifications XP.
- Utilise `MathText`, `TextToSpeech`, `XPToast`.
- Stocke certains états dans `localStorage` avec des clés liées au chapitre.

Schéma :

```text
Sélection d'un exercice ou filtre
        ↓
état React local
        ↓
affichage consigne + aides + zone réponse
        ↓
clic "Voir la correction"
        ↓
affichage correction
        ↓
auto-évaluation
        ↓
appel au moteur de gamification
        ↓
localStorage + XPToast
```

### Interaction des quiz

Constaté dans `QuizPlayer.tsx` :

- Prépare les questions.
- Mélange les questions et choix après hydratation.
- Gère sélection, validation, score, écran de fin.
- Utilise `MathText`, `TextToSpeech`, `XPToast`.
- Limite les récompenses par quiz et par jour via `localStorage`.

### Interaction des flashcards

Constaté dans `FlashcardsPlayer.tsx` :

- Utilise le moteur SRS via `getSRSEngine`.
- Propose des sessions `review`, `new` ou `all`.
- Demande une réponse tapée avant révélation.
- Enregistre un rating `again`, `hard`, `good`, `easy`.
- Met à jour le SRS et la gamification.

### Interaction Python

Constaté :

- `PyodideLab.tsx` crée un `Worker` avec `new URL("../../scripts/pyodide-worker.ts", import.meta.url)`.
- Le worker charge Pyodide à la demande.
- Le composant envoie des messages `{ type: "load" }` ou `{ type: "run", id, code }`.
- Le worker répond avec `status`, `loaded`, `result` ou `error`.
- Si le code utilise Matplotlib ou NumPy, le worker enveloppe le code avec une capture des figures en images PNG base64.
- Le composant affiche stdout, stderr, erreurs et images.

Schéma :

```text
Clic "Charger Python"
        ↓
PyodideLab crée ou réutilise un Worker
        ↓
pyodide-worker.ts importe pyodide.mjs depuis jsDelivr
        ↓
message loaded
        ↓
Clic "Exécuter"
        ↓
code envoyé au worker
        ↓
loadPackagesFromImports + runPythonAsync
        ↓
stdout/stderr/images renvoyés au composant
        ↓
affichage des résultats
```

## 13. Simulations scientifiques

### Catalogue

Le catalogue des simulations est déclaré dans `src/data/laboratoire/apps.ts`. Les simulations observées dans ce tableau sont :

| Simulation | Route | Composant | Modèle | Script | Styles | Données |
|---|---|---|---|---|---|---|
| Dipôle RC série | `/laboratoire/circuit-rc` | `CircuitRcSimulator.astro` | `circuit-rc-model.js` | `circuit-rc-simulator.js` | `circuit-rc.css` + `global-lab.css` | `apps.ts` |
| Lois de Kepler | `/laboratoire/lois-kepler` | `KeplerLawsSimulator.astro` | `kepler-laws-model.js` | `kepler-laws-simulator.js` | `kepler-laws.css` + `global-lab.css` | `apps.ts` |
| Modèle des gaz parfaits | `/laboratoire/gaz-parfaits` | `IdealGasSimulator.astro` | `ideal-gas-model.js` | `ideal-gas-simulator.js` | `ideal-gas.css` + `global-lab.css` | `apps.ts` |
| Diffusion et température | `/laboratoire/diffusion-temperature` | `DiffusionTemperatureSimulator.astro` | `diffusion-temperature-model.js` | `diffusion-temperature-simulator.js` | `diffusion-temperature.css` + `global-lab.css` | `apps.ts` |
| Titrage pH-métrique | `/laboratoire/titrage-ph-metrique` | `TitrationPhSimulator.astro` | `titration-ph-model.js` | `titration-ph-simulator.js` | `titration-ph.css` + `global-lab.css` | `apps.ts` |
| Décroissance radioactive | `/laboratoire/decroissance-radioactive` | `RadioactiveDecaySimulator.astro` | `radioactive-decay-model.js` | `radioactive-decay-simulator.js` | `radioactive-decay.css` + `global-lab.css` | `apps.ts` |
| Système solaire | `/laboratoire/systeme-solaire` | `GenericLabSimulator.astro` | intégré au script générique | `generic-lab-simulator.js` | `global-lab.css` | `apps.ts` + `genericConfigs.ts` |
| Labo des mélanges | `/laboratoire/melanges` | `GenericLabSimulator.astro` | intégré au script générique | `generic-lab-simulator.js` | `global-lab.css` | `apps.ts` + `genericConfigs.ts` |
| Chronophotographie | `/laboratoire/chronophotographie` | `GenericLabSimulator.astro` | intégré au script générique | `generic-lab-simulator.js` | `global-lab.css` | `apps.ts` + `genericConfigs.ts` |
| Chaînes énergétiques | `/laboratoire/chaines-energetiques` | `GenericLabSimulator.astro` | intégré au script générique | `generic-lab-simulator.js` | `global-lab.css` | `apps.ts` + `genericConfigs.ts` |
| Réfraction de la lumière | `/laboratoire/refraction-lumiere` | `GenericLabSimulator.astro` | intégré au script générique | `generic-lab-simulator.js` | `global-lab.css` | `apps.ts` + `genericConfigs.ts` |
| Lentilles et images | `/laboratoire/lentilles-images` | `GenericLabSimulator.astro` | intégré au script générique | `generic-lab-simulator.js` | `global-lab.css` | `apps.ts` + `genericConfigs.ts` |
| Laboratoire du pH | `/laboratoire/ph` | `GenericLabSimulator.astro` | intégré au script générique | `generic-lab-simulator.js` | `global-lab.css` | `apps.ts` + `genericConfigs.ts` |
| Oscilloscope | `/laboratoire/oscilloscope` | `GenericLabSimulator.astro` | intégré au script générique | `generic-lab-simulator.js` | `global-lab.css` | `apps.ts` + `genericConfigs.ts` |
| Diffraction et interférences | `/laboratoire/diffraction-interferences` | `GenericLabSimulator.astro` | intégré au script générique | `generic-lab-simulator.js` | `global-lab.css` | `apps.ts` + `genericConfigs.ts` |
| Lunette afocale | `/laboratoire/lunette-afocale` | `GenericLabSimulator.astro` | intégré au script générique | `generic-lab-simulator.js` | `global-lab.css` | `apps.ts` + `genericConfigs.ts` |
| Poids vs masse | `/laboratoire/poids-masse` | `GenericLabSimulator.astro` | intégré au script générique | `generic-lab-simulator.js` | `global-lab.css` | `apps.ts` + `genericConfigs.ts` |
| Loi d'Ohm | `/laboratoire/loi-ohm` | `GenericLabSimulator.astro` | intégré au script générique | `generic-lab-simulator.js` | `global-lab.css` | `apps.ts` + `genericConfigs.ts` |
| Puissance et énergie | `/laboratoire/puissance-energie` | `GenericLabSimulator.astro` | intégré au script générique | `generic-lab-simulator.js` | `global-lab.css` | `apps.ts` + `genericConfigs.ts` |
| Bilans thermiques | `/laboratoire/bilans-thermiques` | `GenericLabSimulator.astro` | intégré au script générique | `generic-lab-simulator.js` | `global-lab.css` | `apps.ts` + `genericConfigs.ts` |
| Titrage conductimétrique | `/laboratoire/titrage-conductimetrique` | `GenericLabSimulator.astro` | intégré au script générique | `generic-lab-simulator.js` | `global-lab.css` | `apps.ts` + `genericConfigs.ts` |
| Enquête des ions | `/laboratoire/test-ions` | `GenericLabSimulator.astro` | intégré au script générique | `generic-lab-simulator.js` | `global-lab.css` | `apps.ts` + `genericConfigs.ts` |
| Mole et pesée | `/laboratoire/mole-pesee` | `GenericLabSimulator.astro` | intégré au script générique | `generic-lab-simulator.js` | `global-lab.css` | `apps.ts` + `genericConfigs.ts` |
| Simulateur de saisons | `/laboratoire/simulateur-saisons` | `GenericLabSimulator.astro` | intégré au script générique | `generic-lab-simulator.js` | `global-lab.css` | `apps.ts` + `genericConfigs.ts` |
| Escape énergie | `/laboratoire/escape-energie` | `GenericLabSimulator.astro` | intégré au script générique | `generic-lab-simulator.js` | `global-lab.css` | `apps.ts` + `genericConfigs.ts` |

### Simulation générique

Constaté dans `GenericLabSimulator.astro` :

- Rend une section `data-generic-lab`.
- Ajoute `data-kind`, `data-slug`, `data-title`.
- Rend deux contrôles de type range :
  - `data-control-a`
  - `data-control-b`
- Rend un `<select data-mode>`.
- Rend un bouton `data-play-toggle` pour certains slugs.
- Rend un bouton `data-reset`.
- Rend des métriques avec `data-context-metric`.
- Rend un canvas `data-canvas`.
- Importe `../../scripts/laboratoire/generic-lab-simulator.js`.

Flux générique :

```text
Entrée dans labApps
        ↓
Route /laboratoire/[slug]
        ↓
genericConfigs[slug]
        ↓
GenericLabSimulator
        ↓
HTML des paramètres + canvas
        ↓
generic-lab-simulator.js
        ↓
lecture de data-control-a, data-control-b, data-mode
        ↓
calcul et dessin selon data-kind / data-slug
        ↓
mise à jour du canvas et des métriques
```

### Modèles dédiés

Constaté :

- `circuit-rc-model.js` est sans accès DOM et expose des fonctions de normalisation, conversion SI et calcul d'état RC.
- `titration-ph-model.js` est sans accès DOM et expose des constantes, presets, limites, normalisation et calculs de titrage.
- `lab-utils.js` expose `onLabReady`, `createLabRuntime`, `fitCanvas`, `frNumber`, `getThemeColor`, `prefersReducedMotion`.
- Les simulateurs dédiés importent un CSS propre, rendent l'interface HTML/SVG/canvas et importent un script contrôleur.

Exemple de flux RC :

```text
src/pages/laboratoire/circuit-rc.astro
        ↓
labApps.find(slug === "circuit-rc")
        ↓
LabAppLayout
        ↓
CircuitRcSimulator.astro
        ↓
champs radio, sliders R/C/E, boutons, SVG circuit, SVG graphiques
        ↓
initCircuitRcSimulator dans circuit-rc-simulator.js
        ↓
circuit-rc-model.js
        ↓
calcul de tau, uC, uR, courant, énergie
        ↓
mise à jour du DOM, SVG et tableaux
```

## 14. Navigation

### Navigation principale

Constaté dans `BaseLayout.astro` :

- Navigation écrite directement dans le layout.
- Liens principaux :
  - Accueil : `/`
  - Collège : `/college`
  - Lycée : `/lycee`
  - Outils & Méthodes : `/outils-methodes`
  - Laboratoire : `/laboratoire`
- L'état actif est déterminé par `Astro.url.pathname`.

### Navigation collège et lycée

Constaté :

- Les pages `/college` et `/lycee` construisent des cartes de niveaux à partir de `levels.ts`.
- Elles comptent les chapitres disponibles avec `import.meta.glob`.
- Les pages `/college/[niveau]` et `/lycee/[niveau]` affichent deux colonnes ou sections par matière.
- Les pages `/college/[niveau]/[matiere]` et `/lycee/[niveau]/[matiere]` affichent la liste des chapitres filtrés.
- Les pages de chapitre affichent un fil d'Ariane via `Breadcrumb.astro`.
- La page de chapitre lycée ajoute une navigation précédent/suivant calculée à partir des `meta.json` du même niveau et de la même matière.

Parcours technique type :

```text
Clic sur "Lycée"
        ↓
src/pages/lycee/index.astro
        ↓
lyceeLevels + comptage des meta.json
        ↓
cartes de niveaux
        ↓
Clic sur "1re spécialité"
        ↓
src/pages/lycee/[niveau]/index.astro
        ↓
filtrage des chapitres lycee/1ere-spe
        ↓
cartes Chimie / Physique
        ↓
Clic sur un chapitre
        ↓
src/pages/lycee/[niveau]/[matiere]/[chapitre].astro
        ↓
chargement du paquet de chapitre
```

### Navigation outils et méthodes

Constaté :

- `/outils-methodes` contient trois cartes vers collège, lycée, transverses.
- `OutilsMethodesListing.astro` affiche un fil de navigation interne vers ces trois espaces.
- Les ressources affichées sont filtrées depuis `outilsMethodesResources`.
- Les fiches de méthodes mathématiques utilisent des routes dynamiques et une navigation précédent/suivant depuis le tableau de données.

### Navigation laboratoire

Constaté :

- `/laboratoire` affiche des filtres par niveau, thème et sous-thème.
- Chaque carte `LabAppCard` contient des attributs `data-lab-card`, `data-theme`, `data-levels`, `data-topics`, `data-search`.
- Le script `filter-lab-index.js` filtre les cartes selon les cases cochées et la recherche.
- Chaque simulation utilise `LabAppLayout` avec un lien de retour vers `/laboratoire`.

## 15. Services externes

Services ou sources externes observés dans le code :

| Service | Où il est configuré | Fonction générale | Données échangées visibles |
|---|---|---|---|
| Google Tag Manager / Analytics | `src/layouts/BaseLayout.astro` | mesure d'audience côté navigateur | identifiant `G-9JPGPYQZ3C` dans le code |
| Google Fonts | `src/styles/design-system.css` | chargement de Plus Jakarta Sans | requête CSS vers Google Fonts |
| jsDelivr OpenDyslexic | `src/styles/design-system.css` | chargement de polices dyslexie | fichiers WOFF |
| jsDelivr Pyodide | `src/scripts/pyodide-worker.ts` | chargement de Python WebAssembly | module `pyodide.mjs` et paquets importés par le code Python |

Éléments non observés :

- Aucun appel Supabase actif n'a été trouvé dans les fichiers analysés.
- Le moteur de gamification contient un commentaire mentionnant une migration Supabase en phase future, mais le stockage constaté est `localStorage`.
- Aucune variable d'environnement n'a été relevée par recherche dans les fichiers analysés.

## 16. Flux de fonctionnement complet

### Flux d'un chapitre pédagogique

```text
Dossier de chapitre dans src/data/chapters
        ↓
meta.json donne titre, niveau, matière, ordre, SEO et XP
        ↓
cours.mdx donne le contenu de cours
        ↓
exercices.json, quiz.json, flashcards.json donnent les activités
        ↓
route dynamique collège ou lycée
        ↓
BaseLayout
        ↓
Breadcrumb + header chapitre
        ↓
ChapterTabs
        ↓
contenu cours rendu par MDX
        ↓
React hydraté pour exercices, quiz et flashcards
        ↓
localStorage pour progression et récompenses
```

### Flux d'un cours MDX simple

```text
cours.mdx
        ↓
Astro MDX
        ↓
remark-math
        ↓
rehype-katex
        ↓
rehypeCourseSections
        ↓
HTML de cours dans CoursTracker
        ↓
styles de design-system.css
```

### Flux d'un cours MDX avec fragment HTML

```text
cours.mdx
        ↓
import html from "./cours.fragment.html?raw"
        ↓
RawHtml.astro
        ↓
normalisation HTML + rendu KaTeX
        ↓
set:html dans .spe-imported-content
        ↓
styles globaux et styles RawHtml
```

### Flux d'une simulation dédiée

```text
labApps
        ↓
route dédiée dans src/pages/laboratoire
        ↓
LabAppLayout
        ↓
composant Astro de simulation
        ↓
CSS global laboratoire + CSS dédié
        ↓
script contrôleur
        ↓
modèle scientifique
        ↓
DOM/SVG/canvas mis à jour
```

### Flux d'une simulation générique

```text
labApps
        ↓
genericConfigs
        ↓
src/pages/laboratoire/[slug].astro
        ↓
GenericLabSimulator
        ↓
generic-lab-simulator.js
        ↓
canvas + readout + métriques
```

### Flux Python

```text
/outils-methodes/python-lab
        ↓
PyodideLab client:load
        ↓
Web Worker pyodide-worker.ts
        ↓
chargement Pyodide depuis jsDelivr
        ↓
exécution Python
        ↓
stdout, stderr, images matplotlib
        ↓
affichage dans le composant React
```

## 17. Tableau des fichiers structurants

| Chemin | Type | Rôle | Utilisé par | Dépend de |
|---|---|---|---|---|
| `package.json` | configuration npm | scripts et dépendances | environnement de développement et build | npm |
| `astro.config.mjs` | configuration Astro | intégrations, markdown, sitemap, sortie statique | Astro | `@astrojs/*`, `remark-math`, `rehype-katex`, `rehypeCourseSections` |
| `tsconfig.json` | configuration TypeScript | strict Astro + JSX React | TS/Astro | `astro/tsconfigs/strict` |
| `src/layouts/BaseLayout.astro` | layout Astro | structure HTML globale, SEO, navigation, footer | presque toutes les routes | design-system, KaTeX CSS, composants globaux |
| `src/pages/index.astro` | route Astro | accueil/dashboard | URL `/` | `Dashboard`, données chapitres |
| `src/pages/college/index.astro` | route Astro | entrée collège | URL `/college` | `levels.ts`, `meta.json` |
| `src/pages/lycee/index.astro` | route Astro | entrée lycée | URL `/lycee` | `levels.ts`, `meta.json` |
| `src/pages/college/[niveau]/[matiere]/[chapitre].astro` | route dynamique | page chapitre collège | URL chapitre collège | données chapitre, composants pédagogiques |
| `src/pages/lycee/[niveau]/[matiere]/[chapitre].astro` | route dynamique | page chapitre lycée | URL chapitre lycée | données chapitre, composants pédagogiques |
| `src/data/levels.ts` | données TypeScript | niveaux et matières | routes collège/lycée | aucun import externe observé |
| `src/data/chapters/` | données pédagogiques | chapitres | routes dynamiques, méga quiz, méga flashcards | structure de dossiers |
| `src/components/pedagogie/ChapterTabs.astro` | composant Astro | onglets chapitre | routes de chapitre | script inline |
| `src/components/pedagogie/CoursTracker.tsx` | composant React | lecture cours + XP + TTS | routes de chapitre | gamification, TTS, XPToast |
| `src/components/pedagogie/ExercicesPlayer.tsx` | composant React | exercices interactifs | routes de chapitre | gamification, MathText, TTS |
| `src/components/pedagogie/QuizPlayer.tsx` | composant React | quiz interactif | routes de chapitre | gamification, MathText, TTS |
| `src/components/pedagogie/FlashcardsPlayer.tsx` | composant React | flashcards SRS | routes de chapitre | SRS, gamification |
| `src/components/pedagogie/RawHtml.astro` | composant Astro | rendu de fragments HTML de cours | cours MDX terminale spécialité | KaTeX |
| `src/utils/rehypeCourseSections.mjs` | plugin Rehype | transformation des sections de cours | `astro.config.mjs` | arbre HTML Rehype |
| `src/styles/design-system.css` | CSS global | variables, thèmes, composants visuels | `BaseLayout` | Google Fonts, jsDelivr OpenDyslexic |
| `src/pages/laboratoire.astro` | route Astro | catalogue laboratoire | URL `/laboratoire` | `labApps`, `LabAppCard`, `filter-lab-index.js` |
| `src/data/laboratoire/apps.ts` | données TypeScript | catalogue simulations | routes laboratoire | aucun import externe observé |
| `src/data/laboratoire/genericConfigs.ts` | données TypeScript | contrôles génériques | `GenericLabSimulator` | aucun import externe observé |
| `src/components/laboratoire/LabAppLayout.astro` | composant Astro | enveloppe simulation | routes laboratoire | `BaseLayout`, `global-lab.css` |
| `src/components/laboratoire/GenericLabSimulator.astro` | composant Astro | interface de simulations génériques | `/laboratoire/[slug]` | `generic-lab-simulator.js` |
| `src/scripts/laboratoire/lab-utils.js` | script JS | utilitaires d'initialisation et runtime | scripts laboratoire | DOM, ResizeObserver, RAF |
| `src/scripts/laboratoire/generic-lab-simulator.js` | script JS | contrôleur générique | `GenericLabSimulator` | `lab-utils.js` |
| `src/scripts/laboratoire/circuit-rc-model.js` | modèle JS | calculs circuit RC | tests et simulateur RC | fonctions mathématiques JS |
| `src/scripts/laboratoire/titration-ph-model.js` | modèle JS | calculs de titrage pH | tests et simulateur pH | fonctions mathématiques JS |
| `src/pages/outils-methodes.astro` | route Astro | entrée outils/méthodes | URL `/outils-methodes` | tableau local |
| `src/data/outilsMethodes.ts` | données TypeScript | catalogue outils/méthodes | pages outils | aucun import externe observé |
| `src/components/outils/OutilsMethodesListing.astro` | composant Astro | listing outils/méthodes | pages outils par niveau | `outilsMethodes.ts` |
| `src/pages/outils-methodes/python-lab.astro` | route Astro | laboratoire Python | URL `/outils-methodes/python-lab` | `PyodideLab` |
| `src/components/pedagogie/PyodideLab.tsx` | composant React | interface Python | page Python lab | `pyodide-worker.ts` |
| `src/scripts/pyodide-worker.ts` | Web Worker | exécution Python | `PyodideLab` | CDN Pyodide |
| `src/data/gamification/engine.ts` | moteur TS | XP, progression, badges | composants pédagogiques | `localStorage`, `config.ts` |
| `src/data/gamification/srs.ts` | moteur TS | répétition espacée | `FlashcardsPlayer` | `localStorage` |
| `src/data/accessibility/a11y-engine.ts` | moteur TS | préférences d'accessibilité | `AccessibilityPanel` | `localStorage`, classes CSS |

## 18. Glossaire du projet

| Terme | Sens constaté dans le dépôt |
|---|---|
| `cycle` | Premier segment sous `src/data/chapters/`, avec valeurs observées `college` ou `lycee`. |
| `niveau` | Slug de classe ou enseignement, par exemple `5eme`, `2nde`, `1ere-spe`, `terminale-spe`. |
| `matiere` | Segment `chimie` ou `physique`. |
| `chapitre` | Slug du dossier de chapitre, utilisé dans l'URL dynamique. |
| `meta.json` | Fichier de métadonnées utilisé pour générer listes, titres, SEO, ordre et XP. |
| `cours.mdx` | Fichier de cours rendu par Astro MDX. |
| `cours.fragment.html` | Fragment HTML brut importé par certains `cours.mdx` via `?raw`. |
| `ChapterTabs` | Composant d'onglets pour cours, exercices, quiz et flashcards. |
| `CoursTracker` | Composant React qui suit la lecture d'un cours. |
| `ExercicesPlayer` | Lecteur React des exercices JSON. |
| `QuizPlayer` | Lecteur React des quiz JSON. |
| `FlashcardsPlayer` | Lecteur React de flashcards avec SRS. |
| `MegaQuiz` | Agrégation de tous les `quiz.json` dans une session globale. |
| `MegaFlashcards` | Agrégation de tous les `flashcards.json` dans une session globale. |
| `labApps` | Tableau central des simulations du laboratoire. |
| `genericConfigs` | Configuration des paramètres pour les simulations génériques. |
| `simKind` | Type de simulation utilisé comme donnée par le simulateur générique. |
| `legacyPath` | Chemin vers une version autonome historique située dans le dossier racine `laboratoire/`. |
| `LabAppLayout` | Enveloppe commune des pages de laboratoire. |
| `onLabReady` | Utilitaire qui initialise une simulation quand le DOM est prêt et lors d'événements Astro. |
| `createLabRuntime` | Utilitaire qui regroupe listeners, timers, animation frame et nettoyage. |
| `SRS` | Système de répétition espacée utilisé pour les flashcards. |
| `XPToast` | Notification visuelle utilisée après une action de progression. |
| `A11yEngine` | Moteur de préférences d'accessibilité appliquant des classes CSS au site. |
| `PyodideLab` | Interface React pour exécuter Python dans un Web Worker. |
| `RawHtml` | Composant qui rend du HTML brut importé et transforme les formules mathématiques. |

## 19. Éléments non déterminés

Les éléments suivants n'ont pas pu être établis avec certitude dans cette lecture descriptive :

- L'état courant du build de production n'a pas été déterminé, car aucune commande `npm run build` n'a été exécutée pour produire ce rapport.
- Le rôle exact des dossiers `output/` et `tmp/` n'a pas été détaillé fichier par fichier.
- Le contenu de `src/pages/404.astro` n'a pas été analysé en détail.
- Les composants `BadgesPage.tsx`, `ChapterBadges.astro`, `ChapterProgressCard.astro`, `ChapterStatusCard.astro`, `CalibrationSimulator.tsx`, `ColorimetricTitrationSimulator.tsx`, `PythonExercisesRunner.tsx`, `RelationChooser.tsx`, `RedoxBuilder.tsx`, `StatsPage.tsx` et `StudentDashboard.astro` ont été inventoriés, mais leurs usages précis n'ont pas tous été reliés à une route pendant cette lecture.
- Le dossier `src/content/` existe, mais aucun mécanisme Astro Content Collections n'a été constaté par recherche dans les fichiers analysés.
- Le dossier racine `spe/` existe et des métadonnées de terminale spécialité pointent vers `spe/...`, mais le flux exact entre ces ressources et les fragments présents dans `src/data/chapters/` n'a pas été entièrement reconstitué.
- Les anciens fichiers autonomes du dossier racine `laboratoire/` sont référencés par `legacyPath`, mais leur usage direct dans l'interface Astro actuelle n'a pas été observé au-delà de l'attribut `data-legacy-path`.
- Aucun script npm de test n'est déclaré dans `package.json`, même si des fichiers de tests sont présents dans `tests/laboratoire/`.
- Les fichiers CSS vides `src/styles/core.css`, `src/styles/components.css` et `src/styles/theme.css` sont présents, mais aucun import actif n'a été constaté pendant cette lecture.
