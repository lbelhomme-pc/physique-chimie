# C19 — Mathématiques 5e — lot A

## CONTEXTE / COMMIT DE DÉPART

- Dépôt : `lbelhomme-pc/physique-chimie`
- Branche : `audit-2026-c01-route-snapshot`
- Base : C18 validé, commit `e64d0a5d91429ae05979763e83d93aea5f1c4536`.
- Mission : créer le premier lot du corpus Mathématiques 5e.

## OBJECTIF UNIQUE

Créer le corpus pédagogique 5e conforme au nouveau programme 2026 avec cours complets et exercices N1/N2, sans anticiper les N3, quiz, flashcards, figures et publication finale réservés à C20.

## PROGRAMME OFFICIEL DE RÉFÉRENCE

- Programmes d'enseignement de français et de mathématiques du cycle des approfondissements (cycle 4).
- Bulletin officiel n° 10 du 5 mars 2026.
- NOR : `MENE2602912A`.
- Arrêté du 18 février 2026, JO du 4 mars 2026.
- Application en 5e : rentrée scolaire 2026-2027.
- Source : `https://www.education.gouv.fr/bo/2026/Hebdo10/MENE2602912A`.
- Identifiant du registre interne : `bo-cycle4-mathematiques-2026`.
- Version du registre : `mathematiques-cycle4-2026`.

## DÉCOMPOSITION ÉDITORIALE

Le BO ne fixe pas un nombre de chapitres. C19 organise les rubriques officielles de 5e en 13 chapitres adaptés à la navigation du site :

1. Opérations sur les nombres ;
2. Nombres relatifs ;
3. Nombres rationnels et fractions ;
4. Puissances : carré et cube ;
5. Calcul littéral et premières équations ;
6. Repérage dans le plan et représentation de l'espace ;
7. Transformations, symétries et angles ;
8. Triangles et parallélogrammes ;
9. Statistiques et représentations de données ;
10. Probabilités : premières expériences aléatoires ;
11. Proportionnalité et pourcentages ;
12. Dépendance entre grandeurs : première approche des fonctions ;
13. Pensée informatique et algorithmique par blocs.

Le fichier `src/data/mathematiques/programmes/cycle4-5e-2026.mapping.json` maintient la correspondance entre ce découpage et toutes les rubriques officielles.

## PÉRIMÈTRE C19

Chaque chapitre possède :

- `meta.json` ;
- `cours.mdx` ;
- `exercices.json` avec au minimum deux exercices N1 et deux N2 ;
- `quiz.json` vide, réservé à C20 ;
- `flashcards.json` vide, réservé à C20.

Les cours sont structurés avec objectifs, prérequis, activité de découverte, vocabulaire, cours, exemples, méthode, erreurs fréquentes et synthèse.

## FRONTIÈRE C19 / C20

C19 ne réalise pas :

- les exercices N3 ;
- les quiz finaux ;
- les flashcards ;
- les figures statiques ;
- l'activation publique du niveau 5e.

Les chapitres portent donc `seo.noindex: true` et `src/data/mathematiques/levels.ts` conserve `5eme` avec le statut `planned`.

Cette séparation évite de publier un niveau dont les outils d'évaluation et de mémorisation ne sont pas encore complets.

## GARDE-FOUS DE NIVEAU

C19 respecte les limites de la 5e du BO 2026. En particulier :

- probabilités : expérience, issue, évènement, équiprobabilité simple et fréquences expérimentales ; le formalisme ensembliste et les expériences à deux épreuves sont laissés aux niveaux suivants ;
- fonctions : emploi de « en fonction de », tableaux, graphiques et formules simples ; pas d'étude générale des fonctions ni de fonctions affines exigées en 5e ;
- pensée informatique : séquences, entrées-sorties, expressions et boucles inconditionnelles à nombre fixé ; conditions et manipulation autonome des variables sont réservées à la suite du cycle ;
- géométrie : propriétés de 5e uniquement ; pas de Pythagore, Thalès, trigonométrie ou vecteurs.

## TESTS

`tests/math-5e-bo2026-c19.test.mjs` vérifie :

1. source officielle, NOR et fenêtre 2026-2027 ;
2. 13 slugs éditoriaux exactement ;
3. paquet de cinq fichiers par chapitre ;
4. routes canoniques, `noindex` et métadonnées de programme ;
5. présence des N1 et N2 et absence de N3 ;
6. corrections présentes ;
7. quiz et flashcards encore vides ;
8. absence de figures dans C19 ;
9. mapping de toutes les rubriques BO 5e ;
10. maintien du niveau 5e en `planned` jusqu'à C20.

La CI autoritative reste `quality`, `dist-fast`, `dist-a11y`.

## MIGRATION / RETOUR ARRIÈRE

C19 est additif : il ne renomme aucune route historique et ne modifie aucun stockage de progression. Retour arrière global : revenir au commit C18 `e64d0a5d91429ae05979763e83d93aea5f1c4536`.

## CRITÈRES GO / NO-GO

### GO

- toutes les rubriques officielles de 5e sont couvertes par le mapping ;
- 13 cours complets sont présents ;
- chaque chapitre contient N1 et N2 avec correction ;
- aucune ressource C20 n'est prétendue achevée ;
- 5e reste `planned` et `noindex` ;
- CI entièrement verte.

### NO-GO

- rubrique officielle non couverte ;
- notion d'un niveau supérieur présentée comme exigible en 5e ;
- chapitre sans N1 ou N2 ;
- activation publique prématurée ;
- régression build, tests, sécurité ou accessibilité.

## SUITE

C20 complètera ce corpus avec N3, quiz, flashcards, figures statiques accessibles et la décision d'activation publique du niveau 5e après validation complète.
