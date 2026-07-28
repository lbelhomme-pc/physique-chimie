# Correctifs de securite critiques

## Contexte verifie
La V2 possede `trustedContent.ts`, mais du rendu HTML/SVG de confiance et des laboratoires restent sensibles.
## Objectif unique
Corriger uniquement les risques de securite critiques immediats.
## Agents responsables
Expert securite, architecte Astro, expert QA.
## Prerequis
Prompt 01 termine.
## Fichiers a lire
`src/utils/trustedContent.ts`, `src/components/pedagogie/RawHtml.astro`, `docs/architecture/securite-contenus.md`, fichiers utilisant `set:html`.
## Perimetre autorise
Sanitisation, tests securite, documentation CSP.
## Fichiers pouvant etre modifies
`src/utils/trustedContent.ts`, tests securite, docs securite.
## Fichiers interdits
Contenus pedagogiques hors cas de securite.
## Travaux a realiser
Verifier injections HTML/SVG, URL dangereuses, styles inline et KaTeX.
## Contraintes de migration
Ne pas casser les fragments legacy valides.
## Contraintes pedagogiques
Conserver les tableaux, formules et SVG utiles.
## Contraintes de design
Pas de changement visuel volontaire.
## Contraintes DYS et accessibilite
Ne pas supprimer `title`, `desc`, `aria-*` utiles.
## Contraintes de securite et de performance
Ajouter tests minimaux pour chaque faille corrigee.
## Livrables
Correctifs scopes et rapport.
## Commandes a executer
`npm.cmd test`, `npm.cmd run check`, `npm.cmd run build`.
## Tests obligatoires
Tests d'injection et non-regression rendu.
## Comparaison avant/apres
Payloads dangereux neutralises.
## Criteres d'acceptation
0 regression et protections prouvees.
## Procedure de retour arriere
Revert du commit de correctif uniquement.
## Rapport final
Lister failles corrigees et preuves.
## Evaluation selon les six criteres d'AGENTS.md
Minimum 9/10 chacun.
