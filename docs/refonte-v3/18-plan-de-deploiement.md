# Plan de deploiement

Deploiement progressif :

1. branche de refonte ;
2. reference V2 et captures ;
3. composants V3 caches ou non routes ;
4. premiere verticale pilote ;
5. tests automatises et revue manuelle ;
6. activation progressive par routes ;
7. redirections ;
8. monitoring ;
9. retrait controle des anciens chemins.

Conditions de bascule :

- build OK ;
- tests OK ;
- audit accessibilite OK sur parcours representatifs ;
- budgets acceptes ;
- sitemap et robots verifies ;
- redirections testees ;
- progression preservee ;
- rollback documente.
