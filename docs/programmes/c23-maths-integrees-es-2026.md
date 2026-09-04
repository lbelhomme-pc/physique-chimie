# C23 — Mathématiques intégrées à l’enseignement scientifique en Première

**Date :** 4 septembre 2026  
**Base C22 :** `4f7c814ea952b5f86f0857d7d25d219664b9796b`  
**Branche :** `c23-maths-integrees-es-2026`  
**Déploiement Vercel :** non exécuté.

## Référence officielle

- Bulletin officiel n° 14 du 2 avril 2026
- NOR : MENE2602916A
- Application : rentrée scolaire 2026-2027
- Version curriculaire : `mathematiques-integrees-es-premiere-2026`

## Couverture

Le programme est décomposé en cinq chapitres éditoriaux :

1. Information chiffrée et statistiques bivariées
2. Probabilités conditionnelles et indépendance
3. Variation linéaire : suites arithmétiques et fonctions affines
4. Modélisation quadratique
5. Variation exponentielle : suites géométriques et fonctions exponentielles

Les automatismes restent transversaux et sont entretenus dans les cinq chapitres ; ils ne forment pas un chapitre autonome.

## Ressources créées

Chaque chapitre contient :
- un cours MDX ;
- 6 exercices : 2 N1, 2 N2 et 2 N3 ;
- 5 questions de quiz avec explication ;
- 6 flashcards.

**Total C23 :**
- 5 chapitres ;
- 30 exercices ;
- 25 questions de quiz ;
- 30 flashcards.

## Routes publiques ajoutées

- `/mathematiques/lycee/1ere-ens-scientifique`
- `/mathematiques/lycee/1ere-ens-scientifique/information-chiffree-statistiques-bivariees`
- `/mathematiques/lycee/1ere-ens-scientifique/probabilites-conditionnelles-independance`
- `/mathematiques/lycee/1ere-ens-scientifique/variation-lineaire-suites-affines`
- `/mathematiques/lycee/1ere-ens-scientifique/modelisation-quadratique`
- `/mathematiques/lycee/1ere-ens-scientifique/variation-exponentielle`

## Garde-fous

- programme 2026 applicable explicitement à partir de 2026-2027 ;
- aucun changement de route historique ;
- aucun changement de stockage de progression ;
- aucun identifiant existant modifié ;
- aucune figure statique complexe ajoutée avant C31 ;
- aucun déploiement Vercel.

## Validation automatisée

Tests spécifiques : `tests/c23-maths-integrees-es.test.mjs`.

Contrôles GitHub Actions attendus sur la branche :
- `quality`
- `dist-fast`
- `dist-a11y`

Le statut final est certifié dans un commit de clôture après réussite des trois jobs.
