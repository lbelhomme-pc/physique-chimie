# C13 — JSON-LD Unicode et accents français

## CONTEXTE / COMMIT DE DÉPART

- Dépôt : `lbelhomme-pc/physique-chimie`
- Branche de travail : `audit-2026-c01-route-snapshot`
- Base C13 : `18b4d80bc9b624fa0e9bb65dd5c3d5533f9ee463` (`C12: finalize GO report`)
- Mission issue du plan d'amélioration : corriger les chaînes Unicode/mojibake du JSON-LD et tester les accents.

## OBJECTIF UNIQUE

Garantir que les données structurées Schema.org produites par `src/config/site.ts` utilisent les libellés français exacts en UTF-8 et empêcher toute réintroduction de chaînes mojibake dans cette couche SEO.

## DÉFAUT CONSTATÉ

Le JSON-LD utilisait plusieurs chaînes corrompues alors que le reste de la configuration du site utilisait déjà correctement l'UTF-8 :

- `MathÃ©matiques` au lieu de `Mathématiques` ;
- `CollÃ¨ge` au lieu de `Collège` ;
- `LycÃ©e` au lieu de `Lycée` ;
- `CollÃ¨ge / LycÃ©e` au lieu de `Collège / Lycée`.

Les tests SEO existants validaient la présence et la structure du JSON-LD mais ne vérifiaient pas l'exactitude Unicode de ces valeurs.

## MODIFICATIONS APPLIQUÉES

### `src/config/site.ts`

Les libellés JSON-LD ont été corrigés à leur source :

- `SUBJECT_LABELS.mathematiques` → `Mathématiques` ;
- `CYCLE_LABELS.college` → `Collège` ;
- `CYCLE_LABELS.lycee` → `Lycée` ;
- valeur de repli `educationalLevel` → `Collège / Lycée`.

Aucune modification n'a été apportée à la structure Schema.org, aux URL canoniques, au SearchAction, aux types de ressources, à l'analytics ou au comportement fonctionnel du site.

### `tests/jsonld-unicode.test.mjs`

Un test C13 dédié a été ajouté pour verrouiller :

1. les libellés exacts `Mathématiques`, `Collège` et `Lycée` ;
2. la conservation exacte des accents dans les titres et descriptions injectés dans le JSON-LD ;
3. le cas de repli `Collège / Lycée` ;
4. la valeur `Enseignement scientifique` ;
5. la chaîne produite par `JSON.stringify`, donc le format réellement transmis au `<script type="application/ld+json">` du layout ;
6. l'absence des marqueurs de mojibake `Ã`, `Â` et du caractère de remplacement `�` dans le JSON-LD sérialisé ;
7. l'absence de ces mêmes marqueurs dans `src/config/site.ts`.

## COMMITS C13

- `c867c04b497e4eea141f6812f9f2d4dd86060568` — `C13: fix JSON-LD Unicode labels`
- `67c248d3a3fd3d0e32f9b28104c4a4b3d7852b79` — `C13: test exact JSON-LD Unicode accents`

## VALIDATION CI

Workflow GitHub Actions : run `33478551876` sur le commit `67c248d3a3fd3d0e32f9b28104c4a4b3d7852b79`.

- `quality` : PASS ;
- `dist-fast` : PASS ;
- `dist-a11y` : PASS.

Le build complet reste donc compatible avec la correction Unicode et aucun impact accessibilité ou audit de distribution n'est détecté.

## ÉTAT À PRÉSERVER

- UTF-8 natif dans les sources ;
- aucune conversion manuelle Latin-1/Windows-1252 ;
- aucune chaîne mojibake tolérée dans la configuration JSON-LD ;
- titres et descriptions fournis par les pages conservés tels quels ;
- structure Schema.org inchangée hors correction des valeurs textuelles ;
- `inLanguage: "fr-FR"` inchangé ;
- URL canoniques et identifiants `@id` inchangés.

## RETOUR ARRIÈRE

En cas de régression indépendante de C13, revenir au commit de base `18b4d80bc9b624fa0e9bb65dd5c3d5533f9ee463`.

Un retour arrière partiel qui supprimerait uniquement les tests Unicode n'est pas recommandé : il réintroduirait la possibilité de publier silencieusement du mojibake dans les données structurées.

## CRITÈRES GO / NO-GO

### GO

- `Mathématiques`, `Collège`, `Lycée` et `Collège / Lycée` sont produits exactement ;
- les accents des titres/descriptions survivent à la construction puis à la sérialisation JSON-LD ;
- aucun marqueur `Ã`, `Â` ou `�` n'apparaît dans la couche JSON-LD ;
- `quality`, `dist-fast` et `dist-a11y` sont verts ;
- aucune régression des données structurées existantes.

### NO-GO

- une chaîne française sort encore corrompue ;
- la sérialisation transforme ou perd un accent ;
- un marqueur de mojibake réapparaît ;
- un des trois checks CI obligatoires échoue ;
- la correction modifie les URL, le schéma ou le comportement fonctionnel sans nécessité.

## VALIDATION FINALE

**Décision : GO.**

C13 corrige le défaut Unicode identifié par l'audit et ajoute une protection automatisée spécifique. Les trois checks CI obligatoires sont verts sur le commit fonctionnel validé.

**C13 est terminé et validé.**
