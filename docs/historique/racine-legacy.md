# Inventaire des artefacts historiques encore à la racine

Ce document empêche de confondre des rapports anciens avec la documentation technique courante. La présence d’un fichier dans cette liste signifie **historique / à reclasser**, pas « source de vérité actuelle ».

## Principe

La racine doit tendre vers :

- fichiers de configuration nécessaires au projet ;
- `README.md`, `AGENTS.md`, `CLAUDE.md` ;
- répertoires applicatifs (`src/`, `public/`, `scripts/`, `tests/`, `docs/`, `BO/`) ;
- fichiers de gestion de dépendances et de déploiement.

Les rapports, audits, exports, inventaires ponctuels et supports pédagogiques isolés doivent être rangés sous `docs/`, `BO/` ou un répertoire de ressources dédié.

## Rapports et audits historiques à reclasser

| Fichier racine | Statut | Destination cible |
| --- | --- | --- |
| `ANALYSE_ARCHITECTURE_SITE.md` | audit historique | `docs/historique/audits/` |
| `AUDIT_ORGANISATION_ARBORESCENCE.md` | audit historique | `docs/historique/audits/` |
| `INVENTAIRE_CHEMINS_CANONIQUES.md` | inventaire de migration | `docs/historique/migrations/` |
| `RAPPORT_ALIAS_PROGRESSIONS_PHYSIQUE_CHIMIE.md` | rapport de migration | `docs/historique/migrations/` |
| `RAPPORT_BRANCHEMENT_ALIAS_APPLICATIF.md` | rapport de migration | `docs/historique/migrations/` |
| `RAPPORT_CHAINE_QUALITE_NPM.md` | rapport qualité ancien, état npm périmable | `docs/historique/qualite/` |
| `RAPPORT_CONTRAT_CONTENU_COMMUN.md` | rapport de migration | `docs/historique/migrations/` |
| `RAPPORT_CONVENTION_4E_4EME.md` | rapport de convention | `docs/historique/migrations/` |
| `RAPPORT_IDENTIFIANTS_PROGRESSIONS.md` | rapport de migration | `docs/historique/migrations/` |
| `RAPPORT_INTEGRATION_CONTENT_IDS.md` | rapport de migration | `docs/historique/migrations/` |
| `RAPPORT_MIGRATION_IDS_PROGRESSION.md` | rapport de migration | `docs/historique/migrations/` |
| `RAPPORT_ROUTES_TEMPLATES_MIGRATION.md` | rapport de migration | `docs/historique/migrations/` |
| `RAPPORT_SECURISATION_ROUTES_CONTENUS.md` | rapport de migration/sécurité | `docs/historique/migrations/` |
| `terminales-verification-report.md` | rapport de vérification ponctuel | `docs/historique/verification/` |
| `terminales-verification-report.json` | sortie machine ponctuelle | `docs/historique/verification/` |

## Notes, prompts et exports historiques

| Fichier racine | Statut | Destination cible |
| --- | --- | --- |
| `PROMPTS_CLAUDE_CODE.md` | prompts historiques | `docs/historique/prompts/` |
| `RESUME_COMPLET_PROJET_CLAUDE_CODE.txt` | résumé historique | `docs/historique/sessions/` |
| `recommandations_priorites_seconde.txt` | recommandations éditoriales historiques | `docs/historique/editorial/` |
| `arbo.txt` | export d’arborescence volumineux | `docs/historique/inventaires/` ou suppression après comparaison |
| `fichier.txt` | export non autoritatif à identifier avant déplacement/suppression | `docs/historique/inventaires/` |

## Ressources pédagogiques isolées à reclasser

| Fichier racine | Statut | Destination cible |
| --- | --- | --- |
| `cours-python.pdf` | ressource pédagogique isolée | répertoire de ressources pédagogiques à définir |
| `python_cours.pdf` | ressource pédagogique isolée | répertoire de ressources pédagogiques à définir |

Ces PDF ne doivent pas être supprimés ni renommés dans C05 : il faut d’abord vérifier leur usage applicatif, leurs doublons éventuels et leurs liens publics.

## Répertoires legacy à ne pas supprimer sans migration dédiée

- `laboratoire/`
- `spe/`

Ils sont conservés tant qu’une mission dédiée n’a pas démontré que leurs contenus sont entièrement remplacés et qu’aucune route, import, documentation ou ressource publique ne dépend d’eux.

## Ce qui reste autorisé à la racine

Les éléments suivants sont légitimes ou nécessaires :

- `.github/`, `.claude/`, `.vscode/` ;
- `.gitignore` ;
- `README.md`, `AGENTS.md`, `CLAUDE.md` ;
- `BO/`, `docs/`, `public/`, `scripts/`, `src/`, `tests/` ;
- `astro.config.mjs`, `eslint.config.js`, `tsconfig.json`, `vercel.json` ;
- `package.json`, `package-lock.json` ;
- autres fichiers de configuration explicitement requis par le build ou les outils.

## Politique pour les nouvelles contributions

À partir de C05 :

- aucun nouveau `RAPPORT_*.md` à la racine ;
- aucun nouvel export `*.txt` d’audit ou de session à la racine ;
- aucun nouvel artefact de vérification ponctuelle à la racine ;
- les documents actifs vont dans `docs/architecture/`, `docs/refonte-v3/` ou un dossier thématique ;
- les comptes rendus historiques vont dans `docs/historique/`.

Le déplacement physique des artefacts listés ci-dessus doit être fait par lots après recherche de références et validation CI, afin de ne pas casser des liens historiques ou des scripts encore dépendants.
