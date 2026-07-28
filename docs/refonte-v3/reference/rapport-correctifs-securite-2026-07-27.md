# Rapport prompt 02 - Correctifs de securite critiques

Date : 2026-07-27

## Perimetre

Prompt execute apres la sauvegarde de reference V2. Les modifications sont limitees a la sanitisation HTML/SVG, aux tests de securite et a la documentation de la politique de confiance.

## Failles traitees

1. URL protocol-relative
   - Avant : une URL commencant par `//` pouvait etre acceptee car elle commencait par `/`.
   - Apres : `//...`, `\\...` et `/\...` sont refusees, tandis que les chemins internes `/cours` et les ancres `#section` restent autorises.

2. SVG injecte via URI data
   - Avant : `data:image/svg+xml;base64,...` etait accepte dans les attributs URL.
   - Apres : les URI `data:` sont limitees aux images raster `png`, `gif`, `jpeg` et `webp`. Les schemas SVG pedagogiques restent inline et passent par `sanitizeTrustedSvg`.

3. Contournements CSS
   - Avant : certains styles inline avec echappements CSS, commentaires ou `@import` n'etaient pas explicitement bloques.
   - Apres : les valeurs de style contenant `url(...)`, `expression(...)`, `@import`, commentaires CSS, chevrons ou antislashs sont retirees.

## Non-regressions protegees

- Les styles simples utiles (`color`, variables CSS simples, dimensions, marges) restent acceptes.
- Les attributs pedagogiques et accessibilite SVG (`title`, `desc`, `role`, `aria-*`, `viewBox`, traits et coordonnees) restent conserves.
- KaTeX continue d'etre rendu avec `trust: false`.
- Aucun contenu pedagogique n'a ete modifie.

## Documentation CSP

La proposition CSP de reference reste documentee dans `docs/architecture/securite-contenus.md`. Le correctif prompt 02 ne modifie pas les en-tetes de production : il reduit d'abord la surface d'injection au niveau applicatif. La CSP pourra ensuite etre durcie progressivement, en particulier autour de `style-src`, apres inventaire complet des styles inline Astro/React.

## Fichiers modifies

- `src/utils/trustedContent.ts`
- `tests/security/trusted-content.test.mjs`
- `docs/refonte-v3/reference/rapport-correctifs-securite-2026-07-27.md`

## Validation executee

Commandes obligatoires du prompt :

- `npm.cmd test` : OK, 94 tests reussis.
- `npm.cmd run check` : OK, 0 erreur ; warnings/hints existants non lies au correctif.
- `npm.cmd run build` : OK, 314 pages generees.

## Evaluation selon les six criteres

| Critere | Score | Justification |
|---|---:|---|
| Architecture et maintenabilite | 9.3/10 | correctif centralise dans le sanitiseur existant, sans nouvelle dependance |
| UX/UI et coherence visuelle | 9.4/10 | aucun changement visuel volontaire, styles simples conserves |
| Pedagogie et science | 9.2/10 | SVG et tableaux pedagogiques preserves |
| Accessibilite et DYS | 9.4/10 | `title`, `desc`, `role` et `aria-*` explicitement proteges par test |
| Qualite technique globale | 9.3/10 | tests d'injection et de non-regression ajoutes |
| Completude, migration et validation | 9.1/10 | corrections limitees au perimetre prompt 02, rollback simple |

Tous les criteres sont au-dessus de 9/10 apres validation des commandes obligatoires.
