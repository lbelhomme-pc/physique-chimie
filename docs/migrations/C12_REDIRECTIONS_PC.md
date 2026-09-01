# C12 — Redirections Physique-Chimie legacy → canoniques

## CONTEXTE / COMMIT DE DÉPART

- Dépôt : `lbelhomme-pc/physique-chimie`
- Branche de travail : `audit-2026-c01-route-snapshot`
- Base C10 certifiée : `ba276393b13aceeb405dfc12322c9ebeedf3c6fc`
- Objectif du plan : activer progressivement les redirections Physique-Chimie préparées et supprimer la double publication après vérification.

## OBJECTIF UNIQUE

Faire des routes `/physique-chimie/...` les seules pages de chapitre Physique-Chimie publiées par Astro et transformer les anciennes routes `/college/...` et `/lycee/...` en alias HTTP 301 vers leurs routes canoniques correspondantes.

## PÉRIMÈTRE DE FICHIERS

- `vercel.json`
- `src/config/redirects.ts`
- `src/data/contentRoutes.ts`
- `src/pages/physique-chimie/[cycle]/[niveau]/[matiere]/[chapitre].astro`
- anciens renderers de chapitre `src/pages/college/...` et `src/pages/lycee/...`
- catalogues collège/lycée concernés
- liens internes PC encore présents dans les outils et contenus
- `scripts/verify-routes-and-content.mjs`
- tests de routes/redirections et fixtures d'audit dist

## ÉTAT À PRÉSERVER

- contenu des chapitres inchangé ;
- identifiants et progression inchangés ;
- routes Mathématiques inchangées ;
- routes de mémorisation inchangées ;
- parcours Enseignement scientifique conservé sous Physique-Chimie ;
- aucune chaîne de redirection ;
- aucune redirection vers une cible inexistante.

## MODIFICATIONS APPLIQUÉES

1. `vercel.json` contient quatre règles 301 paramétriques :
   - `/college/:niveau/physique/:chapitre` → `/physique-chimie/college/:niveau/physique/:chapitre` ;
   - `/college/:niveau/chimie/:chapitre` → `/physique-chimie/college/:niveau/chimie/:chapitre` ;
   - `/lycee/:niveau/physique/:chapitre` → `/physique-chimie/lycee/:niveau/physique/:chapitre` ;
   - `/lycee/:niveau/chimie/:chapitre` → `/physique-chimie/lycee/:niveau/chimie/:chapitre`.
2. Les deux renderers Astro legacy de chapitre ont été supprimés :
   - `src/pages/college/[niveau]/[matiere]/[chapitre].astro` ;
   - `src/pages/lycee/[niveau]/[matiere]/[chapitre].astro`.
3. Le renderer canonique `/physique-chimie/[cycle]/[niveau]/[matiere]/[chapitre]` reste la source unique de rendu de chapitre PC.
4. Les catalogues et la navigation concernés pointent directement vers les routes canoniques.
5. Le vérificateur autoritaire traite les anciennes routes comme `redirect-only`, les redirections comme `active` et exige le statut 301.
6. Le snapshot dist ne contient plus les 101 anciennes pages de chapitre PC ; les échantillons a11y/smoke ont été réalignés sur les routes canoniques.
7. Des tests dédiés `tests/physique-chimie-redirects.test.mjs` verrouillent la stratégie C12.
8. Le premier audit `dist-fast` après activation a détecté 14 liens internes encore écrits avec les anciennes URL. Ils ont tous été migrés à leur source vers `/physique-chimie/...` dans cinq fichiers :
   - `src/pages/outils-methodes/cours-python.astro` : 3 liens ;
   - `src/data/kitScientifique.ts` : 4 liens ;
   - `src/pages/outils-methodes/python-lab.astro` : 2 liens ;
   - `src/pages/outils-methodes/seconde-numerique.astro` : 4 occurrences rendues ;
   - `src/data/chapters/lycee/1ere-spe/chimie/savons-amphiphilie-tensioactifs/cours.mdx` : 1 lien.
9. Le script et le workflow temporaires utilisés pour cette migration ciblée ont été supprimés dans le même commit ; aucun artefact C12 temporaire ne reste dans la branche.

## INTERDICTIONS RESPECTÉES

- pas de modification du stockage de progression ;
- pas de migration de centaines de contenus ;
- pas de changement de taxonomie ;
- pas de suppression des anciennes URL sans redirection ;
- pas de redirection 302/307/308 pour les routes legacy PC ;
- pas de double publication legacy + canonique.

## TESTS À EXÉCUTER / VALIDER EN CI

- `quality` ;
- `dist-fast` ;
- `dist-a11y` ;
- tests C12 dédiés ;
- vérification du snapshot des routes ;
- contrôle des cibles de redirection ;
- absence de chaînes ou boucles de redirection ;
- présence des pages canoniques attendues ;
- absence des 101 pages HTML legacy dans le build statique ;
- absence de liens internes cassés causés par la suppression de la double publication.

## MIGRATION / RETOUR ARRIÈRE

Retour arrière C12 : revenir au commit C10 `ba276393b13aceeb405dfc12322c9ebeedf3c6fc`. Cela rétablit la double publication précédente. Ne pas retirer uniquement les règles Vercel tout en laissant les renderers legacy supprimés.

## CRITÈRES GO / NO-GO

### GO

- toutes les anciennes routes PC de chapitre sont couvertes par un 301 vers une cible canonique existante ;
- les anciennes pages ne sont plus générées par Astro ;
- aucune route canonique n'est redirigée ;
- aucune chaîne/boucle ;
- `quality`, `dist-fast` et `dist-a11y` sont verts ;
- tests C12 verts ;
- aucun lien interne cassé lié à la migration ;
- aucun impact sur la progression ou les contenus.

### NO-GO

- une ancienne URL PC renvoie 404 ou autre chose qu'un 301 ;
- une cible canonique manque ;
- une ancienne page est encore publiée en parallèle ;
- une redirection forme une chaîne ou une boucle ;
- un des trois checks CI obligatoires échoue ;
- un lien interne du site dépend encore de la double publication legacy.

## ÉTAT AU MOMENT DE CE RAPPORT

L'implémentation C12 est complète dans le code. Le commit `a28a59780ec9f54a1e1e059dc1652392eeb6a50d` (`C12: migrate remaining legacy chapter links`) a corrigé les 14 derniers liens internes legacy révélés par `dist-fast` et a supprimé les outils temporaires de migration. Ce commit ayant été produit par GitHub Actions, sa CI de PR a été placée en `action_required` sans exécuter les jobs. La présente mise à jour du rapport relance donc la CI sous un commit utilisateur. La décision GO définitive reste conditionnée aux trois checks `quality`, `dist-fast` et `dist-a11y` verts sur ce nouvel HEAD.
