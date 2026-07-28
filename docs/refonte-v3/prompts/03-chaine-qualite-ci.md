# Chaine qualite et CI

## Contexte verifie
Les scripts existent, mais `audit:dist` depasse 4 minutes.
## Objectif unique
Rendre les validations locales et CI fiables.
## Agents responsables
Expert QA, architecte Astro, expert performance.
## Prerequis
Prompts 01 et 02 termines.
## Fichiers a lire
`package.json`, `scripts/audit-dist.mjs`, `tests/`, `.github/`.
## Perimetre autorise
Scripts de validation, configuration CI, documentation.
## Fichiers pouvant etre modifies
`package.json`, scripts, tests, `.github/`, docs.
## Fichiers interdits
Contenus pedagogiques.
## Travaux a realiser
Segmenter `audit:dist`, definir jobs rapides/lents, documenter temps attendus.
## Contraintes de migration
Les scripts existants doivent rester appelables.
## Contraintes pedagogiques
Ajouter controle contenu sans changer le contenu.
## Contraintes de design
Prevoir futur controle visuel.
## Contraintes DYS et accessibilite
Prevoir axe par echantillon.
## Contraintes de securite et de performance
Ajouter budgets et audit dependances si possible.
## Livrables
CI et rapport de validation.
## Commandes a executer
`npm.cmd run ci` ou equivalent segmente.
## Tests obligatoires
Tous les jobs crees.
## Comparaison avant/apres
Audit dist ne doit plus bloquer la CI.
## Criteres d'acceptation
Commandes stables et documentees.
## Procedure de retour arriere
Restaurer scripts precedents.
## Rapport final
Temps, resultats, limites.
## Evaluation selon les six criteres d'AGENTS.md
Minimum 9/10 chacun.
