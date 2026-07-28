# Conventions identifiants et nommage

## Contexte verifie
`contentIds.ts` prepare des IDs canoniques et alias legacy.
## Objectif unique
Fixer les conventions d'IDs, slugs, routes et noms de fichiers V3.
## Agents responsables
Architecte contenus, responsable migration, architecte Astro.
## Prerequis
Prompts 01 et 04 termines.
## Fichiers a lire
`src/utils/contentIds.ts`, `src/data/contentRoutes.ts`, `docs/architecture/strategie-alias-progression.md`.
## Perimetre autorise
Conventions, tests d'IDs, documentation.
## Fichiers pouvant etre modifies
Utils IDs, tests associes, docs V3.
## Fichiers interdits
Renommage massif de contenus.
## Travaux a realiser
Documenter namespaces et verifier unicite globale.
## Contraintes de migration
Conserver lectures legacy.
## Contraintes pedagogiques
IDs lisibles mais pas dependants des titres longs.
## Contraintes de design
Aucune.
## Contraintes DYS et accessibilite
Aucune.
## Contraintes de securite et de performance
IDs sans donnees personnelles.
## Livrables
Convention et tests.
## Commandes a executer
`npm.cmd test`, `npm.cmd run verify:content`.
## Tests obligatoires
IDs uniques et aliases idempotents.
## Comparaison avant/apres
Anciennes progressions resolues.
## Criteres d'acceptation
Aucun conflit d'ID.
## Procedure de retour arriere
Restaurer conventions precedentes.
## Rapport final
Exemples valides et interdits.
## Evaluation selon les six criteres d'AGENTS.md
Minimum 9/10 chacun.
