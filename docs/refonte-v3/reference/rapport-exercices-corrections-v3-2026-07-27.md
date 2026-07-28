# Rapport - Exercices et corrections V3

Date : 2026-07-27  
Prompt execute : `prompts/16-exercices-corrections.md`

## Objectif

Refondre l'experience exercices/corrections V3 sans migration massive des fichiers JSON. Les exercices actuels restent accessibles, les corrections restent masquees par defaut et les formats pilotes V3 sont acceptes.

## Fichiers crees ou modifies

- `src/components/pedagogie/ExercicesPlayer.tsx`
- `src/utils/trustedContent.ts`
- `tests/exercices-player-v3.test.mjs`
- `tests/security/trusted-content.test.mjs`
- `docs/refonte-v3/README.md`

## Cas couverts

- QCM : rendu par propositions radio via `answerType: "qcm"` ou `choices/options`.
- Numerique : rendu en champ court avec `inputMode="decimal"` pour `answerType: "number"`, `numeric`, `nombre`, `numerique`.
- Texte / expression : rendu en zone de reponse longue.
- Schema : rendu SVG nettoye, avec alternative accessible `schemaAlt`, `schemaCaption` ou `blocks[].accessibility.altText`.
- Aides progressives : prise en charge de `aide`, `aides` et `hints` avec deblocage sequentiel.
- Corrections : distinction `Correction essentielle` puis `Correction detaillee` repliee.
- Migration : formats racine `[]`, `{ exercices: [] }` et `{ exercises: [] }` conserves.

## Corrections et securite

- La correction n'est pas presente dans le rendu initial avant que l'eleve ait saisi une reponse.
- Le player ne rend pas de HTML utilisateur.
- Les SVG passent par `sanitizeTrustedSvg`.
- Le sanitizer referme maintenant correctement les formes SVG autofermantes (`rect`, `circle`, `line`, etc.) afin d'eviter que les elements suivants disparaissent dans certains parseurs.

## Captures de reference

- `docs/refonte-v3/reference/captures/exercices-v3-schema-correction-2026-07-27.png`
- `docs/refonte-v3/reference/captures/exercices-v3-numerique-mobile-2026-07-27.png`

## Mesures visuelles

| Page | Correction initiale | Correction apres reponse | Schema | Debordement horizontal |
| --- | --- | --- | --- | --- |
| `/college/5eme/physique/circuits-electriques/` | absente | visible | oui | non |
| `/mathematiques/lycee/2nde/fonctions-generalites/` mobile | absente | visible | sans schema | non |

## Validations

- `npm.cmd test` : OK, 144 tests passes.
- `npm.cmd run check` : OK, 0 erreur, 23 hints deja presents.
- `npm.cmd run build` : OK, 314 pages generees.

## Criteres AGENTS

| Critere | Score | Justification |
| --- | ---: | --- |
| Respect de l'architecture existante | 10/10 | Le player existant reste le point d'integration unique. |
| Reutilisation des conventions | 9/10 | Donnees legacy et donnees V3 pilotes acceptees sans renommer les fichiers. |
| Lisibilite pedagogique | 9/10 | Aides progressives, correction essentielle puis detaillee. |
| Accessibilite / DYS | 9/10 | Reponses explicites, alternatives de schemas et largeur mobile verifiee. |
| Securite / performance | 9/10 | Pas de HTML utilisateur, SVG nettoyes, pas de nouvelle dependance. |
| Compatibilite migration V2 -> V3 | 10/10 | Aucun exercice JSON modifie massivement, formats actuels conserves. |

## Points a surveiller

- Les QCM sont supportes par le player mais ne sont pas encore largement publies dans les fichiers d'exercices.
- La banniere de consentement peut recouvrir le bas des captures, sans bloquer l'exercice ni la correction.
