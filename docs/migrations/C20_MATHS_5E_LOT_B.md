# C20 — Mathématiques 5e — lot B

## CONTEXTE / COMMIT DE DÉPART

- Dépôt : `lbelhomme-pc/physique-chimie`
- Branche : `audit-2026-c01-route-snapshot`
- Base : C19 validé, commit `f4bf3717140f73b54b10eee066b1d0ffa72d56f0`.
- Mission : terminer le corpus Mathématiques 5e et autoriser sa publication.

## OBJECTIF UNIQUE

Compléter les 13 chapitres 5e avec le niveau N3, les quiz, les flashcards et un premier lot ciblé de figures accessibles, puis publier le niveau sans modifier les routes canoniques ni les identifiants du socle C19.

## PROGRAMME OFFICIEL DE RÉFÉRENCE

- Bulletin officiel n° 10 du 5 mars 2026.
- NOR `MENE2602912A`.
- Application en 5e : rentrée 2026-2027.
- Source : `https://www.education.gouv.fr/bo/2026/Hebdo10/MENE2602912A`.

## LIVRABLES

- 13 fichiers `exercices-n3.json`, avec deux problèmes N3 corrigés par chapitre : 26 N3.
- 5 questions de quiz par chapitre : 65 questions.
- 6 flashcards essentielles par chapitre : 78 cartes.
- 6 figures SVG ciblées, intégrées aux exercices qui en ont réellement besoin, avec `schemaAlt` et `schemaCaption`.
- chargement conjoint des exercices C19 et C20 dans la page chapitre ;
- passage du niveau 5e de `planned` à `available` ;
- passage des 13 chapitres de `noindex:true` à `noindex:false` ;
- ajout des 14 routes publiques 5e au snapshot de distribution.

## FRONTIÈRE FIGURES

C20 ne réalise pas la migration systématique des figures mathématiques vers LaTeX/TikZ/PGFPlots. Les six SVG ajoutés sont des schémas locaux accessibles nécessaires aux exercices N3. La migration générale et le moteur réutilisable restent réservés à C30-C31.

## GARDE-FOUS

`tests/math-5e-bo2026-c20.test.mjs` vérifie les volumes de ressources, les corrections, les IDs, les réponses de quiz, l'accessibilité et la sûreté des SVG, l'activation publique, les routes et l'absence de notions explicitement hors périmètre 5e.

Le test C19 a été réduit à ses invariants durables : source officielle, 13 chapitres, cours, N1/N2 et mapping BO. Il ne bloque plus les extensions prévues par C20.

Deux tests transversaux hérités supposaient encore que la Seconde était le seul niveau Mathématiques publié. Ils ont été mis à jour pour attendre la 5e et la 2nde tout en continuant à exclure tous les niveaux `planned`.

## MIGRATION / RETOUR ARRIÈRE

C20 préserve tous les slugs, routes canoniques et IDs des exercices C19. Retour arrière global : revenir au commit C19 `f4bf3717140f73b54b10eee066b1d0ffa72d56f0`.

## VALIDATION CI

Commit fonctionnel certifié avant clôture documentaire : `c09780f099eea55bda5cf87fee113393e561f00b`.

Workflow GitHub Actions : run `33621161347`, conclusion `success`.

- `quality` : SUCCESS ;
- `dist-fast` : SUCCESS ;
- `dist-a11y` : SUCCESS.

La suite de tests C20 passe, le build de distribution passe et l'audit d'accessibilité de distribution passe.

## CRITÈRES GO / NO-GO

### GO

- 13 chapitres complets avec N1, N2 et N3 ;
- quiz et flashcards présents dans tous les chapitres ;
- figures C20 accessibles et sans script ;
- niveau 5e public et indexable ;
- 14 routes C20 présentes dans le snapshot ;
- `quality`, `dist-fast` et `dist-a11y` entièrement verts.

### NO-GO

- ressource manquante ;
- notion hors niveau présentée comme exigible ;
- route cassée ou absente du snapshot ;
- régression qualité, build ou accessibilité.

## VERDICT

**GO SANS RÉSERVE.**

C20 est terminé : le corpus Mathématiques 5e est publié, complet pour le périmètre C19+C20, indexable et certifié par les trois contrôles CI autoritatifs. La migration générale des figures reste volontairement différée à C30-C31.