# C15 — Mémorisation, recherche et tableau de bord multi-sujet

## CONTEXTE / COMMIT DE DÉPART

- Dépôt : `lbelhomme-pc/physique-chimie`
- Branche : `audit-2026-c01-route-snapshot`
- Base C15 : `075ead9fc25466119a5494b9cc9e17dfa573f1fc` (`C14: document exact homepage GO`)
- Objectif du plan : généraliser mémorisation, recherche et tableau de bord par discipline, avec filtres sujets explicites.

## OBJECTIF UNIQUE

Faire fonctionner les surfaces transversales de mémorisation, recherche et progression avec les deux disciplines publiques — Mathématiques et Physique-Chimie — sans modifier les règles de score, de SRS, les identifiants de progression, le stockage local ni les routes canoniques de mémorisation.

## DÉFAUT INITIAL

Avant C15 :

- les banques Mega chargeaient uniquement `src/data/chapters/**`, donc uniquement Physique-Chimie ;
- les quiz et flashcards Mathématiques publiés n'alimentaient pas Mega Quiz / Mega Flashcards ;
- les lecteurs Mega ne portaient aucune information de discipline ;
- une banque mélangée n'aurait pas permis de distinguer correctement Mathématiques, Physique et Chimie ;
- le tableau de bord consommait déjà un corpus multi-sujet mais gardait des raccourcis, fallback et identité codés Physique-Chimie ;
- le profil public était encore intitulé `Mon profil — Physique-Chimie` ;
- la recherche publique savait distinguer les disciplines mais ses résultats Physique-Chimie utilisaient encore les chemins legacy au lieu des routes canoniques C12.

## MODIFICATIONS APPLIQUÉES

### 1. Collecteur Mega commun et discipline-aware

`src/utils/megaMemorizationData.ts` prend désormais en charge :

- `discipline: "physique-chimie" | "mathematiques"` ;
- `cycle: "college" | "lycee"` ;
- les formats PC historiques sous forme de tableaux JSON ;
- les formats Mathématiques `{ questions: [...] }` et `{ cards: [...] }` ;
- le champ Mathématiques `correctAnswer` comme source compatible de `answer` ;
- un prédicat `include` pour limiter l'agrégation aux niveaux réellement publiés ;
- un défaut rétrocompatible `physique-chimie` quand aucune discipline n'est fournie.

### 2. Endpoints Mega multi-sujet

Les endpoints :

- `/memorisation/mega-quiz-data.json` ;
- `/memorisation/mega-flashcards-data.json`

agrègent maintenant :

- `src/data/chapters/**` pour Physique-Chimie ;
- `src/data/mathematiques/chapters/**` pour Mathématiques.

Pour Mathématiques, seuls les niveaux dont `status === "available"` sont intégrés. Les niveaux `planned` ne sont pas exposés prématurément.

### 3. Choix explicite de discipline dans Mega Quiz et Mega Flashcards

Les deux lecteurs proposent :

- Physique-Chimie ;
- Mathématiques ;
- Toutes les disciplines.

Le choix par défaut reste **Physique-Chimie** pour préserver le comportement historique. Le mélange Mathématiques + Physique-Chimie n'est donc jamais implicite : il n'est activé que si l'utilisateur choisit explicitement `Toutes les disciplines`.

Un changement de discipline réinitialise les filtres niveau, matière et chapitre afin d'éviter les combinaisons incohérentes.

Les mécanismes existants de tirage, score, reprise des erreurs et auto-évaluation des flashcards sont conservés.

### 4. Hub mémorisation et révision du jour transversaux

Les pages :

- `/memorisation` ;
- `/memorisation/revision-du-jour` ;
- `/memorisation/mega-quiz` ;
- `/memorisation/mega-flashcards`

ont désormais une identité Mathématiques + Physique-Chimie et expliquent le choix de discipline.

Les routes canoniques existantes ne changent pas.

### 5. Recherche publique

La recherche globale continue de proposer son filtre de discipline existant, mais les résultats Physique-Chimie utilisent désormais directement `getPhysicalScienceExplicitChapterPath(...)` et pointent vers `/physique-chimie/...` au lieu de consommer les aliases legacy C12.

### 6. Tableau de bord et profil

`Dashboard.tsx` propose un filtre d'affichage :

- Toutes ;
- Mathématiques ;
- Physique-Chimie.

Ce filtre agit uniquement sur le corpus visible, les priorités, l'historique affiché et les raccourcis. Il ne modifie aucune donnée persistée.

Les raccourcis et fallback `/college` ont été remplacés par des racines dépendant du contexte (`/`, `/mathematiques`, `/physique-chimie`) et le repère visuel `PC` a été neutralisé.

`/profil` est désormais présenté comme `Mon profil — Mathématiques et Physique-Chimie` avec un contexte transversal.

## ÉTAT À PRÉSERVER / INTERDICTIONS RESPECTÉES

C15 n'a pas :

- changé les clés LocalStorage ;
- migré les historiques de progression ;
- modifié `getGamificationEngine()` ;
- modifié `getSRSEngine()` ;
- changé les règles XP/SRS ;
- changé les identifiants de contenus existants ;
- changé les routes canoniques de mémorisation ;
- déplacé ou réécrit en masse les contenus pédagogiques ;
- mélangé automatiquement les disciplines dans une session Mega.

## TESTS C15

`tests/memorisation-multi-sujet.test.mjs` verrouille :

1. la compatibilité des collecteurs avec les formats PC et Mathématiques ;
2. l'agrégation des deux corpus et l'exclusion des niveaux Maths `planned` ;
3. la présence du corpus Mathématiques publié dans Mega Quiz et Mega Flashcards ;
4. Physique-Chimie comme filtre Mega par défaut ;
5. le mélange uniquement via le choix explicite `Toutes les disciplines` ;
6. les résultats de recherche PC pointant directement vers les routes canoniques C12 ;
7. le filtre de discipline du dashboard ;
8. la conservation des moteurs de progression et SRS ;
9. l'identité transversale du profil et des pages de mémorisation.

Lors de la validation fonctionnelle, la suite a atteint **290 tests PASS, 0 FAIL**, avec `astro check` à 0 erreur et la vérification de contenu à 0 erreur / 0 warning.

## INCIDENT SÉCURITÉ DÉCOUVERT PENDANT LA VALIDATION

La CI a détecté après l'implémentation C15 une vulnérabilité `high` nouvellement signalée dans la dépendance transitive `browserslist <= 4.28.6`.

Le seuil de sécurité n'a pas été contourné. Un workflow temporaire a :

1. exécuté `npm audit fix --package-lock-only` ;
2. vérifié que `package.json` restait strictement inchangé ;
3. réinstallé avec le lockfile réparé ;
4. validé `npm audit --audit-level=high` ;
5. rejoué les tests ;
6. commité uniquement le lockfile corrigé puis supprimé le workflow temporaire.

Commit de réparation : `520e0cef1dabc24c774342a6aab1eb3b7dc4fc33` (`C15: refresh lockfile for browserslist security fix`).

Cette réparation ne change pas le périmètre fonctionnel de C15 ; elle est nécessaire pour satisfaire le garde-fou CI existant.

## RETOUR ARRIÈRE

Retour arrière global C15 : revenir à la base `075ead9fc25466119a5494b9cc9e17dfa573f1fc`.

Ne pas revenir uniquement sur les composants Mega tout en conservant les endpoints agrégés : les données Mathématiques seraient alors mal étiquetées dans l'interface. Ne pas revenir sur le lockfile de sécurité sans réévaluer `npm audit`.

## CRITÈRES GO / NO-GO

### GO

- Mathématiques et Physique-Chimie alimentent les banques Mega pour les niveaux publiés ;
- aucune discipline n'est mélangée sans choix explicite ;
- recherche et dashboard sont discipline-aware ;
- les routes PC de recherche sont canoniques ;
- stockage, XP et SRS sont inchangés ;
- aucun niveau Mathématiques `planned` n'est exposé ;
- `npm audit --audit-level=high` est vert ;
- `quality`, `dist-fast` et `dist-a11y` sont verts sur le HEAD de validation.

### NO-GO

- Mega reste PC-only ;
- une question Mathématiques est étiquetée Physique ;
- les disciplines sont mélangées par défaut ;
- un niveau Maths non publié alimente Mega ;
- le dashboard modifie ou migre les données de progression ;
- un résultat PC de recherche dépend d'une URL legacy ;
- une vulnérabilité high reste acceptée ;
- un des trois checks CI obligatoires échoue.

## VALIDATION FINALE

**État : validation CI finale en cours sur le présent HEAD.**

La logique C15 et la réparation du lockfile ont déjà passé leurs tests ciblés. La décision GO définitive est conditionnée aux trois jobs `quality`, `dist-fast` et `dist-a11y` verts sur ce commit utilisateur.
