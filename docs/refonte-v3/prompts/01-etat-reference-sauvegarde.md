# Etat de reference et sauvegarde V2

## Contexte verifie
La V2 genere 314 pages, `verify:content` trouve 150 routes publiques attendues, 112 chapitres et 25 laboratoires.
## Objectif unique
Figer une reference technique, visuelle, route et contenu avant toute refonte active.
## Agents responsables
Directeur V3, responsable migration, expert QA.
## Prerequis
Lire `AGENTS.md` et `docs/refonte-v3/01-etat-reference-v2.md`.
## Fichiers a lire
`package.json`, `astro.config.mjs`, `src/config/site.ts`, `scripts/verify-routes-and-content.mjs`, `scripts/audit-dist.mjs`.
## Perimetre autorise
Documentation, snapshots, rapports de reference.
## Fichiers pouvant etre modifies
`docs/refonte-v3/01-etat-reference-v2.md`, nouveaux rapports sous `docs/refonte-v3/reference/`.
## Fichiers interdits
Routes, composants, contenus actifs, styles actifs.
## Travaux a realiser
Lister routes, contenus, tailles, scripts lourds, stockage local, fonctions DYS et commandes.
## Contraintes de migration
Aucune suppression ni renommage.
## Contraintes pedagogiques
Conserver une cartographie programmes/contenus.
## Contraintes de design
Capturer pages representatives avant V3.
## Contraintes DYS et accessibilite
Inventorier toutes les preferences existantes.
## Contraintes de securite et de performance
Mesurer bundles, scripts globaux et risques `set:html`.
## Livrables
Rapport de reference complet.
## Commandes a executer
`npm.cmd run check`, `npm.cmd run lint`, `npm.cmd test`, `npm.cmd run verify:content`, `npm.cmd run build`.
## Tests obligatoires
Toutes les commandes ci-dessus doivent etre documentees.
## Comparaison avant/apres
Avant seulement, servant de base de comparaison.
## Criteres d'acceptation
Reference exploitable et reproductible.
## Procedure de retour arriere
Ne s'applique pas hors documentation.
## Rapport final
Inclure fichiers crees/modifies, commandes et problemes restants.
## Evaluation selon les six criteres d'AGENTS.md
Noter les six criteres, minimum 9/10 chacun avec preuves.
