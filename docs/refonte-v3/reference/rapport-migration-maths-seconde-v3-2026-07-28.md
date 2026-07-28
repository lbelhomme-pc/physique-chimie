# Rapport migration mathematiques seconde V3 - 2026-07-28

## Perimetre

Prompt execute : `docs/refonte-v3/prompts/29-migration-maths-seconde.md`.

Sources relues avant execution :

- `docs/refonte-v3/README.md`
- `docs/refonte-v3/00-resume-executif.md`
- `docs/refonte-v3/reference/schema-contrat-donnees-v3.md`
- `src/data/mathematiques/`
- `src/pages/mathematiques/`
- composants mathematiques et pedagogiques utiles
- `src/data/mathematiques/programmes/seconde-gt-2026.json`

Note de source : `BO/BO_Seconde.pdf` present dans le depot concerne la physique-chimie. La reference officielle mathematiques seconde deja structuree dans le depot est `src/data/mathematiques/programmes/seconde-gt-2026.json`, avec la source `bo-2026-mathematiques-seconde-gt`.

## Lot migre

11 chapitres de mathematiques seconde ont ete normalises :

- `algorithmique-python`
- `arithmetique-ensembles-logique`
- `calcul-litteral-puissances-racines`
- `droites-plan`
- `equations-inequations`
- `fonctions-generalites`
- `fonctions-reference-variations`
- `geometrie-reperee-vecteurs`
- `nombres-reels-intervalles`
- `probabilites-conditionnelles`
- `statistiques-information-chiffree`

Fichiers normalises dans chaque chapitre :

- `meta.json`
- `exercices.json`
- `quiz.json`
- `flashcards.json`

Fichiers d'integration maths ajustes :

- `src/data/mathematiques/types.ts`
- `src/data/mathematiques/content.ts`
- `src/pages/mathematiques/lycee/[niveau]/[chapitre].astro`

## Changements appliques

- Ajout des champs V3 communs aux 11 `meta.json` : `programme`, `access`, `sources`, `objectives`, `competences`, `updatedAt`, `links`, `tags`, `lessons`.
- Conservation des routes existantes `/mathematiques/lycee/2nde/{slug}` et des IDs canoniques `mathematiques:lycee:2nde:{slug}`.
- Conservation des IDs d'exercices, quiz et flashcards.
- Ajout de la source officielle `bo-2026-mathematiques-seconde-gt` sur les chapitres et les ressources.
- Ajout de liens internes vers les fiches methodes maths lycee ou les chapitres lies.
- Ajout de blocs `formula` dans les lecons, chacun avec `accessibility.formulaText`.
- Enrichissement des 143 ressources par `access`, `sources`, `competences`, `links`, `tags` et alternatives de formule quand necessaire.
- Raccord des vrais `objectives` V3 au rendu de la page chapitre maths, avec conservation de la description comme secours.
- Conservation de l'activite pilote `fonctions-generalites` et verification de l'absence de `eval` ou `new Function`.

## Tests ajoutes

Nouveau fichier :

- `tests/contenus-mathematiques-seconde-v3.test.mjs`

Le test couvre :

- presence des fichiers du lot ;
- conservation des routes et IDs canoniques ;
- champs V3 dans les metas ;
- source officielle du programme seconde ;
- ressources normalisees sans changement d'IDs ;
- formules rendues par KaTeX avec MathML ;
- absence d'evaluation de formules utilisateur dans l'activite pilote ;
- objectifs V3 branches sur la page chapitre ;
- audit du lot sans champs editoriaux manquants.

## Validations

Commandes executees :

- `npm.cmd test` : 203 tests passes, 0 echec.
- `npm.cmd run verify:content` : 34 666 controles, 0 erreur, 0 avertissement.
- `npm.cmd run build` : build Astro reussi, 314 pages generees.

Points observes :

- Le contrat contenu commun passe a 48 chapitres adaptes, soit les 37 chapitres college PC deja migres plus les 11 chapitres mathematiques seconde.
- Les 11 routes mathematiques seconde restent publiees.
- Le build conserve le total de 314 pages.

## Limites et retour arriere

Le prompt a ete limite a la verticale mathematiques seconde. Aucun fichier physique-chimie ni enseignement scientifique n'a ete modifie dans le cadre de cette execution.

Retour arriere possible par restauration des fichiers touches dans :

- `src/data/mathematiques/chapters/lycee/2nde/`
- `src/data/mathematiques/types.ts`
- `src/data/mathematiques/content.ts`
- `src/pages/mathematiques/lycee/[niveau]/[chapitre].astro`
- `tests/contenus-mathematiques-seconde-v3.test.mjs`
- `docs/refonte-v3/reference/rapport-migration-maths-seconde-v3-2026-07-28.md`
- `docs/refonte-v3/README.md`

## Notation obligatoire

| Critere | Note | Preuves |
| --- | ---: | --- |
| Architecture et maintenabilite | 9.5/10 | Contrat V3 applique au pilote sans casser les loaders maths ; objectifs ajoutes au type et au chargeur ; routes et IDs verifies par test. |
| UX, UI et coherence du design | 9/10 | Page maths conserve `headerVariant="math"` ; objectifs V3 affiches ; liens internes vers methodes et chapitres lies. |
| Qualite pedagogique et scientifique | 9/10 | Couverture des 11 chapitres alignee sur `seconde-gt-2026.json` ; lecons, objectifs et formules de reference ajoutees. |
| Accessibilite et DYS | 9.5/10 | Formules avec `formulaText` ; test KaTeX/MathML ; ressources dotees d'alternatives de formule quand necessaire. |
| Qualite technique globale | 9.5/10 | 203 tests passent ; `verify:content` sans erreur ni avertissement ; build 314 pages ; absence de `eval`/`new Function` dans l'activite pilote. |
| Completude, migration et validation | 9.5/10 | 11 chapitres et 143 ressources traites ; audit du lot sans champ editorial manquant ; rapport et README mis a jour. |
