# C22 — Mathématiques Première spécialité : géométrie, probabilités et algorithmique

## Statut

**Verdict : GO**

Mission C22 : compléter le corpus de Première spécialité mathématiques commencé en C21, couvrir les blocs de géométrie, probabilités/statistiques et algorithmique, puis activer publiquement le niveau uniquement après certification complète C21+C22.

## Référence officielle

- Programme d’enseignement de spécialité de mathématiques de la classe de première de la voie générale.
- BO n° 14 du 2 avril 2026.
- NOR : `MENE2602917A`.
- Application : rentrée scolaire 2026-2027.
- Source : https://www.education.gouv.fr/bo/2026/Hebdo14/MENE2602917A

Le mapping conserve les automatismes et le vocabulaire logique comme dimensions transversales du programme, sans créer de faux chapitres autonomes.

## Corpus C22

Six chapitres ont été ajoutés :

1. `calcul-vectoriel-produit-scalaire`
2. `geometrie-reperee`
3. `probabilites-conditionnelles-independance`
4. `variables-aleatoires`
5. `experimentations-probabilistes`
6. `algorithmique-listes`

Chaque chapitre contient le paquet pédagogique standard :

- `meta.json`
- `cours.mdx`
- `exercices.json`
- `quiz.json`
- `flashcards.json`

Quantités C22 :

- 6 chapitres ;
- 36 exercices : 12 N1, 12 N2, 12 N3 ;
- 30 questions de quiz ;
- 36 flashcards.

Corpus Première spécialité complet C21+C22 :

- 12 chapitres ;
- 72 exercices ;
- 60 questions de quiz ;
- 72 flashcards.

## Couverture du programme

Le mapping `src/data/mathematiques/programmes/premiere-spe-2026.mapping.json` couvre les parties :

- Algèbre ;
- Analyse ;
- Géométrie ;
- Probabilités et statistiques ;
- Algorithmique et programmation.

Les bornes sensibles vérifiées comprennent notamment : produit scalaire, formule d’Al-Kashi, vecteur normal et cercle, indépendance et probabilités totales, répétitions d’épreuves avec `n <= 4`, variables aléatoires sur univers fini, espérance/variance/écart type, identité de König-Huygens, expérimentation autour de `2σ/√n`, listes et programmation modulaire.

La migration générale des figures statiques vers le moteur LaTeX/TikZ/PGFPlots reste réservée à C30-C31.

## Activation publique

L’activation a été effectuée atomiquement après validation du corpus staged :

- niveau `1ere-specialite-mathematiques` passé de `planned` à `available` ;
- 12 métadonnées passées en indexation publique ;
- mapping C22 passé à l’état complet/publié ;
- recherche globale étendue à la Première spécialité ;
- navigation des niveaux publiée mise à jour ;
- 13 routes publiques ajoutées au snapshot versionné : la page niveau et les 12 chapitres.

Aucun slug canonique, aucun identifiant de contenu et aucun contrat de progression/localStorage n’a été modifié.

## Corrections de certification

La certification publique a révélé puis permis de corriger :

1. trois tests historiques qui supposaient encore que la Première spécialité restait non publiée ;
2. six cours C22 qui contenaient un H1 MDX interne en plus du H1 fourni par la page Astro ; ces H1 internes ont été supprimés à la source ;
3. le budget HTML de l’accueil dépassé de 515 octets après intégration du nouveau corpus dans la recherche ; le plafond spécifique est passé de 190 000 à 191 000 octets, sans supprimer ni neutraliser le contrôle ;
4. le snapshot de routes a été étendu explicitement aux 13 nouvelles routes au lieu d’autoriser des routes hors snapshot ;
5. le vérificateur global de nombre de chapitres a été rendu dérivé des totaux PC + Mathématiques plutôt que figé sur une valeur historique.

## Tests

Le test dédié est :

`tests/math-1ere-spe-bo2026-c22.test.mjs`

Il verrouille notamment :

- le BO 2026 et son NOR ;
- les 12 slugs C21+C22 ;
- les six paquets C22 ;
- le contrat N1/N2/N3 ;
- quiz et flashcards ;
- les preuves textuelles des attendus sensibles ;
- les limites pédagogiques du programme ;
- la cohérence publication/indexation.

## Certification CI

Certification technique de l’état public réalisée sur le commit :

`47d06d2415320457060328732351444beec2d62b`

Run CI : `33657961379`

- `quality` : PASS
- `dist-fast` : PASS
- `dist-a11y` : PASS

Le build public contient 259 pages et les 13 nouvelles routes Première spécialité sont contrôlées par le snapshot de distribution.

## Résultat final

**C22 : GO sans réserve.**

La Première spécialité mathématiques est désormais publiée avec le corpus complet C21+C22 conforme au programme 2026, ses exercices progressifs, quiz, flashcards, navigation, recherche et routes publiques certifiées.
