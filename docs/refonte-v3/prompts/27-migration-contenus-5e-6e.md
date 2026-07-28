# Migration contenus 5e et 6e

## Contexte verifie
College 5e et 6e sont deja amorces en physique-chimie.
## Objectif unique
Migrer/normaliser le lot 5e-6e vers les structures V3.
## Agents responsables
Enseignant PC, architecte contenus, QA.
## Prerequis
Prompts 06, 14, 15, 16, 17 termines.
## Fichiers a lire
`src/data/chapters/college/5eme/`, `src/data/chapters/college/6eme/`, `BO/BO_College.pdf`.
## Perimetre autorise
Contenus 5e-6e PC seulement.
## Fichiers pouvant etre modifies
MDX/JSON du lot, tests contenu.
## Fichiers interdits
Autres niveaux.
## Travaux a realiser
Sources, objectifs, lecons, exercices, quiz, flashcards, liens labo.
## Contraintes de migration
IDs et routes conserves.
## Contraintes pedagogiques
Niveau cycle 3/4 adapte.
## Contraintes de design
Schemas lisibles.
## Contraintes DYS et accessibilite
SVG title/desc.
## Contraintes de securite et de performance
Pas de HTML dangereux.
## Livrables
Lot valide.
## Commandes a executer
`npm.cmd test`, `npm.cmd run verify:content`, `npm.cmd run build`.
## Tests obligatoires
Contenu et routes du lot.
## Comparaison avant/apres
Aucune perte.
## Criteres d'acceptation
Lot 5e-6e 9/10 partout.
## Procedure de retour arriere
Revert du lot.
## Rapport final
Chapitres traites.
## Evaluation selon les six criteres d'AGENTS.md
Minimum 9/10 chacun.
