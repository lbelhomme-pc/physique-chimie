# Versionnement des programmes scolaires

Ce document décrit le contrat introduit par la mission C09. Le site ne déduit jamais le programme applicable depuis l'année civile courante : le corpus publié est explicitement ciblé sur l'année scolaire `2026-2027` via `PUBLISHED_CONTENT_SCHOOL_YEAR`.

## Principe

`src/data/curriculumVersions.ts` est le registre autoritatif des versions de programmes. Chaque entrée associe une discipline, un cycle, un parcours, un ou plusieurs niveaux, une source officielle et une fenêtre d'application par niveau.

Lors de la normalisation d'un chapitre, `src/data/contentAdapters.ts` récupère son identifiant de source officielle et résout la version applicable pour l'année scolaire cible. Le contrat `ChapterContract` expose cette information dans `programmeVersion`. Une source absente du registre ou non applicable à l'année scolaire cible rend le chapitre bloquant au contrôle de contenu.

Le champ historique `programme` reste conservé pour compatibilité éditoriale ; il ne doit plus être utilisé pour décider de l'applicabilité réglementaire d'un contenu.

## Transitions enregistrées

| Enseignement / niveau | Dernière année de l'ancien programme | Première année du nouveau programme |
| --- | --- | --- |
| Mathématiques cycle 4 — 5e | 2025-2026 | 2026-2027 |
| Mathématiques cycle 4 — 4e | 2026-2027 | 2027-2028 |
| Mathématiques cycle 4 — 3e | 2027-2028 | 2028-2029 |
| Sciences et technologie — 6e | 2026-2027 (programme 2023) | 2027-2028 (programme 2026) |
| Mathématiques — Seconde GT | 2025-2026 | 2026-2027 |
| Mathématiques — Première spécialité | 2025-2026 | 2026-2027 |
| Mathématiques intégrées à l'enseignement scientifique — Première | 2025-2026 | 2026-2027 |
| Mathématiques — Terminale spécialité | 2026-2027 | 2027-2028 |
| Mathématiques complémentaires — Terminale | 2026-2027 | 2027-2028 |

Les programmes de Physique-Chimie du cycle 4 et du lycée actuellement présents dans le site restent rattachés à leurs versions 2020/2019 tant qu'aucun texte officiel ne les remplace. L'Enseignement scientifique reste rattaché aux programmes 2023 actuellement utilisés par le corpus.

L'enregistrement d'une version future dans le registre n'implique pas que les contenus correspondants sont déjà publiés. Les missions de couverture de contenu restent indépendantes.

## Références réglementaires de transition

Les bornes du registre sont rattachées aux textes ministériels : BO n° 10 du 5 mars 2026 pour le déploiement progressif des mathématiques au cycle 4, BO n° 24 du 11 juin 2026 pour le nouveau programme de Sciences et technologie du cycle 3, et BO n° 14 du 2 avril 2026 pour les nouveaux programmes de mathématiques du lycée. Les URL exactes de ces textes ainsi que celles des programmes encore applicables sont conservées dans `CURRICULUM_VERSIONS`.

## Invariants CI

`tests/curriculum-versions.test.mjs` vérifie les dates charnières, le format des années scolaires, l'absence de fenêtres invalides, la résolution de tout le corpus publié et l'injection de `programmeVersion` dans le contrat normalisé. Les routes, slugs, canoniques et identifiants de progression ne dépendent pas du versionnement et ne doivent pas être modifiés par ce mécanisme.
