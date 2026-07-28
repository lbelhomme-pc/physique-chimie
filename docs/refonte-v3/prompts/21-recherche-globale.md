# Recherche globale

## Contexte verifie
`GlobalSearch.tsx` existe et les tests couvrent le corpus.
## Objectif unique
Refondre la recherche globale V3.
## Agents responsables
UX, architecte contenus, performance.
## Prerequis
Prompts 06 et 13 termines.
## Fichiers a lire
`src/components/search/GlobalSearch.tsx`, tests recherche, donnees contenus.
## Perimetre autorise
Recherche, index, UI resultats.
## Fichiers pouvant etre modifies
Composants recherche, indexation, tests.
## Fichiers interdits
Contenus sources sauf metadonnees manquantes pilote.
## Travaux a realiser
Resultats par discipline, niveau, type, acces.
## Contraintes de migration
Ancres et routes valides.
## Contraintes pedagogiques
Resultats pertinents pour notion et competence.
## Contraintes de design
Resultats scannables.
## Contraintes DYS et accessibilite
Combobox accessible.
## Contraintes de securite et de performance
Index leger.
## Livrables
Recherche V3.
## Commandes a executer
`npm.cmd test`, `npm.cmd run build`.
## Tests obligatoires
Recherche par titre, slug, mot-cle.
## Comparaison avant/apres
Meilleure pertinence.
## Criteres d'acceptation
0 lien casse.
## Procedure de retour arriere
Restaurer recherche.
## Rapport final
Cas testes.
## Evaluation selon les six criteres d'AGENTS.md
Minimum 9/10 chacun.
