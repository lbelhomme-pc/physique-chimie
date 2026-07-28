# Migration contenus 4e et 3e

## Contexte verifie
College 4e et 3e couvrent physique et chimie avec cours, exercices, quiz, flashcards.
## Objectif unique
Normaliser le lot 4e-3e vers V3.
## Agents responsables
Enseignant PC, architecte contenus, QA.
## Prerequis
Prompt 27 termine.
## Fichiers a lire
`src/data/chapters/college/4eme/`, `src/data/chapters/college/3eme/`, `BO/BO_College.pdf`.
## Perimetre autorise
Contenus 4e-3e PC.
## Fichiers pouvant etre modifies
MDX/JSON du lot, tests contenu.
## Fichiers interdits
Lycee et maths.
## Travaux a realiser
Normalisation, corrections scientifiques, alternatives SVG.
## Contraintes de migration
Routes et IDs conserves.
## Contraintes pedagogiques
Preparation brevet si pertinente.
## Contraintes de design
Graphiques sans chevauchement.
## Contraintes DYS et accessibilite
Schemas non `aria-hidden` s'ils sont utiles.
## Contraintes de securite et de performance
Sanitisation preservee.
## Livrables
Lot 4e-3e valide.
## Commandes a executer
`npm.cmd test`, `npm.cmd run verify:content`, `npm.cmd run build`.
## Tests obligatoires
Routes, schemas, contenu.
## Comparaison avant/apres
Aucune perte.
## Criteres d'acceptation
Lot 4e-3e 9/10 partout.
## Procedure de retour arriere
Revert du lot.
## Rapport final
Chapitres traites.
## Evaluation selon les six criteres d'AGENTS.md
Minimum 9/10 chacun.
