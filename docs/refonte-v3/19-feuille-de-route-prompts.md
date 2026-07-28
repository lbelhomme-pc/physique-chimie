# Feuille de route des prompts V3

Nombre exact de prompts : 37.

| # | Prompt | Objectif | Risque | Tests principaux | Passage au suivant |
|---:|---|---|---|---|---|
| 01 | etat-reference-sauvegarde | figer V2 | eleve | check, test, build | reference partagee |
| 02 | correctifs-securite-critiques | fermer risques directs | eleve | tests securite | 0 regression |
| 03 | chaine-qualite-ci | fiabiliser validations | moyen | CI locale | commandes stables |
| 04 | inventaire-code-mort-doc | nettoyer sans supprimer | moyen | lint | inventaire signe |
| 05 | conventions-identifiants-nommage | cadrer IDs/routes | eleve | tests IDs | aliases OK |
| 06 | contrat-donnees-commun-v2 | schema V3 | eleve | schema tests | donnees valides |
| 07 | routes-redirections-canoniques | routes cibles | eleve | route tests | redirections prouvees |
| 08 | design-tokens-v3 | tokens | moyen | build, visuel | tokens utilisables |
| 09 | design-system-composants-base | composants | moyen | story/proto | etats couverts |
| 10 | navigation-publique-v3 | navigation | moyen | e2e clavier | parcours clair |
| 11 | accueil-public-v3 | premiere page | moyen | visuel, a11y | sans faux chiffres |
| 12 | differenciation-disciplines | identites | moyen | a11y couleur | disciplines claires |
| 13 | pages-niveaux-catalogues | catalogues | moyen | routes | contenu trouvable |
| 14 | page-chapitre-v3 | shell chapitre | eleve | route + a11y | aucun contenu perdu |
| 15 | lecteur-cours-v3 | cours | eleve | MDX + a11y | structure stable |
| 16 | exercices-corrections | exercices | eleve | schema + UI | corrections OK |
| 17 | quiz-flashcards-memorisation | memorisation | eleve | SRS/tests | progression OK |
| 18 | kit-scientifique-v3 | methodes | moyen | tests outils | fiches coherentes |
| 19 | laboratoires-accessibles | labos | eleve | modeles + a11y | alternatives OK |
| 20 | activites-mathematiques | maths interactives | moyen | tests UI | pilote OK |
| 21 | recherche-globale | recherche | moyen | corpus tests | resultats pertinents |
| 22 | accessibilite-dys-systeme | DYS | eleve | axe + manuel | 9/10 DYS |
| 23 | progression-migration-stockage | progression | eleve | migration | idempotence |
| 24 | tableau-bord-connecte-prototype | dashboard | moyen | e2e | donnees mockees claires |
| 25 | comptes-architecture-auth | auth future | eleve | revue secu | pas de fournisseur impose |
| 26 | matrice-premium-gating | droits | eleve | tests acces | pas de CSS-only |
| 27 | migration-contenus-5e-6e | college bas | moyen | contenu + build | lot valide |
| 28 | migration-contenus-4e-3e | college haut | moyen | contenu + build | lot valide |
| 29 | migration-maths-seconde | maths pilote | moyen | maths tests | lot valide |
| 30 | migration-lycee-pc | lycee PC | eleve | contenu + build | lot valide |
| 31 | enseignement-scientifique | discipline | eleve | revue pedago | identite propre |
| 32 | seo-donnees-structurees | SEO | moyen | audit SEO | sitemap OK |
| 33 | performance-budgets | perf | eleve | budgets | bundles OK |
| 34 | securite-finale-csp | CSP | eleve | audit secu | en-tetes OK |
| 35 | tests-e2e-regression-visuelle | E2E | eleve | e2e/visuel | parcours verts |
| 36 | validation-mobile-dys | mobile + DYS | eleve | captures | aucun overlap |
| 37 | preparation-bascule-v3 | bascule | eleve | ci complete | go/no-go |

Chaque fichier de prompt dans `prompts/` reprend la structure obligatoire du prompt maitre.
