# Table des tokens V3

Date : 2026-07-27

Source technique : `src/styles/tokens-v3.css`

Principe : les tokens V3 sont additifs, prefixes par `--v3-*`, et fournissent des alias vers les variables historiques du site pour preparer une migration sans refonte active des pages.

## Couleurs et surfaces

| Token | Role |
| --- | --- |
| `--v3-color-surface-canvas` | Fond general de page |
| `--v3-color-surface-page` | Surface principale blanche |
| `--v3-color-surface-muted` | Fond discret de blocs secondaires |
| `--v3-color-surface-raised` | Carte ou panneau eleve |
| `--v3-color-surface-input` | Champ de saisie |
| `--v3-color-text-main` | Texte principal |
| `--v3-color-text-subtle` | Texte secondaire |
| `--v3-color-text-muted` | Texte d'aide ou meta-information |
| `--v3-color-border-default` | Bordure standard |
| `--v3-color-border-strong` | Bordure au survol ou renforcee |
| `--v3-color-focus-ring` | Anneau de focus clavier |

## Etats

| Token | Role |
| --- | --- |
| `--v3-color-action` | Action principale |
| `--v3-color-action-hover` | Action principale au survol |
| `--v3-color-action-subtle` | Fond doux lie a l'action |
| `--v3-color-success` | Validation, reussite |
| `--v3-color-success-subtle` | Fond doux de validation |
| `--v3-color-warning` | Vigilance, attention pedagogique |
| `--v3-color-warning-subtle` | Fond doux de vigilance |
| `--v3-color-danger` | Erreur ou danger |
| `--v3-color-danger-subtle` | Fond doux d'erreur |

## Disciplines et pedagogie

| Token | Role |
| --- | --- |
| `--v3-color-discipline-maths` | Mathematiques |
| `--v3-color-discipline-physics` | Physique |
| `--v3-color-discipline-chemistry` | Chimie |
| `--v3-color-discipline-science` | Enseignement scientifique |
| `--v3-color-pedagogy-definition` | Bloc definition |
| `--v3-color-pedagogy-definition-bg` | Fond de bloc definition |
| `--v3-color-pedagogy-method` | Bloc methode |
| `--v3-color-pedagogy-method-bg` | Fond de bloc methode |
| `--v3-color-pedagogy-law` | Loi ou formule |
| `--v3-color-pedagogy-law-bg` | Fond de loi ou formule |
| `--v3-color-pedagogy-example` | Exemple resolu |
| `--v3-color-pedagogy-example-bg` | Fond d'exemple |
| `--v3-color-pedagogy-warning` | Point de vigilance |
| `--v3-color-pedagogy-warning-bg` | Fond de vigilance |

## Typographie et DYS

| Token | Valeur cible | Role |
| --- | --- | --- |
| `--v3-font-family-sans` | pile systeme + Plus Jakarta Sans si disponible | Police par defaut |
| `--v3-font-family-readable` | Arial, Verdana, Segoe UI | Variante lisible sans dependance externe |
| `--v3-font-family-dys` | Atkinson Hyperlegible, Verdana, Arial | Variante DYS sans CDN obligatoire |
| `--v3-font-size-md` | `1rem` | Taille de texte courante |
| `--v3-line-height-body` | `1.6` | Interlignage standard |
| `--v3-line-height-dys` | `1.8` | Interlignage DYS |
| `--v3-letter-spacing-body` | `0` | Espacement par defaut, conforme cible V3 |
| `--v3-letter-spacing-dys` | `0.05em` | Espacement DYS |
| `--v3-word-spacing-dys` | `0.12em` | Espacement mots DYS |
| `--v3-measure-readable` | `75ch` | Largeur maximale de lecture |

## Espacements, rayons et ombres

| Token | Role |
| --- | --- |
| `--v3-space-1` a `--v3-space-16` | Echelle d'espacement de 4 px a 64 px |
| `--v3-radius-xs` | Petit arrondi |
| `--v3-radius-md` | Rayon courant de carte et controles |
| `--v3-radius-pill` | Pastilles et badges |
| `--v3-shadow-xs` | Ombre tres discrete |
| `--v3-shadow-sm` | Elevation legere |
| `--v3-shadow-md` | Elevation de panneau |
| `--v3-shadow-focus` | Focus clavier visible |

## Compatibilite

Les variables historiques comme `--bg-primary`, `--text-primary`, `--accent-primary`, `--radius-md` et `--letter-spacing-base` sont aliasables depuis `tokens-v3.css`. Dans `design-system.css`, le fichier V3 est importe avant les declarations historiques : cela rend les tokens V3 disponibles globalement sans forcer la refonte des pages actives.
