# Design tokens V3

## Contexte verifie
`design-system.css` contient tokens, themes et DYS melanges.
## Objectif unique
Creer les tokens V3 sans refondre les pages.
## Agents responsables
Expert design system, UI, accessibilite.
## Prerequis
Prompt 01 termine.
## Fichiers a lire
`src/styles/design-system.css`, `src/data/accessibility/theme-tokens.ts`, `src/components/accessibility/theme-tokens.ts`.
## Perimetre autorise
Tokens CSS/TS et documentation.
## Fichiers pouvant etre modifies
Nouveaux fichiers tokens, imports prudents si necessaire.
## Fichiers interdits
Refonte des composants actifs.
## Travaux a realiser
Definir couleurs, typo, espacements, rayons, ombres, etats, DYS.
## Contraintes de migration
Compatibilite avec variables actuelles.
## Contraintes pedagogiques
Couleurs semantiques pour blocs pedagogiques.
## Contraintes de design
Pas de palette mono-teinte.
## Contraintes DYS et accessibilite
Letter-spacing 0 par defaut dans la cible.
## Contraintes de securite et de performance
Pas de CDN de police dans la cible.
## Livrables
Tokens documentes et prototype.
## Commandes a executer
`npm.cmd run check`, `npm.cmd run build`.
## Tests obligatoires
Build et revue visuelle rapide.
## Comparaison avant/apres
Pas de changement actif non voulu.
## Criteres d'acceptation
Tokens complets et compatibles.
## Procedure de retour arriere
Retirer les nouveaux tokens.
## Rapport final
Table des tokens.
## Evaluation selon les six criteres d'AGENTS.md
Minimum 9/10 chacun.
