# Rapport d'audit des identifiants de progression, gamification, quiz et flashcards

## 1. Resume executif

Cet audit verifie les identifiants utilises par la progression, la gamification, les quiz, les flashcards, les exercices, les pages de memorisation globale, les mathematiques, les outils et le laboratoire.

Decision recommandee : ne pas reorganiser les dossiers de contenus avant d'avoir centralise la construction des identifiants et prepare une strategie d'alias pour les identifiants deja stockes dans le navigateur.

| Indicateur | Valeur |
|---|---:|
| Systemes d'identifiants analyses | 14 |
| Risques critiques | 0 |
| Risques majeurs | 4 |
| Risques moyens | 6 |
| Risques faibles | 2 |
| Collisions detectees sur identifiants complets namespaced | 0 |
| Commande de verification | `node scripts/verify-routes-and-content.mjs` |
| Resultat verification | 0 erreur, 0 avertissement |
| Commande de build | `npm.cmd run build` |
| Resultat build | succes, 225 pages generees |

Constat principal : les identifiants actuels fonctionnent dans l'arborescence presente, mais plusieurs sont derives directement des chemins, des slugs ou de textes de contenu. Une reorganisation sans couche d'alias pourrait perdre ou fragmenter la progression locale des eleves.

## 2. Systemes d'identifiants reperes

| Systeme | Fichiers concernes | Format actuel | Stockage ou usage | Risque |
|---|---|---|---|---|
| Chapitres physique-chimie | `src/pages/college/[niveau]/[matiere]/[chapitre].astro`, `src/pages/lycee/[niveau]/[matiere]/[chapitre].astro`, `src/pages/index.astro` | `college/{niveau}/{matiere}/{chapitre}`, `lycee/{niveau}/{matiere}/{chapitre}` | `gamification_state`, `srs_cards`, cles dynamiques localStorage | Majeur |
| Chapitres mathematiques | `src/data/mathematiques/paths.ts`, pages `src/pages/mathematiques/**/[chapitre].astro` | `mathematiques:{cycle}:{niveau}:{chapitre}` | `gamification_state`, `srs_cards`, progression chapitre | Moyen |
| Outils et methodes | `src/pages/outils-methodes/cours-python.astro` | `outils-methodes-cours-python` | QuizPlayer, FlashcardsPlayer, progression et SRS | Moyen |
| Questions de quiz | `src/data/chapters/**/quiz.json`, `src/data/mathematiques/chapters/**/quiz.json`, `src/components/pedagogie/QuizPlayer.tsx` | identifiant local de question, ex. `mesure-incertitudes-q01` | React key, affichage des resultats, score par chapitre | Moyen |
| Flashcards | `src/data/chapters/**/flashcards.json`, `src/data/mathematiques/chapters/**/flashcards.json`, `src/components/pedagogie/FlashcardsPlayer.tsx`, `src/data/gamification/srs.ts` | `card.id`, cle SRS `${chapterId}::${cardId}` | `srs_cards` | Majeur |
| Exercices | `src/data/chapters/**/exercices.json`, `src/data/mathematiques/chapters/**/exercices.json`, `src/components/pedagogie/ExercicesPlayer.tsx` | `exercice.id` | `exo_rewarded_${chapterId}`, `exo_all_rewarded_${chapterId}` | Moyen |
| Etat global de gamification | `src/data/gamification/engine.ts` | `progress[chapterId]` | `gamification_state` | Majeur |
| Bonus quotidien de quiz | `src/components/pedagogie/QuizPlayer.tsx` | `quiz_reward_${chapterId}` | localStorage | Moyen |
| Bonus de chapitre complet | `src/data/gamification/engine.ts` | `chapter_complete_${chapterId}` | localStorage | Moyen |
| Progression legacy v1 | `src/components/pedagogie/progress.ts` | `chapterKey` | `pc-platform-progress-v1` | Majeur |
| Progression legacy v2 | `src/components/pedagogie/QuizBlock.astro`, `src/components/pedagogie/FlashcardsBlock.astro` | `chapterKey` | `pc-platform-progress-v2` | Majeur |
| Badges, rangs et streaks | `src/data/gamification/config.ts`, `src/data/gamification/engine.ts` | ids fixes de badges et rangs | `gamification_state` | Faible |
| Mega-quiz et mega-flashcards | `src/pages/mega-quiz.astro`, `src/pages/mega-flashcards.astro`, `src/components/pedagogie/MegaQuizPlayer.tsx`, `src/components/pedagogie/MegaFlashcardsPlayer.tsx` | ids locaux de questions/cartes, sans `chapterId` persistant | filtrage et affichage global, pas de SRS persistant | Moyen |
| Laboratoire | `src/data/laboratoire/apps.ts`, `src/data/laboratoire/genericConfigs.ts`, `src/pages/laboratoire/[slug].astro` | `slug`, route `/laboratoire/{slug}` | routage et configuration, pas de progression locale detectee | Faible |

## 3. Analyse par systeme

### 3.1 Chapitres physique-chimie

| Point | Constat |
|---|---|
| Fichiers concernes | `src/pages/college/[niveau]/[matiere]/[chapitre].astro`, `src/pages/lycee/[niveau]/[matiere]/[chapitre].astro`, `src/pages/index.astro` |
| Format actuel | `college/{niveau}/{matiere}/{chapitre}` ou `lycee/{niveau}/{matiere}/{chapitre}` |
| Exemple reel | `college/4eme/chimie/atomes-molecules` |
| Donnees liees | cours, quiz, flashcards, exercices, completion de chapitre |
| Stockage navigateur | `gamification_state`, `srs_cards`, `quiz_reward_${chapterId}`, `chapter_complete_${chapterId}`, `exo_rewarded_${chapterId}` |
| Risque principal | L'identifiant depend directement de segments de dossiers et d'URL. |
| Conclusion | A conserver temporairement, mais a encapsuler avant toute reorganisation. |

### 3.2 Chapitres mathematiques

| Point | Constat |
|---|---|
| Fichiers concernes | `src/data/mathematiques/paths.ts`, `src/pages/mathematiques/college/[niveau]/[chapitre].astro`, `src/pages/mathematiques/lycee/[niveau]/[chapitre].astro` |
| Format actuel | `mathematiques:{cycle}:{niveau}:{chapitre}` |
| Exemple reel | `mathematiques:lycee:2nde:fonctions-generalites` |
| Donnees liees | cours MDX, quiz, flashcards, exercices |
| Stockage navigateur | potentiellement `gamification_state` et `srs_cards` via les composants pedagogiques |
| Risque principal | Convention plus robuste que la physique-chimie, mais differente. |
| Conclusion | Bonne base pour une convention cible namespaced. |

### 3.3 Outils et methodes

| Point | Constat |
|---|---|
| Fichiers concernes | `src/pages/outils-methodes/cours-python.astro` |
| Format actuel | `outils-methodes-cours-python` |
| Exemple reel | `outils-methodes-cours-python` |
| Donnees liees | quiz Python, flashcards Python |
| Stockage navigateur | `gamification_state`, `srs_cards`, `quiz_reward_${chapterId}` |
| Risque principal | Identifiant hors convention de chapitre et non namespace par separateur stable. |
| Conclusion | Fonctionne, mais devrait etre transforme plus tard par helper en `outils-methodes:cours-python`. |

### 3.4 Questions de quiz

| Point | Constat |
|---|---|
| Fichiers concernes | `src/data/chapters/**/quiz.json`, `src/data/mathematiques/chapters/**/quiz.json`, `src/components/pedagogie/QuizPlayer.tsx` |
| Format actuel | ids locaux dans chaque `quiz.json` |
| Exemples reels | `mesure-incertitudes-q01`, `ph-q10` |
| Donnees liees | question, options, reponse, explication |
| Stockage navigateur | pas de stockage par question detecte dans `QuizPlayer.tsx`; score stocke par chapitre |
| Risque principal | Des ids bruts sont dupliques entre chapitres, sans collision si le chapitre reste dans la cle composee. |
| Conclusion | Ne jamais utiliser l'id brut seul pour une progression globale. |

### 3.5 Flashcards et SRS

| Point | Constat |
|---|---|
| Fichiers concernes | `src/data/chapters/**/flashcards.json`, `src/data/mathematiques/chapters/**/flashcards.json`, `src/components/pedagogie/FlashcardsPlayer.tsx`, `src/data/gamification/srs.ts` |
| Format actuel | `card.id`, puis cle composee `${chapterId}::${cardId}` |
| Exemple reel | `mesure-incertitudes-f01` |
| Donnees liees | recto, verso, date de revision, facilite, intervalle, repetitions |
| Stockage navigateur | `srs_cards` |
| Risque principal | Tout changement de `chapterId` ou de `card.id` cree une nouvelle carte SRS et masque l'historique precedent. |
| Conclusion | Tres sensible aux migrations de chemins et aux renommages d'ids de cartes. |

### 3.6 Exercices

| Point | Constat |
|---|---|
| Fichiers concernes | `src/data/chapters/**/exercices.json`, `src/data/mathematiques/chapters/**/exercices.json`, `src/components/pedagogie/ExercicesPlayer.tsx` |
| Format actuel | `exercice.id` local au chapitre |
| Exemples reels | `energie-exo-1`, `mesure-incertitudes-exo-1` |
| Donnees liees | enonces, reponses, correction, bonus d'exercice |
| Stockage navigateur | `exo_rewarded_${chapterId}`, `exo_all_rewarded_${chapterId}` |
| Risque principal | Des ids bruts sont dupliques entre chapitres, mais le stockage actuel les separe par `chapterId`. |
| Conclusion | Risque contenu si le couple `chapterId + exercice.id` reste stable. |

### 3.7 Etat global de gamification

| Point | Constat |
|---|---|
| Fichier concerne | `src/data/gamification/engine.ts` |
| Format actuel | objet `UserState.progress` indexe par `chapterId` |
| Stockage navigateur | `gamification_state` |
| Donnees liees | XP, rang, badges, streak, completion cours/quiz/flashcards/exercices |
| Risque principal | La progression durable depend de l'identifiant de chapitre exact. |
| Conclusion | Toute migration doit prevoir des alias ou une migration localStorage. |

### 3.8 Bonus quotidien de quiz

| Point | Constat |
|---|---|
| Fichier concerne | `src/components/pedagogie/QuizPlayer.tsx` |
| Format actuel | `quiz_reward_${chapterId}` |
| Stockage navigateur | localStorage |
| Donnees liees | date, score, total |
| Risque principal | Changement de `chapterId` permettrait de redonner un bonus deja accorde. |
| Conclusion | A migrer avec les identifiants de chapitre si les chemins changent. |

### 3.9 Bonus de chapitre complet

| Point | Constat |
|---|---|
| Fichier concerne | `src/data/gamification/engine.ts` |
| Format actuel | `chapter_complete_${chapterId}` |
| Stockage navigateur | localStorage |
| Donnees liees | attribution unique du bonus de chapitre |
| Risque principal | Changement de `chapterId` peut dupliquer un bonus de completion. |
| Conclusion | A proteger par helper de cle de stockage. |

### 3.10 Progression legacy v1

| Point | Constat |
|---|---|
| Fichier concerne | `src/components/pedagogie/progress.ts` |
| Format actuel | `chapterKey` dans `pc-platform-progress-v1` |
| Stockage navigateur | `pc-platform-progress-v1` |
| Donnees liees | XP total, progression par chapitre, flashcards vues |
| Risque principal | Deuxieme source de progression coexistante avec `gamification_state`. |
| Conclusion | Audit de depreciation ou migration necessaire avant refonte large. |

### 3.11 Progression legacy v2

| Point | Constat |
|---|---|
| Fichiers concernes | `src/components/pedagogie/QuizBlock.astro`, `src/components/pedagogie/FlashcardsBlock.astro` |
| Format actuel | `chapterKey` dans `pc-platform-progress-v2` |
| Stockage navigateur | `pc-platform-progress-v2` |
| Donnees liees | score quiz, revision flashcards, XP |
| Risque principal | Logique dupliquee avec l'etat moderne de gamification. |
| Conclusion | Zone a stabiliser avant migration de composants pedagogiques. |

### 3.12 Badges, rangs et streaks

| Point | Constat |
|---|---|
| Fichiers concernes | `src/data/gamification/config.ts`, `src/data/gamification/engine.ts`, `src/data/gamification/useGamification.ts` |
| Format actuel | ids fixes de badges et rangs, notifications temporaires `xp-${Date.now()}` |
| Stockage navigateur | `gamification_state` |
| Donnees liees | badges debloques, XP, rang, streak |
| Risque principal | Les ids de badges et rangs sont stables; le risque vient surtout des conditions liees aux chapitres. |
| Conclusion | Risque faible si les ids de badges et rangs ne sont pas renommes. |

### 3.13 Mega-quiz et mega-flashcards

| Point | Constat |
|---|---|
| Fichiers concernes | `src/pages/mega-quiz.astro`, `src/pages/mega-flashcards.astro`, `src/components/pedagogie/MegaQuizPlayer.tsx`, `src/components/pedagogie/MegaFlashcardsPlayer.tsx` |
| Format actuel | ids locaux de questions et cartes agreges sans identifiant complet de chapitre |
| Stockage navigateur | aucun stockage de progression detecte pour ces pages globales |
| Donnees liees | filtres par niveau, matiere, titre de chapitre |
| Risque principal | Si une progression globale est ajoutee plus tard, les ids bruts ne suffiront pas. |
| Conclusion | Ajouter un identifiant source complet avant toute persistance future. |

### 3.14 Laboratoire

| Point | Constat |
|---|---|
| Fichiers concernes | `src/data/laboratoire/apps.ts`, `src/data/laboratoire/genericConfigs.ts`, `src/pages/laboratoire/[slug].astro` |
| Format actuel | `slug`, route `/laboratoire/{slug}` |
| Exemple reel | les slugs definis dans `src/data/laboratoire/apps.ts` |
| Stockage navigateur | pas de progression locale detectee pour le laboratoire |
| Risque principal | Risque limite actuellement, mais les slugs sont routes publiques. |
| Conclusion | Ne pas renommer les slugs sans audit dedie. |

## 4. Stockages navigateur identifies

| Cle localStorage/sessionStorage | Fichier | Donnees stockees | Depend de | Risque si migration |
|---|---|---|---|---|
| `gamification_state` | `src/data/gamification/engine.ts` | XP, rang, badges, streak, `progress[chapterId]` | `chapterId` | Perte ou fragmentation de progression |
| `srs_cards` | `src/data/gamification/srs.ts` | cartes SRS indexees par `${chapterId}::${cardId}` | `chapterId`, `cardId` | Perte d'historique de revision |
| `chapter_complete_${chapterId}` | `src/data/gamification/engine.ts` | bonus unique de chapitre complet | `chapterId` | Bonus duplicable apres changement d'id |
| `quiz_reward_${chapterId}` | `src/components/pedagogie/QuizPlayer.tsx` | bonus quotidien de quiz | `chapterId` | Bonus duplicable ou historique ignore |
| `exo_rewarded_${chapterId}` | `src/components/pedagogie/ExercicesPlayer.tsx` | ids d'exercices deja recompenses | `chapterId`, `exercice.id` | Recompenses d'exercices reattribuees |
| `exo_all_rewarded_${chapterId}` | `src/components/pedagogie/ExercicesPlayer.tsx` | bonus complet des exercices | `chapterId` | Bonus complet reattribue |
| `pc-platform-progress-v1` | `src/components/pedagogie/progress.ts` | progression legacy par `chapterKey` | `chapterKey` | Source de verite concurrente |
| `pc-platform-progress-v2` | `src/components/pedagogie/QuizBlock.astro`, `src/components/pedagogie/FlashcardsBlock.astro` | quiz et flashcards legacy | `chapterKey` | Source de verite concurrente |
| `a11y_preferences` | `src/data/accessibility/a11y-engine.ts` | preferences d'accessibilite | aucun chapitre | Hors progression, risque faible |

Aucun usage significatif de `sessionStorage` n'a ete repere pour la progression, les quiz, les flashcards ou la gamification.

## 5. Identifiants de chapitre

| Domaine | Format actuel | Exemple | Utilisations | Evaluation |
|---|---|---|---|---|
| Physique-chimie college | `college/{niveau}/{matiere}/{chapitre}` | `college/4eme/chimie/atomes-molecules` | pages de chapitre, dashboard, progression, SRS | Stable tant que dossiers et routes ne changent pas |
| Physique-chimie lycee | `lycee/{niveau}/{matiere}/{chapitre}` | `lycee/terminale-spe/chimie/acide-base-ph` | pages de chapitre, dashboard, progression, SRS | Stable tant que dossiers et routes ne changent pas |
| Mathematiques college | `mathematiques:college:{niveau}:{chapitre}` | `mathematiques:college:4eme:proportionnalite` | pages mathematiques, progression potentielle | Plus namespaced |
| Mathematiques lycee | `mathematiques:lycee:{niveau}:{chapitre}` | `mathematiques:lycee:2nde:fonctions-generalites` | pages mathematiques, progression potentielle | Plus namespaced |
| Outils et methodes | chaine ad hoc | `outils-methodes-cours-python` | quiz et flashcards Python | A normaliser plus tard |

## 6. Identifiants de quiz

| Source | Nombre approx. | Format | Duplicats bruts reperes | Collision sur cle complete |
|---|---:|---|---:|---:|
| `src/data/chapters/**/quiz.json` | 1118 questions | ids locaux | 7 | 0 |
| `src/data/mathematiques/chapters/**/quiz.json` | inclus dans le total | ids locaux ou generes | inclus | 0 |

Exemples de duplicats bruts reperes :

| Id brut | Chemins concernes | Risque |
|---|---|---|
| `ph-q10` | `src/data/chapters/college/3eme/chimie/ph/quiz.json`, `src/data/chapters/lycee/terminale-spe/physique/lumiere-flux-photons/quiz.json` | Faible actuellement, moyen si l'id brut devient global |
| `mesure-incertitudes-q01` a `mesure-incertitudes-q06` | `src/data/chapters/lycee/1ere-spe/physique/mesure-incertitudes/quiz.json`, `src/data/chapters/lycee/2nde/physique/mesure-incertitudes/quiz.json` | Faible actuellement, moyen si l'id brut devient global |

Conclusion : les ids de quiz peuvent rester locaux, mais toute persistance future doit utiliser une cle composee incluant le chapitre et le type de ressource.

## 7. Identifiants de flashcards

| Source | Nombre approx. | Format | Duplicats bruts reperes | Collision sur cle SRS actuelle |
|---|---:|---|---:|---:|
| `src/data/chapters/**/flashcards.json` | 1062 cartes | ids locaux | 5 | 0 |
| `src/data/mathematiques/chapters/**/flashcards.json` | inclus dans le total | ids locaux ou generes | inclus | 0 |

Exemples de duplicats bruts reperes :

| Id brut | Chemins concernes | Risque |
|---|---|---|
| `mesure-incertitudes-f01` a `mesure-incertitudes-f05` | `src/data/chapters/lycee/1ere-spe/physique/mesure-incertitudes/flashcards.json`, `src/data/chapters/lycee/2nde/physique/mesure-incertitudes/flashcards.json` | Faible actuellement, majeur si `chapterId` change sans migration SRS |

Conclusion : le SRS est correctement compose par chapitre et carte, mais il est tres sensible aux changements d'identifiant de chapitre.

## 8. Identifiants d'exercices

| Source | Nombre approx. | Format | Duplicats bruts reperes | Collision sur cle complete |
|---|---:|---|---:|---:|
| `src/data/chapters/**/exercices.json` | 797 exercices | ids locaux | 8 | 0 |
| `src/data/mathematiques/chapters/**/exercices.json` | inclus dans le total | ids locaux ou generes | inclus | 0 |

Exemples de duplicats bruts reperes :

| Id brut | Chemins concernes | Risque |
|---|---|---|
| `energie-exo-1` a `energie-exo-4` | `src/data/chapters/college/5eme/physique/energie-stocks-transferts/exercices.json`, `src/data/chapters/lycee/1ere-spe/physique/energie-electrique-mecanique/exercices.json` | Moyen si une vue globale recompense par id brut |
| `mesure-incertitudes-exo-1` a `mesure-incertitudes-exo-4` | `src/data/chapters/lycee/1ere-spe/physique/mesure-incertitudes/exercices.json`, `src/data/chapters/lycee/2nde/physique/mesure-incertitudes/exercices.json` | Moyen si une vue globale recompense par id brut |

Conclusion : le stockage actuel separe les exercices par chapitre, mais une convention explicite `chapterId + exerciceId` doit etre imposee.

## 9. Identifiants mathematiques

| Point | Constat |
|---|---|
| Helper principal | `src/data/mathematiques/paths.ts` |
| Fonction cle | `getMathematicsChapterId(cycle, niveau, chapitre)` |
| Format | `mathematiques:{cycle}:{niveau}:{chapitre}` |
| Contenus | `src/data/mathematiques/content.ts`, `src/data/mathematiques/chapters/**` |
| Particularite | certains ids de ressources peuvent etre generes depuis le texte si absents |
| Risque | un changement de texte peut changer l'id genere et donc l'historique futur |

Conclusion : la convention de chapitre mathematique est plus explicite que celle de physique-chimie, mais les ids de ressources doivent devenir explicites si ces contenus participent durablement a la progression.

## 10. Risques identifies

| Id | Risque | Gravite | Chemins concernes | Impact | Correction recommandee |
|---|---|---|---|---|---|
| R01 | Les `chapterId` physique-chimie sont derives des chemins | Majeur | `src/pages/college/[niveau]/[matiere]/[chapitre].astro`, `src/pages/lycee/[niveau]/[matiere]/[chapitre].astro` | Perte de progression si dossier, niveau, matiere ou chapitre change | Creer un helper central et une table d'alias |
| R02 | Le SRS depend de `${chapterId}::${cardId}` | Majeur | `src/data/gamification/srs.ts`, `src/components/pedagogie/FlashcardsPlayer.tsx` | Historique de revision masque apres migration | Prevoir migration `srs_cards` avant tout changement d'id |
| R03 | Plusieurs stockages de progression coexistent | Majeur | `gamification_state`, `pc-platform-progress-v1`, `pc-platform-progress-v2` | Sources de verite concurrentes | Auditer puis deprecier ou migrer les stockages legacy |
| R04 | Les ids bruts de quiz, exercices et flashcards ne sont pas globalement uniques | Moyen | `src/data/chapters/**`, `src/data/mathematiques/chapters/**` | Collision si un ecran global persiste par id brut | Interdire l'usage d'id brut seul |
| R05 | Certains ids mathematiques de ressources peuvent etre generes depuis le texte | Majeur | `src/data/mathematiques/content.ts` | Changement de texte = changement d'id | Rendre les ids explicites pour les contenus persistants |
| R06 | Mega-quiz et mega-flashcards agregent sans `chapterId` persistant | Moyen | `src/pages/mega-quiz.astro`, `src/pages/mega-flashcards.astro` | Progression globale future difficile a fiabiliser | Ajouter une source complete avant toute persistance |
| R07 | Les cles localStorage dynamiques contiennent directement les `chapterId` | Moyen | `QuizPlayer.tsx`, `ExercicesPlayer.tsx`, `engine.ts` | Migration et debug difficiles | Centraliser les cles de stockage |
| R08 | L'identifiant `outils-methodes-cours-python` est ad hoc | Moyen | `src/pages/outils-methodes/cours-python.astro` | Collision future possible avec d'autres outils | Cible future `outils-methodes:cours-python` |
| R09 | Le dashboard principal est physique-chimie, mais le SRS est global | Moyen | `src/pages/index.astro`, `src/components/dashboard/Dashboard.tsx`, `src/data/gamification/srs.ts` | Les compteurs peuvent melanger des espaces pedagogiques | Namespacer et filtrer explicitement par domaine |
| R10 | Les slugs de laboratoire sont des routes publiques | Faible | `src/data/laboratoire/apps.ts`, `src/pages/laboratoire/[slug].astro` | Renommage de slug casserait une route | Ne pas renommer sans audit route/SEO |
| R11 | Les ids de badges et rangs sont stables mais stockes durablement | Faible | `src/data/gamification/config.ts`, `src/data/gamification/engine.ts` | Renommage futur casserait les badges acquis | Ne pas renommer les ids publics de gamification |
| R12 | Aucune collision sur cle complete n'a ete reperee aujourd'hui | Faible | audit global JSON | Risque actuel faible | Maintenir un controle automatique |

## 11. Convention cible recommandee

### 11.1 Identifiants de chapitre

| Domaine | Convention cible proposee | Exemple |
|---|---|---|
| Physique-chimie | `physique-chimie:{cycle}:{niveau}:{matiere}:{chapitre}` | `physique-chimie:college:4eme:chimie:atomes-molecules` |
| Mathematiques | `mathematiques:{cycle}:{niveau}:{chapitre}` | `mathematiques:lycee:2nde:fonctions-generalites` |
| Laboratoire | `laboratoire:{slug}` | `laboratoire:oscilloscope` |
| Outils et methodes | `outils-methodes:{slug}` | `outils-methodes:cours-python` |
| Memorisation globale | `memorisation:{type}:{sourceId}` | `memorisation:mega-quiz:physique-chimie:college:4eme:chimie:atomes-molecules` |

### 11.2 Identifiants de ressources

| Ressource | Convention cible proposee | Exemple |
|---|---|---|
| Cours | `{chapterId}:cours` | `physique-chimie:college:4eme:chimie:atomes-molecules:cours` |
| Question de quiz | `{chapterId}:quiz:{questionId}` | `physique-chimie:college:4eme:chimie:atomes-molecules:quiz:q01` |
| Flashcard | `{chapterId}:flashcard:{cardId}` | `physique-chimie:college:4eme:chimie:atomes-molecules:flashcard:f01` |
| Exercice | `{chapterId}:exercice:{exerciceId}` | `physique-chimie:college:4eme:chimie:atomes-molecules:exercice:e01` |
| Simulation | `laboratoire:{slug}:simulation` | `laboratoire:oscilloscope:simulation` |

### 11.3 Regles cible

- Un id persistant ne doit jamais dependre d'un chemin filesystem brut sans passer par un helper central.
- Un id de ressource ne doit jamais etre utilise seul en progression globale.
- Les anciens ids doivent rester lisibles via une table d'alias pendant une periode de migration.
- Les valeurs de routes publiques et les valeurs d'identifiants persistants doivent etre reliees, mais pas confondues.
- Les ids de contenus mathematiques persistants doivent etre explicites, pas derives de textes pedagogiques.

## 12. Table de decision avant reorganisation

| Sujet | Decision recommandee maintenant | Raison |
|---|---|---|
| Corriger les contenus existants | Non | Aucun conflit critique actuel sur cle complete |
| Renommer les dossiers | Non | Les `chapterId` physique-chimie dependent encore des chemins |
| Renommer les ids de quiz/flashcards/exercices | Non | Cela casserait potentiellement l'historique local |
| Ajouter un helper central d'identifiants | Oui | Preparation indispensable avant migration |
| Ajouter une table d'alias anciens ids -> ids cibles | Oui | Necessaire pour proteger la progression locale |
| Migrer localStorage tout de suite | A etudier | A faire seulement apres helper et table d'alias |
| Unifier les stockages legacy | A etudier | Audit dedie recommande |
| Ajouter un controle automatique d'unicite composee | Oui | Filet de securite utile et peu invasif |

## 13. Sequence de securisation recommandee

| Ordre | Migration future | Risque | Dependances |
|---:|---|---|---|
| 1 | Documenter la convention cible d'identifiants | Faible | Ce rapport |
| 2 | Creer un helper central de construction d'ids sans changer les ids produits | Faible | Tests de non-regression |
| 3 | Ajouter des controles d'unicite composee pour quiz, flashcards et exercices | Faible | Script de verification existant |
| 4 | Creer une table d'alias pour les futurs ids namespaced | Moyen | Inventaire complet des chapitres |
| 5 | Migrer progressivement les consommateurs vers le helper | Moyen | Helper central, build vert |
| 6 | Migrer ou deprecier les stockages legacy v1/v2 | Majeur | Audit dedie des usages legacy |
| 7 | Appliquer une migration localStorage versionnee si les ids changent | Majeur | Alias valides et tests navigateur |
| 8 | Reorganiser les dossiers seulement apres stabilisation des ids | Majeur | Helper, alias, verification, build |

## 14. Verification effectuee

| Verification | Resultat |
|---|---|
| `node scripts/verify-routes-and-content.mjs` | succes, 17102 controles, 0 erreur, 0 avertissement |
| `npm.cmd run build` | succes, 225 pages generees |
| Script de test dans `package.json` | aucun script `test` defini |

## 15. Prochain prompt conseille

Prochain prompt recommande : creation d'un helper centralise d'identifiants sans migration des contenus existants.

Objectif du prochain prompt :

- creer une petite API d'identifiants stable ;
- reproduire exactement les identifiants actuels dans un premier temps ;
- ajouter des fonctions de composition pour les ressources ;
- ajouter ou etendre un controle automatique sans modifier les contenus ;
- ne pas migrer localStorage ;
- ne pas renommer les dossiers ;
- ne pas changer les routes publiques.

Decision finale : audit uniquement, aucune correction de contenu ou de code appliquee.
