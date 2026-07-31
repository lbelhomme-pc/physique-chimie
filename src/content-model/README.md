# Content model V3

Ce dossier est la facade V3 du modele de contenu.

Les donnees pedagogiques restent dans `src/data/chapters/` et `src/data/mathematiques/chapters/`
pendant la migration progressive. Le contrat, les adaptateurs, l'audit et les routes sont
encore implementes dans `src/data/` pour conserver la compatibilite V2, puis exposes ici
pour les nouveaux imports V3.

Objectifs :

- offrir un point d'entree clair pour le contrat de contenu V3 ;
- eviter de deplacer massivement les contenus actifs ;
- preparer un futur deplacement interne sans changer les imports applicatifs V3 ;
- garder les routes legacy, les alias de progression et les validations existantes.

Import conseille pour les nouveaux fichiers :

```ts
import { auditContentContracts, CONTENT_CONTRACT_VERSION } from "../content-model";
```

