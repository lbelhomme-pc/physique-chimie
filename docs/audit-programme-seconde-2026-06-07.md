# Programme de seconde - audit, règles UI/UX et matrice de couverture

Date de mise à jour : 2026-06-14

## Source locale vérifiée

| Chemin | État | Usage |
|---|---|---|
| `BO/Seconde/spe634_annexe_1062989.pdf` | Présent | Référence officielle locale pour le programme de physique-chimie de seconde générale et technologique. |
| `tmp/pdfs/seconde_bo_2026-06-14.txt` | Généré pour l'audit | Extraction texte du PDF, utilisée pour vérifier les thèmes, notions et capacités. |
| `BO/Seconde/Screen/` | Présent mais vide | Aucune capture spécifique de seconde n'a été trouvée dans ce dossier. Les règles UI/UX ont donc été inférées depuis les pages et composants existants. |

## Audit initial du projet

| Élément audité | Diagnostic |
|---|---|
| Framework | Astro `^5.17.1`, rendu statique, avec MDX, React pour les widgets interactifs, KaTeX/remark-math/rehype-katex pour les formules. |
| Architecture contenu | Données dans `src/data/chapters/lycee/<niveau>/<matiere>/<chapitre>/` avec `meta.json`, `cours.mdx`, et fichiers optionnels `exercices.json`, `quiz.json`, `flashcards.json`. |
| Routes | `src/pages/lycee/[niveau]/index.astro` liste les chapitres ; `src/pages/lycee/[niveau]/[matiere]/[chapitre].astro` charge automatiquement cours, exercices, quiz et flashcards. |
| Content collections | Aucune collection Astro imposée pour ces chapitres ; le site utilise une logique de fichiers de données. |
| Composants réutilisés | `ChapterTabs.astro`, `ExercicesPlayer.tsx`, `QuizPlayer.tsx`, `FlashcardsPlayer.tsx`, layout global et styles de cours existants. |
| Styles | Classes existantes réutilisées : `definition-box`, `example-box`, `info-box`, `methode-box`, `warning-box`, `formula-box`, `retenir-box`, `schema-block`. |
| Navigation | Les chapitres sont intégrés automatiquement par `meta.json` ; l'ajout des JSON rend les onglets Exercices, Quiz et Flashcards visibles sans lien manuel. |
| SEO | Les métadonnées SEO sont déjà portées par les `meta.json` et transmises au layout de chapitre. |
| Risque principal avant correction | Les cours de seconde existaient, mais sans exercices, quiz ni flashcards ; le BO local n'était pas pris en compte dans le document d'audit précédent. |

## Règles UI/UX retenues

- Ne pas créer de nouveau design : conserver la page de chapitre existante, ses onglets, ses cartes et ses encadrés.
- Garder des cours courts, segmentés, avec encadrés pédagogiques plutôt qu'une longue fiche compacte.
- Utiliser `info-box` pour les activités de découverte et `methode-box` pour les méthodes.
- Ajouter les exercices et quiz par fichiers de données afin de laisser les composants React existants gérer les interactions.
- Ne pas ajouter de directive client ni de dépendance : les composants interactifs existent déjà.
- Conserver des corrections masquées par défaut via le comportement de `ExercicesPlayer`.

## Organisation officielle retenue

Le programme de seconde est structuré autour de trois thèmes :

| Thème officiel | Sous-parties couvertes dans le site |
|---|---|
| Constitution et transformations de la matière | Corps purs et mélanges ; solutions aqueuses ; entités chimiques ; mole et quantité de matière ; transformations physiques, chimiques et nucléaires ; énergie. |
| Mouvement et interactions | Description du mouvement ; référentiel ; vecteurs vitesse ; forces ; poids ; actions réciproques ; principe d'inertie. |
| Ondes et signaux | Son ; lumière, spectres, réfraction et lentilles ; signaux électriques, lois des circuits et capteurs. |
| Mesure et incertitudes | Notions transversales intégrées dans les méthodes, corrections et calculs : unités, chiffres significatifs, conversions, comparaison à une valeur de référence, exploitation de mesures. |

## Matrice de couverture

| Thème | Chapitre | Notions et capacités du BO couvertes | Activités / exercices / quiz prévus | Fichiers correspondants | Statut |
|---|---|---|---|---|---|
| Constitution et transformations de la matière | Corps purs, mélanges et espèces chimiques | Corps purs, mélanges homogènes/hétérogènes, espèces chimiques, tests d'identification, masse volumique, composition de l'air, proportions massiques et volumiques. | Activité d'identification d'échantillons ; exercices de classement, masse volumique, composition de l'air ; quiz de vocabulaire et méthodes. | `src/data/chapters/lycee/2nde/chimie/corps-purs-melanges/` | Intégré |
| Constitution et transformations de la matière | Solutions aqueuses et concentration en masse | Solvant, soluté, solution, concentration en masse, dissolution, dilution, concentration maximale, dosage par étalonnage. | Activité autour d'une boisson colorée ; exercices de concentration, dilution, solubilité, étalonnage ; quiz. | `src/data/chapters/lycee/2nde/chimie/solutions-concentrations/` | Intégré |
| Constitution et transformations de la matière | Atomes, ions et molécules | Entités chimiques, atomes, ions, molécules, noyau, notation \\({}^{A}_{Z}X\\), électroneutralité, configuration électronique, électrons de valence, Lewis. | Activité de modélisation microscopique ; exercices sur noyau, ions, configuration électronique, Lewis ; quiz. | `src/data/chapters/lycee/2nde/chimie/atomes-ions-molecules/` | Intégré |
| Constitution et transformations de la matière | Quantité de matière et mole | Mole, nombre d'Avogadro, nombre d'entités, masse molaire, relations \\(N=nN_A\\), \\(n=m/M\\), notation scientifique. | Activité de changement d'échelle ; exercices moles-entités-masse ; quiz. | `src/data/chapters/lycee/2nde/chimie/quantite-matiere/` | Intégré |
| Constitution et transformations de la matière | Transformations chimiques et transferts d'énergie | Transformations physique/chimique/nucléaire, équation ajustée, conservation des atomes, réactif limitant, transferts d'énergie, endothermique/exothermique. | Activité de transformation observée ; exercices de classement, équations, réactif limitant, énergie ; quiz. | `src/data/chapters/lycee/2nde/chimie/transformations-chimiques-energie/` | Intégré |
| Mouvement et interactions | Décrire un mouvement | Système, référentiel, trajectoire, vitesse moyenne, vecteur déplacement, vecteur vitesse, chronophotographie, mouvement rectiligne/circulaire. | Activité chronophotographie ; exercices sur référentiel, vitesse, vecteur, mouvement ; quiz. | `src/data/chapters/lycee/2nde/physique/decrire-mouvement/` | Intégré |
| Mouvement et interactions | Forces et principe d'inertie | Actions mécaniques, force comme vecteur, poids, support, contact/distance, actions réciproques, principe d'inertie, chute libre modélisée. | Activité bilan de forces ; exercices sur poids, actions réciproques, inertie, chute libre ; quiz. | `src/data/chapters/lycee/2nde/physique/forces-principe-inertie/` | Intégré |
| Ondes et signaux | Émission et perception d'un son | Vibration, propagation dans un milieu matériel, vitesse du son, signal périodique, période, fréquence, domaines audible/infrason/ultrason, niveau sonore et risques. | Activité signal sonore ; exercices période-fréquence, écho, domaines sonores, risque auditif ; quiz. | `src/data/chapters/lycee/2nde/physique/son-emission-perception/` | Intégré |
| Ondes et signaux | Lumière, vision et image | Propagation rectiligne, célérité de la lumière, spectres, longueur d'onde, réflexion/réfraction, Snell-Descartes, dispersion, lentille convergente, image réelle, grandissement, œil réduit. | Activité spectres/lentille ; exercices durée de propagation, spectres, réfraction, dispersion, grandissement ; quiz. | `src/data/chapters/lycee/2nde/physique/lumiere-vision-image/` | Intégré |
| Ondes et signaux | Signaux électriques et capteurs | Lois des nœuds et des mailles, tension, intensité, caractéristique d'un dipôle, loi d'Ohm, capteurs résistifs, étalonnage, microcontrôleur. | Activité capteur ; exercices nœuds, mailles, Ohm, caractéristique, étalonnage ; quiz. | `src/data/chapters/lycee/2nde/physique/signaux-capteurs/` | Intégré |

## Couverture transversale mesure et incertitudes

| Attendu transversal | Couverture actuelle | Point de vigilance |
|---|---|---|
| Unités et conversions | Présentes dans les cours, méthodes et corrections : m/s, km/h, g/L, mol, N, V, A, ohm, Hz. | Ajouter plus tard une mini-fiche dédiée si le site crée une section méthodes transversales. |
| Chiffres significatifs | Mentionnés dans plusieurs corrections et résultats numériques. | Harmoniser encore plus finement si un format de correction officiel est décidé. |
| Exploitation graphique | Présente dans concentrations, chronophotographie, spectres, caractéristiques, étalonnage. | Les graphiques interactifs pourraient être enrichis par simulations dédiées. |
| Incertitude-type, moyenne, écart-type | Non traités comme chapitre autonome ; intégration qualitative seulement. | À intégrer dans une page méthode transversale si l'équipe souhaite une couverture explicite des incertitudes expérimentales. |

## État d'intégration seconde

| Type de ressource | État |
|---|---|
| Cours MDX | 10 chapitres existants renforcés avec une activité de découverte et une méthode. |
| Exercices corrigés | 10 fichiers `exercices.json`, 5 exercices progressifs par chapitre, corrections détaillées. |
| Quiz interactifs | 10 fichiers `quiz.json`, 8 questions par chapitre, feedback explicatif. |
| Flashcards | 10 fichiers `flashcards.json`, 6 cartes par chapitre. |
| Navigation | Automatique via les routes et `meta.json`, sans lien manuel ajouté. |
| Build | `npm.cmd run build` réussi le 2026-06-14 : 125 pages générées, dont les 10 routes de seconde. |

## Points restant à surveiller

- Les captures de référence de seconde n'étant pas présentes localement, le contrôle visuel repose sur les composants et pages existants.
- Les incertitudes expérimentales au sens strict du BO mériteraient une page méthode transversale dédiée si l'on veut une couverture explicite complète.
- Les simulations du laboratoire sont déjà reliées par certains cours ; un audit séparé pourrait vérifier si chaque simulation seconde mérite un exercice guidé associé.
