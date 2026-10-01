# Nettoyage UI V5 — 1 octobre 2026

Branche : `ux-ui-v5-rebuild-2026-10-01`. Base vérifiée : `75eb7cf`.

Le système V5 possède désormais la cascade de toutes les pages publiques actives. `BaseLayout` importe un seul point d'entrée applicatif, `src/ui-v5/index.css`, en plus de KaTeX. Les modules spécialisés vivent dans `src/ui-v5/` et consomment les tokens communs. Aucun import CSS depuis `src/styles/` ne subsiste dans les composants ou les routes.

## Changements réalisés

- Suppression des anciennes feuilles structurelles : design-system, components, utilities, landing-v3, learning-workspace, home-coherence, reference-v3, theme, core et tokens-v3. La feuille Mathématiques sans consommateur a également été supprimée. Les sept feuilles des simulations ont été déplacées dans V5.
- `CourseReader` devient un conteneur sémantique avec un slot. Sa largeur, ses titres et ses blocs sont définis par V5 ; il ne contient plus de CSS local. `RawHtml` conserve sa normalisation et sa sanitization ; les cartes imbriquées et les ornements historiques ont été supprimés.
- Environ 500 attributs de style structurel React ont été remplacés par des classes communes. Les variables CSS inline restantes représentent des valeurs calculées : largeur de progression, état pédagogique, couleur scientifique ou position de la règle de lecture. `MathText` conserve son API de style facultative pour ses consommateurs.
- Exercices, quiz, flashcards, mémorisation, profil et outils scientifiques utilisent les mêmes surfaces, actions, bordures et rayons. Les feuilles intégrées aux composants React ont été extraites. Les styles des outils Python, des méthodes Maths et de Léane sont des modules V5 chargés par leurs routes.
- Suppression de 127 sélecteurs inutilisés lors de l'inventaire initial, de 196 règles inutilisées du laboratoire et de règles redondantes de titres et blocs pédagogiques. Les couleurs, coordonnées, échelles et géométries nécessaires aux graphiques et appareils scientifiques restent conservées.
- Les simulations RC, titrage pH, gaz parfaits, Kepler, diffusion et décroissance radioactive consomment les tokens communs pour leurs panneaux et contrôles. Les cartes peuvent rétrécir autour de graphiques et tableaux à défilement local.
- Préférences DYS conservées : anciennes clés locales, classes, thèmes, police, taille, largeur de lecture et réduction du mouvement. La lecture standard reste à 70ch ; les préférences étroites la remplacent. Les limites communes restent à 1280/1120 px.
- Correction de l'hydratation des progressions locales dans les exercices, flashcards et profils. Le panneau DYS s'ouvre au premier clic, sans dépendre d'un clic synthétique exécuté avant le rendu React. Sa feuille V5 est chargée à l'ouverture via un asset CSS, sans augmenter le CSS initial des autres pages.
- Correction du header en thème sombre, des contrôles de recherche et fermeture trop petits, et de cinq débordements mobiles découverts dans les simulations et l'activité affine.
- Mise à jour corrective de dépendances transitives dans les plages déjà déclarées : audit npm passé de quatre vulnérabilités high à zéro. Aucune dépendance applicative supplémentaire.

Les noms historiques de classes, attributs de données et variables utilisés par les contenus et les progressions restent des contrats de compatibilité. Ils ne constituent plus une cascade V3 chargée en parallèle. Les composants prototypes V3 inactifs ne sont pas remis dans les routes publiques. Les modules CSS de Dashboard et ResumeLearning, actuellement sans route consommatrice, restent disponibles dans V5 ; toute réutilisation doit importer leur module depuis la route Astro.

## Validation

| Contrôle | Résultat |
| --- | --- |
| Astro check | 297 fichiers ; 0 erreur, 0 avertissement, 0 hint |
| ESLint, max-warnings=0 | Réussi |
| Tests Node/tsx | 383/383 réussis ; aucun test ignoré |
| Build statique | 333 pages générées |
| Routes et contenus | 64 526 contrôles ; 0 erreur, 0 avertissement |
| Corpus conservé | 101 chapitres PC + 104 Maths ; 6 352 IDs canoniques |
| Audits Maths V3/LaTeX | Réussis ; 104 cours.tex déclarés, 0 orphelin |
| Sécurité npm | 0 vulnérabilité |
| Audit dist rapide | 28 055 contrôles sur 333 pages ; 0 erreur, 0 avertissement |
| Audit axe du dist | 0 violation sur les six routes représentatives configurées |
| Matrice navigateur V5 | 463 contrôles ; 0 échec, 0 erreur JavaScript |
| CSS de tous les assets du dist | 282 504 octets ; budgets existants respectés |

Les 28 échecs de tests présents à la base provenaient de contrats de source encore liés à V3. Ces assertions ont été alignées sur V5 en conservant les vérifications de routes, contenus, taxonomie et comportements. Le nouveau contrat `tests/ui-v5-cleanup.test.mjs` bloque le retour des imports legacy, des mini-systèmes CSS dans les composants React et des styles structurels inline. Les budgets de performance n'ont pas été élargis.

La matrice est exécutée sur le build local avec Chromium 153, en 1440×1100, 768×1024 et 390×844, puis en DYS sombre/Verdana/texte agrandi/lecture étroite/mouvement réduit à 360×800. Elle couvre accueil, niveaux, catalogues PC/Maths, chapitre, cours, exercices, quiz, flashcards, MathML/LaTeX, laboratoire, six simulations, outils, trois parcours Python, méthodes Maths, Léane, profil et mémorisation. Elle vérifie notamment les menus, Escape, les onglets au clavier, les filtres sans résultats, la correction d'exercice, le feedback du quiz, la révélation et l'évaluation d'une flashcard, le panneau DYS, les paramètres affines et la sélection/réinitialisation du code Python.

[Résultats détaillés](qa-ui-v5-2026-10-01/matrix.json) — 16 captures conservées dans le même dossier. Exemple : [mobile exercices](qa-ui-v5-2026-10-01/mobile-exercises.png), [tablette quiz](qa-ui-v5-2026-10-01/tablet-quiz.png), [DYS sombre Python](qa-ui-v5-2026-10-01/dys360-python.png).

## Reproduction

Commandes de qualité habituelles : `npm run check`, `npm run lint`, `npm test`, `npm run verify:content`, `npm run audit:security`, `npm run audit:maths-v3`, `npm run build`, `npm run audit:dist:fast`, `npm run audit:dist:a11y`.

Dans l'environnement de cette exécution, le lanceur CLI tsx ne pouvait pas créer son socket IPC ; les commandes équivalentes ont été utilisées :

```bash
node --import tsx --test --test-reporter=tap 'tests/**/*.test.mjs'
node --import tsx scripts/verify-routes-and-content.mjs
NODE_OPTIONS=--max-old-space-size=4096 npm run audit:dist:fast
NODE_OPTIONS=--max-old-space-size=4096 npm run audit:dist:a11y
```

`scripts/e2e-ui-v5.mjs` utilise Playwright Core et un navigateur Chromium externes au projet, sans modifier ses dépendances. Après installation de ces outils de QA, lancer depuis la racine :

```bash
UI5_PLAYWRIGHT_MODULE=/chemin/vers/playwright-core/index.mjs \
UI5_CHROMIUM_PATH=/chemin/vers/chromium \
node scripts/e2e-ui-v5.mjs
```

Le script sert uniquement `dist/` sur localhost et produit le JSON et les captures. Il retourne un statut d'échec si un contrôle ou une erreur JavaScript apparaît.

## Évaluation des six critères du dépôt

Notes du périmètre de ce lot, avec preuves ; elles ne constituent pas une certification générale de toute la plateforme.

| Critère | Note /10 | Preuves |
| --- | ---: | --- |
| Architecture et maintenabilité | 9 | Point d'entrée unique, modules V5 par responsabilité, suppression des imports legacy, contrat AST/CSS, typage et lint réussis |
| UX/UI et cohérence | 9 | Géométrie commune 1280/1120/70ch, actions/rayons partagés, 463 contrôles navigateur et 16 captures, débordements corrigés |
| Pédagogie et science | 9 | Aucun fichier de corpus ou ID changé, 205 chapitres et 6 352 IDs conservés, audits LaTeX, MathML présent, réponses/corrections vérifiées |
| Accessibilité et DYS | 9 | Contrastes des tokens testés, axe sans violation sur l'échantillon, clavier/Escape, DYS 360 px, agrandissement effectif, contrôles 44 px, mouvement réduit |
| Qualité technique | 9 | 383 tests, build 333 pages, zéro vulnérabilité, zéro erreur JavaScript, budgets CSS/JS/HTML existants respectés |
| Complétude et migration | 9 | Contrat anti-régression, inventaire des styles retirés, simulations et Python inspectés, preuves enregistrées, routes et progressions conservées, retour arrière ci-dessous |

## Limites et retour arrière

La matrice est représentative : les 333 pages sont auditées statiquement, mais chacune n'a pas fait l'objet d'une capture ni d'un test interactif complet. Les tests navigateur concernent Chromium ; axe dans jsdom ne vérifie pas les contrastes rendus. Les contrastes des tokens sont couverts par les tests et les thèmes inspectés visuellement. L'exécution du runtime Python téléchargé depuis le CDN et Matplotlib n'a pas été validée de bout en bout dans ce lot ; ses contrats de sécurité et de chargement sont conservés et testés.

Le déploiement Vercel et la fusion dans main ne sont pas exécutés dans ce lot. Un push peut être observé par les intégrations automatiques du dépôt.

Retour arrière : appliquer `git revert` au commit de nettoyage sur cette branche, puis relancer les contrôles de qualité. La base `75eb7cf` fournit la comparaison des fichiers. Aucune migration de données locales n'a été ajoutée, donc aucun effacement ni conversion des progressions n'est nécessaire.
