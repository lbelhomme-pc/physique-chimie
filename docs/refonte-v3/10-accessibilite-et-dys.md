# Accessibilite et DYS

Fonctions V2 recensees :

- panneau d'accessibilite React ;
- guide de lecture ;
- themes clair, gris, sombre, sepia, nuit ;
- polices alternatives dont OpenDyslexic ;
- tailles de texte ;
- interlignage ;
- espacement lettres/mots ;
- largeur de ligne ;
- reduction de mouvement ;
- mise en evidence des liens ;
- focus mode.

Risques :

- OpenDyslexic et police principale chargees depuis des domaines externes ;
- letter-spacing normal negatif dans `design-system.css` ;
- certains schemas et canvas peuvent ne pas avoir d'alternative textuelle suffisante ;
- les laboratoires doivent proposer tableau/description synchronises.

Cible V3 :

- tokens DYS integres au design system ;
- preferences persistantes et exportables ;
- navigation clavier complete ;
- tests axe et revue manuelle ;
- aucun sens transmis uniquement par la couleur ;
- alternatives textuelles pour formules, graphiques, schemas et simulations.
