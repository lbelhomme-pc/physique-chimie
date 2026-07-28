# AGENTS.md

## Role permanent du projet

Ce depot contient la plateforme pedagogique V2, construite principalement avec Astro, React, MDX, KaTeX et des donnees JSON/MDX. La V3 doit etre preparee progressivement sans casser la V2 active.

La constitution V3 est documentee dans `docs/refonte-v3/`. Tout futur prompt d'execution doit commencer par lire :

- `docs/refonte-v3/README.md`
- `docs/refonte-v3/00-resume-executif.md`
- le prompt numerote correspondant dans `docs/refonte-v3/prompts/`
- les fichiers sources explicitement listes par ce prompt

## Regle de base

Ne pas reecrire toute l'architecture d'un coup. Ne pas supprimer de contenu, route, progression, fonction DYS, simulation ou metadonnee sans inventaire, justification, test et procedure de retour arriere.

## Sources de reference

- Programmes officiels : dossier `BO/`
- Etat et audits existants : `docs/`, notamment `docs/audit-site-global-2026-05-29.md`
- Architecture V3 : `docs/refonte-v3/`
- Contenus physique-chimie : `src/data/chapters/`
- Contenus mathematiques : `src/data/mathematiques/`
- Laboratoire : `src/data/laboratoire/`, `src/components/laboratoire/`, `src/scripts/laboratoire/`
- Accessibilite/DYS : `src/components/accessibility/`, `src/data/accessibility/`, `src/styles/design-system.css`
- Progression : `src/components/pedagogie/progress.ts`, `src/utils/contentIds.ts`, `src/utils/contentProgressMigration.ts`
- Securite des contenus : `src/utils/trustedContent.ts`, `docs/architecture/securite-contenus.md`

## Responsabilites des agents V3

Le directeur de refonte arbitre les compromis entre architecture, pedagogie, migration, UX, accessibilite et securite.

Les agents specialises a mobiliser selon les prompts sont :

- Architecte Astro, TypeScript et React
- Architecte de l'information
- Expert UX educative
- Directeur artistique UI
- Expert design system
- Enseignant expert en mathematiques
- Enseignant expert en physique-chimie
- Expert enseignement scientifique
- Expert accessibilite et DYS
- Architecte des contenus pedagogiques
- Expert securite web
- Expert performances web
- Expert SEO et donnees structurees
- Product manager Gratuit/Premium
- Expert QA, tests et integration continue
- Responsable migration V2 vers V3

## Perimetre de la premiere mission V3

La premiere mission est documentaire : audit, conception, planification, prompts d'execution. Elle ne doit pas modifier les pages, routes, contenus ou composants actifs de la V2.

## Regles de migration

- Conserver les routes legacy tant que les redirections explicites ne sont pas testees.
- Conserver les anciennes cles `localStorage` et migrer par alias idempotents.
- Ne jamais creer deux sources de verite permanentes.
- Normaliser les contenus vers un contrat commun avec extensions disciplinaires.
- Ne jamais transformer les formules en images lorsque KaTeX ou une representation structuree est possible.
- Ne jamais verrouiller en Premium un contenu indispensable a la comprehension de base.

## Regles pedagogiques conservees

Pour les contenus de college, dont la 5e deja amorcee, respecter :

- cours courts, progressifs, scientifiquement justes ;
- exercices gradues, aides progressives et corrections non affichees par defaut ;
- quiz et flashcards compatibles avec le moteur existant ;
- schemas SVG utiles, lisibles, responsives, accompagnes d'une alternative accessible ;
- coherence avec les programmes du dossier `BO/`.

## Commandes de validation

Executer selon le perimetre du prompt :

```bash
npm.cmd run check
npm.cmd run lint
npm.cmd test
npm.cmd run verify:content
npm.cmd run build
npm.cmd run audit:dist
```

Si `npm` est bloque par PowerShell, utiliser `npm.cmd`. Si `audit:dist` depasse la fenetre d'execution, documenter le timeout, lire `scripts/audit-dist.mjs`, puis reduire ou segmenter l'audit dans un prompt dedie.

## Critere 1 - Architecture et maintenabilite

Evaluer coherence de l'arborescence, separation des responsabilites, reutilisation, typage, lisibilite, duplication evitable, capacite d'evolution et maitrise des dependances.

## Critere 2 - UX, UI et coherence du design

Evaluer clarté des parcours, comprehension immediate, coherence de la charte, hierarchie visuelle, responsive, etats interactifs, qualite des composants, differenciation des disciplines et fidelite au design system.

## Critere 3 - Qualite pedagogique et scientifique

Evaluer exactitude, progression, adequation au niveau, explications, exercices, corrections, coherence avec les programmes, structure cours/quiz/flashcards et pertinence des laboratoires.

## Critere 4 - Accessibilite et DYS

Evaluer navigation clavier, focus, contrastes, lecteurs d'ecran, structure des titres, formules, graphiques, schemas, charge cognitive, preferences DYS et absence d'information transmise seulement par la couleur.

## Critere 5 - Qualite technique globale

Evaluer securite, performances, SEO, robustesse, dependances, erreurs, donnees, confidentialite, budgets et compatibilite navigateurs.

## Critere 6 - Completude, migration et validation

Evaluer respect du perimetre, absence de regression, conservation des contenus, routes et progressions, presence des tests, documentation, retour arriere et absence de travaux implicitement incomplets.

## Notation obligatoire

A la fin de chaque futur prompt d'execution, noter separement les six criteres sur 10. Chaque critere doit atteindre au moins 9/10. Une moyenne superieure a 9/10 ne valide pas un travail si un critere est sous 9/10.

Chaque note doit etre justifiee par des preuves : fichiers modifies, tests, commandes, captures, mesures, comparaison avant/apres ou criteres d'acceptation satisfaits. Les formulations vagues ne valent pas preuve.
