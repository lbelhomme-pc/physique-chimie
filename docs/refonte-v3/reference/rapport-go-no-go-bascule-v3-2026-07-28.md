# Rapport go/no-go de bascule V3

Date : 2026-07-28.

## Decision

GO controle pour la bascule V3.

La bascule peut etre preparee a condition de conserver le plan de retour arriere, les routes legacy, les alias de progression `localStorage`, et les validations de release avant publication effective.

## Sources relues

- `AGENTS.md`
- `.github/workflows/ci.yml`
- `package.json`
- `dist/robots.txt`
- `dist/sitemap-index.xml`
- `dist/sitemap-0.xml`
- `docs/refonte-v3/README.md`
- `docs/refonte-v3/00-resume-executif.md`
- `docs/refonte-v3/prompts/37-preparation-bascule-v3.md`
- Tous les rapports `docs/refonte-v3/reference/rapport-*.md` disponibles avant ce lot
- `docs/refonte-v3/reference/rapport-validation-mobile-dys-v3-2026-07-28.md`

## Synthese release

| Domaine | Etat V2 conserve | Etat V3 pret | Decision |
|---|---|---|---|
| Contenus | 112 chapitres references par contrat contenu | contenus normalises et verifies par `verify:content` | GO |
| Routes | routes publiques et legacy preservees | 314 pages build, 313 routes sitemap, `/mega-quiz` controle en legacy | GO |
| Progression | anciennes cles conservees | migration idempotente et tests dedies existants | GO |
| Gratuit/Premium | comprehension de base non verrouillee | matrice de gating documentee | GO |
| DYS/accessibilite | preferences existantes conservees | suite mobile/DYS + audit axe sans violation | GO |
| SEO | sitemap et robots presents | JSON-LD, canoniques et sitemap audites | GO |
| Performance | budgets existants conserves | budgets `audit-dist` OK | GO |
| Securite | sanitation contenu conservee | CSP et en-tetes stricts audites | GO |
| Rollback | V2 non supprimee | retour arriere documente et testable par commandes release | GO |

## Validations executees

| Commande | Resultat | Preuve |
|---|---:|---|
| `npm.cmd run check` | OK | 233 fichiers, 0 erreur, 22 hints |
| `npm.cmd run lint` | OK | 0 erreur, 20 warnings non bloquants deja identifies |
| `npm.cmd test` | OK | 224 tests passes, 0 echec |
| `npm.cmd run verify:content` | OK | 34666 controles, 0 erreur, 0 warning |
| `npm.cmd run build -- --silent` | OK | build Astro termine et `dist/` produit |
| `npm.cmd run e2e:visual:check` | OK | 8 parcours, 68 controles, 0 erreur |
| `npm.cmd run mobile:dys:visual` | OK | 5 parcours, 72 controles, 18 captures, 0 erreur |
| `node scripts/audit-dist.mjs --skip-axe` | OK | 314 pages, 27476 controles, 0 erreur, 0 warning |
| `npm.cmd run audit:dist:a11y` | OK | 6 pages axe critiques, 0 violation, 0 warning |

## Dist, sitemap et robots

Preuves de sortie :

- `dist/sitemap-index.xml` present.
- `dist/sitemap-0.xml` present, 53226 octets.
- `dist/robots.txt` autorise l'indexation publique, bloque `/404`, et reference `https://physique-chimie-belhomme.vercel.app/sitemap-index.xml`.
- `audit-dist` compare 314 pages construites, 314 routes snapshot, 313 routes sitemap, sans erreur.

## Points de vigilance non bloquants

- Les 20 warnings lint et les 22 hints Astro/TypeScript sont preexistants ou non bloquants ; ils concernent surtout variables non utilisees et scripts inline Astro.
- Le deploiement production doit rester progressif : publication, verification de smoke tests, puis surveillance des routes legacy et de la progression.
- Aucun contenu V2 ne doit etre supprime pendant la bascule ; les redirections doivent rester observables apres publication.

## Procedure de retour arriere

Rollback documente et testable :

1. Rebasculer l'hebergement vers la derniere version V2 stable ou vers le dernier build V2 conserve.
2. Conserver les routes legacy et aliases `localStorage` pendant toute la fenetre de rollback.
3. Reexecuter `npm.cmd run build`, `npm.cmd run e2e:visual:check`, `node scripts/audit-dist.mjs --skip-axe` et `npm.cmd run audit:dist:a11y`.
4. Verifier manuellement `/`, une page chapitre, `/laboratoire/circuit-rc`, `/outils-methodes/kit-scientifique`, `/memorisation/mega-quiz` et `/mega-quiz`.
5. Documenter tout ecart dans `docs/refonte-v3/reference/` avant une nouvelle tentative.

Le rollback est considere pret car la V2 n'a pas ete supprimee, les routes legacy sont conservees, la progression garde ses alias, et les commandes de verification sont identifiees.

## Decision finale

La V3 est prete pour une bascule controlee. Le go reste conditionne a l'execution des memes validations juste avant publication effective et a la conservation d'un point de retour V2.

## Evaluation selon les six criteres AGENTS.md

| Critere | Note | Preuves |
|---|---:|---|
| Architecture et maintenabilite | 9.5/10 | Contrats contenus, routes, progression, CI, audits et runner E2E documentes ; pas de double source de verite durable detectee. |
| UX, UI et coherence du design | 9.4/10 | E2E visuel 8 parcours/68 controles OK ; validation mobile/DYS 18 captures OK ; accueil, navigation, chapitre, laboratoire, kit et dashboard couverts. |
| Qualite pedagogique et scientifique | 9.3/10 | 34666 controles contenu OK ; rapports disciplinaires 5e/6e, 4e/3e, maths seconde, lycee PC et enseignement scientifique produits. |
| Accessibilite et DYS | 9.5/10 | Audit axe 0 violation sur 6 pages critiques ; mobile 360, tablette, DYS et reduced motion verifies ; rapport accessibilite dedie. |
| Qualite technique globale | 9.4/10 | `check`, `lint`, `test`, `verify:content`, `build`, `audit-dist`, `audit:dist:a11y`, `e2e:visual:check` OK. |
| Completude, migration et validation | 9.5/10 | Prompts 01 a 37 couverts par rapports ; table V2/V3, rollback, dist, sitemap, robots et routes legacy verifies. |

Tous les criteres atteignent le seuil minimal de 9/10.
