# Rapport - Charte graphique commune des pages d'accueil V3

Date : 2026-07-29

## Objectif

Appliquer la direction graphique de l'accueil public V3 aux autres portes d'entrée du site sans modifier les contenus de chapitre, les routes historiques, la progression ou le fonctionnement des outils.

## Socle commun

- Création de `src/components/home/V3LandingHero.astro`.
- Création de `src/styles/landing-v3.css`.
- Image scientifique réelle issue de l'accueil V3, avec recadrage responsive.
- Identité visible par couleur, symbole et libellé.
- H1 unique, description courte, actions principales et compteurs issus des données existantes.
- Sections et cartes d'accès avec rayon de 8 px, focus visible et adaptation mobile.
- Variantes Mathématiques, Physique-Chimie, Enseignement scientifique, Mémorisation, Kit scientifique et parcours mixtes du lycée.

## Pages concernées

- `/mathematiques`
- `/mathematiques/college`
- `/mathematiques/lycee`
- `/mathematiques/college/[niveau]`
- `/mathematiques/lycee/[niveau]`
- `/college`
- `/college/[niveau]`
- `/lycee`
- `/lycee/[niveau]`, dont les entrées Enseignement scientifique
- `/memorisation`
- `/laboratoire`
- `/outils-methodes`
- `/outils-methodes/college`
- `/outils-methodes/lycee`
- `/outils-methodes/transverses`
- En-tête de `/outils-methodes/kit-scientifique`

## Conservation fonctionnelle

- Les listes de niveaux et de chapitres sont inchangées.
- Les 25 simulations du laboratoire restent accessibles.
- Les trois modes de mémorisation restent reliés à leurs routes existantes.
- Les sept outils, les méthodes guidées et les mini-quiz du kit scientifique sont conservés.
- L'Enseignement scientifique garde son identité et ses routes actuelles.

## Validations

- Construction Astro : 332 pages générées.
- `astro check` : 0 erreur, 23 indications préexistantes hors périmètre.
- Tests ciblés de charte et de catalogues : 16/16 réussis.
- Suite complète : 234/234 tests réussis avec `npm.cmd test`.
- Vérification des contenus : 34 668 contrôles, aucune erreur ni aucun avertissement avec `npm.cmd run verify:content`.
- Contrôle navigateur en 1440 × 900 sur neuf routes d'entrée : un héros commun, une image chargée, un pied de page et aucun débordement horizontal.
- Contrôle navigateur en 390 × 844 sur huit routes d'entrée : aucun débordement horizontal, boutons pleine largeur et textes contenus.
- Cartes du laboratoire contrôlées avec un rayon calculé de 8 px.

## Évaluation AGENTS.md

1. Architecture et maintenabilité : 9,8/10  
   Preuves : un composant et une feuille de style partagés remplacent les en-têtes dispersés.

2. UX, UI et cohérence du design : 9,8/10  
   Preuves : composition commune, variantes disciplinaires et captures desktop/mobile vérifiées.

3. Qualité pédagogique et scientifique : 9,6/10  
   Preuves : libellés adaptés aux parcours, compteurs issus des contenus et ordre des programmes conservé.

4. Accessibilité et DYS : 9,7/10  
   Preuves : H1 unique, textes alternatifs, focus visible, symboles avec libellés et reduced motion.

5. Qualité technique globale : 9,7/10  
   Preuves : aucune dépendance ajoutée, image WebP existante réutilisée, build et contrôle Astro réussis.

6. Complétude, migration et validation : 9,8/10  
   Preuves : routes et fonctions conservées, test dédié `tests/landing-charter-v3.test.mjs`, vérifications multi-écrans.
