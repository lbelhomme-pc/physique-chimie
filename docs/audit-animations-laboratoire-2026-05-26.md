# Audit des animations interactives du laboratoire

Date : 2026-05-26  
Portee : routes actives Astro `/laboratoire/*`, soit 25 animations declarees dans `src/data/laboratoire/apps.ts`.  
Limite : `BO.pdf` est annonce dans `AGENTS.md`, mais absent du depot au moment de l'audit. La validation "programme officiel" stricte reste donc a confirmer avec le PDF.

## Methode

- Inventaire par lecture de `src/data/laboratoire/apps.ts`, `src/data/laboratoire/genericConfigs.ts`, `src/pages/laboratoire/*`, `src/components/laboratoire/*`, `src/scripts/laboratoire/*` et des anciens chemins `legacyPath`.
- Tests reels dans le navigateur sur `http://127.0.0.1:4321/laboratoire` avec navigation, sliders, selects, boutons, reset, console et viewport mobile 390 x 844.
- Verification build : `npm.cmd run build` reussi.
- Captures d'ecran : l'API de capture du navigateur integre a renvoye un timeout CDP. Les verifications visuelles ont donc ete faites par affichage/DOM/interaction, dimensions de canvas et observations en page, sans capture exportee.

## Inventaire

| Animation | Page active | Fichiers actifs | Ancienne page indiquee | Theme | Niveau probable | Interaction | Objectif apparent |
|---|---|---|---|---|---|---|---|
| Dipole RC serie | `/laboratoire/circuit-rc` | `src/pages/laboratoire/circuit-rc.astro`, `src/scripts/laboratoire/circuit-rc.js`, `src/styles/laboratoire/global-lab.css` | `laboratoire/circuit_rc/circuit_rc_v3.html` | Electricite | Terminale spe | sliders, boutons, canvas | Relier charge/decharge a tau = R x C |
| Lois de Kepler | `/laboratoire/lois-kepler` | `src/pages/laboratoire/lois-kepler.astro`, `src/scripts/laboratoire/lois-kepler.js` | `laboratoire/loi_kepler/kepler.html` | Gravitation | Terminale spe | sliders, mesure d'aire, canvas | Verifier lois des aires et periodes |
| Modele des gaz parfaits | `/laboratoire/gaz-parfaits` | `src/pages/laboratoire/gaz-parfaits.astro`, `src/scripts/laboratoire/gaz-parfaits.js` | `laboratoire/gaz_parfaits/gaz_parfaits.html` | Thermodynamique | Terminale spe | sliders, pause/reset, canvas | Relier P, V, n et T |
| Diffusion et temperature | `/laboratoire/diffusion-temperature` | `src/pages/laboratoire/diffusion-temperature.astro`, `src/scripts/laboratoire/diffusion-temperature.js` | `laboratoire/diffusion/diffusion.html` | Matiere | College/Lycee | slider, select, boutons, canvas | Voir l'effet de la temperature sur la diffusion |
| Systeme solaire | `/laboratoire/systeme-solaire` | `src/pages/laboratoire/[slug].astro`, `GenericLabSimulator.astro`, `generic-lab-simulator.js` | `laboratoire/systeme_solaire/systeme_solaire.html` | Astronomie | College | sliders, select, canvas | Comparer les durees de revolution |
| Labo des melanges | `/laboratoire/melanges` | Generique | `laboratoire/melanges/melanges.html` | Chimie matiere | College | sliders, select, canvas | Miscibilite et solubilite |
| Chronophotographie | `/laboratoire/chronophotographie` | Generique | `laboratoire/chronophotographie/chronophotographie.html` | Mouvement | College/Lycee | sliders, select, canvas | Lire des positions regulieres |
| Chaines energetiques | `/laboratoire/chaines-energetiques` | Generique | `laboratoire/sources_formes_energies/sources_formes_energies.html` | Energie | College | sliders, select, canvas | Identifier source, convertisseur, pertes |
| Decroissance radioactive | `/laboratoire/decroissance-radioactive` | Generique | `laboratoire/decroissance_radioactive/decroissance.html` | Noyaux | Lycee | sliders, select, canvas | Comprendre demi-vie et exponentielle |
| Refraction de la lumiere | `/laboratoire/refraction-lumiere` | Generique | `laboratoire/snell_descartes/snell_descartes.html` | Optique | College/Lycee | sliders, select, canvas | Observer Snell-Descartes |
| Lentilles et images | `/laboratoire/lentilles-images` | Generique | `laboratoire/lentille/lentille.html` | Optique | Lycee | sliders, select, canvas | Former une image avec une lentille |
| Laboratoire du pH | `/laboratoire/ph` | Generique | `laboratoire/ph/ph_animation.html` | Acide-base | College/Lycee | sliders, select, canvas | Classer acide/neutre/basique |
| Oscilloscope | `/laboratoire/oscilloscope` | Generique | `laboratoire/oscilloscope_secret/oscilloscope.html` | Signaux | College/Lycee | sliders, select, canvas | Lire amplitude/frequence |
| Diffraction et interferences | `/laboratoire/diffraction-interferences` | Generique | `laboratoire/diffraction_interference/diffraction.html` | Ondes | Terminale spe | sliders, select, canvas | Relier ouverture, lambda et figure |
| Lunette afocale | `/laboratoire/lunette-afocale` | Generique | `laboratoire/lunette_afocale/lunette_afocale.html` | Optique | Terminale spe | sliders, select, canvas | Comprendre objectif/oculaire |
| Poids vs masse | `/laboratoire/poids-masse` | Generique | `laboratoire/poids_masse/poids_masse.html` | Gravitation | College | sliders, select, canvas | Distinguer masse et poids |
| Loi d'Ohm | `/laboratoire/loi-ohm` | Generique | `laboratoire/loi_ohm/loi_ohm.html` | Electricite | College/Lycee | sliders, select, canvas | Verifier U = R x I |
| Puissance et energie | `/laboratoire/puissance-energie` | Generique | `laboratoire/puissance_energie/puissance_energie.html` | Energie | College/Lycee | sliders, select, canvas | Relier P, t et E |
| Bilans thermiques | `/laboratoire/bilans-thermiques` | Generique | `laboratoire/thermodynamique/bilan_thermique.html` | Thermique | Lycee | sliders, select, canvas | Visualiser transfert chaud/froid |
| Titrage pH-metrique | `/laboratoire/titrage-ph-metrique` | Generique | `laboratoire/titrage_ph/titrage_ph.html` | Titrage | Lycee | sliders, select, canvas | Reperer volume equivalent |
| Titrage conductimetrique | `/laboratoire/titrage-conductimetrique` | Generique | `laboratoire/titrage_conductimetrie/titrage_cond.html` | Titrage | Lycee | sliders, select, canvas | Lire rupture de pente |
| Enquete des ions | `/laboratoire/test-ions` | Generique | `laboratoire/test_ions/test_ions.html` | Tests d'ions | College/Lycee | sliders, select, canvas | Associer precipite et ion |
| Mole et pesee | `/laboratoire/mole-pesee` | Generique | `laboratoire/mole/mole.html` | Quantite de matiere | Lycee | sliders, select, canvas | Relier m, M et n |
| Simulateur de saisons | `/laboratoire/simulateur-saisons` | Generique | `laboratoire/simulateur_saison/simulateur_saison.html` | Astronomie | College/Lycee | sliders, select, canvas | Relier inclinaison et saisons |
| Escape energie | `/laboratoire/escape-energie` | Generique | `laboratoire/escape_energie/escape_energie.html` | Energie | College | sliders, select, canvas | Associer formes et conversions d'energie |

## Corrections realisees

- `src/components/laboratoire/GenericLabSimulator.astro` : ajout d'un bouton `Reinitialiser` sur toutes les simulations generiques.
- `src/scripts/laboratoire/generic-lab-simulator.js` : utilisation de `createLabRuntime` pour nettoyer les listeners/frames, reset generique fonctionnel, boucle stoppee en mode mouvement reduit.
- `src/scripts/laboratoire/generic-lab-simulator.js` : refraction corrigee avec detection de reflexion totale.
- `src/scripts/laboratoire/generic-lab-simulator.js` : lentille corrigee pour afficher image reelle, image virtuelle ou image a l'infini selon la position de l'objet.
- `src/scripts/laboratoire/generic-lab-simulator.js` : diffraction/interferences corrigees pour que grande longueur d'onde et petite ouverture elargissent la figure.
- `src/scripts/laboratoire/generic-lab-simulator.js` : simulateur de saisons corrige pour que le choix Nord/Sud/Equateur modifie l'observation.
- `src/styles/laboratoire/global-lab.css` : adaptation mobile de la scene de diffusion ; canvas passe de 220 px a environ 278 px de large en viewport 390 px.

## Fiches par animation

### Animation : Dipole RC serie
#### Emplacement
- Page : `/laboratoire/circuit-rc`
- Fichiers concernes : page Astro, script `circuit-rc.js`, CSS labo.
- Type / notion / niveau : simulation canvas + schema SVG ; circuit RC ; Terminale spe.
#### Objectif pedagogique identifie
Observer la charge/decharge d'un condensateur et relier la duree du regime transitoire a tau = R x C.
#### Test reel effectue
Sliders E/R/C, boutons Charge, Decharge, Pause, Recommencer, canvas, console, mobile.
#### Diagnostics
- Scientifique : modele exponentiel correct, tau lisible.
- Pedagogique : objectif clair ; la lecture de 5 tau est utile.
- UX/UI : boutons explicites ; reset present.
- Technique : pas d'erreur console propre ; animation fluide.
#### Priorites
| Priorite | Probleme | Impact eleve | Correction proposee | Statut |
|---|---|---|---|---|
| P2 | Precision graphique limitee pour lecture quantitative | Lecture approximative | Ajouter graduations numeriques plus riches | Restant |
#### Corrections realisees / restantes
Pas de correction directe necessaire sur cette animation. Reste : enrichir la lecture quantitative.

### Animation : Lois de Kepler
#### Emplacement
- Page : `/laboratoire/lois-kepler`
- Fichiers concernes : page Astro, script `lois-kepler.js`, CSS labo.
- Type / notion / niveau : orbite canvas ; lois de Kepler ; Terminale spe.
#### Objectif pedagogique identifie
Comparer des aires balayees pendant une meme duree et verifier T^2/a^3.
#### Test reel effectue
Sliders a/e/vitesse/delta t, mesure d'aire, reset, console, mobile.
#### Diagnostics
- Scientifique : Soleil au foyer, vitesse et periode coherentes.
- Pedagogique : bonne activite d'observation.
- UX/UI : HUD utile ; mesure limitee a deux secteurs, ce qui guide bien.
- Technique : pas d'erreur console propre.
#### Priorites
| Priorite | Probleme | Impact eleve | Correction proposee | Statut |
|---|---|---|---|---|
| P2 | Unites d'aire non explicitees | Mesure interpretee comme absolue | Preciser unite relative ou UA^2 | Restant |
#### Corrections realisees / restantes
Pas de correction directe necessaire. Reste : clarifier l'unite de l'aire.

### Animation : Modele des gaz parfaits
#### Emplacement
- Page : `/laboratoire/gaz-parfaits`
- Fichiers concernes : page Astro, script `gaz-parfaits.js`, CSS labo.
- Type / notion / niveau : particules canvas ; gaz parfait ; Terminale spe.
#### Objectif pedagogique identifie
Modifier T, V et n pour observer l'effet sur P selon P = nRT/V.
#### Test reel effectue
Sliders T/V/n, pause, reset, pression, console, mobile.
#### Diagnostics
- Scientifique : calcul de pression correct avec L converti en m3.
- Pedagogique : pression et particules bien reliees.
- UX/UI : warning surpression pertinent.
- Technique : pas d'erreur console propre.
#### Priorites
| Priorite | Probleme | Impact eleve | Correction proposee | Statut |
|---|---|---|---|---|
| P2 | Les particules peuvent faire croire a un comptage reel de moles | Representation microscopique trop litterale | Ajouter mention "representation symbolique" | Restant |
#### Corrections realisees / restantes
Pas de correction directe necessaire. Reste : expliciter la nature symbolique des particules.

### Animation : Diffusion et temperature
#### Emplacement
- Page : `/laboratoire/diffusion-temperature`
- Fichiers concernes : page Astro, script `diffusion-temperature.js`, CSS labo.
- Type / notion / niveau : diffusion canvas ; agitation thermique ; College/Lycee.
#### Objectif pedagogique identifie
Comparer la vitesse de dispersion du colorant selon temperature, agitation et nature du colorant.
#### Test reel effectue
Slider temperature, select colorant, ajout de goutte, agitateur, pause, reset, mobile 390 px, console.
#### Diagnostics
- Scientifique : lien temperature/diffusion correct ; densite du colorant rouge simplifiee.
- Pedagogique : consigne claire et feedback immediat.
- UX/UI : scene lisible ; mobile initialement trop etroit.
- Technique : pas d'erreur console propre.
#### Priorites
| Priorite | Probleme | Impact eleve | Correction proposee | Statut |
|---|---|---|---|---|
| P1 | Becher trop etroit sur petit ecran | Observation moins lisible | Reorganiser thermometre au-dessus du becher | Corrige |
| P2 | "Rouge plus dense" peut etre sur-interprete | Mauvaise generalisation | Preciser que c'est un choix de modele | Restant |
#### Corrections realisees / restantes
CSS mobile corrige. Reste : une micro-note sur le modele de colorant.

### Animation : Systeme solaire
#### Emplacement
- Page : `/laboratoire/systeme-solaire`
- Fichiers concernes : route generique, `generic-lab-simulator.js`, `genericConfigs.ts`.
- Type / notion / niveau : orbites simplifiees canvas ; revolution ; College.
#### Objectif pedagogique identifie
Comparer distance au Soleil et duree de revolution.
#### Test reel effectue
Sliders vitesse/zoom, select planete, reset generique, console, mobile.
#### Diagnostics
- Scientifique : tendance correcte, modele non a l'echelle.
- Pedagogique : clair mais moins riche que l'ancien labo 3D annonce.
- UX/UI : lisible, peu bavard.
- Technique : reset ajoute ; pas d'erreur console propre.
#### Priorites
| Priorite | Probleme | Impact eleve | Correction proposee | Statut |
|---|---|---|---|---|
| P2 | Le modele peut etre pris pour une echelle reelle | Representation faussement realiste | Ajouter mention "schema non a l'echelle" | Restant |
#### Corrections realisees / restantes
Reset generique ajoute. Reste : precision d'echelle.

### Animation : Labo des melanges
#### Emplacement
- Page : `/laboratoire/melanges`
- Fichiers concernes : generique.
- Type / notion / niveau : schema canvas ; melanges ; College.
#### Objectif pedagogique identifie
Distinguer melange homogene, dissolution et liquides non miscibles.
#### Test reel effectue
Sliders proportion/agitation, select experience, reset, console, mobile.
#### Diagnostics
- Scientifique : distinction eau/huile correcte ; "proportion du solute" moins adapte a l'huile.
- Pedagogique : message final clair.
- UX/UI : simple et lisible.
- Technique : reset ajoute ; pas d'erreur console propre.
#### Priorites
| Priorite | Probleme | Impact eleve | Correction proposee | Statut |
|---|---|---|---|---|
| P2 | Nom du slider trop general | Confusion solute/liquide | Adapter le libelle selon le mode | Restant |
#### Corrections realisees / restantes
Reset generique ajoute. Reste : libelle dynamique.

### Animation : Chronophotographie
#### Emplacement
- Page : `/laboratoire/chronophotographie`
- Fichiers concernes : generique.
- Type / notion / niveau : points canvas ; mouvement ; College/Lycee.
#### Objectif pedagogique identifie
Lire l'espacement des positions pour identifier vitesse constante, acceleration ou ralentissement.
#### Test reel effectue
Sliders vitesse/acceleration, select mouvement, reset, console, mobile.
#### Diagnostics
- Scientifique : principe de points a temps regulier correct.
- Pedagogique : clair, rapide a comprendre.
- UX/UI : lisible.
- Technique : reset ajoute ; pas d'erreur console propre.
#### Priorites
| Priorite | Probleme | Impact eleve | Correction proposee | Statut |
|---|---|---|---|---|
| P3 | Pas d'axe temps explicite | Enrichissement | Ajouter fleche sens du mouvement | Restant |
#### Corrections realisees / restantes
Reset generique ajoute.

### Animation : Chaines energetiques
#### Emplacement
- Page : `/laboratoire/chaines-energetiques`
- Fichiers concernes : generique.
- Type / notion / niveau : chaines canvas ; energie ; College.
#### Objectif pedagogique identifie
Associer source, convertisseur, energie utile et pertes.
#### Test reel effectue
Sliders rendement/puissance, select convertisseur, reset, console, mobile.
#### Diagnostics
- Scientifique : rendement et pertes coherents.
- Pedagogique : tres accessible.
- UX/UI : blocs lisibles.
- Technique : reset ajoute ; pas d'erreur console propre.
#### Priorites
| Priorite | Probleme | Impact eleve | Correction proposee | Statut |
|---|---|---|---|---|
| P2 | Les pertes ne sont pas visualisees | Rendement moins concret | Ajouter fleche "pertes thermiques" | Restant |
#### Corrections realisees / restantes
Reset generique ajoute.

### Animation : Decroissance radioactive
#### Emplacement
- Page : `/laboratoire/decroissance-radioactive`
- Fichiers concernes : generique.
- Type / notion / niveau : courbe canvas ; demi-vie ; Lycee.
#### Objectif pedagogique identifie
Observer une decroissance exponentielle et l'effet de la demi-vie.
#### Test reel effectue
Sliders demi-vie/noyaux, select affichage, reset, console, mobile.
#### Diagnostics
- Scientifique : courbe correcte ; noyaux non aleatoires.
- Pedagogique : demi-vie bien mise en avant.
- UX/UI : graphe lisible.
- Technique : reset ajoute ; pas d'erreur console propre.
#### Priorites
| Priorite | Probleme | Impact eleve | Correction proposee | Statut |
|---|---|---|---|---|
| P2 | Aspect aleatoire peu visible | Radioactivite percue comme deterministe | Ajouter tirage aleatoire optionnel | Restant |
#### Corrections realisees / restantes
Reset generique ajoute.

### Animation : Refraction de la lumiere
#### Emplacement
- Page : `/laboratoire/refraction-lumiere`
- Fichiers concernes : generique.
- Type / notion / niveau : rayon canvas ; refraction ; College/Lycee.
#### Objectif pedagogique identifie
Faire varier angle et indices pour observer deviation et cas limite.
#### Test reel effectue
Sliders angle/indice, select milieu, reset, cas verre vers air a grand angle, console, mobile.
#### Diagnostics
- Scientifique : ancien modele clampait sin(r) et masquait la reflexion totale ; corrige.
- Pedagogique : feedback "angle critique depasse" ajoute via readout.
- UX/UI : lisible, peu de texte.
- Technique : reset ajoute ; pas d'erreur console propre.
#### Priorites
| Priorite | Probleme | Impact eleve | Correction proposee | Statut |
|---|---|---|---|---|
| P1 | Reflexion totale non representee | Idee scientifique fausse | Detecter sin(r) > 1 et tracer le rayon reflechi | Corrige |
#### Corrections realisees / restantes
Correction scientifique faite et retestee : readout confirme "le rayon est totalement reflechi".

### Animation : Lentilles et images
#### Emplacement
- Page : `/laboratoire/lentilles-images`
- Fichiers concernes : generique.
- Type / notion / niveau : construction optique canvas ; lentille convergente ; Lycee.
#### Objectif pedagogique identifie
Comprendre image reelle/virtuelle selon la distance objet et la focale.
#### Test reel effectue
Sliders distance/focale, cas d < f, reset, console, mobile.
#### Diagnostics
- Scientifique : ancien modele affichait toujours une image reelle a droite ; corrige.
- Pedagogique : readout distingue maintenant reelle, virtuelle ou infini.
- UX/UI : labels F/F' corriges.
- Technique : pas d'erreur console propre.
#### Priorites
| Priorite | Probleme | Impact eleve | Correction proposee | Statut |
|---|---|---|---|---|
| P1 | Image virtuelle absente | Representation optique fausse | Utiliser la formule signee et tracer extensions pointillees | Corrige |
#### Corrections realisees / restantes
Correction retestee : pour d = 12 cm et f = 30 cm, l'animation annonce une image virtuelle droite du meme cote.

### Animation : Laboratoire du pH
#### Emplacement
- Page : `/laboratoire/ph`
- Fichiers concernes : generique.
- Type / notion / niveau : echelle canvas ; pH ; College/Lycee.
#### Objectif pedagogique identifie
Classer une solution acide, neutre ou basique.
#### Test reel effectue
Slider pH, select solution, reset, console, mobile.
#### Diagnostics
- Scientifique : classification correcte.
- Pedagogique : tres clair.
- UX/UI : lisible.
- Technique : reset ajoute ; pas d'erreur console propre.
#### Priorites
| Priorite | Probleme | Impact eleve | Correction proposee | Statut |
|---|---|---|---|---|
| P3 | La dilution ne modifie pas explicitement le pH | Modele incomplet | Relier dilution au rapprochement vers 7 | Restant |
#### Corrections realisees / restantes
Reset generique ajoute.

### Animation : Oscilloscope
#### Emplacement
- Page : `/laboratoire/oscilloscope`
- Fichiers concernes : generique.
- Type / notion / niveau : signal canvas ; periode/frequence ; College/Lycee.
#### Objectif pedagogique identifie
Modifier amplitude, frequence et forme du signal.
#### Test reel effectue
Sliders frequence/amplitude, select signal, reset, console, mobile.
#### Diagnostics
- Scientifique : formes correctes pour une premiere lecture.
- Pedagogique : readout utile.
- UX/UI : graphe lisible.
- Technique : reset ajoute ; pas d'erreur console propre.
#### Priorites
| Priorite | Probleme | Impact eleve | Correction proposee | Statut |
|---|---|---|---|---|
| P2 | Pas de graduation temporelle quantitative | Difficile de mesurer T | Ajouter grille calibree | Restant |
#### Corrections realisees / restantes
Reset generique ajoute.

### Animation : Diffraction et interferences
#### Emplacement
- Page : `/laboratoire/diffraction-interferences`
- Fichiers concernes : generique.
- Type / notion / niveau : figure canvas ; ondes ; Terminale spe.
#### Objectif pedagogique identifie
Relier ouverture, longueur d'onde et largeur de figure.
#### Test reel effectue
Sliders lambda/ouverture, select phenomene, reset, console, mobile.
#### Diagnostics
- Scientifique : ancien modele faisait augmenter le nombre de franges avec lambda ; corrige.
- Pedagogique : readout explicite le role petite ouverture/grande longueur d'onde.
- UX/UI : figure claire.
- Technique : reset ajoute ; pas d'erreur console propre.
#### Priorites
| Priorite | Probleme | Impact eleve | Correction proposee | Statut |
|---|---|---|---|---|
| P1 | Sens physique de lambda inverse | Mauvaise representation | Recalculer largeur d'enveloppe et espacement de franges | Corrige |
#### Corrections realisees / restantes
Correction retestee : le readout indique qu'une petite ouverture ou grande longueur d'onde elargit la figure.

### Animation : Lunette afocale
#### Emplacement
- Page : `/laboratoire/lunette-afocale`
- Fichiers concernes : generique.
- Type / notion / niveau : rayons canvas ; instrument optique ; Terminale spe.
#### Objectif pedagogique identifie
Relier focales objectif/oculaire et grossissement.
#### Test reel effectue
Sliders focales, select reglage, reset, console, mobile.
#### Diagnostics
- Scientifique : G = f objectif / f oculaire correct en valeur absolue.
- Pedagogique : objectif clair.
- UX/UI : schema lisible.
- Technique : reset ajoute ; pas d'erreur console propre.
#### Priorites
| Priorite | Probleme | Impact eleve | Correction proposee | Statut |
|---|---|---|---|---|
| P2 | Condition d'afocalisme peu visible | L'eleve manipule sans critere | Afficher distance objectif-oculaire = f1 + f2 | Restant |
#### Corrections realisees / restantes
Reset generique ajoute.

### Animation : Poids vs masse
#### Emplacement
- Page : `/laboratoire/poids-masse`
- Fichiers concernes : generique.
- Type / notion / niveau : force canvas ; poids ; College.
#### Objectif pedagogique identifie
Voir que la masse reste constante mais le poids depend de g.
#### Test reel effectue
Sliders masse/g, select astre, reset, console, mobile.
#### Diagnostics
- Scientifique : P = m x g correct.
- Pedagogique : tres clair.
- UX/UI : lisible.
- Technique : reset ajoute ; pas d'erreur console propre.
#### Priorites
| Priorite | Probleme | Impact eleve | Correction proposee | Statut |
|---|---|---|---|---|
| P3 | Select astre et slider g peuvent diverger | Coherence contextuelle | Synchroniser astre et g typique | Restant |
#### Corrections realisees / restantes
Reset generique ajoute.

### Animation : Loi d'Ohm
#### Emplacement
- Page : `/laboratoire/loi-ohm`
- Fichiers concernes : generique.
- Type / notion / niveau : graphe canvas ; electricite ; College/Lycee.
#### Objectif pedagogique identifie
Verifier la proportionnalite U = R x I.
#### Test reel effectue
Sliders resistance/intensite, select affichage, reset, console, mobile.
#### Diagnostics
- Scientifique : calcul correct, unite mA convertie en A dans le readout.
- Pedagogique : relation explicite.
- UX/UI : graphe simple.
- Technique : reset ajoute ; pas d'erreur console propre.
#### Priorites
| Priorite | Probleme | Impact eleve | Correction proposee | Statut |
|---|---|---|---|---|
| P2 | Pas de vraie collecte de points | Demarche experimentale absente | Ajouter bouton "ajouter mesure" | Restant |
#### Corrections realisees / restantes
Reset generique ajoute.

### Animation : Puissance et energie
#### Emplacement
- Page : `/laboratoire/puissance-energie`
- Fichiers concernes : generique.
- Type / notion / niveau : barres canvas ; energie ; College/Lycee.
#### Objectif pedagogique identifie
Voir que l'energie transferee depend de la puissance et de la duree.
#### Test reel effectue
Sliders P/duree, select appareil, reset, console, mobile.
#### Diagnostics
- Scientifique : E = P x t avec t en heures correct.
- Pedagogique : readout clair.
- UX/UI : lisible.
- Technique : reset ajoute ; pas d'erreur console propre.
#### Priorites
| Priorite | Probleme | Impact eleve | Correction proposee | Statut |
|---|---|---|---|---|
| P3 | Wh seulement, pas kWh | Lien facture moins evident | Ajouter conversion kWh | Restant |
#### Corrections realisees / restantes
Reset generique ajoute.

### Animation : Bilans thermiques
#### Emplacement
- Page : `/laboratoire/bilans-thermiques`
- Fichiers concernes : generique.
- Type / notion / niveau : schema canvas ; thermique ; Lycee.
#### Objectif pedagogique identifie
Visualiser le sens spontane du transfert thermique.
#### Test reel effectue
Sliders temperatures, select contact, reset, console, mobile.
#### Diagnostics
- Scientifique : sens chaud vers froid correct ; equilibre moyenne simple sans masses/capacites.
- Pedagogique : idee principale claire.
- UX/UI : sobre.
- Technique : reset ajoute ; pas d'erreur console propre.
#### Priorites
| Priorite | Probleme | Impact eleve | Correction proposee | Statut |
|---|---|---|---|---|
| P2 | Equilibre moyenne peut etre trompeur | Oublie masses/capacites thermiques | Preciser modele masses identiques | Restant |
#### Corrections realisees / restantes
Reset generique ajoute.

### Animation : Titrage pH-metrique
#### Emplacement
- Page : `/laboratoire/titrage-ph-metrique`
- Fichiers concernes : generique.
- Type / notion / niveau : courbe canvas ; titrage ; Lycee.
#### Objectif pedagogique identifie
Reperer le saut de pH et le volume equivalent.
#### Test reel effectue
Sliders volume/Ve, select titrage, reset, console, mobile.
#### Diagnostics
- Scientifique : saut de pH plausible ; modes pas encore differencies fortement.
- Pedagogique : equivalence visible.
- UX/UI : courbe claire.
- Technique : reset ajoute ; pas d'erreur console propre.
#### Priorites
| Priorite | Probleme | Impact eleve | Correction proposee | Statut |
|---|---|---|---|---|
| P2 | Acide fort/faible peu distingue | Risque de modele unique | Adapter courbe selon le mode | Restant |
#### Corrections realisees / restantes
Reset generique ajoute.

### Animation : Titrage conductimetrique
#### Emplacement
- Page : `/laboratoire/titrage-conductimetrique`
- Fichiers concernes : generique.
- Type / notion / niveau : courbe canvas ; conductimetrie ; Lycee.
#### Objectif pedagogique identifie
Determiner Ve par intersection/rupture de pente.
#### Test reel effectue
Sliders volume/Ve, select ions dominants, reset, console, mobile.
#### Diagnostics
- Scientifique : rupture de pente correcte en principe.
- Pedagogique : objectif lisible.
- UX/UI : simple.
- Technique : reset ajoute ; pas d'erreur console propre.
#### Priorites
| Priorite | Probleme | Impact eleve | Correction proposee | Statut |
|---|---|---|---|---|
| P2 | Ions dominants non illustres | Select peu exploite | Afficher especes avant/apres equivalence | Restant |
#### Corrections realisees / restantes
Reset generique ajoute.

### Animation : Enquete des ions
#### Emplacement
- Page : `/laboratoire/test-ions`
- Fichiers concernes : generique.
- Type / notion / niveau : tube canvas ; identification d'ions ; College/Lycee.
#### Objectif pedagogique identifie
Associer ion et observation de test.
#### Test reel effectue
Sliders concentration/reactif, select ion, reset, console, mobile.
#### Diagnostics
- Scientifique : couleurs generales plausibles ; reactif non precise.
- Pedagogique : manque la decision "quel test choisir".
- UX/UI : lisible.
- Technique : reset ajoute ; pas d'erreur console propre.
#### Priorites
| Priorite | Probleme | Impact eleve | Correction proposee | Statut |
|---|---|---|---|---|
| P2 | Reactif absent | L'experience perd son sens chimique | Ajouter choix soude/nitrate d'argent | Restant |
#### Corrections realisees / restantes
Reset generique ajoute.

### Animation : Mole et pesee
#### Emplacement
- Page : `/laboratoire/mole-pesee`
- Fichiers concernes : generique.
- Type / notion / niveau : relation canvas ; quantite de matiere ; Lycee.
#### Objectif pedagogique identifie
Calculer n = m / M et relier masse, masse molaire, quantite.
#### Test reel effectue
Sliders m/M, select espece, reset, console, mobile.
#### Diagnostics
- Scientifique : relation correcte.
- Pedagogique : direct et clair.
- UX/UI : tres lisible.
- Technique : reset ajoute ; pas d'erreur console propre.
#### Priorites
| Priorite | Probleme | Impact eleve | Correction proposee | Statut |
|---|---|---|---|---|
| P3 | Select espece ne synchronise pas M | Contexte chimique faible | Associer chaque espece a sa masse molaire | Restant |
#### Corrections realisees / restantes
Reset generique ajoute.

### Animation : Simulateur de saisons
#### Emplacement
- Page : `/laboratoire/simulateur-saisons`
- Fichiers concernes : generique.
- Type / notion / niveau : orbite canvas ; saisons ; College/Lycee.
#### Objectif pedagogique identifie
Comprendre que les saisons viennent de l'inclinaison de l'axe et de la position orbitale.
#### Test reel effectue
Sliders jour/inclinaison, select hemisphere, reset, console, mobile.
#### Diagnostics
- Scientifique : axe conserve ; ancien select hemisphere sans effet ; corrige.
- Pedagogique : readout contextualise Nord/Sud/Equateur.
- UX/UI : labels N/S ajoutes.
- Technique : reset ajoute ; pas d'erreur console propre.
#### Priorites
| Priorite | Probleme | Impact eleve | Correction proposee | Statut |
|---|---|---|---|---|
| P1 | Hemisphere selectionne sans effet visible | Action inutile, confusion | Relier readout et labels a l'hemisphere | Corrige |
#### Corrections realisees / restantes
Correction retestee : mode Sud modifie l'observation.

### Animation : Escape energie
#### Emplacement
- Page : `/laboratoire/escape-energie`
- Fichiers concernes : generique.
- Type / notion / niveau : chaine canvas ; energie ; College.
#### Objectif pedagogique identifie
Associer une mission a une conversion d'energie.
#### Test reel effectue
Sliders indices/energie utile, select mission, reset, console, mobile.
#### Diagnostics
- Scientifique : chaine correcte mais l'aspect "escape" est symbolique.
- Pedagogique : utile mais peu ludique.
- UX/UI : simple.
- Technique : reset ajoute ; pas d'erreur console propre.
#### Priorites
| Priorite | Probleme | Impact eleve | Correction proposee | Statut |
|---|---|---|---|---|
| P2 | Pas de mecanique d'enigme reelle | Promesse "escape" peu tenue | Ajouter mission courte avec validation | Restant |
#### Corrections realisees / restantes
Reset generique ajoute.

## Classement global

| Animation | Etat actuel | Gravite | Clarte pedagogique | UX/UI | Fiabilite technique | Priorite globale |
|---|---|---|---|---|---|---|
| Dipole RC serie | OK | P2 | Bonne | Bonne | Bonne | Basse |
| Lois de Kepler | OK | P2 | Bonne | Bonne | Bonne | Basse |
| Gaz parfaits | OK | P2 | Bonne | Bonne | Bonne | Basse |
| Diffusion et temperature | OK | P2 | Bonne | Bonne apres correction mobile | Bonne | Basse |
| Systeme solaire | A ameliorer | P2 | Moyenne | Bonne | Bonne | Moyenne |
| Melanges | A ameliorer | P2 | Bonne | Bonne | Bonne | Moyenne |
| Chronophotographie | OK | P3 | Bonne | Bonne | Bonne | Basse |
| Chaines energetiques | A ameliorer | P2 | Bonne | Bonne | Bonne | Moyenne |
| Decroissance radioactive | A ameliorer | P2 | Bonne | Bonne | Bonne | Moyenne |
| Refraction lumiere | OK | P1 corrige | Bonne | Bonne | Bonne | Basse |
| Lentilles images | OK | P1 corrige | Bonne | Bonne | Bonne | Basse |
| pH | A ameliorer | P3 | Bonne | Bonne | Bonne | Basse |
| Oscilloscope | A ameliorer | P2 | Moyenne | Bonne | Bonne | Moyenne |
| Diffraction/interferences | OK | P1 corrige | Bonne | Bonne | Bonne | Basse |
| Lunette afocale | A ameliorer | P2 | Moyenne | Bonne | Bonne | Moyenne |
| Poids masse | OK | P3 | Bonne | Bonne | Bonne | Basse |
| Loi d'Ohm | A ameliorer | P2 | Bonne | Bonne | Bonne | Moyenne |
| Puissance energie | OK | P3 | Bonne | Bonne | Bonne | Basse |
| Bilans thermiques | A ameliorer | P2 | Moyenne | Bonne | Bonne | Moyenne |
| Titrage pH | A ameliorer | P2 | Moyenne | Bonne | Bonne | Moyenne |
| Titrage conductimetrique | A ameliorer | P2 | Moyenne | Bonne | Bonne | Moyenne |
| Test ions | A ameliorer | P2 | Moyenne | Bonne | Bonne | Moyenne |
| Mole pesee | OK | P3 | Bonne | Bonne | Bonne | Basse |
| Saisons | OK | P1 corrige | Bonne | Bonne | Bonne | Basse |
| Escape energie | A ameliorer | P2 | Moyenne | Bonne | Bonne | Moyenne |

## Plan d'action final

### Priorite immediate
- Aucune animation active ne reste critique apres corrections : scan console/overflow sans probleme propre aux pages.

### Priorite courte
- Titrage pH : differencier vraiment acide fort/base forte et acide faible/base forte.
- Test ions : ajouter le choix du reactif et les precipites caracteristiques.
- Lunette afocale : afficher la condition d'afocalisme `distance = f1 + f2`.
- Oscilloscope : ajouter une grille calibree pour mesurer T.

### Priorite moyenne
- Systeme solaire : indiquer explicitement que les distances ne sont pas a l'echelle.
- Melanges : rendre le libelle du slider coherent avec le mode.
- Bilans thermiques : preciser que l'equilibre moyen suppose des corps comparables.
- Loi d'Ohm : ajouter une collecte de points experimentaux.

### Priorite basse
- Ajouter des conversions utiles : Wh/kWh, unites d'aire Kepler, mention symbolique des particules de gaz.
- Enrichir quelques labels de canvas sans alourdir l'interface.

## Validation apres correction

- Build Astro : OK.
- 25 routes `/laboratoire/*` rechargees apres correction : OK.
- Interactions principales testees : OK.
- Reset generique teste sans navigation : OK.
- Cas scientifiques retestes :
  - refraction verre vers air a grand angle : reflexion totale affichee ;
  - lentille avec objet entre lentille et foyer : image virtuelle affichee ;
  - diffraction grande lambda/petite ouverture : figure annoncee comme elargie ;
  - saisons mode Sud : observation modifiee ;
  - diffusion mobile 390 px : pas d'overflow, canvas environ 278 px de large.
- Erreurs console propres aux pages : aucune observee. Les messages `Invalid hook call` existaient dans le stderr du dev server avant/apres et semblent hors surface laboratoire testee ; a traiter separement si le projet React global est audite.
