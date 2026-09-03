# C23 — Mathématiques intégrées à l’enseignement scientifique en Première

## Verdict

**GO SANS RÉSERVE sur le périmètre fonctionnel C23.**

La mission publie le module de mathématiques intégré à l’enseignement scientifique de Première générale, conformément au programme officiel applicable à la rentrée 2026-2027, sans créer une troisième discipline publique et sans modifier les routes ou identifiants des contenus déjà publiés.

Le commit fonctionnel de référence est `a06ce904cc2ff1ab208b507bb5ef7d814b45d389`.

## Source officielle

- Bulletin officiel n° 14 du 2 avril 2026.
- NOR : `MENE2602916A`.
- Application : rentrée scolaire 2026-2027.
- Source : https://www.education.gouv.fr/bo/2026/Hebdo14/MENE2602916A
- Identifiant interne : `bo-2026-mathematiques-premiere-es-integrees`.
- Registre curriculaire : `mathematiques-integrees-es-premiere-2026`.

Le niveau éditorial public `/mathematiques/lycee/1ere-generale` est reconnu comme alias du même programme curriculaire intégré ; aucune version concurrente du programme n’a été créée.

## Périmètre éditorial

C23 publie cinq chapitres :

1. `analyse-information-chiffree` — analyse de l’information chiffrée ;
2. `phenomenes-aleatoires` — phénomènes aléatoires ;
3. `variation-lineaire` — variation linéaire ;
4. `modelisation-quadratique` — modélisation quadratique ;
5. `variation-exponentielle` — variation exponentielle.

Les automatismes restent **transversaux** et sont distribués dans les chapitres. Ils ne sont pas transformés artificiellement en sixième chapitre.

## Ressources livrées

Le corpus C23 comprend :

- 5 cours structurés ;
- 30 exercices progressifs N1, N2 et N3, soit 6 exercices par chapitre ;
- 25 questions de quiz, soit 5 par chapitre ;
- 30 flashcards, soit 6 par chapitre ;
- métadonnées, source BO, objectifs et indexation cohérents sur les cinq paquets.

Les tests dédiés vérifient les paquets pédagogiques, la source officielle, la couverture textuelle du programme et l’activation atomique du niveau.

## Bornes pédagogiques verrouillées

Les contrôles C23 empêchent notamment les extensions hors programme suivantes :

- les automatismes ne deviennent pas un chapitre autonome ;
- l’analyse bivariée couvre tableaux croisés, nuages de points, point moyen, ajustement affine, interpolation et extrapolation, sans imposer une théorie des moindres carrés ;
- les répétitions d’épreuves de Bernoulli sont traitées par arbres jusqu’à quatre répétitions ;
- le calcul des racines du second degré par discriminant n’est pas introduit comme exigible dans ce module ;
- aucune formule générale du sommet n’est imposée ;
- les fonctions exponentielles sont introduites sous la forme `x ↦ a^x` pour `a > 0` et `x >= 0`, avec les propriétés algébriques admises dans le périmètre du programme ;
- les logarithmes ne sont pas introduits pour résoudre les problèmes de seuil ;
- la migration générale des figures statiques vers LaTeX/TikZ/PGFPlots reste réservée à C30-C31.

## Publication

L’activation a été faite après une phase staged entièrement verte.

État final :

- `1ere-generale` : `available` ;
- les cinq `meta.json` : `seo.noindex: false` ;
- recherche globale : contenus C23 inclus ;
- progression et identifiants canoniques : contrat existant conservé ;
- aucune nouvelle discipline publique ;
- snapshot de distribution : 265 pages.

Six nouvelles routes publiques sont ajoutées :

- `/mathematiques/lycee/1ere-generale`
- `/mathematiques/lycee/1ere-generale/analyse-information-chiffree`
- `/mathematiques/lycee/1ere-generale/phenomenes-aleatoires`
- `/mathematiques/lycee/1ere-generale/variation-lineaire`
- `/mathematiques/lycee/1ere-generale/modelisation-quadratique`
- `/mathematiques/lycee/1ere-generale/variation-exponentielle`

## Performance de l’accueil

La publication des cinq nouveaux chapitres a initialement fait dépasser le budget HTML de l’accueil, car la totalité du corpus de recherche est sérialisée pour `GlobalSearch`.

Le budget n’a pas été relevé. Le payload a été compacté sans perte fonctionnelle :

- le champ `slug` n’est plus sérialisé lorsqu’il est déjà déductible de `path` ;
- la valeur explicite `accessTier: "free"` n’est plus répétée, car le moteur de recherche utilise déjà `free` comme valeur par défaut ;
- les éventuels tiers non gratuits restent transmis explicitement ;
- titres, descriptions, mots-clés, chemins, niveaux et rattachement disciplinaire sont conservés.

Un test de contrat vérifie désormais directement qu’un résultat compact reste trouvable par son slug dérivé du chemin et qu’une ressource sans `accessTier` explicite reste filtrable comme ressource gratuite.

## Certification CI fonctionnelle

Commit fonctionnel certifié :

`a06ce904cc2ff1ab208b507bb5ef7d814b45d389`

Workflow CI : `33725765932` — run n° 458.

Résultats :

- `quality` : **SUCCESS** ;
- `dist-fast` : **SUCCESS** ;
- `dist-a11y` : **SUCCESS**.

Audit dist-fast :

- pages générées : **265** ;
- routes du snapshot : **265** ;
- routes sitemap : **264** ;
- contrôles : **24 219** ;
- erreurs : **0** ;
- avertissements : **0**.

La CI staged antérieure était également entièrement verte sur `49b5a34540f658d65ba784435f5f020c1e4787a9`, avant l’activation publique.

## Conclusion

C23 apporte le corpus complet de mathématiques intégrées à l’enseignement scientifique en Première générale, le publie de façon atomique et maintient les garde-fous curriculaires, d’accessibilité, de routes et de performance du site.

**Verdict fonctionnel : GO SANS RÉSERVE.**

Le commit contenant le présent rapport doit lui aussi conserver les trois jobs CI verts conformément à la règle de certification du HEAD final de la branche.
