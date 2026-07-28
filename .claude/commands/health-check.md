Fais un diagnostic complet du projet :

1. Lance `npm run build` et vérifie qu'il n'y a pas d'erreurs
2. Compte les chapitres : `find src/data/chapters -name "meta.json" | wc -l`
3. Vérifie que chaque chapitre a ses 5 fichiers (meta.json, cours.mdx, exercices.json, quiz.json, flashcards.json)
4. Vérifie qu'il n'y a pas de style={{}} dans les fichiers .mdx : `grep -r 'style={{' src/data/chapters/`
5. Vérifie qu'il n'y a pas de SVG inline dans les .mdx : `grep -r '<svg' src/data/chapters/`
6. Liste les chapitres par niveau et matière

Affiche un rapport avec :
- ✅ Ce qui est OK
- ❌ Ce qui pose problème
- Le nombre total de chapitres, exercices, quiz, flashcards
