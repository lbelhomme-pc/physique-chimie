# Politique de confiance des contenus

Ce projet distingue trois familles de contenu avant tout rendu riche.

## Texte brut

Les saisies utilisateur et les champs texte des quiz, flashcards, exercices et outils sont du texte brut. Ils ne doivent jamais etre concaténés dans du HTML ou dans un SVG. Dans React, ils doivent être rendus par interpolation normale ou passer par `MathText`, qui échappe le texte avant de rendre uniquement les formules KaTeX reconnues.

## Formules mathématiques

Les formules sont des chaînes LaTeX transmises à KaTeX avec `trust: false`. Le HTML produit par KaTeX est le seul HTML généré accepté pour les formules. Une formule invalide retombe en texte échappé.

## HTML ou SVG de confiance

Les fragments importés legacy et les schémas SVG locaux peuvent contenir du HTML riche nécessaire au rendu pédagogique. Ils doivent passer par les fonctions de `src/utils/trustedContent.ts` :

- `sanitizeTrustedHtml` pour les fragments HTML legacy.
- `sanitizeTrustedSvg` pour les schémas SVG locaux.
- `renderMathInTrustedHtml` pour les fragments legacy contenant aussi des formules.

La liste blanche conserve les balises pédagogiques utiles, les tableaux, les balises KaTeX et les formes SVG simples. Elle supprime les scripts, les gestionnaires `on*`, les URL `javascript:`, les balises embarquées dangereuses et les styles utilisant `url(...)` ou `expression(...)`.

## Outils interactifs

Le kit scientifique ne doit pas utiliser `eval`, `new Function` ou une variante équivalente. Les expressions numériques passent par `evaluateScientificExpression`, un parseur limité aux nombres, constantes `pi` et `e`, opérateurs `+ - * / ^`, parenthèses et fonctions scientifiques explicitement autorisées.

Le traceur graphique crée les éléments SVG avec `createElementNS` et écrit les libellés avec `textContent`. Une chaîne saisie par l'utilisateur ne doit jamais devenir une balise, un attribut ou un gestionnaire d'événement.

## CSP appliquee V3

La configuration finale V3 est declaree dans `vercel.json` et testee par `tests/security/security-headers.test.mjs`.

Politique appliquee :

```txt
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' https://www.googletagmanager.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://www.google-analytics.com https://region1.google-analytics.com; object-src 'none'; base-uri 'self'; frame-ancestors 'none'; form-action 'self'; upgrade-insecure-requests
Strict-Transport-Security: max-age=31536000; includeSubDomains
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: accelerometer=(), autoplay=(), camera=(), encrypted-media=(), fullscreen=(self), geolocation=(), gyroscope=(), microphone=(), payment=(), usb=()
X-Frame-Options: DENY
X-Permitted-Cross-Domain-Policies: none
```

`script-src 'unsafe-inline'` et `style-src 'unsafe-inline'` restent documentes comme exceptions temporaires necessaires au rendu Astro actuel : le layout contient du JSON-LD inline, un script de consentement analytics inline, des styles inline de composants React et des styles inline Astro generes. La politique interdit en revanche `unsafe-eval`, les objets embarques, les frames parentes et les formulaires vers un domaine externe.

Google Analytics reste conditionnel : seul `https://www.googletagmanager.com` est autorise en `script-src`, et les domaines Analytics ne sont autorises qu'en `connect-src`. Le script distant n'est cree qu'apres consentement explicite.

## Proposition CSP historique

L'hébergeur détecté dans `astro.config.mjs` est Vercel. Sans casser le déploiement actuel, une première politique peut être posée via `vercel.json` ou via les réglages d'en-têtes Vercel :

```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "Content-Security-Policy", "value": "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self'; object-src 'none'; base-uri 'self'; frame-ancestors 'none'; form-action 'self'; upgrade-insecure-requests" },
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" },
        { "key": "Permissions-Policy", "value": "camera=(), microphone=(), geolocation=()" }
      ]
    }
  ]
}
```

La directive `style-src 'unsafe-inline'` reste volontairement temporaire, car le site contient encore des styles inline Astro/React. Elle pourra être durcie après une passe dédiée.
