# Rapport prompt 20 - Activite mathematique pilote V3

Date d'execution : 2026-07-28

Prompt execute : `docs/refonte-v3/prompts/20-activites-mathematiques.md`

## Sources lues

- `docs/refonte-v3/README.md`
- `docs/refonte-v3/00-resume-executif.md`
- `docs/refonte-v3/prompts/20-activites-mathematiques.md`
- `docs/refonte-v3/09-structures-pedagogiques-v3.md`
- `src/data/mathematiques/`
- `src/components/mathematiques/`
- `src/components/pedagogie/ChapterPageShell.astro`
- `src/components/pedagogie/ChapterTabs.astro`
- `src/pages/mathematiques/lycee/[niveau]/[chapitre].astro`

## Perimetre realise

Une activite interactive pilote de mathematiques a ete ajoutee sur le chapitre de seconde `fonctions-generalites`, sans migration globale des contenus mathematiques.

L'activite permet d'explorer une fonction affine `f(x) = ax + b` :

- modifier les parametres `a`, `b` et `x` ;
- observer la valeur de `f(x)` et la droite associee ;
- comparer les images dans un tableau accessible ;
- formuler une conjecture sur le sens de variation ;
- valider la conjecture avec un retour explicite.

## Fichiers ajoutes ou modifies

- `src/data/mathematiques/activities.ts` : configuration isolee de l'activite pilote.
- `src/utils/mathematicsAffineActivity.ts` : calculs purs, table de valeurs, validation de conjecture et formatage.
- `src/components/mathematiques/AffineFunctionExplorer.astro` : surface interactive, graphique SVG, tableau alternatif et retours accessibles.
- `src/components/pedagogie/ChapterTabs.astro` : onglet optionnel `Activite`.
- `src/components/pedagogie/ChapterPageShell.astro` : emplacement optionnel pour une activite de chapitre.
- `src/pages/mathematiques/lycee/[niveau]/[chapitre].astro` : injection du pilote uniquement quand le chapitre correspond.
- `tests/mathematiques-activite-pilote-v3.test.mjs` : tests de calcul, isolation, integration et garde de securite.

## Usage

Le pilote est disponible sur la page :

`/mathematiques/lycee/2nde/fonctions-generalites/`

Dans le chapitre, l'utilisateur ouvre l'onglet `Activite`, manipule les curseurs, lit le tableau de valeurs puis choisit une conjecture. L'activite reste utilisable au clavier grace aux controles natifs et au tableau de valeurs.

## Limites assumees

- Le pilote couvre uniquement les fonctions affines dans le chapitre de seconde `fonctions-generalites`.
- Les autres chapitres mathematiques ne recoivent pas encore d'activite interactive.
- Le graphique SVG est volontairement borne a une fenetre fixe pour garder une lecture simple.
- Aucune expression saisie librement n'est evaluee : l'activite ne contient pas d'`eval` arbitraire.

## Validation

Commandes executees :

- `npm.cmd test` : reussi, 161 tests passes.
- `npm.cmd run check` : reussi, 0 erreur et 0 avertissement ; 22 indications existantes conservees.
- `npm.cmd run build` : reussi, 314 pages generees.

Tests obligatoires couverts :

- valeurs de `f(x)` et table de valeurs ;
- detection du sens de variation ;
- validation des conjectures ;
- presence des parametres, observation, conjecture, validation et tableau ;
- isolation de l'activite au chapitre pilote ;
- absence de `eval` ou `new Function` dans le composant.

## Comparaison avant/apres

Avant :

- les pages mathematiques conservaient cours, exercices, quiz et flashcards sans surface interactive pilote.

Apres :

- le chapitre pilote dispose d'un onglet `Activite` optionnel ;
- les routes mathematiques existantes sont conservees ;
- les chapitres sans activite ne changent pas de parcours.

## Procedure de retour arriere

Pour retirer le pilote :

1. Supprimer l'import et la prop `ActivityContent` dans `src/pages/mathematiques/lycee/[niveau]/[chapitre].astro`.
2. Supprimer `src/components/mathematiques/AffineFunctionExplorer.astro`.
3. Supprimer `src/data/mathematiques/activities.ts` et `src/utils/mathematicsAffineActivity.ts` si aucun autre pilote ne les utilise.
4. Supprimer `tests/mathematiques-activite-pilote-v3.test.mjs`.
5. Relancer `npm.cmd test` et `npm.cmd run build`.

## Evaluation selon les six criteres d'AGENTS.md

### Critere 1 - Architecture et maintenabilite : 9/10

Preuves : la configuration est separee dans `src/data/mathematiques/activities.ts`, les calculs purs dans `src/utils/mathematicsAffineActivity.ts`, et la surface UI dans `src/components/mathematiques/AffineFunctionExplorer.astro`. L'integration est optionnelle dans `ChapterPageShell` et `ChapterTabs`, ce qui evite une migration globale.

### Critere 2 - UX, UI et coherence du design : 9/10

Preuves : l'activite suit un parcours lisible parametres -> observation -> tableau -> conjecture -> validation. Le composant utilise une surface claire, des etats de retour, un graphique SVG et une disposition responsive sans remplacer les routes existantes.

### Critere 3 - Qualite pedagogique et scientifique : 9/10

Preuves : l'activite cible une notion de seconde, `f(x) = ax + b`, avec observation de valeurs, comparaison par tableau et validation du lien entre signe du coefficient directeur et sens de variation. Les calculs sont testes dans `tests/mathematiques-activite-pilote-v3.test.mjs`.

### Critere 4 - Accessibilite et DYS : 9/10

Preuves : les curseurs sont des controles natifs clavier, les retours importants utilisent `aria-live`, le graphique possede un titre et une description, et le tableau fournit une alternative textuelle aux informations visuelles.

### Critere 5 - Qualite technique globale : 9/10

Preuves : aucun `eval` ni `new Function`, logique de calcul testee, integration statique compatible Astro, `npm.cmd run check` reussi sans erreur ni avertissement, `npm.cmd run build` reussi.

### Critere 6 - Completude, migration et validation : 9/10

Preuves : le perimetre demande est couvert par un pilote unique, isole au chapitre `fonctions-generalites`. Les commandes `npm.cmd test` et `npm.cmd run build` sont reussies, avec un test dedie pour verifier l'isolation et les valeurs.
