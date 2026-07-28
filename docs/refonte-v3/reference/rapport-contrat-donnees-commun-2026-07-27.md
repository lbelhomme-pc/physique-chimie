# Rapport prompt 06 - Contrat de donnees commun V3

Date : 2026-07-27.

## Objectif

Definir et tester le contrat commun V3 sans migrer globalement les contenus existants.

## Fichiers analyses

- `src/data/contentContract.ts`
- `src/data/contentAdapters.ts`
- `src/data/contentContractAudit.ts`
- `tests/content-contract.test.mjs`
- `docs/refonte-v3/09-structures-pedagogiques-v3.md`
- `C:/Users/ludov/Downloads/structures-pedagogiques-cours-exercices-quiz-flashcards.md`
- `C:/Users/ludov/Downloads/arborescence_plateforme_educative.md`

## Modifications realisees

- `src/data/contentContract.ts`
  - Passage du contrat normalise a `CONTENT_CONTRACT_VERSION = 2`.
  - Ajout des schemas V3 : acces, competences structurees, alternatives d'accessibilite, liens, sources, blocs, lecons.
  - Ajout de regles strictes : HTML marque explicitement, alternatives obligatoires pour schemas/graphiques/simulations/formules.
  - Extension des exercices, quiz, flashcards et activites avec acces, liens, sources, competences et accessibilite.

- `src/data/contentAdapters.ts`
  - Adaptation non destructive des anciens formats vers le contrat V3.
  - Valeurs par defaut sobres pour l'acces : gratuit, preview disponible, compte non requis.
  - Normalisation des sources, liens, competences, lecons et blocs quand ils sont fournis.
  - Conservation des formats actuels : tableaux racine et objets `exercices`, `questions`, `cards`.

- `tests/content-contract.test.mjs`
  - Ajout d'une fixture V3 valide couvrant acces, lecons, blocs, liens, sources et competences.
  - Ajout d'une fixture V3 invalide verifiant le rejet du HTML non marque et des blocs visuels sans alternative accessible.
  - Verification que les 112 chapitres existants restent sans bloquant.

- `docs/refonte-v3/reference/schema-contrat-donnees-v3.md`
  - Documentation courte du schema V3 et des regles de migration.

## Resultats avant / apres

Avant prompt 06 :

```text
Contrat contenu commun : 112 chapitres, 0 conformes, 0 adaptes, 112 incomplets publiables, 0 bloquant
```

Apres prompt 06 :

```text
Contrat contenu commun : 112 chapitres, 0 conformes, 0 adaptes, 112 incomplets publiables, 0 bloquant
```

Les anciens contenus restent donc publiables. Les nouvelles exigences V3 s'appliquent aux champs structures fournis, sans forcer une migration globale.

## Validations

```text
npm.cmd test
Resultat : 99 tests, 99 passes, 0 fail
```

```text
npm.cmd run verify:content
Resultat : 34461 checks, 0 errors, 0 warnings
Notes : 112 chapitres, 0 bloquant ; 3450 IDs canoniques de ressources verifies
```

```text
npm.cmd run check
Resultat : 0 errors, 23 hints existants
```

## Dettes et points de vigilance

- Les 112 chapitres restent `incomplet-publiable` car les champs editoriaux historiques ne sont pas tous renseignes.
- Les prochaines migrations de contenus devront renseigner progressivement `lessons`, `blocks`, `sources`, `competences` et alternatives d'accessibilite.
- Les blocs `html` ne doivent etre utilises que lorsque le contenu est passe par la chaine de confiance/sanitation prevue.
- Les champs `competencies` et `competences` coexistent pendant la migration ; il faudra choisir un seul champ public quand les composants V3 seront stabilises.

