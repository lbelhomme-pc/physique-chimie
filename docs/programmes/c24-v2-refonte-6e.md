# C24 V2 — Refonte complète Mathématiques 6e

**Année scolaire :** 2026-2027  
**Programme :** BO n° 16 du 17 avril 2025 — NOR MENE2504620A  
**Branche :** `refonte-maths-v2-corpus-complet`  
**Standard :** Référentiel éditorial Mathématiques V2

## Règles C24 V2

Chaque chapitre doit contenir :

- référentiel officiel détaillé ;
- cours complet ;
- toutes les écritures mathématiques en LaTeX/KaTeX ;
- au moins 2 schémas, graphiques ou représentations pédagogiques accessibles ;
- 12 exercices corrigés, répartis en 4 N1, 4 N2 et 4 N3 ;
- 10 questions de quiz avec explication ;
- 12 flashcards ;
- aucun statut V2 avant validation des garde-fous.

## Progression

| Ordre | Chapitre | Statut |
|---:|---|---|
| 1 | Nombres entiers et décimaux | V2 contenu validé |
| 2 | Fractions, quotients et pourcentages | À refaire |
| 3 | Algèbre et programmes de calcul | À refaire |
| 4 | Longueurs et périmètres | À refaire |
| 5 | Aires et volumes | À refaire |
| 6 | Temps et durées | À refaire |
| 7 | Configurations planes : distances, cercles et médiatrices | À refaire |
| 8 | Angles, triangles et symétrie axiale | À refaire |
| 9 | Vision dans l’espace et solides | À refaire |
| 10 | Données, tableaux et graphiques | À refaire |
| 11 | Probabilités | À refaire |
| 12 | Proportionnalité et échelles | À refaire |
| 13 | Initiation à la pensée informatique | À refaire |

## Chapitre 1 — Nombres entiers et décimaux

Référentiel :

- 24 connaissances/capacités du programme rattachées au chapitre ;
- source officielle : programme de mathématiques du cycle 3 de 2025.

Cours :

- 13 646 caractères significatifs avant normalisation finale des délimiteurs ;
- 98 blocs de mathématiques affichées ;
- 65 expressions mathématiques en ligne après normalisation MDX ;
- 2 visuels pédagogiques distincts ;
- 4 exemples développés ;
- méthodes, automatismes, erreurs fréquentes et synthèse.

Entraînement :

- 12 exercices ;
- N1 : 4 ;
- N2 : 4 ;
- N3 : 4 ;
- corrections détaillées pour chaque exercice ;
- 10 questions de quiz avec explication ;
- 12 flashcards ;
- contrôle simulé : aucune écriture mathématique brute détectée dans les ressources JSON.

## Validation technique

L'ancien preview Vercel de la branche a révélé une incompatibilité MDX dans le chapitre étalon Bayes due à l'utilisation de délimiteurs `\\(...\\)`. Ces délimiteurs ont été remplacés par `$...$`.

Le chapitre C24 V2 n°1 a lui aussi été normalisé en `$...$` / `$$...$$` afin de conserver un rendu KaTeX compatible avec le parseur MDX.

La certification globale de C24 reste **NON** tant que les 13 chapitres ne sont pas V2.


## Garde-fou exercices V2

À partir du chapitre 1, la certification d'un exercice vérifie aussi :

- affichage séparé de l'énoncé complet et de la consigne ;
- questions numérotées ;
- N2 : au moins 2 étapes/questions ;
- N3 : au moins 3 étapes/questions avec justification, interprétation, décision ou contrôle ;
- rattachement explicite aux attendus du chapitre ;
- au moins 4 types pédagogiques distincts dans le chapitre ;
- large couverture des six compétences mathématiques ;
- au moins 2 exercices avec support visuel lorsque le contenu s'y prête ;
- couverture d'au moins 80 % des attendus du chapitre ;
- correction structurée question par question ;
- toutes les écritures mathématiques en LaTeX/KaTeX.

### Chapitre 1 après renforcement

- 12 exercices : 4 N1, 4 N2, 4 N3 ;
- 5 types pédagogiques distincts ;
- 6 compétences mathématiques mobilisées ;
- 2 exercices avec support visuel ;
- 24/24 attendus du chapitre couverts ;
- aucun écrit mathématique brut détecté hors LaTeX dans les ressources d'exercices.
