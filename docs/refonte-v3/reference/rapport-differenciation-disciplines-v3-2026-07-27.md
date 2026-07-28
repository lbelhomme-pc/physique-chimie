# Rapport prompt 12 - Différenciation des disciplines V3

Date : 2026-07-27

## Objectif

Mettre en place un système d'identité pour distinguer clairement :

- Mathématiques
- Physique-Chimie
- Enseignement scientifique

Les routes existantes sont conservées. Aucun contenu scientifique de chapitre n'a été modifié.

## Décisions d'identité

| Discipline | Symbole | Accent | Microcopy | Route d'entrée |
| --- | --- | --- | --- | --- |
| Mathématiques | ∑ | Indigo | Calculer, raisonner, modéliser | `/mathematiques` |
| Physique-Chimie | PC | Cyan | Observer, mesurer, expliquer | `/college` |
| Enseignement scientifique | ES | Ambre | Relier les sciences, le climat, le vivant et l'énergie | `/lycee/1ere-ens-scientifique` |

Le système combine toujours couleur, symbole, libellé complet et microcopy. L'information n'est donc pas portée par la couleur seule.

## Travaux réalisés

- Création d'une source unique d'identités disciplinaires dans `src/data/disciplineIdentity.ts`.
- Extension du contexte de navigation pour reconnaître `enseignement-scientifique` comme sujet distinct.
- Mise à jour du sélecteur de matière public avec trois entrées lisibles.
- Mise à jour de la navigation publique : menu Matières, contexte, niveaux ES de 1re et Terminale.
- Mise à jour des cartes d'accueil pour afficher trois portes d'entrée séparées.
- Mise à jour des pages `college`, `lycee` et `mathematiques` avec badges discipline.
- Ajout de tokens V3 dédiés aux surfaces et bordures disciplinaires.
- Ajout d'une revue automatisée accessibilité couleur dans `tests/discipline-identity-v3.test.mjs`.

## Vérification accessibilité couleur

La revue vérifie que chaque discipline possède :

- un libellé visible ;
- un symbole non-couleur ;
- une microcopy ;
- une route d'entrée ;
- des tokens accent, surface et bordure ;
- une présence dans la navigation et dans l'accueil.

## Captures de référence

- `docs/refonte-v3/reference/captures/disciplines-v3-accueil-desktop-2026-07-27.png`
- `docs/refonte-v3/reference/captures/disciplines-v3-lycee-desktop-2026-07-27.png`
- `docs/refonte-v3/reference/captures/disciplines-v3-accueil-mobile-2026-07-27.png`

Contrôle visuel : aucun débordement horizontal détecté sur accueil desktop, lycée desktop et accueil mobile.

## Commandes exécutées

- `npm.cmd test -- --test-reporter=spec tests/discipline-identity-v3.test.mjs` : 125 tests OK.
- `npm.cmd run check` : 0 erreur, 0 warning, 23 hints préexistants.
- `npm.cmd run build` : 314 pages générées.

## Évaluation AGENTS.md

| Critère | Note | Justification |
| --- | ---: | --- |
| Cohérence avec l'existant | 9/10 | Les composants existants sont réutilisés et les routes sont conservées. |
| Architecture simple | 10/10 | Une donnée centrale évite la duplication et reste en Astro/TS simple. |
| Accessibilité | 10/10 | Chaque discipline combine texte, symbole et couleur ; revue automatisée ajoutée. |
| Design responsive | 9/10 | Captures desktop/mobile vérifiées sans débordement horizontal. |
| Performance | 10/10 | Aucun framework ou paquet d'icônes ajouté ; symboles textuels légers. |
| Sécurité / migration | 10/10 | Aucun contenu scientifique ni route existante supprimé. |

## Points restants

- Les pages de chapitre ES conservent encore certains chemins historiques sous `physique-chimie/...` pour compatibilité ; le contexte V3 les identifie désormais comme Enseignement scientifique.
- Les 23 hints signalés par `astro check` sont préexistants et hors périmètre du prompt 12.
