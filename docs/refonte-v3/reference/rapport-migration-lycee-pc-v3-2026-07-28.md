# Rapport prompt 30 - Migration lycee physique-chimie V3

Date : 2026-07-28

Prompt execute : `docs/refonte-v3/prompts/30-migration-lycee-pc.md`

## Sources lues

- `docs/refonte-v3/README.md`
- `docs/refonte-v3/00-resume-executif.md`
- `docs/refonte-v3/prompts/30-migration-lycee-pc.md`
- `docs/refonte-v3/reference/schema-contrat-donnees-v3.md`
- `src/data/chapters/lycee/2nde/`
- `src/data/chapters/lycee/1ere-spe/`
- `src/data/chapters/lycee/terminale-spe/`
- `BO/BO_Seconde.pdf`
- `BO/BO_Premiere_SPE.pdf`
- `BO/BO_Term_Spe.pdf`

Les dossiers `src/data/chapters/lycee/1ere-ens-scientifique/` et `src/data/chapters/lycee/terminale-ens-scientifique/` sont exclus du lot, conformement au prompt 30.

## Perimetre traite

48 chapitres physique-chimie lycee :

- `2nde/chimie` : 7 chapitres
- `2nde/physique` : 7 chapitres
- `1ere-spe/chimie` : 8 chapitres
- `1ere-spe/physique` : 5 chapitres
- `terminale-spe/chimie` : 9 chapitres
- `terminale-spe/physique` : 12 chapitres

Ressources normalisees :

- Exercices : 460 items
- Quiz : 626 items
- Flashcards : 603 items
- Total : 1 689 items

## Travaux realises

- Ajout des champs V3 dans les `meta.json` du lot : `programme`, `access`, `sources`, `objectives`, `prerequisites`, `competencies`, `competences`, `lessons`, `links`, `tags`, `updatedAt`.
- Rattachement aux sources officielles locales :
  - `bo-lycee-pc-seconde`
  - `bo-lycee-pc-premiere-specialite`
  - `bo-lycee-pc-terminale-specialite`
- Ajout de trois lecons structurees par chapitre, sans bloc HTML libre.
- Ajout de 36 blocs formule avec alternative textuelle `accessibility.formulaText`.
- Enrichissement de 1 689 ressources avec acces gratuit, sources, competences, liens internes, tags de niveau/matiere et tag `bac` pour la terminale speciale.
- Controle de 53 schemas SVG d'exercices : tous portent `role="img"`, un titre, une description, et une alternative accessible.
- Conservation des routes legacy et explicites : les routes `/lycee/...` et `/physique-chimie/lycee/...` restent construites par le build.

## Tests ajoutes

Fichier ajoute :

- `tests/contenus-lycee-pc-v3.test.mjs`

Couvertures du test :

- inventaire exact des 48 chapitres cibles ;
- exclusion explicite des dossiers `ens-scientifique` ;
- preservation des routes et IDs canoniques ;
- validation des sources BO, champs V3, lecons et blocs formule ;
- verification des exercices, quiz, flashcards, corrections et liens internes ;
- verification des SVG accessibles et sans HTML dangereux ;
- audit du contrat contenu sans champs editoriaux manquants sur le lot.

## Validations

Commandes executees :

- `npm.cmd test`
  - Resultat : 209 tests passes, 0 echec.
- `npm.cmd run verify:content`
  - Resultat : 34 666 controles, 0 erreur, 0 avertissement.
  - Contrat contenu commun : 112 chapitres, 96 adaptes, 16 incomplets publiables, 0 bloquant.
  - IDs canoniques de ressources verifies : 3 450 IDs, 17 251 controles.
- `npm.cmd run build`
  - Resultat : build Astro termine, 314 pages generees.
- Balayage securite du lot lycee PC :
  - Motifs controles : `aria-hidden="true"`, `<script`, `javascript:`, `<object`, `<iframe`.
  - Resultat : aucune occurrence.

## Notes obligatoires

1. Architecture et maintenabilite : 9.5/10
   Preuves : normalisation appliquee aux donnees uniquement, test dedie `tests/contenus-lycee-pc-v3.test.mjs`, contrat commun conserve via `normalizeChapterPackage`, routes canoniques preservees.

2. UX, UI et coherence du design : 9/10
   Preuves : aucune modification de composants actifs, conservation des routes existantes, liens internes vers laboratoires et outils, build de 314 pages sans erreur.

3. Qualite pedagogique et scientifique : 9/10
   Preuves : rattachement aux BO seconde, premiere specialite et terminale specialite, objectifs/prerequis/competences par chapitre, exercices et corrections conservees, tag `bac` pour terminale speciale.

4. Accessibilite et DYS : 9.5/10
   Preuves : 36 blocs formule avec texte accessible, 53 SVG controles avec titre/description/alternative, aucun `aria-hidden="true"` ni motif dangereux dans le lot, tests accessibilite existants passes.

5. Qualite technique globale : 9.5/10
   Preuves : `npm.cmd test` vert, `verify:content` a 0 erreur/0 avertissement, `build` vert, audit des motifs dangereux sur les SVG et HTML du lot.

6. Completude, migration et validation : 9.5/10
   Preuves : 48/48 chapitres cibles couverts, 1 689 ressources normalisees, dossiers enseignement scientifique exclus, rapport et index V3 mis a jour, validations demandees executees.

Conclusion : le prompt 30 est valide. Tous les criteres atteignent au moins 9/10.
