Convertis le fichier HTML "$ARGUMENTS" en pack chapitre complet pour la plateforme.

1. Lis le fichier HTML fourni
2. Extrais le contenu pédagogique (titres, définitions, formules, exemples, tableaux)
3. Extrais les exercices s'il y a un fichier exercices correspondant
4. Génère les 5 fichiers dans le bon dossier :
   - meta.json (déduis le niveau et la matière depuis le chemin/contenu)
   - cours.mdx (utilise les encadrés definition-box, example-box, info-box, box-regle-or)
   - exercices.json (reprends les exercices du HTML ou génère-en 5-8)
   - quiz.json (génère 10 QCM pertinents avec explications)
   - flashcards.json (génère 10-15 cartes des notions clés)

Respecte les règles MDX du CLAUDE.md.
