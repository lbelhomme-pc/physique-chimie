# Pages niveaux et catalogues

## Contexte verifie
Des pages college/lycee/niveau/matiere existent deja.
## Objectif unique
Refondre les catalogues sans toucher au lecteur chapitre.
## Agents responsables
UX, architecte information, Astro, SEO.
## Prerequis
Prompt 12 termine.
## Fichiers a lire
`src/pages/college/**`, `src/pages/lycee/**`, `src/pages/mathematiques/**`.
## Perimetre autorise
Index niveaux, matieres, catalogues.
## Fichiers pouvant etre modifies
Pages de catalogue et composants cartes.
## Fichiers interdits
`[chapitre].astro` sauf lien necessaire.
## Travaux a realiser
Filtres, progression visuelle, etats vide, liens.
## Contraintes de migration
Routes existantes conservees.
## Contraintes pedagogiques
Chapitres ordonnes par programme.
## Contraintes de design
Listes scannables, pas trop de cartes decoratives.
## Contraintes DYS et accessibilite
Titres hierarchises, focus.
## Contraintes de securite et de performance
Pas de recherche client lourde si inutile.
## Livrables
Catalogues V3.
## Commandes a executer
`npm.cmd run verify:content`, `npm.cmd run build`.
## Tests obligatoires
Routes et liens.
## Comparaison avant/apres
Nombre de chapitres identique.
## Criteres d'acceptation
Aucun chapitre perdu.
## Procedure de retour arriere
Restaurer pages catalogue.
## Rapport final
Routes concernees.
## Evaluation selon les six criteres d'AGENTS.md
Minimum 9/10 chacun.
