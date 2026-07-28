# Rapport prompt 04 - Inventaire code mort et documentation

Date : 2026-07-27

## Perimetre

Inventaire documentaire uniquement. Aucun fichier actif n'a ete supprime. Les categories ci-dessous indiquent un niveau de confiance, pas une consigne de suppression immediate.

## Methodes de preuve

- Lecture du prompt `04-inventaire-code-mort-doc.md`.
- Recherche des scripts appeles depuis `package.json`.
- Recherche des imports CSS, composants et utilitaires dans `src/`, `scripts/`, `tests/`, `docs/` et `.github/`.
- Inventaire des rapports racine, documents `docs/`, styles, scripts et fonctions DYS/accessibilite.
- Validation executee : `npm.cmd run lint` et `npm.cmd run build`.

## Actif confirme

| Zone | Preuves | Decision |
|---|---|---|
| `src/pages/` | 48 fichiers de pages, build statique 314 pages lors du prompt 03 | Conserver |
| `src/data/chapters/` | 101 chapitres PC, verifies par `verify:content` | Conserver |
| `src/data/mathematiques/` | 11 chapitres mathematiques, routes et tests dedies | Conserver |
| `src/layouts/BaseLayout.astro` | importe `design-system.css`, KaTeX, accessibilite, recherche, analytics consent | Conserver |
| `src/styles/design-system.css` | importe globalement par `BaseLayout.astro` | Conserver, cible de decoupage V3 |
| `src/styles/laboratoire/*.css` | importes par simulateurs dedies ou index laboratoire | Conserver |
| `src/styles/mathematiques/mathematics.css` | importe par les pages mathematiques | Conserver |
| `scripts/verify-routes-and-content.mjs` | appele par `verify:content` et `ci:quality` | Conserver |
| `scripts/audit-dist.mjs` | appele par `audit:dist`, `audit:dist:fast`, `audit:dist:a11y` | Conserver |
| `.github/workflows/ci.yml` | chaine CI segmentee prompt 03 | Conserver |

## Legacy utile

| Zone | Preuves | Decision |
|---|---|---|
| `scripts/generate-math-seconde.mjs` | reference dans `docs/mathematiques-seconde-rapport.md`, outil reproductible de generation | Garder jusqu'a stabilisation maths |
| `scripts/validate-math-seconde.mjs` | reference avec le generateur maths seconde | Garder jusqu'a prompt migration maths |
| Rapports racine `RAPPORT_*` | references croisees entre rapports, trace decisions V2 | Garder en lecture jusqu'a consolidation docs |
| `ANALYSE_ARCHITECTURE_SITE.md`, `AUDIT_ORGANISATION_ARBORESCENCE.md` | documents d'audit fondateurs | Garder, puis deplacer en archives si confirme |
| `docs/audit-*` et `docs/references-programmes-*` | audits programmes et laboratoire | Garder comme sources migration |
| `docs/Avancement/` et resumes session | historique utile mais non operationnel | Garder en archive documentaire |

## Obsolete probable, sans suppression

| Zone | Preuves | Risque | Decision |
|---|---|---|---|
| `src/styles/core.css` | fichier vide, aucune importation directe trouvee | faible | Archiver/supprimer plus tard si confirme |
| `src/styles/components.css` | fichier vide, reference uniquement dans arborescence V3 | faible | Archiver/supprimer plus tard si confirme |
| `src/styles/theme.css` | fichier vide, aucune importation directe trouvee | faible | Archiver/supprimer plus tard si confirme |
| `src/components/pedagogie/ChapterBadges.astro` | aucun import/referencement trouve | moyen | Verifier avant suppression |
| `src/components/pedagogie/ChapterProgressCard.astro` | aucun import/referencement trouve | moyen | Verifier avant suppression |
| `src/components/pedagogie/ChapterStatusCard.astro` | aucun import/referencement trouve | moyen | Verifier avant suppression |
| `src/components/pedagogie/RankDisplay.astro` | aucun import/referencement trouve | moyen | Verifier avant suppression |
| `src/components/pedagogie/FlashcardsBlock.astro` | aucun import/referencement trouve, warnings check existants | moyen | Probable ancien lecteur, verifier compat legacy |
| `src/components/pedagogie/QuizBlock.astro` | aucun import/referencement trouve, warnings check existants | moyen | Probable ancien lecteur, verifier compat legacy |
| `src/components/mathematiques/MathFigure.astro` | aucun import/referencement trouve | faible a moyen | Verifier si prevu pour contenus MDX futurs |
| `scripts/serve-dist.mjs` | aucun appel trouve dans `package.json` ou docs | faible | Ajouter script npm ou archiver plus tard |

## A verifier

| Zone | Preuves | Question |
|---|---|---|
| `cours-python.pdf` et `python_cours.pdf` | fichiers lourds racine, pas de reference directe relevee | garder en asset public, deplacer, ou archiver ? |
| `arbo.txt` et `fichier.txt` | gros exports racine, references anciennes dans docs | utiles comme trace, mais emplacement racine bruyant |
| logs `.codex-*`, `dev-server.*`, `dev-maths-seconde.*` | journaux locaux | a exclure/archiver hors repo si non versionnes |
| `terminales-verification-report.*` | rapport ponctuel racine | deplacer vers `docs/archives/` si encore utile |
| `docs/GAMIFICATION_SYSTEME_COMPLET*.txt` | doublon probable | verifier lequel est source canonique |
| Composants interactifs `CalibrationSimulator`, `ColorimetricTitrationSimulator`, `RedoxBuilder`, `RelationChooser` | exports presents, references directes non trouvees hors definitions | verifier s'ils doivent rejoindre laboratoire/outils ou etre archives |
| `src/components/ui/SearchBar.tsx` | composant exporte, pas d'import direct trouve | verifier s'il est remplace par `GlobalSearch` |

## Styles

Actifs confirmes :

- `src/styles/design-system.css`
- `src/styles/laboratoire/global-lab.css`
- `src/styles/laboratoire/circuit-rc.css`
- `src/styles/laboratoire/diffusion-temperature.css`
- `src/styles/laboratoire/ideal-gas.css`
- `src/styles/laboratoire/kepler-laws.css`
- `src/styles/laboratoire/radioactive-decay.css`
- `src/styles/laboratoire/titration-ph.css`
- `src/styles/mathematiques/mathematics.css`

Morts probables :

- `src/styles/core.css` : 0 octet.
- `src/styles/components.css` : 0 octet.
- `src/styles/theme.css` : 0 octet.

## DYS et accessibilite

Actifs confirmes :

- `src/components/accessibility/AccessibilityPanel.tsx`, importe dans `BaseLayout.astro`.
- `src/components/accessibility/ReadingGuide.tsx`, importe dans `BaseLayout.astro`.
- `src/data/accessibility/a11y-engine.ts`, utilise par le panneau et la regle de lecture.
- `src/components/pedagogie/TextToSpeech.tsx`, utilise par cours, quiz, flashcards et exercices.
- Classes DYS et chargement OpenDyslexic dans `src/styles/design-system.css`.

Risque connu :

- OpenDyslexic est charge depuis CDN. Le prompt 04 ne corrige pas ce point ; il doit rester rattache aux prompts accessibilite/performance.

## Securite et performance

- Les usages `set:html`/`dangerouslySetInnerHTML` restent concentres dans `RawHtml.astro`, `MathText.tsx`, `ExercicesPlayer.tsx` et le JSON-LD du layout. Les protections du prompt 02 couvrent les fragments HTML/SVG de confiance et KaTeX.
- Des `innerHTML` subsistent dans certains simulateurs laboratoire. Ils sont surtout utilises pour des libelles controles par le code, mais doivent rester dans la liste de revue securite finale.
- `generic-lab-simulator.js` reste la plus grosse source laboratoire connue et une cible de decoupage performance V3.

## Dependances

Actives par preuve locale :

- Astro, React, MDX, sitemap : `astro.config.mjs` et pages.
- KaTeX, remark-math, rehype-katex : rendu mathematique.
- Zod : `src/data/contentContract.ts`.
- axe-core et jsdom : `scripts/audit-dist.mjs`.
- ESLint, TypeScript ESLint, plugins React/Astro : `eslint.config.js`.
- tsx : tests et scripts de verification.
- cross-env : scripts `check` et `build`.

Audit npm reseau : non execute dans ce prompt, car la tentative du prompt 03 a ete bloquee par certificat puis par revue de securite.

## Actions futures recommandees

1. Creer un dossier `docs/archives/` et y deplacer les rapports historiques apres validation utilisateur.
2. Ajouter un script npm optionnel pour `scripts/serve-dist.mjs` ou archiver le fichier.
3. Confirmer les composants Astro non references avant suppression.
4. Remplacer ou archiver les styles vides apres verification de la future arborescence V3.
5. Revoir les `innerHTML` laboratoire dans le prompt securite finale.
6. Heberger localement OpenDyslexic ou definir une strategie police sans dependance externe.

## Validation executee

- `npm.cmd run lint` : OK, 0 erreur, 23 warnings existants.
- `npm.cmd run build` : OK, 314 pages generees en 153,87 s.

Le prompt n'a introduit aucun changement fonctionnel : seules des notes d'inventaire ont ete ajoutees.

## Evaluation selon les six criteres

| Critere | Score | Justification |
|---|---:|---|
| Architecture et maintenabilite | 9.2/10 | inventaire classe par preuve et perimetre |
| UX/UI et coherence visuelle | 9.1/10 | aucun changement visuel, styles actifs/morts identifies |
| Pedagogie et science | 9.3/10 | aucun contenu declare inutile sans relecture |
| Accessibilite et DYS | 9.3/10 | fonctions DYS actives identifiees et protegees |
| Qualite technique globale | 9.2/10 | scripts, dependances et usages HTML dangereux inventories |
| Completude, migration et validation | 9.1/10 | aucune suppression, categories justifiees, actions futures listees |
