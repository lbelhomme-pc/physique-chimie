# Registre des risques

| ID | Risque | Gravite | Mitigation |
|---|---|---:|---|
| R1 | Perte de routes legacy | elevee | inventaire + redirections testees |
| R2 | Perte de progression localStorage | elevee | migration idempotente + tests |
| R3 | Donnees Premium controlees seulement en UI | elevee | couche de droits serveur future |
| R4 | Accessibilite labo insuffisante | elevee | resume HTML + tableaux + axe |
| R5 | Contenus scientifiquement modifies sans revue | elevee | validation enseignant par lot |
| R6 | Design system trop decoratif | moyenne | tokens + composants utiles |
| R7 | Bundles trop lourds | moyenne | budgets et lazy loading |
| R8 | `audit:dist` inutilisable en CI | moyenne | segmentation |
| R9 | Polices externes bloquees | moyenne | hebergement local |
| R10 | Deux sources de verite contenu | elevee | migration progressive et retrait planifie |
