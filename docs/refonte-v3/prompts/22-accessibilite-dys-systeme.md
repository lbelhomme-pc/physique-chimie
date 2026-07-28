# Accessibilite et DYS systeme

## Contexte verifie
La V2 propose deja un panneau DYS mais doit l'integrer au design system.
## Objectif unique
Refondre les preferences DYS/accessibilite.
## Agents responsables
Expert accessibilite, UI, QA.
## Prerequis
Prompts 08 et 09 termines.
## Fichiers a lire
`src/components/accessibility/`, `src/data/accessibility/`, `src/styles/design-system.css`.
## Perimetre autorise
Accessibilite globale.
## Fichiers pouvant etre modifies
Panneau, tokens, guide lecture, tests.
## Fichiers interdits
Contenus pedagogiques hors alternatives necessaires.
## Travaux a realiser
Police, taille, interligne, contraste, mouvement, focus.
## Contraintes de migration
Preferences existantes preservees.
## Contraintes pedagogiques
Charge cognitive reduite.
## Contraintes de design
Panneau integre a V3.
## Contraintes DYS et accessibilite
Navigation clavier et lecteur ecran.
## Contraintes de securite et de performance
Pas de CDN de police requis.
## Livrables
Systeme DYS V3.
## Commandes a executer
`npm.cmd run check`, `npm.cmd run build`.
## Tests obligatoires
axe, clavier, revue manuelle.
## Comparaison avant/apres
Preferences conservees.
## Criteres d'acceptation
Critere DYS au moins 9/10.
## Procedure de retour arriere
Restaurer panneau precedent.
## Rapport final
Matrice DYS.
## Evaluation selon les six criteres d'AGENTS.md
Minimum 9/10 chacun.
