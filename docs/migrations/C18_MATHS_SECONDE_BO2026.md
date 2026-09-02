# C18 — Mathématiques seconde : certification BO 2026

## CONTEXTE / COMMIT DE DÉPART

- Dépôt : `lbelhomme-pc/physique-chimie`
- Branche : `audit-2026-c01-route-snapshot`
- Base C18 : `d7f5cf87dc46ee83c6f6d2f0da49871fd81d4a02` (`C17: document modular CSS validation`)
- Mission du plan : audit/mise à jour finale des 11 chapitres de seconde pour le BO 2026, avec mapping BO complet.

## OBJECTIF UNIQUE

Certifier le corpus Mathématiques de seconde pour la rentrée 2026-2027 en comparant les 11 chapitres actifs au nouveau programme officiel, en complétant les contenus manquants et en ajoutant un contrat automatisé de couverture, sans modifier les routes publiques ni le stockage de progression.

## PROGRAMME OFFICIEL DE RÉFÉRENCE

- Programme d'enseignement de mathématiques de la classe de seconde générale et technologique.
- Bulletin officiel n° 14 du 2 avril 2026.
- NOR : `MENE2602914A`.
- Arrêté du 26 février 2026, publié au JO du 27 mars 2026.
- Application : rentrée scolaire 2026-2027.
- URL : `https://www.education.gouv.fr/bo/2026/Hebdo14/MENE2602914A`.

Le programme est structuré en quatre parties thématiques :

1. Nombres et calculs, algèbre ;
2. Géométrie ;
3. Fonctions ;
4. Statistiques et probabilités.

Il comporte également trois parties transversales à travailler tout au long de l'année : vocabulaire ensembliste et logique, algorithmique et programmation, automatismes.

## PÉRIMÈTRE DE FICHIERS

C18 conserve les 11 dossiers existants sous :

`src/data/mathematiques/chapters/lycee/2nde/`

Slugs certifiés :

1. `arithmetique-ensembles-logique` ;
2. `nombres-reels-intervalles` ;
3. `calcul-litteral-puissances-racines` ;
4. `equations-inequations` ;
5. `fonctions-generalites` ;
6. `fonctions-reference-variations` ;
7. `geometrie-reperee-vecteurs` ;
8. `droites-plan` ;
9. `statistiques-information-chiffree` ;
10. `probabilites-conditionnelles` ;
11. `algorithmique-python`.

C18 ajoute aussi :

- `src/data/mathematiques/programmes/seconde-gt-2026.mapping.json` ;
- `tests/math-seconde-bo2026-c18.test.mjs` ;
- ce rapport de migration.

## ÉTAT À PRÉSERVER

C18 préserve :

- les 11 slugs existants ;
- les routes canoniques `/mathematiques/lycee/2nde/{slug}` ;
- les identifiants utilisés par la progression ;
- les fichiers `meta.json`, `exercices.json`, `quiz.json` et `flashcards.json` existants ;
- la source officielle `bo-2026-mathematiques-seconde-gt` ;
- le fonctionnement Astro/MDX et les composants pédagogiques communs ;
- les figures existantes, dont la migration vers une chaîne LaTeX/TikZ appartient aux missions C30-C31.

## INTERDICTIONS RESPECTÉES

C18 ne :

- renomme aucun chapitre ;
- déplace aucun chapitre ;
- modifie aucune route canonique ;
- modifie aucune clé de progression ou migration `localStorage` ;
- ne commence pas le corpus Mathématiques 5e de C19-C20 ;
- ne crée pas le moteur de figures LaTeX de C30 ;
- ne remplace pas encore les figures existantes par TikZ/PGFPlots de C31 ;
- ne prétend pas réaliser l'audit transversal détaillé des distracteurs, corrections et niveaux de C35.

## AUDIT ÉDITORIAL C18

### Arithmétique, ensembles et logique

Le cours couvrait déjà multiples, diviseurs, fractions irréductibles, opérations sur les ensembles et contre-exemple. C18 ajoute explicitement :

- complémentaire ;
- cardinal d'un ensemble fini ;
- produit cartésien ;
- connecteurs « et », « ou », négation ;
- implication, réciproque, contraposée et équivalence ;
- quantification formulée en langage naturel ;
- disjonction de cas ;
- raisonnement par l'absurde.

Les symboles `∀` et `∃` ne sont pas présentés comme exigibles en seconde.

### Nombres réels, intervalles et valeur absolue

C18 explicite :

- la hiérarchie décimaux/rationnels/réels ;
- la distinction entre réel mathématique et approximation machine ;
- la valeur absolue comme distance ;
- les encadrements à précision imposée ;
- les chiffres significatifs adaptés à une situation ;
- les démonstrations classiques concernant `1/3` et `√2`.

### Calcul littéral, puissances et racines carrées

C18 complète :

- `√(a²)=|a|` ;
- conditions de définition des expressions fractionnaires ;
- comparaison par différence ;
- comparaison par quotient pour des quantités strictement positives ;
- propriétés des inégalités ;
- isolement d'une variable dans une relation simple.

### Équations, inéquations et modélisation

Écart principal corrigé par C18 : le cours ne couvrait pas explicitement tout le bloc algébrique 2026. Sont ajoutés :

- équations produit nul ;
- équations quotient ;
- valeurs interdites ;
- signe d'un produit ;
- signe d'un quotient ;
- tableaux de signes ;
- distinction complète des cas pour `x²=a`.

### Fonctions : langage, courbes et modélisation

Le chapitre était déjà aligné sur les attendus structurants : fonction, image, antécédent, ensemble de définition, courbe `y=f(x)`, test d'appartenance et modélisation. Aucun changement éditorial lourd n'a été nécessaire dans C18.

### Fonctions de référence, signes et variations

C18 explicite ou renforce :

- taux d'accroissement et fonction affine ;
- domaines et variations des fonctions valeur absolue, carré, inverse, racine carrée et cube ;
- tableaux de signes de produits/quotients ;
- résolution graphique, algébrique ou numérique ;
- extrémums et optimisation ;
- démonstrations attendues sur les variations de fonctions de référence.

### Géométrie repérée et vecteurs

C18 ajoute explicitement :

- multiplication d'un vecteur par un réel ;
- décomposition dans une base de deux vecteurs non colinéaires ;
- coordonnées de sommes et multiples ;
- norme en base orthonormée ;
- interprétations déplacement/position ;
- équivalence entre colinéarité, déterminant nul et proportionnalité des coordonnées.

### Droites du plan

Le chapitre couvrait déjà les éléments structurants : vecteur directeur, équation cartésienne, équation réduite, pente, parallélisme et intersection de droites. Aucun changement éditorial lourd n'a été nécessaire dans C18.

### Statistiques et information chiffrée

Écart important corrigé par C18. Sont ajoutés ou explicités :

- linéarité de la moyenne ;
- effet de l'ajout ou de la suppression d'une valeur ;
- comparaison par moyenne/écart type ou médiane/écart interquartile ;
- séries regroupées en classes ;
- histogramme pour classes de même amplitude ;
- polygone des fréquences cumulées ;
- moyenne à partir des classes ;
- classe médiane et estimation sous hypothèse uniforme ;
- distinction fréquence marginale / fréquence conditionnelle.

### Probabilités conditionnelles et arbres pondérés

Le corpus couvrait déjà la nouveauté majeure du BO 2026. C18 renforce :

- distinction situation réelle / modèle probabiliste ;
- équiprobabilité comme hypothèse de modèle ;
- loi des grands nombres sous forme vulgarisée et simulation ;
- lien entre fréquence conditionnelle et probabilité conditionnelle ;
- arbres pondérés et probabilité d'un chemin ;
- inversion de conditionnement ;
- faux positifs, faux négatifs, sensibilité et spécificité.

C18 verrouille aussi une borne de programme : la formule des probabilités totales relative à une partition complète de l'univers n'est pas présentée comme un attendu de seconde.

### Algorithmique et programmation Python

C18 explicite :

- types entier, flottant, booléen et chaîne de caractères ;
- affectation et séquence d'instructions ;
- conditions ;
- boucles `for` et `while` ;
- fonctions à un ou plusieurs arguments ;
- lecture de fonctions de moyenne/écart type ;
- simulation aléatoire ;
- traduction langage naturel/Python ;
- contrôle de cohérence et tests de programme.

## MAPPING BO DURABLE

`seconde-gt-2026.mapping.json` constitue le contrat C18 entre le programme officiel et les chapitres actifs. Il documente :

- les quatre parties thématiques ;
- leurs sous-parties ;
- les chapitres qui les couvrent ;
- les trois fils transversaux ;
- leur réinvestissement dans les 11 chapitres ;
- des chaînes de preuve minimales (`chapterEvidence`) qui doivent rester présentes dans les cours.

L'objectif n'est pas de transformer le programme en simple recherche de mots-clés, mais d'empêcher qu'un remaniement futur supprime silencieusement un attendu déjà certifié.

## TESTS C18

`tests/math-seconde-bo2026-c18.test.mjs` verrouille :

1. l'identité de la source officielle BO 2026 ;
2. les 11 slugs exacts de seconde ;
3. l'existence du paquet `meta/cours/exercices/quiz/flashcards` pour chaque chapitre ;
4. les sources BO et routes canoniques de chaque `meta.json` ;
5. les 4 parties thématiques et 3 parties transversales ;
6. l'intégration des fils transversaux dans les 11 chapitres ;
7. la présence des preuves textuelles minimales du mapping ;
8. la synthèse de chaque cours ;
9. deux bornes sensibles : valeur absolue comme distance et probabilités totales hors attendu de seconde.

La suite autoritative à exécuter sur le HEAD C18 reste celle de la CI du dépôt : `quality`, `dist-fast`, `dist-a11y`.

## MIGRATION / RETOUR ARRIÈRE

C18 est une migration éditoriale additive et un contrat de certification. Aucun changement de schéma de progression ou de route n'est nécessaire.

Retour arrière global : revenir au commit C17 `d7f5cf87dc46ee83c6f6d2f0da49871fd81d4a02`.

Un retour arrière partiel du mapping sans retirer le test associé n'est pas cohérent : le contrat C18 et son test doivent évoluer ensemble.

## CRITÈRES GO / NO-GO

### GO

- les 11 chapitres de seconde sont conservés ;
- la source officielle est le BO n°14 du 2 avril 2026, NOR `MENE2602914A` ;
- les quatre parties thématiques et trois fils transversaux sont mappés ;
- les écarts éditoriaux identifiés sont corrigés ;
- aucune notion explicitement hors attendu n'est présentée comme obligatoire ;
- les routes, slugs et identifiants de progression sont inchangés ;
- le paquet pédagogique historique reste valide ;
- le test C18 passe ;
- la CI autoritative finale est verte.

### NO-GO

- disparition d'un chapitre ou changement de slug/route ;
- source de programme incorrecte ou non versionnée ;
- sous-partie du BO non mappée ;
- contenu obligatoire manquant après audit ;
- contenu de niveau supérieur présenté comme exigible en seconde ;
- paquet de ressources invalide ;
- régression des tests, du build, du dist ou de l'accessibilité.

## SUITES HORS C18

- C19-C20 : Mathématiques 5e ;
- C30 : moteur de figures LaTeX ;
- C31 : migration des figures statiques Mathématiques vers TikZ/PGFPlots ;
- C35 : audit transversal fin des exercices, corrections, quiz et flashcards ;
- C36 : certification finale du site.
