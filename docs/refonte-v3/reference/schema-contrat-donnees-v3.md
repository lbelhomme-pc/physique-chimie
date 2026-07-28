# Schema de contrat donnees V3

Date de reference : 2026-07-27.

Le contrat commun est implemente dans `src/data/contentContract.ts` avec `CONTENT_CONTRACT_VERSION = 2`.

## Chapitre

Champs principaux normalises :

- `contractVersion`
- `canonicalId`
- `discipline`
- `cycle`
- `niveau`
- `matiere`
- `programme`
- `slug`
- `title`
- `description`
- `objectives`
- `access`
- `lessons`
- `blocks`
- `links`
- `sources`
- `duration`
- `prerequisites`
- `competencies`
- `competences`
- `publicationStatus`
- `seo`
- `officialSource`
- `relatedChapters`
- `tools`
- `simulations`
- `legacy`

## Acces

```text
access.tier = free | premium | teacher | draft
access.preview = boolean
access.requiresAccount = boolean
access.premiumReason = string optionnel
```

Par defaut, un contenu adapte depuis la V2 est `free`, visible en preview et sans compte requis.

## Lecons et blocs

Une lecon contient :

- `id`
- `title`
- `summary`
- `order`
- `duration`
- `objectives`
- `blocks`
- `links`

Types de blocs autorises :

```text
text, definition, property, law, formula, method, example, warning,
diagram, graph, simulation, table, html
```

Regles de securite et d'accessibilite :

- un bloc `html` doit avoir `htmlTrusted: true` ;
- un bloc `diagram`, `graph` ou `simulation` doit fournir `accessibility.altText` ou `accessibility.longDescription` ;
- un bloc `formula` doit fournir `accessibility.formulaText` ou `accessibility.altText`.

## Liens et sources

Les liens normalises utilisent :

```text
id, label, href, kind
```

`href` est une route interne commencant par `/` ou une URL valide.

Les sources normalisees utilisent :

```text
id, label, kind, url, citation, retrievedAt
```

`kind` accepte `official`, `textbook`, `dataset`, `media`, `internal`, `other`.

## Competences

Deux champs coexistent pendant la migration :

- `competencies` : tableau legacy de libelles ;
- `competences` : tableau V3 structure avec `id`, `label`, `domain`, `level`, `description`.

Les adaptateurs transforment les libelles legacy en objets `competences` sans casser les formats existants.

## Ressources

Exercices, questions de quiz et flashcards acceptent maintenant :

- `access`
- `blocks`
- `links`
- `sources`
- `competences`
- `accessibility`

Les anciennes formes JSON restent acceptees :

- tableau racine ;
- objet racine avec `exercices`, `questions` ou `cards` ;
- alias legacy `exercises`, `quiz`, `flashcards`.

