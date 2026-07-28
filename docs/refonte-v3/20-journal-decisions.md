# Journal des decisions

2026-07-27 - Premiere mission V3.

Decisions :

- Ne pas modifier les routes, pages, contenus ou composants actifs durant cette mission.
- Creer `docs/refonte-v3/` comme dossier de pilotage.
- Fusionner `AGENTS.md` avec les regles V3 tout en conservant les exigences pedagogiques 5e utiles.
- Retenir 37 prompts, car les chantiers a risque doivent etre separes.
- Utiliser la V2 existante comme socle Astro au lieu de repartir de zero.
- Marquer le prix Premium comme `a definir`.
- Traiter `audit:dist` comme validation a segmenter, car le script a depasse 4 minutes.

Elements devenus obsoletes dans l'audit de mai :

- le BO n'est plus absent : plusieurs PDF sont presents dans `BO/`.
- les pages de chapitre transmettent des metadonnees SEO au layout.
- une politique de confiance HTML/SVG existe dans `src/utils/trustedContent.ts`.

Points ouverts :

- verification visuelle systematique des maquettes V3 ;
- choix futur d'authentification ;
- hebergement local des polices ;
- segmentation de `audit:dist`.
