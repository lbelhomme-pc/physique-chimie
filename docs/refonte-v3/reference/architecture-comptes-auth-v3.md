# Architecture comptes et authentification V3

Date de reference : 2026-07-28.

Statut : cible documentaire. Aucun fournisseur, paiement, secret ou backend n'est installe par ce prompt.

## Decision courte

La V3 doit rester utilisable sans compte. Le compte sert a synchroniser la progression, personnaliser les revisions, retrouver ses donnees sur plusieurs appareils et porter les futurs droits Gratuit/Premium. Il ne doit pas etre requis pour comprendre les bases d'un cours.

Le choix fournisseur est reporte. La couche applicative doit dependre d'interfaces neutres, documentees dans `src/types/account.ts`.

## Options comparees

| Option | Forces | Risques | Fit migration | Decision |
| --- | --- | --- | --- | --- |
| Auth geree par fournisseur externe | Mise en route rapide, securite deleguee, recuperation mot de passe incluse | Verrouillage fournisseur, couts, contraintes RGPD a verifier | Moyen | Candidate, pas selectionnee |
| Backend leger avec base geree | Controle fin du modele de donnees et des droits | Plus de maintenance, securite serveur a assumer | Moyen | Candidate, pas selectionnee |
| Hybride local puis synchronisation | Respecte l'existant localStorage, fonctionne hors compte, migration douce | Conflits a fusionner, UX de synchronisation a soigner | Eleve | Option cible provisoire |

## Donnees ciblees

| Donnee | Necessaire visiteur | Necessaire compte gratuit | Necessaire premium | Remarque confidentialite |
| --- | --- | --- | --- | --- |
| Email | Non | Oui | Oui | Jamais requis pour lire les bases. |
| Nom affiche | Non | Optionnel | Optionnel | Ne pas pre-remplir par faux utilisateur. |
| Progression chapitre | Locale | Synchronisable | Synchronisable detaillee | Conserver copie locale pendant la migration. |
| SRS flashcards | Locale | Synchronisable | Synchronisable complete | Fusion par meilleure date et meilleur intervalle. |
| Preferences DYS | Locale | Synchronisable optionnelle | Synchronisable optionnelle | Pas de profil medical explicite. |
| Statut Premium | Non | Non | Oui | Controle serveur futur, jamais CSS-only. |
| Analytics | Consentement separe | Consentement separe | Consentement separe | Ne pas lier automatiquement au compte. |

## Droits et roles

Roles cibles :

- Visiteur : contenu public, apercus, progression locale minimale.
- Gratuit : progression synchronisee simple, revisions limitees, contenus essentiels.
- Premium : contenus et revisions avances selon matrice dediee du prompt 26.
- Enseignant : futur espace classe, hors perimetre actif.

Droits abstraits proposes dans `src/types/account.ts` :

- `read-public-content`
- `save-local-progress`
- `sync-progress`
- `use-limited-personalization`
- `use-premium-content`
- `manage-classroom`

## Migration localStorage vers synchronisation

Le compte futur doit lire les cles deja cadrees :

- `gamification_state`
- `srs_cards`
- `pc-platform-progress-v1`
- `pc-platform-progress-v2`

Regles :

- ne jamais supprimer automatiquement les cles legacy ;
- conserver l'usage hors ligne ;
- fusionner les meilleurs scores, meilleurs ratios, XP maximum et dates SRS les plus utiles ;
- signaler les conflits sans afficher les valeurs sensibles ;
- permettre a l'utilisateur de rester en mode local.

## Confidentialite et securite

Exigences non negociables :

- aucun secret cote client ;
- aucune dependance auth ajoutee sans prompt dedie ;
- aucune information Premium controlee uniquement par CSS ;
- aucune creation automatique de compte ;
- aucune donnee personnelle inventee dans l'UI publique ;
- formulaires avec labels, `autocomplete`, erreurs associees et etats clavier ;
- consentement analytics separe de la creation de compte.

## Interfaces abstraites

`src/types/account.ts` definit :

- les modes fournisseurs candidats ;
- les plans et statuts de compte ;
- une configuration publique inactive ;
- un instantane de session neutre ;
- un plan de synchronisation de progression ;
- les exigences minimales des formulaires.

Ces types ne declenchent aucune implementation active. Le rollback consiste a retirer le fichier de types et cette documentation.

