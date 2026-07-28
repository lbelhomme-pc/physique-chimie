# Rapport d'integration progressive du helper contentIds

## 1. Résumé exécutif

- Fichiers analyses : environ 543 fichiers reperes par les recherches obligatoires dans `src/` et `scripts/`, avec lecture detaillee des fichiers structurants.
- Zones candidates identifiees : 15.
- Zones a risque faible : 4.
- Zones necessitant une strategie d'alias : 7.
- Zones a ne pas toucher maintenant : 8.
- Premiere integration recommandee : `src/data/mathematiques/paths.ts`, en remplacant uniquement la construction actuelle de `getMathematicsChapterId` par `buildChapterContentId` avec sortie strictement identique.

Le helper `src/utils/contentIds.ts` separe correctement les espaces `physique-chimie`, `mathematiques` et `laboratoire`. L'audit confirme cependant que la majorite des usages reels d'identifiants sont deja lies a la progression locale, au SRS, aux recompenses de quiz, aux exercices et a la gamification. Ces zones ne doivent pas etre migrees sans alias.

## 2. Cartographie des usages d’identifiants

| Zone | Fichiers concernés | Type d’ID | Format actuel | Stockage | Risque | Décision |
|---|---|---|---|---|---|---|
| Routes chapitres physique-chimie college | `src/pages/college/[niveau]/[matiere]/[chapitre].astro` | ID_PROGRESSION | `college/{niveau}/{matiere}/{chapitre}` | Indirect via quiz, flashcards, exercices, cours et gamification | ELEVE | NECESSITE_ALIAS |
| Routes chapitres physique-chimie lycee | `src/pages/lycee/[niveau]/[matiere]/[chapitre].astro` | ID_PROGRESSION | `lycee/{niveau}/{matiere}/{chapitre}` | Indirect via quiz, flashcards, exercices, cours et gamification | ELEVE | NECESSITE_ALIAS |
| Routes chapitres mathematiques | `src/pages/mathematiques/college/[niveau]/[chapitre].astro`, `src/pages/mathematiques/lycee/[niveau]/[chapitre].astro`, `src/data/mathematiques/paths.ts` | ID_MATHEMATIQUES | `mathematiques:{cycle}:{niveau}:{chapitre}` | Indirect via les memes lecteurs pedagogiques | MODERE | INTEGRER_EN_PREMIER |
| Chemins de contenu physique-chimie | `src/pages/college/[niveau]/[matiere]/[chapitre].astro`, `src/pages/lycee/[niveau]/[matiere]/[chapitre].astro`, `scripts/verify-routes-and-content.mjs` | ID_INTERNE_SANS_STOCKAGE | `/src/data/chapters/{cycle}/{niveau}/{matiere}/{chapitre}` | Aucun stockage direct | ELEVE | NE_PAS_TOUCHER_MAINTENANT |
| Mega-quiz global | `src/pages/mega-quiz.astro`, `src/pages/memorisation/mega-quiz.astro`, `src/components/pedagogie/MegaQuizPlayer.tsx` | ID_QUIZ | `question.id` issu des fichiers `quiz.json`, enrichi par `niveau`, `matiere`, `chapterTitle` | Etat React uniquement | FAIBLE | INTEGRER_PLUS_TARD |
| Mega-flashcards globales | `src/pages/mega-flashcards.astro`, `src/pages/memorisation/mega-flashcards.astro`, `src/components/pedagogie/MegaFlashcardsPlayer.tsx` | ID_FLASHCARD | `card.id` issu des fichiers `flashcards.json`, enrichi par `niveau`, `matiere`, `chapterTitle` | Etat React uniquement | FAIBLE | INTEGRER_PLUS_TARD |
| Quiz de chapitre | `src/components/pedagogie/QuizPlayer.tsx` | ID_QUIZ | `chapterId` + `question.id`, cle `quiz_reward_{chapterId}` | `localStorage` | ELEVE | NECESSITE_ALIAS |
| Flashcards de chapitre | `src/components/pedagogie/FlashcardsPlayer.tsx`, `src/data/gamification/srs.ts` | ID_FLASHCARD | `chapterId::cardId` | `localStorage` via `srs_cards` | ELEVE | NECESSITE_ALIAS |
| Exercices de chapitre | `src/components/pedagogie/ExercicesPlayer.tsx` | ID_PROGRESSION | `exo_rewarded_{chapterId}`, `exo_all_rewarded_{chapterId}`, `exercise.id` | `localStorage` | ELEVE | NECESSITE_ALIAS |
| Cours de chapitre | `src/components/pedagogie/CoursTracker.tsx` | ID_PROGRESSION | `chapterId` | Indirect via `gamification_state` | ELEVE | NECESSITE_ALIAS |
| Gamification centrale | `src/data/gamification/engine.ts`, `src/components/pedagogie/Dashboard.tsx` | ID_GAMIFICATION | `progress[chapterId]`, `chapter_complete_{chapterId}` | `localStorage` | CRITIQUE | NECESSITE_ALIAS |
| Progression legacy | `src/components/pedagogie/progress.ts`, `src/components/pedagogie/QuizBlock.astro`, `src/components/pedagogie/FlashcardsBlock.astro` | ID_PROGRESSION | `chapterKey`, stockage `pc-platform-progress-v1` et `pc-platform-progress-v2` | `localStorage` | ELEVE | NE_PAS_TOUCHER_MAINTENANT |
| Badges, rangs et notifications | `src/data/gamification/config.ts`, `src/data/gamification/useGamification.ts` | ID_GAMIFICATION | Identifiants de badges, rangs et notifications temporelles | `gamification_state` pour badges/rangs | MODERE | NE_PAS_TOUCHER_MAINTENANT |
| Catalogue laboratoire | `src/data/laboratoire/apps.ts`, `src/pages/laboratoire/[slug].astro`, `src/data/laboratoire/genericConfigs.ts` | ID_LABORATOIRE | `app.slug`, `legacyPath`, routes `/laboratoire/{slug}` | Aucun stockage de progression repere | MODERE | INTEGRER_PLUS_TARD |
| Attributs DOM laboratoire | `src/components/laboratoire/GenericLabSimulator.astro` | ATTRIBUT_HTML | `${app.slug}-a`, `${app.slug}-b`, `${app.slug}-mode`, `${app.slug}-stage-title` | Aucun stockage | FAIBLE | INTEGRER_PLUS_TARD |

## 3. Usages sans stockage local

| Fichier | Usage de l’ID | Remplaçable par helper ? | Risque | Remarque |
|---|---|---|---|---|
| `src/utils/contentIds.ts` | Reference centrale des futurs identifiants | Deja cree | FAIBLE | A ne pas modifier dans cet audit. |
| `src/data/mathematiques/paths.ts` | Construction `mathematiques:{cycle}:{niveau}:{chapitre}` | Oui | FAIBLE | Meilleur premier point si la sortie est comparee avant/apres. |
| `src/pages/mega-quiz.astro` | Association de questions a un chapitre via le chemin de dossier | Oui, plus tard | FAIBLE | Aucun stockage local, mais les IDs de questions doivent rester inchanges. |
| `src/pages/memorisation/mega-quiz.astro` | Redirection ou page publique de memorisation selon architecture presente | Oui, plus tard | FAIBLE | Ne pas changer les routes. |
| `src/components/pedagogie/MegaQuizPlayer.tsx` | `question.id` et filtres `niveau`/`matiere` | Oui, plus tard | FAIBLE | Usage principalement React, sans persistance. |
| `src/pages/mega-flashcards.astro` | Association de cartes a un chapitre via le chemin de dossier | Oui, plus tard | FAIBLE | Aucun stockage local, mais conserver `card.id`. |
| `src/pages/memorisation/mega-flashcards.astro` | Redirection ou page publique de memorisation selon architecture presente | Oui, plus tard | FAIBLE | Ne pas changer les routes. |
| `src/components/pedagogie/MegaFlashcardsPlayer.tsx` | `card.id` et filtres `niveau`/`matiere` | Oui, plus tard | FAIBLE | Etat local React seulement. |
| `src/components/laboratoire/GenericLabSimulator.astro` | Attributs DOM derives de `app.slug` | Oui, plus tard | FAIBLE | Sortie probablement identique car les slugs sont deja propres. |
| `src/data/gamification/useGamification.ts` | IDs de notifications locales en memoire | Non prioritaire | FAIBLE | IDs temporels non lies aux contenus. |
| `scripts/verify-routes-and-content.mjs` | Calculs de controle, unicite et formats attendus | Oui, mais avec prudence | FAIBLE | Le script `.mjs` ne peut pas importer directement le helper `.ts` sans decision technique. |

## 4. Usages avec localStorage ou sessionStorage

| Fichier | Clé ou ID stocké | Données stockées | Alias nécessaire ? | Risque | Décision |
|---|---|---|---|---|---|
| `src/data/gamification/engine.ts` | `gamification_state` | XP, rang, badges, streak, progression par `chapterId` | Oui | CRITIQUE | NE_PAS_TOUCHER_MAINTENANT |
| `src/data/gamification/engine.ts` | `chapter_complete_{chapterId}` | Etat de completion d'un chapitre | Oui | ELEVE | NECESSITE_ALIAS |
| `src/data/gamification/srs.ts` | `srs_cards` avec cle interne `chapterId::cardId` | Etat SRS, dates de revision, niveaux de maitrise | Oui | ELEVE | NECESSITE_ALIAS |
| `src/components/pedagogie/QuizPlayer.tsx` | `quiz_reward_{chapterId}` | Recompense de quiz deja accordee | Oui | ELEVE | NECESSITE_ALIAS |
| `src/components/pedagogie/ExercicesPlayer.tsx` | `exo_rewarded_{chapterId}` | Exercices deja recompenses | Oui | ELEVE | NECESSITE_ALIAS |
| `src/components/pedagogie/ExercicesPlayer.tsx` | `exo_all_rewarded_{chapterId}` | Recompense globale d'exercices deja accordee | Oui | ELEVE | NECESSITE_ALIAS |
| `src/components/pedagogie/progress.ts` | `pc-platform-progress-v1` | Progression legacy par `chapterKey` | Oui | ELEVE | NE_PAS_TOUCHER_MAINTENANT |
| `src/components/pedagogie/QuizBlock.astro` | `pc-platform-progress-v2` | Progression legacy liee aux blocs quiz | Oui | ELEVE | NE_PAS_TOUCHER_MAINTENANT |
| `src/components/pedagogie/FlashcardsBlock.astro` | `pc-platform-progress-v2` | Progression legacy liee aux flashcards | Oui | ELEVE | NE_PAS_TOUCHER_MAINTENANT |

## 5. Quiz et méga-quiz

| Fichier | ID actuel | Usage | Collision possible | Intégration recommandée |
|---|---|---|---|---|
| `src/components/pedagogie/QuizPlayer.tsx` | `chapterId`, `question.id`, `quiz_reward_{chapterId}` | Quiz de chapitre, affichage du resultat et recompense | Oui si `chapterId` change sans alias | Ne pas modifier avant strategie d'alias. |
| `src/pages/college/[niveau]/[matiere]/[chapitre].astro` | `college/{niveau}/{matiere}/{chapitre}` | Passage du `chapterId` a `QuizPlayer` | Oui avec les IDs lycee ou futurs IDs namespaced | Ne pas modifier maintenant. |
| `src/pages/lycee/[niveau]/[matiere]/[chapitre].astro` | `lycee/{niveau}/{matiere}/{chapitre}` | Passage du `chapterId` a `QuizPlayer` | Oui avec les IDs college ou futurs IDs namespaced | Ne pas modifier maintenant. |
| `src/pages/mathematiques/college/[niveau]/[chapitre].astro` | `mathematiques:college:{niveau}:{chapitre}` | Passage du `chapterId` a `QuizPlayer` | Faible, deja namespaced | Integrer via `src/data/mathematiques/paths.ts` en conservant la sortie. |
| `src/pages/mathematiques/lycee/[niveau]/[chapitre].astro` | `mathematiques:lycee:{niveau}:{chapitre}` | Passage du `chapterId` a `QuizPlayer` | Faible, deja namespaced | Integrer via `src/data/mathematiques/paths.ts` en conservant la sortie. |
| `src/pages/mega-quiz.astro` | `question.id` issu des donnees | Mega-quiz global sans persistance | Limitee aux questions de meme lot | Integration possible plus tard, non prioritaire. |
| `src/components/pedagogie/MegaQuizPlayer.tsx` | `question.id`, index React | Filtrage et rendu de resultats | Faible | Integration possible seulement pour attributs non persistants. |

## 6. Flashcards et méga-flashcards

| Fichier | ID actuel | Usage | Collision possible | Intégration recommandée |
|---|---|---|---|---|
| `src/components/pedagogie/FlashcardsPlayer.tsx` | `chapterId`, `card.id` | Revisions et validation des cartes | Oui si `chapterId` ou `card.id` change | Ne pas modifier avant alias SRS. |
| `src/data/gamification/srs.ts` | `chapterId::cardId` | Cle SRS persistante | Oui, risque direct de perte de suivi | Ne pas modifier maintenant. |
| `src/pages/college/[niveau]/[matiere]/[chapitre].astro` | `college/{niveau}/{matiere}/{chapitre}` | Passage du `chapterId` a `FlashcardsPlayer` | Oui | Ne pas modifier maintenant. |
| `src/pages/lycee/[niveau]/[matiere]/[chapitre].astro` | `lycee/{niveau}/{matiere}/{chapitre}` | Passage du `chapterId` a `FlashcardsPlayer` | Oui | Ne pas modifier maintenant. |
| `src/pages/mathematiques/college/[niveau]/[chapitre].astro` | `mathematiques:college:{niveau}:{chapitre}` | Passage du `chapterId` a `FlashcardsPlayer` | Faible si sortie identique | Integrer seulement via helper central et comparaison stricte. |
| `src/pages/mathematiques/lycee/[niveau]/[chapitre].astro` | `mathematiques:lycee:{niveau}:{chapitre}` | Passage du `chapterId` a `FlashcardsPlayer` | Faible si sortie identique | Integrer seulement via helper central et comparaison stricte. |
| `src/pages/mega-flashcards.astro` | `card.id` issu des donnees | Mega-flashcards globales sans persistance | Limitee aux cartes de meme lot | Integration possible plus tard. |
| `src/components/pedagogie/MegaFlashcardsPlayer.tsx` | `card.id`, index React | Filtrage, revision locale non persistante | Faible | Integration possible seulement pour attributs non persistants. |

## 7. Gamification et progression

| Fichier | ID actuel | Stockage | Dépendance | Risque de migration |
|---|---|---|---|---|
| `src/data/gamification/engine.ts` | `chapterId` | `gamification_state`, `chapter_complete_{chapterId}` | Tous les lecteurs pedagogiques | CRITIQUE |
| `src/data/gamification/srs.ts` | `chapterId::cardId` | `srs_cards` | `FlashcardsPlayer.tsx` | ELEVE |
| `src/components/pedagogie/CoursTracker.tsx` | `chapterId` | Indirect via engine | Pages de chapitres | ELEVE |
| `src/components/pedagogie/QuizPlayer.tsx` | `chapterId`, `quiz_reward_{chapterId}` | `localStorage`, engine | Pages de chapitres | ELEVE |
| `src/components/pedagogie/ExercicesPlayer.tsx` | `chapterId`, `exercise.id` | `localStorage`, engine | Pages de chapitres | ELEVE |
| `src/components/pedagogie/FlashcardsPlayer.tsx` | `chapterId`, `card.id` | SRS, engine | Pages de chapitres | ELEVE |
| `src/components/pedagogie/Dashboard.tsx` | `chapter.id` | Lecture engine | Etat de progression global | ELEVE |
| `src/components/pedagogie/progress.ts` | `chapterKey` | `pc-platform-progress-v1` | Blocs legacy | ELEVE |
| `src/components/pedagogie/QuizBlock.astro` | `chapterKey` | `pc-platform-progress-v2` | Blocs quiz legacy | ELEVE |
| `src/components/pedagogie/FlashcardsBlock.astro` | `chapterKey` | `pc-platform-progress-v2` | Blocs flashcards legacy | ELEVE |

## 8. Mathématiques

| Fichier | ID actuel | Espace séparé ? | Risque | Action future |
|---|---|---|---|---|
| `src/data/mathematiques/paths.ts` | `mathematiques:{cycle}:{niveau}:{chapitre}` | Oui | FAIBLE | Premier point recommande : deleguer a `buildChapterContentId` avec sortie identique. |
| `src/pages/mathematiques/college/[niveau]/[chapitre].astro` | `getMathematicsChapterId("college", niveau, chapitre)` | Oui | MODERE | Ne pas modifier directement ; beneficiera du changement central. |
| `src/pages/mathematiques/lycee/[niveau]/[chapitre].astro` | `getMathematicsChapterId("lycee", niveau, chapitre)` | Oui | MODERE | Ne pas modifier directement ; beneficiera du changement central. |
| `src/data/mathematiques/content.ts` | Fallbacks `cryptoSafeId(...)` pour exercices, quiz et flashcards | Partiel | MODERE | Ne pas modifier au premier passage ; risque de changer des IDs de ressources. |
| `src/data/mathematiques/chapters/` | IDs de ressources dans `exercices.json`, `quiz.json`, `flashcards.json` | Oui via chapitre | ELEVE | Ne pas modifier les contenus. |

## 9. Laboratoire

| Fichier | ID actuel | Route liée | Risque | Action future |
|---|---|---|---|---|
| `src/data/laboratoire/apps.ts` | `slug`, `legacyPath` | `/laboratoire`, `/laboratoire/{slug}` | MODERE | Ne pas modifier les slugs ni les legacy paths. |
| `src/pages/laboratoire/[slug].astro` | `app.slug` | `/laboratoire/{slug}` | MODERE | Integration possible uniquement apres audit route par route. |
| `src/data/laboratoire/genericConfigs.ts` | Cle de configuration liee au laboratoire | `/laboratoire/{slug}` indirectement | MODERE | Ne pas modifier au premier passage. |
| `src/components/laboratoire/GenericLabSimulator.astro` | Attributs DOM bases sur `app.slug` | Aucune route directe | FAIBLE | Candidat futur pour `normalizeIdPart`, mais moins utile que les maths. |
| `src/scripts/laboratoire/` | Scripts d'interaction laboratoire | Routes laboratoire selon pages | MODERE | Ne pas modifier sans tests laboratoire dedies. |

## 10. Zones à ne pas modifier maintenant

- `src/pages/college/[niveau]/[matiere]/[chapitre].astro` : le `chapterId` physique-chimie est transmis a la progression, aux quiz, aux exercices et aux flashcards.
- `src/pages/lycee/[niveau]/[matiere]/[chapitre].astro` : meme dependance que le college, avec stockage local indirect.
- `src/data/gamification/engine.ts` : coeur de la progression persistante ; toute modification demande une strategie d'alias et de migration douce.
- `src/data/gamification/srs.ts` : cle persistante `chapterId::cardId`, sensible pour les flashcards.
- `src/components/pedagogie/QuizPlayer.tsx` : cle `quiz_reward_{chapterId}` et recompenses.
- `src/components/pedagogie/FlashcardsPlayer.tsx` : SRS et validation des cartes.
- `src/components/pedagogie/ExercicesPlayer.tsx` : recompenses d'exercices par chapitre et par exercice.
- `src/components/pedagogie/progress.ts`, `src/components/pedagogie/QuizBlock.astro`, `src/components/pedagogie/FlashcardsBlock.astro` : stockage legacy a conserver tant qu'une strategie de compatibilite n'est pas formalisee.
- `src/data/mathematiques/content.ts` : les fallbacks d'IDs de ressources peuvent changer les IDs de quiz, exercices ou flashcards.
- `src/data/chapters/` et `src/data/mathematiques/chapters/` : contenus pedagogiques et donnees de reference, hors perimetre d'une premiere integration technique.
- `src/data/laboratoire/apps.ts` et `src/pages/laboratoire/[slug].astro` : slugs publics et `legacyPath` a preserver.

## 11. Première intégration recommandée

Integration unique recommandee : `src/data/mathematiques/paths.ts`.

Principe :
- importer `buildChapterContentId` depuis `src/utils/contentIds.ts` ;
- remplacer uniquement le corps de `getMathematicsChapterId` ;
- conserver exactement la sortie actuelle `mathematiques:{cycle}:{niveau}:{chapitre}` ;
- ne pas modifier les pages Astro ;
- ne pas modifier `localStorage` ;
- ne pas modifier les contenus ;
- ne pas modifier les routes publiques.

Cette integration est la plus prudente car les mathematiques utilisent deja un espace namespaced avec `:`. Le helper central peut donc reprendre la construction existante sans changer les identifiants produits, a condition de verifier les 11 chapitres mathematiques connus avant et apres.

Pourquoi ne pas integrer d'abord le script de verification :
- `scripts/verify-routes-and-content.mjs` est un module Node `.mjs` ;
- le helper central est un fichier TypeScript `.ts` ;
- une importation directe demanderait une decision technique supplementaire sur la frontiere TypeScript/Node ;
- il vaut mieux eviter de creer un second helper JavaScript concurrent.

Rollback :
- restaurer le corps actuel de `getMathematicsChapterId` suffit ;
- aucun contenu ni stockage local n'est modifie par cette integration.

Tests a executer apres cette premiere integration :
- `node scripts/verify-routes-and-content.mjs` ;
- `npm.cmd run build` ;
- controle manuel du diff pour confirmer qu'un seul fichier applicatif a ete modifie.

## 12. Prompt suivant recommandé

```text
# Prompt 10 — Première intégration contrôlée du helper contentIds dans les identifiants mathématiques

Tu es un comité d’experts chargé de réaliser la première intégration contrôlée du helper central d’identifiants.

Objectif :
Modifier uniquement `src/data/mathematiques/paths.ts` pour que `getMathematicsChapterId` utilise `buildChapterContentId` depuis `src/utils/contentIds.ts`, sans changer la chaîne générée.

Contexte :
Le rapport `RAPPORT_INTEGRATION_CONTENT_IDS.md` recommande cette intégration car les identifiants mathématiques actuels utilisent déjà le format :
`mathematiques:{cycle}:{niveau}:{chapitre}`.

Périmètre autorisé :
- lire les rapports existants ;
- lire `src/utils/contentIds.ts` ;
- lire `src/data/mathematiques/paths.ts` ;
- modifier uniquement `src/data/mathematiques/paths.ts`.

Interdictions :
- ne pas modifier les contenus ;
- ne pas modifier les routes ;
- ne pas modifier `localStorage` ;
- ne pas modifier la gamification ;
- ne pas modifier les quiz ;
- ne pas modifier les flashcards ;
- ne pas modifier les fichiers `meta.json` ;
- ne pas modifier le helper `src/utils/contentIds.ts` ;
- ne pas ajouter de dépendance.

Travail demandé :
1. Lire `RAPPORT_INTEGRATION_CONTENT_IDS.md`.
2. Lire `src/utils/contentIds.ts`.
3. Lire `src/data/mathematiques/paths.ts`.
4. Vérifier la forme actuelle de `getMathematicsChapterId`.
5. Remplacer uniquement son implémentation par un appel à `buildChapterContentId`.
6. Utiliser `discipline: "mathematiques"`.
7. Conserver les paramètres `cycle`, `niveau` et `chapitre`.
8. Vérifier que les identifiants générés restent strictement identiques pour les chapitres mathématiques existants.

Commandes à exécuter :
`node scripts/verify-routes-and-content.mjs`
`npm.cmd run build`

Compte rendu final attendu :
- fichier modifié ;
- confirmation que la sortie de `getMathematicsChapterId` reste identique ;
- confirmation qu’aucune route publique n’a changé ;
- confirmation qu’aucun stockage local n’a été migré ;
- résultat de `node scripts/verify-routes-and-content.mjs` ;
- résultat de `npm.cmd run build` ;
- éventuels points bloquants.
```
