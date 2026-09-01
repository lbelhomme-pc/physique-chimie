# C16 — Hydratation globale et ressources externes

## CONTEXTE / COMMIT DE DÉPART

- Dépôt : `lbelhomme-pc/physique-chimie`
- Branche : `audit-2026-c01-route-snapshot`
- Base C16 : `393e5314e23362ee58bb1a05319f74fadaa9f4d6` (`C15: finalize multi-subject GO report`)
- Objectif du plan : réduire le JavaScript initial et les îlots React globaux sans régression d'accessibilité ni chargement prématuré de Pyodide.

## OBJECTIF UNIQUE

Réduire l'hydratation globale imposée à toutes les pages par `BaseLayout.astro`, en conservant les comportements utiles, la persistance des préférences DYS et la sécurité fonctionnelle de l'atelier Python.

## ÉTAT INITIAL

Avant C16, chaque page utilisant `BaseLayout.astro` embarquait quatre composants React avec `client:load` :

- `DailyLoginTracker` ;
- `AccessibilityPanel` ;
- `ReadingGuide` ;
- `ScrollToTop`.

Cette architecture imposait une hydratation React immédiate à des pages qui peuvent être majoritairement statiques.

Les feuilles V3 ne chargeaient déjà plus de police distante : C16 conserve ce bon état et n'ajoute aucun fichier de police.

Pyodide était déjà limité à l'atelier Python et créé via Worker à la demande ; C16 conserve ce comportement plutôt que de déplacer son poids vers le shell global.

## MODIFICATIONS APPLIQUÉES

### 1. Shell global sans hydratation React immédiate

`BaseLayout.astro` n'importe plus les quatre composants React globaux et ne contient plus de directive `client:load` pour ces outils.

Il utilise désormais :

- `A11yHeadBootstrap.astro` dans le `<head>` ;
- `GlobalClientTools.astro` dans le shell de page.

### 2. Comportements simples déplacés en Astro / JS natif

`GlobalClientTools.astro` remplace l'hydratation React de :

- retour en haut ;
- règle de lecture ;
- connexion quotidienne et toasts XP associés.

Le retour en haut respecte `prefers-reduced-motion` et la préférence DYS persistante.

La règle de lecture reste pilotable par les préférences `a11y_preferences`, à la souris, au focus et au clavier.

La connexion quotidienne continue d'utiliser le moteur de gamification existant et ne modifie aucune règle XP.

### 3. Panneau d'accessibilité React chargé uniquement à l'interaction

`AccessibilityPanel.tsx` reste en React car son état et ses contrôles sont suffisamment riches pour justifier ce composant.

En revanche, React, `react-dom/client` et `AccessibilityPanel.tsx` sont importés dynamiquement uniquement après activation du bouton `Aa` natif et accessible.

Si le chunk ne peut pas être chargé, le bouton reste utilisable pour réessayer et expose un libellé d'erreur compréhensible.

### 4. Préférences DYS avant peinture

`A11yHeadBootstrap.astro` lit `a11y_preferences` avant le rendu du corps et applique uniquement des valeurs appartenant à des listes blanches : thème, police, taille, interlignage, espacements, largeur de ligne, curseur et options booléennes.

Cela évite d'attendre l'hydratation React pour réappliquer un thème ou une préférence persistante.

Le mode mouvement réduit respecte également `prefers-reduced-motion`.

### 5. Pyodide centralisé et durci sans chargement global

`src/config/pyodide.ts` centralise désormais :

- version `314.0.2` ;
- origine CDN autorisée ;
- URL de base et module ;
- timeout de chargement de 20 s ;
- validation stricte HTTPS/origine/version/chemin.

`pyodide-worker.ts` consomme cette configuration, protège le téléchargement et l'initialisation par timeout, remet la promesse à zéro après échec pour permettre une nouvelle tentative et fournit un message réseau en français.

Pyodide n'est importé ni par `BaseLayout` ni par le shell global.

### 6. Ressources externes

C16 vérifie explicitement que les styles globaux ne réintroduisent pas :

- Google Fonts ;
- GStatic Fonts ;
- `@font-face` distant ;
- import de police via jsDelivr.

Aucun fichier de police tiers n'est ajouté au dépôt.

## TESTS C16

`tests/hydratation-globale-c16.test.mjs` verrouille notamment :

1. l'absence des quatre imports/îlots React historiques dans `BaseLayout` ;
2. l'absence de `client:load` global ;
3. le caractère natif des petits comportements ;
4. le chargement React du panneau accessibilité uniquement au clic ;
5. l'application précoce et whitelistée des préférences ;
6. l'épinglage, la validation et le timeout Pyodide ;
7. l'absence de Pyodide dans le shell global ;
8. l'absence de réintroduction de polices distantes.

## ÉTAT À PRÉSERVER / INTERDICTIONS RESPECTÉES

C16 n'a pas :

- supprimé les outils d'accessibilité ;
- supprimé le panneau DYS ;
- modifié les clés de préférences d'accessibilité ;
- modifié les règles de gamification ou XP ;
- transformé les lecteurs pédagogiques complexes en JS natif ;
- chargé Pyodide sur les pages hors atelier ;
- ajouté de police tierce au dépôt ;
- entrepris la modularisation CSS de C17.

## MESURE AVANT / APRÈS

### Avant

- 4 îlots React globaux `client:load` dans `BaseLayout`.
- panneau d'accessibilité React chargé/hydraté dès l'ouverture de chaque page.

### Après, contrat source

- 0 îlot React global `client:load` dans `BaseLayout` ;
- 3 comportements simples natifs ;
- panneau React conservé mais importé après interaction explicite ;
- Pyodide toujours absent du shell global.

Les métriques de build et budgets dist seront consignés après la CI de validation du présent état.

## RETOUR ARRIÈRE

Retour arrière global : revenir à `393e5314e23362ee58bb1a05319f74fadaa9f4d6`.

Ne pas rétablir seulement les anciens composants `client:load` en conservant simultanément `GlobalClientTools.astro`, car les événements de connexion quotidienne, règle de lecture et retour en haut seraient alors doublés.

## CRITÈRES GO / NO-GO

### GO

- hydratation React globale effectivement réduite ;
- panneau accessibilité toujours accessible et chargé à la demande ;
- préférences DYS réappliquées avant peinture ;
- Pyodide uniquement chargé depuis l'atelier et après demande ;
- erreur/timeout Pyodide gérés ;
- ressources externes maîtrisées ;
- budgets dist verts ;
- `quality`, `dist-fast` et `dist-a11y` verts sur le HEAD de validation.

### NO-GO

- React reste hydraté globalement pour les quatre anciens outils ;
- panneau DYS inaccessible sans JavaScript déjà hydraté ;
- préférence persistante perdue ou flash majeur réintroduit ;
- Pyodide chargé hors atelier ;
- dépendance distante non maîtrisée ;
- budget dist ou accessibilité en échec.

## VALIDATION FINALE

**État : validation CI et mesure dist en cours.**
