# CLAUDE.md — consignes techniques pour les assistants de code

## Projet

Plateforme éducative française organisée autour de **deux disciplines publiques** : **Mathématiques** et **Physique-Chimie**, du collège au lycée, avec mémorisation, accessibilité/DYS et laboratoires interactifs.

Au lycée, l’**Enseignement scientifique** est un **parcours rattaché à l’espace Physique-Chimie**. Il conserve un libellé explicite, ses routes historiques et son identité de parcours, mais ne doit pas être recréé comme troisième porte de navigation.

Référence obligatoire : `docs/architecture/taxonomie-disciplines.md`.

Le dépôt est en migration progressive vers la V3. Il ne faut pas réécrire l’application d’un bloc ni casser les compatibilités historiques.

Avant une modification importante, lire également :

- `README.md`
- `AGENTS.md`
- `docs/README.md`
- `docs/refonte-v3/README.md`
- le document d’architecture correspondant au périmètre modifié.

## Stack actuelle

La source de vérité des versions est `package.json`.

- **Astro 7** en sortie statique ;
- **React 19** pour les îlots interactifs ;
- **MDX** pour les cours ;
- **KaTeX + MathML** via `remark-math` / `rehype-katex` ;
- **Zod** pour les contrats de données ;
- **CSS natif**, sans Tailwind ;
- progression active stockée localement ;
- déploiement prévu sur Vercel ;
- Node `>= 22.19.0`.

Ne pas recopier de numéro de version dans un autre document si `package.json` peut être référencé à la place.

## Sources de vérité

- taxonomie publique : `docs/architecture/taxonomie-disciplines.md`, `src/data/disciplineIdentity.ts` ;
- modèle de contenu : `src/data/contentContract.ts` et `src/content-model/` ;
- corpus Physique-Chimie, dont parcours ES : `src/data/chapters/` ;
- corpus Mathématiques : `src/data/mathematiques/` ;
- laboratoires : `src/data/laboratoire/`, `src/components/laboratoire/`, `src/scripts/laboratoire/` ;
- routes : `src/pages/` ;
- IDs et migrations : `src/utils/contentIds.ts`, `src/utils/contentProgressMigration.ts` ;
- sécurité de contenu : `src/utils/trustedContent.ts` ;
- design system : `src/styles/` et `src/components/design-system/` ;
- programmes de référence conservés : `BO/` ;
- vérification globale : `scripts/verify-routes-and-content.mjs`.

## Contrat de taxonomie

1. Les facettes, portes d’entrée et contextes de premier niveau sont `mathematiques` ou `physique-chimie`.
2. Les niveaux `1ere-ens-scientifique` et `terminale-ens-scientifique` ont pour discipline parente `physique-chimie`.
3. `enseignement-scientifique` peut rester une identité de **parcours** afin de conserver badge, libellé et style distinctifs.
4. Ne pas renommer massivement les routes, IDs ou clés de progression ES.
5. Les routes historiques `*-ens-scientifique` restent valides jusqu’à une migration explicitement testée.

## Contrat de migration

1. Conserver les routes legacy tant que les redirections ne sont pas validées.
2. Conserver la lecture des anciennes clés `localStorage` et des anciens IDs via des migrations idempotentes.
3. Ne pas créer une deuxième source de vérité permanente.
4. Ne pas convertir massivement les paquets historiques sans migration testée.
5. Ne pas supprimer une simulation, un contenu ou une fonctionnalité DYS sans inventaire et preuve de remplacement.
6. Toute extension de contrat doit être représentée explicitement dans le modèle, pas seulement dans l’UI.

## Contenus pédagogiques

Les chapitres utilisent actuellement deux dialectes historiques derrière les adaptateurs :

- Physique-Chimie / parcours ES : ressources JSON majoritairement à racine tableau ;
- Mathématiques : enveloppes nommées (`exercices`, `questions`, `cards`).

Ne pas déduire le format attendu à partir d’un seul chapitre. Passer par les loaders et contrats existants.

### MDX et mathématiques

- formules inline : `$...$` ;
- formules bloc : `$$...$$` ;
- conserver KaTeX et MathML ;
- ne jamais transformer une formule en image ;
- éviter l’HTML arbitraire dans les contenus ;
- tout SVG/HTML non fiable doit suivre `docs/architecture/securite-contenus.md`.

### Figures scientifiques

Pour les nouvelles figures statiques, viser une source reproductible et réutilisable. La cible est un pipeline LaTeX/TikZ/PGFPlots/circuitikz/chemfig pour les figures non interactives. Ne pas ajouter d’animation JavaScript décorative là où une figure statique suffit.

JavaScript est justifié lorsqu’un élève agit réellement sur des paramètres, réalise une mesure, teste une hypothèse ou compare des états.

## Accessibilité et DYS

Toute modification visible doit préserver :

- navigation clavier complète ;
- focus perceptible ;
- structure de titres cohérente ;
- alternatives accessibles aux figures et canvas ;
- information non transmise uniquement par la couleur ;
- compatibilité avec les préférences DYS existantes ;
- `prefers-reduced-motion` ;
- MathML disponible aux technologies d’assistance.

## Sécurité

- aucun secret dans le dépôt ;
- aucun `eval`, `new Function` ou équivalent sur une entrée utilisateur ;
- pas d’injection de HTML non filtré ;
- utiliser les utilitaires de confiance existants ;
- ne pas affaiblir CSP ou les contrôles npm pour contourner une erreur ;
- `npm audit --audit-level=high` fait partie de `quality`.

## Qualité obligatoire

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

Raccourcis CI :

```bash
npm run ci:quality
npm run ci:dist
npm run ci:a11y
```

`npm run lint` utilise `--max-warnings=0`. La CI GitHub doit conserver les checks `quality`, `dist-fast` et `dist-a11y`.

## Règles de modification

- travailler sur une branche dédiée ;
- garder les changements focalisés ;
- ajouter ou adapter des tests lorsque le contrat change ;
- ne jamais « réparer » un test en supprimant le comportement qu’il protège sans justification ;
- ne pas modifier des centaines de contenus par recherche/remplacement aveugle ;
- préserver les accents et l’UTF-8 dans les textes, métadonnées et JSON-LD ;
- documenter toute dette volontaire introduite.

## Pièges actuels connus

- le corpus Physique-Chimie/ES et le corpus Mathématiques ne sont pas encore nativement uniformes ;
- les redirections PC explicites sont préparées mais pas toutes activées ;
- la racine contient encore des rapports historiques : ne pas les prendre pour documentation courante ;
- `src/scripts/laboratoire/generic-lab-simulator.js` reste volumineux et doit être refactoré par famille ;
- une dépréciation Astro liée à l’ancienne configuration Markdown peut encore apparaître hors diagnostics `astro check`.

## Ajout ou modification d’un chapitre

Avant de créer un chapitre : vérifier le programme, le corpus et son loader, réutiliser les IDs canoniques, conserver le format attendu, puis exécuter `verify:content`, les tests et le build. Un fichier seul ne constitue jamais une publication valide.
