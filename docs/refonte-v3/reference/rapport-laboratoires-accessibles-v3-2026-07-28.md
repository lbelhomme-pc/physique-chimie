# Rapport prompt 19 - Laboratoires accessibles V3

Date d'execution : 2026-07-28

## Perimetre traite

Prompt execute : `docs/refonte-v3/prompts/19-laboratoires-accessibles.md`.

Sources relues avant intervention :

- `docs/refonte-v3/README.md`
- `docs/refonte-v3/00-resume-executif.md`
- `docs/refonte-v3/prompts/19-laboratoires-accessibles.md`
- `src/data/laboratoire/`
- `src/components/laboratoire/`
- `src/scripts/laboratoire/`
- `docs/audit-simulations-laboratoire-2026-05-28.md`
- `docs/audit-animations-laboratoire-2026-05-26.md`

Le travail est reste limite a l'architecture laboratoire, au resume HTML accessible et aux tests. Les 25 simulations n'ont pas ete refondues individuellement.

## Pattern livre

- Ajout d'un contrat `LabAccessibilityGuide` dans `src/data/laboratoire/accessibilityGuides.ts`.
- Ajout d'une fiche commune dans `LabAppLayout.astro` : hypothese, mesures a relever, conclusion attendue et questions de verification.
- Pilotes specifiques : `circuit-rc` et `diffusion-temperature`.
- Generalisation : toutes les routes laboratoire recoivent une fiche accessible via `getLabAccessibilityGuide(slug)`.
- Complement du renderer generique : tableau textuel des parametres, valeurs initiales et comparaisons, plus une grille hypothese / mesure / conclusion.

## Comparaison avant / apres

Avant :

- Le layout laboratoire exposait surtout l'objectif et deleguait l'exploitation a chaque simulation.
- Les simulations generiques pouvaient laisser le canvas comme support central, meme avec quelques metriques textuelles.

Apres :

- Chaque route laboratoire affiche un support HTML lisible avant la simulation.
- Le canvas n'est plus le seul porteur d'information : les hypotheses, mesures, questions et tableaux donnent une exploitation non visuelle.
- Les deux pilotes ont des consignes scientifiques adaptees a leur modele.

## Fichiers modifies ou ajoutes

- `src/data/laboratoire/accessibilityGuides.ts`
- `src/components/laboratoire/LabAppLayout.astro`
- `src/components/laboratoire/GenericLabSimulator.astro`
- `src/styles/laboratoire/global-lab.css`
- `src/pages/laboratoire/circuit-rc.astro`
- `src/pages/laboratoire/diffusion-temperature.astro`
- `src/pages/laboratoire/gaz-parfaits.astro`
- `src/pages/laboratoire/lois-kepler.astro`
- `src/pages/laboratoire/[slug].astro`
- `tests/laboratoire-accessibilite-v3.test.mjs`
- `docs/refonte-v3/reference/rapport-laboratoires-accessibles-v3-2026-07-28.md`
- `docs/refonte-v3/README.md`

## Validation

- `npm.cmd test` : OK, 157 tests passes, dont 4 tests `laboratoire-accessibilite-v3`.
- `npm.cmd run check` : OK, 0 erreur ; 22 indications existantes hors prompt.
- `npm.cmd run build` : OK, 314 pages construites, dont les 25 routes laboratoire.

## Risques restants

- Les scripts lourds de laboratoire, surtout `generic-lab-simulator.js`, restent a decouper dans le prompt performance dedie.
- Les guides non specifiques utilisent un fallback commun ; une passe pedagogique ulterieure peut enrichir progressivement les 23 autres laboratoires.
- Certains fichiers historiques labo affichent deja des caracteres mal encodes dans le depot ; ce prompt n'a pas traite cette correction globale pour rester dans son perimetre.

## Notes obligatoires

1. Architecture et maintenabilite : 9/10
   Preuves : contrat dedie `LabAccessibilityGuide`, fonction `getLabAccessibilityGuide`, layout commun et renderer generique enrichi sans dupliquer les 25 simulations.

2. UX, UI et coherence du design : 9/10
   Preuves : bloc commun "Exploitation accessible", cartes hypothese/mesures/conclusion, tableau generique et styles responsives dans `global-lab.css`.

3. Qualite pedagogique et scientifique : 9/10
   Preuves : pilotes RC et diffusion avec hypothese, mesures, conclusion et questions adaptees ; modeles scientifiques existants toujours testes.

4. Accessibilite et DYS : 9/10
   Preuves : alternatives HTML non visuelles, listes structurees, tableau avec caption et scopes, details/questions clavier natifs.

5. Qualite technique globale : 9/10
   Preuves : `npm.cmd run check` OK, `npm.cmd test` OK, `npm.cmd run build` OK ; pas de nouveau script client lourd.

6. Completude, migration et validation : 9/10
   Preuves : routes labo conservees, `legacyPath` conserve, 25 routes reconstruites, tests de non-regression sur les pages labo.
