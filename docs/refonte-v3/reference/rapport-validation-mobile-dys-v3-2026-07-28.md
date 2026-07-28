# Rapport validation mobile et DYS V3

Date : 2026-07-28.

## Decision

Validation mobile/DYS acceptee pour la preparation de bascule V3.

Le lot corrige les incoherences detectees sur les captures a 360 px, ajoute une configuration de regression visuelle dediee mobile/tablette/DYS/reduced motion, et produit des captures exploitables pour le controle final.

## Sources relues

- `docs/refonte-v3/README.md`
- `docs/refonte-v3/00-resume-executif.md`
- `docs/refonte-v3/prompts/36-validation-mobile-dys.md`
- `docs/refonte-v3/10-accessibilite-et-dys.md`
- `docs/refonte-v3/17-maquettes-et-ecrans-reference.md`
- `docs/refonte-v3/reference/rapport-accessibilite-dys-systeme-v3-2026-07-28.md`
- `docs/refonte-v3/reference/rapport-tests-e2e-regression-visuelle-v3-2026-07-28.md`

## Travaux realises

### Suite mobile/DYS

- Ajout de `tests/fixtures/mobile-dys-validation.config.json`.
- Ajout des scripts `mobile:dys:visual` et `mobile:dys:check` dans `package.json`.
- Extension de `scripts/e2e-visual-regression.mjs` avec support `--config`, profils DYS, profil `prefers-reduced-motion`, exigence mobile 360/tablette/reduced motion, et capture CSS reelle a 360 px via DevTools quand disponible.
- Extension de `tests/e2e-visual-regression-v3.test.mjs` pour verrouiller la couverture mobile/tablette/desktop/DYS/reduced motion.

### Correctifs UI mobiles

- `src/components/navigation/PublicNavigationV3.astro` : navigation publique mobile en grille stable, textes repliables, largeur contrainte a 360 px.
- `src/layouts/BaseLayout.astro` : bandeau de consentement mobile contraint a la largeur utile, actions sans debordement.
- `src/pages/index.astro` : hero et boutons adaptes au 360 px.
- `src/components/pedagogie/Dashboard.tsx` : en-tete, cartes et actions compatibles mobile et DYS.
- `src/components/pedagogie/XPToast.tsx` : toasts responsives et masques pendant le consentement pour eviter les superpositions incoherentes.
- `src/components/accessibility/AccessibilityPanel.tsx` : bouton accessibilite repositionne quand le bandeau de consentement est visible.

## Captures et controles

Commande principale :

`npm.cmd run mobile:dys:visual`

Resultat :

- Generation : `2026-07-28T17:10:13.521Z`
- 5 parcours
- 72 controles
- 18 captures
- 0 erreur

Dossier de preuves :

- `docs/refonte-v3/reference/captures/mobile-dys-v3-2026-07-28/`

Captures controlees visuellement :

- `accueil-mobile-dys-mobile-360-360x800.png`
- `accueil-mobile-dys-mobile-360-dyslexia-360x800.png`
- `laboratoire-mobile-dys-mobile-360-360x900.png`
- `kit-scientifique-mobile-dys-mobile-360-360x900.png`
- `legacy-mega-quiz-mobile-mobile-360-360x800.png`

Constats apres correction :

- navigation publique lisible a 360 px ;
- aucune coupure horizontale bloquante sur l'accueil ;
- panneau DYS et bandeau de consentement sans superposition incoherente ;
- laboratoire utilisable sur mobile ;
- route legacy `/mega-quiz` capturee en mobile.

## Validation technique

Commandes executees :

| Commande | Resultat | Preuve |
|---|---:|---|
| `npm.cmd run check` | OK | 233 fichiers, 0 erreur, 22 hints |
| `npm.cmd run lint` | OK | 0 erreur, 20 warnings deja connus |
| `npm.cmd test` | OK | 224 tests passes, 0 echec |
| `npm.cmd run verify:content` | OK | 34666 controles, 0 erreur, 0 warning |
| `npm.cmd run build -- --silent` | OK | build Astro termine |
| `npm.cmd run mobile:dys:check` | OK | 5 parcours, 53 controles, 0 erreur |
| `npm.cmd run mobile:dys:visual` | OK | 5 parcours, 72 controles, 18 captures, 0 erreur |

## Comparaison avant/apres

| Zone | Avant | Apres |
|---|---|---|
| Accueil 360 px | navigation et hero pouvaient etre rognes par la largeur effective de capture | grille mobile stable, textes repliables, largeur tenue |
| Consentement + accessibilite | risque de recouvrement avec bouton DYS et toasts | bouton deplace en haut quand le consentement est visible, toasts masques |
| Tableau de bord | cartes et en-tetes trop rigides en largeur mobile | min-width, wrapping et actions adaptees |
| Regression visuelle | suite generale desktop/mobile/DYS | suite dediee mobile 360, tablette, desktop, DYS et reduced motion |

## Retour arriere

Rollback possible en annulant uniquement les fichiers suivants :

- `scripts/e2e-visual-regression.mjs`
- `tests/e2e-visual-regression-v3.test.mjs`
- `tests/fixtures/mobile-dys-validation.config.json`
- `package.json`
- `src/components/navigation/PublicNavigationV3.astro`
- `src/layouts/BaseLayout.astro`
- `src/pages/index.astro`
- `src/components/pedagogie/Dashboard.tsx`
- `src/components/pedagogie/XPToast.tsx`
- `src/components/accessibility/AccessibilityPanel.tsx`

Apres rollback : relancer `npm.cmd run build`, `npm.cmd run e2e:visual:check` et `npm.cmd run audit:dist:a11y`.

## Evaluation selon les six criteres AGENTS.md

| Critere | Note | Preuves |
|---|---:|---|
| Architecture et maintenabilite | 9.4/10 | Configuration dediee au lieu d'un cas special disperse ; runner parametre par `--config` ; tests de contrat ajoutes. |
| UX, UI et coherence du design | 9.3/10 | Captures 360/tablette/desktop inspectees ; navigation, accueil, dashboard, laboratoire et kit scientifique corriges. |
| Qualite pedagogique et scientifique | 9.1/10 | Aucun contenu pedagogique modifie ; parcours chapitre, laboratoire et kit scientifique conserves et verificables sur mobile. |
| Accessibilite et DYS | 9.5/10 | Profils DYS et reduced motion testes ; panneau accessibilite sans recouvrement ; axe final sans violation sur l'echantillon critique. |
| Qualite technique globale | 9.3/10 | `check`, `lint`, `test`, `verify:content`, `build`, `mobile:dys:visual` OK ; 0 erreur bloquante. |
| Completude, migration et validation | 9.4/10 | 5 parcours, 72 controles, 18 captures, route legacy `/mega-quiz` incluse, procedure de rollback documentee. |

Tous les criteres atteignent le seuil minimal de 9/10.
