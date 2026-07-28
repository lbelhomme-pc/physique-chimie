# Rapport - Contrat de contenu commun

## 1. Decision d'architecture

Le projet conserve la convention lisible actuelle par chapitre :

```text
meta.json
cours.mdx ou cours.fragment.html
exercices.json
quiz.json
flashcards.json
```

La cible peut utiliser `src/content/` plus tard, mais la premiere etape retenue est une couche Zod dediee dans `src/data/contentContract.ts`, avec adaptateurs temporaires dans `src/data/contentAdapters.ts`.

Compromis retenu :

| Option | Avantage | Risque | Decision |
|---|---|---|---|
| Astro Content Collections immediatement | Integration native Astro, typage fort | Deplacement ou duplication probable des 112 paquets existants | Non maintenant |
| Couche Zod dediee | Validation sans migration, messages par fichier et champ, compatibilite avec les paquets existants | Une etape de migration restera necessaire | Retenue |

## 2. Formats reels inventories

| Famille | Formats observes | Nombre |
|---|---|---:|
| Chapitres physique-chimie | `src/data/chapters/{cycle}/{niveau}/{matiere}/{chapitre}/` | 101 |
| Chapitres mathematiques | `src/data/mathematiques/chapters/{cycle}/{niveau}/{chapitre}/` | 11 |
| Exercices physique-chimie | tableau JSON racine | 101 |
| Exercices mathematiques | objet `{ "exercices": [...] }` | 11 |
| Quiz physique-chimie | tableau JSON racine | 101 |
| Quiz mathematiques | objet `{ "questions": [...] }` | 11 |
| Flashcards physique-chimie | tableau JSON racine | 101 |
| Flashcards mathematiques | objet `{ "cards": [...] }` | 11 |

Variantes de cles conservees par les adaptateurs :

| Ressource | Cles historiques reconnues |
|---|---|
| Exercices | `consigne`, `statement`, `title`, `titre`, `difficulty`, `difficulte`, `difficultyLabel`, `niveau`, `aide`, `aides`, `hints`, `correction`, `schemaSvg`, `figure` |
| Quiz | `questions`, `quiz`, `answer`, `correctAnswer`, `choices`, `explanation`, `difficulty`, `skills`, `chapterId` |
| Flashcards | `cards`, `flashcards`, `front`, `recto`, `question`, `back`, `verso`, `answer`, `category`, `tags`, `chapterId` |
| SEO PC | `seo.meta_title`, `seo.meta_description`, `seo.schema_type`, `seo.educationalLevel`, `seo.canonical` |
| SEO maths | `seo.title`, `seo.description`, `seo.canonical`, `seo.noindex` |

## 3. Contrat commun versionne

Fichier source : `src/data/contentContract.ts`.

Noyau commun cible :

| Champ | Statut | Commentaire |
|---|---|---|
| `canonicalId` | obligatoire | Genere avec `src/utils/contentIds.ts` |
| `discipline` | obligatoire | `physique-chimie`, `mathematiques`, `laboratoire` |
| `cycle` | obligatoire | `college`, `lycee` |
| `niveau` | obligatoire | Slug technique existant |
| `matiere` | obligatoire pour PC | `physique` ou `chimie` |
| `programme` | obligatoire dans le format normalise | Derive d'un champ existant : `theme`, `domain` ou `source` |
| `slug` | obligatoire | Nom du dossier |
| `title` | obligatoire | Erreur bloquante si absent |
| `description` | obligatoire | Erreur bloquante si absente |
| `objectives` | obligatoire cible | Liste vide acceptee temporairement mais signalee |
| `duration` | obligatoire cible | Accepte chaine ou nombre selon l'historique |
| `prerequisites` | obligatoire cible | Liste vide acceptee temporairement mais signalee |
| `competencies` | obligatoire cible | Liste vide acceptee temporairement mais signalee |
| `publicationStatus` | obligatoire | Adapte en `published` pour les routes publiques existantes |
| `seo` | obligatoire | Canonical obligatoire |

Champs facultatifs documentes :

| Champ | Usage |
|---|---|
| `notion` | Notion fine d'un chapitre |
| `difficulty` | Niveau de difficulte editorial |
| `duration` par ressource | Temps estime d'une activite ou d'un exercice |
| `correctionAvailable` | Presence d'une correction exploitable |
| `tags` | Recherche, filtres et indexation interne |
| `officialSource` | Source officielle de programme |
| `relatedChapters` | Liens pedagogiques entre chapitres |
| `tools` | Outils utiles au chapitre |
| `simulations` | Simulations liees |
| `order` | Tri editorial |
| `updatedAt` | Date de mise a jour |

## 4. Adaptateurs temporaires

Fichier source : `src/data/contentAdapters.ts`.

Les adaptateurs :

- acceptent les formats historiques sans deplacer les fichiers ;
- produisent un format interne normalise ;
- conservent les formats racine PC et les objets enveloppes maths ;
- enregistrent les champs adaptes dans `legacy.adaptedFields` ;
- enregistrent les champs editoriaux manquants dans `legacy.missingEditorialFields` ;
- ne transforment pas un champ manquant en metadonnees pedagogiques inventees ;
- rendent bloquant un titre, une description ou une structure invalide.

## 5. Propagation maths

Les champs suivants sont maintenant presents dans les types et le chargeur maths :

| Champ | Fichiers |
|---|---|
| `relatedChapters` | `src/data/mathematiques/types.ts`, `src/data/mathematiques/content.ts` |
| `officialSource` | `src/data/mathematiques/types.ts`, `src/data/mathematiques/content.ts` |

## 6. Validation des 112 chapitres

Resultat du controle automatique :

| Classe | Nombre | Interpretation |
|---|---:|---|
| Conformes | 0 | Aucun chapitre ne renseigne encore tout le noyau cible, notamment `objectives` |
| Adaptes automatiquement | 0 | Les adaptations existent mais les chapitres restent classes prioritairement en incomplets publiables |
| Incomplets mais publiables | 112 | Aucun blocage technique ; des champs editoriaux cible restent a completer |
| Bloquants | 0 | Aucun fichier existant ne casse le contrat normalise |

Les 112 chapitres existants restent donc publiables.

## 7. Controle automatique

Le script `scripts/verify-routes-and-content.mjs` appelle maintenant `auditContentContracts()`.

Un fichier invalide bloque le controle avec un message du type :

```text
src/data/chapters/.../meta.json :: title :: titre manquant
src/data/chapters/.../meta.json :: seo.canonical :: Required
```

Le controle actuel indique :

```text
Contrat contenu commun : 112 chapitres, 0 conformes, 0 adaptes, 112 incomplets publiables, 0 bloquant
```

## 8. Migration progressive recommandee

| Ordre | Etape | Risque |
|---:|---|---|
| 1 | Completer les champs editoriaux manquants dans quelques chapitres pilotes | Faible |
| 2 | Faire consommer les pages PC par le format normalise chapitre par chapitre | Modere |
| 3 | Harmoniser les enveloppes `exercices`, `questions`, `cards` sans changer les routes | Modere |
| 4 | Evaluer une migration partielle vers `src/content/` apres stabilisation | Eleve |

Aucun contenu n'a ete deplace dans cette passe.
