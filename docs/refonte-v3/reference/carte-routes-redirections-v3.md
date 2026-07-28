# Carte routes et redirections V3

Date de reference : 2026-07-27.

Cette carte documente l'etat cible progressif des routes V3. Elle ne supprime aucune URL legacy.

## Strategie generale

- Les routes publiques restent des routes serveur/statique Astro, sans redirection client inutile.
- Les anciennes routes conservees restent accessibles tant que les redirections ne sont pas activees.
- Les redirections preparees sont testees avant activation.
- La page `404` existe, est noindex, et n'entre pas dans la carte canonique publiee.

## Routes statiques sensibles conservees

```text
/
/college
/lycee
/mathematiques
/mathematiques/college
/mathematiques/lycee
/laboratoire
/outils-methodes
/memorisation
/memorisation/revision-du-jour
/memorisation/mega-quiz
/memorisation/mega-flashcards
/profil
```

## Physique-chimie

Route legacy conservee :

```text
/<cycle>/<niveau>/<matiere>/<chapitre>
```

Route explicite V3 :

```text
/physique-chimie/<cycle>/<niveau>/<matiere>/<chapitre>
```

Etat au 2026-07-27 :

- 101 chapitres physique-chimie detectes.
- 101 routes legacy conservees.
- 101 routes explicites V3 generees.
- 101 redirections legacy vers explicite sont preparees, non activees.

Exemple :

```text
Legacy conservee : /college/4eme/chimie/atomes-molecules
Canonique V3 :     /physique-chimie/college/4eme/chimie/atomes-molecules
Redirection :      prepared 301 legacy -> canonique V3
```

## Mathematiques

Route canonique :

```text
/mathematiques/<cycle>/<niveau>/<chapitre>
```

Etat au 2026-07-27 :

- 11 chapitres mathematiques detectes.
- Tous les chapitres publies sont sous `/mathematiques/lycee/2nde/...`.
- Aucune route legacy mathematiques n'est declaree dans la strategie actuelle.

## Laboratoire

Route canonique :

```text
/laboratoire/<slug>
```

Etat au 2026-07-27 :

- 25 routes laboratoire referencees par `src/data/laboratoire/apps.ts`.
- Chaque entree garde son `legacyPath` vers l'ancien fichier de laboratoire.
- Les pages V3 ne remplacent pas brutalement les fichiers legacy.

## Memorisation

Routes canoniques :

```text
/memorisation/revision-du-jour
/memorisation/mega-quiz
/memorisation/mega-flashcards
```

Redirections actives :

```text
/mega-quiz       -> /memorisation/mega-quiz       301
/mega-flashcards -> /memorisation/mega-flashcards 301
```

## 404

Route technique :

```text
/404
```

La page est presente dans `src/pages/404.astro`, en `noindex`. Elle est generee au build, mais exclue de la strategie canonique de publication.

## Controle obligatoire

Avant toute activation de redirection :

- verifier que la cible existe dans la carte de routes ;
- verifier que la source legacy existe encore si la redirection est seulement `prepared` ;
- conserver un statut `301` uniquement pour les mouvements permanents ;
- mettre a jour ce document et les tests `route-symmetry`.

