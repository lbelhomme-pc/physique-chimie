# Prompts de correction issus de l'audit global

Source : `docs/audit-site-global-2026-05-29.md`  
Objectif : lancer les corrections par lots, dans l'ordre des priorites, sans refonte brutale du site.

Chaque prompt doit etre utilise comme une mission autonome. Ne pas tout executer en une seule passe : cela reduit les risques de regression et permet de verifier chaque lot.

## Prompt 1 - P0 / Reference officielle et cartographie programme

Tu dois traiter uniquement la priorite P0 de l'audit global du site physique-chimie.

Contexte :
- Le rapport `docs/audit-site-global-2026-05-29.md` signale que `BO.pdf` est annonce dans `AGENTS.md`, mais absent a la racine du depot.
- La seule reference trouvee est `tmp/pdfs/cycle4_bo.txt`, qui indique etre un projet de programmes de juillet 2025 et non une reference officielle definitive.
- Il ne faut pas modifier les contenus pedagogiques tant que la source officielle n'est pas clarifiee.

Mission :
1. Verifier si `BO.pdf` existe quelque part dans le depot.
2. Verifier les references programme disponibles dans `tmp/`, `docs/` et les fichiers de donnees.
3. Produire un diagnostic clair :
   - source officielle absente ou presente ;
   - source alternative utilisee ;
   - niveau de confiance ;
   - consequences pour la conformite des contenus.
4. Creer ou mettre a jour un document de cartographie programme -> chapitres, par niveau et par theme.
5. Pour la 5e, rattacher chaque chapitre existant aux attendus du programme disponible.

Contraintes :
- Ne pas reecrire les cours.
- Ne pas inventer une reference officielle.
- Signaler explicitement les incertitudes.
- Respecter l'architecture actuelle `src/data/chapters/...`.

Livrables attendus :
- Un document dans `docs/` listant les references disponibles et absentes.
- Une table de correspondance programme -> chapitres.
- Une liste precise des fichiers crees ou modifies.

Verification :
- Relire les chemins cites.
- Confirmer que le site compile si des fichiers source ont ete modifies.

## Prompt 2 - P1 / Brancher les metadonnees SEO des chapitres

Tu dois corriger la priorite P1 SEO identifiee dans `docs/audit-site-global-2026-05-29.md`.

Probleme :
- Les fichiers `meta.json` des chapitres contiennent des donnees SEO (`meta_title`, `meta_description`, `canonical`, `schema_type`, `educationalLevel`).
- Les pages dynamiques `src/pages/college/[niveau]/[matiere]/[chapitre].astro` et `src/pages/lycee/[niveau]/[matiere]/[chapitre].astro` passent seulement un `title` a `BaseLayout`.
- `BaseLayout` sait deja recevoir `description`, `canonical`, `ogImage`, `schemaType`, mais ces props ne sont pas exploitees par les pages chapitre.

Mission :
1. Lire `BaseLayout.astro` et les deux pages chapitre dynamiques.
2. Identifier la structure exacte de `meta.json` pour college et lycee.
3. Modifier les pages chapitre pour transmettre :
   - titre SEO si disponible ;
   - meta-description ;
   - canonical ;
   - schemaType `EducationalContent` si pertinent ;
   - image Open Graph par defaut si aucune image specifique.
4. Verifier que les routes generees conservent les bons titres visibles.
5. Verifier que le build Astro passe.

Contraintes :
- Ne pas modifier la structure globale du layout sans necessite.
- Ne pas casser les pages index niveau/matiere.
- Ne pas ajouter de dependance.
- Garder un fallback robuste si une cle SEO manque.

Livrables attendus :
- Fichiers modifies listes precisement.
- Explication courte des fallbacks.
- Resultat du build.

Verification :
- Inspecter au moins une page 5e, une page 3e et une page terminale spe dans le HTML genere ou via build.

## Prompt 3 - P1 / Accessibilite des schemas d'exercices

Tu dois corriger la priorite P1 accessibilite des schemas d'exercices.

Probleme :
- De nombreux `schemaSvg` dans `src/data/chapters/**/exercices.json` contiennent `aria-hidden="true"` alors que la consigne indique d'observer le schema.
- Ces schemas sont parfois indispensables pour repondre.
- Le composant `ExercicesPlayer.tsx` affiche ces schemas via `dangerouslySetInnerHTML`.

Mission :
1. Inventorier tous les `schemaSvg` contenant `aria-hidden="true"` dans les exercices college et lycee.
2. Classer les cas :
   - schema purement decoratif ;
   - schema utile mais redondant avec la consigne ;
   - schema indispensable pour repondre.
3. Pour les schemas utiles ou indispensables :
   - remplacer `aria-hidden="true"` par `role="img"` ;
   - ajouter ou conserver un `title` explicite ;
   - ajouter un `aria-label` ou `aria-labelledby` ;
   - si le schema porte des donnees, ajouter une description textuelle concise dans `schemaCaption` ou un nouveau champ compatible si necessaire.
4. Verifier que le rendu visuel reste identique.
5. Verifier que le build passe.

Contraintes :
- Ne pas reecrire tous les exercices.
- Ne pas changer le moteur d'exercices sauf si indispensable.
- Ne pas afficher les corrections par defaut.
- Garder les JSON valides.

Livrables attendus :
- Nombre de schemas audites.
- Nombre de schemas corriges.
- Liste des fichiers modifies.
- Limites restantes.

Verification :
- Tester au moins un exercice 5e avec schema, un exercice 4e avec schema et un exercice lycee avec schema.

## Prompt 4 - P1 / Relier cours, simulations, exercices et quiz

Tu dois traiter la faiblesse pedagogique prioritaire : les cours, simulations, exercices et quiz sont trop separes.

Contexte :
- L'audit signale que le laboratoire contient des simulations pertinentes, mais que les cours ne les exploitent pas assez.
- La 5e est prioritaire.
- Les chapitres 5e existent dans `src/data/chapters/college/5eme/...`.
- Les simulations existent dans `src/data/laboratoire/` et les pages `/laboratoire/...`.

Mission :
1. Inventorier les chapitres 5e et les simulations pertinentes.
2. Proposer une table chapitre -> simulation(s) :
   - melanges-dissolution -> melanges ;
   - temps-mouvements -> chronophotographie ;
   - energie-stocks-transferts -> chaines energetiques / escape energie ;
   - circuits-electriques -> loi d'Ohm si niveau adapte, ou ressource limitee ;
   - signaux-sonores -> oscilloscope si adapte ;
   - lumiere-ombres -> simulation optique pertinente si disponible ;
   - transformations-matiere -> test ions ou pH seulement si pedagogiquement justifie ;
   - proprietes-matiere -> pH ou melanges seulement si pertinent.
3. Ajouter dans les cours 5e un encadre court "A manipuler" quand une simulation est vraiment utile.
4. Chaque encadre doit contenir :
   - lien vers la simulation ;
   - objectif eleve ;
   - consigne d'observation ;
   - question de sortie.
5. Ne pas forcer un lien si la simulation est trop avancee.

Contraintes :
- Ne pas transformer les cours en catalogues de liens.
- Ne pas allonger excessivement les pages.
- Adapter le vocabulaire au niveau 5e.
- Garder les fichiers MDX lisibles.

Livrables attendus :
- Table chapitre -> simulation retenue/refusee avec justification.
- Fichiers 5e modifies.
- Resultat du build.

Verification :
- Lire chaque page 5e modifiee.
- Verifier que les liens internes existent.

## Prompt 5 - P1 / Corrections scientifiques et orthographiques 5e

Tu dois faire une passe ciblee sur les erreurs ou risques scientifiques et les fautes visibles des contenus 5e.

Source :
- `docs/audit-site-global-2026-05-29.md`, sections audit pedagogique et scientifique.

Problemes deja identifies :
- CO2 dissous et bulles dans `melanges-dissolution/cours.mdx`.
- Energie parfois formulee comme une substance plutot que comme une grandeur/modelisation de stock.
- Niveau sonore en decibel presente de facon trop lineaire.
- Fautes ou graphies sans accents dans `lumiere-ombres` : `emet`, `oeil`, `detecter`, `cameras`, `notres`, etc.
- Fautes similaires dans quiz et flashcards.

Mission :
1. Auditer tous les fichiers 5e :
   - `cours.mdx` ;
   - `exercices.json` ;
   - `quiz.json` ;
   - `flashcards.json` ;
   - `meta.json`.
2. Corriger uniquement :
   - erreurs scientifiques ;
   - formulations dangereuses ;
   - fautes typographiques ou accents ;
   - incoherences d'unites ou notations.
3. Ne pas changer la structure pedagogique generale dans cette passe.
4. Pour chaque correction scientifique, noter l'ancienne formulation et la nouvelle dans le bilan.

Contraintes :
- Niveau 5e : vocabulaire simple.
- Ne pas ajouter de notions trop avancees.
- Ne pas creer de nouveaux chapitres.
- Garder les JSON valides.

Livrables attendus :
- Liste des fichiers corriges.
- Liste des corrections scientifiques.
- Liste des corrections orthographiques massives.
- Resultat du build.

Verification :
- Construire le site.
- Verifier au moins une page 5e chimie et une page 5e physique apres correction.

## Prompt 6 - P1 / Accessibilite des simulations canvas

Tu dois ameliorer l'accessibilite des simulations sans refondre le laboratoire.

Source :
- `docs/audit-site-global-2026-05-29.md`.
- `docs/audit-simulations-laboratoire-2026-05-28.md`.

Probleme :
- Plusieurs simulations contiennent des informations essentielles dessinees dans le canvas.
- Les readouts existants aident, mais ne remplacent pas toujours les donnees scientifiques visibles.

Mission :
1. Lire `src/components/laboratoire/GenericLabSimulator.astro` et `src/scripts/laboratoire/generic-lab-simulator.js`.
2. Identifier les simulations prioritaires :
   - lunette afocale ;
   - poids vs masse ;
   - titrage pH-metrique ;
   - titrage conductimetrique ;
   - saisons ;
   - systeme solaire ;
   - gaz parfaits ;
   - bilans thermiques.
3. Ajouter, pour chaque simulation prioritaire, un resume HTML synchronise et lisible :
   - parametres actuels ;
   - grandeur principale calculee ;
   - interpretation courte ;
   - limite du modele si necessaire.
4. Ne pas dupliquer tout le canvas : fournir l'information indispensable.
5. Conserver `aria-live` de maniere raisonnable, sans annonces trop frequentes.

Contraintes :
- Ne pas reecrire tout le simulateur generique.
- Ne pas casser les 25 simulations existantes.
- Ne pas ajouter de framework.
- Conserver les performances.

Livrables attendus :
- Simulations modifiees.
- Description des alternatives textuelles ajoutees.
- Resultat du build.
- Verification mobile rapide si possible.

## Prompt 7 - P2 / UX navigation, fil d'Ariane et ressources associees

Tu dois ameliorer l'orientation utilisateur sans refondre la navigation.

Problemes :
- Les pages chapitre n'ont pas de fil d'Ariane complet.
- Les ressources associees ne sont pas assez visibles.
- Un utilisateur arrivant depuis un lien direct peut perdre le contexte niveau/matiere/chapitre.

Mission :
1. Lire les pages dynamiques :
   - `src/pages/college/[niveau]/[matiere]/[chapitre].astro`
   - `src/pages/lycee/[niveau]/[matiere]/[chapitre].astro`
   - les pages index niveau/matiere existantes.
2. Ajouter un fil d'Ariane sobre :
   - College ou Lycee ;
   - niveau ;
   - matiere ;
   - chapitre avec `aria-current="page"`.
3. Ajouter si pertinent un bloc "Ressources associees" reutilisable ou une zone simple dans les pages chapitre.
4. Garder le design coherent avec l'existant.

Contraintes :
- Ne pas modifier la structure des URL.
- Ne pas ajouter de dependance.
- Ne pas dupliquer trop de CSS.
- Verifier le responsive mobile.

Livrables attendus :
- Fichiers modifies.
- Capture ou description du rendu desktop/mobile.
- Resultat du build.

## Prompt 8 - P2 / Nettoyage performance et ressources globales

Tu dois traiter les optimisations simples de performance et de robustesse.

Problemes identifies :
- Google Tag Manager charge globalement.
- Polices chargees depuis Google Fonts et jsdelivr.
- `BaseLayout` reference certains chemins favicon a verifier.
- `SearchAction` pointe vers `/recherche`, route non observee.

Mission :
1. Verifier les fichiers publics reellement presents dans `public/`.
2. Aligner les chemins favicon/apple/manifest dans `BaseLayout`.
3. Verifier si `/recherche` existe :
   - si oui, confirmer le bon schema ;
   - sinon, retirer `SearchAction` ou creer une route minimale selon l'architecture existante.
4. Proposer une solution pour les polices :
   - soit hebergement local ;
   - soit fallback systeme ;
   - soit chargement conditionnel.
5. Proposer une solution pour GTM :
   - environnement de production seulement ;
   - consentement ;
   - ou suppression si non indispensable.

Contraintes :
- Ne pas casser l'identite visuelle.
- Ne pas modifier toutes les pages individuellement.
- Ne pas ajouter de service externe.

Livrables attendus :
- Changements effectues.
- Gains attendus.
- Resultat du build.

## Prompt 9 - P2/P3 / Maintenabilite du laboratoire

Tu dois preparer une refactorisation progressive du laboratoire, sans la faire en bloc.

Probleme :
- `src/scripts/laboratoire/generic-lab-simulator.js` concentre trop de simulations et devient difficile a maintenir.

Mission :
1. Cartographier les `kind` ou familles de simulations dans le simulateur generique.
2. Identifier les fonctions vraiment communes :
   - runtime ;
   - canvas ;
   - controles ;
   - readouts ;
   - helpers graphiques.
3. Proposer un plan de decoupage en plusieurs fichiers.
4. Extraire au maximum une seule simulation ou une seule famille comme preuve de concept.
5. Verifier que toutes les routes laboratoire continuent de fonctionner.

Contraintes :
- Ne pas refondre toutes les simulations d'un coup.
- Ne pas changer l'API des donnees sauf necessite.
- Prioriser la non-regression.

Livrables attendus :
- Plan de refactorisation.
- Eventuelle extraction pilote.
- Liste des risques.
- Resultat du build.

## Prompt 10 - P2/P3 / Outillage QA automatise

Tu dois mettre en place une verification qualite minimale, utile pour eviter les regressions.

Problemes :
- Les donnees JSON/MDX peuvent contenir fautes, BOM, schemas invisibles, liens internes casses.
- Les corrections sont nombreuses et risquent d'introduire des regressions.

Mission :
1. Etudier les scripts existants dans `package.json`.
2. Proposer ou ajouter des scripts de verification simples :
   - build Astro ;
   - validation JSON ;
   - detection BOM ;
   - detection `aria-hidden="true"` dans `schemaSvg` ;
   - detection de liens internes inexistants si faisable simplement ;
   - detection des placeholders `Donnée 1`, `...`, `à compléter`.
3. Garder les scripts simples, documentes et executables localement.
4. Ne pas ajouter de dependance lourde sans justification.

Contraintes :
- Ne pas bloquer le build sur des alertes pedagogiques au debut ; distinguer erreurs et warnings.
- Compatible Windows PowerShell.
- Sortie lisible pour un enseignant/developpeur.

Livrables attendus :
- Scripts ajoutes ou proposes.
- Documentation d'utilisation courte.
- Exemple de sortie.
- Resultat du build.

## Ordre recommande d'execution

1. Prompt 1 - Reference officielle.
2. Prompt 2 - SEO des chapitres.
3. Prompt 3 - Accessibilite des schemas d'exercices.
4. Prompt 5 - Corrections scientifiques et orthographiques 5e.
5. Prompt 4 - Liens cours/simulations/exercices.
6. Prompt 6 - Accessibilite des simulations canvas.
7. Prompt 7 - Navigation et ressources associees.
8. Prompt 8 - Performance et ressources globales.
9. Prompt 10 - Outillage QA.
10. Prompt 9 - Refactorisation progressive du laboratoire.

## Prompt court de verification apres chaque lot

Tu viens de terminer un lot de correction issu de l'audit global.

Verifie maintenant :
1. `npm.cmd run build`
2. absence d'erreur JSON/MDX evidente ;
3. pages touchees lisibles ;
4. liens internes ajoutes valides ;
5. aucune regression evidente sur les composants pedagogiques ;
6. liste precise des fichiers crees/modifies ;
7. points restant a traiter.

Ne fais pas de nouvelle correction tant que cette verification n'est pas terminee.
