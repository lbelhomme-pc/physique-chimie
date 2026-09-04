# Versionnement des programmes scolaires

Ce document décrit le contrat introduit par la mission C09. Le site ne déduit jamais le programme applicable depuis l'année civile courante : le corpus publié est explicitement ciblé sur l'année scolaire `2026-2027` via `PUBLISHED_CONTENT_SCHOOL_YEAR`.

## Principe

`src/data/curriculumVersions.ts` est le registre autoritatif des versions de programmes. Chaque entrée associe une discipline, un cycle, un parcours, un ou plusieurs niveaux, une source officielle et une fenêtre d'application par niveau.

Lors de la normalisation d'un chapitre, `src/data/contentAdapters.ts` récupère son identifiant de source officielle et résout la version applicable pour l'année scolaire cible. Le contrat `ChapterContract` expose cette information dans `programmeVersion`. Une source absente du registre ou non applicable à l'année scolaire cible rend le chapitre bloquant au contrôle de contenu.

Le champ historique `programme` reste conservé pour compatibilité éditoriale ; il ne doit plus être utilisé pour décider de l'applicabilité réglementaire d'un contenu.

## Transitions enregistrées

| Enseignement / niveau | Dernière année de l'ancien programme | Première année du nouveau programme |
| --- | --- | --- |
| Mathématiques cycle 3 — 6e | 2024-2025 (programme 2020) | 2025-2026 (programme 2025) |
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

Les bornes du registre sont rattachées aux textes ministériels : BO n° 16 du 17 avril 2025 pour le programme de mathématiques du cycle 3 appliqué en 6e depuis 2025-2026, BO n° 10 du 5 mars 2026 pour le déploiement progressif des mathématiques au cycle 4, BO n° 24 du 11 juin 2026 pour le nouveau programme de Sciences et technologie du cycle 3, et BO n° 14 du 2 avril 2026 pour les nouveaux programmes de mathématiques du lycée. Les URL exactes de ces textes ainsi que celles des programmes encore applicables sont conservées dans `CURRICULUM_VERSIONS`.

## Invariants CI

`tests/curriculum-versions.test.mjs` vérifie les dates charnières, le format des années scolaires, l'absence de fenêtres invalides, la résolution de tout le corpus publié et l'injection de `programmeVersion` dans le contrat normalisé. Les routes, slugs, canoniques et identifiants de progression ne dépendent pas du versionnement et ne doivent pas être modifiés par ce mécanisme.


## Mission C25 — 4e et 3e

C25 publie un premier lot de mathématiques 4e et 3e en restant strictement sur le programme actuellement applicable à l'année scolaire 2026-2027 :

- 4e : programme cycle 4 publié en 2020 ; le programme 2026 ne devient applicable qu'en 2027-2028 ;
- 3e : programme cycle 4 publié en 2020 ; le programme 2026 ne devient applicable qu'en 2028-2029.

Les mappings du programme 2026 pour 4e et 3e sont enregistrés comme `future` avec zéro route publique et zéro chapitre actif. Ils servent uniquement à préparer la transition réglementaire.


## Mission C26 — Terminale spécialité, partie 1

Pour l'année scolaire 2026-2027, la Terminale spécialité reste rattachée au programme publié au BO spécial n° 8 du 25 juillet 2019 (NOR MENE1921246A). Le programme publié au BO n° 14 du 2 avril 2026 (NOR MENE2602919A) n'entre en application qu'à la rentrée 2027-2028.

Le slug public du niveau, `terminale-specialite-mathematiques`, est désormais un alias explicite de `terminale-spe` dans le registre curriculaire. Les deux identifiants résolvent les mêmes fenêtres réglementaires.

C26 publie la première moitié éditoriale du programme actuellement applicable :
- algèbre et géométrie ;
- suites ;
- limites de fonctions ;
- compléments sur la dérivation et convexité ;
- continuité et théorème des valeurs intermédiaires.

Le programme 2026 reste enregistré comme version future et n'alimente aucune route C26 en 2026-2027.


## Mission C27 — Terminale spécialité, partie 2 + bac

C27 complète le programme 2019 de Terminale spécialité pour l'année 2026-2027. Avec les 8 chapitres C26 et les 6 chapitres de programme C27, le corpus couvre les cinq grandes parties officielles : algèbre, analyse, géométrie, probabilités et algorithmique-programmation.

C27 ajoute également une ressource dédiée à la préparation de l'épreuve écrite de spécialité : 4 heures, coefficient 16 et quatre exercices indépendants dans la définition consolidée actuellement applicable.

La version de programme publiée en 2026 reste future jusqu'à la rentrée 2027-2028 et n'est utilisée par aucun chapitre C26/C27.
