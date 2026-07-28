# Performance et budgets

## Contexte verifie
Build OK, mais certains bundles/scripts sont lourds.
## Objectif unique
Definir et appliquer les budgets performance V3.
## Agents responsables
Expert performance, architecte Astro, QA.
## Prerequis
Prompts design et labo termines.
## Fichiers a lire
Build output, `scripts/audit-dist.mjs`, scripts laboratoire, composants client.
## Perimetre autorise
Optimisations performance ciblees.
## Fichiers pouvant etre modifies
Imports, hydration, scripts, budgets, tests.
## Fichiers interdits
Refonte fonctionnelle non liee.
## Travaux a realiser
Lazy loading, decoupage, budgets JS/CSS/HTML.
## Contraintes de migration
Fonctions conservees.
## Contraintes pedagogiques
Pas de degradation des simulations utiles.
## Contraintes de design
Pas de flash visuel.
## Contraintes DYS et accessibilite
Respect reduced motion.
## Contraintes de securite et de performance
Budgets prouvés.
## Livrables
Rapport perf et correctifs.
## Commandes a executer
`npm.cmd run build`, audit dist segmente.
## Tests obligatoires
Bundles et pages representatives.
## Comparaison avant/apres
Tailles avant/apres.
## Criteres d'acceptation
Budgets respectes ou exceptions justifiees.
## Procedure de retour arriere
Restaurer imports/scripts.
## Rapport final
Mesures.
## Evaluation selon les six criteres d'AGENTS.md
Minimum 9/10 chacun.
