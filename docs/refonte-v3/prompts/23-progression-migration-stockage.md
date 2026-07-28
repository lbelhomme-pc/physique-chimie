# Progression et migration du stockage

## Contexte verifie
La progression utilise localStorage et aliases canoniques.
## Objectif unique
Fiabiliser la migration de progression V3.
## Agents responsables
Responsable migration, QA, architecte contenus.
## Prerequis
Prompt 05 termine.
## Fichiers a lire
`progress.ts`, `contentIds.ts`, `contentProgressMigration.ts`, tests migration.
## Perimetre autorise
Stockage local, migration, tests.
## Fichiers pouvant etre modifies
Utils progression, tests, docs.
## Fichiers interdits
Suppression de donnees utilisateur.
## Travaux a realiser
Scenarios idempotents, corruption, future synchro.
## Contraintes de migration
Anciennes cles conservees.
## Contraintes pedagogiques
Scores et SRS preserves.
## Contraintes de design
Etats progression coherents.
## Contraintes DYS et accessibilite
Pas d'impact.
## Contraintes de securite et de performance
Pas de donnees sensibles en clair futures.
## Livrables
Migration testee.
## Commandes a executer
`npm.cmd test`, `npm.cmd run build`.
## Tests obligatoires
Legacy vers canonique, idempotence.
## Comparaison avant/apres
Aucune perte de progression.
## Criteres d'acceptation
0 suppression automatique.
## Procedure de retour arriere
Desactiver nouvelle migration.
## Rapport final
Scenarios passes.
## Evaluation selon les six criteres d'AGENTS.md
Minimum 9/10 chacun.
