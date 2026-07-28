# Rapport securite finale et CSP V3 - 2026-07-28

## Prompt execute

Prompt 34 : `docs/refonte-v3/prompts/34-securite-finale-csp.md`.

Sources relues :

- `docs/refonte-v3/README.md`
- `docs/refonte-v3/00-resume-executif.md`
- `docs/refonte-v3/prompts/34-securite-finale-csp.md`
- `docs/architecture/securite-contenus.md`
- `docs/architecture/seo-pwa-analytics.md`
- `docs/refonte-v3/12-securite-performance-seo.md`
- `astro.config.mjs`
- `src/layouts/BaseLayout.astro`
- `src/config/site.ts`
- `tests/security/trusted-content.test.mjs`
- `scripts/audit-dist.mjs`

## Objectif

Preparer la securite finale V3 : CSP, en-tetes de securite, verification des secrets, audit des dependances et maintien du consentement Analytics.

## Correctifs appliques

- Ajout de `vercel.json` avec en-tetes globaux pour toutes les routes.
- Ajout de `tests/security/security-headers.test.mjs` pour verrouiller la CSP, les en-tetes et le chargement Analytics apres consentement.
- Mise a jour de `docs/architecture/securite-contenus.md` avec la politique appliquee et les exceptions temporaires documentees.
- Mise a jour de `docs/refonte-v3/12-securite-performance-seo.md` et de l'index V3.

## En-tetes appliques

```txt
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' https://www.googletagmanager.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://www.google-analytics.com https://region1.google-analytics.com; object-src 'none'; base-uri 'self'; frame-ancestors 'none'; form-action 'self'; upgrade-insecure-requests
Strict-Transport-Security: max-age=31536000; includeSubDomains
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: accelerometer=(), autoplay=(), camera=(), encrypted-media=(), fullscreen=(self), geolocation=(), gyroscope=(), microphone=(), payment=(), usb=()
X-Frame-Options: DENY
X-Permitted-Cross-Domain-Policies: none
```

## Comparaison avant / apres

Avant prompt 34 :

- CSP seulement proposee dans la documentation.
- Pas de configuration Vercel racine verifiee par test.
- Pas de verrou automatique sur `unsafe-eval`, `frame-ancestors`, `object-src` ou les domaines Analytics autorises.

Apres prompt 34 :

- CSP appliquee dans `vercel.json`.
- `object-src 'none'`, `base-uri 'self'`, `frame-ancestors 'none'`, `form-action 'self'`.
- `unsafe-eval` absent de la politique.
- Analytics autorise seulement sur `googletagmanager.com` en script et `google-analytics.com` en connexion.
- Consentement Analytics confirme : aucun `<script src="https://www.googletagmanager.com">` direct dans le layout ; le script est cree apres choix `granted`.

## Audit local

- Recherche secrets : aucun secret applicatif detecte dans `src`, `public`, `scripts`, `tests`, `docs`.
- Recherche dangereuse : aucun `eval` ou `new Function` dans `src`; les rendus HTML riches restent limites a `MathText`, `RawHtml`, `ExercicesPlayer`, JSON-LD et quelques simulateurs laboratoire avec contenu controle.
- `npm.cmd audit --offline --audit-level=high` : 0 vulnerabilite.
- `npm.cmd audit --audit-level=high` en ligne : non execute jusqu'au bout, car l'autorisation a ete refusee pour ne pas envoyer l'inventaire des dependances au registre npm public.

## Validation

Commandes executees :

- `npm.cmd run check` : 0 erreur, 22 hints deja presents.
- `npm.cmd run lint` : 0 erreur, 20 avertissements preexistants.
- `npm.cmd test` : 220 tests, 220 reussis.
- `npm.cmd run build -- --silent` : OK.
- `node scripts/audit-dist.mjs --skip-axe` : 314 pages, 27 476 controles, 0 erreur, 0 avertissement.
- `npm.cmd run audit:dist:a11y` : 6 routes echantillons axe, 0 violation.
- `npm.cmd run verify:content` : 34 666 controles, 0 erreur, 0 avertissement.

## Risques restants

- `script-src 'unsafe-inline'` reste necessaire tant que le layout contient JSON-LD et script de consentement inline et tant que les scripts Astro inline sont generes.
- `style-src 'unsafe-inline'` reste necessaire tant que plusieurs composants Astro/React gardent des styles inline.
- Les simulateurs laboratoire contiennent encore des `innerHTML` avec contenus controles par le code ; ils restent a suivre lors d'une passe de durcissement fine.
- L'audit npm en ligne devra etre lance explicitement si l'envoi de l'inventaire des dependances au registre npm est accepte.

## Procedure de retour arriere

Pour assouplir temporairement la CSP, modifier uniquement `vercel.json`, puis mettre a jour `tests/security/security-headers.test.mjs` et ce rapport avec la justification. Ne pas supprimer les tests de sanitisation ni les protections de `trustedContent`.

## Evaluation selon les six criteres

1. Architecture et maintenabilite : 9.5/10. Preuve : configuration d'en-tetes centralisee dans `vercel.json`, test dedie, documentation synchronisee.
2. UX, UI et coherence du design : 9/10. Preuve : aucune modification visuelle ; build et audit a11y confirment l'absence de regression visible structurelle.
3. Qualite pedagogique et scientifique : 9.5/10. Preuve : aucun contenu, laboratoire, KaTeX ou schema pedagogique supprime ; `verify:content` reste a 0 erreur.
4. Accessibilite et DYS : 9.5/10. Preuve : polices locales compatibles CSP, pas de CDN de police ajoute, `audit:dist:a11y` a 0 violation.
5. Qualite technique globale : 9.5/10. Preuve : CSP sans `unsafe-eval`, `object-src 'none'`, frame interdite, permissions navigateur fermees, audit dependencies offline a 0 vulnerabilite.
6. Completude, migration et validation : 9.5/10. Preuve : tests, lint, check, build, audit dist, audit a11y, verify content et rapport final executes ; exceptions et retour arriere documentes.
