# Migration lycee physique-chimie

## Contexte verifie
Le lycee PC contient seconde, premiere spe, terminale spe et enseignement scientifique partiel.
## Objectif unique
Migrer les contenus lycee PC hors enseignement scientifique dedie.
## Agents responsables
Enseignant PC, architecte contenus, QA, SEO.
## Prerequis
Prompts 27 et 28 termines.
## Fichiers a lire
`src/data/chapters/lycee/2nde/`, `1ere-spe/`, `terminale-spe/`, BO correspondants.
## Perimetre autorise
Lycee PC spe et seconde.
## Fichiers pouvant etre modifies
MDX/JSON du lot.
## Fichiers interdits
Enseignement scientifique si prompt 31 non lance.
## Travaux a realiser
Normaliser contenus, sources, exercices, labo, annales si presentes.
## Contraintes de migration
Routes conservees.
## Contraintes pedagogiques
Niveau lycee et exactitude scientifique.
## Contraintes de design
Pages longues scindees.
## Contraintes DYS et accessibilite
Formules et graphiques accessibles.
## Contraintes de securite et de performance
Controle HTML.
## Livrables
Lot lycee PC.
## Commandes a executer
`npm.cmd test`, `npm.cmd run verify:content`, `npm.cmd run build`.
## Tests obligatoires
Routes et schema contenu.
## Comparaison avant/apres
Aucune perte.
## Criteres d'acceptation
Lot valide.
## Procedure de retour arriere
Revert du lot.
## Rapport final
Chapitres traites.
## Evaluation selon les six criteres d'AGENTS.md
Minimum 9/10 chacun.
