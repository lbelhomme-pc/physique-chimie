# Etat de reference V2

Date de reference : 2026-07-27.

Commandes executees :

| Commande | Resultat |
|---|---|
| `npm.cmd run check` | succes, 0 erreur, 23 hints/avertissements Astro/TS |
| `npm.cmd test` | succes, 91 tests passes |
| `npm.cmd run verify:content` | succes, 34461 controles, 0 erreur, 0 avertissement |
| `npm.cmd run lint` | succes, 0 erreur, 23 avertissements |
| `npm.cmd run build` | succes, 314 pages generees |
| `npm.cmd run audit:dist` | timeout apres environ 4 minutes, a segmenter |

Chiffres verifies :

- 101 chapitres physique-chimie sous `src/data/chapters/`
- 11 chapitres mathematiques sous `src/data/mathematiques/`
- 112 chapitres controles par le contrat commun
- 25 applications de laboratoire
- 150 routes publiques attendues par `verify:content`
- 314 pages generees par Astro
- plus gros script source laboratoire : `src/scripts/laboratoire/generic-lab-simulator.js`, 196922 octets
- plus gros bundle client observe : `MathText`, environ 266 kB brut, 79.78 kB gzip

Etat Git :

Le depot contenait deja de nombreux fichiers modifies et non suivis avant cette mission. Les futurs prompts doivent eviter toute remise a zero et travailler par changements scopes.

Reference detaillee creee par le prompt 01 :

- `docs/refonte-v3/reference/README.md`
- `docs/refonte-v3/reference/rapport-reference-2026-07-27.md`
- `docs/refonte-v3/reference/validation-commandes.md`
- `docs/refonte-v3/reference/inventaire-routes-contenus.md`
- `docs/refonte-v3/reference/performance-tailles.md`
- `docs/refonte-v3/reference/stockage-accessibilite.md`
- `docs/refonte-v3/reference/captures/`
