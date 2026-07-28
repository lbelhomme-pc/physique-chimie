# SEO et donnees structurees

## Contexte verifie
BaseLayout gere SEO et sitemap, mais la V3 doit fiabiliser les types.
## Objectif unique
Finaliser SEO, canonical, sitemap et schema.org.
## Agents responsables
Expert SEO, architecte Astro, QA.
## Prerequis
Prompts routes et pages termines.
## Fichiers a lire
`BaseLayout.astro`, `site.ts`, `robots.txt.ts`, `manifest.json.ts`, sitemap config.
## Perimetre autorise
SEO technique.
## Fichiers pouvant etre modifies
Layout, config site, pages manifest/robots, tests.
## Fichiers interdits
Contenus hors metadonnees.
## Travaux a realiser
Canonical, noindex, Course/LearningResource, SearchAction si route existe.
## Contraintes de migration
Redirections documentees.
## Contraintes pedagogiques
Metas utiles et non trompeuses.
## Contraintes de design
Aucune.
## Contraintes DYS et accessibilite
Langue fr correcte.
## Contraintes de securite et de performance
Pas de scripts tiers SEO inutiles.
## Livrables
SEO V3.
## Commandes a executer
`npm.cmd run build`, audit SEO.
## Tests obligatoires
Sitemap, canonical, JSON-LD.
## Comparaison avant/apres
Metas plus precises.
## Criteres d'acceptation
0 route incoherente.
## Procedure de retour arriere
Restaurer layout/config.
## Rapport final
Routes controlees.
## Evaluation selon les six criteres d'AGENTS.md
Minimum 9/10 chacun.
