# Comptes Gratuit/Premium

La V3 doit etre compatible avec des comptes, sans imposer maintenant un fournisseur.

Decision prompt 25 : l'architecture de compte reste neutre et inactive. La cible retenue provisoirement est une approche hybride localStorage puis synchronisation, car elle respecte la progression locale existante et permet de garder le site utile sans compte.

Options a comparer plus tard :

- auth geree par fournisseur externe ;
- backend leger avec base geree ;
- solution hybride avec stockage local puis synchronisation.

Reference detaillee : `reference/architecture-comptes-auth-v3.md`.

Decision prompt 26 : la matrice Premium est formalisee dans `reference/matrice-premium-gating-v3.md` et le prototype technique est limite a des types, une fonction de decision et un verrou accessible. Aucun paiement reel, prix, fournisseur auth ou blocage actif de la V2 n'est introduit.

Matrice d'acces cible :

| Ressource | Visiteur | Gratuit | Premium |
|---|---|---|---|
| Apercu chapitres | oui | oui | oui |
| Cours essentiels | partiel | oui | oui |
| Exercices niveau 1 | demo | selection | tous |
| Corrections essentielles | demo | oui | oui |
| Corrections detaillees | non | limitees | oui |
| Quiz | demo | limites | illimites |
| Flashcards | demo | limitees | completes |
| Laboratoire | demo | selection | complet |
| Kit scientifique | apercu | partiel | complet |
| Progression | non | simple | detaillee |
| Revision personnalisee | non | limitee | complete |
| Annales/fiches PDF | apercu | selection | toutes |

Le prix Premium reste `a definir`. Aucun controle Premium ne doit etre uniquement visuel ou CSS.

Etats de gating prepares : `allow`, `preview`, `account-required`, `upgrade-required`, `teacher-only`, `draft-hidden`.

Principes obligatoires :

- aucun compte requis pour comprendre les bases ;
- aucune dependance auth ou paiement sans prompt dedie ;
- aucun secret cote client ;
- migration localStorage non destructive ;
- formulaires d'inscription sobres, accessibles et compatibles clavier ;
- consentement analytics separe de la creation de compte.
