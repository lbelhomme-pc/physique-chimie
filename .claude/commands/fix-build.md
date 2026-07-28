Lance `npm run build` et corrige toutes les erreurs MDX.

Les erreurs les plus fréquentes sont :
1. "Could not parse expression with acorn" → des {} dans le MDX sont interprétés comme du JS
2. "Unexpected token" → un style={{}} JSX au lieu de style="..." HTML
3. "Expecting Unicode escape sequence" → un \ non échappé dans une formule

Pour chaque erreur :
- Lis le fichier et la ligne indiqués
- Corrige le problème
- Relance le build pour vérifier

Continue jusqu'à ce que le build passe sans erreur.
