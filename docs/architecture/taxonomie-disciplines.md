# Taxonomie des disciplines et parcours

## Décision

La plateforme expose **deux disciplines publiques de premier niveau** :

1. **Mathématiques** ;
2. **Physique-Chimie**.

L’**Enseignement scientifique** n’est pas une troisième porte de la plateforme. Dans l’interface, il est présenté comme un **parcours du lycée rattaché à l’espace Physique-Chimie**.

Cette décision concerne l’architecture de l’information, la navigation, la recherche, les cartes de l’accueil et le contexte de discipline affiché à l’utilisateur.

## Hiérarchie publique cible

```text
Accueil
├── Mathématiques
│   ├── Collège
│   └── Lycée
└── Physique-Chimie
    ├── Collège
    └── Lycée
        ├── Seconde — Physique-Chimie
        ├── Première — Spécialité Physique-Chimie
        ├── Première — Enseignement scientifique
        ├── Terminale — Spécialité Physique-Chimie
        └── Terminale — Enseignement scientifique
```

## Discipline parente et parcours

Le code distingue désormais deux notions :

- la **discipline publique parente**, utilisée pour les portes d’entrée, la navigation et les facettes globales ;
- le **parcours**, utilisé pour conserver un libellé précis au lycée.

Ainsi :

- `mathematiques` reste une discipline publique ;
- `physique-chimie` reste une discipline publique ;
- `enseignement-scientifique` reste disponible comme identité de parcours/compatibilité, mais n’appartient plus à `publicDisciplineIds` ;
- un niveau `*-ens-scientifique` possède le contexte public `physique-chimie` et le parcours `enseignement-scientifique`.

Référence : `src/data/disciplineIdentity.ts`.

## Règles UI

- l’accueil affiche deux cartes disciplinaires, pas trois ;
- la navigation principale ne crée pas de rubrique Enseignement scientifique indépendante ;
- le portail `/physique-chimie` donne accès au collège et à tous les parcours du lycée ;
- `/lycee` présente l’Enseignement scientifique comme un parcours clairement nommé à l’intérieur de Physique-Chimie ;
- les badges `ES` peuvent conserver une identité visuelle propre pour aider l’élève à reconnaître son parcours ;
- cette identité visuelle ne doit pas être interprétée comme une troisième discipline de premier niveau.

## Recherche et contexte

Dans les index globaux :

- une ressource d’Enseignement scientifique utilise `subject: "physique-chimie"` ;
- son libellé détaillé peut préciser `Physique-Chimie — Enseignement scientifique` ;
- les filtres de premier niveau doivent proposer Mathématiques et Physique-Chimie.

## Compatibilité historique

Cette décision **ne déclenche pas de renommage massif des routes ou IDs**.

Les routes existantes restent valides, notamment :

- `/lycee/1ere-ens-scientifique/...` ;
- `/lycee/terminale-ens-scientifique/...`.

Les IDs canoniques, alias et données de progression associées sont conservés. Toute migration future devra suivre `strategie-alias-progression.md`, être idempotente et disposer de tests de non-régression.

## Conséquence sur le plan d’audit 2026

La mission C06 initialement envisagée comme « rendre Enseignement scientifique natif en tant que discipline indépendante » est **remplacée** par la présente décision :

> normaliser la hiérarchie publique à deux disciplines et rattacher Enseignement scientifique à Physique-Chimie comme parcours lycée, sans casser les compatibilités historiques.
