# Audit de l'organisation et de l'humanisation de l'arborescence

Audit lecture seule realise sur le projet Astro. Aucun fichier source n'a ete modifie pendant l'audit.

## Livrable 1 - Rapport d'audit

### A. Resume chiffre

| Indicateur | Valeur |
|---|---:|
| Dossiers analyses | ~195 dans `src/`, plus racine utile |
| Fichiers analyses | ~760 applicatifs, 1795 avec docs/BO/labo legacy |
| Problemes critiques | 0 |
| Priorite haute | 7 |
| Priorite moyenne | 8 |
| Priorite faible | 4 |
| Conventions de nommage differentes | 7 |
| Structures dupliquees | 6 |
| Dossiers fourre-tout | 5 |

### B. Tableau des problemes

| ID | Chemin concerne | Categorie | Probleme constate | Priorite | Risque | Correction ciblee |
|---|---|---|---|---|---|---|
| ORG-001 | `src/data/chapters/` + `src/data/mathematiques/chapters/` | INCOHERENCE_INTERDISCIPLINAIRE | Deux conventions de contenus paralleles | HAUTE | ELEVE | Creer une convention cible sans casser les routes |
| ORG-002 | `src/data/` | RESPONSABILITES_MELANGEES | Contenu, config, moteurs et donnees melanges | HAUTE | MODERE | Separer `content`, `data`, `lib` |
| ORG-003 | `src/pages/*/[chapitre].astro` | RESPONSABILITES_MELANGEES | Routes chargent et normalisent trop de donnees | HAUTE | ELEVE | Extraire helpers de chargement |
| ORG-004 | `laboratoire/` | NOMMAGE | Legacy en `snake_case`, routes en `kebab-case` | HAUTE | ELEVE | Cartographier legacy sans changer URLs |
| ORG-005 | `laboratoire/titrage_ph/Nouveau dossier/` | AMBIGUITE | Dossier generique avec espace et doublons | HAUTE | MODERE | Identifier source canonique puis deplacer/archiver |
| ORG-006 | `laboratoire/chronophotographie/snell_descartes.html` | EMPLACEMENT | Fichier range dans un mauvais module | HAUTE | MODERE | Comparer au module `snell_descartes` |
| ORG-007 | `src/pages/mega-quiz.astro` + `src/pages/memorisation/mega-quiz.astro` | DUPLICATION | Routes memoire doublonnees | MOYENNE | MODERE | Definir une route canonique et rediriger |
| ORG-008 | `src/pages/laboratoire/` | STRUCTURE_HERITEE | Routes statiques + dynamique coexistantes | MOYENNE | ELEVE | Documenter puis unifier progressivement |
| ORG-009 | `src/components/pedagogie/` | DOSSIER_FOURRE_TOUT | 32 composants de natures differentes | MOYENNE | MODERE | Classer en lecteurs, blocs, outils, progression |
| ORG-010 | `src/components/*/theme-tokens.ts`, `src/data/accessibility/theme-tokens.ts` | DUPLICATION | Tokens dupliques/emplacement ambigu | HAUTE | FAIBLE | Garder une seule source |
| ORG-011 | `src/pages/outils-methodes/cours-python.astro` | FICHIER_TROP_LARGE | Page contient contenu, quiz, flashcards, config | MOYENNE | MODERE | Extraire donnees et contenu |
| ORG-012 | `src/scripts/laboratoire/generic-lab-simulator.js` | FICHIER_TROP_LARGE | Script tres volumineux | MOYENNE | MODERE | Decouper par responsabilite |
| ORG-013 | `src/styles/design-system.css` | FICHIER_TROP_LARGE | Styles globaux tres volumineux | MOYENNE | MODERE | Decouper sans changer le rendu |
| ORG-014 | `src/data/chapters/**/cours.fragment.html` | AMBIGUITE | Format secondaire limite a quelques chapitres | MOYENNE | ELEVE | Clarifier convention MDX/fragment |
| ORG-015 | `src/data/chapters/**/cours.mdx` | IMPORTS_COMPLEXES | Imports relatifs tres profonds | MOYENNE | MODERE | Ajouter alias TypeScript/Astro |
| ORG-016 | `tmp/`, `output/`, logs racine | DOSSIER_FOURRE_TOUT | Artefacts de travail dans le depot | FAIBLE | FAIBLE | Deplacer/ignorer hors source |
| ORG-017 | `public/favicon*` | DUPLICATION | Favicon racine + dossier `favicon/` | FAIBLE | FAIBLE | Garder une convention unique |
| ORG-018 | `src/content/` | STRUCTURE_HERITEE | Dossier vide non exploite | FAIBLE | FAIBLE | Decider conservation ou suppression |

### C. Incoherences de nommage

| Nom actuel | Convention concurrente | Occurrences | Convention recommandee | Fichiers concernes |
|---|---|---:|---|---|
| `chapters` | `mathematiques/chapters` | 2 | `content/{discipline}/chapters` | `src/data/chapters`, `src/data/mathematiques/chapters` |
| `snake_case` labo | `kebab-case` routes | 20+ | `kebab-case` pour chemins nouveaux | `laboratoire/*`, `src/data/laboratoire/apps.ts` |
| `mega-quiz` racine | `memorisation/mega-quiz` | 2 | route canonique sous `memorisation` | `src/pages/mega-quiz.astro`, `src/pages/memorisation/mega-quiz.astro` |
| `cours.fragment.html` | `cours.mdx` | 21 vs 112 | `cours.mdx` canonique | `src/data/chapters/**` |
| `methodesMathsLycee.ts` | `outils-methodes/*` | 2+ | regrouper sous `src/data/outils-methodes` | `src/data/methodesMaths*.ts` |
| `Math*` composants | routes francaises | 5+ | anglais pour code, francais pour URLs | `src/components/mathematiques/*` |
| `Nouveau dossier` | dossier nomme metier | 1 | nom metier explicite | `laboratoire/titrage_ph/Nouveau dossier/` |

### D. Dossiers a reorganiser

| Chemin actuel | Type de probleme | Action recommandee | Risque | Dependances a verifier |
|---|---|---|---|---|
| `src/data/` | responsabilites melangees | separer contenu/config/moteurs | MODERE | imports, globs, routes |
| `src/data/chapters/` | nom trop generique | deplacer vers convention disciplinaire | ELEVE | routes publiques, canoniques |
| `src/data/mathematiques/` | structure parallele | aligner avec PC ou convention commune | ELEVE | pages mathematiques |
| `src/components/pedagogie/` | fourre-tout | sous-dossiers fonctionnels | MODERE | imports React/Astro |
| `src/pages/outils-methodes/` | donnees/pages melangees | extraire donnees longues | MODERE | routes outils |
| `src/scripts/laboratoire/` | modeles/simulateurs melanges | classer `models`, `controllers`, `shared` | MODERE | imports labo |
| `src/styles/` | styles globaux/specifiques disperses | convention par domaine | MODERE | rendu visuel a preserver |
| `laboratoire/` | legacy ambigu | audit et archivage controle | ELEVE | `legacyPath`, liens |

### E. Arborescence actuelle simplifiee

```text
src/
├── components/
│   ├── accessibility/
│   ├── laboratoire/
│   ├── mathematiques/
│   ├── outils/
│   ├── pedagogie/
│   └── ui/
├── content/                 # vide
├── data/
│   ├── accessibility/
│   ├── chapters/
│   ├── gamification/
│   ├── laboratoire/
│   ├── mathematiques/
│   └── outils-methodes/
├── layouts/
├── pages/
│   ├── college/
│   ├── laboratoire/
│   ├── lycee/
│   ├── mathematiques/
│   ├── memorisation/
│   └── outils-methodes/
├── scripts/
├── styles/
├── types/
└── utils/
```

### F. Arborescence cible proposee

```text
src/
├── components/
│   ├── shared/
│   ├── pedagogie/
│   │   ├── readers/
│   │   ├── blocks/
│   │   ├── progress/
│   │   └── tools/
│   ├── laboratoire/
│   └── mathematiques/
├── content/
│   ├── physique-chimie/
│   │   └── chapters/
│   └── mathematiques/
│       └── chapters/
├── data/
│   ├── navigation/
│   ├── gamification/
│   ├── accessibility/
│   ├── laboratoire/
│   └── outils-methodes/
├── lib/
│   ├── content-loaders/
│   ├── laboratoire/
│   └── progression/
├── pages/
├── scripts/
│   ├── laboratoire/
│   │   ├── models/
│   │   ├── controllers/
│   │   └── shared/
│   └── workers/
├── styles/
│   ├── base/
│   ├── components/
│   ├── laboratoire/
│   └── mathematiques/
└── utils/
```

## Livrable 2 - Plan de migration

| Phase | Objectif | Risque | Fichiers sensibles | Routes a preserver |
|---|---|---|---|---|
| 1 | Creer table de conventions et chemins canoniques | FAIBLE | docs uniquement | toutes |
| 2 | Nettoyer doublons simples/tokens/artefacts | FAIBLE | `theme-tokens`, racine | toutes |
| 3 | Organiser composants `pedagogie` | MODERE | imports composants | toutes |
| 4 | Extraire donnees codees dans composants/pages | MODERE | Python, outils, simulateurs | toutes |
| 5 | Ajouter alias pour imports profonds | MODERE | `tsconfig`, `astro.config`, imports | toutes |
| 6 | Harmoniser `chapters` / `mathematiques/chapters` | ELEVE | `import.meta.glob`, `canonical` | `/college`, `/lycee`, `/mathematiques` |
| 7 | Reorganiser laboratoire legacy | ELEVE | `apps.ts`, `genericConfigs.ts`, legacyPath | `/laboratoire/*` |
| 8 | Audit final et build | FAIBLE | tout | toutes |

## Livrable 3 - Serie de prompts Codex

### Prompt 1 - Inventaire canonique des chemins

```text
# Inventaire canonique des chemins et conventions

## Objectif
Creer un document de reference listant les chemins actuels, chemins cibles proposes, routes publiques a preserver et risques associes.

## Perimetre autorise
- Creation d'un fichier Markdown d'inventaire.
- Lecture de `src/pages`, `src/data`, `src/components`, `src/scripts`, `src/styles`, `laboratoire`.

## Fichiers et dossiers concernes
- `src/pages/**`
- `src/data/**`
- `src/components/**`
- `src/scripts/**`
- `src/styles/**`
- `laboratoire/**`

## Constats issus de l'audit
- `src/data/chapters` et `src/data/mathematiques/chapters` suivent deux conventions paralleles.
- Les routes publiques dependent fortement des chemins actuels.
- Le laboratoire legacy utilise `snake_case`.

## Modifications a effectuer
1. Lire les fichiers concernes.
2. Rechercher tous les `import.meta.glob`.
3. Rechercher toutes les routes dynamiques.
4. Rechercher les imports relatifs profonds.
5. Creer une table `ancien chemin -> role -> route publique -> risque -> chemin cible eventuel`.
6. Ne deplacer aucun fichier.

## Elements a preserver
- Ne pas modifier l'UX.
- Ne pas modifier le design.
- Ne pas modifier le contenu pedagogique.
- Ne pas ajouter de fonctionnalite.
- Preserver les routes publiques.
- Ne pas laisser de TODO.

## Verifications prealables
Lire `package.json`, `astro.config.mjs`, `tsconfig.json`.

## Tests a executer
- `npm run build`

## Criteres de validation
- Inventaire complet des chemins sensibles.
- Aucun fichier source deplace.
- Build reussi.

## Compte rendu attendu
- Fichier cree.
- Nombre de chemins sensibles recenses.
- Liste des migrations a risque eleve.
```

### Prompt 2 - Nettoyage des doublons simples et artefacts

```text
# Nettoyage organisationnel des doublons simples et artefacts

## Objectif
Reduire les ambiguites faciles sans toucher aux contenus ni aux routes.

## Perimetre autorise
- Fichiers de tokens dupliques.
- Fichiers temporaires ou logs racine.
- Dossiers de sortie non sources.
- Favicon doublonne uniquement si references preservees.

## Fichiers et dossiers concernes
- `src/components/accessibility/theme-tokens.ts`
- `src/data/accessibility/theme-tokens.ts`
- `tmp/`
- `output/`
- logs racine `*.log`
- `public/favicon*`

## Constats issus de l'audit
- Deux fichiers `theme-tokens.ts` existent.
- Des artefacts de travail sont presents a la racine.
- `public` contient favicon racine et dossier `favicon`.

## Modifications a effectuer
1. Lire les fichiers concernes.
2. Rechercher tous leurs imports et references.
3. Choisir une source unique pour les tokens.
4. Mettre a jour les imports.
5. Proposer ou appliquer uniquement les suppressions sans risque.
6. Ne supprimer aucun contenu pedagogique.

## Elements a preserver
- Ne pas modifier l'UX.
- Ne pas modifier le design.
- Ne pas modifier le contenu pedagogique.
- Ne pas ajouter de fonctionnalite.
- Preserver les routes publiques.
- Mettre a jour les imports.
- Ne pas laisser de TODO.

## Verifications prealables
- Rechercher les references a `/favicon.svg`, `/manifest.json`, `/og-image.png`.
- Verifier `.gitignore`.

## Tests a executer
- `npm run build`

## Criteres de validation
- Une seule source de tokens.
- Aucun import casse.
- Aucun asset public reference supprime.
- Build reussi.

## Compte rendu attendu
- Fichiers supprimes/deplaces.
- Imports mis a jour.
- Artefacts conserves ou ignores.
```

### Prompt 3 - Reorganisation des composants pedagogiques

```text
# Reorganisation des composants pedagogiques

## Objectif
Classer `src/components/pedagogie` en sous-dossiers lisibles sans changer le comportement.

## Perimetre autorise
- Deplacement de composants.
- Creation de sous-dossiers.
- Mise a jour des imports.

## Fichiers et dossiers concernes
- `src/components/pedagogie/**`
- Imports depuis `src/pages/**`
- Imports depuis `src/data/chapters/**/*.mdx`
- Imports depuis `src/data/mathematiques/**/*.mdx`

## Constats issus de l'audit
- `src/components/pedagogie` contient lecteurs, blocs, progression, outils, simulateurs et utilitaires.
- Le dossier compte 32 fichiers de nature differente.

## Modifications a effectuer
1. Lire tous les composants.
2. Rechercher tous les imports.
3. Proposer une structure `readers/`, `blocks/`, `progress/`, `tools/`, `utils/`.
4. Deplacer uniquement les composants dont la categorie est evidente.
5. Mettre a jour tous les imports.
6. Ne modifier aucun JSX/HTML hors imports.

## Elements a preserver
- Ne pas modifier l'UX.
- Ne pas modifier le design.
- Ne pas modifier le contenu pedagogique.
- Ne pas ajouter de fonctionnalite.
- Preserver les routes publiques.
- Mettre a jour les imports.
- Ne pas laisser de TODO.

## Verifications prealables
- Rechercher `from "../components/pedagogie`, `../../components/pedagogie`, `components/pedagogie`.
- Verifier les imports MDX.

## Tests a executer
- `npm run build`

## Criteres de validation
- Aucun composant perdu.
- Aucun import casse.
- Aucune modification de rendu volontaire.
- Build reussi.

## Compte rendu attendu
- Ancien chemin -> nouveau chemin.
- Imports modifies.
- Composants laisses volontairement en place.
```

### Prompt 4 - Extraction des donnees codees dans pages et composants

```text
# Extraction des donnees codees dans pages et composants

## Objectif
Separer les donnees statiques des composants/pages sans modifier le contenu.

## Perimetre autorise
- Creation de fichiers dans `src/data`.
- Deplacement de constantes.
- Mise a jour des imports.

## Fichiers et dossiers concernes
- `src/pages/outils-methodes/cours-python.astro`
- `src/components/pedagogie/PythonExercisesRunner.tsx`
- `src/components/pedagogie/TableauPeriodique.tsx`
- `src/components/pedagogie/RelationChooser.tsx`
- `src/components/pedagogie/RedoxBuilder.tsx`
- `src/components/pedagogie/ColorimetricTitrationSimulator.tsx`

## Constats issus de l'audit
- Plusieurs composants contiennent directement des jeux de donnees.
- `cours-python.astro` contient contenu, quiz, flashcards et config.

## Modifications a effectuer
1. Lire les fichiers concernes.
2. Rechercher les imports et usages.
3. Creer des fichiers de donnees dedies.
4. Deplacer les constantes sans changer leurs valeurs.
5. Importer les donnees depuis les composants/pages.
6. Ne modifier aucune question, reponse, formule ou texte.

## Elements a preserver
- Ne pas modifier l'UX.
- Ne pas modifier le design.
- Ne pas modifier le contenu pedagogique.
- Ne pas ajouter de fonctionnalite.
- Preserver les routes publiques.
- Mettre a jour les imports.
- Ne pas laisser de TODO.

## Verifications prealables
- Comparer avant/apres les objets exportes.
- Verifier les types TypeScript.

## Tests a executer
- `npm run build`

## Criteres de validation
- Donnees extraites a l'identique.
- Composants plus courts.
- Build reussi.

## Compte rendu attendu
- Donnees extraites.
- Fichiers crees.
- Fichiers modifies.
```

### Prompt 5 - Ajout d'alias pour reduire les imports profonds

```text
# Reduction des imports relatifs profonds

## Objectif
Ajouter des alias de chemins pour eviter les imports `../../../../` fragiles.

## Perimetre autorise
- Configuration TypeScript/Astro.
- Mise a jour progressive des imports les plus profonds.
- Aucun deplacement de contenu.

## Fichiers et dossiers concernes
- `tsconfig.json`
- `astro.config.mjs`
- `src/pages/**`
- `src/data/chapters/**/*.mdx`
- `src/data/mathematiques/**/*.mdx`

## Constats issus de l'audit
- Des pages dynamiques et MDX importent via chemins relatifs tres profonds.
- Aucun alias n'est configure dans `tsconfig.json`.

## Modifications a effectuer
1. Lire `tsconfig.json` et `astro.config.mjs`.
2. Ajouter des alias stables : `@components`, `@data`, `@styles`, `@utils`.
3. Mettre a jour un premier lot d'imports profonds.
4. Ne pas deplacer les fichiers.
5. Verifier les imports MDX.

## Elements a preserver
- Ne pas modifier l'UX.
- Ne pas modifier le design.
- Ne pas modifier le contenu pedagogique.
- Ne pas ajouter de fonctionnalite.
- Preserver les routes publiques.
- Mettre a jour les imports.
- Ne pas laisser de TODO.

## Verifications prealables
- Rechercher tous les imports avec `../../../`.
- Identifier les imports MDX sensibles.

## Tests a executer
- `npm run build`

## Criteres de validation
- Alias reconnus.
- Imports mis a jour sans casse.
- Build reussi.

## Compte rendu attendu
- Alias ajoutes.
- Imports convertis.
- Imports restants a convertir.
```

### Prompt 6 - Harmonisation des structures de contenu PC et mathematiques

```text
# Harmonisation des structures de contenu physique-chimie et mathematiques

## Objectif
Aligner l'organisation des contenus disciplinaires sans changer les routes publiques.

## Perimetre autorise
- Creation d'une structure cible.
- Deplacement controle de dossiers.
- Mise a jour des `import.meta.glob`.
- Mise a jour des helpers de chemins.

## Fichiers et dossiers concernes
- `src/data/chapters/**`
- `src/data/mathematiques/chapters/**`
- `src/pages/college/**`
- `src/pages/lycee/**`
- `src/pages/mathematiques/**`
- `src/pages/index.astro`
- `src/pages/mega-quiz.astro`
- `src/pages/mega-flashcards.astro`

## Constats issus de l'audit
- PC utilise `src/data/chapters/{cycle}/{niveau}/{matiere}/{chapitre}`.
- Maths utilise `src/data/mathematiques/chapters/{cycle}/{niveau}/{chapitre}`.
- Les routes dependent des chemins actuels.

## Modifications a effectuer
1. Lire tous les `import.meta.glob`.
2. Construire une table ancien chemin -> nouveau chemin -> URL publique.
3. Choisir une structure cible, par exemple `src/content/{discipline}/chapters`.
4. Deplacer les contenus seulement apres validation de la table.
5. Mettre a jour tous les globs.
6. Mettre a jour les helpers de chemins.
7. Verifier les `seo.canonical`.

## Elements a preserver
- Ne pas modifier l'UX.
- Ne pas modifier le design.
- Ne pas modifier le contenu pedagogique.
- Ne pas ajouter de fonctionnalite.
- Preserver les routes publiques.
- Mettre a jour les imports.
- Ne pas laisser de TODO.

## Verifications prealables
- Rechercher toutes les references `/src/data/chapters`.
- Rechercher toutes les references `/src/data/mathematiques/chapters`.
- Lister les routes generees avant migration.

## Tests a executer
- `npm run build`

## Criteres de validation
- Meme nombre de chapitres generes.
- URLs publiques inchangees.
- Canoniques coherents.
- Build reussi.

## Compte rendu attendu
- Table de migration.
- Globs modifies.
- Routes verifiees.
```

### Prompt 7 - Reorganisation du laboratoire legacy

```text
# Reorganisation du laboratoire legacy

## Objectif
Reduire les ambiguites du dossier `laboratoire/` sans casser les routes `/laboratoire/*`.

## Perimetre autorise
- Cartographie des fichiers legacy.
- Renommage/deplacement uniquement si `legacyPath` est mis a jour.
- Suppression seulement de doublons prouves inutiles.

## Fichiers et dossiers concernes
- `laboratoire/**`
- `src/data/laboratoire/apps.ts`
- `src/data/laboratoire/genericConfigs.ts`
- `src/pages/laboratoire/[slug].astro`
- `src/pages/laboratoire/*.astro`
- `src/scripts/laboratoire/**`
- `src/styles/laboratoire/**`

## Constats issus de l'audit
- `laboratoire/` utilise `snake_case`.
- `Nouveau dossier` existe dans `laboratoire/titrage_ph`.
- `snell_descartes.html` existe dans un mauvais dossier probable.
- Routes statiques et dynamique coexistent.

## Modifications a effectuer
1. Lire `apps.ts` et tous les `legacyPath`.
2. Creer une table slug -> route -> legacyPath -> dossier actuel.
3. Identifier les doublons exacts.
4. Corriger uniquement les chemins prouves.
5. Mettre a jour `apps.ts` et references.
6. Ne pas changer les slugs publics.

## Elements a preserver
- Ne pas modifier l'UX.
- Ne pas modifier le design.
- Ne pas modifier le contenu pedagogique.
- Ne pas ajouter de fonctionnalite.
- Preserver les routes publiques.
- Mettre a jour les imports/references.
- Ne pas laisser de TODO.

## Verifications prealables
- Rechercher tous les liens vers `laboratoire/`.
- Verifier les tests `tests/laboratoire`.

## Tests a executer
- `npm run build`
- Tests cibles `tests/laboratoire/*.mjs` si executables localement.

## Criteres de validation
- `/laboratoire/*` inchange cote URL.
- Aucun `legacyPath` casse.
- Build reussi.

## Compte rendu attendu
- Table legacy nettoyee.
- Doublons traites.
- Fichiers laisses volontairement.
```

### Prompt 8 - Audit final de l'arborescence apres migrations

```text
# Audit final de l'arborescence apres migrations

## Objectif
Verifier que les reorganisations precedentes n'ont pas cree de doublon, route cassee ou convention concurrente.

## Perimetre autorise
- Lecture complete.
- Corrections mineures d'imports casses.
- Aucune nouvelle refonte.

## Fichiers et dossiers concernes
- Tout le depot source.

## Constats issus de l'audit
- Plusieurs corrections touchent des routes dynamiques et `import.meta.glob`.
- Les slugs publics sont sensibles.

## Modifications a effectuer
1. Rechercher les anciens chemins supposes supprimes.
2. Rechercher les imports casses.
3. Rechercher les dossiers vides inutiles.
4. Verifier les routes generees.
5. Corriger uniquement les oublis lies aux migrations.

## Elements a preserver
- Ne pas modifier l'UX.
- Ne pas modifier le design.
- Ne pas modifier le contenu pedagogique.
- Ne pas ajouter de fonctionnalite.
- Preserver les routes publiques.
- Mettre a jour les imports.
- Ne pas laisser de TODO.

## Verifications prealables
- Lire `package.json`.
- Comparer les routes avant/apres si un inventaire existe.

## Tests a executer
- `npm run build`

## Criteres de validation
- Build reussi.
- Aucune route publique perdue.
- Aucune convention concurrente nouvelle.
- Aucun dossier vide inutile.

## Compte rendu attendu
- Resume des corrections finales.
- Liste des risques restants.
- Liste des dossiers encore a surveiller.
```

## Livrable 4 - Tableau d'execution

| Ordre | Prompt | Dependances | Risque | Portee | Tests | Parallele |
|---:|---|---|---|---|---|---|
| 1 | Inventaire canonique | aucune | FAIBLE | site entier | build | non |
| 2 | Doublons simples/artefacts | prompt 1 | FAIBLE | fichiers cibles | build | oui apres 1 |
| 3 | Composants pedagogiques | prompt 1 | MODERE | composants | build | non |
| 4 | Extraction donnees | prompt 1 | MODERE | composants/pages | build | non |
| 5 | Alias imports | prompts 3-4 | MODERE | config/imports | build | non |
| 6 | Harmonisation contenus | prompts 1,5 | ELEVE | contenus/routes | build | non |
| 7 | Laboratoire legacy | prompt 1 | ELEVE | laboratoire | build + tests labo | non |
| 8 | Audit final | tous | FAIBLE | site entier | build | non |

## Livrable 5 - Hors perimetre

- UX : non traite.
- DESIGN : non traite.
- CONTENU : non traite.
- PERFORMANCES : non traite.
- ACCESSIBILITE : non traite.
- FONCTIONNALITES : non traite.
- SEO : non traite, sauf conservation des `canonical`.

## Validation de l'audit

| Critere | Note |
|---|---:|
| Exhaustivite de la cartographie | 9/10 |
| Precision des constats | 9/10 |
| Coherence des conventions proposees | 9/10 |
| Amelioration de la lisibilite humaine | 9/10 |
| Respect de l'existant | 10/10 |
| Limitation des risques | 9/10 |
| Absence de recommandations UX | 10/10 |
| Qualite du decoupage des prompts | 9/10 |
| Autonomie des prompts | 9/10 |
| Facilite d'execution | 9/10 |
