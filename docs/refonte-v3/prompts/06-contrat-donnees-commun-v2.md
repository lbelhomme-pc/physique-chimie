# Contrat de donnees commun V3

## Contexte verifie
Le contrat actuel valide 112 chapitres comme incomplets publiables.
## Objectif unique
Definir et tester le contrat commun V3 sans migrer tous les contenus.
## Agents responsables
Architecte contenus, enseignants, expert QA.
## Prerequis
Prompt 05 termine.
## Fichiers a lire
`src/data/contentContract.ts`, `src/data/contentAdapters.ts`, documents de structures pedagogiques.
## Perimetre autorise
Schemas, adaptateurs, fixtures pilotes.
## Fichiers pouvant etre modifies
`src/data/contentContract.ts`, adaptateurs, tests.
## Fichiers interdits
Migration globale de chapitres.
## Travaux a realiser
Ajouter champs V3 : acces, lecons, blocs, liens, sources, competences.
## Contraintes de migration
Adapter sans casser les formats actuels.
## Contraintes pedagogiques
Support cours, exercices, quiz, flashcards, labo et activites.
## Contraintes de design
Champs compatibles avec composants V3.
## Contraintes DYS et accessibilite
Alternatives de schemas/formules obligatoires.
## Contraintes de securite et de performance
Types stricts, pas de HTML libre non marque.
## Livrables
Schema versionne et tests.
## Commandes a executer
`npm.cmd test`, `npm.cmd run verify:content`.
## Tests obligatoires
Fixtures valides/invalides.
## Comparaison avant/apres
Anciens contenus toujours publiables.
## Criteres d'acceptation
0 bloquant non justifie.
## Procedure de retour arriere
Revenir au contrat precedent.
## Rapport final
Champs ajoutes et dettes.
## Evaluation selon les six criteres d'AGENTS.md
Minimum 9/10 chacun.
