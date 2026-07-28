# Rapport prompt 22 - Accessibilite et systeme DYS V3

Date : 2026-07-28

Prompt execute : `docs/refonte-v3/prompts/22-accessibilite-dys-systeme.md`

## Sources lues

- `docs/refonte-v3/README.md`
- `docs/refonte-v3/00-resume-executif.md`
- `docs/refonte-v3/prompts/22-accessibilite-dys-systeme.md`
- `src/components/accessibility/AccessibilityPanel.tsx`
- `src/components/accessibility/ReadingGuide.tsx`
- `src/data/accessibility/a11y-engine.ts`
- `src/styles/design-system.css`
- `src/styles/tokens-v3.css`
- `src/layouts/BaseLayout.astro`

## Perimetre

Le prompt 22 refond le panneau de preferences accessibilite/DYS et le guide de lecture, sans modifier les contenus pedagogiques. Les preferences existantes sont conservees via la cle `a11y_preferences` et les classes historiques du moteur accessibilite restent compatibles.

## Livrables produits

- `src/components/accessibility/AccessibilityPanel.tsx` : panneau V3 organise en onglets, commandes clavier, switches accessibles, profils DYS et styles alignes sur les tokens V3.
- `src/components/accessibility/ReadingGuide.tsx` : guide de lecture compatible souris, focus clavier et touches de deplacement.
- `src/styles/design-system.css` : suppression des chargements de polices externes, correction des espacements par defaut et raccord aux tokens V3.
- `tests/accessibilite-dys-systeme-v3.test.mjs` : couverture dediee aux preferences, roles ARIA, clavier, guide de lecture, persistance et absence de CDN de police.
- `src/components/search/GlobalSearch.tsx` et `tests/recherche-globale-v3.test.mjs` : correction d'une violation axe detectee pendant le prompt 22, avec `role="listbox"` seulement lorsque des options existent et `role="status"` pour l'etat vide.

## Matrice DYS V3

| Axe | Decision V3 | Preuve |
| --- | --- | --- |
| Police | La preference `opendyslexic` est conservee mais mappee vers `--v3-font-family-dys`, avec pile systeme locale et sans CDN obligatoire. | `src/styles/design-system.css`, test anti `fonts.googleapis`, `cdn.jsdelivr` et `@font-face`. |
| Taille | Les tailles `normal`, `large` et `x-large` restent portees par le moteur et sont pilotees depuis le panneau. | `src/components/accessibility/AccessibilityPanel.tsx`, `src/data/accessibility/a11y-engine.ts`. |
| Interligne | Les niveaux `normal`, `large` et `x-large` sont exposés par le panneau et appliques par classes existantes. | `tests/accessibilite-dys-systeme-v3.test.mjs`. |
| Espacements | Letter spacing et word spacing sont reglables ; le mode normal repasse a `0` pour eviter les compressions visuelles. | `src/styles/design-system.css`. |
| Contraste et themes | Les themes clair, gris, gris clair, sombre, sepia, bleu clair et automatique restent disponibles avec styles de panneau raccordes aux tokens V3. | `AccessibilityPanel.tsx`, `a11y-engine.ts`. |
| Mouvement | La reduction du mouvement est disponible en switch et reste compatible avec `prefers-reduced-motion`. | `AccessibilityPanel.tsx`, `a11y-engine.ts`. |
| Focus et concentration | Le mode focus est conserve, les focus visibles du panneau utilisent `--v3-shadow-focus`. | `AccessibilityPanel.tsx`, `design-system.css`. |
| Guide de lecture | Le guide suit la souris, le focus clavier et les touches fleche/PageUp/PageDown. | `ReadingGuide.tsx`, test dedie. |
| Clavier et lecteur d'ecran | Le panneau utilise bouton d'ouverture avec `aria-expanded`, onglets `role="tablist"`/`role="tab"`, switches `role="switch"`/`aria-checked`, fermeture par Echap. | `AccessibilityPanel.tsx`, test dedie. |
| Persistance | La cle historique `a11y_preferences` est conservee et aucune nouvelle source de verite permanente n'est creee. | `a11y-engine.ts`, test dedie. |

## Validation

- `npm.cmd test -- tests/recherche-globale-v3.test.mjs tests/accessibilite-dys-systeme-v3.test.mjs` : OK, 172 tests passes via le script de test global.
- `npm.cmd run check` : OK, 0 erreur, 0 avertissement, 22 indications existantes hors perimetre.
- `npm.cmd run build` : OK, 314 pages generees.
- `npm.cmd run audit:dist:a11y` : OK, 314 pages controlees, 0 erreur, 0 avertissement.

L'audit axe a d'abord revele une violation critique `aria-required-children` sur la recherche globale quand la liste etait vide. Le correctif limite le role `listbox` aux resultats non vides et utilise `status` pour les etats informatifs.

## Notes par critere

| Critere | Note | Justification |
| --- | ---: | --- |
| Architecture et maintenabilite | 9.2/10 | Le panneau reste branche au moteur existant `a11y-engine`, conserve la cle de stockage historique et evite une deuxieme source de verite. |
| UX, UI et coherence du design | 9.1/10 | Le panneau V3 est structure par profils et onglets, avec tokens V3, focus visible et commandes explicites. |
| Qualite pedagogique et scientifique | 9.0/10 | Aucun contenu disciplinaire n'est modifie ; les aides DYS renforcent l'acces aux cours, exercices, quiz et laboratoires. |
| Accessibilite et DYS | 9.4/10 | Police, taille, interligne, espacements, contraste, mouvement, focus, guide de lecture, clavier et lecteurs d'ecran sont couverts et verifies par tests et axe. |
| Qualite technique globale | 9.1/10 | Les polices externes sont supprimees, le build est valide, l'audit axe est a 0 erreur et les roles ARIA de la recherche ont ete corriges. |
| Completude, migration et validation | 9.3/10 | Tous les livrables du prompt sont produits, la migration des preferences est idempotente, les commandes obligatoires et l'audit axe ont ete executes. |
