# Audit complet des simulations du laboratoire

Date : 28 mai 2026  
Périmètre : toutes les routes déclarées dans `src/data/laboratoire/apps.ts`  
Méthode : test réel dans le navigateur local `http://127.0.0.1:4321`, en desktop `1280x900` et mobile `390x844`.

## Synthèse exécutive

25 simulations ont été inventoriées et testées réellement. Les 25 routes se chargent, disposent d'un canvas ou d'une scène interactive, répondent aux curseurs/boutons/menus testés, et ne produisent pas d'erreur JavaScript applicative. Aucun débordement horizontal mobile n'a été détecté.

Le laboratoire est globalement sain techniquement. Le point faible principal n'est plus le bug bloquant : c'est la clarté pédagogique différenciée selon les simulations. Les simulations déjà reprises récemment sont nettement meilleures : RC, Kepler, diffraction/interférences, diffusion/température, système solaire, mélanges, lunette afocale, poids/masse, réfraction, lentilles, oscilloscope. Les prochaines améliorations à fort bénéfice concernent surtout la lisibilité de quelques modèles encore trop abstraits ou trop peu animés.

## Preuves de test

- Résultats automatisés : `tmp/audit-lab-2026-05-28/audit-results.json`
- Synthèse JSON : `tmp/audit-lab-2026-05-28/summary.json`
- Captures mobile des zones interactives : `tmp/audit-lab-2026-05-28/stage-mobile/`
- Planche de contrôle mobile : `tmp/audit-lab-2026-05-28/contact-stage-mobile.png`

Remarque technique : l'avertissement Chrome `Canvas2D: Multiple readback operations...` observé pendant l'audit vient de l'outil de contrôle qui échantillonne les pixels du canvas avec `getImageData`. Il ne correspond pas à une erreur de l'application.

## Inventaire des simulations

| Animation | Route | Fichiers principaux | Thème | Niveau probable | Interaction | Objectif pédagogique apparent |
|---|---|---|---|---|---|---|
| Dipôle RC série | `/laboratoire/circuit-rc` | `circuit-rc.astro`, `circuit-rc.js`, `global-lab.css` | Électricité | Terminale spécialité | sliders E/R/C/vitesse/temps, mode charge-décharge, affichage courbes | Relier charge/décharge du condensateur à `tau = R x C`. |
| Lois de Kepler | `/laboratoire/lois-kepler` | `lois-kepler.astro`, `lois-kepler.js`, `global-lab.css` | Mouvement, gravitation | Terminale spécialité | demi-grand axe, excentricité, vitesse, mesure d'aires | Vérifier loi des aires et `T²/a³`. |
| Modèle des gaz parfaits | `/laboratoire/gaz-parfaits` | `gaz-parfaits.astro`, `gaz-parfaits.js`, `global-lab.css` | Thermodynamique | Terminale spécialité | température, volume, quantité, animation de particules | Comprendre `P V = n R T`. |
| Diffusion et température | `/laboratoire/diffusion-temperature` | `diffusion-temperature.astro`, `diffusion-temperature.js`, `global-lab.css` | Matière | Collège/Lycée | température, colorant, goutte, agitation | Comparer diffusion thermique et brassage mécanique. |
| Système solaire | `/laboratoire/systeme-solaire` | `[slug].astro`, `GenericLabSimulator.astro`, `generic-lab-simulator.js`, configs | Astronomie, gravitation | Collège | vitesse, échelle, planète suivie | Comparer distances orbitales et périodes. |
| Labo des mélanges | `/laboratoire/melanges` | générique | Matière | Collège | quantité, agitation, type de mélange | Distinguer solution, dépôt, émulsion, miscibilité. |
| Chronophotographie | `/laboratoire/chronophotographie` | générique | Mouvement | Collège/Lycée | vitesse initiale, variation des écarts, type de mouvement | Identifier uniforme, accéléré, ralenti. |
| Chaînes énergétiques | `/laboratoire/chaines-energetiques` | générique | Énergie | Collège | rendement, puissance, convertisseur | Distinguer énergie utile et pertes. |
| Décroissance radioactive | `/laboratoire/decroissance-radioactive` | générique | Noyaux | Lycée | demi-vie, nombre de noyaux, affichage | Comprendre la décroissance exponentielle et la demi-vie. |
| Réfraction de la lumière | `/laboratoire/refraction-lumiere` | générique | Optique | Collège/Lycée | angle, indice, milieu | Visualiser Snell-Descartes. |
| Lentilles et images | `/laboratoire/lentilles-images` | générique | Optique | Lycée | distance objet, focale, repère | Construire image réelle/virtuelle. |
| Laboratoire du pH | `/laboratoire/ph` | générique | Acide-base | Collège/Lycée | pH initial, dilution, solution | Classer acide/neutre/basique. |
| Oscilloscope | `/laboratoire/oscilloscope` | générique | Signaux | Collège/Lycée | fréquence, amplitude, signal | Lire amplitude, période, fréquence. |
| Diffraction et interférences | `/laboratoire/diffraction-interferences` | générique | Ondes | Terminale spécialité | longueur d'onde, largeur/écartement, figure | Relier ouverture, longueur d'onde et figure observée. |
| Lunette afocale | `/laboratoire/lunette-afocale` | générique | Optique | Terminale spécialité | focales, vue optique | Comprendre foyer commun, image intermédiaire, rayons parallèles. |
| Poids vs masse | `/laboratoire/poids-masse` | générique | Gravitation | Collège | masse, g, astre | Distinguer masse constante et poids variable. |
| Loi d'Ohm | `/laboratoire/loi-ohm` | générique | Électricité | Collège/Lycée | résistance, intensité, affichage | Montrer `U = R x I`. |
| Puissance et énergie | `/laboratoire/puissance-energie` | générique | Énergie | Collège/Lycée | puissance, durée, appareil | Visualiser `E = P x t`. |
| Bilans thermiques | `/laboratoire/bilans-thermiques` | générique | Thermique | Lycée | températures, contact | Identifier le sens du transfert thermique. |
| Titrage pH-métrique | `/laboratoire/titrage-ph-metrique` | générique | Titrage | Lycée | volume versé, équivalence, mode | Repérer l'équivalence sur un saut de pH. |
| Titrage conductimétrique | `/laboratoire/titrage-conductimetrique` | générique | Titrage | Lycée | volume versé, équivalence, mode | Repérer l'intersection des deux portions de droite. |
| Enquête des ions | `/laboratoire/test-ions` | générique | Tests chimiques | Collège/Lycée | concentration, gouttes, ion | Associer réactif, précipité et ion. |
| Mole et pesée | `/laboratoire/mole-pesee` | générique | Quantité de matière | Lycée | masse, masse molaire, espèce | Comprendre `n = m / M`. |
| Simulateur de saisons | `/laboratoire/simulateur-saisons` | générique | Astronomie | Collège/Lycée | jour, inclinaison, hémisphère | Relier saisons et inclinaison terrestre. |
| Escape énergie | `/laboratoire/escape-energie` | générique | Énergie | Collège | indice, énergie utile, mission | Reconstituer une chaîne énergétique. |

## Résultat technique global

| Critère | Résultat |
|---|---|
| Routes chargées | 25/25 |
| Tests desktop | 25/25 OK |
| Tests mobile | 25/25 OK |
| Canvas/scène détecté | 25/25 |
| Erreurs console applicatives | 0 |
| Débordement horizontal mobile | 0 |
| Boutons testés | OK, aucun blocage détecté |
| Curseurs testés | OK, valeurs restaurées après test |
| Menus testés | OK, changement/restauration détectés |
| Reset | Présent sur les simulations génériques et pages dédiées testées |

## Classement global

| Animation | État actuel | Gravité | Clarté pédagogique | UX/UI | Fiabilité technique | Priorité globale |
|---|---|---:|---:|---:|---:|---|
| Dipôle RC série | OK | P3 | Très bonne | Très bonne | Très bonne | Basse |
| Lois de Kepler | OK | P3 | Très bonne | Bonne | Très bonne | Basse |
| Gaz parfaits | OK | P3 | Bonne | Bonne | Très bonne | Basse |
| Diffusion et température | OK | P2 | Bonne | Bonne | Très bonne | Moyenne |
| Système solaire | OK | P2 | Bonne | Très bonne | Très bonne | Moyenne |
| Labo des mélanges | OK | P2 | Bonne | Bonne | Très bonne | Moyenne |
| Chronophotographie | OK | P3 | Très bonne | Bonne | Très bonne | Basse |
| Chaînes énergétiques | OK | P3 | Très bonne | Bonne | Très bonne | Basse |
| Décroissance radioactive | OK | P3 | Bonne | Bonne | Très bonne | Basse |
| Réfraction de la lumière | OK | P3 | Très bonne | Bonne | Très bonne | Basse |
| Lentilles et images | OK | P2 | Bonne | Bonne | Très bonne | Moyenne |
| Laboratoire du pH | OK | P3 | Très bonne | Bonne | Très bonne | Basse |
| Oscilloscope | OK | P3 | Très bonne | Très bonne | Très bonne | Basse |
| Diffraction et interférences | OK | P2 | Bonne | Bonne | Très bonne | Moyenne |
| Lunette afocale | À améliorer | P1 | Moyenne | Moyenne | Très bonne | Haute |
| Poids vs masse | À améliorer | P1 | Moyenne | Bonne | Très bonne | Haute |
| Loi d'Ohm | OK | P2 | Bonne | Bonne | Très bonne | Moyenne |
| Puissance et énergie | OK | P3 | Bonne | Bonne | Très bonne | Basse |
| Bilans thermiques | OK | P2 | Bonne | Bonne | Très bonne | Moyenne |
| Titrage pH-métrique | À améliorer | P2 | Moyenne | Bonne | Très bonne | Moyenne |
| Titrage conductimétrique | À améliorer | P2 | Moyenne | Bonne | Très bonne | Moyenne |
| Enquête des ions | OK | P2 | Bonne | Bonne | Très bonne | Moyenne |
| Mole et pesée | OK | P3 | Très bonne | Bonne | Très bonne | Basse |
| Simulateur de saisons | À améliorer | P2 | Bonne | Bonne | Très bonne | Moyenne |
| Escape énergie | À améliorer | P2 | Moyenne | Bonne | Très bonne | Moyenne |

## Fiches d'audit par animation

### Dipôle RC série

Emplacement : `/laboratoire/circuit-rc` ; fichiers `circuit-rc.astro`, `circuit-rc.js`.  
Test réel : charge/décharge, pause, reset, sliders E/R/C/vitesse/temps, cases courbes, desktop/mobile, console.

Diagnostic : modèle exponentiel cohérent, `tau = R x C`, repère `5 tau`, tensions `uC/uR` et mouvement des électrons maintenant lisibles. L'élève comprend quoi manipuler et quoi observer.  
Priorités :

| Priorité | Problème | Impact élève | Correction proposée | Statut |
|---|---|---|---|---|
| P3 | Beaucoup d'informations simultanées sur mobile | Lecture un peu dense | Replier les détails avancés dans un panneau optionnel | Reste |

### Lois de Kepler

Emplacement : `/laboratoire/lois-kepler` ; fichiers `lois-kepler.astro`, `lois-kepler.js`.  
Test réel : a, e, vitesse, mesure d'aires, effacement, reset, desktop/mobile, console.

Diagnostic : les aires comparées pour une même durée sont cohérentes ; la planète accélère près du Soleil ; `T²/a³` est stable dans le modèle. L'expérience est claire et scientifiquement acceptable.  
Priorités :

| Priorité | Problème | Impact élève | Correction proposée | Statut |
|---|---|---|---|---|
| P3 | La notion de durée égale pourrait être encore plus visible | Certains élèves peuvent regarder seulement la forme des secteurs | Ajouter un petit compteur `Δt identique` dans la scène | Reste |

### Modèle des gaz parfaits

Emplacement : `/laboratoire/gaz-parfaits` ; fichiers `gaz-parfaits.astro`, `gaz-parfaits.js`.  
Test réel : température, volume, quantité de matière, lancer/pause/reset, desktop/mobile, console.

Diagnostic : conversion Celsius/Kelvin correcte, pression calculée avec `PV = nRT`, piston et particules cohérents. Le modèle reste microscopique simplifié, mais pédagogiquement acceptable.  
Priorités :

| Priorité | Problème | Impact élève | Correction proposée | Statut |
|---|---|---|---|---|
| P2 | Le lien entre chocs microscopiques et pression peut rester abstrait | Compréhension partielle | Ajouter un repère visuel sur les collisions contre le piston | Reste |

### Diffusion et température

Emplacement : `/laboratoire/diffusion-temperature` ; fichiers `diffusion-temperature.astro`, `diffusion-temperature.js`.  
Test réel : dépôt de goutte, température, colorant, mélangeur, lancer/pause, reset, desktop/mobile, console.

Diagnostic : distinction diffusion seule/brassage mécanique claire. Scientifiquement correct pour une vulgarisation. Le point à surveiller reste la compréhension de l'agitation thermique : un élève peut confondre diffusion et mélange volontaire.  
Priorités :

| Priorité | Problème | Impact élève | Correction proposée | Statut |
|---|---|---|---|---|
| P2 | Agitation thermique microscopique encore peu visible avant dépôt | Le phénomène peut sembler magique | Afficher quelques micro-trajectoires discrètes dans l'eau au repos | Reste |

### Système solaire

Emplacement : `/laboratoire/systeme-solaire` ; fichiers génériques.  
Test réel : vitesse, échelle, changement de planète, reset, desktop/mobile, console.

Diagnostic : scène lisible, cartes planète utiles, distances explicitement compressées. Modèle acceptable pour collège si l'on insiste sur l'échelle non réelle à l'écran.  
Priorités :

| Priorité | Problème | Impact élève | Correction proposée | Statut |
|---|---|---|---|---|
| P2 | Risque de croire que les tailles/distances sont à la même échelle | Mauvaise représentation astronomique | Garder un badge permanent `échelles compressées` dans le canvas | Reste |

### Labo des mélanges

Emplacement : `/laboratoire/melanges` ; fichiers génériques.  
Test réel : quantité, agitation, types de mélanges, reset, desktop/mobile, console.

Diagnostic : les cas homogène/hétérogène sont compréhensibles. L'huile/eau et les vibrations améliorent l'observation, mais il faut éviter que l'agitation donne l'impression d'une miscibilité durable.  
Priorités :

| Priorité | Problème | Impact élève | Correction proposée | Statut |
|---|---|---|---|---|
| P2 | Émulsion temporaire à rendre encore plus explicite après arrêt | Confusion miscible/émulsion | Ajouter un retour visuel de séparation progressive au repos | Reste |

### Chronophotographie

Emplacement : `/laboratoire/chronophotographie` ; fichiers génériques.  
Test réel : vitesse, variation d'écarts, type de mouvement, reset, desktop/mobile, console.

Diagnostic : très bonne simulation de lecture des espacements à intervalles de temps égaux. Vocabulaire adapté, surcharge faible.  
Priorités :

| Priorité | Problème | Impact élève | Correction proposée | Statut |
|---|---|---|---|---|
| P3 | Les valeurs de vitesse restent qualitatives | Peu gênant | Ajouter une option `vecteurs vitesse` | Reste |

### Chaînes énergétiques

Emplacement : `/laboratoire/chaines-energetiques` ; fichiers génériques.  
Test réel : rendement, puissance, convertisseur, reset, desktop/mobile, console.

Diagnostic : très lisible pour collège. Le partage utile/pertes est clair, avec un bon lien entre puissance reçue, utile et pertes.  
Priorités :

| Priorité | Problème | Impact élève | Correction proposée | Statut |
|---|---|---|---|---|
| P3 | Pas de bilan numérique complet sous forme `reçue = utile + pertes` | Détail | Ajouter une ligne de calcul optionnelle | Reste |

### Décroissance radioactive

Emplacement : `/laboratoire/decroissance-radioactive` ; fichiers génériques.  
Test réel : demi-vie, noyaux initiaux, modes d'affichage, lancer/reset, desktop/mobile, console.

Diagnostic : modèle exponentiel lisible, division par deux bien mise en évidence. Simulation correcte pour une introduction lycée.  
Priorités :

| Priorité | Problème | Impact élève | Correction proposée | Statut |
|---|---|---|---|---|
| P3 | Le caractère aléatoire microscopique est peu discuté | Peut faire croire à une désintégration parfaitement régulière noyau par noyau | Ajouter une phrase courte `aléatoire à l'échelle d'un noyau` | Reste |

### Réfraction de la lumière

Emplacement : `/laboratoire/refraction-lumiere` ; fichiers génériques.  
Test réel : angle, indice, milieu, reset, desktop/mobile, console.

Diagnostic : loi de Snell-Descartes cohérente, normale visible, angles lisibles, statut `vers la normale` utile. Bon niveau de clarté.  
Priorités :

| Priorité | Problème | Impact élève | Correction proposée | Statut |
|---|---|---|---|---|
| P3 | Réflexion totale à mieux scénariser | Enrichissement lycée | Ajouter un mini-défi : trouver l'angle limite | Reste |

### Lentilles et images

Emplacement : `/laboratoire/lentilles-images` ; fichiers génériques.  
Test réel : distance objet, focale, repères, reset, desktop/mobile, console.

Diagnostic : construction optique correcte, foyers et `2F` utiles, image réelle/virtuelle indiquée. La scène reste dense pour des élèves qui découvrent les rayons remarquables.  
Priorités :

| Priorité | Problème | Impact élève | Correction proposée | Statut |
|---|---|---|---|---|
| P2 | Trois rayons/repères peuvent surcharger le premier contact | Certains élèves ne savent plus où regarder | Ajouter un mode progressif `1 rayon`, `2 rayons`, `construction complète` | Reste |

### Laboratoire du pH

Emplacement : `/laboratoire/ph` ; fichiers génériques.  
Test réel : pH, dilution, solution repère, reset, desktop/mobile, console.

Diagnostic : très clair. La dilution vers pH 7 est représentée sans ambiguïté et les zones acide/neutre/basique sont lisibles.  
Priorités :

| Priorité | Problème | Impact élève | Correction proposée | Statut |
|---|---|---|---|---|
| P3 | La dilution d'une base et d'un acide pourrait être comparée côte à côte | Enrichissement | Ajouter un double exemple optionnel | Reste |

### Oscilloscope

Emplacement : `/laboratoire/oscilloscope` ; fichiers génériques.  
Test réel : fréquence, amplitude, type de signal, lancer/reset, desktop/mobile, console.

Diagnostic : très bonne lisibilité depuis les dernières améliorations. Amplitude, période et fréquence sont directement visibles dans l'écran.  
Priorités :

| Priorité | Problème | Impact élève | Correction proposée | Statut |
|---|---|---|---|---|
| P3 | Pas de réglage de sensibilité verticale/horizontale | Enrichissement lycée | Ajouter `V/div` et `s/div` dans une version avancée | Reste |

### Diffraction et interférences

Emplacement : `/laboratoire/diffraction-interferences` ; fichiers génériques.  
Test réel : longueur d'onde, largeur/écartement, mode, reset, desktop/mobile, console.

Diagnostic : zone interactive maintenant lisible et centrée sur l'écran. La tache centrale et l'interfrange sont mieux nommées. Le modèle est qualitatif mais acceptable pour une activité d'observation.  
Priorités :

| Priorité | Problème | Impact élève | Correction proposée | Statut |
|---|---|---|---|---|
| P2 | Les formules `theta ~ lambda/a` et `i = lambda D/a` ne sont pas explicitement reliées aux curseurs | L'élève observe sans toujours formaliser | Ajouter une mini-carte formule contextualisée | Reste |

### Lunette afocale

Emplacement : `/laboratoire/lunette-afocale` ; fichiers génériques.  
Test réel : focales objectif/oculaire, vues, reset, desktop/mobile, console.

Diagnostic : scientifiquement cohérent, mais encore chargé visuellement. Beaucoup de rayons, foyers et labels sont présents ; c'est juste, mais l'élève de Terminale peut mettre plus de 20 secondes à savoir quoi regarder.  
Priorités :

| Priorité | Problème | Impact élève | Correction proposée | Statut |
|---|---|---|---|---|
| P1 | Construction trop dense en vue complète | Compréhension ralentie | Ajouter une progression guidée en 3 étapes : objectif, image intermédiaire, oculaire | Reste |
| P2 | Grossissement pas assez relié à `f1'/f2'` dans la scène | Lien calcul/figure fragile | Afficher le rapport des angles dans le canvas | Reste |

### Poids vs masse

Emplacement : `/laboratoire/poids-masse` ; fichiers génériques.  
Test réel : masse, g, astre, lancer/reset, desktop/mobile, console.

Diagnostic : scientifiquement correct : masse constante, poids proportionnel à `g`. Le problème restant est pédagogique/animatoire : la scène est claire mais l'animation peut paraître encore trop statique pour une simulation.  
Priorités :

| Priorité | Problème | Impact élève | Correction proposée | Statut |
|---|---|---|---|---|
| P1 | Animation du dynamomètre encore trop discrète | L'élève voit surtout une illustration | Renforcer l'étirement dynamique du ressort et la transition entre astres | Reste |
| P2 | Comparaison graphique utile mais peu interactive | Engagement limité | Permettre de cliquer un astre dans le graphe pour l'appliquer | Reste |

### Loi d'Ohm

Emplacement : `/laboratoire/loi-ohm` ; fichiers génériques.  
Test réel : résistance, intensité, mode, reset, desktop/mobile, console.

Diagnostic : relation `U = R x I` correcte. Le point sur la droite et le circuit donnent un bon lien entre calcul et mesure.  
Priorités :

| Priorité | Problème | Impact élève | Correction proposée | Statut |
|---|---|---|---|---|
| P2 | Manque une vraie lecture voltmètre/ampèremètre en mode circuit | Lien expérimental perfectible | Ajouter instruments avec valeurs en temps réel | Reste |

### Puissance et énergie

Emplacement : `/laboratoire/puissance-energie` ; fichiers génériques.  
Test réel : puissance, durée, appareil, reset, desktop/mobile, console.

Diagnostic : modèle `E = P x t` clair, animation de remplissage efficace. Les unités sont compréhensibles.  
Priorités :

| Priorité | Problème | Impact élève | Correction proposée | Statut |
|---|---|---|---|---|
| P3 | Conversion Wh/kWh/J pas encore exploitée pédagogiquement | Enrichissement | Ajouter un sélecteur d'unité | Reste |

### Bilans thermiques

Emplacement : `/laboratoire/bilans-thermiques` ; fichiers génériques.  
Test réel : températures, mode de contact, reset, desktop/mobile, console.

Diagnostic : sens du transfert chaud vers froid bien mis en avant. Modèle qualitatif correct.  
Priorités :

| Priorité | Problème | Impact élève | Correction proposée | Statut |
|---|---|---|---|---|
| P2 | Équilibre thermique final peu quantifié | Compréhension incomplète pour lycée | Ajouter une estimation de température d'équilibre dans les cas simples | Reste |

### Titrage pH-métrique

Emplacement : `/laboratoire/titrage-ph-metrique` ; fichiers génériques.  
Test réel : volume versé, volume équivalent, mode, reset, desktop/mobile, console.

Diagnostic : courbe et saut de pH lisibles. L'équivalence au milieu du saut est une simplification acceptable, mais il manque une explicitation de la méthode graphique.  
Priorités :

| Priorité | Problème | Impact élève | Correction proposée | Statut |
|---|---|---|---|---|
| P2 | Méthode de lecture de l'équivalence trop implicite | L'élève peut seulement lire le badge | Ajouter tangentes ou dérivée en option | Reste |

### Titrage conductimétrique

Emplacement : `/laboratoire/titrage-conductimetrique` ; fichiers génériques.  
Test réel : volume versé, volume équivalent, mode, reset, desktop/mobile, console.

Diagnostic : rupture de pente et intersection visibles. Modèle qualitatif cohérent, mais les espèces ioniques responsables des pentes ne sont pas assez reliées au graphe.  
Priorités :

| Priorité | Problème | Impact élève | Correction proposée | Statut |
|---|---|---|---|---|
| P2 | Ions dominants peu connectés à la pente | Compréhension chimique superficielle | Ajouter une légende ions avant/après équivalence | Reste |

### Enquête des ions

Emplacement : `/laboratoire/test-ions` ; fichiers génériques.  
Test réel : concentration, quantité de réactif, ion recherché, reset, desktop/mobile, console.

Diagnostic : simulation claire et adaptée. Lien réactif/précipité/ion visible, avec un bon retour immédiat.  
Priorités :

| Priorité | Problème | Impact élève | Correction proposée | Statut |
|---|---|---|---|---|
| P2 | Certains réactifs pourraient être nommés plus explicitement | Meilleure mémorisation | Afficher le nom complet du réactif utilisé | Reste |

### Mole et pesée

Emplacement : `/laboratoire/mole-pesee` ; fichiers génériques.  
Test réel : masse, masse molaire, espèce, reset, desktop/mobile, console.

Diagnostic : très clair. Le calcul `n = m / M` est visible et le nombre de particules rend l'effet de la masse molaire concret.  
Priorités :

| Priorité | Problème | Impact élève | Correction proposée | Statut |
|---|---|---|---|---|
| P3 | Pas de distinction explicite masse molaire atomique/moléculaire | Détail lycée | Ajouter une info-bulle courte | Reste |

### Simulateur de saisons

Emplacement : `/laboratoire/simulateur-saisons` ; fichiers génériques.  
Test réel : jour, inclinaison, hémisphère, reset, desktop/mobile, console.

Diagnostic : idée centrale correcte : les saisons viennent de l'inclinaison de l'axe, pas de la distance au Soleil. La scène est lisible, mais la représentation en orbite plane peut toujours entretenir une fausse piste chez certains élèves.  
Priorités :

| Priorité | Problème | Impact élève | Correction proposée | Statut |
|---|---|---|---|---|
| P2 | Risque de retour à l'explication fausse par la distance au Soleil | Mauvaise représentation fréquente | Ajouter un contraste visuel `distance presque sans effet / inclinaison déterminante` | Reste |

### Escape énergie

Emplacement : `/laboratoire/escape-energie` ; fichiers génériques.  
Test réel : indice, énergie utile, mission, reset, desktop/mobile, console.

Diagnostic : interface engageante et claire, mais l'activité est plus un mini-jeu guidé qu'une simulation physique. Très utile pour réviser, moins pour construire un modèle nouveau.  
Priorités :

| Priorité | Problème | Impact élève | Correction proposée | Statut |
|---|---|---|---|---|
| P2 | Auto-validation encore limitée | L'élève peut réussir par imitation | Ajouter un feedback après chaque maillon de chaîne | Reste |

## Problèmes transversaux

| Priorité | Problème transversal | Impact | Recommandation |
|---|---|---|---|
| P1 | Plusieurs scènes canvas contiennent des informations essentielles uniquement dessinées dans le canvas | Accessibilité limitée pour lecteurs d'écran et certains élèves | Ajouter un résumé HTML court synchronisé sous chaque canvas ou renforcer les readouts existants |
| P2 | Certaines simulations avancées restent denses en mobile | Temps d'entrée supérieur à 20 secondes | Ajouter des modes progressifs quand il y a beaucoup de rayons/graphes |
| P2 | Les boutons flottants bas peuvent masquer le bas de quelques scènes sur petit écran | Gêne ponctuelle | Augmenter le `padding-bottom` des scènes ou réduire l'emprise mobile |
| P3 | Les modèles qualitatifs ne disent pas toujours explicitement ce qui est simplifié | Risque de surinterprétation | Ajouter des badges `modèle simplifié` pour astronomie, titrages, gaz et thermique |

## Plan d'action final

### Priorité immédiate

1. Lunette afocale : découper la construction en étapes. Bénéfice : l'élève sait enfin quoi regarder en premier.
2. Poids vs masse : rendre l'animation du ressort/dynamomètre franchement visible. Bénéfice : passer d'une affiche à une vraie simulation.

### Priorité courte

1. Diffraction/interférences : relier les observations aux formules simples.
2. Titrage pH-métrique : ajouter une méthode graphique optionnelle.
3. Titrage conductimétrique : expliciter les ions responsables de la rupture de pente.
4. Simulateur de saisons : verrouiller la fausse explication par la distance au Soleil.

### Priorité moyenne

1. Système solaire : badge permanent sur les échelles compressées.
2. Mélanges : montrer la séparation progressive après agitation.
3. Loi d'Ohm : ajouter voltmètre/ampèremètre plus expérimentaux.
4. Bilans thermiques : afficher un équilibre thermique simple.

### Priorité basse

1. Gaz parfaits : enrichir les collisions contre le piston.
2. Puissance/énergie : ajouter conversions d'unités.
3. Chronophotographie : ajouter vecteurs vitesse en option.
4. pH, mole, chaînes énergétiques : enrichissements mineurs seulement.

## Validation

Validées techniquement : 25/25.  
Validées pédagogiquement sans réserve majeure : 18/25.  
À améliorer en priorité : lunette afocale, poids vs masse.  
À améliorer ensuite : titrages, saisons, diffraction/interférences, mélanges, système solaire.

Aucune correction de code applicatif n'a été faite pendant cette passe d'audit : cette livraison est volontairement un état des lieux complet et vérifié. Les fichiers ajoutés sont uniquement le rapport et les scripts/captures de preuve dans `tmp/`.
