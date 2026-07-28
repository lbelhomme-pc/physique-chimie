# Stockage local, progression et accessibilite

## Stockage local identifie

| Cle ou famille | Source | Usage |
|---|---|---|
| `site.analyticsConsent` | `src/config/site.ts`, `BaseLayout.astro` | consentement analytics |
| `gamification_state` | `src/utils/contentProgressMigration.ts` | progression et gamification |
| `pc-platform-progress-v1` | `src/components/pedagogie/progress.ts`, `src/utils/contentProgressMigration.ts` | progression pedagogique legacy |
| `pc-platform-progress-v2` | `src/components/pedagogie/QuizBlock.astro`, `src/components/pedagogie/FlashcardsBlock.astro`, `src/utils/contentProgressMigration.ts` | progression quiz/flashcards legacy |
| `srs_cards` | `src/utils/contentProgressMigration.ts` | revision espacee flashcards |
| `content_progress_migration_*` | `src/utils/contentIds.ts` | marqueur de migration |
| `quiz_reward_` | `src/utils/contentIds.ts` | recompenses quiz |
| `exo_rewarded_` | `src/utils/contentIds.ts` | recompenses exercices |
| `exo_all_rewarded_` | `src/utils/contentIds.ts` | recompenses exercices complets |
| `chapter_complete_` | `src/utils/contentIds.ts` | chapitres termines |
| `a11y_preferences` | `src/data/accessibility/a11y-engine.ts` | preferences DYS/accessibilite |

## Migration de progression

`src/utils/contentProgressMigration.ts` migre :

- progression de `gamification_state` ;
- progression legacy `pc-platform-progress-v1` et `pc-platform-progress-v2` vers `gamification_state` ;
- cles de recompense legacy vers IDs canoniques ;
- cartes SRS ;
- donnees corrompues avec conflit documente sans exposer le contenu sensible.
- candidats de future synchronisation limites a la cle source, l'ID canonique et le type, sans score ni champ libre.

Tests existants passes :

- migration sans suppression des cles legacy ;
- migration idempotente ;
- fusion SRS ;
- conservation stricte des anciennes cles ;
- absence de fuite de donnees dans les candidats de synchronisation ;
- corruption signalee sans fuite de donnees.

## Fonctions DYS et accessibilite recensees

Preferences disponibles :

- themes : clair, gris clair, gris, sombre, sepia, nuit, auto ;
- polices : standard, OpenDyslexic, Comic Sans, Verdana, Arial ;
- taille texte : normal, grand, tres grand ;
- interlignage : normal, aere, tres aere ;
- espacement lettres et mots ;
- largeur de ligne ;
- alignement ;
- regle de lecture ;
- surlignage des liens ;
- reduction des animations ;
- synthese vocale ;
- mode concentration ;
- curseur agrandi.

Profils predefinis :

- defaut ;
- dyslexie ;
- dyspraxie ;
- TDAH ;
- confort visuel.

Risques V3 :

- OpenDyslexic est charge depuis CDN dans `src/styles/design-system.css`.
- La valeur normale de letter-spacing est negative dans la V2.
- Les laboratoires et schemas doivent etre verifies pour alternatives accessibles.
