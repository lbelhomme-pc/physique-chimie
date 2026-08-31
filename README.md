# Maths & Physique-Chimie

Plateforme éducative française statique destinée au collège et au lycée. L’interface publique est organisée autour de **deux disciplines** : **Mathématiques** et **Physique-Chimie**. Au lycée, l’**Enseignement scientifique** est un parcours rattaché à l’espace Physique-Chimie, aux côtés de la Seconde et de la spécialité Physique-Chimie. Le dépôt regroupe également les outils de mémorisation, les fonctions d’accessibilité/DYS et un laboratoire de simulations interactives.

Le projet est en migration progressive vers son architecture V3. La règle est de faire évoluer l’existant sans casser les routes publiées, les identifiants pédagogiques, les progressions locales ni les contenus déjà accessibles.

La décision de taxonomie publique est documentée dans [`docs/architecture/taxonomie-disciplines.md`](docs/architecture/taxonomie-disciplines.md).

## État technique

- **Astro 7** avec rendu statique ;
- **React 19** pour les composants interactifs ;
- **MDX + KaTeX** pour les cours et les mathématiques ;
- **Zod** pour le contrat de contenu commun ;
- **CSS natif** et design system maison ;
- **localStorage** pour les progressions actuellement actives ;
- déploiement statique prévu sur **Vercel** ;
- CI GitHub Actions avec contrôles qualité, distribution et accessibilité.

La source de vérité des versions est `package.json` et la source de vérité des contenus publiables est `npm run verify:content`.

### Référence validée au 31 août 2026

Lors de C05, le dépôt contient :

- **101 chapitres** dans le corpus Physique-Chimie, incluant les parcours d’Enseignement scientifique au lycée ;
- **11 chapitres de Mathématiques**, actuellement publiés en Seconde ;
- **25 applications de laboratoire** ;
- **3 450 identifiants canoniques de ressources**.

Ces nombres sont un instantané documentaire : ne pas les utiliser comme constante applicative.

## Prérequis

- Node.js `>= 22.19.0`
- npm `>= 9.6.5`

## Installation et développement

```bash
npm ci
npm run dev
```

Le serveur Astro utilise par défaut `http://localhost:4321`.

Pour vérifier un build de production :

```bash
npm run build
npm run preview
```

Toujours reconstruire avant `preview` afin de ne pas inspecter un `dist/` périmé.

## Commandes de qualité

| Commande | Rôle |
| --- | --- |
| `npm run check` | diagnostics Astro / TypeScript |
| `npm run lint` | ESLint strict, **0 warning autorisé** |
| `npm test` | tests automatisés |
| `npm run verify:content` | routes, contrats, IDs et contenus |
| `npm run audit:security` | audit npm, blocage high/critical |
| `npm run build` | build statique Astro |
| `npm run audit:dist:fast` | audit rapide du build |
| `npm run audit:dist:a11y` | audit accessibilité du build |
| `npm run ci:quality` | check + lint + tests + contenu + sécurité |
| `npm run ci:dist` | build + audit rapide |
| `npm run ci:a11y` | build + audit accessibilité |

La CI publique est structurée autour de trois checks stables :

- `quality`
- `dist-fast`
- `dist-a11y`

La protection attendue de `main` est documentée dans `.github/BRANCH_PROTECTION.md`.

## Architecture du dépôt

```text
.
├── BO/                         # références de programmes conservées dans le dépôt
├── docs/                       # documentation technique, audits et historique
├── public/                     # ressources publiques statiques
├── scripts/                    # audits, vérifications et outils de maintenance
├── src/
│   ├── components/             # UI Astro/React et composants pédagogiques
│   ├── content-model/          # façade du modèle de contenu V3
│   ├── data/
│   │   ├── chapters/           # corpus Physique-Chimie, dont parcours ES au lycée
│   │   ├── mathematiques/      # corpus Mathématiques
│   │   └── laboratoire/        # catalogue des applications de laboratoire
│   ├── layouts/                # layouts Astro
│   ├── pages/                  # routes publiques
│   ├── scripts/                # scripts client, dont laboratoires
│   ├── styles/                 # design system et tokens
│   └── utils/                  # IDs, progression, sécurité, helpers
└── tests/                      # tests unitaires, contrats et validations structurelles
```

### Contenus

Le modèle V3 commun est défini principalement dans `src/data/contentContract.ts` et exposé via `src/content-model/`.

Deux formats historiques coexistent encore derrière les adaptateurs :

- le corpus Physique-Chimie, y compris l’Enseignement scientifique au lycée, utilise majoritairement des fichiers JSON à racine tableau ;
- le corpus Mathématiques utilise déjà des enveloppes nommées (`exercices`, `questions`, `cards`).

Cette coexistence est temporaire mais volontaire. Ne pas supprimer un adaptateur ou convertir massivement un corpus sans migration testée.

### Disciplines et parcours lycée

L’interface ne doit pas présenter l’Enseignement scientifique comme une troisième discipline de premier niveau. La hiérarchie publique est :

- **Mathématiques** ;
- **Physique-Chimie** ;
  - collège ;
  - lycée : Seconde ;
  - lycée : spécialité Physique-Chimie ;
  - lycée : Enseignement scientifique.

Les libellés « Enseignement scientifique » restent visibles sur les pages et cartes de parcours. Les anciennes routes contenant `ens-scientifique`, les IDs canoniques et les données de progression restent conservés tant qu’une migration explicite n’est pas certifiée.

### Routes, IDs et progression

Les routes legacy restent actives tant que leurs redirections ne sont pas explicitement validées. Les identifiants de ressources et les anciennes clés de progression locale doivent rester lisibles grâce aux alias et migrations idempotentes.

Avant toute modification de routes, d’IDs ou de progression, lire :

- `docs/architecture/strategie-alias-progression.md`
- `src/utils/contentIds.ts`
- `src/utils/contentProgressMigration.ts`
- `scripts/verify-routes-and-content.mjs`

## Documentation

Commencer par [`docs/README.md`](docs/README.md), qui distingue les documents **autoritaires**, les documents de **migration V3** et les archives **historiques**.

Documents importants :

- [`AGENTS.md`](AGENTS.md) — règles permanentes pour les agents de développement ;
- [`CLAUDE.md`](CLAUDE.md) — consignes techniques condensées pour les assistants de code ;
- [`docs/refonte-v3/`](docs/refonte-v3/) — architecture et plan de migration V3 ;
- [`docs/architecture/`](docs/architecture/) — décisions techniques ciblées ;
- [`.github/BRANCH_PROTECTION.md`](.github/BRANCH_PROTECTION.md) — contrat de protection de `main`.

## Règles de contribution

1. Travailler sur une branche dédiée ; ne pas pousser directement sur `main`.
2. Faire une modification limitée et réversible.
3. Ne pas casser les routes, IDs canoniques, alias de progression ou clés `localStorage` existantes.
4. Ne pas contourner le contrat de contenu pour publier une ressource invalide.
5. Conserver KaTeX/MathML pour les formules ; ne pas remplacer une formule par une image.
6. Préserver navigation clavier, lecteurs d’écran, modes DYS et `prefers-reduced-motion`.
7. Lancer au minimum `npm run ci:quality` avant une PR ; pour une modification visible, valider également `dist-fast` et `dist-a11y`.
8. Ne jamais désactiver un contrôle qualité uniquement pour rendre la CI verte.

## Politique de sécurité

- pas de secret dans le dépôt ;
- pas d’évaluation arbitraire de code utilisateur ;
- contenus HTML/SVG non fiables obligatoirement filtrés par les utilitaires prévus ;
- toute dépendance avec vulnérabilité `high` ou `critical` bloque `quality` ;
- les en-têtes de sécurité de déploiement sont déclarés dans `vercel.json`.

Voir `docs/architecture/securite-contenus.md` pour le modèle de confiance des contenus.

## Hygiène du dépôt

La racine contient encore plusieurs rapports et artefacts historiques issus des migrations précédentes. Ils ne constituent pas la documentation technique courante. Leur statut est inventorié dans `docs/historique/racine-legacy.md` afin d’éviter qu’un ancien rapport soit utilisé comme source de vérité.

Les nouveaux audits, rapports de migration et comptes rendus doivent être rangés sous `docs/` et non ajoutés à la racine.
