# CLAUDE.md — Instructions pour Claude Code

## Projet

Plateforme éducative française de physique-chimie (collège + lycée).
Astro.js + React + MDX. Site statique déployé sur Vercel.
Développeur : Ludovic Belhomme.

## Stack technique

- **Framework** : Astro.js v5.18+ avec React et MDX
- **Math** : KaTeX via `remark-math` + `rehype-katex` (configuré dans astro.config.mjs)
- **Styles** : CSS variables dans `src/styles/design-system.css` (PAS de Tailwind)
- **Données** : localStorage (pas de backend)
- **Déploiement** : Vercel, site statique (`output: 'static'`)
- **Polices** : Plus Jakarta Sans + OpenDyslexic (CDN)

## Structure du projet

```
src/
├── components/pedagogie/    → Composants React (Quiz, Flashcards, Exercices, Dashboard, etc.)
├── components/accessibility/ → AccessibilityPanel, ReadingGuide
├── components/ui/           → ScrollToTop, SearchBar
├── data/gamification/       → engine.ts, config.ts, srs.ts, useGamification.ts
├── data/accessibility/      → a11y-engine.ts
├── data/levels.ts           → Définition de tous les niveaux (collège + lycée)
├── data/chapters/           → Contenu des chapitres (meta.json + cours.mdx + exercices/quiz/flashcards.json)
├── layouts/BaseLayout.astro → Layout principal (SEO, nav, footer, composants globaux)
├── pages/                   → Pages Astro (routes)
└── styles/design-system.css → Design system complet (7 thèmes, DYS, responsive)
```

## Structure d'un chapitre

Chaque chapitre est dans `src/data/chapters/college/[niveau]/[matiere]/[slug]/` et contient 5 fichiers :

- `meta.json` — métadonnées (title, slug, niveau, matiere, order, description, keywords, xp, seo)
- `cours.mdx` — cours avec encadrés pédagogiques et formules KaTeX
- `exercices.json` — exercices progressifs (⭐ à 🏆 Brevet)
- `quiz.json` — 10 QCM avec 4 choix et explanations
- `flashcards.json` — cartes recto/verso avec difficulté 1-3

Les routes dynamiques et les pages Mega détectent automatiquement les nouveaux chapitres via `import.meta.glob`.

## Règles MDX strictes (IMPORTANT)

Les fichiers `cours.mdx` sont parsés par MDX qui traite TOUT comme du JSX. Respecter ces règles :

1. **Formules LaTeX** : `$...$` inline et `$$...$$` blocs fonctionnent grâce à remark-math + rehype-katex. NE PAS les échapper.
2. **Style HTML** : utiliser `style="color:red"` (HTML standard). JAMAIS `style={{color:"red"}}` (JSX).
3. **SVG inline** : INTERDIT dans le MDX (les `{}` sont interprétés comme du JS). Utiliser un composant React importé.
4. **Encadrés** : utiliser `<div class="definition-box">`, `<div class="example-box">`, `<div class="info-box">`, `<div class="box-regle-or">`.
5. **Import de composants** : possible en haut du MDX, ex: `import TableauPeriodique from "../../...tsx";`

## Encadrés MDX disponibles

```mdx
<div class="definition-box">    → bleu (définitions, formules)
<div class="example-box">       → vert (exemples)
<div class="info-box">          → jaune (à savoir, astuces)
<div class="box-regle-or">      → rouge (règles d'or, attention)
```

## Format des fichiers JSON

### meta.json
```json
{
  "title": "Titre du chapitre",
  "slug": "slug-du-chapitre",
  "niveau": "3eme",
  "matiere": "chimie",
  "theme": "Organisation et transformation de la matière",
  "order": 1,
  "description": "Description courte",
  "keywords": ["mot1", "mot2"],
  "xp": { "cours": 10, "quiz_base": 5, "quiz_per_correct": 2, "quiz_perfect": 10, "flashcards_base": 5, "flashcard_known": 1, "exercice_each": 3, "exercice_all": 15, "chapter_complete": 25 },
  "seo": { "meta_title": "...", "meta_description": "...", "canonical": "/college/3eme/chimie/slug", "schema_type": "EducationalContent", "educationalLevel": "Collège — 3ème" }
}
```

### quiz.json
```json
[
  {
    "id": "unique-id",
    "question": "Texte avec $formule$ KaTeX possible",
    "choices": ["Choix A", "Choix B", "Choix C", "Choix D"],
    "answer": 0,
    "explanation": "Explication détaillée"
  }
]
```

### exercices.json
```json
[
  {
    "id": "unique-id",
    "title": "Titre de l'exercice",
    "difficulty": 1,
    "difficultyLabel": "⭐ Débutant",
    "consigne": "Texte de la consigne (\\n pour sauts de ligne, $formules$ possibles)",
    "correction": ["Étape 1 de la correction", "Étape 2"]
  }
]
```

### flashcards.json
```json
[
  {
    "id": "unique-id",
    "front": "Question recto",
    "back": "Réponse verso",
    "difficulty": 1
  }
]
```

## Design system

- **Fond** : `--bg-body: #eef2f7` (bleu pâle)
- **Accent** : `--accent-primary: #4f46e5` (indigo)
- **Cartes** : `--bg-card: #ffffff` avec `--shadow-card` et `--radius-lg`
- **7 thèmes** : clair, gris-clair, gris, sombre, sépia, nuit, auto
- **Responsive** : breakpoints 480px, 768px
- Toujours utiliser les CSS variables (jamais de couleurs en dur dans les composants)

## Gamification

- 14 rangs : Quark → Multivers (XP croissant)
- 23 badges avec niveaux bronze/argent/or
- Streaks (jours consécutifs)
- Anti-triche : XP 1x/jour par quiz, shuffle des questions
- SRS : algorithme SM-2 (4 boutons Anki) pour les flashcards

## Commandes utiles

```bash
npm run dev      # Développement local (port 4321)
npm run build    # Build de production
npm run preview  # Preview du build (faire build AVANT)
```

## Contenu existant (3ème complet)

### Chimie (6 chapitres)
1. L'atome (order:1) — avec TableauPeriodique interactif
2. Les ions (order:2)
3. Les molécules (order:3)
4. pH, Acides et Bases (order:4)
5. La masse volumique (order:5)
6. Les transformations chimiques (order:6)

### Physique (6 chapitres)
1. La loi d'Ohm (order:1)
2. Puissance et énergie (order:2)
3. L'énergie mécanique (order:3)
4. Signaux : Sons et Lumière (order:4)
5. Sources et formes d'énergie (order:5)
6. Mouvements et interactions (order:6)

## Workflow pour ajouter un chapitre

1. Créer le dossier `src/data/chapters/college/[niveau]/[matiere]/[slug]/`
2. Créer les 5 fichiers (meta.json, cours.mdx, exercices.json, quiz.json, flashcards.json)
3. C'est tout — les routes dynamiques, Dashboard, Mega Quiz/Flashcards détectent automatiquement

## Ce qui reste à faire (par priorité)

### Priorité haute
- Soumettre sitemap à Google Search Console
- Créer image OG (1200×630px)
- Fusionner pages stats+badges en /profil unique

### Priorité moyenne
- Contenu 4ème, 5ème, 6ème (Ludovic fournit les HTML)
- Contenu lycée (2nde, 1ère Spé, Term Spé)
- Page Outils & Méthodes (convertisseur, formulaires)
- Tests mobiles approfondis

### Priorité basse
- Laboratoire (simulations interactives)
- Auth Supabase + paiement Stripe
- PWA / app mobile (Capacitor)
- Escape game

## Composants et versions

| Composant | Version | Description |
|-----------|---------|-------------|
| QuizPlayer | v7 | KaTeX + TTS + hydration guard |
| FlashcardsPlayer | v7 | KaTeX + TTS + SRS Anki |
| ExercicesPlayer | v7 | KaTeX + TTS + auto-évaluation |
| Dashboard | v3 | Compact, pills stats, mega links |
| TableauPeriodique | v3 | 118 éléments, modale, données complètes |
| MegaQuizPlayer | v2 | KaTeX + filtres niveau/matière/chapitre |
| MegaFlashcardsPlayer | v2 | KaTeX + filtres |
| SearchBar | v1 | Recherche temps réel avec dropdown |

## Pièges fréquents

1. **MDX + accolades** : Tout `{` dans un MDX est interprété comme du JS. Les formules $$...$$ fonctionnent grâce aux plugins, mais le SVG inline ne marche PAS.
2. **npm run preview sans build** : Montre une version périmée. Toujours faire `npm run build` avant.
3. **Conversions mA → A** : Dans les quiz/exercices de physique, les intensités sont souvent en mA. Vérifier la cohérence.
4. **getStaticPaths** : Toute route dynamique `[param].astro` doit exporter une fonction `getStaticPaths()`.
