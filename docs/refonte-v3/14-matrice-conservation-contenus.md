# Matrice de conservation des contenus

| Type | Etat V2 | Cible V3 | Conservation |
|---|---|---|---|
| Meta chapitres | JSON heterogene | contrat commun versionne | garder puis normaliser |
| Cours | MDX | lecons structurees | migrer sans perte |
| Exercices | JSON | niveaux, aides, corrections | enrichir par lots |
| Quiz | JSON | questions + feedback | conserver IDs |
| Flashcards | JSON | SRS, tags, liens | conserver IDs |
| Laboratoires | configs + scripts | lab accessible | ajouter HTML alternatif |
| Formules | KaTeX/texte | KaTeX accessible | pas d'image raster |
| Schemas | SVG/HTML | SVG avec title/desc | corriger accessibilite |
| Progression | localStorage | IDs canoniques + future synchro | migration idempotente |
| SEO | layout + meta | schema par type | verifier route par route |

Aucune ligne ne doit etre supprimee sans trace dans `20-journal-decisions.md`.
