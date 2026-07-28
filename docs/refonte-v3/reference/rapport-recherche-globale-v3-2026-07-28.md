# Rapport prompt 21 - Recherche globale V3

Date d'execution : 2026-07-28

Prompt execute : `docs/refonte-v3/prompts/21-recherche-globale.md`

## Sources lues

- `docs/refonte-v3/README.md`
- `docs/refonte-v3/00-resume-executif.md`
- `docs/refonte-v3/prompts/21-recherche-globale.md`
- `docs/refonte-v3/19-feuille-de-route-prompts.md`
- `src/components/search/GlobalSearch.tsx`
- `src/pages/index.astro`
- `src/data/chapters/`
- `src/data/mathematiques/`
- tests existants lies a l'accueil, aux routes et au corpus de recherche

## Perimetre realise

La recherche globale V3 a ete refondue sans modifier les contenus sources. Le travail porte sur l'index leger, la pertinence des resultats, l'interface de recherche et les tests.

## Fichiers ajoutes ou modifies

- `src/data/searchIndex.ts` : module d'index et de scoring testable.
- `src/components/search/GlobalSearch.tsx` : combobox, filtres, resultats enrichis et navigation clavier.
- `src/pages/index.astro` : enrichissement des ressources avec `slug` et `accessTier`.
- `tests/recherche-globale-v3.test.mjs` : tests titre, slug, mot-cle, filtres et accessibilite structurelle.
- `docs/refonte-v3/README.md` : ajout du rapport et changement du dernier prompt execute.

## Fonctionnement V3

La recherche utilise un corpus local construit au build depuis les metadonnees publiees. Chaque ressource expose :

- discipline ;
- cycle et niveau ;
- type de ressource ;
- acces ;
- titre, description, slug et mots-cles.

Le scoring donne la priorite au titre, au slug et aux mots-cles. Les requetes courtes comme `pH` ne sont pas comparees aux champs larges de description ou de discipline pour eviter des resultats parasites.

## Cas testes

- recherche par titre : `circuits` ;
- recherche par slug : `fonctions-generalites` ;
- recherche par mot-cle : `antecedent` ;
- filtre discipline + cycle + acces : `pH` en physique-chimie, lycee, premium ;
- absence de faux positif `pH` dans les ressources gratuites ;
- presence de la combobox, de la liste de resultats et des filtres accessibles ;
- conservation de l'ancre publique `#recherche`.

## Accessibilite et clavier

Le champ de recherche expose un role `combobox`, relie a une liste `listbox`. Les resultats sont des options selectionnables et restent des liens directs. Les touches fleche haut/bas changent le resultat actif et `Entrer` ouvre le resultat selectionne.

## Performance

L'index reste leger : les donnees sont deja disponibles dans la page d'accueil et le moteur effectue une normalisation simple, un filtrage local et une limite a 12 resultats.

## Validation

Commandes executees :

- `npm.cmd test` : reussi, 166 tests passes.
- `npm.cmd run check` : reussi, 0 erreur et 0 avertissement ; 22 indications existantes hors perimetre.
- `npm.cmd run build` : reussi, 314 pages generees.

Validation locale :

- `http://127.0.0.1:4321/#recherche` : reponse HTTP 200.

## Comparaison avant/apres

Avant :

- recherche textuelle simple par discipline ;
- pas de scoring explicite ;
- pas de filtre cycle/acces ;
- slug et acces non exposes dans le corpus.

Apres :

- resultats classes par pertinence ;
- recherche par titre, slug et mot-cle ;
- filtres discipline, cycle et acces ;
- badges type et acces dans chaque resultat ;
- combobox documentee par attributs ARIA et navigation clavier.

## Procedure de retour arriere

1. Restaurer l'ancien `src/components/search/GlobalSearch.tsx`.
2. Retirer `src/data/searchIndex.ts`.
3. Retirer les champs `slug` et `accessTier` ajoutes aux ressources dans `src/pages/index.astro`.
4. Supprimer `tests/recherche-globale-v3.test.mjs`.
5. Relancer `npm.cmd test` et `npm.cmd run build`.

## Evaluation selon les six criteres d'AGENTS.md

### Critere 1 - Architecture et maintenabilite : 9/10

Preuves : la logique de recherche est extraite dans `src/data/searchIndex.ts`, le composant UI consomme `searchResources`, et les types sont centralises. La page d'accueil ne fait qu'enrichir le corpus existant.

### Critere 2 - UX, UI et coherence du design : 9/10

Preuves : les resultats affichent titre, description, discipline, niveau, matiere, type et acces. Les filtres discipline, cycle et acces rendent les resultats plus scannables sans creer une nouvelle page.

### Critere 3 - Qualite pedagogique et scientifique : 9/10

Preuves : la recherche privilegie titre, slug et mots-cles de notions ; le cas `pH` evite les faux positifs issus de champs larges. Les tests couvrent titre, slug et mot-cle.

### Critere 4 - Accessibilite et DYS : 9/10

Preuves : le champ utilise `role="combobox"`, `aria-controls`, `aria-expanded`, `aria-activedescendant`, une liste `role="listbox"` et des options selectionnables. La navigation fleches + entree est prise en charge.

### Critere 5 - Qualite technique globale : 9/10

Preuves : pas d'evaluation dynamique, index local leger, limite de 12 resultats, `npm.cmd run check` sans erreur, `npm.cmd run build` reussi.

### Critere 6 - Completude, migration et validation : 9/10

Preuves : aucun contenu source n'a ete modifie, les routes restent celles du corpus existant, l'ancre `#recherche` est conservee, `npm.cmd test` passe avec 166 tests et le build genere 314 pages.
