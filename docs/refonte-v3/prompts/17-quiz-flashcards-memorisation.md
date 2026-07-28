# Quiz, flashcards et memorisation V3

## Contexte verifie
Quiz, mega-quiz, flashcards et SRS existent.
## Objectif unique
Unifier quiz et flashcards V3 sans perdre la progression.
## Agents responsables
Architecte contenus, expert QA, UX, responsable migration.
## Prerequis
Prompt 23 planifie ou termine selon dependance progression.
## Fichiers a lire
`QuizPlayer.tsx`, `FlashcardsPlayer.tsx`, `MegaQuizPlayer.tsx`, `MegaFlashcardsPlayer.tsx`, `srs.ts`.
## Perimetre autorise
Players, tests, donnees pilote.
## Fichiers pouvant etre modifies
Composants memorisation et tests.
## Fichiers interdits
Suppression de cles localStorage.
## Travaux a realiser
Feedback immediat, reprise erreurs, revision espacee.
## Contraintes de migration
IDs existants conserves.
## Contraintes pedagogiques
Questions simples, sans ambiguite.
## Contraintes de design
Etat resultat clair.
## Contraintes DYS et accessibilite
Clavier complet.
## Contraintes de securite et de performance
Stockage local robuste.
## Livrables
Memo V3.
## Commandes a executer
`npm.cmd test`, `npm.cmd run build`.
## Tests obligatoires
Score, SRS, erreurs, migration.
## Comparaison avant/apres
Progression preservee.
## Criteres d'acceptation
Aucune perte de score.
## Procedure de retour arriere
Restaurer players.
## Rapport final
Scenarios testes.
## Evaluation selon les six criteres d'AGENTS.md
Minimum 9/10 chacun.
