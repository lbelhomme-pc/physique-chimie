# Rapport tests E2E et regression visuelle V3 - 2026-07-28

## Sources relues

- `docs/refonte-v3/README.md`
- `docs/refonte-v3/00-resume-executif.md`
- `docs/refonte-v3/prompts/35-tests-e2e-regression-visuelle.md`
- `docs/refonte-v3/16-strategie-tests-et-ci.md`
- `docs/refonte-v3/17-maquettes-et-ecrans-reference.md`
- `docs/refonte-v3/04-audit-design-images.md`
- `scripts/audit-dist.mjs`
- `tests/fixtures/dist-audit.config.json`
- Pages et composants representatifs : navigation publique, page chapitre, quiz, flashcards, laboratoire RC, kit scientifique, panneau accessibilite/DYS.

## Perimetre realise

Le prompt 35 met en place une suite E2E et visuelle representative, sans correction UI ni modification de contenus actifs.

Fichiers crees ou modifies :

- `tests/fixtures/e2e-visual.config.json` : declaration des parcours critiques, selecteurs, textes attendus, exigences clavier et captures.
- `scripts/e2e-visual-regression.mjs` : runner E2E statique et generateur de captures via navigateur headless local.
- `tests/e2e-visual-regression-v3.test.mjs` : garde-fous sur la couverture des parcours, des captures et du runner.
- `package.json` : scripts `e2e:visual` et `e2e:visual:check`.
- `tsconfig.json` : exclusion du runner E2E Node pour eviter son interpretation comme code applicatif Astro.
- `docs/refonte-v3/reference/captures/e2e-visual-v3-2026-07-28/` : captures et manifeste.
- `docs/refonte-v3/reference/rapport-tests-e2e-regression-visuelle-v3-2026-07-28.md` : present rapport.

## Parcours couverts

| Parcours | Route | Couverture |
| --- | --- | --- |
| Accueil public V3 | `/` | H1, navigation publique, recherche, cartes disciplines, chemin clavier, desktop, mobile, profil DYS |
| Catalogue college | `/college/4eme/chimie` | presence niveau/discipline, lien chapitre, desktop, mobile |
| Chapitre cours/exercices/quiz/flashcards | `/college/4eme/chimie/atomes-molecules` | titre, onglets, contenus pedagogiques, chemin clavier, desktop, mobile |
| Mega quiz | `/memorisation/mega-quiz` | shell memorisation, presence de banque de questions, desktop, mobile |
| Mega flashcards | `/memorisation/mega-flashcards` | shell memorisation, presence de cartes, desktop, mobile |
| Laboratoire RC | `/laboratoire/circuit-rc` | racine labo, guide accessible, graphique SVG, desktop, mobile |
| Kit scientifique | `/outils-methodes/kit-scientifique` | formulaire, action, tableau, desktop, mobile |
| Legacy mega quiz | `/mega-quiz` | route legacy et redirection vers `/memorisation/mega-quiz`, capture desktop |

Le runner verifie aussi que le build accepte les deux formes de sortie Astro attendues pour les pages statiques : `route/index.html` et `route.html`.

## Captures generees

Manifeste : `docs/refonte-v3/reference/captures/e2e-visual-v3-2026-07-28/manifest.json`

Generation du 2026-07-28 a 16:25:32 UTC :

- 8 parcours.
- 85 controles.
- 0 erreur.
- 16 captures.
- Navigateur : `C:/Program Files/Google/Chrome/Application/chrome.exe`.

Captures :

- `accueil-public-desktop-1440x1100.png`
- `accueil-public-mobile-390x844.png`
- `accueil-public-dyslexia-390x844.png`
- `catalogue-college-desktop-1440x1000.png`
- `catalogue-college-mobile-390x844.png`
- `chapitre-cours-quiz-flashcards-desktop-1440x1100.png`
- `chapitre-cours-quiz-flashcards-mobile-390x844.png`
- `mega-quiz-desktop-1440x1000.png`
- `mega-quiz-mobile-390x844.png`
- `mega-flashcards-desktop-1440x1000.png`
- `mega-flashcards-mobile-390x844.png`
- `laboratoire-circuit-rc-desktop-1440x1100.png`
- `laboratoire-circuit-rc-mobile-390x844.png`
- `kit-scientifique-desktop-1440x1000.png`
- `kit-scientifique-mobile-390x844.png`
- `legacy-mega-quiz-desktop-1200x800.png`

## Commandes executees

| Commande | Resultat |
| --- | --- |
| `npm.cmd run e2e:visual` | OK, 8 parcours, 85 controles, 16 captures, 0 erreur |
| `npm.cmd run e2e:visual:check` | OK apres rebuild, 8 parcours, 68 controles, 0 erreur |
| `npm.cmd test` | OK, 223 tests passes |
| `npm.cmd run lint` | OK, 0 erreur, 20 avertissements preexistants |
| `npm.cmd run check` | OK, 0 erreur, 22 hints ; lance hors sandbox apres blocage d'acces du cache Vite en environnement restreint |
| `npm.cmd run build -- --silent` | OK |
| `npm.cmd run verify:content` | OK, 34 666 controles, 0 erreur, 0 avertissement |
| `node scripts/audit-dist.mjs --skip-axe` | OK, 314 pages, 27 476 controles, 0 erreur, 0 avertissement |
| `npm.cmd run audit:dist:a11y` | OK, 6 pages axe representatives, 0 violation |

## Comparaison avant/apres

Avant ce prompt, le projet disposait de tests unitaires, d'audits de build et d'accessibilite, mais pas d'un point de reference E2E visuel dedie aux parcours V3.

Apres ce prompt :

- les parcours publics, chapitre, quiz, flashcards, laboratoire, kit scientifique, DYS et legacy sont declares dans une fixture unique ;
- les captures desktop/mobile/DYS sont reproductibles par script ;
- le controle non visuel peut etre lance rapidement en CI ou avant livraison ;
- les captures sont rangees dans `docs/refonte-v3/reference/captures/` avec manifeste.

## Retour arriere

Pour retirer cette couche si elle devenait instable, supprimer uniquement :

- `tests/fixtures/e2e-visual.config.json`
- `scripts/e2e-visual-regression.mjs`
- `tests/e2e-visual-regression-v3.test.mjs`
- les scripts `e2e:visual` et `e2e:visual:check` dans `package.json`
- le dossier `docs/refonte-v3/reference/captures/e2e-visual-v3-2026-07-28/`
- le present rapport et son entree dans `docs/refonte-v3/README.md`

Aucun contenu, composant actif, route publique ou cle de progression n'a ete modifie par le prompt 35.

## Evaluation AGENTS.md

| Critere | Note | Preuves |
| --- | ---: | --- |
| 1. Architecture et maintenabilite | 9.4/10 | Runner dedie, fixture JSON separee, scripts npm explicites, aucun couplage a Playwright/Puppeteer, compatibilite `route/index.html` et `route.html`. |
| 2. UX, UI et coherence du design | 9.2/10 | Captures desktop/mobile sur accueil, catalogue, chapitre, memorisation, laboratoire et kit scientifique ; aucune correction UI hors perimetre. |
| 3. Qualite pedagogique et scientifique | 9.1/10 | Verifications de textes et selecteurs sur cours, exercices, quiz, flashcards, laboratoire RC et kit scientifique ; `verify:content` OK avec 34 666 controles. |
| 4. Accessibilite et DYS | 9.5/10 | Chemins clavier obligatoires sur parcours critiques, capture DYS avec preferences `a11y_preferences`, `audit:dist:a11y` OK avec 0 violation axe sur 6 pages representatives. |
| 5. Qualite technique globale | 9.3/10 | `npm.cmd test`, `lint`, `check`, `build`, `audit-dist --skip-axe`, `audit:dist:a11y` et E2E OK ; 0 erreur bloquante. |
| 6. Completude, migration et validation | 9.4/10 | Legacy `/mega-quiz` capture et redirection controlees ; 16 captures referencees ; procedure de retour arriere documentee ; aucune suppression de route ni contenu. |

