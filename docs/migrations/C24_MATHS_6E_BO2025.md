# C24 — Mathématiques 6e — programme 2025

## Verdict

**GO SANS RÉSERVE sur le périmètre fonctionnel C24.**

La mission construit puis publie le corpus complet de mathématiques de 6e à partir du programme officiel du cycle 3 applicable en 6e depuis la rentrée 2025-2026, sans modifier les identifiants canoniques ni les contrats de progression existants.

Le commit fonctionnel public certifié est `6406134193fa7832143332bbcc2adac66b468253`.

## Source officielle

- Bulletin officiel n° 16 du 17 avril 2025.
- NOR : `MENE2504620A`.
- Application en 6e : rentrée scolaire 2025-2026.
- Source : https://www.education.gouv.fr/bo/2025/Hebdo16/MENE2504620A
- Identifiant interne : `bo-cycle3-mathematiques-2025`.
- Registre curriculaire : `mathematiques-cycle3-2025`.

## Périmètre éditorial

C24 publie treize chapitres correspondant aux blocs retenus pour la 6e :

1. `nombres-entiers-decimaux` — nombres entiers et décimaux ;
2. `fractions` — fractions ;
3. `algebre` — initiation à l’algèbre ;
4. `longueurs` — longueurs et périmètres ;
5. `aires` — aires ;
6. `volumes` — volumes ;
7. `temps-durees` — temps et durées ;
8. `proportionnalite` — proportionnalité ;
9. `donnees` — organisation et gestion de données ;
10. `probabilites` — probabilités ;
11. `configurations-planes` — configurations planes ;
12. `vision-espace` — vision dans l’espace ;
13. `pensee-informatique` — initiation à la pensée informatique.

## Ressources livrées

Le corpus C24 comprend :

- 13 cours structurés ;
- 78 exercices progressifs : 26 N1, 26 N2 et 26 N3 ;
- 65 questions de quiz ;
- 78 flashcards ;
- 13 paquets complets avec `meta.json`, `cours.mdx`, `exercices.json`, `exercices-n3.json`, `quiz.json` et `flashcards.json` ;
- cartographie BO dédiée dans `src/data/mathematiques/programmes/cycle3-6e-2025.mapping.json` ;
- tests dédiés dans `tests/math-6e-bo2025-c24.test.mjs`.

Les identifiants d’exercices, quiz et flashcards sont contrôlés sans doublon dans chaque paquet.

## Bornes pédagogiques verrouillées

Les contrôles C24 empêchent notamment l’introduction anticipée de notions hors périmètre de 6e telles que :

- théorème de Pythagore ;
- théorème de Thalès ;
- trigonométrie ;
- équations du second degré ;
- fonctions affines ;
- logarithmes.

La migration générale des figures statiques vers LaTeX/TikZ/PGFPlots reste réservée à C30-C31.

## Publication

La publication a été réalisée après une phase staged entièrement verte.

État final :

- niveau `6eme` : `available` ;
- les 13 `meta.json` : `seo.noindex: false` ;
- recherche globale : corpus 6e inclus ;
- navigation collège : 6e et 5e reconnues comme niveaux mathématiques publiés ;
- routes canoniques et identifiants existants conservés ;
- progression et `localStorage` non modifiés.

Quatorze routes publiques sont ajoutées : la page niveau `/mathematiques/college/6eme` et les treize pages de chapitre sous ce chemin.

Le snapshot de distribution passe de 265 à **279 pages**.

## Incident de certification et correction

Le premier passage de certification après activation a obtenu 332 tests sur 333. L’unique échec provenait de `tests/route-symmetry.test.mjs`, qui conservait l’attente historique selon laquelle seule la 5e était publiée au collège.

Le garde-fou a été mis à jour pour attendre explicitement les deux niveaux publiés `6eme` et `5eme`, tout en continuant d’exclure `4eme` et `3eme` tant qu’ils restent planifiés.

Aucun contenu pédagogique C24 n’a dû être corrigé à cette étape.

## Certification staged

HEAD staged certifié :

`63d4a9d0132dc1a01b0d0d734bc9434417b8d4b9`

Workflow CI : `33754477986` — run n° 470.

Résultats :

- `quality` : **SUCCESS** ;
- `dist-fast` : **SUCCESS** ;
- `dist-a11y` : **SUCCESS**.

## Certification fonctionnelle publique

Commit fonctionnel certifié :

`6406134193fa7832143332bbcc2adac66b468253`

Workflow CI : `33760995907` — run n° 474.

Résultats :

- `quality` : **SUCCESS** — 333/333 tests ;
- `dist-fast` : **SUCCESS** ;
- `dist-a11y` : **SUCCESS**.

Audit `dist-fast` :

- pages générées : **279** ;
- routes du snapshot : **279** ;
- routes sitemap : **278** ;
- contrôles : **25 561** ;
- erreurs : **0** ;
- avertissements : **0**.

## Conclusion

C24 fournit et publie le corpus complet de mathématiques de 6e, maintient les contrats curriculaires, les routes canoniques, la recherche, l’accessibilité et les audits de distribution du site.

**Verdict fonctionnel : GO SANS RÉSERVE.**

Le commit contenant le présent rapport doit lui aussi conserver les trois jobs CI verts conformément à la règle de certification du HEAD final de la branche.
