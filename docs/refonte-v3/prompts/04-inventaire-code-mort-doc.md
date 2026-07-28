# Inventaire code mort et documentation

## Contexte verifie
Le depot contient beaucoup de docs, rapports et fichiers historiques.
## Objectif unique
Identifier le code mort et les documents obsoletes sans suppression destructive.
## Agents responsables
Architecte Astro, responsable migration, expert QA.
## Prerequis
Prompt 01 termine.
## Fichiers a lire
`docs/`, `src/`, `scripts/`, `tests/`, rapports racine.
## Perimetre autorise
Inventaire et marquage documentaire.
## Fichiers pouvant etre modifies
`docs/refonte-v3/03-inventaire-contenus.md`, nouveaux rapports.
## Fichiers interdits
Suppression de fichiers actifs.
## Travaux a realiser
Classer actif, legacy utile, obsolete probable, a verifier.
## Contraintes de migration
Ne rien supprimer avant prompt dedie.
## Contraintes pedagogiques
Ne pas declarer inutile un contenu non relu.
## Contraintes de design
Relever styles actifs et styles morts probables.
## Contraintes DYS et accessibilite
Identifier docs/fonctions DYS.
## Contraintes de securite et de performance
Identifier dependances et scripts non appeles.
## Livrables
Inventaire avec preuves.
## Commandes a executer
`npm.cmd run lint`, recherche imports, `npm.cmd run build`.
## Tests obligatoires
Build apres inventaire si aucun changement actif.
## Comparaison avant/apres
Pas de changement fonctionnel.
## Criteres d'acceptation
Rien n'est supprime, chaque categorie est justifiee.
## Procedure de retour arriere
Retirer uniquement les notes ajoutees.
## Rapport final
Tableau des zones a traiter.
## Evaluation selon les six criteres d'AGENTS.md
Minimum 9/10 chacun.
