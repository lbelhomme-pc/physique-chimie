# Securite, performance et SEO

Securite :

- `src/utils/trustedContent.ts` sanitise HTML/SVG de confiance ;
- KaTeX est rendu avec `trust: false` ;
- les tests couvrent plusieurs injections HTML/SVG ;
- la CSP finale est appliquee via `vercel.json` et verrouillee par `tests/security/security-headers.test.mjs`.

Performance :

- build statique OK ;
- plusieurs composants React sont charges globalement ;
- `GenericLabSimulator` est le plus gros script source ;
- bundle `MathText` observe a environ 266 kB brut ;
- les polices externes doivent etre revues.

SEO :

- `BaseLayout` gere title, description, canonical, Open Graph, JSON-LD ;
- les pages de chapitre transmettent maintenant des donnees SEO ;
- sitemap produit au build ;
- routes legacy et explicites coexistent en physique-chimie ;
- les redirections futures doivent etre testees avant suppression d'URL.

Point ouvert : `audit:dist` doit etre segmente ou optimise pour devenir un controle de CI fiable.
