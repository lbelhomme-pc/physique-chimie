# Audit UX/UI V5 — cohérence totale du site

Date : 1 octobre 2026  
Branche de travail : `ux-ui-v4-audit-2026-10-01`

## Verdict

Le site n'a pas un design system réellement unique. Il superpose plusieurs générations d'interface : composants V3, couche de cohérence homepage, styles historiques globaux, styles locaux de pages et styles inline React. Le problème visible n'est donc pas un défaut isolé mais une divergence d'architecture UI.

## Défauts confirmés par les captures et le code

### 1. Géométrie incohérente
- Largeurs concurrentes : 1080, 1100, 1120, 1180, 1280, 1440 et 1450 px.
- Les landing pages, catalogues, chapitres et lecteurs ne partagent pas le même conteneur.
- Le cours utilise une mesure de lecture courte alors que certains blocs introductifs occupent toute la largeur.

### 2. Catalogue cassé par grille imbriquée
- `.catalogue-layout` affiche Chimie et Physique en deux colonnes.
- Chaque `.catalogue-list` affiche ensuite trois colonnes.
- Résultat : jusqu'à six colonnes implicites, cartes étroites, titres cassés et lecture verticale artificielle.

### 3. Composants visuellement équivalents mais implémentés plusieurs fois
- Cartes : `.card`, `.v3-landing-card`, `.math-card`, `.catalogue-card`, `.level-card`, `.lab-card`.
- Boutons : `.btn`, actions landing, actions niveau, actions catalogue, boutons React inline.
- Recherche : `.search-bar`, `.legacy-search`, `.catalogue-search`, recherche laboratoire.
- Navigation secondaire : pills historiques, filtres catalogue, onglets chapitre.
- Ces variantes ont des rayons, bordures, ombres et densités différents.

### 4. Styles locaux et inline trop nombreux
- Plusieurs pages définissent leur propre charte dans un bloc `<style>`.
- Les lecteurs React conservent encore du style inline.
- `home-coherence.css` ajoute une troisième couche de correction par-dessus le design system.

### 5. Couleurs et tokens pas totalement centralisés
- Des hex et rgba subsistent dans navigation, footer, contenus pédagogiques et laboratoire.
- Certaines couleurs sémantiques sont recréées localement.

### 6. Hiérarchie éditoriale irrégulière
- Les landing pages utilisent une hero riche.
- Les pages catalogue réintroduisent breadcrumb + nav + hero + filtres + sections, avec trop de strates.
- Les chapitres utilisent encore une autre hiérarchie.
- Le résultat donne l'impression de changer de produit à chaque niveau.

## Architecture cible V5

Un seul vocabulaire :
- `--ui-max` : largeur globale 1200 px.
- `--ui-readable` : lecture longue 72ch.
- `--ui-radius` : 10 px.
- `--ui-border` : une bordure standard.
- ombre uniquement pour menus flottants et hover, jamais comme décoration permanente.
- boutons rectangulaires arrondis, hauteur minimum 44 px.
- une seule logique de recherche.
- une seule carte générique, avec accents de discipline via tokens.
- un seul rythme vertical.

## Règles par famille

### Landing / niveaux
- grille 2 colonnes desktop, 1 colonne mobile.
- carte entière cliquable quand une destination principale existe.
- actions secondaires réduites à des liens sobres.
- mêmes paddings et même hauteur minimale.

### Catalogues
- sections Matière empilées verticalement.
- grille de chapitres : 3 colonnes seulement quand la largeur réelle le permet, 2 tablette, 1 mobile.
- recherche sur toute la largeur de la section.
- cartes chapitre compactes, titres jamais comprimés verticalement.

### Chapitres
- header, tabs et pagination alignés sur le même conteneur.
- contenu de lecture centré à 72ch.
- figures/tableaux peuvent déborder jusqu'à la largeur de contenu large.
- objectifs, méthodes, exemples et vigilances suivent une même grammaire.

### Exercices / quiz / flashcards
- même workspace.
- mêmes boutons, progression, feedback et résultats.
- aucun style structurel inline hors valeurs réellement dynamiques.

### Laboratoire
- même conteneur et même barre de recherche.
- panneau de filtres cohérent avec les autres contrôles.
- cartes compactes et grille responsive commune.

## Ordre de reconstruction

1. Socle global V5 et tokens.
2. Navigation + footer + consentement.
3. Landing pages et pages niveaux.
4. Catalogues.
5. Chapitres / cours.
6. Exercices / quiz / flashcards.
7. Laboratoire / outils.
8. Suppression progressive des styles V3/legacy redondants.
9. Tests visuels desktop/tablette/mobile.
