# Rapport prompt 05 - Conventions identifiants et nommage

Date : 2026-07-27.

## Objectif

Fixer les conventions d'IDs, slugs, routes et noms de fichiers V3, tout en conservant la lecture des formats legacy.

## Fichiers analyses

- `src/utils/contentIds.ts`
- `src/data/contentRoutes.ts`
- `docs/architecture/strategie-alias-progression.md`
- `tests/content-ids.test.mjs`
- `tests/resource-schemas.test.mjs`
- `tests/content-progress-migration.test.mjs`
- `scripts/verify-routes-and-content.mjs`

## Decisions

- Les IDs internes persistants utilisent le separateur `:`.
- Les routes publiques restent en `/`.
- Les namespaces canoniques sont `physique-chimie`, `mathematiques`, `laboratoire` et `memorisation`.
- Les segments canoniques sont en ASCII minuscule, sans espace, sans slash, sans antislash, sans accent et sans donnee personnelle.
- Les IDs de ressources de chapitre utilisent des suffixes reserves : `course`, `exercise:<id>`, `quiz`, `quiz:<id>`, `flashcards`, `flashcard:<id>`.
- Les routes legacy physique-chimie restent resolues par alias, sans suppression des donnees de progression existantes.
- Les IDs locaux de quiz, exercices et flashcards restent locaux au chapitre ; l'ID global ajoute toujours le prefixe du chapitre.

## Modifications realisees

- `src/utils/contentIds.ts`
  - Ajout de `isCanonicalIdPart`.
  - Durcissement de `isCanonicalContentId` : un ID n'est plus considere canonique seulement parce que son namespace est connu.
  - Validation de la forme attendue par namespace et par suffixe de ressource.

- `tests/content-ids.test.mjs`
  - Ajout de tests de grammaire canonique.
  - Ajout de tests d'alias de progression idempotents.
  - Ajout d'un controle d'unicite globale sur les IDs publies des chapitres, cours, exercices, quiz, flashcards et laboratoires.
  - Prise en compte des deux formes JSON existantes : tableau racine et objet contenant une collection.

- `docs/refonte-v3/21-conventions-identifiants-nommage.md`
  - Documentation V3 des namespaces, exemples valides/interdits, routes, fichiers et controles obligatoires.

## Resultats

- Aucun conflit d'ID detecte.
- `verify:content` confirme `3450` IDs canoniques de ressources et `17251` controles associes.
- Les alias legacy restent lisibles et idempotents.

## Validations

```text
npm.cmd test
Resultat : 97 tests, 97 passes, 0 fail
```

```text
npm.cmd run verify:content
Resultat : 34461 checks, 0 errors, 0 warnings
Notes : 3450 IDs canoniques de ressources verifies, 17251 controles
```

```text
npm.cmd run check
Resultat : 0 errors, 23 hints
```

## Points de vigilance

- Ne pas renommer massivement les slugs existants sans plan d'alias explicite.
- Ne jamais stocker d'email, nom d'eleve, identifiant utilisateur ou trace personnelle dans un ID de contenu.
- Les futures routes `/physique-chimie/...` devront rester compatibles avec les routes legacy tant que les cles de progression anciennes existent.

