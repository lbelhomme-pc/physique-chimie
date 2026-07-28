# Section Mathématiques de seconde

## Rapport d'analyse initiale

- Le site utilise Astro avec des routes statiques dynamiques.
- La physique-chimie range ses chapitres dans `src/data/chapters/{cycle}/{niveau}/{matiere}/{chapitre}/` avec `meta.json`, `cours.mdx`, `exercices.json`, `quiz.json` et `flashcards.json`.
- La section mathématiques dispose déjà de routes dédiées : `src/pages/mathematiques/lycee/[niveau]/index.astro` et `src/pages/mathematiques/lycee/[niveau]/[chapitre].astro`.
- La section mathématiques attend les données dans `src/data/mathematiques/chapters/{cycle}/{niveau}/{chapitre}/`.
- Les lecteurs existants `ExercicesPlayer`, `QuizPlayer` et `FlashcardsPlayer` sont réutilisés pour conserver la cohérence du site.
- Les figures essentielles sont en SVG inline dans les cours MDX, afin d'éviter les images externes instables.
- Les quiz restent au format QCM compatible avec le moteur existant.

## Source officielle

- Titre : Programme d'enseignement de mathématiques de la classe de seconde générale et technologique
- Institution : Ministère de l'Éducation nationale - DGESCO
- Publication : Bulletin officiel n° 14 du 2 avril 2026
- Application : Rentrée scolaire 2026-2027
- URL : https://www.education.gouv.fr/bo/2026/Hebdo14/MENE2602914A
- Annexe PDF : https://www.education.gouv.fr/sites/default/files/document/Annexe%20%E2%80%93%20Programme%20d%26%23039%3Benseignement%20de%20math%C3%A9matiques%20de%20la%20classe%20de%20seconde%20g%C3%A9n%C3%A9rale%20et%20technologique-515402.pdf
- Date de consultation : 2026-07-17

## Progression

1. Arithmétique, ensembles et logique - Nombres et raisonnement
2. Nombres réels, intervalles et valeur absolue - Nombres et calculs
3. Calcul littéral, puissances et racines carrées - Nombres et calculs
4. Équations, inéquations et modélisation - Algèbre
5. Fonctions : langage, courbes et modélisation - Fonctions
6. Fonctions de référence, signes et variations - Fonctions
7. Géométrie repérée et vecteurs - Géométrie
8. Droites du plan - Géométrie
9. Statistiques et information chiffrée - Statistiques et probabilités
10. Probabilités conditionnelles et arbres pondérés - Statistiques et probabilités
11. Algorithmique et programmation Python - Algorithmique

## Arborescence créée

- src/data/mathematiques/chapters/lycee/2nde/arithmetique-ensembles-logique/
  - meta.json
  - cours.mdx
  - exercices.json
  - quiz.json
  - flashcards.json
- src/data/mathematiques/chapters/lycee/2nde/nombres-reels-intervalles/
  - meta.json
  - cours.mdx
  - exercices.json
  - quiz.json
  - flashcards.json
- src/data/mathematiques/chapters/lycee/2nde/calcul-litteral-puissances-racines/
  - meta.json
  - cours.mdx
  - exercices.json
  - quiz.json
  - flashcards.json
- src/data/mathematiques/chapters/lycee/2nde/equations-inequations/
  - meta.json
  - cours.mdx
  - exercices.json
  - quiz.json
  - flashcards.json
- src/data/mathematiques/chapters/lycee/2nde/fonctions-generalites/
  - meta.json
  - cours.mdx
  - exercices.json
  - quiz.json
  - flashcards.json
- src/data/mathematiques/chapters/lycee/2nde/fonctions-reference-variations/
  - meta.json
  - cours.mdx
  - exercices.json
  - quiz.json
  - flashcards.json
- src/data/mathematiques/chapters/lycee/2nde/geometrie-reperee-vecteurs/
  - meta.json
  - cours.mdx
  - exercices.json
  - quiz.json
  - flashcards.json
- src/data/mathematiques/chapters/lycee/2nde/droites-plan/
  - meta.json
  - cours.mdx
  - exercices.json
  - quiz.json
  - flashcards.json
- src/data/mathematiques/chapters/lycee/2nde/statistiques-information-chiffree/
  - meta.json
  - cours.mdx
  - exercices.json
  - quiz.json
  - flashcards.json
- src/data/mathematiques/chapters/lycee/2nde/probabilites-conditionnelles/
  - meta.json
  - cours.mdx
  - exercices.json
  - quiz.json
  - flashcards.json
- src/data/mathematiques/chapters/lycee/2nde/algorithmique-python/
  - meta.json
  - cours.mdx
  - exercices.json
  - quiz.json
  - flashcards.json

## Tableau des modifications

| Chemin | Type | Fonction | Justification |
|---|---|---|---|
| src/data/mathematiques/levels.ts | modification | Libellé et description de seconde | Rendre la page niveau cohérente et corriger l'appel à deux paramètres |
| src/data/mathematiques/programmes/seconde-gt-2026.json | création | Référence officielle et progression | Tracer la source BO 2026 |
| src/data/mathematiques/chapters/lycee/2nde/* | création | Contenus de chapitres | Cours, exercices, quiz, flashcards et figures |
| docs/mathematiques-seconde-rapport.md | création | Rapport et matrice de couverture | Livrable demandé par le brief |
| scripts/generate-math-seconde.mjs | création | Génération reproductible | Garder des contenus homogènes et des identifiants stables |
| scripts/validate-math-seconde.mjs | création | Validation locale | Vérifier complétude, identifiants et données jouables |

## Matrice de couverture

| Notion officielle | Chapitre correspondant | Cours | Exercices | Correction | Quiz | Flashcards | Figure ou graphique | Statut |
|---|---|---:|---:|---|---:|---:|---|---|
| notations ℕ et ℤ | Arithmétique, ensembles et logique | oui | 5 | oui | 4 | 4 | SVG inline | couvert |
| multiples et diviseurs | Arithmétique, ensembles et logique | oui | 5 | oui | 4 | 4 | SVG inline | couvert |
| fractions irréductibles | Arithmétique, ensembles et logique | oui | 5 | oui | 4 | 4 | SVG inline | couvert |
| ensembles et symboles | Arithmétique, ensembles et logique | oui | 5 | oui | 4 | 4 | SVG inline | couvert |
| implication et réciproque | Arithmétique, ensembles et logique | oui | 5 | oui | 4 | 4 | SVG inline | couvert |
| contre-exemple | Arithmétique, ensembles et logique | oui | 5 | oui | 4 | 4 | SVG inline | couvert |
| raisonnement par cas | Arithmétique, ensembles et logique | oui | 5 | oui | 4 | 4 | SVG inline | couvert |
| ensemble ℝ | Nombres réels, intervalles et valeur absolue | oui | 5 | oui | 4 | 4 | SVG inline | couvert |
| intervalles | Nombres réels, intervalles et valeur absolue | oui | 5 | oui | 4 | 4 | SVG inline | couvert |
| valeur absolue comme distance | Nombres réels, intervalles et valeur absolue | oui | 5 | oui | 4 | 4 | SVG inline | couvert |
| encadrements décimaux | Nombres réels, intervalles et valeur absolue | oui | 5 | oui | 4 | 4 | SVG inline | couvert |
| nombres rationnels et irrationnels | Nombres réels, intervalles et valeur absolue | oui | 5 | oui | 4 | 4 | SVG inline | couvert |
| puissances entières | Calcul littéral, puissances et racines carrées | oui | 5 | oui | 4 | 4 | SVG inline | couvert |
| racines carrées | Calcul littéral, puissances et racines carrées | oui | 5 | oui | 4 | 4 | SVG inline | couvert |
| identités remarquables | Calcul littéral, puissances et racines carrées | oui | 5 | oui | 4 | 4 | SVG inline | couvert |
| factorisation | Calcul littéral, puissances et racines carrées | oui | 5 | oui | 4 | 4 | SVG inline | couvert |
| expressions fractionnaires simples | Calcul littéral, puissances et racines carrées | oui | 5 | oui | 4 | 4 | SVG inline | couvert |
| choix de forme | Calcul littéral, puissances et racines carrées | oui | 5 | oui | 4 | 4 | SVG inline | couvert |
| équations du premier degré | Équations, inéquations et modélisation | oui | 5 | oui | 4 | 4 | SVG inline | couvert |
| inéquations du premier degré | Équations, inéquations et modélisation | oui | 5 | oui | 4 | 4 | SVG inline | couvert |
| équation x² = a | Équations, inéquations et modélisation | oui | 5 | oui | 4 | 4 | SVG inline | couvert |
| isoler une variable | Équations, inéquations et modélisation | oui | 5 | oui | 4 | 4 | SVG inline | couvert |
| modélisation par inéquation | Équations, inéquations et modélisation | oui | 5 | oui | 4 | 4 | SVG inline | couvert |
| notion de fonction | Fonctions : langage, courbes et modélisation | oui | 5 | oui | 4 | 4 | SVG inline | couvert |
| image et antécédent | Fonctions : langage, courbes et modélisation | oui | 5 | oui | 4 | 4 | SVG inline | couvert |
| courbe y=f(x) | Fonctions : langage, courbes et modélisation | oui | 5 | oui | 4 | 4 | SVG inline | couvert |
| ensemble de définition | Fonctions : langage, courbes et modélisation | oui | 5 | oui | 4 | 4 | SVG inline | couvert |
| modélisation | Fonctions : langage, courbes et modélisation | oui | 5 | oui | 4 | 4 | SVG inline | couvert |
| fonctions affines | Fonctions de référence, signes et variations | oui | 5 | oui | 4 | 4 | SVG inline | couvert |
| fonctions valeur absolue, carré, inverse, racine carrée, cube | Fonctions de référence, signes et variations | oui | 5 | oui | 4 | 4 | SVG inline | couvert |
| signes | Fonctions de référence, signes et variations | oui | 5 | oui | 4 | 4 | SVG inline | couvert |
| tableaux de signes | Fonctions de référence, signes et variations | oui | 5 | oui | 4 | 4 | SVG inline | couvert |
| variations | Fonctions de référence, signes et variations | oui | 5 | oui | 4 | 4 | SVG inline | couvert |
| extrémums | Fonctions de référence, signes et variations | oui | 5 | oui | 4 | 4 | SVG inline | couvert |
| optimisation | Fonctions de référence, signes et variations | oui | 5 | oui | 4 | 4 | SVG inline | couvert |
| coordonnées de vecteurs | Géométrie repérée et vecteurs | oui | 5 | oui | 4 | 4 | SVG inline | couvert |
| norme | Géométrie repérée et vecteurs | oui | 5 | oui | 4 | 4 | SVG inline | couvert |
| distance | Géométrie repérée et vecteurs | oui | 5 | oui | 4 | 4 | SVG inline | couvert |
| milieu | Géométrie repérée et vecteurs | oui | 5 | oui | 4 | 4 | SVG inline | couvert |
| déterminant | Géométrie repérée et vecteurs | oui | 5 | oui | 4 | 4 | SVG inline | couvert |
| colinéarité | Géométrie repérée et vecteurs | oui | 5 | oui | 4 | 4 | SVG inline | couvert |
| alignement | Géométrie repérée et vecteurs | oui | 5 | oui | 4 | 4 | SVG inline | couvert |
| parallélisme | Géométrie repérée et vecteurs | oui | 5 | oui | 4 | 4 | SVG inline | couvert |
| vecteur directeur | Droites du plan | oui | 5 | oui | 4 | 4 | SVG inline | couvert |
| équation cartésienne | Droites du plan | oui | 5 | oui | 4 | 4 | SVG inline | couvert |
| équation réduite | Droites du plan | oui | 5 | oui | 4 | 4 | SVG inline | couvert |
| pente | Droites du plan | oui | 5 | oui | 4 | 4 | SVG inline | couvert |
| parallélisme | Droites du plan | oui | 5 | oui | 4 | 4 | SVG inline | couvert |
| sécantes | Droites du plan | oui | 5 | oui | 4 | 4 | SVG inline | couvert |
| intersection | Droites du plan | oui | 5 | oui | 4 | 4 | SVG inline | couvert |
| proportions | Statistiques et information chiffrée | oui | 5 | oui | 4 | 4 | SVG inline | couvert |
| pourcentage de pourcentage | Statistiques et information chiffrée | oui | 5 | oui | 4 | 4 | SVG inline | couvert |
| évolutions successives | Statistiques et information chiffrée | oui | 5 | oui | 4 | 4 | SVG inline | couvert |
| évolution réciproque | Statistiques et information chiffrée | oui | 5 | oui | 4 | 4 | SVG inline | couvert |
| moyenne | Statistiques et information chiffrée | oui | 5 | oui | 4 | 4 | SVG inline | couvert |
| médiane | Statistiques et information chiffrée | oui | 5 | oui | 4 | 4 | SVG inline | couvert |
| quartiles | Statistiques et information chiffrée | oui | 5 | oui | 4 | 4 | SVG inline | couvert |
| écart type | Statistiques et information chiffrée | oui | 5 | oui | 4 | 4 | SVG inline | couvert |
| histogramme | Statistiques et information chiffrée | oui | 5 | oui | 4 | 4 | SVG inline | couvert |
| fréquences conditionnelles | Statistiques et information chiffrée | oui | 5 | oui | 4 | 4 | SVG inline | couvert |
| tableaux croisés | Statistiques et information chiffrée | oui | 5 | oui | 4 | 4 | SVG inline | couvert |
| loi des grands nombres | Probabilités conditionnelles et arbres pondérés | oui | 5 | oui | 4 | 4 | SVG inline | couvert |
| probabilité conditionnelle | Probabilités conditionnelles et arbres pondérés | oui | 5 | oui | 4 | 4 | SVG inline | couvert |
| arbres pondérés | Probabilités conditionnelles et arbres pondérés | oui | 5 | oui | 4 | 4 | SVG inline | couvert |
| tableaux et probabilités | Probabilités conditionnelles et arbres pondérés | oui | 5 | oui | 4 | 4 | SVG inline | couvert |
| inversion de conditionnement | Probabilités conditionnelles et arbres pondérés | oui | 5 | oui | 4 | 4 | SVG inline | couvert |
| faux positifs | Probabilités conditionnelles et arbres pondérés | oui | 5 | oui | 4 | 4 | SVG inline | couvert |
| types de variables | Algorithmique et programmation Python | oui | 5 | oui | 4 | 4 | SVG inline | couvert |
| affectation | Algorithmique et programmation Python | oui | 5 | oui | 4 | 4 | SVG inline | couvert |
| conditions | Algorithmique et programmation Python | oui | 5 | oui | 4 | 4 | SVG inline | couvert |
| boucles for et while | Algorithmique et programmation Python | oui | 5 | oui | 4 | 4 | SVG inline | couvert |
| fonctions Python | Algorithmique et programmation Python | oui | 5 | oui | 4 | 4 | SVG inline | couvert |
| simulation | Algorithmique et programmation Python | oui | 5 | oui | 4 | 4 | SVG inline | couvert |
| vérification de programme | Algorithmique et programmation Python | oui | 5 | oui | 4 | 4 | SVG inline | couvert |

## Limites assumées

- Les parties transversales logique, automatismes et Python sont explicitées dans des chapitres dédiés et réinvesties dans les autres chapitres.
- Les quiz utilisent le format QCM compatible avec le moteur actuel ; les types association, classement ou saisie mathématique nécessiteraient une évolution du composant interactif.
- Les corrections sont intégrées et détaillées dans les données d'exercices, mais elles restent adaptées à un usage web synthétique.
