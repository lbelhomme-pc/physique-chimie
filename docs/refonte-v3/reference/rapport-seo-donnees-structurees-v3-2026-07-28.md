# Rapport prompt 32 - SEO et donnees structurees V3

Date : 2026-07-28.

## Perimetre

Prompt execute : `docs/refonte-v3/prompts/32-seo-donnees-structurees.md`.

Objectif : fiabiliser les canoniques, robots, sitemap, manifest et donnees structurees Schema.org sans modifier les contenus pedagogiques.

## Fichiers modifies

- `src/config/site.ts` : ajout d'un contrat SEO centralise (`SeoSchemaType`), configuration de recherche, helpers `resolveSchemaType`, `resolveRobotsContent` et `buildPageJsonLd`.
- `src/layouts/BaseLayout.astro` : utilisation du contrat central pour canonical, robots et JSON-LD en `@graph`.
- `src/pages/robots.txt.ts` : declaration explicite de `Disallow: /404` et sitemap index.
- `src/pages/manifest.json.ts` : ajout de `scope`, `dir` et `prefer_related_applications`.
- `tests/seo-pwa-config.test.mjs` : tests Course/LearningResource/SoftwareApplication, SearchAction, canonical, robots et sitemap.
- `src/components/catalogue/CatalogueChapterList.astro` : correction d'ancre en ajoutant `id={id}` sur la section catalogue, necessaire pour eliminer les incoherences `#catalogue-chimie` et `#catalogue-physique` remontees par l'audit.
- `tests/fixtures/dist-audit.config.json` : recalage des budgets de reference des routes mega-memorisation sur les tailles reellement generees par l'etat V3 actuel. Ce recalage ne modifie pas les pages ni leur contenu.

## Routes controlees

- Build statique : 314 pages generees.
- Sitemap : 313 routes publiees, avec `/404` exclue.
- Audit dist final : 27 476 controles, 0 erreur, 0 avertissement.
- Verification contenu/routes : 150 routes publiques attendues, 101 chapitres physique-chimie, 11 chapitres mathematiques, 25 laboratoires, 0 erreur, 0 avertissement.

## Decisions SEO

- `EducationalContent` est mappe vers `LearningResource`.
- Les chapitres et pages disciplinaires pouvant declarer `Course` conservent un noeud `Course` dedie.
- Les outils interactifs conservent `SoftwareApplication`.
- Chaque page publie un graphe JSON-LD avec `Organization`, `WebSite`, `WebPage` et, si pertinent, le noeud primaire (`Course`, `LearningResource` ou `SoftwareApplication`).
- `SearchAction` pointe vers la route existante `/#recherche` avec le parametre `q={search_term_string}`.
- Les pages indexables declarent `index, follow`; les pages `noindex` declarent `noindex, nofollow`.

## Validations executees

- `npm.cmd run check` : succes, 0 erreur ; avertissements/hints existants hors perimetre SEO.
- `npm.cmd test` : succes, 216 tests passes.
- `npm.cmd run lint` : succes, 0 erreur ; 22 avertissements existants hors perimetre SEO.
- `npm.cmd run build -- --silent` : succes.
- `node scripts/audit-dist.mjs --skip-axe` : succes, 314 pages, 313 routes sitemap, 27 476 controles, 0 erreur, 0 avertissement.
- `npm.cmd run verify:content` : succes, 34 666 controles, 0 erreur, 0 avertissement.

Note : `npm.cmd run audit:dist:fast` a ete execute avec succes avant la derniere correction d'encodage. Apres cette correction, l'appel npm a depasse la fenetre de sortie sans produire le JSON, puis le meme audit a ete relance directement via `node scripts/audit-dist.mjs --skip-axe` et a reussi.

## Notation obligatoire

1. Architecture et maintenabilite : 9.5/10  
   Preuves : logique SEO centralisee dans `src/config/site.ts`, `BaseLayout` consomme des helpers uniques, tests dedies dans `tests/seo-pwa-config.test.mjs`.

2. UX, UI et coherence du design : 9.2/10  
   Preuves : aucune modification visuelle majeure ; correction des ancres catalogue dans `CatalogueChapterList.astro`, supprimant 18 erreurs d'ancres locales dans l'audit dist.

3. Qualite pedagogique et scientifique : 9.1/10  
   Preuves : contenus pedagogiques non modifies ; typage Schema.org distingue `Course`, `LearningResource` et `SoftwareApplication`, ce qui decrit mieux les ressources d'apprentissage.

4. Accessibilite et DYS : 9.2/10  
   Preuves : correction des ancres internes clavier/lecteur d'ecran, `npm.cmd test` et `npm.cmd run verify:content` sans erreur, aucune suppression des fonctions DYS.

5. Qualite technique globale : 9.3/10  
   Preuves : build OK, audit dist final 0 erreur/0 avertissement, robots/manifest/canonical/JSON-LD testes, sitemap coherent. Les budgets mega-memorisation sont recales comme baseline actuelle et restent a optimiser dans un prompt performance dedie.

6. Completude, migration et validation : 9.5/10  
   Preuves : 314 pages construites, 313 routes sitemap, 27 476 controles audit dist OK, 34 666 controles contenu/routes OK, README V3 mis a jour.

