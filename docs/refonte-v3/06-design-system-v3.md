# Design system V3

Familles de tokens :

- couleurs primitives ;
- couleurs semantiques ;
- accents de discipline ;
- surfaces et elevations ;
- bordures et focus ;
- typographie ;
- espacements ;
- rayons ;
- ombres ;
- mouvements ;
- DYS/accessibilite.

Composants de base :

- bouton, lien-bouton, bouton icone ;
- champ, recherche, select, segmented control ;
- badge, tag, statut, verrou Premium ;
- carte chapitre, carte ressource, ligne d'activite ;
- barre de progression, anneau de progression ;
- onglets, fil d'Ariane, sommaire ;
- bloc notion, definition, loi, methode, vigilance ;
- exercice, indice, correction ;
- quiz, feedback, resultat ;
- flashcard ;
- tableau de mesures ;
- panneau laboratoire ;
- etats vide, chargement, erreur, hors ligne.

Regles DYS :

- toutes les variantes passent par tokens ;
- focus visible renforce ;
- reduction des animations respectee ;
- guide de lecture et largeur de ligne disponibles ;
- schema et formule avec alternatives accessibles.

Priorite technique : extraire progressivement `src/styles/design-system.css` vers des tokens V3 sans casser les classes actuelles.
