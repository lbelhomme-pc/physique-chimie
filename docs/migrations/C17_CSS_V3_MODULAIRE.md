# C17 — CSS V3 modulaire et contrastes

## CONTEXTE / COMMIT DE DÉPART

- Dépôt : `lbelhomme-pc/physique-chimie`
- Branche : `audit-2026-c01-route-snapshot`
- Base C17 : `61e393730651f91cc0eb30cc6b038eaa22953738` (`C16: close final GO status`)
- Objectif du plan : découper le CSS V3 monolithique et valider les contrastes finaux sans modifier les contenus pédagogiques, les routes ou les comportements applicatifs.

## OBJECTIF UNIQUE

Transformer `src/styles/design-system.css`, qui concentrait encore environ 69,2 kB de règles, en un point d'entrée modulaire explicite tout en préservant l'ordre de cascade historique et en corrigeant les couples de couleurs texte/fond qui ne garantissaient pas WCAG AA.

## ÉTAT INITIAL

Avant C17 :

- `design-system.css` pesait environ 69,2 kB ;
- `core.css`, `components.css` et `theme.css` existaient mais étaient vides ;
- thèmes, reset, navigation, composants, contenu de cours, utilitaires et couche Reference UI V3 cohabitaient dans le même fichier ;
- plusieurs couleurs de texte secondaire ou sémantique avaient un contraste insuffisant selon le thème.

## PÉRIMÈTRE DE FICHIERS

C17 modifie uniquement la couche styles et ses tests de contrat :

- `src/styles/design-system.css` ;
- `src/styles/theme.css` ;
- `src/styles/core.css` ;
- `src/styles/components.css` ;
- `src/styles/course-content.css` ;
- `src/styles/utilities.css` ;
- `src/styles/reference-v3.css` ;
- `tests/css-modular-c17.test.mjs` ;
- adaptations ciblées de tests historiques qui lisaient directement le monolithe CSS.

Aucun contenu de chapitre, aucune route, aucun identifiant canonique, aucune clé de progression, aucun composant pédagogique et aucune logique d'hydratation n'est migré par C17.

## MODIFICATIONS APPLIQUÉES

### 1. `design-system.css` devient un point d'entrée

Le fichier principal contient désormais uniquement les imports dans cet ordre :

1. `tokens-v3.css` ;
2. `theme.css` ;
3. `core.css` ;
4. `components.css` ;
5. `course-content.css` ;
6. `utilities.css` ;
7. `reference-v3.css`.

Cet ordre reproduit l'ordre du monolithe C16.

### 2. Découpage par responsabilité

| Module | Responsabilité | Taille après C17 |
| --- | --- | ---: |
| `theme.css` | variables de thème et accessibilité | ~9,6 kB |
| `core.css` | reset, corps, primitives globales | ~1,1 kB |
| `components.css` | navigation, cartes, onglets et composants communs | ~16,5 kB |
| `course-content.css` | contenu MDX, formules et blocs pédagogiques | ~23,7 kB |
| `utilities.css` | animations, utilitaires et outils transversaux | ~4,4 kB |
| `reference-v3.css` | couche Reference UI V3 | ~13,4 kB |

`design-system.css` lui-même ne pèse plus qu'environ 370 octets.

Aucun module métier issu du découpage ne dépasse 35 kB.

### 3. Préservation déterministe de la cascade

La migration a été construite avec un contrôle de reconstruction : la concaténation des six modules devait reproduire exactement la portion correspondante du monolithe, dans le même ordre, après application des seules corrections de couleurs C17.

Ainsi, C17 ne réordonne pas arbitrairement les sélecteurs et ne change pas leur spécificité. Les différences visuelles intentionnelles sont limitées aux couleurs corrigées pour le contraste.

### 4. Contrastes WCAG AA

Les couleurs suivantes ont notamment été renforcées :

- texte `muted` des thèmes clair, gris clair, gris, sépia et bleu clair ;
- accents succès, danger et violet du thème de base ;
- accent principal du thème gris ;
- couleur du rang via un token `--accent-rank` adapté aux thèmes sombres ;
- titre de `.box-regle-or` via le token danger.

Les tests calculent la luminance relative et imposent un ratio d'au moins **4,5:1** pour les rôles de texte normaux contrôlés.

Ils couvrent les six thèmes : clair, gris clair, gris, sombre, sépia et bleu clair.

### 5. Tests historiques adaptés à la modularité

Trois fichiers de tests historiques supposaient que toutes les règles se trouvaient physiquement dans `design-system.css`.

Ils ont été adaptés pour lire le point d'entrée et ses modules sans diminuer leurs exigences :

- profils DYS et absence de CDN de police ;
- MathML accessible et masquage visuel non destructif ;
- classification des titres pédagogiques ;
- chargement des tokens avant les déclarations actives de thème.

## TESTS C17

`tests/css-modular-c17.test.mjs` verrouille :

1. l'ordre exact des imports du point d'entrée ;
2. l'absence de règles actives dans `design-system.css` ;
3. la présence de modules non vides et non monolithiques ;
4. la conservation de sélecteurs représentatifs legacy et V3 ;
5. le contraste WCAG AA des textes primaire, secondaire et atténué sur les six thèmes ;
6. le contraste des accents sémantiques sur leurs surfaces ;
7. le contraste du rang ;
8. des couples de couleurs structurants de Reference UI V3 ;
9. l'absence des anciennes couleurs connues comme insuffisantes dans les rôles concernés.

Les six tests C17 passent avec la suite complète.

## ÉTAT À PRÉSERVER / INTERDICTIONS RESPECTÉES

C17 n'a pas :

- modifié les routes publiques ou canoniques ;
- modifié les contenus de cours, exercices, quiz ou flashcards ;
- modifié les identifiants de progression ou le `localStorage` ;
- réintroduit de police distante ;
- modifié Pyodide ;
- annulé l'optimisation d'hydratation C16 ;
- commencé la migration de contenus mathématiques C18 ;
- laissé de workflow temporaire ou de permission CI en écriture dans l'état final.

La CI finale reste le workflow autoritatif C02 avec `contents: read` et les trois jobs `quality`, `dist-fast`, `dist-a11y`.

## RÉGRESSION VISUELLE

Le critère C17 est interprété strictement comme : **aucune régression involontaire de cascade ou de structure visuelle**.

Le découpage conserve l'ordre exact des règles ; les tests existants de charte, responsive, DYS, composants, lecteurs pédagogiques et parcours visuels restent exécutés par `quality`. Les builds `dist-fast` et `dist-a11y` valident en complément le HTML généré, les budgets et l'échantillon d'accessibilité.

Une identité pixel-par-pixel avec C16 n'est volontairement pas exigée pour les couleurs corrigées : leur modification est précisément l'objectif accessibilité de C17. En dehors de ces corrections de contraste, le découpage n'introduit pas de changement de règle ou d'ordre de cascade.

## RETOUR ARRIÈRE

Retour arrière global : revenir à `61e393730651f91cc0eb30cc6b038eaa22953738`.

Un retour arrière partiel qui remettrait le monolithe tout en conservant les modules importés est interdit : les règles seraient chargées en double et la cascade deviendrait incorrecte.

## CRITÈRES GO / NO-GO

### GO

- `design-system.css` n'est plus monolithique ;
- responsabilités CSS séparées et ordre de cascade préservé ;
- modules de taille raisonnable ;
- contrastes contrôlés à au moins 4,5:1 pour les rôles testés ;
- anciens contrats DYS/MathML/tokens toujours actifs ;
- aucune régression de routes, contenu, progression ou hydratation ;
- CI autoritative restaurée en lecture seule ;
- `quality`, `dist-fast` et `dist-a11y` verts sur le HEAD C17.

### NO-GO

- perte ou duplication de règles lors du découpage ;
- ordre de cascade modifié involontairement ;
- contraste inférieur au seuil dans un rôle testé ;
- ancien test métier affaibli ou supprimé au lieu d'être adapté ;
- régression dist, accessibilité, route ou contenu ;
- workflow temporaire ou permission d'écriture laissés dans la CI finale.

## VALIDATION

Le HEAD fonctionnel `aa60769b33419c3aae61b41421eb9208d94bcb4b` a obtenu :

- `quality` : **SUCCESS** ;
- `dist-fast` : **SUCCESS** ;
- `dist-a11y` : **SUCCESS**.

Le script de migration one-shot a ensuite été retiré du dépôt : il garantissait le découpage initial, mais n'était volontairement pas conçu pour être relancé sur un CSS déjà modulaire.

**Décision provisoire : GO fonctionnel.**

La décision devient **GO définitif** lorsque le présent rapport, la suppression du script one-shot et la CI autoritative sont eux-mêmes validés par les trois checks sur le HEAD final C17.
