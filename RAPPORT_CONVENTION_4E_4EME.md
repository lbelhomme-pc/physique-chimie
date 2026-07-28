# Rapport d'audit - Convention `4e` / `4eme`

## 1. Objet de l'audit

Ce rapport audite uniquement la convention utilisee pour le niveau de quatrieme dans le projet Astro.

Question examinee :

> Le champ `niveau` des 9 fichiers `meta.json` de `src/data/chapters/college/4eme/` doit-il conserver la valeur `"4e"` ou utiliser la valeur `"4eme"` ?

Aucune correction n'a ete appliquee dans le cadre de cet audit.

## 2. Fichiers et zones analyses

| Zone | Chemins consultes | Constat principal |
|---|---|---|
| Configuration des niveaux physique-chimie | `src/data/levels.ts` | Le slug technique de quatrieme est `4eme`; le label affiche est separe. |
| Routes college | `src/pages/college/[niveau]/index.astro`, `src/pages/college/[niveau]/[matiere]/index.astro`, `src/pages/college/[niveau]/[matiere]/[chapitre].astro` | Les routes publiques sont construites depuis les dossiers et les params Astro, pas depuis `meta.niveau`. |
| Accueil / dashboard | `src/pages/index.astro`, `src/components/pedagogie/Dashboard.tsx`, `src/components/ui/SearchBar.tsx` | Les chemins du dashboard utilisent le niveau derive du dossier. |
| Mega quiz / mega flashcards | `src/pages/mega-quiz.astro`, `src/pages/mega-flashcards.astro`, `src/components/pedagogie/MegaQuizPlayer.tsx`, `src/components/pedagogie/MegaFlashcardsPlayer.tsx` | Les filtres de niveau utilisent `meta.niveau` comme valeur affichee et valeur de filtrage. |
| Mathematiques | `src/data/mathematiques/levels.ts` | La convention separe bien `slug: "4eme"` et `shortLabel: "4e"`. |
| Metadonnees de chapitres | `src/data/chapters/**/meta.json` | La majorite des `niveau` sont des slugs techniques. Les 9 fichiers de quatrieme sont l'exception. |

## 3. Etat actuel des valeurs `niveau`

Comptage observe dans `src/data/chapters/**/meta.json` :

| Valeur de `niveau` | Nombre de fichiers |
|---|---:|
| `1ere-ens-scientifique` | 13 |
| `1ere-spe` | 13 |
| `2nde` | 14 |
| `3eme` | 12 |
| `4e` | 9 |
| `5eme` | 8 |
| `6eme` | 8 |
| `terminale-ens-scientifique` | 3 |
| `terminale-spe` | 21 |

Interpretation : dans les metadonnees physique-chimie, le champ `niveau` est quasi systematiquement un identifiant technique aligne sur le dossier. La valeur `4e` est une exception locale, pas une convention generale.

## 4. Analyse des routes publiques

Les routes publiques de chapitres college sont generees depuis le chemin des fichiers :

```text
src/data/chapters/{cycle}/{niveau}/{matiere}/{chapitre}/meta.json
```

Exemple pour un chapitre de quatrieme :

```text
src/data/chapters/college/4eme/chimie/atomes-molecules/meta.json
```

Route publique derivee :

```text
/college/4eme/chimie/atomes-molecules
```

Dans `src/pages/college/[niveau]/[matiere]/[chapitre].astro`, `getStaticPaths` lit les segments de dossier :

```text
cycle = college
niv = 4eme
mat = chimie
chap = atomes-molecules
```

Le champ `meta.niveau` n'est pas utilise pour produire la route publique. Remplacer `niveau: "4e"` par `niveau: "4eme"` dans les 9 `meta.json` ne changerait donc pas les URLs publiques.

## 5. Analyse des usages applicatifs

| Usage | Source de la valeur niveau | Effet de `4e` |
|---|---|---|
| Route `/college/4eme` | `src/data/levels.ts` et dossiers | Aucun effet direct. |
| Route de chapitre `/college/4eme/...` | Dossier du chapitre | Aucun effet direct. |
| Breadcrumbs et titres de pages college | `getLevelLabel(niveau)` avec `niveau` issu de l'URL | Aucun effet direct. |
| Dashboard accueil | Niveau derive du dossier dans `src/pages/index.astro` | Aucun effet direct sur les chemins du dashboard. |
| SearchBar accueil | Recoit le niveau derive du dossier via le dashboard | Affiche deja plutot le slug technique fourni par le dashboard. |
| Mega quiz | `meta.niveau` dans `src/pages/mega-quiz.astro` | Le filtre de niveau affiche `4e` alors que les autres niveaux affichent plutot `3eme`, `5eme`, `6eme`. |
| Mega flashcards | `meta.niveau` dans `src/pages/mega-flashcards.astro` | Meme comportement que le mega quiz. |
| Script de verification | Compare `meta.niveau` au dossier | Signale 9 avertissements. |

## 6. Distinction recommandee

| Concept | Valeur recommandee | Emplacement adapte |
|---|---|---|
| Slug technique | `4eme` | Dossiers, URLs, `src/data/levels.ts`, `meta.niveau`, IDs et filtres techniques |
| Libelle long | `4eme` ou `4eme` affiche via `getLevelLabel` selon l'encodage du projet | `src/data/levels.ts` |
| Libelle court pedagogique | `4e` | SEO, textes pedagogiques, `educationalLevel`, `shortLabel` cote mathematiques, affichage explicite |

Le champ `niveau` devrait rester un identifiant de niveau, pas un libelle d'affichage. Les libelles pedagogiques existent deja ailleurs : `label`, `shortLabel`, titres SEO, descriptions et `educationalLevel`.

## 7. Decision d'audit

Decision : remplacer plus tard les 9 occurrences `niveau: "4e"` par `niveau: "4eme"` est recommande.

Cette decision est motivee par quatre constats :

1. `src/data/levels.ts` declare `4eme` comme slug de niveau college.
2. Les dossiers et URLs publiques utilisent deja `4eme`.
3. Les autres niveaux de `src/data/chapters/**/meta.json` utilisent le slug technique dans `niveau`.
4. Les usages qui lisent `meta.niveau` comme filtre gagnent en coherence si la valeur est stable et technique.

La valeur `4e` doit etre conservee dans les champs d'affichage ou SEO deja prevus pour cela, notamment :

- `seo.meta_title`
- `seo.meta_description`
- `seo.educationalLevel`
- textes pedagogiques des cours, quiz et flashcards
- eventuels labels courts dedies

## 8. Fichiers concernes par une correction future

| Fichier | Valeur actuelle | Valeur recommandee | Risque route |
|---|---|---|---|
| `src/data/chapters/college/4eme/chimie/atomes-molecules/meta.json` | `4e` | `4eme` | Faible |
| `src/data/chapters/college/4eme/chimie/echelles-microscopiques/meta.json` | `4e` | `4eme` | Faible |
| `src/data/chapters/college/4eme/chimie/reactifs-produits-conservation/meta.json` | `4e` | `4eme` | Faible |
| `src/data/chapters/college/4eme/chimie/solubilite/meta.json` | `4e` | `4eme` | Faible |
| `src/data/chapters/college/4eme/physique/interactions-forces-aimants/meta.json` | `4e` | `4eme` | Faible |
| `src/data/chapters/college/4eme/physique/mouvement-vitesse/meta.json` | `4e` | `4eme` | Faible |
| `src/data/chapters/college/4eme/physique/ondes-signaux/meta.json` | `4e` | `4eme` | Faible |
| `src/data/chapters/college/4eme/physique/puissance-electrique/meta.json` | `4e` | `4eme` | Faible |
| `src/data/chapters/college/4eme/physique/puissance-transferts-energie/meta.json` | `4e` | `4eme` | Faible |

## 9. Risques et precautions

| Point | Analyse | Precaution |
|---|---|---|
| Routes publiques | Les routes utilisent les dossiers, donc la correction de `meta.niveau` ne devrait pas changer les URLs. | Relancer `node scripts/verify-routes-and-content.mjs` apres correction. |
| SEO | Les canonicals pointent deja vers `/college/4eme/...`. | Ne pas modifier les champs SEO lors de cette correction. |
| Affichage pedagogique | `4e` est plus lisible que `4eme`. | Conserver `4e` dans les champs de texte et les libelles dedies. |
| Mega quiz / flashcards | Les filtres utilisent `meta.niveau`; ils afficheront `4eme` apres correction. | Accepter cette coherence technique ou prevoir plus tard un mapping d'affichage via `getLevelLabel`. |
| Script de verification | Le script a raison de signaler l'ecart si `niveau` est considere comme slug. | Ne pas assouplir le script sans decision plus large. |

## 10. Sequence recommandee

| Ordre | Action future | Risque | Validation |
|---|---|---|---|
| 1 | Modifier uniquement les 9 champs `niveau` de `4e` vers `4eme` | Faible | Script de verification a 0 erreur et 0 avertissement lie au niveau |
| 2 | Ne pas toucher aux `seo.*`, cours, exercices, quiz, flashcards | Faible | Diff limite aux 9 `meta.json` |
| 3 | Relancer `node scripts/verify-routes-and-content.mjs` | Faible | 0 erreur |
| 4 | Relancer `npm.cmd run build` | Faible | Build Astro OK, nombre de pages stable |
| 5 | Eventuellement auditer l'affichage des filtres mega quiz / flashcards | Moyen | Decider si les filtres doivent afficher un label lisible plutot que le slug |

## 11. Conclusion

`4eme` doit etre considere comme la valeur canonique technique pour le champ `niveau`.

`4e` doit rester un libelle pedagogique ou SEO, mais ne devrait pas rester dans `meta.niveau` si ce champ continue a servir de reference structurelle.

Aucune modification de contenu, de route, de composant, de style, de script ou de `meta.json` n'a ete effectuee pendant cet audit.
