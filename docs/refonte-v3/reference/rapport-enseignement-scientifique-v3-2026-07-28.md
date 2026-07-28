# Rapport prompt 31 - Enseignement scientifique V3

Date : 2026-07-28

Prompt execute : `docs/refonte-v3/prompts/31-enseignement-scientifique.md`

## Sources lues

- `docs/refonte-v3/README.md`
- `docs/refonte-v3/00-resume-executif.md`
- `docs/refonte-v3/prompts/31-enseignement-scientifique.md`
- `docs/refonte-v3/reference/schema-contrat-donnees-v3.md`
- `src/data/chapters/lycee/1ere-ens-scientifique/`
- `src/data/chapters/lycee/terminale-ens-scientifique/`
- `BO/BO_Premiere_ES.pdf`
- `BO/BO_Term_ES.pdf`
- `BO/terminale-enseignement-scientifique.txt`

Les contenus `1ere-spe` et `terminale-spe` de physique-chimie sont restes hors perimetre.

## Perimetre traite

16 chapitres d'enseignement scientifique :

- `1ere-ens-scientifique/chimie` : 4 chapitres
- `1ere-ens-scientifique/physique` : 9 chapitres
- `terminale-ens-scientifique/chimie` : 1 chapitre
- `terminale-ens-scientifique/physique` : 2 chapitres

Ressources normalisees :

- Exercices : 83 items
- Quiz : 128 items
- Flashcards : 102 items
- Total : 313 items

## Travaux realises

- Ajout d'une identite de donnees propre a l'ES : `disciplineIdentity: "enseignement-scientifique"`.
- Rattachement aux sources officielles :
  - `bo-enseignement-scientifique-premiere-2023`
  - `bo-enseignement-scientifique-terminale-2023`
- Ajout des champs V3 : acces, sources, objectifs, prerequis, competences, liens, outils, tags, lecons.
- Structuration des 16 chapitres en 48 lecons autour de :
  - documents, savoirs et questions scientifiques ;
  - modelisation, donnees et incertitudes ;
  - enjeux, debat et projet.
- Ajout de 9 blocs formule avec alternative textuelle accessible.
- Enrichissement des 313 ressources avec acces gratuit, sources BO, competences ES, liens internes, tags ES et description accessible.
- Ajout d'un affichage explicite de l'identite ES sur les pages chapitre : badge `Enseignement scientifique`, libelles `Reperes chimie et vivant` ou `Reperes physique et Terre`.
- Conservation des routes existantes `/lycee/...` et des routes explicites `/physique-chimie/lycee/...` generees par le build.

## Tests ajoutes

Fichier ajoute :

- `tests/enseignement-scientifique-v3.test.mjs`

Couvertures du test :

- inventaire exact des 16 chapitres ES ;
- exclusion des lots `1ere-spe` et `terminale-spe` ;
- routes et IDs canoniques preserves ;
- sources BO ES, champs V3 et identite ES ;
- lecons documents/modeles/enjeux/projets ;
- exercices, quiz et flashcards enrichis sans perte des corrections ;
- page chapitre branchee sur l'identite ES ;
- audit du contrat contenu sans champs editoriaux manquants sur le lot.

## Validations

Commandes executees :

- `npm.cmd test`
  - Resultat : 214 tests passes, 0 echec.
- `npm.cmd run verify:content`
  - Resultat : 34 666 controles, 0 erreur, 0 avertissement.
  - Contrat contenu commun : 112 chapitres, 112 adaptes, 0 incomplet publiable, 0 bloquant.
  - IDs canoniques de ressources verifies : 3 450 IDs, 17 251 controles.
- `npm.cmd run build`
  - Resultat : build Astro termine, 314 pages generees.
- Balayage securite du lot ES :
  - Motifs controles : `aria-hidden="true"`, `<script`, `javascript:`, `<object`, `<iframe`.
  - Resultat : aucune occurrence.

## Notes obligatoires

1. Architecture et maintenabilite : 9.5/10
   Preuves : donnees ES enrichies sans toucher aux lots PC spe, test dedie `tests/enseignement-scientifique-v3.test.mjs`, contrat commun conserve, routes legacy et explicites preservees.

2. UX, UI et coherence du design : 9/10
   Preuves : pages chapitre ES avec badge discipline explicite, libelles propres aux regroupements ES, catalogues ES existants conserves, build de 314 pages sans erreur.

3. Qualite pedagogique et scientifique : 9.5/10
   Preuves : alignement sur les BO ES premiere/terminale, axes documents-modelisation-enjeux-projets, 48 lecons structurees, 313 ressources conservees et enrichies.

4. Accessibilite et DYS : 9.5/10
   Preuves : 9 blocs formule avec `formulaText`, descriptions accessibles sur les ressources, aucune occurrence de motifs HTML/SVG dangereux, tests accessibilite existants passes.

5. Qualite technique globale : 9.5/10
   Preuves : `npm.cmd test` vert, `verify:content` a 0 erreur/0 avertissement, `build` vert, contrat contenu sans chapitre incomplet publiable.

6. Completude, migration et validation : 9.5/10
   Preuves : 16/16 chapitres ES couverts, 313/313 ressources normalisees, prompt 31 documente, index V3 mis a jour, validations demandees executees.

Conclusion : le prompt 31 est valide. Tous les criteres atteignent au moins 9/10.
