# Programme de première spécialité - audit et matrice de couverture

Date : 2026-06-14

## Source locale

| Chemin | État | Usage |
|---|---|---|
| `BO/BO_Premiere_SPE.pdf` | Présent | Référence locale pour le programme officiel de physique-chimie de première spécialité. |
| `tmp/pdfs/premiere_spe_bo_2026-06-14.txt` | Généré | Extraction texte du BO, utilisée pour cartographier les notions et capacités. |
| `src/data/chapters/lycee/1ere-spe/` | Complété | Dossiers `chimie` et `physique` initialement vides, désormais alimentés. |

## Audit initial

| Élément | Diagnostic |
|---|---|
| Architecture | Le site utilise les mêmes routes Astro que pour seconde et terminale : `meta.json`, `cours.mdx`, `exercices.json`, `quiz.json`, `flashcards.json`. |
| État avant intervention | Les dossiers `1ere-spe/chimie` et `1ere-spe/physique` existaient mais ne contenaient aucun chapitre. |
| Navigation | Les pages de niveau et de matière listent automatiquement les chapitres dès qu'un `meta.json` est présent. |
| UI/UX | Réutilisation stricte des composants existants : onglets chapitre, blocs de cours, exercices interactifs, quiz et flashcards. |
| Choix de granularité | Le BO est dense ; une première structuration en 9 chapitres couvre toutes les grandes capacités sans multiplier excessivement les pages. |

## Matrice de couverture BO

| Thème du BO | Chapitre intégré | Notions et capacités couvertes | Fichiers |
|---|---|---|---|
| Mesure et incertitudes | Mesure et incertitudes | Série de mesures, moyenne, écart-type, incertitude-type de type A et B, écriture d'un résultat, comparaison à une référence. | `src/data/chapters/lycee/1ere-spe/physique/mesure-incertitudes/` |
| Constitution et transformations de la matière | Composition d'un système et Beer-Lambert | Masse molaire, volume molaire, concentration en quantité de matière, absorbance, spectre d'absorption, loi de Beer-Lambert, gamme étalon. | `src/data/chapters/lycee/1ere-spe/chimie/composition-systeme-beer-lambert/` |
| Constitution et transformations de la matière | Oxydo-réduction, avancement et titrage | Couples oxydant-réducteur, demi-équations, réaction redox, avancement, transformation totale/non totale, titrage colorimétrique, équivalence. | `src/data/chapters/lycee/1ere-spe/chimie/oxydoreduction-avancement-titrage/` |
| Constitution et transformations de la matière | Structure, polarité et solubilité | Lewis, lacune électronique, géométrie, électronégativité, polarité, cohésion, dissolution ionique, extraction liquide-liquide, hydrophilie/lipophilie/amphiphilie. | `src/data/chapters/lycee/1ere-spe/chimie/structure-polarite-solubilite/` |
| Constitution et transformations de la matière | Chimie organique, synthèse et combustion | Formules semi-développées, groupes caractéristiques, familles fonctionnelles, IR, protocole de synthèse, rendement, combustion, énergie de liaison. | `src/data/chapters/lycee/1ere-spe/chimie/chimie-organique-synthese-combustion/` |
| Mouvement et interactions | Interactions fondamentales et champs | Charge électrique, loi de Coulomb, gravitation, champ électrostatique, champ de gravitation, lignes de champ. | `src/data/chapters/lycee/1ere-spe/physique/champs-interactions/` |
| Mouvement et interactions | Fluides au repos et mouvement | Grandeurs macroscopiques d'un fluide, loi de Mariotte, force pressante, statique des fluides, variation du vecteur vitesse, lien avec la somme des forces. | `src/data/chapters/lycee/1ere-spe/physique/fluides-mouvement/` |
| L'énergie : conversions et transferts | Énergie électrique et mécanique | Débit de charges, source réelle, puissance, énergie, effet Joule, rendement, énergie cinétique, travail, énergie potentielle, énergie mécanique. | `src/data/chapters/lycee/1ere-spe/physique/energie-electrique-mecanique/` |
| Ondes et signaux | Ondes, images, couleurs et photons | Ondes mécaniques progressives, retard, célérité, période, longueur d'onde, lentille mince, grandissement, couleurs, domaines électromagnétiques, photon, niveaux d'énergie. | `src/data/chapters/lycee/1ere-spe/physique/ondes-lumiere-photons/` |

## Ressources produites

Chaque chapitre contient :

- `meta.json` avec titre, description, ordre, SEO et tags ;
- `cours.mdx` avec objectifs, activité de découverte, méthode, cours structuré, figure SVG et synthèse ;
- `exercices.json` avec 4 exercices progressifs et corrections détaillées ;
- `quiz.json` avec 6 à 8 questions selon le chapitre ;
- `flashcards.json` avec 5 cartes de mémorisation.

## Contrôles

| Contrôle | Résultat |
|---|---|
| Parsing JSON | `JSON_OK 36` |
| Recherche de placeholders | Aucun `TODO`, `Lorem`, `contenu à venir`, `exercice exemple` dans `1ere-spe`. |
| Build Astro | `npm.cmd run build` réussi le 2026-06-14 ; 134 pages générées, dont les 9 routes de première spécialité. |

## Points à approfondir plus tard

- La première spécialité est plus dense que la seconde : les chapitres créés sont complets mais compacts. Une passe ultérieure pourrait ajouter davantage d'exercices par sous-capacité.
- Les capacités expérimentales sont traitées dans les activités et méthodes, mais certaines gagneraient à être reliées à des simulations de laboratoire dédiées.
- Les chapitres larges `fluides-mouvement`, `energie-electrique-mecanique` et `ondes-lumiere-photons` peuvent être scindés plus finement si l'on souhaite une progression annuelle très détaillée.
