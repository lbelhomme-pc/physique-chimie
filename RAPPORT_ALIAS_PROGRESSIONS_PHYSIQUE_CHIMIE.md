# Rapport alias progressions physique-chimie

## 1. Résumé exécutif

- Fichiers analysés : environ 570 fichiers repérés par les recherches obligatoires, avec lecture détaillée des pages de chapitres, composants pédagogiques, moteurs de progression, SRS, méga-quiz, méga-flashcards, helpers et rapports précédents.
- Formats d'IDs repérés : 12 formats ou familles de formats utilisés autour de la physique-chimie.
- Clés localStorage/sessionStorage repérées : 9 clés ou préfixes, dont 8 liés à la progression, aux récompenses, au SRS ou à la gamification ; aucune utilisation significative de sessionStorage n'a été repérée.
- Risques majeurs : fragmentation de la progression par changement de `chapterId`, perte d'historique SRS, double attribution d'XP, duplication des récompenses de quiz/exercices, incohérence du tableau de bord.
- Stratégie recommandée : ne pas migrer directement les IDs persistés ; créer d'abord des alias non destructifs entre les IDs legacy en slashs et les IDs cibles en deux-points, puis faire lire ancien et nouveau format avant toute écriture progressive.
- Décision sur la première migration possible : migration directe refusée à ce stade ; première étape possible limitée à l'ajout de fonctions d'alias pures dans `src/utils/contentIds.ts`, sans utilisation applicative immédiate.

## 2. Inventaire des formats d'IDs physique-chimie

| Format observé | Exemple réel | Fichiers concernés | Usage | Persisté ? | Risque |
|---|---|---|---|---|---|
| `college/{niveau}/{matiere}/{chapitre}` | `college/4eme/chimie/atomes-molecules` | `src/pages/college/[niveau]/[matiere]/[chapitre].astro`, `src/pages/index.astro` | `chapterId` physique-chimie collège | Oui, via moteurs de progression | ELEVE |
| `lycee/{niveau}/{matiere}/{chapitre}` | `lycee/terminale-spe/chimie/acide-base-ph` | `src/pages/lycee/[niveau]/[matiere]/[chapitre].astro`, `src/pages/index.astro` | `chapterId` physique-chimie lycée | Oui, via moteurs de progression | ELEVE |
| `${cycle}/${niveau}/${matiere}/${slug}` | `college/4eme/physique/mouvement-vitesse` | `src/pages/index.astro` | ID de chapitre injecté dans le tableau de bord | Oui, par lecture indirecte | ELEVE |
| `/src/data/chapters/{cycle}/{niveau}/{matiere}/{chapitre}` | `/src/data/chapters/college/4eme/chimie/atomes-molecules` | `src/pages/college/[niveau]/[matiere]/[chapitre].astro`, `src/pages/lycee/[niveau]/[matiere]/[chapitre].astro` | Chemin interne de contenu | Non directement | MODERE |
| `/{cycle}/{niveau}/{matiere}/{chapitre}` | `/college/4eme/chimie/atomes-molecules` | Pages de chapitres collège/lycée, `meta.json` via `seo.canonical` | Route publique et canonical | Non comme ID interne, mais public | CRITIQUE |
| ID local de question quiz | `atom-mol-q1`, `acide-base-ph-q01` | `src/data/chapters/**/quiz.json`, `src/components/pedagogie/QuizPlayer.tsx` | Identification d'une question dans un quiz | Non directement, score agrégé par chapitre | MODERE |
| ID local de flashcard | `atom-mol-fc-1` | `src/data/chapters/**/flashcards.json`, `src/components/pedagogie/FlashcardsPlayer.tsx` | Identification d'une carte | Oui, dans `srs_cards` via clé composée | ELEVE |
| ID local d'exercice | `atom-mol-exo-1` | `src/data/chapters/**/exercices.json`, `src/components/pedagogie/ExercicesPlayer.tsx` | Identification d'un exercice récompensé | Oui, dans les ensembles d'exercices récompensés | ELEVE |
| `${chapterId}::${cardId}` | `college/4eme/chimie/atomes-molecules::atom-mol-fc-1` | `src/data/gamification/srs.ts` | Clé interne SRS par carte | Oui, dans `srs_cards` | ELEVE |
| `quiz_reward_${chapterId}` | `quiz_reward_college/4eme/chimie/atomes-molecules` | `src/components/pedagogie/QuizPlayer.tsx` | Récompense quotidienne ou anti-doublon quiz | Oui | ELEVE |
| `exo_rewarded_${chapterId}` et `exo_all_rewarded_${chapterId}` | `exo_rewarded_college/4eme/chimie/atomes-molecules` | `src/components/pedagogie/ExercicesPlayer.tsx` | Récompenses d'exercices par chapitre | Oui | ELEVE |
| `chapter_complete_${chapterId}` et `progress[chapterId]` | `chapter_complete_college/4eme/chimie/atomes-molecules` | `src/data/gamification/engine.ts`, `src/components/pedagogie/progress.ts` | Complétion, progression, badges, XP | Oui | ELEVE |

## 3. Inventaire des clés localStorage/sessionStorage

| Clé ou préfixe | Fichier | Données stockées | Format d'ID contenu | Risque de migration |
|---|---|---|---|---|
| `gamification_state` | `src/data/gamification/engine.ts` | XP, rang, badges, streak, progression par chapitre | `progress[chapterId]` avec IDs legacy en slashs | ELEVE |
| `srs_cards` | `src/data/gamification/srs.ts` | Etat SRS des flashcards, dates, intervalles, répétitions | `${chapterId}::${cardId}` | ELEVE |
| `quiz_reward_${chapterId}` | `src/components/pedagogie/QuizPlayer.tsx` | Marqueur de récompense quiz | `chapterId` legacy en slashs | ELEVE |
| `chapter_complete_${chapterId}` | `src/data/gamification/engine.ts` | Marqueur de complétion globale du chapitre | `chapterId` legacy en slashs | ELEVE |
| `exo_rewarded_${chapterId}` | `src/components/pedagogie/ExercicesPlayer.tsx` | Liste des exercices déjà récompensés | `chapterId` legacy en slashs + `exerciseId` local | ELEVE |
| `exo_all_rewarded_${chapterId}` | `src/components/pedagogie/ExercicesPlayer.tsx` | Marqueur de bonus global exercices | `chapterId` legacy en slashs | ELEVE |
| `pc-platform-progress-v1` | `src/components/pedagogie/progress.ts` | Ancienne progression par `chapterKey` | `chapterKey` legacy probable en slashs | MODERE |
| `pc-platform-progress-v2` | `src/components/pedagogie/QuizBlock.astro`, `src/components/pedagogie/FlashcardsBlock.astro` | Progression legacy quiz/flashcards | `chapterKey` legacy probable en slashs | MODERE |
| `a11y_preferences` | `src/data/accessibility/a11y-engine.ts` | Préférences d'accessibilité | Aucun ID de contenu physique-chimie | FAIBLE |

## 4. Quiz et méga-quiz

| Fichier | ID actuel | Usage | Persisté ? | Alias nécessaire | Risque |
|---|---|---|---|---|---|
| `src/components/pedagogie/QuizPlayer.tsx` | `chapterId` reçu de la page + IDs locaux de questions | Calcul score, attribution XP, clé `quiz_reward_${chapterId}` | Oui pour récompense et progression | Oui | ELEVE |
| `src/pages/college/[niveau]/[matiere]/[chapitre].astro` | `college/${niveau}/${matiere}/${chapitre}` | Passage du `chapterId` au lecteur quiz | Oui indirectement | Oui | ELEVE |
| `src/pages/lycee/[niveau]/[matiere]/[chapitre].astro` | `lycee/${niveau}/${matiere}/${chapitre}` | Passage du `chapterId` au lecteur quiz | Oui indirectement | Oui | ELEVE |
| `src/pages/mega-quiz.astro` | IDs locaux de questions enrichies avec niveau, matière, titre | Quiz global sans stockage persistant observé | Non | Non pour l'instant | FAIBLE |
| `src/components/pedagogie/MegaQuizPlayer.tsx` | `Question.id` | Etat React local de session et affichage | Non | Non pour l'instant | FAIBLE |
| `src/data/chapters/**/quiz.json` | `atom-mol-q1`, `acide-base-ph-q01` | IDs de questions | Non directement | A étudier si migration question par question | MODERE |

## 5. Flashcards et répétition espacée

| Fichier | ID actuel | Usage | Persisté ? | Alias nécessaire | Risque |
|---|---|---|---|---|---|
| `src/components/pedagogie/FlashcardsPlayer.tsx` | `chapterId` + `card.id` | Revue SRS, statistiques, complétion flashcards | Oui | Oui | ELEVE |
| `src/data/gamification/srs.ts` | `${chapterId}::${cardId}` | Clé interne de carte SRS | Oui | Oui | ELEVE |
| `src/pages/college/[niveau]/[matiere]/[chapitre].astro` | `college/${niveau}/${matiere}/${chapitre}` | Passage du `chapterId` au lecteur flashcards | Oui indirectement | Oui | ELEVE |
| `src/pages/lycee/[niveau]/[matiere]/[chapitre].astro` | `lycee/${niveau}/${matiere}/${chapitre}` | Passage du `chapterId` au lecteur flashcards | Oui indirectement | Oui | ELEVE |
| `src/pages/mega-flashcards.astro` | IDs locaux de cartes enrichies avec niveau, matière, titre | Mémorisation globale sans SRS persistant observé | Non | Non pour l'instant | FAIBLE |
| `src/components/pedagogie/MegaFlashcardsPlayer.tsx` | `Card.id` | Etat React local de session | Non | Non pour l'instant | FAIBLE |
| `src/data/chapters/**/flashcards.json` | `atom-mol-fc-1` | IDs de cartes | Oui via SRS quand la carte est revue | Oui | ELEVE |

## 6. Gamification et XP

| Fichier | ID actuel | Donnée liée | Persisté ? | Alias nécessaire | Risque |
|---|---|---|---|---|---|
| `src/data/gamification/engine.ts` | `chapterId` legacy | XP, rang, badges, streak, progression par chapitre | Oui | Oui | ELEVE |
| `src/data/gamification/engine.ts` | `chapter_complete_${chapterId}` | Anti-doublon de complétion chapitre | Oui | Oui | ELEVE |
| `src/components/pedagogie/CoursTracker.tsx` | `chapterId` legacy | XP de lecture du cours | Oui via engine | Oui | ELEVE |
| `src/components/pedagogie/QuizPlayer.tsx` | `chapterId` legacy | XP de quiz et récompense quiz | Oui | Oui | ELEVE |
| `src/components/pedagogie/FlashcardsPlayer.tsx` | `chapterId` legacy | XP flashcards et SRS | Oui | Oui | ELEVE |
| `src/components/pedagogie/ExercicesPlayer.tsx` | `chapterId` legacy + `exerciseId` local | XP exercices, récompenses unitaires et globales | Oui | Oui | ELEVE |
| `src/components/pedagogie/Dashboard.tsx` | `chapter.id` legacy | Lecture et affichage de progression | Oui indirectement | Oui | ELEVE |
| `src/data/gamification/config.ts` | IDs fixes de badges et rangs | Configuration des récompenses | Oui dans l'état global | Non, hors IDs de contenu | MODERE |

## 7. Tableau de correspondance legacy -> cible

| Ancien format | Nouveau format cible | Exemple legacy | Exemple cible | Stratégie d'alias |
|---|---|---|---|---|
| `college/{niveau}/{matiere}/{chapitre}` | `physique-chimie:college:{niveau}:{matiere}:{chapitre}` | `college/4eme/chimie/atomes-molecules` | `physique-chimie:college:4eme:chimie:atomes-molecules` | Alias bidirectionnel chapitre, lecture nouveau puis legacy |
| `lycee/{niveau}/{matiere}/{chapitre}` | `physique-chimie:lycee:{niveau}:{matiere}:{chapitre}` | `lycee/terminale-spe/physique/diffraction-ondes-interferences` | `physique-chimie:lycee:terminale-spe:physique:diffraction-ondes-interferences` | Alias bidirectionnel chapitre, lecture nouveau puis legacy |
| `quiz_reward_${chapterId}` | `quiz_reward_${contentId}` ou clé dédiée future | `quiz_reward_college/4eme/chimie/atomes-molecules` | `quiz_reward_physique-chimie:college:4eme:chimie:atomes-molecules` | Lire les deux clés ; écrire temporairement sans doubler la récompense |
| `chapter_complete_${chapterId}` | `chapter_complete_${contentId}` ou entrée normalisée dans `gamification_state` | `chapter_complete_college/4eme/chimie/atomes-molecules` | `chapter_complete_physique-chimie:college:4eme:chimie:atomes-molecules` | Lire les deux clés ; considérer complet si une des deux existe |
| `exo_rewarded_${chapterId}` | `exo_rewarded_${contentId}` ou clé dédiée future | `exo_rewarded_college/4eme/chimie/atomes-molecules` | `exo_rewarded_physique-chimie:college:4eme:chimie:atomes-molecules` | Fusionner les ensembles d'exercices, sans dupliquer l'XP |
| `exo_all_rewarded_${chapterId}` | `exo_all_rewarded_${contentId}` ou clé dédiée future | `exo_all_rewarded_college/4eme/chimie/atomes-molecules` | `exo_all_rewarded_physique-chimie:college:4eme:chimie:atomes-molecules` | Lire legacy et cible ; écrire cible avec garde anti-doublon |
| `${chapterId}::${cardId}` | `${contentId}:flashcard:${cardId}` ou alias SRS explicite | `college/4eme/chimie/atomes-molecules::atom-mol-fc-1` | `physique-chimie:college:4eme:chimie:atomes-molecules:flashcard:atom-mol-fc-1` | Alias carte par carte, fusion SRS en conservant la date la plus protectrice |
| `progress[chapterId]` | `progress[contentId]` | `progress["college/4eme/chimie/atomes-molecules"]` | `progress["physique-chimie:college:4eme:chimie:atomes-molecules"]` | Lecture avec alias ; fusion des drapeaux de complétion et scores max |

## 8. Stratégie de lecture compatible

Le futur code devra recevoir un ID canonique cible, puis demander ses alias legacy avec une fonction centralisée. Pour lire une progression de chapitre, il devra essayer l'ID cible, puis chaque alias legacy connu, sans modifier immédiatement le stockage existant.

Lorsque plusieurs entrées existent, la fusion doit être conservatrice : garder le meilleur score, l'état de complétion le plus avancé, les dates utiles les plus récentes pour l'affichage, et les informations SRS les plus protectrices pour ne pas faire perdre des révisions déjà acquises. Pour l'XP, la lecture ne doit jamais additionner deux entrées correspondant au même événement pédagogique.

Les clés anciennes ne doivent pas être supprimées brutalement. Une future migration pourra marquer explicitement qu'un alias a été traité, mais seulement après que le système sache lire et écrire les deux formats sans perte.

## 9. Stratégie d'écriture progressive

La future écriture devra privilégier le nouveau format canonique généré par `src/utils/contentIds.ts`. Pendant une période de compatibilité, elle pourra conserver une écriture legacy temporaire pour les zones les plus sensibles, notamment les récompenses quiz, exercices, complétion chapitre et SRS.

Toute écriture devra être protégée contre les doubles récompenses : un quiz déjà récompensé sous l'ancien ID ne doit pas redonner d'XP sous le nouvel ID ; un exercice déjà validé dans `exo_rewarded_${chapterId}` ne doit pas être recompensé une seconde fois ; une flashcard déjà planifiée par le SRS ne doit pas repartir comme nouvelle carte.

Si un mécanisme de migration est ajouté plus tard, il devra être explicite, versionné et non destructif. La migration devra écrire les données fusionnées dans le nouveau format, conserver les anciennes clés pendant une phase de transition, puis seulement marquer la migration comme effectuée.

## 10. Zones à migrer en premier

La première migration applicative directe des IDs persistés est refusée pour l'instant. La zone la plus sûre est une préparation d'alias sans stockage :

| Zone | Migration future proposée | Risque | Raison |
|---|---|---|---|
| `src/utils/contentIds.ts` | Ajouter des fonctions pures d'alias physique-chimie legacy vers cible, sans les utiliser dans les composants | FAIBLE | Permet de tester les correspondances sans toucher localStorage, routes, progression, quiz, flashcards ou données |

Cette étape doit créer une base technique pour les prompts suivants, mais ne doit pas encore modifier `engine.ts`, `srs.ts`, `QuizPlayer.tsx`, `FlashcardsPlayer.tsx`, `ExercicesPlayer.tsx` ni les pages de chapitres.

## 11. Zones à migrer en dernier

- `src/data/gamification/engine.ts` : coeur XP, badges, streak, complétion et progression par chapitre.
- `src/data/gamification/srs.ts` : stockage historique des flashcards et clés composées `${chapterId}::${cardId}`.
- `src/components/pedagogie/QuizPlayer.tsx` : récompense quiz et progression persistée.
- `src/components/pedagogie/FlashcardsPlayer.tsx` : SRS et progression flashcards.
- `src/components/pedagogie/ExercicesPlayer.tsx` : récompenses unitaires et globales d'exercices.
- `src/components/pedagogie/progress.ts` : stockage legacy `pc-platform-progress-v1`.
- `src/components/pedagogie/QuizBlock.astro` et `src/components/pedagogie/FlashcardsBlock.astro` : stockage legacy `pc-platform-progress-v2`.
- `src/pages/college/[niveau]/[matiere]/[chapitre].astro` et `src/pages/lycee/[niveau]/[matiere]/[chapitre].astro` : producteurs principaux de `chapterId` physique-chimie.
- `src/components/pedagogie/Dashboard.tsx` et `src/pages/index.astro` : affichage de progression globale par chapitre.
- `src/pages/mega-quiz.astro` et `src/pages/mega-flashcards.astro` : faibles risques aujourd'hui, mais à préserver tant qu'aucun stockage global n'y est introduit.

## 12. Prompt suivant recommandé

Cas A retenu : migration directe trop risquée.

Prompt conseillé :

```text
# Prompt 12 — Ajout non destructif des alias physique-chimie dans contentIds

Objectif : préparer les alias entre les IDs legacy physique-chimie et les IDs canoniques du helper central, sans utiliser ces alias dans les composants et sans migrer localStorage.

Contexte :
- RAPPORT_ALIAS_PROGRESSIONS_PHYSIQUE_CHIMIE.md recommande de ne pas modifier les IDs persistés directement.
- Les anciens IDs de chapitres physique-chimie utilisent le format college/{niveau}/{matiere}/{chapitre} ou lycee/{niveau}/{matiere}/{chapitre}.
- Le format cible est physique-chimie:{cycle}:{niveau}:{matiere}:{chapitre}.

Périmètre autorisé :
- Modifier uniquement src/utils/contentIds.ts.
- Lire RAPPORT_ALIAS_PROGRESSIONS_PHYSIQUE_CHIMIE.md et les rapports précédents.

Interdictions :
- Ne pas modifier les composants.
- Ne pas modifier les pages.
- Ne pas modifier les fichiers de contenu.
- Ne pas modifier localStorage.
- Ne pas modifier engine.ts, srs.ts, QuizPlayer.tsx, FlashcardsPlayer.tsx ou ExercicesPlayer.tsx.
- Ne pas changer les routes publiques.

Travail demandé :
1. Ajouter des fonctions pures permettant de construire les alias legacy d'un ID physique-chimie cible.
2. Ajouter des fonctions pures permettant de reconnaitre un ID legacy physique-chimie et de produire son ID cible.
3. Conserver LEGACY_CONTENT_ID_ALIASES non destructif.
4. Ne pas déclencher de migration.
5. Documenter brièvement que ces alias serviront à une future lecture compatible.

Vérifications :
- node scripts/verify-routes-and-content.mjs
- npm.cmd run build

Compte rendu final :
- fichiers modifiés ;
- fonctions ajoutées ;
- confirmation qu'aucun stockage local n'a été migré ;
- résultat du script de vérification ;
- résultat du build.
```
