# Arborescence technique V3 cible

Arborescence cible progressive :

```text
src/
  content-model/
  data/
    chapters/
    mathematiques/
    laboratoire/
  components/
    design-system/
    pedagogie/
    laboratoire/
    accessibility/
    navigation/
  pages/
  styles/
    tokens.css
    base.css
    components.css
  utils/
  tests/
```

Principes :

- conserver Astro tant que le besoin serveur n'est pas prouve ;
- isoler les futures fonctions compte/Premium derriere une couche de droits ;
- garder les donnees pedagogiques sous contrat ;
- eviter les imports globaux lourds sur toutes les pages ;
- migrer les routes sans supprimer les anciennes URL ;
- documenter chaque redirection.

La V3 ne doit pas deplacer tous les contenus en une seule operation.
