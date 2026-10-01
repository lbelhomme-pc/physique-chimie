# Audit UX/UI V5 — reconstruction complète

Date : 1 octobre 2026

## Diagnostic

Le défaut principal n'est pas une page isolée : plusieurs générations d'interface cohabitent encore. Les captures montrent notamment :
- cartes et boutons différents entre pages de niveaux ;
- catalogue comprimé par des grilles imbriquées ;
- largeur du cours incohérente entre objectifs, outils et texte ;
- plusieurs systèmes de recherche, tabs, cartes et rayons ;
- styles historiques V3 encore actifs sous les nouveaux shells V5.

## Décision

La V5 devient l'unique système visuel. Toute nouvelle page doit utiliser les primitives `ui5-*`. Les styles V3 ne doivent plus définir la structure des pages migrées.

## Contrat visuel

- largeur application : 1280 px ;
- largeur contenu : 1120 px ;
- largeur de lecture : 70ch ;
- contrôle interactif : 44 px minimum ;
- rayon : 8 à 12 px ;
- pas d'ombre permanente sur les cartes ;
- une seule grammaire pour boutons, recherche, cartes, tabs et filtres ;
- couleur de discipline uniquement via tokens sémantiques ;
- responsive : 2 colonnes maximum sur niveaux, 2 sur catalogues, 1 sur mobile.

## Corrections prioritaires issues des captures

1. Pages niveaux : utiliser `ui5-page`, `ui5-page-header`, `ui5-grid--2`, `ui5-level-card`.
2. Catalogues : supprimer la grille matière × chapitres ; sections matière verticales et cartes 2 colonnes maximum.
3. Chapitres : aligner breadcrumb, header, tabs, contenu et pagination sur 1120 px.
4. Cours : limiter le texte à 70ch ; blocs pédagogiques compacts et sans effet “carte partout”.
5. Onglets : une seule implémentation V5, sans CSS structurel local.
6. React : retirer progressivement les styles inline structurels.
7. Labo/outils/mémorisation : conserver uniquement les shells V5 déjà reconstruits.

## État après ce lot

- navigation principale V5 : migrée ;
- accueil / maths / PC / lycée : migrés ;
- collège PC : migré ;
- catalogues de niveaux : migrés ;
- laboratoire : migré ;
- outils principaux : migrés ;
- mémorisation : migrée ;
- chapter shell : migré ;
- tabs chapitre : déplacés vers le design system V5 ;
- cours : couche V5 renforcée pour les blocs pédagogiques et la colonne de lecture ;
- statut de lecture du cours : style inline supprimé.

## Règle de sortie

La reconstruction n'est considérée terminée que lorsque les pages migrées n'ont plus besoin d'une correction visuelle locale pour ressembler au reste du site.

## Nettoyage approfondi et validation du 1 octobre 2026

Le lot suivant retire la cascade legacy chargée, centralise CourseReader, React, Python et les simulations, et valide les parcours desktop/tablette/mobile/DYS. Voir [le rapport de nettoyage](nettoyage-ui-v5-2026-10-01.md) pour l'inventaire, les résultats, les limites et la procédure de retour arrière. Les preuves proviennent du build local de la branche, pas d'un ancien déploiement Vercel.
