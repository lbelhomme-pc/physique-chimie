# Validation des commandes

Date d'execution : 2026-07-27.

| Commande | Resultat | Preuve principale |
|---|---|---|
| `npm.cmd run check` | OK | 179 fichiers controles, 0 erreur, 23 hints/avertissements |
| `npm.cmd run lint` | OK | 0 erreur, 23 avertissements ESLint |
| `npm.cmd test` | OK | 91 tests passes, 0 echec |
| `npm.cmd run verify:content` | OK | 34461 controles, 0 erreur, 0 avertissement |
| `npm.cmd run build` | OK | 314 pages generees en 132.32 s |

Details utiles :

- `npm.cmd run check` signale surtout des imports/variables non utilises et deux hints Astro sur des scripts traites inline.
- `npm.cmd run lint` reprend les memes zones : composants pedagogiques, gamification et scripts de laboratoire.
- `npm.cmd test` couvre contrats de contenu, IDs, migration localStorage, SRS, modeles scientifiques, routes, recherche, securite HTML/SVG, expressions scientifiques et configuration site.
- `npm.cmd run verify:content` confirme 101 chapitres physique-chimie, 11 chapitres mathematiques, 14 routes dynamiques, 150 routes publiques attendues et 25 laboratoires.
- `npm.cmd run build` confirme la sortie statique Astro dans `dist/`.

Commande non incluse dans le prompt 01 mais deja identifiee :

- `npm.cmd run audit:dist` avait depasse environ 4 minutes lors de la mission de cadrage. Il doit etre segmente au prompt 03.
