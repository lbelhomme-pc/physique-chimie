# Rapport de branchement applicatif des alias contentIds

## 1. Résumé exécutif

Fichiers analysés : 551 fichiers repérés par les recherches obligatoires, avec lecture détaillée des fichiers pivots de progression, SRS, quiz, flashcards, exercices, tableau de bord et méga-outils.

Zones de lecture recensées : 14.

Zones d'écriture recensées : 11.

Zones XP/gamification recensées : 7.

Zones SRS recensées : 5.

Meilleure première intégration recommandée : `src/components/pedagogie/Dashboard.tsx`, en lecture seule, pour afficher une progression compatible avec les alias contentIds sans écrire dans `localStorage`, sans modifier `engine.ts`, sans attribuer d'XP et sans toucher aux lecteurs pédagogiques.

Zones interdites pour l'instant : `src/data/gamification/engine.ts`, `src/data/gamification/srs.ts`, `src/components/pedagogie/QuizPlayer.tsx`, `src/components/pedagogie/FlashcardsPlayer.tsx`, `src/components/pedagogie/ExercicesPlayer.tsx`, `src/components/pedagogie/CoursTracker.tsx`, `src/components/pedagogie/progress.ts`, `src/components/pedagogie/QuizBlock.astro`, `src/components/pedagogie/FlashcardsBlock.astro`, les routes dynamiques de chapitres physique-chimie et toute migration de clés `localStorage`.

La conclusion du comité est de refuser un premier branchement dans `engine.ts` ou `srs.ts`. Ces deux fichiers sont centraux, persistants et déclenchent des effets irréversibles côté utilisateur. Le premier branchement doit rester une lecture compatible d'affichage, réversible par simple retour à `engine.getChapterProgress(chapter.id)`.

## 2. Cartographie lecture/écriture localStorage

| Zone | Fichier | Lecture | Écriture | Clé concernée | Type de données | Risque |
|---|---|---:|---:|---|---|---|
| Moteur de gamification | `src/data/gamification/engine.ts` | Oui | Oui | `gamification_state` | XP, rang, badges, streak, statistiques, progression par `chapterId`, dernier chapitre | CRITIQUE |
| Bonus chapitre complet | `src/data/gamification/engine.ts` | Oui | Oui | `chapter_complete_${chapterId}` | Drapeau de bonus unique de chapitre complet | CRITIQUE |
| Reset gamification | `src/data/gamification/engine.ts` | Non | Suppression | `gamification_state` | Suppression complète de l'état local | CRITIQUE |
| Moteur SRS | `src/data/gamification/srs.ts` | Oui | Oui | `srs_cards` | États de cartes, `chapterId`, `cardId`, intervalles, dates de révision | CRITIQUE |
| Reset SRS | `src/data/gamification/srs.ts` | Non | Suppression | `srs_cards` | Suppression totale ou partielle des cartes SRS | CRITIQUE |
| Récompense quiz quotidienne | `src/components/pedagogie/QuizPlayer.tsx` | Oui | Oui | `quiz_reward_${chapterId}` | Date, score, total du dernier gain XP quiz | ELEVE |
| Récompense exercices unitaires | `src/components/pedagogie/ExercicesPlayer.tsx` | Oui | Oui | `exo_rewarded_${chapterId}` | Liste des exercices déjà récompensés | ELEVE |
| Récompense tous exercices | `src/components/pedagogie/ExercicesPlayer.tsx` | Oui | Oui | `exo_all_rewarded_${chapterId}` | Drapeau de bonus tous exercices | ELEVE |
| Progression legacy v1 | `src/components/pedagogie/progress.ts` | Oui | Oui | `pc-platform-progress-v1` | Progression legacy par clé de chapitre | ELEVE |
| Blocs quiz legacy | `src/components/pedagogie/QuizBlock.astro` | Oui | Oui | `pc-platform-progress-v2` | Score quiz, XP calculé, statuts de chapitre | ELEVE |
| Blocs flashcards legacy | `src/components/pedagogie/FlashcardsBlock.astro` | Oui | Oui | `pc-platform-progress-v2` | Avancement flashcards, XP calculé, statuts de chapitre | ELEVE |
| Tableau de bord | `src/components/pedagogie/Dashboard.tsx` | Indirecte via engine/SRS | Non | `gamification_state`, `srs_cards` via moteurs | Affichage XP, progression, cartes dues | FAIBLE à MODERE |
| Cours suivi | `src/components/pedagogie/CoursTracker.tsx` | Indirecte via engine | Indirecte via engine | `gamification_state`, `chapter_complete_${chapterId}` | Lecture du cours puis récompense XP | ELEVE |
| Méga-quiz et méga-flashcards | `src/components/pedagogie/MegaQuizPlayer.tsx`, `src/components/pedagogie/MegaFlashcardsPlayer.tsx` | Non | Non | Aucune clé observée | État React de session uniquement | FAIBLE |

## 3. Progression et XP

| Fichier | Fonction ou composant | ID utilisé | Effet | Risque d'alias |
|---|---|---|---|---|
| `src/data/gamification/engine.ts` | `getChapterProgress(chapterId)` | `chapterId` exact | Lit `state.progress[chapterId]` et calcule le pourcentage | MODERE en lecture seule, CRITIQUE si utilisé pour fusionner ou écrire |
| `src/data/gamification/engine.ts` | `completeCours(chapterId)` | `chapterId` exact | Marque le cours lu, ajoute XP, stats, streak, badges, sauvegarde | CRITIQUE, double XP possible |
| `src/data/gamification/engine.ts` | `completeQuiz(chapterId, score, total)` | `chapterId` exact | Marque quiz, meilleur score, stats, XP, badges, sauvegarde | CRITIQUE, score et XP duplicables |
| `src/data/gamification/engine.ts` | `completeFlashcards(chapterId, knownCount, totalCount)` | `chapterId` exact | Marque flashcards, ratio, stats, XP, badges, sauvegarde | CRITIQUE, XP et progression duplicables |
| `src/data/gamification/engine.ts` | `completeExercice(chapterId, exerciceId)` | `chapterId`, `exerciceId` | Ajoute XP et stats d'exercice sans stocker `exerciceId` dans engine | ELEVE, dédoublonnage externe |
| `src/data/gamification/engine.ts` | `completeAllExercices(chapterId)` | `chapterId` exact | Marque exercices terminés, ajoute XP, sauvegarde | CRITIQUE, bonus duplicable |
| `src/data/gamification/engine.ts` | `checkChapterComplete(chapterId)` | `chapterId` exact | Écrit `chapter_complete_${chapterId}` et ajoute XP de chapitre complet | CRITIQUE, double bonus possible |
| `src/components/pedagogie/CoursTracker.tsx` | `CoursTracker` | Prop `chapterId` | Lit puis écrit via `completeCours` après défilement | ELEVE, composant mixte lecture/écriture |
| `src/components/pedagogie/QuizPlayer.tsx` | `finishQuiz` | Prop `chapterId` | Lit et écrit récompense quotidienne, appelle `completeQuiz` | CRITIQUE |
| `src/components/pedagogie/FlashcardsPlayer.tsx` | `finish`, `rate` | Prop `chapterId` | Écrit SRS puis appelle `completeFlashcards` | CRITIQUE |
| `src/components/pedagogie/ExercicesPlayer.tsx` | `rewardExo`, `checkAll` | Prop `chapterId`, `exoId` | Écrit clés de récompense puis appelle engine | CRITIQUE |
| `src/components/pedagogie/Dashboard.tsx` | `progressBySubject`, `chaptersWithProgress` | `chapter.id` | Affiche une progression par chapitre et par matière | FAIBLE si lecture seule |
| `src/components/pedagogie/ProfilePage.tsx`, `src/components/pedagogie/BadgesPage.tsx` | Pages profil/badges | État global engine | Affiche XP, rangs, badges, stats globales | MODERE, dépend des agrégats déjà écrits |

## 4. Quiz et scores

| Fichier | ID utilisé | Stockage | Lecture compatible possible ? | Risque |
|---|---|---|---|---|
| `src/components/pedagogie/QuizPlayer.tsx` | `chapterId` pour `quiz_reward_${chapterId}` et `engine.completeQuiz` | `localStorage` + `gamification_state` | Oui mais pas en premier : il faut éviter double score et double XP | CRITIQUE |
| `src/components/pedagogie/QuizBlock.astro` | Clé de chapitre legacy dans `pc-platform-progress-v2` | `localStorage` | Oui avec alias, mais nécessite stratégie de fusion legacy | ELEVE |
| `src/components/pedagogie/MegaQuizPlayer.tsx` | `Question.id` pour React et score local de session | Aucun stockage observé | Pas prioritaire, car pas de progression persistée | FAIBLE |
| `src/pages/mega-quiz.astro` | Agrégation `quiz.json` + `meta.json` | Aucun stockage observé | Sans intérêt pour alias persistants à ce stade | FAIBLE |
| `src/pages/memorisation/mega-quiz.astro` | Aucun ID applicatif observé | Aucun stockage observé | Non concerné actuellement | FAIBLE |
| `src/pages/college/[niveau]/[matiere]/[chapitre].astro`, `src/pages/lycee/[niveau]/[matiere]/[chapitre].astro` | `chapterId` transmis aux lecteurs | Indirect via lecteurs | Non en premier, car touche toutes les routes de chapitres | ELEVE |

## 5. Flashcards et SRS

| Fichier | ID utilisé | Stockage | Alias nécessaire ? | Risque |
|---|---|---|---|---|
| `src/data/gamification/srs.ts` | `chapterId`, `cardId`, clé interne `${chapterId}::${cardId}` | `srs_cards` | Oui avant migration réelle | CRITIQUE |
| `src/components/pedagogie/FlashcardsPlayer.tsx` | `chapterId`, `card.id` | `srs_cards` + `gamification_state` | Oui, mais après lecture compatible validée ailleurs | CRITIQUE |
| `src/components/pedagogie/FlashcardsBlock.astro` | Clé de chapitre legacy dans `pc-platform-progress-v2` | `localStorage` | Oui, avec fusion legacy | ELEVE |
| `src/components/pedagogie/MegaFlashcardsPlayer.tsx` | `Card.id` pour React et résultat de session | Aucun stockage observé | Non nécessaire pour la progression persistée | FAIBLE |
| `src/pages/mega-flashcards.astro` | Agrégation `flashcards.json` + `meta.json` | Aucun stockage observé | Non prioritaire | FAIBLE |
| `src/components/pedagogie/Dashboard.tsx` | `srs.getGlobalDueCount()` | Lecture indirecte `srs_cards` | Pas pour la première passe recommandée | MODERE |

## 6. Exercices

| Fichier | ID utilisé | Stockage | Première intégration possible ? | Risque |
|---|---|---|---|---|
| `src/components/pedagogie/ExercicesPlayer.tsx` | `chapterId`, `cur.id`, liste `exo_rewarded_${chapterId}` | `localStorage` + `gamification_state` | Non | CRITIQUE |
| `src/data/gamification/engine.ts` | `completeExercice(chapterId, exerciceId)` | `gamification_state` pour XP/stats | Non | ELEVE |
| `src/data/gamification/engine.ts` | `completeAllExercices(chapterId)` | `gamification_state`, `chapter_complete_${chapterId}` | Non | CRITIQUE |
| Routes de chapitres physique-chimie | Props vers `ExercicesPlayer` | Indirect via lecteur | Non | ELEVE |

## 7. Méga-quiz et méga-flashcards

| Fichier | ID utilisé | Persisté ? | Risque | Décision |
|---|---|---:|---|---|
| `src/pages/mega-quiz.astro` | Chemins `quiz.json`, `meta.json`, champs `niveau`, `matiere`, `chapterTitle` | Non | FAIBLE | NE_PAS_TOUCHER_MAINTENANT |
| `src/components/pedagogie/MegaQuizPlayer.tsx` | `Question.id`, filtres niveau/matière/chapitre, score React | Non | FAIBLE | BRANCHEMENT_PLUS_TARD si besoin d'attribut non persistant |
| `src/pages/mega-flashcards.astro` | Chemins `flashcards.json`, `meta.json`, champs `niveau`, `matiere`, `chapterTitle` | Non | FAIBLE | NE_PAS_TOUCHER_MAINTENANT |
| `src/components/pedagogie/MegaFlashcardsPlayer.tsx` | `Card.id`, filtres niveau/matière/chapitre, résultats React | Non | FAIBLE | BRANCHEMENT_PLUS_TARD si besoin d'attribut non persistant |
| `src/pages/memorisation/mega-quiz.astro` | Aucun ID significatif observé | Non | FAIBLE | NE_PAS_TOUCHER_MAINTENANT |
| `src/pages/memorisation/mega-flashcards.astro` | Aucun ID significatif observé | Non | FAIBLE | NE_PAS_TOUCHER_MAINTENANT |

## 8. Zones à ne pas toucher maintenant

- `src/data/gamification/engine.ts` : coeur de l'XP, des rangs, badges, streaks, statistiques et progression par `chapterId`; toute erreur peut doubler ou perdre de l'XP.
- `src/data/gamification/srs.ts` : stockage compact `srs_cards` avec clé interne `${chapterId}::${cardId}`; toute migration doit gérer les cartes déjà planifiées.
- `src/components/pedagogie/QuizPlayer.tsx` : écrit `quiz_reward_${chapterId}` et appelle `completeQuiz`; risque de score dupliqué et d'XP quotidien doublé.
- `src/components/pedagogie/FlashcardsPlayer.tsx` : écrit dans SRS puis dans la gamification; risque croisé SRS + XP.
- `src/components/pedagogie/ExercicesPlayer.tsx` : gère les récompenses unitaires et le bonus tous exercices; risque de double comptage.
- `src/components/pedagogie/CoursTracker.tsx` : composant plus simple mais mixte lecture/écriture; à garder après une première lecture compatible validée.
- `src/components/pedagogie/progress.ts` : stockage legacy `pc-platform-progress-v1`; nécessite une stratégie dédiée.
- `src/components/pedagogie/QuizBlock.astro` et `src/components/pedagogie/FlashcardsBlock.astro` : stockage legacy `pc-platform-progress-v2`; les deux recalculent l'XP localement.
- Routes dynamiques `src/pages/college/[niveau]/[matiere]/[chapitre].astro` et `src/pages/lycee/[niveau]/[matiere]/[chapitre].astro` : points d'entrée publics de tous les lecteurs.
- `src/pages/mega-quiz.astro`, `src/pages/mega-flashcards.astro`, `src/components/pedagogie/MegaQuizPlayer.tsx`, `src/components/pedagogie/MegaFlashcardsPlayer.tsx` : faibles risques mais pas utiles pour valider une stratégie de progression persistée.

## 9. Première intégration recommandée

Première intégration choisie : lecture compatible non destructive dans `src/components/pedagogie/Dashboard.tsx`.

Fichier à modifier dans le prochain prompt : `src/components/pedagogie/Dashboard.tsx`.

Fonction ou composant à modifier : `Dashboard`, uniquement les lectures de progression qui utilisent actuellement `engine.getChapterProgress(chapter.id)` dans `progressBySubject`, `chaptersWithProgress` et la liste de progression récente.

Helper à utiliser : `resolveContentIdAlias`, `getContentIdAliases` ou `getLegacyContentIdCandidates` depuis `src/utils/contentIds.ts`, selon l'API la plus simple au moment de l'intégration.

Type d'intégration : LECTURE_SEULE.

Stratégie de fallback :
- partir de `chapter.id`;
- calculer l'ID canonique avec `resolveContentIdAlias(chapter.id)`;
- construire une liste de candidats de lecture composée de l'ID courant, de l'ID canonique et des alias legacy connus;
- lire `engine.getChapterProgress(candidateId)` pour chaque candidat;
- choisir pour l'affichage la progression la plus informative, idéalement le plus haut `percent`, sans modifier `engine`, sans écrire dans `localStorage` et sans fusion persistante.

Risques :
- risque FAIBLE de changement d'affichage si une progression existe sous un alias et pas sous l'ID courant;
- risque MODERE si la sélection de la meilleure progression agrège mal plusieurs états partiels;
- pas de risque direct de double XP tant qu'aucune écriture n'est ajoutée.

Tests nécessaires :
- `node scripts/verify-routes-and-content.mjs`;
- `npm.cmd run build`;
- vérification manuelle ultérieure du tableau de bord avec un état local existant sous ancien ID et sous ID canonique;
- vérifier que l'XP total, les badges, le streak et les cartes SRS dues ne sont pas modifiés par cette lecture.

Critère de rollback :
- revenir aux appels directs `engine.getChapterProgress(chapter.id)` dans `Dashboard.tsx`;
- aucun nettoyage de stockage local ne doit être nécessaire, car la première intégration recommandée ne doit rien écrire.

## 10. Prompt suivant recommandé

Prompt conseillé : Prompt 15 — Lecture compatible non destructive des progressions dans Dashboard avec alias contentIds

Tu es un comité d'experts chargé d'effectuer le premier branchement applicatif des alias contentIds dans le site Astro.

Les audits précédents ont établi que :
- `src/utils/contentIds.ts` contient les helpers d'identifiants et les alias legacy;
- `scripts/verify-routes-and-content.mjs` vérifie les alias contentIds;
- `RAPPORT_BRANCHEMENT_ALIAS_APPLICATIF.md` recommande une première intégration en lecture seule dans `src/components/pedagogie/Dashboard.tsx`;
- aucun branchement ne doit encore être fait dans `engine.ts`, `srs.ts`, `QuizPlayer`, `FlashcardsPlayer`, `ExercicesPlayer` ou `CoursTracker`;
- aucune migration localStorage ne doit être effectuée.

Objectif :

Modifier uniquement `src/components/pedagogie/Dashboard.tsx` pour que l'affichage de progression puisse lire une progression existante via l'ID courant, l'ID canonique et les alias legacy connus, sans écrire aucune donnée et sans changer les clés de stockage.

Périmètre autorisé :

Tu peux modifier uniquement :
- `src/components/pedagogie/Dashboard.tsx`

Tu peux lire :
- `src/utils/contentIds.ts`
- `RAPPORT_BRANCHEMENT_ALIAS_APPLICATIF.md`
- `src/data/gamification/engine.ts`
- `scripts/verify-routes-and-content.mjs`

Interdictions absolues :

Tu ne dois pas :
- modifier `src/utils/contentIds.ts`;
- modifier `src/data/gamification/engine.ts`;
- modifier `src/data/gamification/srs.ts`;
- modifier `QuizPlayer`, `FlashcardsPlayer`, `ExercicesPlayer` ou `CoursTracker`;
- modifier les pages, routes, données, `meta.json`, cours, exercices, quiz ou flashcards;
- écrire dans `localStorage`;
- créer une migration;
- changer les IDs existants;
- changer les routes publiques;
- ajouter une dépendance.

Modification attendue :

Dans `Dashboard.tsx` uniquement :
- importer les helpers d'alias nécessaires depuis `src/utils/contentIds.ts`;
- créer une petite fonction locale pure de lecture compatible, par exemple `getCompatibleChapterProgress(engine, chapterId)`;
- cette fonction doit tester l'ID reçu, son canonique et ses alias legacy;
- elle doit retourner la progression la plus informative pour l'affichage;
- elle ne doit jamais appeler une fonction d'écriture;
- elle ne doit jamais lire ou écrire directement `localStorage`;
- elle ne doit pas modifier l'XP, les badges, les streaks ou le SRS.

Vérifications à exécuter :

Exécuter uniquement :
- `node scripts/verify-routes-and-content.mjs`
- `npm.cmd run build`

Critères de validation :

La mission est terminée seulement si :
- seul `src/components/pedagogie/Dashboard.tsx` est modifié;
- l'intégration est en lecture seule;
- aucune progression locale n'est migrée;
- aucune écriture `localStorage` n'est ajoutée;
- aucune route publique ne change;
- aucun contenu pédagogique ne change;
- `node scripts/verify-routes-and-content.mjs` réussit avec 0 erreur et 0 avertissement;
- `npm.cmd run build` réussit.

Compte rendu final attendu :

Répondre uniquement avec :
- fichier modifié;
- helper utilisé;
- confirmation lecture seule;
- résultat de `node scripts/verify-routes-and-content.mjs`;
- résultat de `npm.cmd run build`;
- prochain prompt conseillé.
