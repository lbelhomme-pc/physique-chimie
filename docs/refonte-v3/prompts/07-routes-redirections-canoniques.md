# Routes et redirections canoniques

## Contexte verifie
Physique-chimie possede routes legacy et routes explicites.
## Objectif unique
Definir la strategie route V3 et les redirections testees.
## Agents responsables
Architecte Astro, expert SEO, responsable migration.
## Prerequis
Prompts 01, 05 et 06 termines.
## Fichiers a lire
`src/data/contentRoutes.ts`, `src/pages/**`, `scripts/verify-routes-and-content.mjs`.
## Perimetre autorise
Helpers routes, tests, documentation.
## Fichiers pouvant etre modifies
Routes helper, tests routes, docs.
## Fichiers interdits
Suppression des anciennes pages.
## Travaux a realiser
Inventorier canonicals, legacy, futures redirections et 404.
## Contraintes de migration
Ne casser aucune URL sans redirection.
## Contraintes pedagogiques
Routes lisibles par niveau et discipline.
## Contraintes de design
Navigation coherente.
## Contraintes DYS et accessibilite
Breadcrumbs accessibles.
## Contraintes de securite et de performance
Pas de redirection client inutile.
## Livrables
Carte de routes et tests.
## Commandes a executer
`npm.cmd run verify:content`, `npm.cmd run build`.
## Tests obligatoires
Chaque redirection prevue a une cible.
## Comparaison avant/apres
Routes legacy conservees.
## Criteres d'acceptation
0 route perdue.
## Procedure de retour arriere
Revenir aux helpers precedents.
## Rapport final
Routes changees, conservees, futures.
## Evaluation selon les six criteres d'AGENTS.md
Minimum 9/10 chacun.
