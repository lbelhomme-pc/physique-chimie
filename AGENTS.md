# AGENTS.md

## Rôle permanent du projet

Ce dépôt contient une plateforme pédagogique française de **Mathématiques**, **Physique-Chimie** et **Enseignement scientifique**, avec mémorisation, accessibilité/DYS et laboratoires interactifs.

La migration V3 est active mais reste progressive : l’objectif est de converger vers une architecture commune sans casser les routes publiées, les contenus, les IDs, les progressions locales ou les usages existants.

Avant toute mission importante, lire :

- `README.md`
- `docs/README.md`
- `docs/refonte-v3/README.md`
- `docs/refonte-v3/00-resume-executif.md`
- le document ou prompt V3 correspondant au périmètre traité
- les fichiers sources explicitement concernés.

## Règle de base

Ne pas réécrire toute l’architecture d’un coup. Ne pas supprimer de contenu, route, progression, fonction DYS, simulation ou métadonnée sans inventaire, justification, test et procédure de retour arrière.

Ne pas prendre un ancien rapport de migration pour l’état courant du dépôt. Les versions viennent de `package.json`, les contenus/routes/IDs de `npm run verify:content`, et la qualité du HEAD de la CI correspondante.

## Sources de référence

- programmes conservés : `BO/` ;
- index documentaire : `docs/README.md` ;
- architecture V3 : `docs/refonte-v3/` ;
- décisions d’architecture : `docs/architecture/` ;
- contenus PC / ES : `src/data/chapters/` ;
- contenus Mathématiques : `src/data/mathematiques/` ;
- contrat commun : `src/data/contentContract.ts`, `src/content-model/` ;
- laboratoire : `src/data/laboratoire/`, `src/components/laboratoire/`, `src/scripts/laboratoire/` ;
- accessibilité/DYS : `src/components/accessibility/`, `src/data/accessibility/`, `src/styles/` ;
- progression : `src/components/pedagogie/progress.ts`, `src/utils/contentIds.ts`, `src/utils/contentProgressMigration.ts` ;
- sécurité des contenus : `src/utils/trustedContent.ts`, `docs/architecture/securite-contenus.md` ;
- qualité globale : `scripts/verify-routes-and-content.mjs`, `scripts/audit-dist.mjs`.

## Responsabilités des agents V3

Le directeur de refonte arbitre les compromis entre architecture, pédagogie, migration, UX, accessibilité, performance et sécurité.

Les expertises à mobiliser selon les missions sont notamment :

- architecture Astro / TypeScript / React ;
- architecture de l’information ;
- UX éducative ;
- UI et design system ;
- Mathématiques collège/lycée ;
- Physique-Chimie collège/lycée ;
- Enseignement scientifique ;
- accessibilité et DYS ;
- architecture des contenus pédagogiques ;
- sécurité web ;
- performances ;
- SEO et données structurées ;
- QA, tests et intégration continue ;
- migration V2/V3 et compatibilité historique.

## Règles de migration

- conserver les routes legacy tant que les redirections explicites ne sont pas testées ;
- conserver la lecture des anciennes clés `localStorage` et migrer par alias idempotents ;
- ne jamais créer deux sources de vérité permanentes ;
- normaliser les contenus vers un contrat commun avec extensions disciplinaires ;
- ne pas convertir massivement un corpus sans tests de migration ;
- ne jamais verrouiller en Premium un contenu indispensable à la compréhension de base ;
- ne pas modifier un ID canonique sans stratégie d’alias/migration ;
- ne pas déplacer un artefact historique encore potentiellement référencé sans audit préalable.

## Règles pédagogiques

- cours progressifs, scientifiquement justes et adaptés au niveau ;
- exercices gradués avec aides et corrections structurées ;
- quiz et flashcards compatibles avec les moteurs existants ;
- cohérence avec le programme réellement applicable à l’année scolaire concernée ;
- pas de contenu publié uniquement parce qu’un fichier existe : route, contrat, IDs et ressources doivent tous être valides ;
- formules conservées en LaTeX/KaTeX avec MathML, jamais rasterisées en image.

### Figures scientifiques

La cible est une bibliothèque réutilisable de figures statiques produites par LaTeX/TikZ/PGFPlots/circuitikz/chemfig lorsque cela est pertinent. JavaScript doit rester réservé à une véritable interaction pédagogique : modifier des paramètres, mesurer, tester une hypothèse, comparer des états ou exploiter des données.

Tant que la migration des figures n’est pas achevée, ne pas ajouter d’animation décorative ou de simulation factice là où une figure statique suffit.

## Accessibilité et DYS

Toute évolution doit préserver :

- navigation clavier ;
- focus visible ;
- structure sémantique des titres ;
- alternatives accessibles aux schémas/canvas ;
- information jamais portée uniquement par la couleur ;
- préférences DYS ;
- `prefers-reduced-motion` ;
- MathML disponible aux technologies d’assistance.

## Sécurité

- pas de secret dans le dépôt ;
- pas de `eval`, `new Function` ou équivalent sur des entrées utilisateur ;
- pas d’HTML/SVG actif non filtré ;
- ne pas affaiblir CSP, sanitization ou audit npm pour contourner un échec ;
- toute vulnérabilité npm `high` ou `critical` doit bloquer la qualité jusqu’à remédiation ou justification explicite et limitée.

## Commandes de validation

Selon le périmètre :

```bash
npm run check
npm run lint
npm test
npm run verify:content
npm run audit:security
npm run build
npm run audit:dist:fast
npm run audit:dist:a11y
```

Raccourcis :

```bash
npm run ci:quality
npm run ci:dist
npm run ci:a11y
```

La CI doit conserver les checks `quality`, `dist-fast` et `dist-a11y`. ESLint fonctionne avec `--max-warnings=0` : un warning n’est pas une dette silencieuse acceptable.

## Critère 1 — Architecture et maintenabilité

Évaluer cohérence de l’arborescence, séparation des responsabilités, réutilisation, typage, lisibilité, duplication évitable, capacité d’évolution et maîtrise des dépendances.

## Critère 2 — UX, UI et cohérence du design

Évaluer clarté des parcours, compréhension immédiate, cohérence de la charte, hiérarchie visuelle, responsive, états interactifs, qualité des composants, différenciation des disciplines et fidélité au design system.

## Critère 3 — Qualité pédagogique et scientifique

Évaluer exactitude, progression, adéquation au niveau, explications, exercices, corrections, cohérence avec les programmes applicables, structure cours/quiz/flashcards et pertinence des laboratoires.

## Critère 4 — Accessibilité et DYS

Évaluer navigation clavier, focus, contrastes, lecteurs d’écran, structure des titres, formules, graphiques, schémas, charge cognitive, préférences DYS et absence d’information transmise seulement par la couleur.

## Critère 5 — Qualité technique globale

Évaluer sécurité, performances, SEO, robustesse, dépendances, erreurs, données, confidentialité, budgets et compatibilité navigateurs.

## Critère 6 — Complétude, migration et validation

Évaluer respect du périmètre, absence de régression, conservation des contenus, routes et progressions, présence des tests, documentation, retour arrière et absence de travaux implicitement incomplets.

## Notation obligatoire

À la fin de chaque mission d’exécution importante, noter séparément les six critères sur 10. Chaque critère doit atteindre au moins **9/10**. Une moyenne supérieure à 9/10 ne valide pas un travail si un seul critère reste sous 9/10.

Chaque note doit être justifiée par des preuves : fichiers modifiés, tests, commandes, captures, mesures, comparaison avant/après ou critères d’acceptation satisfaits. Les formulations vagues ne valent pas preuve.
