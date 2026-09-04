# Référentiel éditorial Mathématiques V2

**Statut :** contrat de qualité de la refonte complète du corpus Mathématiques  
**Année scolaire de publication :** 2026-2027  
**Périmètre :** tous les chapitres Mathématiques publiés du collège au lycée.

## 1. Principe

Un chapitre n'est plus déclaré « complet » parce que les cinq fichiers `meta.json`, `cours.mdx`, `exercices.json`, `quiz.json` et `flashcards.json` existent.

Un chapitre V2 doit être à la fois :

- conforme au programme officiel applicable à l'année scolaire publiée ;
- mathématiquement rigoureux ;
- suffisamment développé pour constituer un vrai cours ;
- lisible sur écran ;
- riche en notations LaTeX rendues par KaTeX ;
- illustré par des graphiques, schémas, figures ou représentations pertinentes ;
- accompagné d'exercices progressifs réellement corrigés ;
- accompagné d'un quiz avec feedback ;
- accompagné de flashcards couvrant l'essentiel ;
- accessible.

## 2. Version réglementaire 2026-2027

Le champ `officialSource` et la version de programme sont obligatoires.

Règles à respecter pour les contenus actuellement publiés :

- 6e : programme de mathématiques du cycle 3 publié au BO n°16 du 17 avril 2025 ;
- 5e : nouveau programme de mathématiques du cycle 4 publié au BO n°10 du 5 mars 2026 ;
- 4e et 3e : programme antérieur encore applicable en 2026-2027 ; le programme 2026 ne doit pas être publié prématurément pour ces niveaux ;
- Seconde générale et technologique : programme publié au BO n°14 du 2 avril 2026, applicable en 2026-2027 ;
- Première — mathématiques intégrées à l'enseignement scientifique : programme publié au BO n°14 du 2 avril 2026, applicable en 2026-2027 ;
- Première spécialité mathématiques : programme publié au BO n°14 du 2 avril 2026, applicable en 2026-2027 ;
- Terminale spécialité mathématiques : programme en vigueur avant le remplacement prévu à la rentrée 2027-2028 ;
- Terminale mathématiques complémentaires : programme en vigueur avant le remplacement prévu à la rentrée 2027-2028.

Chaque chapitre V2 doit porter des `curriculumItems` qui explicitent les connaissances, capacités ou thèmes officiels réellement couverts.

## 3. Métadonnées minimales d'un chapitre V2

`meta.json` doit contenir au minimum :

- `contentQualityVersion: 2` ;
- titre, description, cycle, niveau, slug, ordre ;
- thème/domaine ;
- durée indicative ;
- prérequis ;
- au moins 4 objectifs opérationnels ;
- compétences mathématiques travaillées ;
- source officielle et version de programme ;
- au moins 3 `curriculumItems` issus du programme ou du découpage officiel ;
- date de mise à jour ;
- SEO et canonical.

Les objectifs doivent être observables : « résoudre », « démontrer », « représenter », « interpréter », « calculer », etc. Les formulations vagues du type « comprendre les fonctions » ne suffisent pas seules.

## 4. Cours MDX + LaTeX

### 4.1 Volume minimal

Seuils de certification V2 :

- collège : au moins 7 000 caractères significatifs ;
- lycée : au moins 9 000 caractères significatifs.

Ces seuils sont des garde-fous, pas des objectifs de remplissage. Un texte répétitif ou artificiellement allongé reste refusé.

### 4.2 Structure obligatoire

Chaque cours comprend au minimum :

1. Objectifs
2. Situation ou problème d'entrée
3. Notions / définitions
4. Propriétés / théorèmes / résultats
5. Méthodes
6. Au moins deux exemples entièrement développés
7. Représentations visuelles pertinentes
8. Erreurs fréquentes
9. Synthèse « À retenir »

### 4.3 Mathématiques en LaTeX — garde-fou bloquant

**Toute écriture mathématique du corpus V2 doit être écrite en LaTeX et rendue par KaTeX.**

Cette règle s'applique sans exception au :

- cours MDX ;
- énoncé des exercices ;
- consignes lorsqu'elles contiennent des mathématiques ;
- indices et aides ;
- corrections ;
- choix et explications des quiz ;
- recto et verso des flashcards ;
- tableaux du cours ;
- légendes, annotations et textes mathématiques associés aux schémas et graphiques.

Exemples conformes :

- `$4{,}7# Référentiel éditorial Mathématiques V2

**Statut :** contrat de qualité de la refonte complète du corpus Mathématiques  
**Année scolaire de publication :** 2026-2027  
**Périmètre :** tous les chapitres Mathématiques publiés du collège au lycée.

## 1. Principe

Un chapitre n'est plus déclaré « complet » parce que les cinq fichiers `meta.json`, `cours.mdx`, `exercices.json`, `quiz.json` et `flashcards.json` existent.

Un chapitre V2 doit être à la fois :

- conforme au programme officiel applicable à l'année scolaire publiée ;
- mathématiquement rigoureux ;
- suffisamment développé pour constituer un vrai cours ;
- lisible sur écran ;
- riche en notations LaTeX rendues par KaTeX ;
- illustré par des graphiques, schémas, figures ou représentations pertinentes ;
- accompagné d'exercices progressifs réellement corrigés ;
- accompagné d'un quiz avec feedback ;
- accompagné de flashcards couvrant l'essentiel ;
- accessible.

## 2. Version réglementaire 2026-2027

Le champ `officialSource` et la version de programme sont obligatoires.

Règles à respecter pour les contenus actuellement publiés :

- 6e : programme de mathématiques du cycle 3 publié au BO n°16 du 17 avril 2025 ;
- 5e : nouveau programme de mathématiques du cycle 4 publié au BO n°10 du 5 mars 2026 ;
- 4e et 3e : programme antérieur encore applicable en 2026-2027 ; le programme 2026 ne doit pas être publié prématurément pour ces niveaux ;
- Seconde générale et technologique : programme publié au BO n°14 du 2 avril 2026, applicable en 2026-2027 ;
- Première — mathématiques intégrées à l'enseignement scientifique : programme publié au BO n°14 du 2 avril 2026, applicable en 2026-2027 ;
- Première spécialité mathématiques : programme publié au BO n°14 du 2 avril 2026, applicable en 2026-2027 ;
- Terminale spécialité mathématiques : programme en vigueur avant le remplacement prévu à la rentrée 2027-2028 ;
- Terminale mathématiques complémentaires : programme en vigueur avant le remplacement prévu à la rentrée 2027-2028.

Chaque chapitre V2 doit porter des `curriculumItems` qui explicitent les connaissances, capacités ou thèmes officiels réellement couverts.

## 3. Métadonnées minimales d'un chapitre V2

`meta.json` doit contenir au minimum :

- `contentQualityVersion: 2` ;
- titre, description, cycle, niveau, slug, ordre ;
- thème/domaine ;
- durée indicative ;
- prérequis ;
- au moins 4 objectifs opérationnels ;
- compétences mathématiques travaillées ;
- source officielle et version de programme ;
- au moins 3 `curriculumItems` issus du programme ou du découpage officiel ;
- date de mise à jour ;
- SEO et canonical.

Les objectifs doivent être observables : « résoudre », « démontrer », « représenter », « interpréter », « calculer », etc. Les formulations vagues du type « comprendre les fonctions » ne suffisent pas seules.

## 4. Cours MDX + LaTeX

### 4.1 Volume minimal

Seuils de certification V2 :

- collège : au moins 7 000 caractères significatifs ;
- lycée : au moins 9 000 caractères significatifs.

Ces seuils sont des garde-fous, pas des objectifs de remplissage. Un texte répétitif ou artificiellement allongé reste refusé.

### 4.2 Structure obligatoire

Chaque cours comprend au minimum :

1. Objectifs
2. Situation ou problème d'entrée
3. Notions / définitions
4. Propriétés / théorèmes / résultats
5. Méthodes
6. Au moins deux exemples entièrement développés
7. Représentations visuelles pertinentes
8. Erreurs fréquentes
9. Synthèse « À retenir »

 et non `4,7` ;
- `$3\times5# Référentiel éditorial Mathématiques V2

**Statut :** contrat de qualité de la refonte complète du corpus Mathématiques  
**Année scolaire de publication :** 2026-2027  
**Périmètre :** tous les chapitres Mathématiques publiés du collège au lycée.

## 1. Principe

Un chapitre n'est plus déclaré « complet » parce que les cinq fichiers `meta.json`, `cours.mdx`, `exercices.json`, `quiz.json` et `flashcards.json` existent.

Un chapitre V2 doit être à la fois :

- conforme au programme officiel applicable à l'année scolaire publiée ;
- mathématiquement rigoureux ;
- suffisamment développé pour constituer un vrai cours ;
- lisible sur écran ;
- riche en notations LaTeX rendues par KaTeX ;
- illustré par des graphiques, schémas, figures ou représentations pertinentes ;
- accompagné d'exercices progressifs réellement corrigés ;
- accompagné d'un quiz avec feedback ;
- accompagné de flashcards couvrant l'essentiel ;
- accessible.

## 2. Version réglementaire 2026-2027

Le champ `officialSource` et la version de programme sont obligatoires.

Règles à respecter pour les contenus actuellement publiés :

- 6e : programme de mathématiques du cycle 3 publié au BO n°16 du 17 avril 2025 ;
- 5e : nouveau programme de mathématiques du cycle 4 publié au BO n°10 du 5 mars 2026 ;
- 4e et 3e : programme antérieur encore applicable en 2026-2027 ; le programme 2026 ne doit pas être publié prématurément pour ces niveaux ;
- Seconde générale et technologique : programme publié au BO n°14 du 2 avril 2026, applicable en 2026-2027 ;
- Première — mathématiques intégrées à l'enseignement scientifique : programme publié au BO n°14 du 2 avril 2026, applicable en 2026-2027 ;
- Première spécialité mathématiques : programme publié au BO n°14 du 2 avril 2026, applicable en 2026-2027 ;
- Terminale spécialité mathématiques : programme en vigueur avant le remplacement prévu à la rentrée 2027-2028 ;
- Terminale mathématiques complémentaires : programme en vigueur avant le remplacement prévu à la rentrée 2027-2028.

Chaque chapitre V2 doit porter des `curriculumItems` qui explicitent les connaissances, capacités ou thèmes officiels réellement couverts.

## 3. Métadonnées minimales d'un chapitre V2

`meta.json` doit contenir au minimum :

- `contentQualityVersion: 2` ;
- titre, description, cycle, niveau, slug, ordre ;
- thème/domaine ;
- durée indicative ;
- prérequis ;
- au moins 4 objectifs opérationnels ;
- compétences mathématiques travaillées ;
- source officielle et version de programme ;
- au moins 3 `curriculumItems` issus du programme ou du découpage officiel ;
- date de mise à jour ;
- SEO et canonical.

Les objectifs doivent être observables : « résoudre », « démontrer », « représenter », « interpréter », « calculer », etc. Les formulations vagues du type « comprendre les fonctions » ne suffisent pas seules.

## 4. Cours MDX + LaTeX

### 4.1 Volume minimal

Seuils de certification V2 :

- collège : au moins 7 000 caractères significatifs ;
- lycée : au moins 9 000 caractères significatifs.

Ces seuils sont des garde-fous, pas des objectifs de remplissage. Un texte répétitif ou artificiellement allongé reste refusé.

### 4.2 Structure obligatoire

Chaque cours comprend au minimum :

1. Objectifs
2. Situation ou problème d'entrée
3. Notions / définitions
4. Propriétés / théorèmes / résultats
5. Méthodes
6. Au moins deux exemples entièrement développés
7. Représentations visuelles pertinentes
8. Erreurs fréquentes
9. Synthèse « À retenir »

 et non `3×5` ;
- `$\dfrac{1}{10}# Référentiel éditorial Mathématiques V2

**Statut :** contrat de qualité de la refonte complète du corpus Mathématiques  
**Année scolaire de publication :** 2026-2027  
**Périmètre :** tous les chapitres Mathématiques publiés du collège au lycée.

## 1. Principe

Un chapitre n'est plus déclaré « complet » parce que les cinq fichiers `meta.json`, `cours.mdx`, `exercices.json`, `quiz.json` et `flashcards.json` existent.

Un chapitre V2 doit être à la fois :

- conforme au programme officiel applicable à l'année scolaire publiée ;
- mathématiquement rigoureux ;
- suffisamment développé pour constituer un vrai cours ;
- lisible sur écran ;
- riche en notations LaTeX rendues par KaTeX ;
- illustré par des graphiques, schémas, figures ou représentations pertinentes ;
- accompagné d'exercices progressifs réellement corrigés ;
- accompagné d'un quiz avec feedback ;
- accompagné de flashcards couvrant l'essentiel ;
- accessible.

## 2. Version réglementaire 2026-2027

Le champ `officialSource` et la version de programme sont obligatoires.

Règles à respecter pour les contenus actuellement publiés :

- 6e : programme de mathématiques du cycle 3 publié au BO n°16 du 17 avril 2025 ;
- 5e : nouveau programme de mathématiques du cycle 4 publié au BO n°10 du 5 mars 2026 ;
- 4e et 3e : programme antérieur encore applicable en 2026-2027 ; le programme 2026 ne doit pas être publié prématurément pour ces niveaux ;
- Seconde générale et technologique : programme publié au BO n°14 du 2 avril 2026, applicable en 2026-2027 ;
- Première — mathématiques intégrées à l'enseignement scientifique : programme publié au BO n°14 du 2 avril 2026, applicable en 2026-2027 ;
- Première spécialité mathématiques : programme publié au BO n°14 du 2 avril 2026, applicable en 2026-2027 ;
- Terminale spécialité mathématiques : programme en vigueur avant le remplacement prévu à la rentrée 2027-2028 ;
- Terminale mathématiques complémentaires : programme en vigueur avant le remplacement prévu à la rentrée 2027-2028.

Chaque chapitre V2 doit porter des `curriculumItems` qui explicitent les connaissances, capacités ou thèmes officiels réellement couverts.

## 3. Métadonnées minimales d'un chapitre V2

`meta.json` doit contenir au minimum :

- `contentQualityVersion: 2` ;
- titre, description, cycle, niveau, slug, ordre ;
- thème/domaine ;
- durée indicative ;
- prérequis ;
- au moins 4 objectifs opérationnels ;
- compétences mathématiques travaillées ;
- source officielle et version de programme ;
- au moins 3 `curriculumItems` issus du programme ou du découpage officiel ;
- date de mise à jour ;
- SEO et canonical.

Les objectifs doivent être observables : « résoudre », « démontrer », « représenter », « interpréter », « calculer », etc. Les formulations vagues du type « comprendre les fonctions » ne suffisent pas seules.

## 4. Cours MDX + LaTeX

### 4.1 Volume minimal

Seuils de certification V2 :

- collège : au moins 7 000 caractères significatifs ;
- lycée : au moins 9 000 caractères significatifs.

Ces seuils sont des garde-fous, pas des objectifs de remplissage. Un texte répétitif ou artificiellement allongé reste refusé.

### 4.2 Structure obligatoire

Chaque cours comprend au minimum :

1. Objectifs
2. Situation ou problème d'entrée
3. Notions / définitions
4. Propriétés / théorèmes / résultats
5. Méthodes
6. Au moins deux exemples entièrement développés
7. Représentations visuelles pertinentes
8. Erreurs fréquentes
9. Synthèse « À retenir »

 et non `1/10` ;
- `$25\,\%# Référentiel éditorial Mathématiques V2

**Statut :** contrat de qualité de la refonte complète du corpus Mathématiques  
**Année scolaire de publication :** 2026-2027  
**Périmètre :** tous les chapitres Mathématiques publiés du collège au lycée.

## 1. Principe

Un chapitre n'est plus déclaré « complet » parce que les cinq fichiers `meta.json`, `cours.mdx`, `exercices.json`, `quiz.json` et `flashcards.json` existent.

Un chapitre V2 doit être à la fois :

- conforme au programme officiel applicable à l'année scolaire publiée ;
- mathématiquement rigoureux ;
- suffisamment développé pour constituer un vrai cours ;
- lisible sur écran ;
- riche en notations LaTeX rendues par KaTeX ;
- illustré par des graphiques, schémas, figures ou représentations pertinentes ;
- accompagné d'exercices progressifs réellement corrigés ;
- accompagné d'un quiz avec feedback ;
- accompagné de flashcards couvrant l'essentiel ;
- accessible.

## 2. Version réglementaire 2026-2027

Le champ `officialSource` et la version de programme sont obligatoires.

Règles à respecter pour les contenus actuellement publiés :

- 6e : programme de mathématiques du cycle 3 publié au BO n°16 du 17 avril 2025 ;
- 5e : nouveau programme de mathématiques du cycle 4 publié au BO n°10 du 5 mars 2026 ;
- 4e et 3e : programme antérieur encore applicable en 2026-2027 ; le programme 2026 ne doit pas être publié prématurément pour ces niveaux ;
- Seconde générale et technologique : programme publié au BO n°14 du 2 avril 2026, applicable en 2026-2027 ;
- Première — mathématiques intégrées à l'enseignement scientifique : programme publié au BO n°14 du 2 avril 2026, applicable en 2026-2027 ;
- Première spécialité mathématiques : programme publié au BO n°14 du 2 avril 2026, applicable en 2026-2027 ;
- Terminale spécialité mathématiques : programme en vigueur avant le remplacement prévu à la rentrée 2027-2028 ;
- Terminale mathématiques complémentaires : programme en vigueur avant le remplacement prévu à la rentrée 2027-2028.

Chaque chapitre V2 doit porter des `curriculumItems` qui explicitent les connaissances, capacités ou thèmes officiels réellement couverts.

## 3. Métadonnées minimales d'un chapitre V2

`meta.json` doit contenir au minimum :

- `contentQualityVersion: 2` ;
- titre, description, cycle, niveau, slug, ordre ;
- thème/domaine ;
- durée indicative ;
- prérequis ;
- au moins 4 objectifs opérationnels ;
- compétences mathématiques travaillées ;
- source officielle et version de programme ;
- au moins 3 `curriculumItems` issus du programme ou du découpage officiel ;
- date de mise à jour ;
- SEO et canonical.

Les objectifs doivent être observables : « résoudre », « démontrer », « représenter », « interpréter », « calculer », etc. Les formulations vagues du type « comprendre les fonctions » ne suffisent pas seules.

## 4. Cours MDX + LaTeX

### 4.1 Volume minimal

Seuils de certification V2 :

- collège : au moins 7 000 caractères significatifs ;
- lycée : au moins 9 000 caractères significatifs.

Ces seuils sont des garde-fous, pas des objectifs de remplissage. Un texte répétitif ou artificiellement allongé reste refusé.

### 4.2 Structure obligatoire

Chaque cours comprend au minimum :

1. Objectifs
2. Situation ou problème d'entrée
3. Notions / définitions
4. Propriétés / théorèmes / résultats
5. Méthodes
6. Au moins deux exemples entièrement développés
7. Représentations visuelles pertinentes
8. Erreurs fréquentes
9. Synthèse « À retenir »

 et non `25 %` ;
- `$A\cap B# Référentiel éditorial Mathématiques V2

**Statut :** contrat de qualité de la refonte complète du corpus Mathématiques  
**Année scolaire de publication :** 2026-2027  
**Périmètre :** tous les chapitres Mathématiques publiés du collège au lycée.

## 1. Principe

Un chapitre n'est plus déclaré « complet » parce que les cinq fichiers `meta.json`, `cours.mdx`, `exercices.json`, `quiz.json` et `flashcards.json` existent.

Un chapitre V2 doit être à la fois :

- conforme au programme officiel applicable à l'année scolaire publiée ;
- mathématiquement rigoureux ;
- suffisamment développé pour constituer un vrai cours ;
- lisible sur écran ;
- riche en notations LaTeX rendues par KaTeX ;
- illustré par des graphiques, schémas, figures ou représentations pertinentes ;
- accompagné d'exercices progressifs réellement corrigés ;
- accompagné d'un quiz avec feedback ;
- accompagné de flashcards couvrant l'essentiel ;
- accessible.

## 2. Version réglementaire 2026-2027

Le champ `officialSource` et la version de programme sont obligatoires.

Règles à respecter pour les contenus actuellement publiés :

- 6e : programme de mathématiques du cycle 3 publié au BO n°16 du 17 avril 2025 ;
- 5e : nouveau programme de mathématiques du cycle 4 publié au BO n°10 du 5 mars 2026 ;
- 4e et 3e : programme antérieur encore applicable en 2026-2027 ; le programme 2026 ne doit pas être publié prématurément pour ces niveaux ;
- Seconde générale et technologique : programme publié au BO n°14 du 2 avril 2026, applicable en 2026-2027 ;
- Première — mathématiques intégrées à l'enseignement scientifique : programme publié au BO n°14 du 2 avril 2026, applicable en 2026-2027 ;
- Première spécialité mathématiques : programme publié au BO n°14 du 2 avril 2026, applicable en 2026-2027 ;
- Terminale spécialité mathématiques : programme en vigueur avant le remplacement prévu à la rentrée 2027-2028 ;
- Terminale mathématiques complémentaires : programme en vigueur avant le remplacement prévu à la rentrée 2027-2028.

Chaque chapitre V2 doit porter des `curriculumItems` qui explicitent les connaissances, capacités ou thèmes officiels réellement couverts.

## 3. Métadonnées minimales d'un chapitre V2

`meta.json` doit contenir au minimum :

- `contentQualityVersion: 2` ;
- titre, description, cycle, niveau, slug, ordre ;
- thème/domaine ;
- durée indicative ;
- prérequis ;
- au moins 4 objectifs opérationnels ;
- compétences mathématiques travaillées ;
- source officielle et version de programme ;
- au moins 3 `curriculumItems` issus du programme ou du découpage officiel ;
- date de mise à jour ;
- SEO et canonical.

Les objectifs doivent être observables : « résoudre », « démontrer », « représenter », « interpréter », « calculer », etc. Les formulations vagues du type « comprendre les fonctions » ne suffisent pas seules.

## 4. Cours MDX + LaTeX

### 4.1 Volume minimal

Seuils de certification V2 :

- collège : au moins 7 000 caractères significatifs ;
- lycée : au moins 9 000 caractères significatifs.

Ces seuils sont des garde-fous, pas des objectifs de remplissage. Un texte répétitif ou artificiellement allongé reste refusé.

### 4.2 Structure obligatoire

Chaque cours comprend au minimum :

1. Objectifs
2. Situation ou problème d'entrée
3. Notions / définitions
4. Propriétés / théorèmes / résultats
5. Méthodes
6. Au moins deux exemples entièrement développés
7. Représentations visuelles pertinentes
8. Erreurs fréquentes
9. Synthèse « À retenir »

 et non `A∩B` ;
- `$5{,}8<5{,}83<5{,}9# Référentiel éditorial Mathématiques V2

**Statut :** contrat de qualité de la refonte complète du corpus Mathématiques  
**Année scolaire de publication :** 2026-2027  
**Périmètre :** tous les chapitres Mathématiques publiés du collège au lycée.

## 1. Principe

Un chapitre n'est plus déclaré « complet » parce que les cinq fichiers `meta.json`, `cours.mdx`, `exercices.json`, `quiz.json` et `flashcards.json` existent.

Un chapitre V2 doit être à la fois :

- conforme au programme officiel applicable à l'année scolaire publiée ;
- mathématiquement rigoureux ;
- suffisamment développé pour constituer un vrai cours ;
- lisible sur écran ;
- riche en notations LaTeX rendues par KaTeX ;
- illustré par des graphiques, schémas, figures ou représentations pertinentes ;
- accompagné d'exercices progressifs réellement corrigés ;
- accompagné d'un quiz avec feedback ;
- accompagné de flashcards couvrant l'essentiel ;
- accessible.

## 2. Version réglementaire 2026-2027

Le champ `officialSource` et la version de programme sont obligatoires.

Règles à respecter pour les contenus actuellement publiés :

- 6e : programme de mathématiques du cycle 3 publié au BO n°16 du 17 avril 2025 ;
- 5e : nouveau programme de mathématiques du cycle 4 publié au BO n°10 du 5 mars 2026 ;
- 4e et 3e : programme antérieur encore applicable en 2026-2027 ; le programme 2026 ne doit pas être publié prématurément pour ces niveaux ;
- Seconde générale et technologique : programme publié au BO n°14 du 2 avril 2026, applicable en 2026-2027 ;
- Première — mathématiques intégrées à l'enseignement scientifique : programme publié au BO n°14 du 2 avril 2026, applicable en 2026-2027 ;
- Première spécialité mathématiques : programme publié au BO n°14 du 2 avril 2026, applicable en 2026-2027 ;
- Terminale spécialité mathématiques : programme en vigueur avant le remplacement prévu à la rentrée 2027-2028 ;
- Terminale mathématiques complémentaires : programme en vigueur avant le remplacement prévu à la rentrée 2027-2028.

Chaque chapitre V2 doit porter des `curriculumItems` qui explicitent les connaissances, capacités ou thèmes officiels réellement couverts.

## 3. Métadonnées minimales d'un chapitre V2

`meta.json` doit contenir au minimum :

- `contentQualityVersion: 2` ;
- titre, description, cycle, niveau, slug, ordre ;
- thème/domaine ;
- durée indicative ;
- prérequis ;
- au moins 4 objectifs opérationnels ;
- compétences mathématiques travaillées ;
- source officielle et version de programme ;
- au moins 3 `curriculumItems` issus du programme ou du découpage officiel ;
- date de mise à jour ;
- SEO et canonical.

Les objectifs doivent être observables : « résoudre », « démontrer », « représenter », « interpréter », « calculer », etc. Les formulations vagues du type « comprendre les fonctions » ne suffisent pas seules.

## 4. Cours MDX + LaTeX

### 4.1 Volume minimal

Seuils de certification V2 :

- collège : au moins 7 000 caractères significatifs ;
- lycée : au moins 9 000 caractères significatifs.

Ces seuils sont des garde-fous, pas des objectifs de remplissage. Un texte répétitif ou artificiellement allongé reste refusé.

### 4.2 Structure obligatoire

Chaque cours comprend au minimum :

1. Objectifs
2. Situation ou problème d'entrée
3. Notions / définitions
4. Propriétés / théorèmes / résultats
5. Méthodes
6. Au moins deux exemples entièrement développés
7. Représentations visuelles pertinentes
8. Erreurs fréquentes
9. Synthèse « À retenir »

 et non une écriture mathématique brute dans le texte.

Les expressions dans le texte utilisent `$...# Référentiel éditorial Mathématiques V2

**Statut :** contrat de qualité de la refonte complète du corpus Mathématiques  
**Année scolaire de publication :** 2026-2027  
**Périmètre :** tous les chapitres Mathématiques publiés du collège au lycée.

## 1. Principe

Un chapitre n'est plus déclaré « complet » parce que les cinq fichiers `meta.json`, `cours.mdx`, `exercices.json`, `quiz.json` et `flashcards.json` existent.

Un chapitre V2 doit être à la fois :

- conforme au programme officiel applicable à l'année scolaire publiée ;
- mathématiquement rigoureux ;
- suffisamment développé pour constituer un vrai cours ;
- lisible sur écran ;
- riche en notations LaTeX rendues par KaTeX ;
- illustré par des graphiques, schémas, figures ou représentations pertinentes ;
- accompagné d'exercices progressifs réellement corrigés ;
- accompagné d'un quiz avec feedback ;
- accompagné de flashcards couvrant l'essentiel ;
- accessible.

## 2. Version réglementaire 2026-2027

Le champ `officialSource` et la version de programme sont obligatoires.

Règles à respecter pour les contenus actuellement publiés :

- 6e : programme de mathématiques du cycle 3 publié au BO n°16 du 17 avril 2025 ;
- 5e : nouveau programme de mathématiques du cycle 4 publié au BO n°10 du 5 mars 2026 ;
- 4e et 3e : programme antérieur encore applicable en 2026-2027 ; le programme 2026 ne doit pas être publié prématurément pour ces niveaux ;
- Seconde générale et technologique : programme publié au BO n°14 du 2 avril 2026, applicable en 2026-2027 ;
- Première — mathématiques intégrées à l'enseignement scientifique : programme publié au BO n°14 du 2 avril 2026, applicable en 2026-2027 ;
- Première spécialité mathématiques : programme publié au BO n°14 du 2 avril 2026, applicable en 2026-2027 ;
- Terminale spécialité mathématiques : programme en vigueur avant le remplacement prévu à la rentrée 2027-2028 ;
- Terminale mathématiques complémentaires : programme en vigueur avant le remplacement prévu à la rentrée 2027-2028.

Chaque chapitre V2 doit porter des `curriculumItems` qui explicitent les connaissances, capacités ou thèmes officiels réellement couverts.

## 3. Métadonnées minimales d'un chapitre V2

`meta.json` doit contenir au minimum :

- `contentQualityVersion: 2` ;
- titre, description, cycle, niveau, slug, ordre ;
- thème/domaine ;
- durée indicative ;
- prérequis ;
- au moins 4 objectifs opérationnels ;
- compétences mathématiques travaillées ;
- source officielle et version de programme ;
- au moins 3 `curriculumItems` issus du programme ou du découpage officiel ;
- date de mise à jour ;
- SEO et canonical.

Les objectifs doivent être observables : « résoudre », « démontrer », « représenter », « interpréter », « calculer », etc. Les formulations vagues du type « comprendre les fonctions » ne suffisent pas seules.

## 4. Cours MDX + LaTeX

### 4.1 Volume minimal

Seuils de certification V2 :

- collège : au moins 7 000 caractères significatifs ;
- lycée : au moins 9 000 caractères significatifs.

Ces seuils sont des garde-fous, pas des objectifs de remplissage. Un texte répétitif ou artificiellement allongé reste refusé.

### 4.2 Structure obligatoire

Chaque cours comprend au minimum :

1. Objectifs
2. Situation ou problème d'entrée
3. Notions / définitions
4. Propriétés / théorèmes / résultats
5. Méthodes
6. Au moins deux exemples entièrement développés
7. Représentations visuelles pertinentes
8. Erreurs fréquentes
9. Synthèse « À retenir »

.  
Les formules importantes utilisent `$...$`.

Les nombres purement éditoriaux ou structurels (numéro de chapitre, année de BO, durée exprimée dans les métadonnées) ne sont pas concernés.

Seuil indicatif V2 :

- collège : au moins 4 blocs mathématiques significatifs ;
- lycée : au moins 6 blocs mathématiques significatifs.

Les formules doivent être expliquées : symboles, hypothèses, unités ou interprétation si nécessaire.

### 4.4 Graphiques, schémas et figures — garde-fou bloquant

**Aucun chapitre V2 ne peut être certifié sans représentations visuelles mathématiques.**

Seuil obligatoire :

- **au moins 2 visuels pédagogiques distincts par chapitre** ;
- au moins un schéma, une figure ou une représentation structurante de la notion ;
- au moins un graphique, une courbe, un repère, un diagramme, une représentation de données ou un second visuel mathématique équivalent lorsque la notion s'y prête ;
- davantage de visuels dès que plusieurs représentations sont nécessaires à la compréhension.

Pour un chapitre où un « graphique » au sens strict serait artificiel (par exemple certains chapitres d'arithmétique), il est remplacé par une représentation mathématique réellement utile : droite graduée, décomposition, schéma de calcul, tableau visuel, représentation géométrique, arbre ou diagramme.

Exemples :

- droite graduée, repère, courbe de fonction ;
- tableau de signes ou de variations ;
- figure géométrique ;
- arbre de probabilités ;
- histogramme, boîte à moustaches, nuage de points ;
- courbe de Lorenz ;
- aire sous une courbe ;
- représentation d'une suite ou d'une évolution ;
- schéma algorithmique.

Les visuels ne sont pas décoratifs. Ils doivent permettre une lecture, une comparaison, une construction ou un raisonnement.

Sont refusés comme « visuels » de certification :

- icônes décoratives ;
- illustrations génériques sans information mathématique ;
- images répétées ;
- captures d'écran qui n'apportent aucune représentation de la notion.

Chaque visuel doit être cité ou exploité dans le cours. Un chapitre ne doit pas présenter une courbe sans demander au lecteur de la lire, l'interpréter ou la relier à une propriété.

Tout SVG doit avoir `role="img"` et une alternative accessible (`aria-label`, description ou texte équivalent). Une image externe doit avoir un `alt` descriptif.

## 5. Exercices

Chaque chapitre V2 contient au minimum **12 exercices** :

- 4 exercices N1 — application directe ;
- 4 exercices N2 — raisonnement guidé ou semi-guidé ;
- 4 exercices N3 — problème, synthèse, transfert ou format évaluation.

Pour les chapitres de fin de cycle, un exercice N3 peut être explicitement de type brevet/bac.

Chaque exercice doit contenir :

- un énoncé réel et contextualisé lorsque cela apporte quelque chose ;
- les données nécessaires ;
- un niveau ;
- une ou plusieurs compétences ;
- une correction disponible ;
- une correction qui explique la méthode et pas uniquement le résultat.

Les exercices N2/N3 ne doivent pas être de simples changements de nombres d'un exercice N1.

## 6. Quiz

Chaque chapitre V2 contient au minimum **10 questions**.

Le quiz doit mélanger :

- compréhension de notion ;
- calcul ;
- lecture graphique ou interprétation lorsque pertinent ;
- choix de méthode ;
- détection d'erreur fréquente.

Chaque question possède une explication de correction. Le quiz ne doit pas être une répétition exacte des flashcards.

## 7. Flashcards

Chaque chapitre V2 contient au minimum **12 flashcards** couvrant plusieurs catégories :

- définition ;
- propriété/théorème ;
- formule ;
- méthode ;
- représentation ;
- erreur fréquente ;
- vocabulaire ou interprétation.

Une flashcard doit rester courte et révisable. Elle ne remplace pas le cours.

## 8. Validation éditoriale

La certification V2 vérifie automatiquement :

- présence et version du programme ;
- taille minimale du cours ;
- nombre de sections ;
- présence de LaTeX et absence d'écritures mathématiques brutes dans les ressources V2 ;
- présence d'au moins **2 visuels mathématiques pédagogiques distincts et accessibles** ;
- présence d'exemples, d'une méthode, d'erreurs fréquentes et d'une synthèse ;
- au moins 12 exercices et corrections ;
- répartition N1/N2/N3 ;
- au moins 10 questions de quiz avec explications ;
- au moins 12 flashcards ;
- unicité des identifiants.

Une validation automatique ne remplace pas la relecture mathématique. Elle empêche seulement de certifier à nouveau un contenu manifestement trop pauvre.

## 9. Règle de migration

La refonte se fait chapitre par chapitre.

Un chapitre ne reçoit `contentQualityVersion: 2` qu'après réécriture complète de ses cinq ressources. Il reste V1 tant que l'un des éléments est incomplet.

Le corpus complet est certifié uniquement lorsque **tous les chapitres Mathématiques publiés** sont V2 et passent le contrôle éditorial.
