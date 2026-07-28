# Matrice Premium et gating V3

Date : 2026-07-28

Statut : cible documentaire et prototype inactif. Aucun paiement reel, aucune restriction active V2.

## Decision

La V3 prepare un modele Gratuit/Premium sans bloquer la comprehension de base. Le Premium sert uniquement a l'approfondissement, au confort de revision, au suivi avance et aux usages enseignants futurs.

Le gating n'est jamais CSS-only : une classe ou un style peut afficher le verrou, mais la decision doit venir d'une fonction d'acces, puis plus tard d'une verification serveur ou edge quand l'authentification reelle existera.

## Matrice par ressource

| Ressource | Visiteur | Gratuit | Premium | Enseignant | Role Premium |
| --- | --- | --- | --- | --- | --- |
| Apercu des chapitres | Autorise | Autorise | Autorise | Autorise | Aucun |
| Cours essentiels | Apercu | Autorise | Autorise | Autorise | Aucun |
| Exercices niveau 1 | Apercu | Autorise | Autorise | Autorise | Aucun |
| Corrections essentielles | Apercu | Autorise | Autorise | Autorise | Aucun |
| Corrections detaillees | Compte requis | Apercu | Autorise | Autorise | Approfondissement |
| Quiz | Apercu | Apercu limite | Autorise | Autorise | Confort |
| Flashcards | Apercu | Apercu limite | Autorise | Autorise | Confort |
| Laboratoire | Apercu | Apercu limite | Autorise | Autorise | Approfondissement |
| Kit scientifique | Apercu | Apercu limite | Autorise | Autorise | Confort |
| Progression personnalisee | Compte requis | Autorise simple | Autorise | Autorise | Suivi |
| Revision personnalisee | Compte requis | Apercu limite | Autorise | Autorise | Suivi |
| Annales et fiches PDF | Apercu | Apercu limite | Autorise | Autorise | Confort |

## Etats techniques

| Etat | Sens | CTA cible |
| --- | --- | --- |
| `allow` | La ressource est accessible. | Aucun |
| `preview` | Un extrait utile reste visible. | Connexion ou Premium selon le contexte |
| `account-required` | Le compte est requis pour enregistrer ou personnaliser. | Connexion |
| `upgrade-required` | La ressource est un approfondissement Premium. | Acces Premium |
| `teacher-only` | Ressource reservee aux enseignants. | Demande enseignant |
| `draft-hidden` | Ressource non publiee. | Aucun |

## Regles pedagogiques

- Le contenu essentiel non bloque inclut les notions, exemples de base, exercices niveau 1 et corrections indispensables.
- Le Premium ne doit pas rendre impossible la progression d'un eleve sans compte.
- Les corrections detaillees, series illimitees, flashcards avancees, annales completes et analyses de progression peuvent relever du confort ou de l'approfondissement.
- Le message de verrou doit expliquer la valeur ajoutee sans culpabiliser l'eleve.

## Regles UX et accessibilite

- Le verrou reste discret, proche de la ressource concernee et comprehensible sans couleur.
- Le prototype utilise `role="note"`, `aria-labelledby` et un prefixe lisible par lecteur d'ecran.
- Le CTA est un lien clavier accessible, avec focus visible.
- L'apercu doit rester lisible : pas de texte floute comme seule information, pas de superposition qui masque une consigne essentielle.

## Regles securite et performance

- Pas de secret, de paiement, de fournisseur auth ou de prix dans cette etape.
- Pas de CSS-only gating : la decision vient de `resolveAccessGate`.
- Quand l'auth reelle sera ajoutee, le contenu Premium complet ne devra pas etre envoye au client non autorise.
- Le prototype actuel ne protege rien : il prepare le contrat UI et les etats, sans modifier les routes V2.

## Artefacts associes

- `src/types/accessControl.ts` : matrice versionnee et fonction de decision.
- `src/components/access/PremiumGatePrototype.astro` : prototype de verrou accessible.
- `tests/premium-gating-v3.test.mjs` : tests des etats d'acces et des garde-fous.
