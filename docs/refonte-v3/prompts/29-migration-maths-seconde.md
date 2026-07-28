# Migration mathematiques seconde

## Contexte verifie
11 chapitres mathematiques de seconde existent.
## Objectif unique
Migrer la verticale mathematiques seconde comme pilote discipline.
## Agents responsables
Enseignant maths, architecte contenus, UX, QA.
## Prerequis
Prompts 06, 12, 15, 16, 17, 20 termines.
## Fichiers a lire
`src/data/mathematiques/`, `src/pages/mathematiques/`, composants mathematiques.
## Perimetre autorise
Mathematiques seconde.
## Fichiers pouvant etre modifies
Donnees maths seconde, composants maths necessaires.
## Fichiers interdits
PC et enseignement scientifique.
## Travaux a realiser
Structure cours, exercices, quiz, flashcards, activite pilote.
## Contraintes de migration
Routes maths conservees.
## Contraintes pedagogiques
Conformite programme seconde.
## Contraintes de design
Accent mathematiques distinct.
## Contraintes DYS et accessibilite
Formules KaTeX accessibles.
## Contraintes de securite et de performance
Pas d'eval de formules utilisateur.
## Livrables
Pilote maths.
## Commandes a executer
`npm.cmd test`, `npm.cmd run verify:content`, `npm.cmd run build`.
## Tests obligatoires
Routes maths et rendu formules.
## Comparaison avant/apres
Contenu preserve.
## Criteres d'acceptation
Pilote validable.
## Procedure de retour arriere
Revert du lot.
## Rapport final
Chapitres traites.
## Evaluation selon les six criteres d'AGENTS.md
Minimum 9/10 chacun.
