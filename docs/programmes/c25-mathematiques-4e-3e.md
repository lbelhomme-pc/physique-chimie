# C25 — Mathématiques 4e / 3e versionnées

**Date :** 4 septembre 2026  
**Base prévue :** C24  
**Déploiement Vercel :** non exécuté.

## Règle réglementaire

Le nouveau programme de mathématiques du cycle 4 publié au BO n° 10 du 5 mars 2026 s'applique progressivement :

- 5e : 2026-2027 ;
- 4e : 2027-2028 ;
- 3e : 2028-2029.

En 2026-2027, les contenus publics de 4e et de 3e restent donc rattachés au programme publié au BO n° 31 du 30 juillet 2020 et aux repères/attendus Éduscol encore applicables.

## Architecture

Quatre mappings :
- `cycle4-4e-2020.mapping.json` : courant ;
- `cycle4-3e-2020.mapping.json` : courant ;
- `cycle4-4e-2026.future.mapping.json` : futur, aucune route ;
- `cycle4-3e-2026.future.mapping.json` : futur, aucune route.

Le registre C09 reste l'unique source de vérité pour les fenêtres d'application.

## Premier lot 4e

1. Nombres rationnels et calcul
2. Puissances et notation scientifique
3. Calcul littéral et équations
4. Pythagore et racine carrée

## Premier lot 3e

1. Arithmétique, fractions et puissances
2. Calcul littéral, équations et inéquations
3. Fonctions linéaires et affines
4. Thalès et trigonométrie

## Ressources

Par chapitre :
- 1 cours MDX ;
- 6 exercices, avec 2 N1, 2 N2, 2 N3 ;
- 5 questions de quiz ;
- 6 flashcards.

Total C25 :
- 8 chapitres ;
- 48 exercices ;
- 40 questions de quiz ;
- 48 flashcards ;
- 10 routes HTML nouvelles (2 niveaux + 8 chapitres).

## Garde-fous

- aucun contenu futur 2026 n'est servi en 4e ou 3e en 2026-2027 ;
- aucune route future parallèle ;
- aucune modification du stockage de progression ;
- aucun changement de canonique existant ;
- aucun déploiement Vercel ;
- les figures statiques complexes restent différées au lot LaTeX/TikZ prévu ultérieurement.

## Validation

Test dédié : `tests/c25-mathematiques-4e-3e.test.mjs`.

Le GO final exige :
- `quality` vert ;
- `dist-fast` vert ;
- `dist-a11y` vert ;
- aucune route 2026 future exposée pour 4e/3e.
