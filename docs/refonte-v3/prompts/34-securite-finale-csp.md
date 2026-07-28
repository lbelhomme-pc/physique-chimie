# Securite finale et CSP

## Contexte verifie
Une proposition CSP existe mais n'est pas forcement appliquee.
## Objectif unique
Preparer la securite finale V3.
## Agents responsables
Expert securite, architecte Astro, QA.
## Prerequis
Prompts 02, 25, 26, 33 termines.
## Fichiers a lire
`docs/architecture/securite-contenus.md`, config hebergeur, layout.
## Perimetre autorise
CSP, headers, secrets, dependances.
## Fichiers pouvant etre modifies
Config deploy, docs, tests securite.
## Fichiers interdits
Fonctions produit non liees.
## Travaux a realiser
CSP, headers, audit deps, tiers, analytics consent.
## Contraintes de migration
Ne pas casser KaTeX ni styles Astro sans test.
## Contraintes pedagogiques
Contenus riches preservés.
## Contraintes de design
Pas de regression style.
## Contraintes DYS et accessibilite
Polices locales compatibles CSP.
## Contraintes de securite et de performance
En-tetes stricts.
## Livrables
Securite finale.
## Commandes a executer
`npm.cmd test`, `npm.cmd run build`, audit securite.
## Tests obligatoires
Payloads et headers.
## Comparaison avant/apres
CSP plus stricte.
## Criteres d'acceptation
Pas de faille critique connue.
## Procedure de retour arriere
Assouplir CSP documentee.
## Rapport final
En-tetes et risques restants.
## Evaluation selon les six criteres d'AGENTS.md
Minimum 9/10 chacun.
