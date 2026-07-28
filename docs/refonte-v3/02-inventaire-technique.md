# Inventaire technique

Stack detectee :

- Astro `^5.17.1`
- React `^19.2.4`
- MDX via `@astrojs/mdx`
- KaTeX via `remark-math` et `rehype-katex`
- validation de contenus avec Zod `4.4.3`
- tests Node via `tsx --test`
- ESLint 9
- sortie Astro statique

Arborescence principale :

- `src/pages/` : routes publiques et dynamiques
- `src/layouts/BaseLayout.astro` : layout global, SEO, navigation, accessibilite et consentement analytics
- `src/components/pedagogie/` : quiz, flashcards, progression, dashboard, exercices
- `src/components/accessibility/` : panneau d'accessibilite et guide de lecture
- `src/data/` : contrats, niveaux, routes, contenus et methodes
- `src/data/chapters/` : physique-chimie
- `src/data/mathematiques/` : mathematiques
- `src/data/laboratoire/` : index et configurations de laboratoire
- `src/scripts/laboratoire/` : modeles et simulateurs
- `src/styles/design-system.css` : theme global et variantes DYS

Points forts :

- generation statique robuste ;
- tests deja presents pour contrats, IDs, progressions, laboratoires et securite des contenus ;
- sanitisation dediee pour HTML/SVG de confiance ;
- routes legacy et explicites deja preparees pour physique-chimie.

Risques :

- hydratation globale de plusieurs composants sur toutes les pages ;
- dependances de polices externes Google/CDN ;
- simulateur generique tres volumineux ;
- contrat de contenu encore marque `incomplet-publiable` pour tous les chapitres ;
- `audit:dist` trop long pour etre exploitable tel quel.
