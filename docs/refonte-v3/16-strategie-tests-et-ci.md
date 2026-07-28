# Strategie tests et CI

Tests obligatoires par phase :

- `npm.cmd run check`
- `npm.cmd run lint`
- `npm.cmd test`
- `npm.cmd run verify:content`
- `npm.cmd run build`
- audit dist segmente

Tests a ajouter :

- schema strict des contenus V3 ;
- generation de routes et redirections ;
- migration de localStorage ;
- droits Gratuit/Premium ;
- accessibilite axe par echantillon ;
- navigation clavier ;
- regression visuelle desktop/mobile ;
- budgets JS/CSS/HTML ;
- SEO structured data ;
- snapshots de contenus critiques.

Regle : ne pas reporter toutes les validations a la fin. Chaque prompt doit avoir ses preuves.
