# C21 — Première spécialité mathématiques 2026 — algèbre et analyse

## CONTEXTE / COMMIT DE DÉPART
- Dépôt : `lbelhomme-pc/physique-chimie`.
- Branche : `audit-2026-c01-route-snapshot`.
- Base : C20 validé, commit `e440d765ba7b24e8ab31fcfd88a413652126209a`.

## OBJECTIF UNIQUE
Créer la moitié algèbre/analyse du corpus de Première spécialité mathématiques conforme au nouveau programme 2026, sans publier le niveau avant C22.

## PROGRAMME OFFICIEL
- BO n° 14 du 2 avril 2026.
- NOR `MENE2602917A`.
- Arrêté du 26 février 2026, JO du 27 mars 2026.
- Application : rentrée 2026-2027.
- Source : `https://www.education.gouv.fr/bo/2026/Hebdo14/MENE2602917A`.

## PÉRIMÈTRE C21
Six chapitres : suites numériques et modèles discrets ; second degré ; dérivation ; variations et courbes ; fonction exponentielle ; trigonométrie.

Chaque chapitre reçoit `meta.json`, `cours.mdx`, `exercices.json`, `quiz.json`, `flashcards.json`, avec au minimum 2 exercices N1, 2 N2, 2 N3, 5 questions de quiz et 6 flashcards.

## FRONTIÈRE C21 / C22
C21 ne traite pas la géométrie, les probabilités/statistiques ni le bloc complet algorithmique-programmation : ces contenus appartiennent à C22. Le niveau reste `planned`, les six chapitres restent `noindex:true` et aucune route n'est ajoutée au snapshot public.

## BORNES BO SENSIBLES
- Suites : intuition de limite sans formalisation.
- Second degré : la forme canonique générale ne devient pas un calcul systématiquement exigible ; complétion du carré dans les cas simples et choix stratégique des formes.
- Dérivation : distinction point de vue local/global, tangente et approximation linéaire.
- Exponentielle : définition par `f'=f`, `f(0)=1`, existence/unicité admises.
- Trigonométrie : cercle, radian, enroulement, sinus/cosinus et valeurs remarquables.

## FIGURES
Aucune migration massive SVG/TikZ n'est lancée. C30-C31 restent autoritaires pour le moteur et la migration des figures statiques.

## TESTS
`tests/math-1ere-spe-bo2026-c21.test.mjs` contrôle source officielle, six paquets, N1/N2/N3, quiz/flashcards, noindex, absence de routes publiques, bornes sensibles et preuves de couverture.

## GO / NO-GO
GO si les six chapitres couvrent les deux sections Algèbre et les quatre sections Analyse du BO, restent non publiés avant C22, et si `quality`, `dist-fast`, `dist-a11y` sont verts. NO-GO en cas de couverture manquante, publication prématurée ou régression.

## VERDICT
En attente de la CI du HEAD C21.
