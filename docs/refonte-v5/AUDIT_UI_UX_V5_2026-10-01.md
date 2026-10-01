# Audit UI/UX V5 — Reconstruction unifiée

**Date :** 1 octobre 2026  
**Branche cible :** `ux-ui-v5-rebuild-2026-10-01`  
**Périmètre :** accueil, navigation, catalogues collège/lycée, mathématiques, physique-chimie, pages chapitre, cours, exercices, quiz, flashcards, laboratoire, outils, consentement, responsive.

## 1. Verdict

L'interface actuelle n'est pas un système unique. Elle juxtapose plusieurs générations de styles et de composants. Les captures de contrôle montrent des écarts de géométrie, de densité, de typographie et de composants assez importants pour justifier une reconstruction du système visuel plutôt qu'une nouvelle couche de correctifs.

La reconstruction V5 conserve le contenu, les routes, la progression, les moteurs SRS/XP, les données et les composants métier. Elle remplace la présentation par un système unique.

## 2. Causes racines confirmées dans le code

### 2.1 Cascade CSS en couches concurrentes

`BaseLayout.astro` charge simultanément :
- `design-system.css`
- `landing-v3.css`
- `learning-workspace.css`
- `home-coherence.css`

`design-system.css` importe lui-même :
- `tokens-v3.css`
- `theme.css`
- `core.css`
- `components.css`
- `course-content.css`
- `utilities.css`
- `reference-v3.css`

À cela s'ajoutent de nombreux blocs `<style>` au niveau des pages et composants.

Conséquence : plusieurs sources définissent les mêmes concepts (cartes, onglets, largeur, boutons, hero, navigation, couleurs, ombres).

### 2.2 Usage d'overrides globaux

`reference-v3.css` et `home-coherence.css` re-stylent des composants existants avec des sélecteurs globaux et des `!important`. Cela produit des résultats visuels différents selon l'ordre de cascade et la page.

### 2.3 Géométries incompatibles

Plusieurs largeurs coexistent : 1080, 1100, 1120, 1180, 1440, 1450 px, plus des cartes et contenus en 70ch.

Aucune règle ne définit clairement :
- largeur d'application ;
- largeur de lecture ;
- largeur d'outil ;
- largeur de grille.

### 2.4 Composants visuels dupliqués

Des variantes différentes existent pour :
- boutons ;
- cartes ;
- tabs ;
- badges ;
- barres de recherche ;
- heroes ;
- listes de chapitres ;
- filtres ;
- breadcrumbs.

Exemple : `.tab-pill` est défini à la fois dans `components.css` et dans `ChapterTabs.astro`.

### 2.5 Catalogue cassé par composition de grilles

Sur les pages de niveau collège, `.catalogue-layout` crée deux colonnes (chimie/physique), puis chaque `CatalogueChapterList` crée encore trois colonnes. Sur desktop, cela revient à essayer d'afficher jusqu'à six cartes dans environ 1080 px.

C'est la cause directe des cartes très étroites visibles dans la capture du niveau 5e.

### 2.6 Hiérarchie de page non stable

Les pages "choisir un niveau", "catalogue de niveau", "chapitre" et "cours" n'utilisent pas la même trame verticale :
- en-têtes de tailles différentes ;
- actions positionnées différemment ;
- cartes parfois très hautes ;
- recherche parfois isolée ;
- contenu parfois presque pleine largeur ;
- navigation locale parfois en pills, parfois en tabs.

### 2.7 Cours visuellement distinct du reste du produit

Le cours conserve des styles hérités : encadrés volumineux, titres/boîtes pédagogiques et largeurs différentes du shell chapitre. La capture montre notamment un bloc "Objectifs" surdimensionné qui ne suit pas la même densité que les catalogues.

### 2.8 Trop de style local

De nombreuses pages possèdent leur propre bloc `<style>`. Deux pages représentant pourtant le même niveau d'architecture peuvent donc diverger avec le temps.

## 3. Principes V5 obligatoires

1. Un seul design system global.
2. Aucune couleur de marque codée localement.
3. Aucun `!important` dans la nouvelle couche V5.
4. Une seule définition par primitive : bouton, carte, input, badge, tab, breadcrumb.
5. Une seule géométrie de page par type.
6. Les contenus longs utilisent une largeur de lecture de 68–72ch.
7. Les catalogues utilisent des cartes horizontales ou 2 colonnes maximum selon la largeur.
8. Aucun emboîtement grille 2 colonnes × grille 3 colonnes.
9. Les éléments interactifs font au minimum 44 px.
10. La couleur ne porte jamais seule l'information.
11. Tous les états focus utilisent le même token.
12. Les pages Maths et Physique-Chimie partagent la structure ; seul l'accent de discipline change.
13. Le contenu et la logique métier restent inchangés.

## 4. Architecture UI cible

```text
src/ui-v5/
├── tokens.css
├── reset.css
├── layout.css
├── primitives.css
├── components.css
├── content.css
├── responsive.css
└── README.md

src/components/ui-v5/
├── AppShell.astro
├── PageHeader.astro
├── SectionHeader.astro
├── Button.astro
├── Card.astro
├── Badge.astro
├── SearchField.astro
├── Breadcrumbs.astro
├── SegmentedTabs.astro
├── SubjectAccent.astro
├── LevelCard.astro
├── ChapterCard.astro
└── EmptyState.astro
```

## 5. Géométries V5

- **App max** : 1280 px
- **Large content** : 1180 px
- **Catalogue** : 1120 px
- **Lecture** : 70ch
- **Sidebar + contenu** : 260 px + minmax(0, 1fr)
- **Grille chapitre desktop** : 2 colonnes max
- **Grille tablette** : 1 colonne
- **Mobile** : 1 colonne, padding 16 px

## 6. Modèles de pages

### A. Page d'entrée matière / cycle
Header commun → contexte → titre → texte court → 1 CTA principal → grille de niveaux uniforme.

### B. Page niveau
Breadcrumb → titre compact → filtres/recherche → liste unique de chapitres.  
Physique et chimie sont des filtres/tags, pas deux sous-grilles concurrentes.

### C. Page chapitre
Breadcrumb → titre + métadonnées → tabs → contenu.  
Une seule largeur de shell. Les objectifs/prérequis deviennent un panneau compact.

### D. Cours
Lecture 70ch.  
Les définitions, méthodes, exemples et vigilances sont des accents éditoriaux sobres, pas des cartes massives.

### E. Exercices / quiz / flashcards
Même workspace : titre, progression, contenu principal, actions en bas.  
Même rayon, même input, même feedback.

### F. Laboratoire
Même header et même shell que le reste.  
Desktop : filtres 260 px + grille.  
Mobile : drawer de filtres.

## 7. Reconstruction par lots

### Lot 0 — Isolation
- branche V5 ;
- audit ;
- freeze des routes et tests métier.

### Lot 1 — Fondation
- tokens V5 ;
- AppShell ;
- primitives ;
- suppression progressive des overrides V3 sur les pages migrées.

### Lot 2 — Navigation + pages d'entrée
- header ;
- footer ;
- accueil ;
- espaces matière ;
- collège/lycée.

### Lot 3 — Catalogues
- niveau ;
- matière ;
- recherche ;
- cartes chapitre.

### Lot 4 — Chapitre + cours
- shell ;
- tabs ;
- panneau objectifs ;
- contenu éditorial.

### Lot 5 — Exercices / quiz / flashcards
- workspace partagé ;
- feedback ;
- résultats ;
- SRS visuel.

### Lot 6 — Laboratoire + outils
- filtres ;
- cartes ;
- pages simulation ;
- kit scientifique.

### Lot 7 — Nettoyage
- suppression des styles V3 devenus inutiles ;
- suppression des styles locaux redondants ;
- zéro `!important` V5 ;
- audit responsive, clavier, axe, contraste et visuel.

## 8. Critères d'acceptation

La V5 n'est pas validée tant que :
- les pages représentatives ont la même largeur, les mêmes espacements et les mêmes primitives ;
- aucune carte de catalogue ne descend sous une largeur lisible ;
- les trois captures de référence ne montrent plus de rupture de langage visuel ;
- le cours, le catalogue et le chapitre paraissent appartenir au même produit ;
- mobile 360/390, tablette 768 et desktop 1440 sont testés ;
- les tests contenus, routes, progression, SRS et XP restent verts ;
- l'accessibilité clavier et les contrastes sont vérifiés ;
- les screenshots de régression V5 sont stockés dans le dépôt.

## 9. Décision

Ne plus corriger V3/V4 par couches supplémentaires.  
La V5 reconstruit l'interface sur un socle unique et migre les pages par famille, tout en gardant les données et la logique existantes.
