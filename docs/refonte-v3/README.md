# Refonte V3 - Index

Ce dossier cadre la V3 de la plateforme educative mathematiques, physique-chimie et enseignement scientifique.

Etat de la mission : premiere mission documentaire realisee. Aucun fichier actif V2 ne doit etre modifie par ce dossier.

Points a retenir :

- V2 verifiee comme site Astro 5 statique avec React, MDX, KaTeX, sitemap, Zod.
- 112 chapitres detectes par contrat contenu : 101 physique-chimie et 11 mathematiques.
- 25 applications de laboratoire referencees.
- 150 routes publiques attendues par `verify:content`, et 314 pages produites par le build.
- Les tests existants passent et `audit:dist:fast` controle le build V3 avec 0 erreur sur les routes, canoniques, sitemap, robots, JSON-LD, liens et budgets declares.
- Les budgets performance V3 sont controles par `audit-dist` : JS global, CSS global, taille HTML et poids total par page.
- La securite finale V3 declare une CSP et des en-tetes stricts dans `vercel.json`, avec tests dedies.
- Les tests E2E visuels V3 couvrent 8 parcours critiques, 16 captures desktop/mobile/DYS et la route legacy `/mega-quiz`.
- La validation mobile/DYS couvre le 360 px CSS reel, tablette, desktop, DYS et reduced motion avec 18 captures et 0 erreur.
- Le go/no-go final autorise une bascule V3 controlee, avec rollback documente et validations release vertes.
- La V3 doit etre executee en 37 prompts ordonnes, listes dans `19-feuille-de-route-prompts.md`.

Ordre de lecture conseille :

1. `00-resume-executif.md`
2. `01-etat-reference-v2.md`
3. `04-audit-design-images.md`
4. `06-design-system-v3.md`
5. `13-strategie-migration-v2-v3.md`
6. `19-feuille-de-route-prompts.md`
7. `21-conventions-identifiants-nommage.md`
8. `reference/schema-contrat-donnees-v3.md`
9. `reference/carte-routes-redirections-v3.md`
10. `reference/table-tokens-v3.md`
11. `reference/rapport-composants-base-v3-2026-07-27.md`
12. `reference/rapport-navigation-publique-v3-2026-07-27.md`
13. `reference/rapport-accueil-public-v3-2026-07-27.md`
14. `reference/rapport-differenciation-disciplines-v3-2026-07-27.md`
15. `reference/rapport-pages-niveaux-catalogues-v3-2026-07-27.md`
16. `reference/rapport-page-chapitre-v3-2026-07-27.md`
17. `reference/rapport-lecteur-cours-v3-2026-07-27.md`
18. `reference/rapport-exercices-corrections-v3-2026-07-27.md`
19. `reference/rapport-quiz-flashcards-memorisation-v3-2026-07-27.md`
20. `reference/rapport-kit-scientifique-v3-2026-07-28.md`
21. `reference/rapport-laboratoires-accessibles-v3-2026-07-28.md`
22. `reference/rapport-activite-mathematique-pilote-v3-2026-07-28.md`
23. `reference/rapport-recherche-globale-v3-2026-07-28.md`
24. `reference/rapport-accessibilite-dys-systeme-v3-2026-07-28.md`
25. `reference/rapport-progression-migration-stockage-v3-2026-07-28.md`
26. `reference/rapport-tableau-bord-connecte-prototype-v3-2026-07-28.md`
27. `reference/rapport-comptes-architecture-auth-v3-2026-07-28.md`
28. `reference/rapport-matrice-premium-gating-v3-2026-07-28.md`
29. `reference/rapport-migration-contenus-5e-6e-v3-2026-07-28.md`
30. `reference/rapport-migration-contenus-4e-3e-v3-2026-07-28.md`
31. `reference/rapport-migration-maths-seconde-v3-2026-07-28.md`
32. `reference/rapport-migration-lycee-pc-v3-2026-07-28.md`
33. `reference/rapport-enseignement-scientifique-v3-2026-07-28.md`
34. `reference/rapport-seo-donnees-structurees-v3-2026-07-28.md`
35. `reference/rapport-performance-budgets-v3-2026-07-28.md`
36. `reference/rapport-securite-finale-csp-v3-2026-07-28.md`
37. `reference/rapport-tests-e2e-regression-visuelle-v3-2026-07-28.md`
38. `reference/rapport-validation-mobile-dys-v3-2026-07-28.md`
39. `reference/rapport-go-no-go-bascule-v3-2026-07-28.md`
40. `prompts/01-etat-reference-sauvegarde.md`

Le premier prompt a executer est `prompts/01-etat-reference-sauvegarde.md`.

Dernier prompt execute : `prompts/37-preparation-bascule-v3.md`.
