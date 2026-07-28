# Rapport - Composants de base V3

Date : 2026-07-27

Prompt execute : `docs/refonte-v3/prompts/09-design-system-composants-base.md`

## Objectif

Creer des composants de base V3 en isolation, sans remplacement global des pages actives.

## Fichiers lus

- `docs/refonte-v3/prompts/09-design-system-composants-base.md`
- `docs/refonte-v3/05-charte-graphique-v3.md`
- `docs/refonte-v3/06-design-system-v3.md`
- `docs/refonte-v3/reference/table-tokens-v3.md`
- `src/components/ui/`
- `src/components/pedagogie/ChapterPageShell.astro`
- `src/components/pedagogie/ChapterTabs.astro`

## Composants crees

| Composant | Role | Etats couverts |
| --- | --- | --- |
| `V3Button.astro` | Bouton et lien-bouton | primaire, secondaire, discret, danger, disabled, focus |
| `V3Badge.astro` | Badge/tag/statut | neutre, succes, vigilance, danger, premium, disciplines |
| `V3Card.astro` | Carte simple | statique, lien, hover, focus, accents de discipline |
| `V3Field.astro` | Champ de formulaire | input, search, select, aide, erreur, requis, disabled |
| `V3Tabs.astro` | Onglets accessibles | selection, clavier, badge, disabled |
| `V3TabPanel.astro` | Panneau d'onglet | role `tabpanel`, liaison ARIA |
| `V3PedagogyBlock.astro` | Bloc pedagogique | notion, definition, methode, loi, exemple, vigilance |
| `V3State.astro` | Etats de page | vide, chargement, erreur, hors ligne, succes |
| `V3ComponentShowcase.astro` | Exemple compile | rendu compose des composants ci-dessus |

## Contraintes respectees

- Composants isoles dans `src/components/design-system/`.
- Aucun remplacement massif des pages actives.
- Aucune nouvelle dependance.
- Utilisation des tokens V3 du prompt 8.
- Rayon par defaut `--v3-radius-md`, soit 8 px.
- Focus visible via `--v3-shadow-focus`.
- Labels visibles pour les champs.
- Tabs avec roles ARIA et navigation clavier.
- Blocs pedagogiques explicites pour definition, methode, loi, exemple et vigilance.
- Pas de carte imbriquee dans le prototype.

## Prototype

Prototype HTML : `docs/refonte-v3/prototypes/design-system-composants-base-v3.html`

Il montre :

- boutons ;
- badges ;
- cartes ;
- tabs ;
- champs ;
- blocs pedagogiques ;
- etat vide.

## Validations executees

- `npm.cmd test -- --test-reporter=spec tests/design-system-components-v3.test.mjs` : OK, 112 tests passes.
- `npm.cmd run check` : OK, 0 erreur, 23 indications deja presentes sur l'existant.
- `npm.cmd run lint` : OK, 0 erreur, 23 avertissements deja presents sur l'existant.
- `npm.cmd run build` : OK, 314 pages construites.
- Revue visuelle rapide du prototype avec Edge en mode headless :
  - desktop 1366 x 920 : pas de debordement horizontal, cartes et sections alignees ;
  - mobile 390 x 844 : composants replies en une colonne, boutons pleine largeur, champs lisibles ;
  - `letter-spacing` rendu par defaut : `normal`, correspondant a la cible V3 `0`.

## Points restants

- Les composants ne sont pas encore branches aux pages publiques. C'est volontaire pour respecter le perimetre du prompt.
- Une integration pilote pourra etre faite plus tard sur une page non critique ou un chapitre de test.
