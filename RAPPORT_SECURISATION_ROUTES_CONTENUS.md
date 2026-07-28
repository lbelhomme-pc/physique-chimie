# Rapport de securisation des routes et contenus

## 1. Reference lue

Le fichier `INVENTAIRE_CHEMINS_CANONIQUES.md` a ete lu en premier et utilise comme base de travail.

Objectif du filet de securite cree : verifier automatiquement, avant toute reorganisation, la coherence des routes publiques, routes dynamiques, slugs, fichiers de contenus, canoniques, quiz, flashcards, exercices, cours, `chapterId` et routes du laboratoire.

## 2. Fichiers crees

| Fichier | Role | Statut |
|---|---|---|
| `scripts/verify-routes-and-content.mjs` | Script de verification des routes, contenus, canoniques, donnees de memorisation et laboratoire | Cree |
| `RAPPORT_SECURISATION_ROUTES_CONTENUS.md` | Rapport de reference avant reorganisation | Cree |

## 3. Commandes de verification

| Commande | Resultat | Detail |
|---|---|---|
| `node scripts/verify-routes-and-content.mjs` | Succes | 17068 controles, 0 erreur, 43 avertissements |
| `npm.cmd run build` | Succes | Execute le script `build` declare dans `package.json`, soit `astro build`; 225 pages generees |

Note Windows : `npm.cmd run build` a ete utilise pour executer la commande demandee `npm run build` sans declencher le blocage PowerShell de `npm.ps1`. Le script projet execute reste bien `astro build`.

## 4. Synthese de couverture

| Element verifie | Nombre |
|---|---:|
| Routes dynamiques Astro verifiees | 13 |
| Routes publiques attendues derivees des contenus | 150 |
| Chapitres physique-chimie verifies | 101 |
| Chapitres mathematiques verifies | 11 |
| Applications laboratoire verifiees | 25 |
| Controles executes par le script | 17068 |
| Erreurs bloquantes | 0 |
| Avertissements de reference | 43 |

## 5. Routes dynamiques protegees

| Route publique | Fichier verifie | Controle principal |
|---|---|---|
| `/college/[niveau]` | `src/pages/college/[niveau].astro` | Presence du fichier et de `getStaticPaths` |
| `/college/[niveau]/[matiere]` | `src/pages/college/[niveau]/[matiere].astro` | Presence du fichier et de `getStaticPaths` |
| `/college/[niveau]/[matiere]/[chapitre]` | `src/pages/college/[niveau]/[matiere]/[chapitre].astro` | Presence du fichier, `getStaticPaths`, fichiers de chapitre, slug et canonical |
| `/lycee/[niveau]` | `src/pages/lycee/[niveau].astro` | Presence du fichier et de `getStaticPaths` |
| `/lycee/[niveau]/[matiere]` | `src/pages/lycee/[niveau]/[matiere].astro` | Presence du fichier et de `getStaticPaths` |
| `/lycee/[niveau]/[matiere]/[chapitre]` | `src/pages/lycee/[niveau]/[matiere]/[chapitre].astro` | Presence du fichier, `getStaticPaths`, fichiers de chapitre, slug et canonical |
| `/mathematiques/college/[niveau]` | `src/pages/mathematiques/college/[niveau].astro` | Presence du fichier et de `getStaticPaths` |
| `/mathematiques/college/[niveau]/[chapitre]` | `src/pages/mathematiques/college/[niveau]/[chapitre].astro` | Presence du fichier, `getStaticPaths`, fichiers de chapitre, slug et canonical |
| `/mathematiques/lycee/[niveau]` | `src/pages/mathematiques/lycee/[niveau].astro` | Presence du fichier et de `getStaticPaths` |
| `/mathematiques/lycee/[niveau]/[chapitre]` | `src/pages/mathematiques/lycee/[niveau]/[chapitre].astro` | Presence du fichier, `getStaticPaths`, fichiers de chapitre, slug et canonical |
| `/laboratoire/[slug]` | `src/pages/laboratoire/[slug].astro` | Presence du fichier, `getStaticPaths`, slug, route, `legacyPath` et configurations |
| `/memorisation/chapitre/[chapterId]` | `src/pages/memorisation/chapitre/[chapterId].astro` | Presence du fichier et de `getStaticPaths` |
| `/memorisation/session/[sessionId]` | `src/pages/memorisation/session/[sessionId].astro` | Presence du fichier et de `getStaticPaths` |

## 6. Routes publiques statiques protegees

Le script verifie les routes statiques sensibles sous `src/pages/`, notamment :

- `/`
- `/college`
- `/lycee`
- `/mathematiques`
- `/mathematiques/college`
- `/mathematiques/lycee`
- `/laboratoire`
- `/outils-methodes`
- `/memorisation`
- `/profil`

Le script accepte les deux conventions Astro courantes : `src/pages/route.astro` et `src/pages/route/index.astro`.

## 7. Contenus pedagogiques proteges

| Zone | Chemin verifie | Controles effectues |
|---|---|---|
| Physique-chimie college et lycee | `src/data/chapters/` | Convention `cycle/niveau/matiere/chapitre`, fichiers requis, JSON, slug, `chapterId`, quiz, flashcards, exercices, canonical |
| Mathematiques college et lycee | `src/data/mathematiques/chapters/` | Convention `cycle/niveau/chapitre`, fichiers requis, JSON, slug, `chapterId`, quiz, flashcards, exercices, canonical |
| Laboratoire | `src/data/laboratoire/apps.ts` et `src/data/laboratoire/genericConfigs.ts` | Slug, route publique, `legacyPath`, pages dediees, configurations generiques, existence des fichiers legacy |
| Memorisation | `quiz.json`, `flashcards.json`, routes `/memorisation/chapitre/[chapterId]` et `/memorisation/session/[sessionId]` | Structure minimale, doublons, references de chapitre |
| Cours et fragments | `cours.mdx`, `cours.fragment.html` | Existence, taille non vide, imports locaux de fragments |
| Exercices | `exercices.json` | Existence, JSON valide, tableau non vide |

## 8. Globs et chemins critiques verifies

| Fichier | Expression surveillee | Risque couvert |
|---|---|---|
| `src/pages/college/[niveau]/[matiere]/[chapitre].astro` | `import.meta.glob` vers `src/data/chapters` | Rupture de generation des chapitres physique-chimie |
| `src/pages/lycee/[niveau]/[matiere]/[chapitre].astro` | `import.meta.glob` vers `src/data/chapters` | Rupture de generation des chapitres physique-chimie |
| `src/pages/mathematiques/college/[niveau]/[chapitre].astro` | `import.meta.glob` vers `src/data/mathematiques/chapters` | Rupture de generation des chapitres mathematiques college |
| `src/pages/mathematiques/lycee/[niveau]/[chapitre].astro` | `import.meta.glob` vers `src/data/mathematiques/chapters` | Rupture de generation des chapitres mathematiques lycee |
| `src/pages/laboratoire/[slug].astro` | `getStaticPaths` avec catalogue laboratoire | Rupture des pages `/laboratoire/[slug]` |
| `src/pages/memorisation/chapitre/[chapterId].astro` | `import.meta.glob` vers les quiz et flashcards | Rupture de la memorisation par chapitre |
| `src/pages/memorisation/session/[sessionId].astro` | `import.meta.glob` vers les quiz et flashcards | Rupture des sessions de memorisation |

## 9. Avertissements de reference

Le script signale 43 avertissements, sans erreur bloquante. Ils constituent l'etat de reference a ne pas degrader lors d'une future reorganisation.

| Type d'avertissement | Nombre | Interpretation |
|---|---:|---|
| Niveau `meta.json` different du dossier | 9 | Des chapitres `college/4eme` utilisent `4e` dans les metadonnees |
| Slug absent dans `meta.json` | 13 | La route repose uniquement sur le nom du dossier |
| Canonical physique-chimie absent | 21 | La page utilise le fallback de route publique |

### 9.1 Niveau `meta.json` different du dossier

- `src/data/chapters/college/4eme/chimie/atomes-molecules/meta.json`
- `src/data/chapters/college/4eme/chimie/echelles-microscopiques/meta.json`
- `src/data/chapters/college/4eme/chimie/reactifs-produits-conservation/meta.json`
- `src/data/chapters/college/4eme/chimie/solubilite/meta.json`
- `src/data/chapters/college/4eme/physique/interactions-forces-aimants/meta.json`
- `src/data/chapters/college/4eme/physique/mouvement-vitesse/meta.json`
- `src/data/chapters/college/4eme/physique/ondes-signaux/meta.json`
- `src/data/chapters/college/4eme/physique/puissance-electrique/meta.json`
- `src/data/chapters/college/4eme/physique/puissance-transferts-energie/meta.json`

### 9.2 Slug absent dans `meta.json`

- `src/data/chapters/lycee/terminale-spe/chimie/acide-base-ph/meta.json`
- `src/data/chapters/lycee/terminale-spe/chimie/electrolyse/meta.json`
- `src/data/chapters/lycee/terminale-spe/chimie/evolution-spontanee-systeme-chimique/meta.json`
- `src/data/chapters/lycee/terminale-spe/chimie/optimisation-synthese/meta.json`
- `src/data/chapters/lycee/terminale-spe/chimie/strategie-synthese-multi-etapes/meta.json`
- `src/data/chapters/lycee/terminale-spe/chimie/suivi-temporel-modele-macroscopique/meta.json`
- `src/data/chapters/lycee/terminale-spe/chimie/suivi-temporel-modele-microscopique/meta.json`
- `src/data/chapters/lycee/terminale-spe/physique/attenuations-effet-doppler/meta.json`
- `src/data/chapters/lycee/terminale-spe/physique/forces-mouvements/meta.json`
- `src/data/chapters/lycee/terminale-spe/physique/formation-images-lunette-astronomique/meta.json`
- `src/data/chapters/lycee/terminale-spe/physique/mouvements-fluide/meta.json`
- `src/data/chapters/lycee/terminale-spe/physique/mouvements-satellites-planetes/meta.json`
- `src/data/chapters/lycee/terminale-spe/physique/transformation-nucleaire/meta.json`

### 9.3 Canonical physique-chimie absent

- `src/data/chapters/lycee/terminale-spe/chimie/acide-base-ph/meta.json`
- `src/data/chapters/lycee/terminale-spe/chimie/analyse-systeme/meta.json`
- `src/data/chapters/lycee/terminale-spe/chimie/electrolyse/meta.json`
- `src/data/chapters/lycee/terminale-spe/chimie/equilibre-reaction-acide-base/meta.json`
- `src/data/chapters/lycee/terminale-spe/chimie/evolution-spontanee-systeme-chimique/meta.json`
- `src/data/chapters/lycee/terminale-spe/chimie/optimisation-synthese/meta.json`
- `src/data/chapters/lycee/terminale-spe/chimie/strategie-synthese-multi-etapes/meta.json`
- `src/data/chapters/lycee/terminale-spe/chimie/suivi-temporel-modele-macroscopique/meta.json`
- `src/data/chapters/lycee/terminale-spe/chimie/suivi-temporel-modele-microscopique/meta.json`
- `src/data/chapters/lycee/terminale-spe/physique/attenuations-effet-doppler/meta.json`
- `src/data/chapters/lycee/terminale-spe/physique/diffraction-ondes-interferences/meta.json`
- `src/data/chapters/lycee/terminale-spe/physique/forces-mouvements/meta.json`
- `src/data/chapters/lycee/terminale-spe/physique/formation-images-lunette-astronomique/meta.json`
- `src/data/chapters/lycee/terminale-spe/physique/lumiere-flux-photons/meta.json`
- `src/data/chapters/lycee/terminale-spe/physique/modele-gaz-parfait/meta.json`
- `src/data/chapters/lycee/terminale-spe/physique/mouvements-energies-champ-uniforme/meta.json`
- `src/data/chapters/lycee/terminale-spe/physique/mouvements-fluide/meta.json`
- `src/data/chapters/lycee/terminale-spe/physique/mouvements-satellites-planetes/meta.json`
- `src/data/chapters/lycee/terminale-spe/physique/systemes-electriques-capacitifs/meta.json`
- `src/data/chapters/lycee/terminale-spe/physique/transferts-thermiques-bilans-energie/meta.json`
- `src/data/chapters/lycee/terminale-spe/physique/transformation-nucleaire/meta.json`

## 10. Regles de non-regression avant migration

| Zone | Seuil de reference | Regle avant reorganisation |
|---|---:|---|
| Erreurs du script | 0 | Toute nouvelle erreur doit etre traitee avant migration |
| Avertissements du script | 43 | Ne pas augmenter ce nombre sans decision explicite |
| Routes dynamiques | 13 | Conserver les routes publiques ou documenter une redirection avant changement |
| Routes publiques derivees | 150 | Ne pas faire disparaitre une route issue des contenus |
| Chapitres physique-chimie | 101 | Ne pas perdre de dossier ni de fichier requis |
| Chapitres mathematiques | 11 | Ne pas perdre de dossier ni de fichier requis |
| Applications laboratoire | 25 | Conserver les slugs et les `legacyPath` tant que l'audit legacy n'est pas fait |

## 11. Conclusion

Le filet de securite est en place. Le script ne detecte aucune erreur bloquante sur l'etat actuel du depot. Les 43 avertissements sont documentes comme baseline avant reorganisation. Aucune migration, aucun renommage, aucun deplacement et aucune modification de contenu pedagogique n'ont ete effectues.
