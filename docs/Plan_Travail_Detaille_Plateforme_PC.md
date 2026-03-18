# Plan de travail détaillé — Plateforme Physique-Chimie

## Vue d'ensemble

```
PHASE 1  Onglets + page chapitre          ██░░░░░░░░  ~2 sessions
PHASE 2  Composants interactifs            ███░░░░░░░  ~3-4 sessions
PHASE 3  Contenu (premiers chapitres)      ████░░░░░░  ~4-5 sessions
PHASE 4  Design system + accessibilité     ███░░░░░░░  ~3 sessions
PHASE 5  Gamification (XP, rangs, badges)  ███░░░░░░░  ~3 sessions
PHASE 6  Auth + comptes (Supabase)         ██░░░░░░░░  ~2-3 sessions
PHASE 7  Paiement (Stripe, freemium)       ██░░░░░░░░  ~2 sessions
PHASE 8  SEO + déploiement                 ██░░░░░░░░  ~2 sessions
PHASE 9  Labo simulations                  ████░░░░░░  ~4+ sessions
PHASE 10 Améliorations (PWA, IA, etc.)     ░░░░░░░░░░  continu
```

---

## PHASE 1 — Onglets + page chapitre (~2 sessions)

**Objectif** : La page d'un chapitre est complète visuellement.

### Étape 1.1 — Système d'onglets
- [ ] Composant `ChapterTabs.astro` (ou React pour l'interactivité)
- [ ] 4 onglets : Cours | Exercices | Quiz | Flashcards
- [ ] Onglet actif en surbrillance, contenu qui change sans rechargement
- [ ] Si un onglet n'a pas de contenu (pas de quiz.json par ex.), il est grisé

### Étape 1.2 — Affichage du cours MDX
- [ ] Rendu propre du cours MDX (titres, paragraphes, formules, images)
- [ ] Support basique des formules mathématiques (KaTeX ou MathJax)
- [ ] Encadrés colorés : définition, propriété, exemple, attention

### Étape 1.3 — Squelettes des blocs interactifs
- [ ] Bloc exercices : affiche la liste des exercices (texte seul pour l'instant)
- [ ] Bloc quiz : affiche les questions (sans interactivité)
- [ ] Bloc flashcards : affiche recto/verso (sans retournement)

**Résultat** : Tu peux naviguer sur un chapitre, voir le cours, et voir les 4 onglets.

---

## PHASE 2 — Composants interactifs (~3-4 sessions)

**Objectif** : Les quiz, flashcards et exercices sont JOUABLES.

### Étape 2.1 — Quiz Player
- [ ] Composant React `QuizPlayer.tsx`
- [ ] Affiche une question à la fois avec choix multiples
- [ ] Feedback immédiat (bonne/mauvaise réponse + explication)
- [ ] Score affiché en fin de quiz (ex : 7/10)
- [ ] Stockage local du score (localStorage en attendant l'auth)

### Étape 2.2 — Flashcards Player
- [ ] Composant React `FlashcardsPlayer.tsx`
- [ ] Carte qui se retourne au clic (animation CSS flip)
- [ ] Navigation : carte suivante / précédente
- [ ] Boutons « Je sais » / « À revoir » (tri des cartes)
- [ ] Mode aléatoire

### Étape 2.3 — Exercices Player
- [ ] Composant React `ExercicesPlayer.tsx`
- [ ] Affiche énoncé, champ de réponse (texte ou choix)
- [ ] Correction avec explication détaillée
- [ ] Niveaux de difficulté visibles (facile/moyen/difficile)

### Étape 2.4 — Intégration dans les onglets
- [ ] Branchement des composants sur les fichiers JSON réels
- [ ] Test complet avec le chapitre 3ème/chimie/atome

**Résultat** : Un élève peut faire un quiz, retourner des flashcards, et résoudre des exercices.

---

## PHASE 3 — Génération de contenu (~4-5 sessions)

**Objectif** : Avoir assez de contenu pour une version utilisable.

### Ordre de génération (priorité = examens)
1. **3ème** (Brevet) — ~15-20 chapitres
2. **Terminale spécialité** (Bac) — ~20-25 chapitres
3. **2nde** — ~15 chapitres
4. **1ère spécialité** — ~15-20 chapitres
5. **1ère / Tle enseignement scientifique** — ~10-15 chacun
6. **4ème, 5ème, 6ème** — ~10-15 chacun

### Par chapitre, à produire :
- [ ] `meta.json` (titre, description, thème, ordre)
- [ ] `cours.mdx` (cours structuré avec encadrés, formules, schémas)
- [ ] `quiz.json` (10 questions minimum)
- [ ] `flashcards.json` (15-20 cartes)
- [ ] `exercices.json` (5-10 exercices variés)

### Méthode
- Utiliser le prompt de génération (Prompt-Generation_Chapitre.txt) avec Claude
- Vérifier chaque chapitre : exactitude scientifique + cohérence programme
- Un chapitre complet ≈ 20-30 min avec Claude

**Résultat** : 30-40 chapitres jouables (assez pour un lancement beta).

---

## PHASE 4 — Design system + accessibilité (~3 sessions)

**Objectif** : Le site est beau, cohérent, et accessible.

### Étape 4.1 — Charte graphique
- [ ] Palette de couleurs (physique = bleu, chimie = vert/violet ?)
- [ ] Typographie (lisible, moderne)
- [ ] Composants UI réutilisables (boutons, cartes, badges)
- [ ] Logo + favicon

### Étape 4.2 — Layout responsive
- [ ] Navigation mobile (menu burger)
- [ ] Pages adaptées tablette/mobile
- [ ] Grilles de chapitres en cards visuelles

### Étape 4.3 — Accessibilité
- [ ] Mode DYS (police OpenDyslexic, espacement augmenté)
- [ ] Mode sombre
- [ ] Taille de police ajustable
- [ ] Contraste WCAG AA minimum
- [ ] Composant `AccessibilityPanel.astro` (barre de réglages)

**Résultat** : Le site est présentable et utilisable par tous, y compris les élèves dys.

---

## PHASE 5 — Gamification (~3 sessions)

**Objectif** : L'élève a envie de revenir grâce à un système de progression.

### Étape 5.1 — Système XP
- [ ] Définir les règles de points :
  - Quiz terminé : +10 XP par bonne réponse
  - Flashcards révisées : +5 XP par paquet
  - Exercice résolu : +15 XP
  - Connexion quotidienne : +10 XP
- [ ] Barre de progression XP (visuelle, animée)

### Étape 5.2 — Rangs et badges
- [ ] Système de rangs (ex : Atome → Molécule → Cristal → Étoile → Supernova)
- [ ] Seuils XP par rang
- [ ] Badges de réussite (« Premier quiz parfait », « 7 jours consécutifs », etc.)
- [ ] Animation de déblocage

### Étape 5.3 — Tableau de bord élève
- [ ] Page `/dashboard` ou widget sur la page d'accueil
- [ ] Résumé : XP total, rang actuel, progression vers rang suivant
- [ ] Chapitres commencés / terminés
- [ ] Historique récent (derniers quiz, scores)
- [ ] Suggestion « Révision du jour »

### Étape 5.4 — Stockage
- [ ] D'abord en localStorage (fonctionne sans compte)
- [ ] Migration vers Supabase quand l'auth est prête (Phase 6)

**Résultat** : Un système motivant qui fonctionne même sans compte.

---

## PHASE 6 — Authentification + comptes (~2-3 sessions)

**Objectif** : L'élève peut créer un compte et retrouver sa progression.

### Étape 6.1 — Supabase setup
- [ ] Créer le projet Supabase
- [ ] Tables : users, progress, scores, badges
- [ ] Row Level Security (RGPD — données de mineurs !)

### Étape 6.2 — Auth front
- [ ] Pages : inscription, connexion, mot de passe oublié
- [ ] Connexion email/mot de passe
- [ ] Éventuellement OAuth (Google) — attention RGPD mineurs

### Étape 6.3 — Synchronisation progression
- [ ] Au login : fusionner localStorage → Supabase
- [ ] Sauvegarder les scores de quiz, XP, badges côté serveur
- [ ] API routes Astro pour lire/écrire la progression

### Étape 6.4 — RGPD
- [ ] Mention légales + politique de confidentialité
- [ ] Consentement parental obligatoire pour les < 15 ans
- [ ] Droit de suppression des données

**Résultat** : Les élèves ont un compte, leur progression est sauvegardée.

---

## PHASE 7 — Paiement + freemium (~2 sessions)

**Objectif** : Monétiser avec un modèle équitable.

### Étape 7.1 — Définir le modèle freemium
- [ ] GRATUIT : tous les cours, 3 quiz/jour, 5 flashcards/jour
- [ ] PREMIUM (~3,49-6,99€/mois) : quiz/flashcards illimités, exercices corrigés, tableau de bord complet, mode hors-ligne

### Étape 7.2 — Intégration Stripe
- [ ] Créer les produits et prix dans Stripe
- [ ] Page d'abonnement avec bouton de paiement
- [ ] Webhook Stripe → mettre à jour le statut dans Supabase
- [ ] Gestion des annulations

### Étape 7.3 — Gating du contenu
- [ ] Middleware qui vérifie le statut premium
- [ ] Compteur de quiz/flashcards gratuits par jour
- [ ] Message élégant quand la limite est atteinte (pas frustrant)

**Résultat** : Le site génère des revenus tout en restant utile en version gratuite.

---

## PHASE 8 — SEO + déploiement (~2 sessions)

**Objectif** : Le site est en ligne et trouvable sur Google.

### Étape 8.1 — SEO technique
- [ ] Balises meta (title, description) par page
- [ ] Sitemap XML automatique
- [ ] Schema.org (EducationalContent, Quiz)
- [ ] Open Graph pour les partages sociaux
- [ ] URLs propres et descriptives (déjà fait !)

### Étape 8.2 — Déploiement
- [ ] Héberger sur Vercel ou Netlify
- [ ] Nom de domaine
- [ ] HTTPS (automatique)
- [ ] CI/CD : push sur main → déploiement automatique

### Étape 8.3 — Analytics
- [ ] Plausible ou Umami (RGPD-friendly, pas Google Analytics)
- [ ] Suivi : pages vues, chapitres populaires, taux de complétion quiz

**Résultat** : Le site est live, indexé par Google, et tu vois les stats.

---

## PHASE 9 — Laboratoire de simulation (~4+ sessions)

**Objectif** : Des simulations interactives impressionnantes.

- [ ] Simulation de circuits électriques
- [ ] Modèle atomique 3D
- [ ] Réactions chimiques (équilibrage)
- [ ] Optique (lentilles, miroirs)
- [ ] Mécanique (forces, mouvements)

Technologies : Canvas/WebGL, Three.js, ou librairies spécialisées.

**C'est la phase la plus ambitieuse — à faire progressivement.**

---

## PHASE 10 — Améliorations continues

- [ ] PWA (installable sur téléphone)
- [ ] IA de révision personnalisée (quel chapitre revoir ?)
- [ ] Espace enseignant (suivi de classe)
- [ ] Extension à d'autres matières (SVT, maths)
- [ ] Classements entre élèves (optionnel, à tester)

---

## Résumé des dépendances

```
Phase 1 (onglets) ──→ Phase 2 (composants) ──→ Phase 3 (contenu)
                                                     ↓
Phase 4 (design) ← peut se faire en parallèle dès Phase 2
                                                     ↓
Phase 2 (composants) ──→ Phase 5 (gamification) ──→ Phase 6 (auth)
                                                          ↓
                                                   Phase 7 (paiement)
                                                          ↓
                                                   Phase 8 (déploiement)

Phase 9 (labo) ← indépendant, peut démarrer dès Phase 4
```

## Calendrier estimé (rythme 3-4 sessions/semaine)

| Période | Phases | Jalon |
|---------|--------|-------|
| Mars-Avril 2026 | 1 + 2 + 3 (début) | Page chapitre complète + premiers contenus |
| Avril-Mai 2026 | 3 (suite) + 4 | 30+ chapitres, design en place |
| Mai-Juin 2026 | 5 + 6 | Gamification + comptes → **Beta privée** |
| Juin-Juillet 2026 | 7 + 8 | Paiement + mise en ligne → **Lancement** |
| Été 2026 | 3 (compléter) + 9 | Plus de contenu + premières simulations |
| Septembre 2026 | 10 | **V2 pour la rentrée** |
