# Strategie d'alias et retrait futur de progression

## Format canonique

Les URL publiques restent lisibles avec des slashs. Les identifiants internes persistants utilisent des deux-points :

```text
physique-chimie:college:4eme:chimie:atomes-molecules
physique-chimie:college:4eme:chimie:atomes-molecules:quiz:q1
physique-chimie:college:4eme:chimie:atomes-molecules:flashcard:f1
mathematiques:lycee:2nde:fonctions-generalites
laboratoire:titrage-ph-metrique:simulation
```

Un slug local comme `q1`, `f1` ou `mouvements` ne doit jamais servir seul de cle globale.

## Migration douce

La migration `content_progress_migration_v1` :

- conserve les anciennes cles localStorage ;
- ecrit les nouvelles cles canoniques ;
- fusionne les entrees de progression avec les meilleurs scores et ratios connus ;
- fusionne les cartes SRS avec les meilleures dates et repetitions ;
- journalise les donnees corrompues sans stocker leur contenu dans le rapport ;
- peut etre relancee sans dupliquer les donnees.

## Periode de transition

Pendant la transition, les moteurs acceptent encore les anciens IDs physique-chimie du type :

```text
college/4eme/chimie/atomes-molecules
lycee/2nde/physique/mouvements
```

Ils sont resolus vers les IDs canoniques par `src/utils/contentIds.ts`.

## Retrait futur des alias

Avant de retirer les alias legacy :

1. verifier que la migration est presente depuis plusieurs versions deployees ;
2. garder une mesure anonyme du nombre de migrations encore executees ;
3. s'assurer que les nouvelles cles canoniques existent pour la progression, les quiz, les exercices et le SRS ;
4. retirer d'abord les ecritures legacy, puis plus tard les lectures legacy ;
5. ne jamais supprimer automatiquement tout le localStorage utilisateur.

Le retrait des alias doit faire l'objet d'une passe separee avec tests de non-regression.
