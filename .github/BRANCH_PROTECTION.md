# Contrat CI et protection de `main`

Ce document définit le contrat GitHub attendu pour la branche `main`.

## Checks obligatoires

Les trois checks suivants sont autoritatifs et leurs noms doivent rester stables :

- `quality`
- `dist-fast`
- `dist-a11y`

Le workflow source est `.github/workflows/ci.yml` et le contrat est couvert par `tests/ci-contract.test.mjs`.

### Rôle de chaque check

- `quality` : Astro check, ESLint, tests Node et vérification du contrat de contenu/routes.
- `dist-fast` : build de production puis audit rapide du `dist` (routes, sitemap, SEO, liens, assets et budgets hors axe).
- `dist-a11y` : build de production puis audit axe sur l'échantillon d'accessibilité versionné.

`dist-fast` et `dist-a11y` dépendent tous deux de `quality`, mais ne dépendent pas l'un de l'autre. Une erreur de l'audit `dist-fast` ne doit donc plus masquer le résultat accessibilité.

## Configuration GitHub requise pour `main`

La branche `main` doit être protégée avec les règles suivantes :

1. exiger une pull request avant fusion ;
2. exiger la réussite des checks `quality`, `dist-fast` et `dist-a11y` ;
3. exiger que la branche de la pull request soit à jour avec `main` avant fusion ;
4. empêcher les force-push sur `main` ;
5. empêcher la suppression de `main` ;
6. conserver la résolution des conversations de revue avant fusion lorsqu'une revue existe.

Pour un dépôt maintenu par une seule personne, aucune approbation externe obligatoire n'est imposée par ce contrat : la PR sert d'abord de barrière technique et de trace de changement.

## Vérification après configuration

Dans GitHub, la branche `main` doit apparaître comme protégée et les trois checks ci-dessus comme requis. Toute modification du nom d'un job dans `.github/workflows/ci.yml` doit être accompagnée, dans le même changement, d'une mise à jour de la protection GitHub et de ce document.

## Principe de sécurité

La CI utilise uniquement `contents: read`. Aucun job de validation ne doit disposer d'un droit d'écriture sur le dépôt. Les dépendances sont installées avec `npm ci` à partir du lockfile versionné.
