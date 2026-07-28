# Rapport prompt 25 - Architecture future des comptes V3

Date : 2026-07-28

Prompt execute : `docs/refonte-v3/prompts/25-comptes-architecture-auth.md`

## Sources lues

- `docs/refonte-v3/README.md`
- `docs/refonte-v3/00-resume-executif.md`
- `docs/refonte-v3/prompts/25-comptes-architecture-auth.md`
- `docs/refonte-v3/11-comptes-gratuit-premium.md`
- `src/config/site.ts`
- `src/data/contentContract.ts`
- `src/data/contentAdapters.ts`
- `docs/refonte-v3/reference/schema-contrat-donnees-v3.md`
- `docs/refonte-v3/19-feuille-de-route-prompts.md`

## Livrables produits

- `docs/refonte-v3/reference/architecture-comptes-auth-v3.md` : architecture cible neutre, options comparees, donnees, droits, confidentialite, migration localStorage et formulaires accessibles.
- `src/types/account.ts` : interfaces abstraites sans implementation active, fournisseur neutre, compte desactive par defaut.
- `tests/account-architecture-v3.test.mjs` : revue securite documentaire automatisee.
- `docs/refonte-v3/11-comptes-gratuit-premium.md` : ajout de la decision prompt 25 et des principes obligatoires.
- `docs/refonte-v3/README.md` : index V3 mis a jour.

## Options comparees

| Option | Synthese | Decision |
| --- | --- | --- |
| Auth geree par fournisseur externe | Rapide et securite deleguee, mais verrouillage fournisseur et couts a verifier. | Candidate, non selectionnee. |
| Backend leger avec base geree | Controle fin des donnees et droits, mais plus de maintenance serveur. | Candidate, non selectionnee. |
| Hybride localStorage puis synchronisation | Respecte la progression locale et garde l'usage hors compte. | Cible provisoire recommandee. |

## Decisions de securite

- Aucun fournisseur impose.
- Aucune dependance auth ou paiement ajoutee.
- Aucun secret cote client.
- Aucune route d'inscription ou connexion active creee.
- Aucun statut Premium controle uniquement par CSS.
- Analytics et compte restent deux consentements separes.
- Compte non requis pour comprendre les bases pedagogiques.

## Migration prevue

Les cles locales existantes restent la source de depart :

- `gamification_state`
- `srs_cards`
- `pc-platform-progress-v1`
- `pc-platform-progress-v2`

Regles retenues : preservation de la copie locale, usage hors ligne, fusion par meilleurs scores et dates SRS utiles, aucun effacement automatique.

## Validation

- `npm.cmd test -- tests/account-architecture-v3.test.mjs` : OK, 184 tests passes via le script de test global.
- `npm.cmd run check` : OK, 0 erreur, 0 avertissement, 22 indications existantes hors perimetre.

## Procedure de retour arriere

Retirer `src/types/account.ts`, `tests/account-architecture-v3.test.mjs`, `docs/refonte-v3/reference/architecture-comptes-auth-v3.md` et revenir a la version precedente de `docs/refonte-v3/11-comptes-gratuit-premium.md`. Aucun code actif, fournisseur, secret ou paiement n'ayant ete ajoute, le retour arriere est documentaire.

## Notes par critere

| Critere | Note | Justification |
| --- | ---: | --- |
| Architecture et maintenabilite | 9.4/10 | Les interfaces sont neutres, versionnees et separees de toute implementation fournisseur. |
| UX, UI et coherence du design | 9.0/10 | Les principes d'inscription sobre et les exigences de formulaires accessibles sont documentes sans creer d'ecran premature. |
| Qualite pedagogique et scientifique | 9.2/10 | Le compte n'est pas requis pour les bases ; progression, SRS et revisions restent compatibles avec l'existant local. |
| Accessibilite et DYS | 9.1/10 | Les exigences de champs, labels, `autocomplete`, erreurs et navigation clavier sont posees pour les futurs formulaires. |
| Qualite technique globale | 9.4/10 | Aucun secret, aucune dependance auth/paiement, aucun fournisseur impose ; check et revue documentaire passent. |
| Completude, migration et validation | 9.3/10 | Options comparees, donnees et droits cadres, migration localStorage documentee, tests conceptuels et check executes. |

