# Architecture future des comptes

## Contexte verifie
Le prompt maitre interdit d'installer arbitrairement auth ou paiement.
## Objectif unique
Concevoir l'architecture compte sans implementation fournisseur.
## Agents responsables
Product, securite, architecte Astro.
## Prerequis
Prompts 23 et 24 termines.
## Fichiers a lire
`docs/refonte-v3/11-comptes-gratuit-premium.md`, `src/config/site.ts`.
## Perimetre autorise
Documentation, interfaces abstraites, tests conceptuels.
## Fichiers pouvant etre modifies
Docs, types d'abstraction si necessaire.
## Fichiers interdits
Dependance auth, paiement, secrets.
## Travaux a realiser
Comparer options, donnees, droits, confidentialite.
## Contraintes de migration
Compatibilite localStorage vers synchro.
## Contraintes pedagogiques
Compte non requis pour comprendre les bases.
## Contraintes de design
Inscription sobre.
## Contraintes DYS et accessibilite
Formulaires accessibles.
## Contraintes de securite et de performance
Pas de secret cote client.
## Livrables
Architecture cible.
## Commandes a executer
`npm.cmd run check` si types ajoutes.
## Tests obligatoires
Revue securite documentaire.
## Comparaison avant/apres
Pas d'implementation active.
## Criteres d'acceptation
Fournisseur non impose.
## Procedure de retour arriere
Retirer docs/types.
## Rapport final
Options comparees.
## Evaluation selon les six criteres d'AGENTS.md
Minimum 9/10 chacun.
