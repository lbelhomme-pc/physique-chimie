# Rapport prompt 23 - Progression et migration du stockage V3

Date : 2026-07-28

Prompt execute : `docs/refonte-v3/prompts/23-progression-migration-stockage.md`

## Sources lues

- `docs/refonte-v3/README.md`
- `docs/refonte-v3/00-resume-executif.md`
- `docs/refonte-v3/prompts/23-progression-migration-stockage.md`
- `src/components/pedagogie/progress.ts`
- `src/utils/contentIds.ts`
- `src/utils/contentProgressMigration.ts`
- `src/data/gamification/engine.ts`
- `src/data/gamification/srs.ts`
- `tests/content-progress-migration.test.mjs`
- `docs/refonte-v3/reference/stockage-accessibilite.md`

## Livrables produits

- Migration centralisee des anciens stores `pc-platform-progress-v1` et `pc-platform-progress-v2` vers `gamification_state`.
- Conservation stricte des anciennes cles localStorage : aucune suppression automatique n'est introduite.
- Fusion monotone des progressions : cours, quiz, flashcards, exercices, meilleurs scores, ratios flashcards et XP sont preserves au maximum connu.
- Preparation d'une future synchronisation par `syncCandidates`, limitee a `storageKey`, `canonicalId` et `kind`, sans valeurs de progression ni donnees libres.
- Lecture alias legacy/canonique dans `src/components/pedagogie/progress.ts`, avec total XP dedoublonne par chapitre canonique.
- Tests de migration renforces pour legacy vers canonique, idempotence, corruption, SRS, absence de fuite et non-suppression.

## Scenarios passes

| Scenario | Resultat | Preuve |
| --- | --- | --- |
| Progression physique-chimie legacy vers ID canonique | Les entrees `college/...` sont fusionnees vers `physique-chimie:...`. | `tests/content-progress-migration.test.mjs` |
| Stores `pc-platform-progress-v1` et `pc-platform-progress-v2` | Les donnees sont copiees/fusionnees vers `gamification_state`, les stores sources restent presents. | Test "legacy pedagogical progress stores..." |
| Idempotence | Deux executions successives donnent le meme snapshot localStorage. | Test "migration is idempotent..." |
| Scores et XP | Les meilleurs scores, totaux, ratios et XP ne sont jamais abaisses par la migration. | `mergeProgressEntries`, `normalizeLegacyPedagogieProgressEntry` |
| SRS | Les cartes legacy et canoniques sont fusionnees avec meilleurs intervalles/dates. | Test "SRS migration merges..." |
| Corruption | Les JSON illisibles sont signales sans exposer leur contenu. | Test "corrupted local data..." |
| Future synchro | Les candidats de synchro ne contiennent pas `quizScore`, `totalXp` ni champs libres. | Assertion sur `syncCandidates` |
| Zero suppression | Le migrateur ne depend pas de `removeItem` et les tests verifient que les cles legacy restent presentes. | Interface `ContentProgressStorage`, tests |

## Validation

- `npm.cmd test` : OK, 174 tests passes.
- `npm.cmd run build` : OK, 314 pages generees.

## Procedure de retour arriere

Desactiver l'appel a `migrateLegacyPedagogieProgressStores` dans `src/utils/contentProgressMigration.ts`. Les anciennes cles et stores etant conserves, les donnees utilisateur restent disponibles dans leur emplacement legacy.

## Notes par critere

| Critere | Note | Justification |
| --- | ---: | --- |
| Architecture et maintenabilite | 9.2/10 | La migration reste centralisee dans `contentProgressMigration.ts`, avec `progress.ts` limite a la lecture/ecriture locale legacy et aux alias. |
| UX, UI et coherence du design | 9.0/10 | Aucun changement visuel direct ; les etats de progression restent coherents car les alias evitent les doubles chapitres et les pertes d'XP. |
| Qualite pedagogique et scientifique | 9.1/10 | Scores, progression de cours, quiz, flashcards et SRS sont preserves sans modifier les contenus pedagogiques. |
| Accessibilite et DYS | 9.0/10 | Pas d'impact d'interface ; la migration n'ajoute aucune interaction ni preference susceptible de degrader l'accessibilite. |
| Qualite technique globale | 9.2/10 | Corruption geree sans fuite de valeurs, candidats de synchro minimaux, build complet valide. |
| Completude, migration et validation | 9.4/10 | Legacy vers canonique, idempotence, SRS, corruption, absence de suppression et build sont couverts par tests et commandes obligatoires. |

