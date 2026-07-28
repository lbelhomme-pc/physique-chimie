# Rapport prompt 03 - Chaine qualite et CI

Date : 2026-07-27

## Perimetre

Prompt execute apres les prompts 01 et 02. Les modifications sont limitees aux scripts de validation, au workflow CI et a la documentation de reference. Aucun contenu pedagogique n'a ete modifie.

## Chaine cible

- `npm.cmd run ci:quality` : controle Astro/TypeScript, lint, tests unitaires et verification contenus.
- `npm.cmd run ci:dist` : build statique puis audit `dist` rapide sans axe.
- `npm.cmd run ci:a11y` : build statique puis audit axe sur l'echantillon accessibilite.
- `npm.cmd run ci` : chaine locale rapide et bloquante (`ci:quality` puis `ci:dist`).
- `npm.cmd run audit:dist` : audit complet conserve pour compatibilite.

## Segmentation de `audit:dist`

- `audit:dist:fast` appelle `scripts/audit-dist.mjs --skip-axe`.
- `audit:dist:a11y` appelle `scripts/audit-dist.mjs --only-axe`.
- `audit:dist` sans option garde le comportement historique : routes, SEO technique, liens, assets, budgets, smoke samples et axe.

## Workflow GitHub Actions

Le workflow `.github/workflows/ci.yml` est separe en trois jobs :

- `quality` : validations rapides sans build.
- `dist-fast` : build + audit de distribution rapide.
- `dist-a11y` : build + audit axe echantillonne, separe du job rapide.

## Temps attendus locaux

Les temps dependent fortement de la machine et du cache npm. Sur cette session Windows :

- `npm.cmd run ci:quality` : 232 s, 0 erreur ; inclut check, lint, tests et verification contenu.
- `npm.cmd run ci:dist` : 343 s, 0 erreur ; inclut build 314 pages et audit `dist` rapide.
- `npm.cmd run ci:a11y` : 208 s, 0 erreur ; inclut build 314 pages et audit axe echantillonne.
- `npm.cmd run audit:dist:fast` seul : 183 s, 15 363 controles, 0 erreur, 0 warning.
- `npm.cmd run audit:dist:a11y` seul : 49 s, 6 routes axe, 0 violation.
- `npm.cmd run audit:dist` complet : 210 s, 15 369 controles, 0 erreur, 0 warning.

## Validation executee

- `npm.cmd run audit:dist:fast` : OK.
- `npm.cmd run audit:dist:a11y` : OK.
- `npm.cmd run ci:quality` : OK.
- `npm.cmd run ci:dist` : OK.
- `npm.cmd run ci:a11y` : OK.
- `npm.cmd run audit:dist` : OK, compatibilite de l'ancien script confirmee.

## Audit dependances

`npm.cmd audit --audit-level=high` a ete tente localement, mais npm a refuse la requete avec une erreur de certificat (`unable to verify the first certificate`). Une relance avec acces reseau explicite a ete refusee par la revue de securite, car elle enverrait les metadonnees des dependances au registre npm. Aucun contournement n'a ete effectue.

Conclusion : l'audit dependances n'est pas integre au job bloquant tant que l'autorisation de transmission vers le registre npm et la configuration certificat ne sont pas clarifiees.

## Limites

- Le job `dist-a11y` reconstruit le site pour rester simple et robuste. Un partage d'artefact `dist/` pourra reduire le temps plus tard.
- La verification visuelle Playwright reste prevue dans les prompts dedies a la regression visuelle et au mobile/DYS.
- L'audit rapide `dist` reste couteux car il parcourt les 314 pages HTML, mais il ne bloque plus sur axe et reste sous l'ancien seuil observe de 4 minutes.

## Evaluation selon les six criteres

| Critere | Score | Justification |
|---|---:|---|
| Architecture et maintenabilite | 9.2/10 | scripts explicites, compatibilite de `audit:dist` conservee |
| UX/UI et coherence visuelle | 9.0/10 | aucun changement visuel, futur controle visuel documente |
| Pedagogie et science | 9.1/10 | verification contenus conservee dans la chaine rapide |
| Accessibilite et DYS | 9.2/10 | axe separe dans un job dedie et echantillonne |
| Qualite technique globale | 9.3/10 | jobs CI decoupes et commandes locales nommees |
| Completude, migration et validation | 9.1/10 | anciens scripts conserves, rollback limite |
