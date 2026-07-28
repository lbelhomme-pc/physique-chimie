# Rapport performance et budgets V3 - 2026-07-28

## Prompt execute

Prompt 33 : `docs/refonte-v3/prompts/33-performance-budgets.md`.

Sources relues :

- `docs/refonte-v3/README.md`
- `docs/refonte-v3/00-resume-executif.md`
- `docs/refonte-v3/prompts/33-performance-budgets.md`
- `docs/refonte-v3/reference/performance-tailles.md`
- `docs/refonte-v3/12-securite-performance-seo.md`
- `tests/fixtures/dist-audit.config.json`
- `scripts/audit-dist.mjs`
- pages et lecteurs de memorisation globale
- tableau de bord V3 pour le correctif accessibilite detecte pendant l'audit

## Objectif

Definir des budgets performance V3 et corriger les pages dont le HTML initial etait trop lourd, sans supprimer de contenu pedagogique ni degrader les simulations.

## Correctifs appliques

- Creation de `src/utils/megaMemorizationData.ts` pour mutualiser la collecte des questions et flashcards globales.
- Creation de deux endpoints statiques :
  - `src/pages/memorisation/mega-quiz-data.json.ts`
  - `src/pages/memorisation/mega-flashcards-data.json.ts`
- Modification de `src/pages/memorisation/mega-quiz.astro` et `src/pages/memorisation/mega-flashcards.astro` : les pages affichent le nombre total disponible, mais ne transportent plus les banques completes dans le HTML initial.
- Modification de `src/components/pedagogie/MegaQuizPlayer.tsx` et `src/components/pedagogie/MegaFlashcardsPlayer.tsx` : chargement differe des banques JSON, etats de chargement accessibles, compatibilite conservee avec les anciennes props pour les tests et usages internes.
- Renforcement de `tests/fixtures/dist-audit.config.json` : budgets HTML/page pour les routes de mega-memorisation, budgets globaux JS/CSS.
- Ajout d'un test dans `tests/memorisation-v3.test.mjs` pour verrouiller le chargement hors HTML initial.
- Correction de `src/components/pedagogie/Dashboard.tsx` : la barre de progression devient un indicateur `meter` valide pour l'audit axe.
- Mise a jour de `docs/refonte-v3/reference/performance-tailles.md`.

## Mesures avant / apres

| Route ou asset | Avant prompt 33 | Apres prompt 33 | Resultat |
|---|---:|---:|---|
| `/memorisation/mega-quiz/index.html` | 1 874 418 octets | 32 100 octets | -98.3 % |
| `/memorisation/mega-flashcards/index.html` | 1 527 527 octets | 32 190 octets | -97.9 % |
| `/memorisation/mega-quiz-data.json` | n/a | 1 081 640 octets | banque sortie du HTML |
| `/memorisation/mega-flashcards-data.json` | n/a | 867 294 octets | banque sortie du HTML |

Budgets observes apres build :

- HTML max : 385 099 octets.
- Page max : 484 438 octets.
- JS global : 899 509 octets, budget 1 000 000 octets.
- CSS global : 295 532 octets, budget 350 000 octets.
- Pages generees : 314.
- Audit dist segmente : 27 476 controles, 0 erreur, 0 avertissement.

## Validation

Commandes executees :

- `npm.cmd run check` : 0 erreur, 22 hints deja presents.
- `npm.cmd test` : 217 tests, 217 reussis.
- `npm.cmd run lint` : 0 erreur, 20 avertissements preexistants hors perimetre.
- `npm.cmd run build -- --silent` : OK.
- `node scripts/audit-dist.mjs --skip-axe` : 314 pages, 27 476 controles, 0 erreur, 0 avertissement.
- `npm.cmd run audit:dist:a11y` : 6 routes echantillons axe, 0 violation.
- `npm.cmd run verify:content` : 34 666 controles, 0 erreur, 0 avertissement.

## Procedure de retour arriere

Pour revenir en arriere, restaurer les anciennes props `allQuestions` et `allCards` dans les deux pages de mega-memorisation, supprimer les deux endpoints JSON et retirer les budgets specifiques. Ce retour arriere est deconseille : il remettrait plus de 1.5 Mo de donnees dans le HTML initial.

## Points de vigilance

- `generic-lab-simulator.js` reste le plus gros script source laboratoire et devra etre decoupe dans un futur prompt dedie.
- `MathText` et les polices KaTeX restent justifies par le rendu scientifique, mais doivent rester suivis par budget.
- Les banques JSON sont statiques et cacheables ; une prochaine etape pourra ajouter compression et strategie de cache serveur/CDN.

## Evaluation selon les six criteres

1. Architecture et maintenabilite : 9.5/10. Preuve : collecte mutualisee dans `src/utils/megaMemorizationData.ts`, endpoints statiques separes, lecteurs conservant une compatibilite descendante.
2. UX, UI et coherence du design : 9/10. Preuve : pas de changement visuel majeur, etats de chargement/erreur ajoutes dans les lecteurs, `client:idle` conserve pour eviter un chargement agressif.
3. Qualite pedagogique et scientifique : 9.5/10. Preuve : aucune banque de quiz ou flashcards supprimee ; seules les modalites de chargement changent.
4. Accessibilite et DYS : 9.5/10. Preuve : etats `role="status"` et `role="alert"` dans les lecteurs ; correction `role="meter"` du tableau de bord ; `audit:dist:a11y` a 0 violation.
5. Qualite technique globale : 9.5/10. Preuve : budgets JS/CSS/HTML controles, build OK, audit dist 0 erreur, chargement differe des banques lourdes.
6. Completude, migration et validation : 9.5/10. Preuve : rapport, mesures avant/apres, tests, build, audit dist, audit a11y et verification contenu executes ; routes legacy `/mega-quiz` et `/mega-flashcards` conservees par redirection.
