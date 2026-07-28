# Rapport prompt 18 - Kit scientifique V3

Date d'execution : 2026-07-28

## Perimetre traite

Prompt execute : `docs/refonte-v3/prompts/18-kit-scientifique-v3.md`.

Sources relues avant intervention :

- `docs/refonte-v3/README.md`
- `docs/refonte-v3/00-resume-executif.md`
- `docs/refonte-v3/prompts/18-kit-scientifique-v3.md`
- `src/pages/outils-methodes/kit-scientifique.astro`
- `src/data/outilsMethodes.ts`
- `docs/refonte-v3/09-structures-pedagogiques-v3.md`
- `docs/refonte-v3/07-arborescence-fonctionnelle-v3.md`
- `src/utils/scientificExpression.ts`

Le travail est reste limite au kit scientifique et aux fiches methodes associees. Les laboratoires n'ont pas ete modifies, hors liens de navigation contextuels.

## Fiches et outils livres

- Grandeurs et unites : familles longueur, masse, volume, duree, vitesse et energie, avec conversions factorisees dans `src/data/kitScientifique.ts`.
- Mesures : methode en 4 temps, tableau accessible des grandeurs, unites et instruments.
- Graphiques : saisie de couples de mesures, modele lineaire passant par l'origine et message de conclusion.
- Calculs : calculatrice avec parseur limite via `src/utils/scientificExpression.ts`.
- Solutions : dissolution et dilution factorisees dans `src/utils/kitScientifique.ts`.
- Securite : rappels lunettes, blouse, etiquette, gestes interdits et dilution d'acide.
- Fiches methodes : 4 cartes pas a pas avec objectif, etapes, exemple et piege frequent.
- Mini-quiz : 3 questions avec feedback accessible `aria-live`.
- Liens par chapitre : entrees de travail vers 5e proprietes de la matiere, 5e circuits electriques, 2nde solutions et 2nde signaux/capteurs.

## Fichiers modifies ou ajoutes

- `src/pages/outils-methodes/kit-scientifique.astro`
- `src/data/kitScientifique.ts`
- `src/utils/kitScientifique.ts`
- `tests/kit-scientifique-v3.test.mjs`
- `docs/refonte-v3/reference/captures/kit-scientifique-v3-2026-07-28.png`
- `docs/refonte-v3/reference/rapport-kit-scientifique-v3-2026-07-28.md`
- `docs/refonte-v3/README.md`

## Validation

- `npm.cmd test` : OK, 153 tests passes, dont la suite `kit scientifique V3`.
- `npm.cmd run build` : OK, 314 pages construites, dont `/outils-methodes/kit-scientifique/`.
- `npm.cmd run check` : OK, 0 erreur ; 22 indications existantes dans des fichiers hors prompt.
- Verification locale : `http://127.0.0.1:4321/outils-methodes/kit-scientifique/` repond en HTTP 200.
- Capture disponible : `docs/refonte-v3/reference/captures/kit-scientifique-v3-2026-07-28.png`.

## Points de migration

- L'URL historique `/outils-methodes/kit-scientifique/` est conservee.
- Les nouveaux liens pointent vers des routes de chapitre existantes ou preparees dans la strategie V3.
- Les helpers de calcul sont factorises pour eviter une seconde logique permanente dans la page.
- Le parseur scientifique reste limite : aucune evaluation JavaScript arbitraire n'est introduite.

## Notes obligatoires

1. Architecture et maintenabilite : 9/10
   Preuves : donnees separees dans `src/data/kitScientifique.ts`, calculs reutilisables dans `src/utils/kitScientifique.ts`, page limitee a l'assemblage UI et aux interactions.

2. UX, UI et coherence du design : 9/10
   Preuves : interface d'outil avec onglets, panneaux, fiches methodes, liens par chapitre et mini-quiz ; capture locale produite.

3. Qualite pedagogique et scientifique : 9/10
   Preuves : methodes pas a pas, exemples, pieges frequents, mesures, unites, graphiques, solutions et securite ; tests sur conversions, dissolution, dilution et modele lineaire.

4. Accessibilite et DYS : 9/10
   Preuves : tableau avec `caption` et `th scope`, quiz avec `aria-live`, boutons clavier natifs, textes courts et structures listes/tableaux.

5. Qualite technique globale : 9/10
   Preuves : `npm.cmd run check` OK, `npm.cmd test` OK, `npm.cmd run build` OK ; parseur scientifique limite reutilise.

6. Completude, migration et validation : 9/10
   Preuves : tous les livrables du prompt 18 sont couverts, URL historique conservee, laboratoires non modifies, validations obligatoires executees.
