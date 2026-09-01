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

### 7. Budgets de performance représentatifs

`tests/fixtures/dist-audit.config.json` contient désormais des budgets resserrés pour :

- `/` ;
- `/mathematiques` ;
- `/physique-chimie` ;
- `/physique-chimie/college/4eme/chimie/atomes-molecules` ;
- `/outils-methodes/python-lab`.

Ces budgets ont été définis à partir d'un build C16 mesuré, avec une marge raisonnable, et restent nettement plus stricts que le budget de route générique.

## TESTS C16

`tests/hydratation-globale-c16.test.mjs` verrouille notamment :

1. l'absence des quatre imports/îlots React historiques dans `BaseLayout` ;
2. l'absence de `client:load` global ;
3. le caractère natif des petits comportements ;
4. le chargement React du panneau accessibilité uniquement au clic ;
5. l'application précoce et whitelistée des préférences ;
6. l'épinglage, la validation et le timeout Pyodide ;
7. l'absence de Pyodide dans le shell global ;
8. l'absence de réintroduction de polices distantes ;
9. la présence de budgets resserrés sur les routes représentatives C16.

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

Une mesure reproductible a construit la base C15 `393e5314e23362ee58bb1a05319f74fadaa9f4d6` puis C16 avec la même chaîne Astro, sur six routes représentatives.

| Route | Îlots C15 | Îlots C16 | Δ îlots | Total audité C15 | Total audité C16 | Δ total |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| `/` | 5 | 1 | -4 | 291 283 o | 293 678 o | +2 395 o |
| `/mathematiques` | 4 | 0 | -4 | 146 253 o | 144 030 o | -2 223 o |
| `/physique-chimie` | 4 | 0 | -4 | 145 886 o | 143 663 o | -2 223 o |
| chapitre PC 4e | 8 | 4 | -4 | 232 257 o | 234 638 o | +2 381 o |
| `/outils-methodes/python-lab` | 5 | 1 | -4 | 147 792 o | 150 186 o | +2 394 o |
| `/memorisation/mega-quiz` | 5 | 1 | -4 | 138 292 o | 140 539 o | +2 247 o |

Le résultat architectural est constant : **quatre îlots Astro hydratés de moins sur chacune des routes mesurées**. Les deux portails disciplinaires passent de quatre îlots globaux à zéro.

### Limite de la mesure JS

L'audit dist existant calcule `jsBytes` à partir des seuls `script[src]` présents dans le HTML. Les bundles chargés par les anciens `astro-island` ne sont donc pas inclus dans cette métrique. Il serait incorrect de lire le passage de `0` à `5 948` octets de `script[src]` comme une hausse comparable du JavaScript hydraté : C16 matérialise le petit shell natif comme un script classique tandis que C15 cachait le coût des quatre îlots dans le mécanisme Astro.

Le rapport C16 retient donc comme indicateur comparable principal le **nombre d'îlots hydratés**, et constate que le poids HTML + `script[src]` + CSS audité reste globalement stable, avec des variations d'environ ±2,4 ko selon la route.

### Budgets C16 et valeurs mesurées

| Route | Mesuré HTML / JS / CSS / total | Budget HTML / JS / CSS / total |
| --- | --- | --- |
| `/` | 168 048 / 5 948 / 119 682 / 293 678 o | 190 000 / 15 000 / 135 000 / 325 000 o |
| `/mathematiques` | 21 286 / 5 948 / 116 796 / 144 030 o | 30 000 / 15 000 / 130 000 / 165 000 o |
| `/physique-chimie` | 27 762 / 5 948 / 109 953 / 143 663 o | 35 000 / 15 000 / 125 000 / 165 000 o |
| chapitre PC 4e | 102 150 / 5 948 / 126 540 / 234 638 o | 120 000 / 15 000 / 140 000 / 275 000 o |
| Python Lab | 28 880 / 5 948 / 115 358 / 150 186 o | 40 000 / 15 000 / 130 000 / 180 000 o |

Les seuils sont versionnés et contrôlés par `dist-fast`.

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
- budgets représentatifs versionnés et verts ;
- `quality`, `dist-fast` et `dist-a11y` verts sur le HEAD final.

### NO-GO

- React reste hydraté globalement pour les quatre anciens outils ;
- panneau DYS inaccessible sans JavaScript déjà hydraté ;
- préférence persistante perdue ou flash majeur réintroduit ;
- Pyodide chargé hors atelier ;
- dépendance distante non maîtrisée ;
- budget dist ou accessibilité en échec.

## VALIDATION FINALE

**État : validation CI finale du présent HEAD en cours.**

Une validation intermédiaire sur `f873f5d486798844d945a1aa6fa74d3945a18698` a déjà obtenu `quality`, `dist-fast` et `dist-a11y` verts, avec 296 tests PASS avant l'ajout du test de verrouillage des budgets. La décision GO définitive exige les mêmes trois checks verts sur le HEAD final contenant les budgets, leur test et ce rapport.
