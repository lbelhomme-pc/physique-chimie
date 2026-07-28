# Differenciation des disciplines

## Contexte verifie
La V3 doit distinguer mathematiques, physique-chimie et enseignement scientifique.
## Objectif unique
Mettre en place identites disciplinaires sans dependance a la couleur seule.
## Agents responsables
Architecte information, UI, enseignants.
## Prerequis
Prompts 08 a 11 termines.
## Fichiers a lire
`src/components/navigation/SubjectContext.ts`, donnees niveaux, pages matieres.
## Perimetre autorise
Badges, icones, libelles, accents.
## Fichiers pouvant etre modifies
Navigation, cartes matieres, tokens discipline.
## Fichiers interdits
Contenus scientifiques.
## Travaux a realiser
Icone, label, accent, microcopy pour chaque discipline.
## Contraintes de migration
Conserver routes actuelles.
## Contraintes pedagogiques
Enseignement scientifique ne doit pas etre une sous-rubrique PC.
## Contraintes de design
Couleur + icone + texte.
## Contraintes DYS et accessibilite
Pas d'information par couleur seule.
## Contraintes de securite et de performance
Icones sans dependance lourde.
## Livrables
Systeme de discipline.
## Commandes a executer
`npm.cmd run check`, `npm.cmd run build`.
## Tests obligatoires
Revue a11y couleur.
## Comparaison avant/apres
Disciplines plus lisibles.
## Criteres d'acceptation
Chaque discipline identifiable partout.
## Procedure de retour arriere
Restaurer composants precedents.
## Rapport final
Decisions d'identite.
## Evaluation selon les six criteres d'AGENTS.md
Minimum 9/10 chacun.
