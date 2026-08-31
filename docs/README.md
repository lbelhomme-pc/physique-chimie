# Documentation du dépôt

Ce dossier rassemble la documentation technique et historique de la plateforme. Tous les documents n’ont pas la même valeur : certains décrivent l’état **courant**, d’autres une **cible de migration**, d’autres encore sont des **archives**.

## 1. Documentation autoritative actuelle

À lire en priorité pour comprendre ou modifier l’application :

- [`../README.md`](../README.md) — vue d’ensemble, commandes et structure du dépôt ;
- [`../AGENTS.md`](../AGENTS.md) — règles permanentes de migration et critères de validation ;
- [`../CLAUDE.md`](../CLAUDE.md) — consignes techniques synthétiques pour les assistants de code ;
- [`architecture/`](architecture/) — décisions d’architecture ciblées ;
- [`../.github/BRANCH_PROTECTION.md`](../.github/BRANCH_PROTECTION.md) — politique attendue de protection de `main`.

Lorsqu’un document historique contredit ces sources ou le code testé, **le code testé et les contrats actuels priment**.

## 2. Refonte V3

[`refonte-v3/`](refonte-v3/) contient la constitution de la migration V3 : audit initial, arborescences, structures pédagogiques, UX/UI, accessibilité, contrats et prompts d’exécution.

Ces documents décrivent à la fois :

- des décisions déjà implémentées ;
- des migrations en cours ;
- des objectifs futurs.

Il faut donc vérifier l’état réel du dépôt et de la CI avant d’appliquer une recommandation ancienne mot pour mot.

## 3. Architecture

Le dossier [`architecture/`](architecture/) contient les décisions techniques qui doivent rester consultables indépendamment des audits :

- `securite-contenus.md` — modèle de confiance pour HTML/SVG et contenus pédagogiques ;
- `seo-pwa-analytics.md` — SEO, PWA et analytics ;
- `strategie-alias-progression.md` — compatibilité des IDs et migrations de progression.

La structure globale est également résumée dans le README racine.

## 4. Qualité et CI

La source de vérité des commandes est `package.json`.

Les contrôles GitHub Actions attendus sont :

- `quality`
- `dist-fast`
- `dist-a11y`

`quality` doit notamment exécuter :

- `astro check` ;
- ESLint avec zéro warning autorisé ;
- les tests automatisés ;
- la vérification routes/contenus ;
- l’audit npm bloquant les vulnérabilités high/critical.

Ne pas utiliser un ancien rapport npm ou un ancien compte rendu de CI comme état de sécurité courant.

## 5. Programmes officiels

Les PDF et extractions historiques utilisés comme références pédagogiques sont conservés dans [`../BO/`](../BO/).

Attention : un fichier présent dans `BO/` n’implique pas qu’il soit encore le programme applicable à la rentrée courante. Toute mission éditoriale doit vérifier la date d’application du programme correspondant avant de certifier un contenu.

## 6. Documents historiques

Le dépôt contient de nombreux comptes rendus de sessions, audits et rapports produits pendant les migrations précédentes. Ils sont utiles pour comprendre l’historique mais ne doivent pas servir de source de vérité technique courante.

Le statut des principaux artefacts encore présents à la racine est consigné dans [`historique/racine-legacy.md`](historique/racine-legacy.md).

Les nouveaux documents historiques doivent être créés sous `docs/historique/` ou dans un sous-dossier thématique approprié, jamais directement à la racine.

## 7. Règle de fraîcheur documentaire

Avant de se fier à une information chiffrée ou à une version :

1. vérifier `package.json` pour les versions ;
2. lancer `npm run verify:content` pour les contenus/routes/IDs ;
3. lire la CI du HEAD pour la qualité, le build et l’accessibilité ;
4. consulter les fichiers sources pour les comportements applicatifs ;
5. utiliser ensuite la documentation pour le contexte et les décisions.

Cette règle évite qu’un rapport de migration ancien soit pris pour l’état courant du projet.
