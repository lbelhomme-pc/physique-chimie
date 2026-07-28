# Performance et tailles de reference

## Build

- Sortie : statique.
- Dossier : `dist/`.
- Pages HTML generees : 314.
- Temps de build observe apres prompt 33 : 74.8 s en mode silencieux.
- Audit dist segmente : 27 476 controles, 0 erreur, 0 avertissement.
- Budgets finaux observes : HTML max 385 099 octets, page max 484 438 octets, JS global 899 509 octets, CSS global 295 532 octets.

## Plus gros fichiers generes dans `dist/_astro`

| Fichier | Taille brute |
|---|---:|
| `MathText.dopq935f.js` | 266897 octets |
| `client.nFz3bvDj.js` | 186619 octets |
| `GenericLabSimulator...BVrVrnv3.js` | 99159 octets |
| `_slug_.Cnt5Nd91.css` | 86463 octets |
| `KaTeX_AMS-Regular.DRggAlZN.ttf` | 63632 octets |
| `KaTeX_Main-Regular.ypZvNtVU.ttf` | 53580 octets |
| `KaTeX_Main-Bold.waoOVXN0.ttf` | 51336 octets |
| `TitrationPhSimulator...Dt5Dn0Pr.js` | 31084 octets |

## Optimisation prompt 33

Les pages de memorisation globale ne portent plus les banques completes en props Astro/React. Les donnees sont generees dans des endpoints JSON statiques et chargees en differe par les lecteurs React.

| Route ou asset | Avant prompt 33 | Apres prompt 33 | Gain |
|---|---:|---:|---:|
| `/memorisation/mega-quiz/index.html` | 1 874 418 octets | 32 100 octets | -98.3 % |
| `/memorisation/mega-flashcards/index.html` | 1 527 527 octets | 32 190 octets | -97.9 % |
| `/memorisation/mega-quiz-data.json` | n/a | 1 081 640 octets | donnees separees |
| `/memorisation/mega-flashcards-data.json` | n/a | 867 294 octets | donnees separees |

Budgets appliques apres prompt 33 :

- route par defaut : 450 000 octets HTML, 800 000 octets total page ;
- routes mega-memorisation : 60 000 octets HTML, 160 000 octets total page ;
- global JS : 1 000 000 octets ;
- global CSS : 350 000 octets.

## Plus gros scripts source laboratoire

| Fichier source | Taille |
|---|---:|
| `src/scripts/laboratoire/generic-lab-simulator.js` | 196922 octets |
| `src/scripts/laboratoire/titration-ph-simulator.js` | 35824 octets |
| `src/scripts/laboratoire/ideal-gas-simulator.js` | 27475 octets |
| `src/scripts/laboratoire/circuit-rc-simulator.js` | 23224 octets |
| `src/scripts/laboratoire/circuit-rc.js` | 21411 octets |
| `src/scripts/laboratoire/diffusion-temperature-simulator.js` | 19772 octets |
| `src/scripts/laboratoire/titration-ph-model.js` | 19401 octets |
| `src/scripts/laboratoire/kepler-laws-simulator.js` | 17402 octets |

Risques V3 :

- `MathText` et le client React commun doivent etre suivis par budget.
- `generic-lab-simulator.js` reste une cible prioritaire de decoupage.
- Les polices KaTeX sont normales pour le rendu formule, mais doivent etre prises en compte dans les budgets.
