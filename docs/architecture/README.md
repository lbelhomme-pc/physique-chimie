# Architecture — index courant

Ce dossier contient les décisions d’architecture qui restent pertinentes indépendamment des audits de migration.

## Invariants actuels

### Application

- génération statique Astro ;
- React réservé aux fonctionnalités réellement interactives ;
- contenu pédagogique chargé depuis les corpus versionnés dans `src/data/` ;
- contrat commun validé avant publication ;
- routes et IDs historiques préservés par alias/redirections tant que leur migration n’est pas terminée.

### Taxonomie publique

La plateforme expose deux disciplines de premier niveau : **Mathématiques** et **Physique-Chimie**. L’**Enseignement scientifique** est un parcours lycée rattaché à Physique-Chimie, avec ses libellés de parcours et ses routes historiques conservés.

Voir [`taxonomie-disciplines.md`](taxonomie-disciplines.md).

### Données pédagogiques

Le projet ne possède pas encore une représentation native unique de tous les corpus. Le contrat V3 et ses adaptateurs constituent la couche de compatibilité. Toute normalisation doit donc être progressive et testée.

### Progression

Les données de progression locales ne doivent jamais être invalidées par un renommage de route ou d’identifiant. Les migrations doivent être :

- idempotentes ;
- compatibles avec les anciennes clés ;
- non destructives tant que la migration n’est pas certifiée.

Voir [`strategie-alias-progression.md`](strategie-alias-progression.md).

### Sécurité des contenus

Les contenus HTML/SVG potentiellement actifs ne sont pas considérés fiables par défaut. Les règles de filtrage, attributs autorisés et contraintes de rendu sont décrits dans [`securite-contenus.md`](securite-contenus.md).

### SEO / PWA / analytics

Voir [`seo-pwa-analytics.md`](seo-pwa-analytics.md). Les métadonnées structurées doivent rester en UTF-8 correct et les analytics rester conditionnés au consentement.

## Références de code

- `src/data/contentContract.ts`
- `src/data/disciplineIdentity.ts`
- `src/content-model/`
- `src/utils/contentIds.ts`
- `src/utils/contentProgressMigration.ts`
- `src/utils/trustedContent.ts`
- `src/pages/`
- `scripts/verify-routes-and-content.mjs`
- `scripts/audit-dist.mjs`

## Validation d’un changement d’architecture

Au minimum :

```bash
npm run ci:quality
npm run ci:dist
npm run ci:a11y
```

Une modification de contrat, de route, d’ID, de taxonomie publique ou de progression doit également apporter des tests de non-régression correspondant au comportement protégé.
