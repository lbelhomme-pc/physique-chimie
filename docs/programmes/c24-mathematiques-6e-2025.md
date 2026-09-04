# C24 — Mathématiques 6e

**Date :** 4 septembre 2026  
**Base :** C23 `1d97836882fccc09a305c42df47d5d4ddc453380`  
**Branche cible :** `c24-mathematiques-6e-2025`  
**Déploiement Vercel :** non exécuté.

## Référence officielle

- Bulletin officiel n° 16 du 17 avril 2025
- NOR : MENE2504620A
- Programme de mathématiques du cycle 3
- Application en classe de 6e : rentrée 2025-2026
- Version curriculaire : `mathematiques-cycle3-2025`

## Couverture

Treize chapitres éditoriaux couvrent les rubriques de 6e :
1. Nombres entiers et décimaux
2. Fractions, quotients et pourcentages
3. Algèbre et programmes de calcul
4. Longueurs et périmètres
5. Aires et volumes
6. Temps et durées
7. Configurations planes
8. Angles, triangles et symétrie axiale
9. Vision dans l’espace et solides
10. Données, tableaux et graphiques
11. Probabilités
12. Proportionnalité et échelles
13. Initiation à la pensée informatique

## Ressources

Chaque chapitre contient :
- 1 cours MDX ;
- 6 exercices : 2 N1, 2 N2 et 2 N3 ;
- 5 questions de quiz avec explication ;
- 6 flashcards.

**Total C24 :**
- 13 chapitres ;
- 78 exercices ;
- 65 questions de quiz ;
- 78 flashcards.

## Publication

Routes ajoutées :
- `/mathematiques/college/6eme`
- `/mathematiques/college/6eme/nombres-entiers-decimaux`
- `/mathematiques/college/6eme/fractions-quotients-pourcentages`
- `/mathematiques/college/6eme/algebre-programmes-calcul`
- `/mathematiques/college/6eme/longueurs-perimetres`
- `/mathematiques/college/6eme/aires-volumes`
- `/mathematiques/college/6eme/temps-durees`
- `/mathematiques/college/6eme/configurations-planes`
- `/mathematiques/college/6eme/angles-triangles-symetrie`
- `/mathematiques/college/6eme/vision-espace-solides`
- `/mathematiques/college/6eme/donnees-tableaux-graphiques`
- `/mathematiques/college/6eme/probabilites`
- `/mathematiques/college/6eme/proportionnalite-echelles`
- `/mathematiques/college/6eme/pensee-informatique`

La 6e passe au statut `available` dans le catalogue mathématiques.

## Garde-fous

- programme 2025 explicitement applicable en 2026-2027 ;
- aucune route historique supprimée ;
- aucun changement de localStorage ou d’identifiant existant ;
- le produit en croix n’est pas enseigné dans le chapitre de proportionnalité ;
- aucune figure statique complexe ajoutée avant C31 ;
- aucun déploiement Vercel.

## Validation automatisée

Tests spécifiques : `tests/c24-mathematiques-6e.test.mjs`.

Contrats globaux actualisés :
- audit de contenu : 155 chapitres au total, dont 54 en mathématiques ;
- recherche multi-discipline ;
- niveaux mathématiques publiés ;
- snapshot des routes ;
- registre curriculaire.

La branche est considérée GO uniquement lorsque `quality`, `dist-fast` et `dist-a11y` sont tous verts.
