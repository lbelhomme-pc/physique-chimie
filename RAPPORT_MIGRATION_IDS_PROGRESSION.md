# Rapport - Unification des identifiants et progression

## 1. Inventaire des identifiants

| Zone | Format observe | Risque | Decision |
|---|---|---|---|
| Routes Physique-Chimie | `/college/{niveau}/{matiere}/{chapitre}` et `/lycee/{niveau}/{matiere}/{chapitre}` | Faible | Conserver pour les URL publiques |
| Progression Physique-Chimie legacy | `college/{niveau}/{matiere}/{chapitre}` ou `lycee/{niveau}/{matiere}/{chapitre}` | Eleve | Alias vers `physique-chimie:{cycle}:{niveau}:{matiere}:{chapitre}` |
| Progression Mathematiques | `mathematiques:{cycle}:{niveau}:{chapitre}` | Faible | Conserver |
| Quiz local | `q1`, `quiz-1`, etc. | Eleve hors chapitre | Encapsuler dans `...:quiz:{questionId}` |
| Exercices local | `ex1`, `exercice-1`, etc. | Eleve hors chapitre | Encapsuler dans `...:exercise:{exerciseId}` |
| Flashcards local | `f1`, `fc-1`, etc. | Eleve hors chapitre | Encapsuler dans `...:flashcard:{flashcardId}` |
| SRS legacy | `{chapterId}::{cardId}` | Eleve | Migrer vers chapitre canonique + cle canonique de carte |
| Recompenses quiz | `quiz_reward_{chapterId}` | Eleve | Migrer vers `quiz_reward_{canonicalChapterId}` |
| Recompenses exercices | `exo_rewarded_{chapterId}` | Eleve | Migrer vers `exo_rewarded_{canonicalChapterId}` |
| Tous exercices | `exo_all_rewarded_{chapterId}` | Eleve | Migrer vers `exo_all_rewarded_{canonicalChapterId}` |
| Chapitre complet | `chapter_complete_{chapterId}` | Eleve | Migrer vers `chapter_complete_{canonicalChapterId}` |
| Laboratoire | `laboratoire:{slug}:simulation` | Faible | Verifier l'unicite au build |
| Analytics | Aucun identifiant de progression persistant specifique repere dans cette passe | Faible | Ne pas melanger avec la progression |

## 2. Format canonique

Le format cible est non ambigu :

```text
{discipline}:{cycle}:{niveau}:{matiere?}:{chapitre}:{type?}:{idLocal?}
```

Exemples :

```text
physique-chimie:college:4eme:chimie:atomes-molecules
physique-chimie:college:4eme:chimie:atomes-molecules:quiz:q1
physique-chimie:college:4eme:chimie:atomes-molecules:exercise:ex1
physique-chimie:college:4eme:chimie:atomes-molecules:flashcard:f1
mathematiques:lycee:2nde:fonctions-generalites
laboratoire:titrage-ph-metrique:simulation
```

## 3. Migration localStorage

La migration versionnee est `content_progress_migration_v1`.

Elle couvre :

- `gamification_state.progress` ;
- `srs_cards` ;
- `quiz_reward_*` ;
- `exo_rewarded_*` ;
- `exo_all_rewarded_*` ;
- `chapter_complete_*`.

Elle ne supprime pas les anciennes cles. Elle ecrit les cles canoniques et fusionne les donnees lorsque l'ancien et le nouveau format coexistent.

## 4. Strategie de fusion

| Donnee | Strategie |
|---|---|
| Flags de progression | `true` gagne sur `false` |
| Meilleur score quiz | Score maximal conserve |
| Total quiz | Total maximal conserve |
| Ratio flashcards | Ratio maximal conserve |
| Exercices recompenses | Union des IDs locaux |
| SRS repetitions | Maximum conserve |
| SRS intervalle | Maximum conserve |
| SRS dates | Date la plus recente conservee |
| SRS lapses | Minimum conserve |
| Donnees corrompues | Conflit journalise sans valeur sensible |

## 5. Validation

Le script `scripts/verify-routes-and-content.mjs` verifie maintenant l'unicite des IDs canoniques generes pour :

- chapitres ;
- cours ;
- quiz ;
- questions de quiz ;
- decks de flashcards ;
- flashcards ;
- exercices ;
- simulations laboratoire.

Les tests `tests/content-progress-migration.test.mjs` couvrent les migrations anciennes et partielles, la double execution, les collisions locales, les slugs identiques a plusieurs niveaux, les donnees corrompues et la fusion SRS.
