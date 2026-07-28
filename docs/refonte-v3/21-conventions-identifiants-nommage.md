# Conventions identifiants et nommage V3

Date de reference : 2026-07-27.

Cette convention fixe les regles stables pour les identifiants internes, les slugs, les routes publiques et les fichiers de contenu V3. Elle complete la strategie d'alias de progression sans imposer de renommage massif.

## Principes

- Un identifiant interne persistant utilise `:` comme separateur.
- Une URL publique utilise `/` comme separateur.
- Un slug ou segment d'ID est en ASCII minuscule, sans accent, sans espace, sans donnee personnelle.
- Un ID publie est stable : on ne le derive plus automatiquement du titre apres publication.
- Les anciennes lectures restent possibles par alias, notamment pour la progression locale.

## Segments valides

Un segment canonique respecte la forme :

```text
[a-z0-9]+ avec eventuellement des tirets ou des points internes
```

Exemples valides :

```text
4eme
1ere-spe
atomes-molecules
atom-mol-q1
titrage-ph-metrique
```

Exemples interdits :

```text
Atomes Molecules
atomes/molecules
camille.martin@example.com
chapitre:
-chapitre
chapitre-
```

## Namespaces

### Physique-chimie

Chapitre :

```text
physique-chimie:<cycle>:<niveau>:<matiere>:<chapitre>
```

Ressources :

```text
physique-chimie:<cycle>:<niveau>:<matiere>:<chapitre>:course
physique-chimie:<cycle>:<niveau>:<matiere>:<chapitre>:exercise:<exerciseId>
physique-chimie:<cycle>:<niveau>:<matiere>:<chapitre>:quiz
physique-chimie:<cycle>:<niveau>:<matiere>:<chapitre>:quiz:<questionId>
physique-chimie:<cycle>:<niveau>:<matiere>:<chapitre>:flashcards
physique-chimie:<cycle>:<niveau>:<matiere>:<chapitre>:flashcard:<flashcardId>
```

Exemple :

```text
physique-chimie:college:4eme:chimie:atomes-molecules
physique-chimie:college:4eme:chimie:atomes-molecules:quiz:atom-mol-q1
```

### Mathematiques

Chapitre :

```text
mathematiques:<cycle>:<niveau>:<chapitre>
```

Ressources :

```text
mathematiques:<cycle>:<niveau>:<chapitre>:course
mathematiques:<cycle>:<niveau>:<chapitre>:exercise:<exerciseId>
mathematiques:<cycle>:<niveau>:<chapitre>:quiz
mathematiques:<cycle>:<niveau>:<chapitre>:quiz:<questionId>
mathematiques:<cycle>:<niveau>:<chapitre>:flashcards
mathematiques:<cycle>:<niveau>:<chapitre>:flashcard:<flashcardId>
```

Exemple :

```text
mathematiques:lycee:2nde:fonctions-generalites
```

### Laboratoire

Application ou ressource :

```text
laboratoire:<slug>
laboratoire:<slug>:simulation
laboratoire:<slug>:tool
laboratoire:<slug>:simulation:<resourceId>
laboratoire:<slug>:tool:<resourceId>
```

Exemple :

```text
laboratoire:titrage-ph-metrique:simulation
```

### Memorisation

Ressource globale de memorisation :

```text
memorisation:<kind>
memorisation:<kind>:<sourceId>
```

Exemple :

```text
memorisation:quiz:revisions-4eme
```

## Routes publiques

Les routes restent lisibles et separent les segments par `/`.

Physique-chimie explicite V3 cible :

```text
/physique-chimie/<cycle>/<niveau>/<matiere>/<chapitre>
```

Route physique-chimie legacy encore lisible :

```text
/<cycle>/<niveau>/<matiere>/<chapitre>
```

Mathematiques :

```text
/mathematiques/<cycle>/<niveau>/<chapitre>
```

Laboratoire :

```text
/laboratoire/<slug>
```

Les redirections ou alias doivent etre documentes et testes avant suppression d'une ancienne route.

## Fichiers de contenu

Les dossiers de chapitres gardent les slugs publies comme nom de dossier :

```text
src/data/chapters/<cycle>/<niveau>/<matiere>/<chapitre>/
src/data/mathematiques/chapters/<cycle>/<niveau>/<chapitre>/
```

Fichiers attendus :

```text
meta.json
cours.mdx
exercices.json
quiz.json
flashcards.json
```

Les IDs locaux (`exerciseId`, `questionId`, `flashcardId`) sont uniques dans leur chapitre, mais ne sont jamais utilises seuls comme IDs globaux.

## Stockage et alias

Les cles de progression gardent leur prefixe metier puis utilisent l'ID canonique :

```text
quiz_reward_physique-chimie:college:4eme:chimie:atomes-molecules
```

Pendant la migration, les anciennes cles restent lisibles :

```text
quiz_reward_college/4eme/chimie/atomes-molecules
```

Les alias sont non destructifs : ils resolvent l'ancien format vers le nouveau, mais ne suppriment pas brutalement les donnees legacy.

## Controles obligatoires

Avant de publier une nouvelle famille de contenus :

- construire les IDs avec `src/utils/contentIds.ts` ;
- verifier que l'ID est reconnu par `isCanonicalContentId` ;
- verifier l'unicite globale des IDs de chapitres et ressources ;
- verifier que les alias legacy restent idempotents ;
- refuser les slashs, antislashs, espaces, majuscules et donnees personnelles dans les IDs persistants.

