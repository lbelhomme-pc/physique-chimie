# References programmes et cartographie chapitres

Date : 2026-05-29  
Perimetre : traitement P0 de `docs/audit-site-global-2026-05-29.md` uniquement.  
Decision : aucun cours, exercice, quiz ou contenu pedagogique n'a ete reecrit pendant cette passe.

## 1. Diagnostic des sources

### Source annoncee par `AGENTS.md`

| Reference attendue | Etat verifie | Diagnostic |
|---|---|---|
| `BO.pdf` a la racine du depot | Absent | `AGENTS.md` est donc encore inexact sur le chemin de reference. |
| `BO/` | Present | Le dossier contient maintenant plusieurs PDF de programmes. |

### Sources disponibles dans `BO/`

| Fichier | Contenu observe par extraction texte | Niveau de confiance | Usage possible |
|---|---|---|---|
| `BO/BO_College.pdf` | Commence par `Projet de programmes de physique-chimie du cycle 4`, `Juillet 2025`, puis `Ce projet de programmes n'engage pas, a ce stade, le ministere de l'Education nationale.` | Faible pour une certification officielle ; eleve pour identifier le document disponible | Source de travail provisoire pour le college, non suffisante pour certifier la conformite officielle. |
| `BO/BO_Premiere_ES.pdf` | Mention explicite `Bulletin officiel n° 25 du 22 juin 2023`, programme d'enseignement scientifique de premiere generale | Eleve | Reference exploitable pour premiere enseignement scientifique, si des chapitres existent. |
| `BO/BO_Term_ES.pdf` | Mention explicite `Bulletin officiel n° 25 du 22 juin 2023`, programme d'enseignement scientifique de terminale generale | Eleve | Reference exploitable pour terminale enseignement scientifique, si des chapitres existent. |
| `BO/BO_Premiere_SPE.pdf` | Programme de physique-chimie de premiere generale, enseignement de specialite | Moyen a eleve, sous reserve de confirmer la provenance du PDF | Reference exploitable pour premiere specialite apres validation de provenance. |
| `BO/BO_Term_Spe.pdf` | Programme de physique-chimie de terminale generale, enseignement de specialite | Moyen a eleve, sous reserve de confirmer la provenance du PDF | Reference exploitable pour terminale specialite apres validation de provenance. |

### Sources alternatives dans `tmp/` et `docs/`

| Fichier | Role | Diagnostic |
|---|---|---|
| `tmp/pdfs/cycle4_bo.txt` | Texte extrait du projet de programme cycle 4 de juillet 2025 | Identique au texte extrait de `BO/BO_College.pdf`. Ce n'est pas une reference officielle definitive. |
| `docs/audit-site-global-2026-05-29.md` | Audit global ayant signale le P0 | Toujours valide sur le fond : le chemin `BO.pdf` est absent, et la reference college disponible reste un projet. |
| `docs/prompts-corrections-audit-2026-05-29.md` | Prompt de correction P0 | Decrit exactement la mission traitee ici. |
| `src/data/chapters/**/meta.json` | Donnees de chapitres existantes | Source interne de cartographie des chapitres, pas une reference programme. |

## 2. Consequences pour la conformite

Pour le college, la conformite officielle ne peut pas etre certifiee a ce stade. Le fichier `BO/BO_College.pdf` est bien present, mais il correspond au meme projet de programmes que `tmp/pdfs/cycle4_bo.txt`. Il peut servir a rattacher provisoirement les chapitres aux attendus disponibles, mais il ne doit pas etre presente comme un Bulletin officiel definitif.

Pour le lycee, plusieurs PDF exploitables sont presents dans `BO/`. Les documents d'enseignement scientifique portent une mention explicite du Bulletin officiel. Les documents de specialite doivent encore etre rattaches a leur provenance officielle exacte si l'on veut une certification stricte.

Action recommandee avant toute reecriture pedagogique : remplacer ou completer `BO/BO_College.pdf` par la reference officielle college definitive, ou documenter explicitement que le site s'appuie provisoirement sur le projet de juillet 2025.

## 3. Cartographie globale par niveau et theme

Cette table cartographie les chapitres actuellement effectifs dans `src/data/chapters`. Les dossiers vides sont signales separement.

| Niveau | Theme programme / metadata | Chapitres existants | Source programme disponible | Statut de rattachement |
|---|---|---|---|---|
| 5eme | Organisation et transformations de la matiere | `proprietes-matiere`, `melanges-dissolution`, `transformations-matiere` | `BO/BO_College.pdf` / `tmp/pdfs/cycle4_bo.txt` | Provisoire, coherent avec le projet cycle 4. |
| 5eme | Mouvement et interactions | `temps-mouvements` | `BO/BO_College.pdf` / `tmp/pdfs/cycle4_bo.txt` | Provisoire, coherent avec le projet cycle 4. |
| 5eme | L'energie : stocks, transferts, conversions | `energie-stocks-transferts`, `circuits-electriques` | `BO/BO_College.pdf` / `tmp/pdfs/cycle4_bo.txt` | Provisoire, coherent avec le projet cycle 4. |
| 5eme | Ondes et signaux | `signaux-sonores`, `lumiere-ombres` | `BO/BO_College.pdf` / `tmp/pdfs/cycle4_bo.txt` | Provisoire, coherent avec le projet cycle 4. |
| 4e | Organisation et transformations de la matiere | `echelles-microscopiques`, `atomes-molecules`, `reactifs-produits-conservation`, `solubilite` | `BO/BO_College.pdf` / `tmp/pdfs/cycle4_bo.txt` | Provisoire, a detailler ulterieurement. |
| 4e | Mouvement et interactions | `mouvement-vitesse`, `interactions-forces-aimants` | `BO/BO_College.pdf` / `tmp/pdfs/cycle4_bo.txt` | Provisoire, a detailler ulterieurement. |
| 4e | L'energie : stocks, transferts, conversions | `puissance-transferts-energie`, `puissance-electrique` | `BO/BO_College.pdf` / `tmp/pdfs/cycle4_bo.txt` | Provisoire, a detailler ulterieurement. |
| 4e | Ondes et signaux | `ondes-signaux` | `BO/BO_College.pdf` / `tmp/pdfs/cycle4_bo.txt` | Provisoire, a detailler ulterieurement. |
| 3eme | Organisation et transformation(s) de la matiere | `masse-volumique`, `atome`, `molecules`, `ions`, `ph`, `transformations-chimiques` | `BO/BO_College.pdf` / `tmp/pdfs/cycle4_bo.txt` | Provisoire, a detailler ulterieurement. |
| 3eme | Mouvement et interactions | `mouvements` | `BO/BO_College.pdf` / `tmp/pdfs/cycle4_bo.txt` | Provisoire, a detailler ulterieurement. |
| 3eme | L'energie et ses conversions | `sources-energies`, `energie-mecanique`, `loi-ohm`, `puissance-energie` | `BO/BO_College.pdf` / `tmp/pdfs/cycle4_bo.txt` | Provisoire, a detailler ulterieurement. |
| 3eme | Des signaux pour observer et communiquer | `signaux` | `BO/BO_College.pdf` / `tmp/pdfs/cycle4_bo.txt` | Provisoire, a detailler ulterieurement. |
| terminale-spe | Constitution et transformations de la matiere | `analyse-systeme`, `acide-base-ph`, `equilibre-reaction-acide-base`, `evolution-spontanee-systeme-chimique`, `electrolyse`, `optimisation-synthese`, `strategie-synthese-multi-etapes`, `suivi-temporel-modele-macroscopique`, `suivi-temporel-modele-microscopique` | `BO/BO_Term_Spe.pdf` | Rattachement plausible, a valider ligne par ligne hors P0 college. |
| terminale-spe | Mouvement et interactions | `forces-mouvements`, `mouvements-energies-champ-uniforme`, `mouvements-fluide`, `mouvements-satellites-planetes` | `BO/BO_Term_Spe.pdf` | Rattachement plausible, a valider ligne par ligne hors P0 college. |
| terminale-spe | L'energie : conversions et transferts | `modele-gaz-parfait`, `transferts-thermiques-bilans-energie`, `systemes-electriques-capacitifs` | `BO/BO_Term_Spe.pdf` | Rattachement plausible, a valider ligne par ligne hors P0 college. |
| terminale-spe | Ondes et signaux | `diffraction-ondes-interferences`, `lumiere-flux-photons`, `attenuations-effet-doppler`, `formation-images-lunette-astronomique` | `BO/BO_Term_Spe.pdf` | Rattachement plausible, a valider ligne par ligne hors P0 college. |

### Dossiers sans chapitre effectif

Les dossiers suivants existent mais ne contiennent pas de fichiers de chapitre au moment de cette verification :

| Dossier | Etat |
|---|---|
| `src/data/chapters/college/6eme/` | Dossiers `chimie` et `physique` vides. |
| `src/data/chapters/lycee/2nde/` | Dossiers `chimie` et `physique` vides. |
| `src/data/chapters/lycee/1ere-spe/` | Dossiers `chimie` et `physique` vides. |
| `src/data/chapters/lycee/1ere-ens-scientifique/` | Dossiers `chimie` et `physique` vides. |
| `src/data/chapters/lycee/terminale-ens-scientifique/` | Dossiers `chimie` et `physique` vides. |

## 4. Rattachement detaille des chapitres de 5eme

Reference disponible pour cette table : `BO/BO_College.pdf`, identique au texte `tmp/pdfs/cycle4_bo.txt`. Cette reference est un projet de programmes de physique-chimie du cycle 4, juillet 2025. Le niveau de confiance pedagogique est donc "provisoire", pas "officiel certifie".

| Attendu / entree du programme disponible | Chapitre 5eme rattache | Fichiers concernes | Couverture apparente | Confiance |
|---|---|---|---|---|
| Propriete de la matiere : caracteriser un echantillon par masse, volume, temperature, pression ; connaitre les unites ; changements d'etat et corps purs. | `Proprietes de la matiere` | `src/data/chapters/college/5eme/chimie/proprietes-matiere/` | Bonne correspondance apparente avec le `meta.json`. | Provisoire. |
| Constitution et organisation de la matiere : especes chimiques, corps pur, melange, melange homogene/heterogene, air, dissolution, solvant, solute, solution, miscibilite. | `Melanges et dissolution` | `src/data/chapters/college/5eme/chimie/melanges-dissolution/` | Bonne correspondance apparente avec le `meta.json`. | Provisoire. |
| Transformations de la matiere : distinguer transformation physique et transformation chimique ; decrire l'evolution macroscopique d'un systeme. | `Transformations de la matiere` | `src/data/chapters/college/5eme/chimie/transformations-matiere/` | Bonne correspondance apparente avec le `meta.json`. | Provisoire. |
| Mesure du temps et mouvement : annee, journee, seconde ; decrire la trajectoire ; relativite du mouvement par rapport a l'observateur. | `Mesure du temps et mouvement` | `src/data/chapters/college/5eme/physique/temps-mouvements/` | Bonne correspondance apparente avec le `meta.json`. | Provisoire. |
| Stocks et transferts d'energie : tout systeme stocke de l'energie ; variation du stock liee a une transformation observable ; source d'energie. | `Energie : stocks et transferts` | `src/data/chapters/college/5eme/physique/energie-stocks-transferts/` | Bonne correspondance apparente avec le `meta.json`. | Provisoire. |
| Electricite : boucle ouverte/fermee, schema normalise, serie/derivation, tension, intensite, risques electriques. | `Circuits electriques` | `src/data/chapters/college/5eme/physique/circuits-electriques/` | Bonne correspondance apparente avec le `meta.json`. | Provisoire. |
| Signaux sonores : frequence, niveau d'intensite sonore, infrasons/sons audibles/ultrasons, risques auditifs. | `Signaux sonores` | `src/data/chapters/college/5eme/physique/signaux-sonores/` | Bonne correspondance apparente avec le `meta.json`. | Provisoire. |
| Signaux lumineux : source primaire, objet diffusant, propagation rectiligne, rayon lumineux, ombres, signaux invisibles. | `Lumiere et ombres` | `src/data/chapters/college/5eme/physique/lumiere-ombres/` | Bonne correspondance apparente avec le `meta.json`. | Provisoire. |

## 5. Incertitudes explicites

- Le depot ne contient toujours pas `BO.pdf` a la racine, alors que `AGENTS.md` le cite encore comme document officiel.
- Le fichier college disponible dans `BO/` n'est pas une reference officielle definitive : son texte annonce explicitement un projet de juillet 2025.
- La cartographie 5eme ci-dessus est une cartographie de travail, valable pour organiser l'audit et la verification, mais elle ne certifie pas la conformite au Bulletin officiel final.
- Les rattachements 3eme, 4e et terminale-specialite sont volontairement globaux dans cette passe P0 ; une verification ligne par ligne pourra etre menee apres clarification de la source officielle college et de la provenance exacte des PDF de specialite.

## 6. Verification realisee

- Recherche de `BO.pdf` dans tout le depot : aucun fichier trouve.
- Inventaire du dossier `BO/` : cinq PDF trouves.
- Extraction texte de `BO/BO_College.pdf` via `pdftotext`.
- Comparaison binaire du texte extrait avec `tmp/pdfs/cycle4_bo.txt` : aucune difference.
- Lecture des `meta.json` de `src/data/chapters/**` pour lister les chapitres existants.
- Aucun fichier source `src/` n'a ete modifie par cette mission P0.
