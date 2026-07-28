# SEO, PWA et consentement analytics

La source de vérité du nom du site, du domaine, des assets publics, du manifeste PWA et de l'identifiant Analytics est `src/config/site.ts`.

## Domaine

Le domaine par défaut reprend l'URL déjà déclarée dans la configuration Astro historique : `https://physique-chimie-belhomme.vercel.app`.

Ce choix reste paramétrable pour le déploiement :

- `PUBLIC_SITE_URL` ou `SITE_URL` définit l'origine de production utilisée par Astro, les canonical, Open Graph, sitemap et robots.
- `PUBLIC_PREVIEW_SITE_URL` peut définir une origine de prévisualisation.
- `PUBLIC_DEV_SITE_URL` peut définir une origine locale différente de `http://localhost:4321`.

Tant que le domaine définitif n'est pas confirmé, il ne faut pas coder une autre origine en dur dans les pages, le layout, robots ou le manifeste.

## Données structurées

Les pages de chapitre déclarent explicitement un schéma `Course`.

Les outils, simulations et pages pédagogiques génériques ne doivent pas être forcés en `Course` :

- les applications de laboratoire et outils interactifs peuvent utiliser `SoftwareApplication`;
- les contenus pédagogiques non assimilables à un cours complet utilisent `LearningResource`;
- aucune page ne doit publier un `SearchAction` vers une route absente.

## Analytics

Google Analytics ne se charge pas avant consentement explicite.

Le choix est stocké localement avec la clé `site.analyticsConsent` :

- `granted` : le script Google Analytics est chargé et l'événement standard `page_view` peut être envoyé;
- `denied` : aucun script Analytics distant n'est chargé.

Cookies potentiels après acceptation : `_ga` et variantes `_ga_*`.

Le refus ne bloque aucune fonctionnalité pédagogique. Toute évolution des événements suivis doit être documentée ici avant déploiement.

## En-têtes recommandés

Pour l'hebergeur final, prévoir une CSP compatible avec Astro statique et le chargement Analytics conditionnel :

```txt
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' https://www.googletagmanager.com; connect-src 'self' https://www.google-analytics.com https://region1.google-analytics.com; img-src 'self' data: https://www.google-analytics.com; style-src 'self' 'unsafe-inline'; font-src 'self'; object-src 'none'; base-uri 'self'; frame-ancestors 'self'; upgrade-insecure-requests
Referrer-Policy: strict-origin-when-cross-origin
X-Content-Type-Options: nosniff
Permissions-Policy: geolocation=(), microphone=(), camera=()
```

Cette proposition ne doit être activée qu'après validation sur l'hebergeur réel, car certains providers ajoutent leurs propres scripts ou domaines de prévisualisation.
