# C25 — Mathématiques 4e / 3e versionnées

**Mise à jour :** 7 septembre 2026  
**Branche :** `refonte-maths-v2-corpus-complet`  
**Déploiement Vercel après finalisation 4e :** non exécuté.

## Règle réglementaire

Le nouveau programme de mathématiques du cycle 4 publié au BO n° 10 du 5 mars 2026 s'applique progressivement :

- 5e : 2026-2027 ;
- 4e : 2027-2028 ;
- 3e : 2028-2029.

En 2026-2027, les contenus publics de 4e et de 3e restent donc rattachés au programme publié au BO n° 31 du 30 juillet 2020 et aux repères/attendus Éduscol encore applicables.

## Architecture réglementaire

Quatre mappings restent versionnés :

- `cycle4-4e-2020.mapping.json` : courant en 2026-2027 ;
- `cycle4-3e-2020.mapping.json` : courant en 2026-2027 ;
- `cycle4-4e-2026.future.mapping.json` : futur, aucune route active en 2026-2027 ;
- `cycle4-3e-2026.future.mapping.json` : futur, aucune route active en 2026-2027.

Le registre de versions reste la source de vérité pour les fenêtres d'application.

# 4e — couverture annuelle V3 complète

La 4e n'est plus un premier lot. Elle comprend **13 chapitres** :

1. Nombres rationnels et calcul
2. Puissances et notation scientifique
3. Arithmétique et nombres premiers
4. Calcul littéral et équations
5. Statistiques et médiane
6. Probabilités et simulation
7. Proportionnalité et quatrième proportionnelle
8. Dépendance entre grandeurs : tableaux et graphiques
9. Grandeurs, espace et volumes
10. Pythagore et racine carrée
11. Triangles, Thalès et cosinus
12. Translation, agrandissement et réduction
13. Algorithmique : conditions et variables

## Contrat V3 4e

Chaque chapitre doit posséder :

- un `meta.json` avec `contentQualityVersion: 3` ;
- un `cours.tex` comme source de vérité ;
- au moins **7 000 caractères** de cours ;
- au moins **2 visuels pédagogiques** exploités dans le cours ;
- **12 exercices** exactement :
  - 4 N1 ;
  - 4 N2 ;
  - 4 N3 ;
- au moins **4 problèmes N2/N3 développés** par chapitre ;
- des corrections dont la longueur minimale augmente avec le niveau ;
- **10 QCM minimum**, chacun avec explication ;
- **12 flashcards minimum**.

Totaux 4e :

- **13 cours LaTeX V3** ;
- **156 exercices** ;
- **130 questions de quiz** ;
- **156 flashcards** ;
- au moins **26 visuels pédagogiques**.

## Garde-fou « vrais exercices »

Le nombre d'exercices ne suffit pas.

L'audit `scripts/audit-maths-v3-4e-latex.mjs` contrôle notamment :

- la répartition 4/4/4 ;
- une longueur minimale des énoncés selon N1/N2/N3 ;
- une longueur minimale des corrections selon N1/N2/N3 ;
- au moins quatre exercices N2/N3 réellement développés par chapitre ;
- les identifiants uniques ;
- les explications des QCM ;
- les 12 flashcards.

Les anciens exercices télégraphiques de la 4e ont été renforcés plutôt que de réduire les seuils.

# 3e — état actuel

La 3e reste pour l'instant au premier lot historique :

1. Arithmétique, fractions et puissances
2. Calcul littéral, équations et inéquations
3. Fonctions linéaires et affines
4. Thalès et trigonométrie

Les quatre cours disposent désormais d'une source `cours.tex` à la suite de la migration LaTeX globale, mais leur refonte pédagogique V3 complète reste à effectuer.

Ressources actuelles 3e :

- 4 chapitres ;
- 24 exercices ;
- 20 questions de quiz ;
- 24 flashcards.

# Contrat LaTeX global

Les routes de mathématiques collège et lycée utilisent `cours.tex` comme source de cours affichée.

Le contrat de contenu central accepte désormais explicitement :

```text
courseFormat: "latex"
```

L'absence de `cours.tex` pour un chapitre déclaré est bloquante.

# Tests et audits

Contrôles concernés :

- `tests/c25-mathematiques-4e-3e.test.mjs` ;
- `tests/mathematics-v2-quality.test.mjs` ;
- `scripts/audit-maths-v3-4e-latex.mjs` ;
- `scripts/audit-maths-latex-all.mjs`.

La commande `npm run audit:maths-v3` exécute maintenant les audits 6e, 5e, 4e puis l'audit LaTeX global.

## État de certification

### 4e

Le contenu statique satisfait le contrat éditorial V3 prévu :

- 13/13 chapitres structurés ;
- 13/13 cours en LaTeX ;
- 2 visuels minimum par cours ;
- 12 exercices 4/4/4 par chapitre ;
- 10 QCM par chapitre ;
- 12 flashcards par chapitre ;
- mapping annuel complet.

La certification CI réelle reste distincte du contrôle statique : elle nécessite l'exécution effective de `ci:quality` et du build dans un environnement disposant des dépendances.

### 3e

Non certifiée V3 complète. C'est la prochaine refonte de niveau après validation finale de la 4e.
