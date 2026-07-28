# Design system composants de base

## Contexte verifie
Les composants actuels sont disperses entre pedagogie, UI et navigation.
## Objectif unique
Creer les composants de base V3 en isolation.
## Agents responsables
Expert design system, UI, architecte Astro.
## Prerequis
Prompt 08 termine.
## Fichiers a lire
`src/components/ui/`, `src/components/pedagogie/ChapterPageShell.astro`, docs V3 design.
## Perimetre autorise
Composants non branches ou prototypes documentaires.
## Fichiers pouvant etre modifies
`src/components/design-system/` ou `docs/refonte-v3/prototypes/`.
## Fichiers interdits
Pages actives hors integration pilote.
## Travaux a realiser
Boutons, cartes, tabs, badges, formulaires, etats.
## Contraintes de migration
Ne pas remplacer tous les composants.
## Contraintes pedagogiques
Inclure blocs notion/definition/methode.
## Contraintes de design
Rayon 8px par defaut, pas de cartes imbriquees.
## Contraintes DYS et accessibilite
Focus visible, labels, clavier.
## Contraintes de securite et de performance
Pas de dependance inutile.
## Livrables
Composants et exemples.
## Commandes a executer
`npm.cmd run check`, `npm.cmd run lint`, `npm.cmd run build`.
## Tests obligatoires
Rendu et typecheck.
## Comparaison avant/apres
Pas de regression V2.
## Criteres d'acceptation
Etats couverts.
## Procedure de retour arriere
Supprimer composants V3 isoles.
## Rapport final
Composants crees.
## Evaluation selon les six criteres d'AGENTS.md
Minimum 9/10 chacun.
