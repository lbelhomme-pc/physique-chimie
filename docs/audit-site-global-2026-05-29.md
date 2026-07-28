# Audit global du site physique-chimie

Date : 2026-05-29  
Perimetre : contenus college, lycee, laboratoire, composants pedagogiques, accessibilite, SEO, build Astro.  
Verification technique : `npm.cmd run build` reussi.  
Limite principale : `BO.pdf` est annonce dans `AGENTS.md`, mais il n'est pas present a la racine du depot. La seule reference exploitable trouvee est `tmp/pdfs/cycle4_bo.txt`, qui indique explicitement qu'il s'agit d'un projet de programmes de juillet 2025 n'engageant pas le ministere.

## 1. Synthese executive

Le site est techniquement fonctionnel : le build Astro passe, les routes sont generees, les chapitres existent sous forme de donnees, et le laboratoire dispose deja d'un audit visuel indiquant 25 simulations chargees sans erreur applicative.

L'etat general n'est pas bloquant pour une mise en ligne de travail, mais il n'est pas encore assez fiable pour etre presente comme une plateforme pedagogique finalisee. Les risques principaux sont la tracabilite aux programmes officiels, l'accessibilite des schemas et simulations, l'integration faible entre cours/exercices/simulations, et plusieurs dettes de maintenabilite.

Points forts concrets :
- architecture Astro dynamique assez efficace pour ajouter des chapitres ;
- contenu 5e largement amorce : 8 chapitres, cours, exercices, quiz et flashcards ;
- laboratoire riche, avec 25 simulations repertoriees et deja testees ;
- presence d'un panneau d'accessibilite et de composants pedagogiques reutilisables ;
- build stable.

Problemes majeurs :
- la source officielle `BO.pdf` manque, donc la conformite programme ne peut pas etre certifiee ;
- les metadonnees SEO des chapitres existent mais ne sont pas transmises au layout ;
- de nombreux schemas d'exercices sont essentiels mais marques `aria-hidden="true"` ;
- les simulations restent tres dependantes du canvas pour l'information scientifique ;
- les chapitres ne relient pas assez explicitement cours, exercices, quiz et simulations ;
- le simulateur generique est un fichier monolithique difficile a auditer et a faire evoluer.

Gravite globale : moyenne a elevee.  
Priorite absolue : rendre le site fiable et verifiable avant d'ajouter du volume : BO officiel, accessibilite des documents, liens pedagogiques, metadonnees, puis correction scientifique fine.

## 2. Tableau des problemes prioritaires

| Priorite | Gravite | Zone / fichier | Probleme | Impact | Correction recommandee |
|---|---|---|---|---|---|
| P0 | Eleve | `AGENTS.md`, racine du depot | `BO.pdf` est exige mais absent. Seul un projet de programme est present dans `tmp/pdfs/cycle4_bo.txt`. | Impossible de garantir une conformite officielle. | Ajouter le PDF officiel attendu ou documenter clairement la version de programme utilisee. |
| P1 | Eleve | `src/pages/college/[niveau]/[matiere]/[chapitre].astro`, `src/pages/lycee/[niveau]/[matiere]/[chapitre].astro` | Les pages chapitre passent seulement `title` a `BaseLayout` et ignorent `meta.seo`. | SEO pauvre, partage generique, schema EducationalContent non utilise. | Passer description, canonical, schemaType, ogImage depuis les `meta.json`. |
| P1 | Eleve | `src/data/chapters/**/exercices.json` | Beaucoup de `schemaSvg` d'exercices sont `aria-hidden="true"` alors que la consigne demande d'observer le schema. | Eleves lecteurs d'ecran exclus ; document pedagogique invisible. | Remplacer par `role="img"` + `aria-label`/`title`/`desc`, ou fournir une description textuelle equivalente. |
| P1 | Eleve | `src/components/laboratoire/GenericLabSimulator.astro`, `src/scripts/laboratoire/generic-lab-simulator.js` | Informations scientifiques importantes dessinees dans le canvas. | Accessibilite limitee, reutilisation difficile, comprehension fragile hors visuel. | Ajouter un resume HTML synchronise sous chaque simulation et des donnees tabulaires courtes. |
| P1 | Eleve | Chapitres 5e et laboratoire | Les cours ne renvoient pas assez aux simulations pertinentes. | Rupture entre notion, manipulation et entrainement. | Ajouter des encadres "Manipuler" dans les cours : melanges, chrono, circuits, energie, sons, lumieres. |
| P1 | Moyen | `src/data/chapters/college/5eme/chimie/melanges-dissolution/cours.mdx` | Formulation : le CO2 dissous serait "responsable des bulles". | Risque de confusion entre gaz dissous et gaz qui se degage. | Dire : le CO2 peut etre dissous ; quand la pression baisse, une partie redevient gaz et forme des bulles. |
| P1 | Moyen | `src/data/chapters/college/5eme/physique/lumiere-ombres/*` | Nombreuses graphies sans accents et une faute visible : `notres`. | Aspect brouillon, baisse de confiance, lecture moins fluide. | Lancer une passe orthographique sur les donnees de cours, quiz et flashcards. |
| P2 | Moyen | `src/scripts/laboratoire/generic-lab-simulator.js` | Simulateur generique tres long et concentre trop de comportements. | Regression probable a chaque ajout de simulation. | Decouper par famille de simulations ou par `kind`, garder un runtime commun. |
| P2 | Moyen | Pages chapitre | Absence de fil d'Ariane complet dans les chapitres, seulement un retour. | Orientation moins claire pour eleves et enseignants. | Ajouter niveau > matiere > chapitre, avec `aria-current`. |
| P2 | Moyen | `src/styles/design-system.css` | Letter-spacing par defaut negatif et police OpenDyslexic chargee depuis CDN. | Lisibilite DYS discutable, dependance reseau externe. | Mettre `letter-spacing: 0` par defaut, heberger les polices localement. |
| P2 | Moyen | `src/layouts/BaseLayout.astro` | Google Tag Manager charge sur toutes les pages. | Performance, vie privee, blocage possible en contexte scolaire. | Charger avec consentement ou desactiver sur environnement scolaire/offline. |
| P2 | Moyen | `src/layouts/BaseLayout.astro` | Schema `SearchAction` pointe vers `/recherche`, route non observee dans `src/pages`. | Donnee structuree incoherente, UX casse si exposee. | Creer la route ou supprimer le `SearchAction`. |
| P3 | Faible | Plusieurs `exercices.json` de 4e | BOM UTF-8 dans quelques JSON. | Les outils stricts `JSON.parse` echouent sans nettoyage. | Normaliser l'encodage UTF-8 sans BOM. |
| P3 | Faible | Exercices 4e/5e | Certains schemas contiennent "Donnée 1", "...", "à compléter" sans vraie donnee. | Document d'appui peu utile, impression de contenu generique. | Remplacer par documents contextualises et exploitables. |

## 3. Audit pedagogique detaille

Probleme : la progression 5e est bien amorcee mais la validation BO reste incertaine.  
Exemple observe : les 8 chapitres 5e couvrent matiere, melanges, transformations, temps/mouvement, energie, electricite, lumiere, son. Cela correspond largement a l'extrait `cycle4_bo.txt`, mais pas a un BO officiel fourni.  
Consequence pour l'eleve : contenu probablement pertinent, mais risque de decalage si la reference officielle attendue differe.  
Correction proposee : rattacher chaque chapitre a une ligne de programme officielle et conserver une table de correspondance niveau/attendu/chapitre.

Probleme : les cours demarrent souvent par objectifs et definitions, mais rarement par une situation-probleme.  
Exemple observe : les cours 5e ont des objectifs clairs, mais peu d'accroches du type "Pourquoi voit-on une ombre ?" ou "Pourquoi une boisson gazeuse fait-elle des bulles ?".  
Consequence pour l'eleve : entree plus scolaire, moins ancree dans l'observation.  
Correction proposee : ajouter une courte situation initiale dans chaque cours, sans allonger fortement le texte.

Probleme : coherence cours-simulation insuffisante.  
Exemple observe : le laboratoire contient chronophotographie, melanges, chaines energetiques, loi d'Ohm, oscilloscope, pH, mais les chapitres associes ne les exploitent pas assez.  
Consequence pour l'eleve : la simulation devient une ressource separee, pas une etape d'apprentissage.  
Correction proposee : ajouter dans chaque cours un encadre "A manipuler" avec objectif, lien, consigne courte et question de sortie.

Probleme : differenciation encore faible.  
Exemple observe : exercices avec difficulte, quiz et flashcards existent, mais peu de "coup de pouce", methode pas a pas, version guidée ou approfondissement.  
Consequence pour l'eleve en difficulte : blocage possible devant les exercices de transfert.  
Correction proposee : ajouter pour chaque exercice complexe un indice masquable et une methode courte.

Probleme : documents d'appui parfois generiques.  
Exemple observe : certains schemas affichent des colonnes "Donnée 1", "Donnée 2", "...", ou des objets A/B sans contexte.  
Consequence pour l'eleve : l'exercice ressemble a un gabarit plutot qu'a une situation scientifique.  
Correction proposee : remplacer progressivement les schemas placeholders par documents vrais : mesure, tableau, observation, appareil, graphe.

Probleme : evaluation par competences absente ou implicite.  
Exemple observe : pas de tags visibles du type "observer", "mesurer", "raisonner", "calculer", "communiquer".  
Consequence pour l'enseignant : reutilisation plus difficile pour entrainement cible.  
Correction proposee : ajouter un champ `competences` dans les donnees d'exercices et les afficher sobrement.

## 4. Audit scientifique detaille

Risque : CO2 dissous et bulles.  
Pourquoi c'est problematique : le CO2 dissous n'est pas une bulle ; la bulle apparait quand du CO2 quitte la solution.  
Formulation corrigee : "Le dioxyde de carbone peut etre dissous dans l'eau. Dans une boisson gazeuse ouverte, une partie de ce CO2 redevient gaz et forme des bulles."  
Niveau concerne : 5e chimie.

Risque : energie presentee comme une substance.  
Pourquoi c'est problematique : "stock d'energie" est utile au cycle 4, mais peut faire croire que l'energie est une matiere contenue dans les objets.  
Formulation corrigee : "On modelise l'energie d'un systeme par un stock qui peut augmenter ou diminuer lors de transferts."  
Niveau concerne : 5e/4e.

Risque : niveau sonore en dB trop lineaire.  
Pourquoi c'est problematique : le decibel n'est pas une echelle proportionnelle simple.  
Formulation corrigee : "Le decibel est une echelle particuliere : une augmentation de quelques dB peut correspondre a une grande variation d'intensite physique."  
Niveau concerne : 5e pour vigilance, lycee pour rigueur.

Risque : titrage pH-metrique reduit a "milieu du saut".  
Pourquoi c'est problematique : c'est une methode scolaire simplifiee ; l'equivalence depend de l'exploitation de la courbe.  
Formulation corrigee : "On repere l'equivalence dans la zone de variation rapide du pH, par une methode graphique adaptee."  
Niveau concerne : lycee.

Risque : modeles astronomiques et saisons.  
Pourquoi c'est problematique : les representations planes et non a l'echelle peuvent renforcer l'idee fausse "ete = Terre plus proche du Soleil".  
Formulation corrigee : ajouter en permanence "distances non a l'echelle" et "les saisons viennent surtout de l'inclinaison de l'axe".  
Niveau concerne : college/lycee.

Risque : gaz parfaits et radioactivite.  
Pourquoi c'est problematique : particules et noyaux dessines peuvent etre pris au pied de la lettre ; la desintegration radioactive est aleatoire au niveau microscopique.  
Correction : ajouter badges "modele simplifie" et phrases de limite dans les readouts.  
Niveau concerne : lycee.

## 5. Audit des simulations

Source principale de verification : `docs/audit-simulations-laboratoire-2026-05-28.md`. Ce rapport indique 25/25 routes chargees, 25/25 tests desktop OK, 25/25 tests mobile OK, 0 erreur console applicative, aucun debordement horizontal mobile detecte.

### Circuit RC
Nom de la simulation : Circuit RC.  
Objectif annonce : charge/decharge d'un condensateur.  
Objectif reellement percu : comprendre constante de temps et evolution exponentielle.  
Qualite pedagogique : tres utile.  
Qualite scientifique : bonne.  
Qualite UX : bonne.  
Bugs eventuels : aucun bloquant signale.  
Risques de mauvaise comprehension : formule et graphe peuvent rester decorreles pour un eleve fragile.  
Corrections prioritaires : expliciter davantage tau sur la courbe.  
Ameliorations possibles : question guidee "que vaut uC a tau ?".  
Verdict : tres utile pedagogiquement.

### Lois de Kepler
Nom de la simulation : Lois de Kepler.  
Objectif annonce : orbites, aires, vitesse.  
Objectif reellement percu : relier excentricite, vitesse et aire balayee.  
Qualite pedagogique : tres utile.  
Qualite scientifique : bonne pour modele scolaire.  
Qualite UX : bonne.  
Bugs eventuels : aucun bloquant signale.  
Risques de mauvaise comprehension : echelle et systeme idealise.  
Corrections prioritaires : rappeler modele simplifie.  
Ameliorations possibles : comparer deux orbites cote a cote.  
Verdict : tres utile pedagogiquement.

### Gaz parfaits
Nom de la simulation : Gaz parfaits.  
Objectif annonce : influence de T, V, n sur la pression.  
Objectif reellement percu : visualiser le modele microscopique simplifie.  
Qualite pedagogique : tres utile.  
Qualite scientifique : bonne si la limite du modele est affichee.  
Qualite UX : bonne.  
Bugs eventuels : aucun bloquant signale.  
Risques de mauvaise comprehension : nombre de particules dessinees confondu avec quantite reelle.  
Corrections prioritaires : badge "particules symboliques".  
Ameliorations possibles : afficher l'equation PV = nRT dans le readout.  
Verdict : tres utile pedagogiquement.

### Diffusion et temperature
Nom de la simulation : Diffusion et temperature.  
Objectif annonce : observer l'effet de la temperature sur la diffusion.  
Objectif reellement percu : agitation plus forte quand la temperature augmente.  
Qualite pedagogique : utile.  
Qualite scientifique : correcte en modele qualitatif.  
Qualite UX : bonne.  
Bugs eventuels : aucun bloquant signale.  
Risques de mauvaise comprehension : diffusion assimilee a un simple melange mecanique.  
Corrections prioritaires : distinguer agitation thermique et action du melangeur.  
Ameliorations possibles : ajouter un scenario sans melangeur.  
Verdict : utile mais a ameliorer.

### Systeme solaire
Nom de la simulation : Systeme solaire.  
Objectif annonce : comparer planetes, vitesses, distances.  
Objectif reellement percu : explorer des ordres de grandeur compresses.  
Qualite pedagogique : utile.  
Qualite scientifique : acceptable avec avertissement d'echelle.  
Qualite UX : bonne.  
Bugs eventuels : aucun bloquant signale.  
Risques de mauvaise comprehension : tailles/distances prises pour une meme echelle.  
Corrections prioritaires : rendre le badge "echelles compressees" permanent en HTML, pas seulement visuel.  
Ameliorations possibles : mini-tableau distances/diametres reels.  
Verdict : utile mais a ameliorer.

### Melanges
Nom de la simulation : Melanges.  
Objectif annonce : observer melanges homogenes/heterogenes.  
Objectif reellement percu : differencier dissolution, miscibilite et separation visuelle.  
Qualite pedagogique : utile.  
Qualite scientifique : bonne pour college.  
Qualite UX : bonne.  
Bugs eventuels : aucun bloquant signale.  
Risques de mauvaise comprehension : croire que tout melange se juge uniquement a l'oeil.  
Corrections prioritaires : ajouter un lien vers filtration/decantation ou limite observation macroscopique.  
Ameliorations possibles : mission "choisis une technique de separation".  
Verdict : utile mais a ameliorer.

### Chronophotographie
Nom de la simulation : Chronophotographie.  
Objectif annonce : decrire un mouvement.  
Objectif reellement percu : relier ecarts successifs et vitesse.  
Qualite pedagogique : tres utile.  
Qualite scientifique : bonne.  
Qualite UX : bonne.  
Bugs eventuels : aucun bloquant signale.  
Risques de mauvaise comprehension : vitesse confondue avec trajectoire.  
Corrections prioritaires : afficher une phrase de diagnostic automatique.  
Ameliorations possibles : activite "classe uniforme/accelere/ralenti".  
Verdict : tres utile pedagogiquement.

### Chaines energetiques
Nom de la simulation : Chaines energetiques.  
Objectif annonce : distinguer energie utile et pertes.  
Objectif reellement percu : construire un bilan simple.  
Qualite pedagogique : tres utile pour college.  
Qualite scientifique : bonne.  
Qualite UX : bonne.  
Bugs eventuels : aucun bloquant signale.  
Risques de mauvaise comprehension : pertes vues comme energie disparue.  
Corrections prioritaires : afficher `energie recue = energie utile + pertes`.  
Ameliorations possibles : relier a un exercice 5e/4e.  
Verdict : tres utile pedagogiquement.

### Decroissance radioactive
Nom de la simulation : Decroissance radioactive.  
Objectif annonce : demi-vie et evolution du nombre de noyaux.  
Objectif reellement percu : evolution statistique d'une population.  
Qualite pedagogique : utile.  
Qualite scientifique : bonne si aleatoire explicite.  
Qualite UX : bonne.  
Bugs eventuels : aucun bloquant signale.  
Risques de mauvaise comprehension : penser qu'un noyau individuel a une "date prevue".  
Corrections prioritaires : rappeler aleatoire microscopique.  
Ameliorations possibles : comparer plusieurs tirages.  
Verdict : utile mais a ameliorer.

### Refraction
Nom de la simulation : Refraction.  
Objectif annonce : loi de Snell-Descartes et changement de milieu.  
Objectif reellement percu : visualiser normale, angles, deviation.  
Qualite pedagogique : tres utile.  
Qualite scientifique : bonne.  
Qualite UX : bonne.  
Bugs eventuels : aucun bloquant signale.  
Risques de mauvaise comprehension : angle mesure par rapport a la surface.  
Corrections prioritaires : maintenir la normale tres visible.  
Ameliorations possibles : quiz instantane sur le sens de deviation.  
Verdict : tres utile pedagogiquement.

### Lentilles convergentes
Nom de la simulation : Lentilles convergentes.  
Objectif annonce : construction d'image.  
Objectif reellement percu : relier position objet, focale, image reelle/virtuelle.  
Qualite pedagogique : utile.  
Qualite scientifique : bonne.  
Qualite UX : moyenne a bonne.  
Bugs eventuels : aucun bloquant signale.  
Risques de mauvaise comprehension : scene dense pour debutants.  
Corrections prioritaires : mode etape par etape avec un rayon ajoute a la fois.  
Ameliorations possibles : cacher/afficher rayons remarquables.  
Verdict : utile mais a ameliorer.

### Echelle de pH
Nom de la simulation : Echelle de pH.  
Objectif annonce : explorer pH, dilution, solutions.  
Objectif reellement percu : situer acide/neutre/basique et effet de dilution.  
Qualite pedagogique : utile.  
Qualite scientifique : bonne pour college/lycee introductif.  
Qualite UX : bonne.  
Bugs eventuels : aucun bloquant signale.  
Risques de mauvaise comprehension : pH assimile a couleur uniquement.  
Corrections prioritaires : donner une phrase quantitative selon niveau.  
Ameliorations possibles : scenario "diluer ne neutralise pas forcement".  
Verdict : utile mais a ameliorer.

### Oscilloscope
Nom de la simulation : Oscilloscope.  
Objectif annonce : frequence, amplitude, type de signal.  
Objectif reellement percu : lire une representation temporelle.  
Qualite pedagogique : tres utile.  
Qualite scientifique : bonne.  
Qualite UX : bonne.  
Bugs eventuels : aucun bloquant signale.  
Risques de mauvaise comprehension : confondre amplitude et frequence.  
Corrections prioritaires : ajouter double lecture "ce qui change / ce qui ne change pas".  
Ameliorations possibles : exercice de lecture de periode.  
Verdict : tres utile pedagogiquement.

### Diffraction et interferences
Nom de la simulation : Diffraction et interferences.  
Objectif annonce : relier longueur d'onde, ouverture/ecartement et figure.  
Objectif reellement percu : influence qualitative des parametres.  
Qualite pedagogique : utile.  
Qualite scientifique : bonne pour terminale si formule reliee.  
Qualite UX : bonne.  
Bugs eventuels : aucun bloquant signale.  
Risques de mauvaise comprehension : figure observee sans lien calculatoire.  
Corrections prioritaires : afficher la formule mobilisee selon le mode.  
Ameliorations possibles : lecture guidee de largeur de tache/interfrange.  
Verdict : utile mais a ameliorer.

### Lunette afocale
Nom de la simulation : Lunette afocale.  
Objectif annonce : comprendre foyer commun, image intermediaire, rayons paralleles.  
Objectif reellement percu : montage optique riche mais dense.  
Qualite pedagogique : moyenne.  
Qualite scientifique : bonne.  
Qualite UX : moyenne.  
Bugs eventuels : aucun bloquant signale.  
Risques de mauvaise comprehension : l'eleve voit beaucoup de rayons sans comprendre la sequence.  
Corrections prioritaires : progression guidee en 3 etapes : objectif, image intermediaire, oculaire.  
Ameliorations possibles : afficher clairement le rapport `f1'/f2'`.  
Verdict : utile mais a ameliorer en P1.

### Poids vs masse
Nom de la simulation : Poids vs masse.  
Objectif annonce : distinguer masse constante et poids variable.  
Objectif reellement percu : comparaison claire mais animation trop statique.  
Qualite pedagogique : moyenne.  
Qualite scientifique : bonne.  
Qualite UX : bonne.  
Bugs eventuels : aucun bloquant signale.  
Risques de mauvaise comprehension : l'eleve retient une affiche, pas une mesure dynamique.  
Corrections prioritaires : renforcer l'etirement du dynamometre et la transition entre astres.  
Ameliorations possibles : clic direct sur les astres du graphe.  
Verdict : utile mais a ameliorer en P1.

### Loi d'Ohm
Nom de la simulation : Loi d'Ohm.  
Objectif annonce : relier tension, intensite, resistance.  
Objectif reellement percu : lecture directe de proportionnalite.  
Qualite pedagogique : tres utile.  
Qualite scientifique : bonne.  
Qualite UX : bonne.  
Bugs eventuels : aucun bloquant signale.  
Risques de mauvaise comprehension : U/I/R manipules sans unite si l'eleve ne lit pas le readout.  
Corrections prioritaires : renforcer les unites dans les controles.  
Ameliorations possibles : mode "prevoir avant de calculer".  
Verdict : tres utile pedagogiquement.

### Puissance et energie
Nom de la simulation : Puissance et energie.  
Objectif annonce : relier puissance, duree, energie.  
Objectif reellement percu : calculer une energie consommee.  
Qualite pedagogique : utile.  
Qualite scientifique : bonne.  
Qualite UX : bonne.  
Bugs eventuels : aucun bloquant signale.  
Risques de mauvaise comprehension : confusion energie/puissance persistante.  
Corrections prioritaires : phrase contraste "puissance = rythme, energie = total".  
Ameliorations possibles : comparer deux appareils sur une meme duree.  
Verdict : utile mais a ameliorer.

### Bilans thermiques
Nom de la simulation : Bilans thermiques.  
Objectif annonce : transferts thermiques et equilibre.  
Objectif reellement percu : tendre vers une temperature finale.  
Qualite pedagogique : utile.  
Qualite scientifique : moyenne a bonne selon hypotheses.  
Qualite UX : bonne.  
Bugs eventuels : aucun bloquant signale.  
Risques de mauvaise comprehension : moyenne simple si masses/capacites non explicitees.  
Corrections prioritaires : afficher les hypotheses du bilan.  
Ameliorations possibles : faire varier masses et capacites.  
Verdict : utile mais a ameliorer.

### Titrage pH-metrique
Nom de la simulation : Titrage pH-metrique.  
Objectif annonce : reperer equivalence sur un saut de pH.  
Objectif reellement percu : lire une zone de variation rapide.  
Qualite pedagogique : utile.  
Qualite scientifique : correcte mais methode trop implicite.  
Qualite UX : bonne.  
Bugs eventuels : aucun bloquant signale.  
Risques de mauvaise comprehension : "equivalence = milieu visuel du saut" applique sans methode.  
Corrections prioritaires : ajouter methode graphique explicite.  
Ameliorations possibles : mode tangentes / derivee qualitative.  
Verdict : utile mais a ameliorer.

### Titrage conductimetrique
Nom de la simulation : Titrage conductimetrique.  
Objectif annonce : reperer l'intersection de deux portions de droite.  
Objectif reellement percu : comprendre changement de pente.  
Qualite pedagogique : utile.  
Qualite scientifique : bonne si especes explicitees.  
Qualite UX : bonne.  
Bugs eventuels : aucun bloquant signale.  
Risques de mauvaise comprehension : intersection vue comme pure astuce graphique.  
Corrections prioritaires : relier pente aux ions presents.  
Ameliorations possibles : afficher tableau avant/apres equivalence.  
Verdict : utile mais a ameliorer.

### Tests d'ions
Nom de la simulation : Tests d'ions.  
Objectif annonce : relier ion, reactif, observation.  
Objectif reellement percu : memoriser des tests.  
Qualite pedagogique : utile.  
Qualite scientifique : correcte si reactifs/precipites sont complets.  
Qualite UX : bonne.  
Bugs eventuels : aucun bloquant signale.  
Risques de mauvaise comprehension : couleur du precipite apprise sans equation/ion test.  
Corrections prioritaires : tableau reactif/ion/observation.  
Ameliorations possibles : mode inconnu a identifier.  
Verdict : utile mais a ameliorer.

### Mole et pesee
Nom de la simulation : Mole et pesee.  
Objectif annonce : comprendre `n = m / M`.  
Objectif reellement percu : voir l'effet de la masse molaire.  
Qualite pedagogique : tres utile.  
Qualite scientifique : bonne.  
Qualite UX : bonne.  
Bugs eventuels : aucun bloquant signale.  
Risques de mauvaise comprehension : masse molaire atomique/moleculaire pas toujours distinguee.  
Corrections prioritaires : info-bulle courte.  
Ameliorations possibles : proposer une espece composee et decomposer M.  
Verdict : tres utile pedagogiquement.

### Simulateur de saisons
Nom de la simulation : Simulateur de saisons.  
Objectif annonce : relier saisons et inclinaison terrestre.  
Objectif reellement percu : observer effet hemisphere/jour/inclinaison.  
Qualite pedagogique : utile.  
Qualite scientifique : bonne.  
Qualite UX : bonne.  
Bugs eventuels : aucun bloquant signale.  
Risques de mauvaise comprehension : orbite plane pouvant relancer l'explication par la distance au Soleil.  
Corrections prioritaires : message permanent "ce n'est pas la distance qui explique les saisons".  
Ameliorations possibles : comparaison simultanee Nord/Sud.  
Verdict : utile mais a ameliorer.

### Escape energie
Nom de la simulation : Escape energie.  
Objectif annonce : reconstituer une chaine energetique.  
Objectif reellement percu : mini-jeu de revision guidee.  
Qualite pedagogique : utile en consolidation.  
Qualite scientifique : correcte.  
Qualite UX : bonne.  
Bugs eventuels : aucun bloquant signale.  
Risques de mauvaise comprehension : activite prise pour une simulation de modele physique.  
Corrections prioritaires : l'assumer comme jeu de revision.  
Ameliorations possibles : feedback conceptuel apres chaque mission.  
Verdict : jolie et utile, mais pedagogiquement moins structurante qu'une simulation.

## 6. Audit UX

Navigation generale : claire par niveau et matiere, mais les pages chapitre manquent d'un fil d'Ariane complet. Le bouton retour ne suffit pas pour un eleve qui arrive depuis Google ou un lien direct.

Architecture de l'information : le decoupage cours/exercices/quiz/flashcards est lisible. En revanche, les simulations sont trop separees du parcours de cours.

Risque de perte utilisateur : laboratoire riche mais catalogue assez large ; sans recommandations par chapitre, un enseignant ou un eleve doit deviner quelle simulation utiliser.

Correction recommandee : ajouter sur les pages chapitre un bloc "Ressources associees" et sur chaque simulation un bloc "Chapitres relies".

## 7. Audit UI / design

Le design est coherent mais encore tres "carte + badge + emoji". Cela fonctionne pour une plateforme scolaire, mais peut donner un aspect moins professionnel sur certaines pages.

Palette : dominante bleu/violet assez presente ; acceptable, mais attention a l'effet monotone. Les simulations gagneraient a avoir des miniatures ou apercus scientifiques plutot que des icones decoratives.

Typographie : bonne base, mais le letter-spacing negatif par defaut est a corriger. Les titres sont parfois propres, parfois affaiblis par des fautes d'accents dans les donnees.

Direction artistique recommandee : conserver l'identite claire actuelle, reduire les emojis comme marqueurs principaux, privilegier pictogrammes scientifiques sobres, mini-apercus de simulations, et encadres methodes plus uniformes.

## 8. Audit accessibilite

Points positifs : `lang="fr"`, focus global, panneau d'accessibilite, `aria-live` dans certaines simulations, canvas avec `aria-label`, SVG de cours souvent titres/decrits.

Problemes eleves :
- schemas d'exercices essentiels marques `aria-hidden` ;
- donnees de simulation souvent uniquement dans le canvas ;
- absence probable d'alternatives tabulaires pour les graphes ;
- dependance a la couleur dans certains graphes et jauges ;
- liens/boutons parfois comprehensibles visuellement mais pas toujours hors contexte ;
- letter-spacing negatif par defaut.

Correction recommandee : traiter d'abord les contenus indispensables a la reponse de l'eleve : document d'exercice, graphe, valeur mesuree, consigne, feedback.

## 9. Audit responsive

Le rapport laboratoire existant indique aucun debordement horizontal mobile detecte sur les 25 simulations. Les risques restants sont surtout ergonomiques :
- canvas hauts sur petit smartphone ;
- tableaux de cours lisibles mais dependants du scroll ;
- menus qui peuvent prendre beaucoup de hauteur ;
- zones tactiles a surveiller dans les controles de simulations.

Correction recommandee : tester systematiquement 390 px et 320 px sur les chapitres avec tableaux, SVG et exercices.

## 10. Audit performance

Le build est sain mais plusieurs couts sont evitables :
- Google Tag Manager charge globalement ;
- polices distantes Google Fonts et jsdelivr ;
- gros chunks React/MathText et simulateur generique ;
- `generic-lab-simulator.js` embarque beaucoup de simulations dans un seul fichier.

Correction recommandee : localiser les polices, charger l'analytics avec consentement, decouper les simulations generiques, et mesurer Lighthouse sur mobile moyen.

## 11. Audit code et maintenabilite

Points solides :
- architecture data-driven pour les chapitres ;
- conventions de fichiers assez regulieres ;
- composants pedagogiques reutilisables ;
- build statique adapte a un site educatif.

Points faibles :
- instructions `AGENTS.md` encore centrees sur une ancienne structure `college/5eme/...` alors que le code actif est dans `src/data/chapters/...` ;
- dette importante dans `generic-lab-simulator.js` ;
- styles inline nombreux dans plusieurs composants React ;
- contenus terminale injectes via `RawHtml`, ce qui contourne une partie des garanties MDX ;
- donnees JSON avec BOM dans quelques fichiers ;
- duplication de schemas d'exercices generiques.

Correction recommandee : ne pas refondre tout le site ; creer d'abord une couche de qualite autour des donnees : validation JSON, lint contenu, rapport d'accessibilite des SVG, test build, test liens internes.

## 12. Audit SEO et partage

Problemes :
- les `meta.json` contiennent des donnees SEO mais les pages chapitre ne les utilisent pas ;
- schema `EducationalContent` prevu dans `BaseLayout` mais non active pour les chapitres ;
- `SearchAction` pointe vers `/recherche` sans route observee ;
- favicon principal OK, mais `BaseLayout` reference `/favicon-32x32.png` alors que le fichier public visible est dans `public/favicon/favicon-96x96.png` et autres variantes ;
- commentaire `CHANGE PAR TON DOMAINE` restant dans `astro.config.mjs`.

Corrections simples :
- connecter `meta.seo.meta_description`, `canonical`, `schema_type` au layout ;
- creer ou retirer `/recherche` ;
- aligner les chemins favicons ;
- enrichir les schemas EducationalContent avec niveau, matiere, chapitre ;
- verifier sitemap et robots apres correction.

## 13. Plan d'action recommande

### P0 - Fiabiliser la reference
1. Ajouter le `BO.pdf` officiel ou documenter explicitement la source retenue.
2. Creer une table de correspondance programme -> chapitres.

### P1 - Corriger les risques utilisateur
1. Rendre accessibles les schemas d'exercices.
2. Ajouter des resumes HTML synchronises aux simulations canvas.
3. Brancher les metadonnees SEO des chapitres.
4. Ajouter liens cours -> simulations -> exercices.
5. Corriger les formulations scientifiques et fautes visibles de 5e.

### P2 - Ameliorer la coherence pedagogique
1. Ajouter situations-problemes et objectifs operationnels courts.
2. Ajouter coups de pouce et competences aux exercices.
3. Ajouter fil d'Ariane complet dans les chapitres.
4. Harmoniser les documents d'appui.

### P3 - Reduire la dette technique
1. Decouper progressivement le simulateur generique.
2. Localiser polices et revoir analytics.
3. Nettoyer encodages BOM.
4. Mettre en place audits automatises : build, liens, accessibilite basique, validation JSON.

## 14. Fichiers crees ou modifies

Fichier cree :
- `docs/audit-site-global-2026-05-29.md`

Fichiers du site modifies :
- aucun.

Points restant a harmoniser :
- confirmer la version officielle du programme ;
- relancer un audit navigateur complet apres corrections ;
- verifier visuellement les pages chapitre 5e une par une sur mobile ;
- faire une passe orthographique et typographique sur toutes les donnees JSON/MDX.
