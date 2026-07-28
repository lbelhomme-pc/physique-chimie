# Prompts prêts à l'emploi pour Claude Code

## Utilisation
Copie-colle ces prompts dans Claude Code pour les tâches courantes.
Adapte les parties entre [CROCHETS].


## 1. Créer un nouveau chapitre complet

```
Crée le pack complet pour le chapitre "[TITRE]" de [NIVEAU] [MATIÈRE].
Le contenu source est dans le fichier [FICHIER].html que je t'envoie.

Génère les 5 fichiers dans src/data/chapters/college/[NIVEAU]/[MATIÈRE]/[SLUG]/ :
- meta.json (order: [N])
- cours.mdx (avec encadrés definition-box, example-box, info-box, box-regle-or et formules $$)
- exercices.json (reprends les exercices du HTML, progressifs ⭐ à 🏆)
- quiz.json (10 QCM avec explications)
- flashcards.json (10-15 cartes, difficulté 1-3)

Respecte les règles MDX du CLAUDE.md.
```


## 2. Convertir un HTML en cours.mdx

```
Convertis ce fichier HTML en cours.mdx pour la plateforme.
Utilise les encadrés : definition-box (bleu), example-box (vert), info-box (jaune), box-regle-or (rouge).
Les formules doivent être en $...$ inline ou $$...$$ bloc.
PAS de style={{}} JSX — uniquement style="..." HTML.
PAS de SVG inline.
```


## 3. Corriger un bug de build MDX

```
J'ai cette erreur au build :
[COLLER L'ERREUR]

Le fichier est [CHEMIN]. Corrige le problème.
Rappel : en MDX, les {} sont interprétés comme du JS,
les style={{}} doivent être style="...",
et les SVG inline avec {} ne fonctionnent pas.
```


## 4. Ajouter un nouveau composant

```
Crée le composant [NOM].tsx dans src/components/pedagogie/.
Il doit :
- [DESCRIPTION DE CE QUE FAIT LE COMPOSANT]
- Utiliser les CSS variables du design system (var(--bg-card), var(--accent-primary), etc.)
- Être responsive (tester sur 375px)
- Supporter les thèmes sombres (pas de couleurs en dur)
- Être exporté en default export
```


## 5. Créer du contenu pour un nouveau niveau

```
Je vais t'envoyer les fichiers HTML de cours et exercices pour la classe de [NIVEAU].
Pour chaque chapitre, génère le pack complet (meta.json + cours.mdx + exercices.json + quiz.json + flashcards.json).

Les chapitres de [MATIÈRE] [NIVEAU] sont :
1. [CHAPITRE 1]
2. [CHAPITRE 2]
...

Chaque chapitre va dans src/data/chapters/college/[NIVEAU]/[MATIÈRE]/[SLUG]/.
```


## 6. Améliorer le design d'une page

```
Regarde le fichier src/pages/[PAGE].astro.
Améliore le design en utilisant les classes CSS du design-system.css :
- card, card-matiere, card-chapitre
- stats-pills, stat-pill, rang-pill
- tabs-bar, tab-pill
- grid-2, grid-3, grid-auto
- section-card, section-title
- btn, btn-primary, btn-secondary
- animate-fade-in, stagger

Respecte le style existant (indigo, pills, cartes blanches sur fond bleu pâle).
```


## 7. Debug rapide

```
npm run build donne cette erreur :
[COLLER L'ERREUR]

Diagnostique et corrige. Vérifie en particulier :
- Les {} dans les fichiers MDX
- Les imports manquants
- Les getStaticPaths pour les routes dynamiques
- Les style={{}} qui devraient être style="..."
```


## 8. Ajouter une simulation au laboratoire

```
Crée une simulation interactive de [SUJET] en React.
Le composant va dans src/components/laboratoire/[NOM].tsx.
La page va dans src/pages/laboratoire/[SLUG].astro.

La simulation doit :
- Être interactive (sliders, boutons, canvas/SVG)
- Afficher les formules avec KaTeX
- Être responsive
- Utiliser les CSS variables du design system
```
