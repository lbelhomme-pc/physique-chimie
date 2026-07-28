export interface LyceeMethodExample {
  title: string;
  statement: string;
  steps: string[];
  answer: string;
}

export interface LyceeMethodFormula {
  label: string;
  detail: string;
}

export interface LyceeMiniExercise {
  statement: string;
  correction: string[];
}

export interface LyceeMathMethod {
  slug: string;
  number: number;
  family: string;
  title: string;
  shortTitle: string;
  levels: string[];
  description: string;
  objective: string;
  why: string[];
  typicalUses: string[];
  quickMethod: string[];
  forUnderstanding: string;
  steps: string[];
  formulas?: LyceeMethodFormula[];
  examples: [LyceeMethodExample, LyceeMethodExample];
  commonMistakes: string[];
  tip: string;
  miniExercise: LyceeMiniExercise;
  competencies: string[];
  remember: string[];
}

export const lyceeMathsDiagnostic = {
  indispensables: [
    "Conversions et écriture scientifique : elles interviennent dans presque tous les calculs.",
    "Manipulation de formules : isoler une grandeur est nécessaire dès la seconde et central en spécialité.",
    "Graphiques et modèles : une grande partie des activités expérimentales se lit sur des courbes.",
    "Incertitudes et chiffres significatifs : indispensables pour conclure correctement sur une mesure.",
    "Rédaction scientifique : au bac, le raisonnement compte autant que le résultat numérique."
  ],
  difficultes: [
    "Confusion entre grandeur, valeur et unité.",
    "Utilisation mécanique d'une formule sans vérifier les unités.",
    "Mauvaise lecture des axes ou du coefficient directeur d'une droite.",
    "Difficultés avec les logarithmes, les exponentielles et les puissances de 10.",
    "Conclusion expérimentale trop rapide : compatible, non compatible, modèle valide ou non."
  ],
  aRevoirSouvent: [
    "Conversions, unités composées et ordres de grandeur.",
    "Isoler une grandeur dans une formule.",
    "Lire une pente, une ordonnée à l'origine et une interpolation.",
    "Arrondir une valeur avec une incertitude.",
    "Présenter un raisonnement en plusieurs étapes."
  ],
  regroupements: [
    "Unités, conversions et homogénéité.",
    "Formules, calculs et relations de physique-chimie.",
    "Proportionnalité, pourcentages, rendements et dilutions.",
    "Graphiques, modélisation, étalonnage et régression.",
    "Vecteurs, géométrie, dérivées, exponentielles et logarithmes.",
    "Mesures, incertitudes, statistiques et rédaction type bac."
  ],
  niveaux: [
    "Seconde : conversions, proportionnalité, graphiques, statistiques simples, Python et exploitation de mesures.",
    "Première : quantité de matière, concentration, titrage, énergie, vecteurs simples, modèles linéaires.",
    "Terminale : dérivées, équations différentielles simples, exponentielles, logarithmes, incertitudes et raisonnements type bac.",
    "Bac : choisir la méthode, justifier, calculer proprement, conclure physiquement."
  ],
  prioritesBac: [
    "Identifier la grandeur cherchée et les données utiles.",
    "Écrire la relation littérale avant le calcul.",
    "Exploiter une pente, une courbe d'étalonnage ou une modélisation.",
    "Manipuler logarithmes et exponentielles dans les chapitres concernés.",
    "Comparer un résultat à une référence en tenant compte des incertitudes."
  ]
};

export const methodesMathsLycee: LyceeMathMethod[] = [
  {
    slug: "unites-conversions-ecriture-scientifique",
    number: 1,
    family: "Unités, conversions et écriture scientifique",
    title: "Unités, conversions et écriture scientifique",
    shortTitle: "Conversions",
    levels: ["Seconde", "Première", "Terminale", "Bac"],
    description: "Distinguer grandeur, valeur et unité, convertir les unités utiles et utiliser les puissances de 10.",
    objective: "Savoir convertir proprement une valeur et vérifier que l'unité finale est cohérente.",
    why: [
      "Les formules de physique-chimie exigent des unités cohérentes.",
      "Les puissances de 10 permettent d'éviter les erreurs de zéros.",
      "Une unité composée, comme mol·L⁻¹ ou m·s⁻¹, donne déjà une information sur le calcul à effectuer."
    ],
    typicalUses: [
      "Convertir km·h⁻¹ en m·s⁻¹ pour un mouvement.",
      "Convertir mL en L pour une concentration.",
      "Convertir g·mL⁻¹ en kg·m⁻³ pour une masse volumique.",
      "Convertir kWh en J pour une énergie.",
      "Utiliser nano, micro, milli, kilo, méga ou giga dans les mesures."
    ],
    quickMethod: [
      "Écris l'unité de départ et l'unité demandée.",
      "Remplace les préfixes par des puissances de 10.",
      "Convertis séparément chaque partie d'une unité composée.",
      "Vérifie l'ordre de grandeur du résultat."
    ],
    forUnderstanding: "Convertir ne change pas la grandeur physique. Une vitesse de 36 km·h⁻¹ et une vitesse de 10 m·s⁻¹ décrivent le même mouvement, mais avec deux unités différentes.",
    steps: [
      "Identifier la grandeur : longueur, masse, volume, durée, énergie, concentration...",
      "Écrire la valeur avec son unité de départ.",
      "Écrire la relation entre l'unité de départ et l'unité d'arrivée.",
      "Utiliser les puissances de 10 pour les préfixes.",
      "Convertir les unités composées terme par terme.",
      "Conclure avec une valeur et une unité."
    ],
    formulas: [
      { label: "1 L", detail: "= 1,0 × 10⁻³ m³" },
      { label: "1 mL", detail: "= 1 cm³ = 1,0 × 10⁻⁶ m³" },
      { label: "1 km·h⁻¹", detail: "= 1 / 3,6 m·s⁻¹" },
      { label: "1 kWh", detail: "= 3,6 × 10⁶ J" },
      { label: "1 eV", detail: "= 1,60 × 10⁻¹⁹ J" },
      { label: "1 g·mL⁻¹", detail: "= 1000 kg·m⁻³" }
    ],
    examples: [
      {
        title: "Exemple très simple",
        statement: "Convertir 25,0 mL en L.",
        steps: [
          "On sait que 1 L = 1000 mL.",
          "Donc 1 mL = 10⁻³ L.",
          "25,0 mL = 25,0 × 10⁻³ L = 2,50 × 10⁻² L."
        ],
        answer: "25,0 mL = 0,0250 L."
      },
      {
        title: "Exemple un peu plus difficile",
        statement: "Convertir 0,75 kWh en joule.",
        steps: [
          "1 Wh = 3600 J car 1 W = 1 J·s⁻¹ et 1 h = 3600 s.",
          "1 kWh = 1000 Wh = 3,6 × 10⁶ J.",
          "0,75 kWh = 0,75 × 3,6 × 10⁶ J."
        ],
        answer: "0,75 kWh = 2,7 × 10⁶ J."
      }
    ],
    commonMistakes: [
      "Confondre mL et L dans c = n / V.",
      "Convertir une vitesse sans convertir la durée.",
      "Écrire une unité composée au hasard, par exemple mol/L puis oublier le litre au calcul.",
      "Confondre 10⁻³ et 10³.",
      "Garder une écriture avec trop de zéros au lieu d'une écriture scientifique claire."
    ],
    tip: "Quand une unité est composée, lis-la comme une formule : m·s⁻¹ signifie des mètres divisés par des secondes.",
    miniExercise: {
      statement: "Convertis 54 km·h⁻¹ en m·s⁻¹.",
      correction: [
        "On utilise 1 km·h⁻¹ = 1 / 3,6 m·s⁻¹.",
        "54 / 3,6 = 15.",
        "Donc 54 km·h⁻¹ = 15 m·s⁻¹."
      ]
    },
    competencies: ["Réaliser un calcul", "Valider une unité", "Contrôler un ordre de grandeur"],
    remember: [
      "Une grandeur se décrit par une valeur et une unité.",
      "Les préfixes sont des puissances de 10.",
      "Une conversion doit toujours être vérifiée par l'ordre de grandeur."
    ]
  },
  {
    slug: "homogeneite-ordres-grandeur",
    number: 2,
    family: "Unités, conversions et écriture scientifique",
    title: "Homogénéité et ordres de grandeur",
    shortTitle: "Homogénéité",
    levels: ["Seconde", "Première", "Terminale", "Bac"],
    description: "Vérifier qu'une formule est cohérente et qu'un résultat est réaliste.",
    objective: "Savoir détecter une erreur de formule, d'unité ou de conversion avant de conclure.",
    why: [
      "Une formule peut être mal utilisée même si le calcul numérique semble correct.",
      "L'homogénéité vérifie que les deux membres d'une relation ont la même unité.",
      "L'ordre de grandeur permet de repérer un résultat absurde."
    ],
    typicalUses: [
      "Vérifier une relation avant de l'utiliser.",
      "Contrôler une valeur de vitesse, d'énergie ou de concentration.",
      "Repérer une erreur de mL au lieu de L.",
      "Justifier qu'un résultat expérimental est plausible."
    ],
    quickMethod: [
      "Remplace chaque grandeur par son unité.",
      "Simplifie les unités comme une expression mathématique.",
      "Compare l'unité obtenue à l'unité attendue.",
      "Estime rapidement si la valeur numérique est plausible."
    ],
    forUnderstanding: "Une formule homogène n'est pas forcément vraie, mais une formule non homogène est forcément fausse pour décrire une relation physique.",
    steps: [
      "Identifier l'unité attendue pour la grandeur cherchée.",
      "Écrire les unités des grandeurs présentes dans la formule.",
      "Effectuer les produits, quotients, carrés ou racines sur les unités.",
      "Comparer l'unité obtenue à l'unité attendue.",
      "Faire une estimation rapide de la valeur finale.",
      "Corriger si l'unité ou l'ordre de grandeur ne convient pas."
    ],
    formulas: [
      { label: "v = d / t", detail: "m / s = m·s⁻¹" },
      { label: "E = P × t", detail: "W × s = J" },
      { label: "Ec = 1/2 m v²", detail: "kg × (m·s⁻¹)² = J" }
    ],
    examples: [
      {
        title: "Exemple très simple",
        statement: "Vérifier l'unité de v = d / t si d est en m et t en s.",
        steps: [
          "On remplace d par m.",
          "On remplace t par s.",
          "On obtient m / s."
        ],
        answer: "L'unité de v est m·s⁻¹, ce qui est bien une unité de vitesse."
      },
      {
        title: "Exemple un peu plus difficile",
        statement: "Vérifier que Ec = 1/2 m v² donne une énergie.",
        steps: [
          "m est en kg.",
          "v est en m·s⁻¹, donc v² est en m²·s⁻².",
          "m v² est en kg·m²·s⁻².",
          "Or 1 J = 1 kg·m²·s⁻²."
        ],
        answer: "La relation est homogène avec une énergie en joule."
      }
    ],
    commonMistakes: [
      "Croire qu'une formule est juste parce qu'elle donne un nombre.",
      "Oublier que les carrés et les racines s'appliquent aussi aux unités.",
      "Ne pas vérifier si un résultat est réaliste.",
      "Confondre ordre de grandeur et valeur exacte."
    ],
    tip: "Après chaque calcul important, pose-toi deux questions : l'unité est-elle attendue ? la valeur est-elle plausible ?",
    miniExercise: {
      statement: "La relation P = E / t est-elle homogène si E est en J et t en s ?",
      correction: [
        "E / t a pour unité J / s.",
        "Or 1 W = 1 J·s⁻¹.",
        "La relation donne donc une puissance en watt.",
        "La relation est homogène."
      ]
    },
    competencies: ["Valider", "Contrôler une relation", "Porter un regard critique"],
    remember: [
      "Une unité fausse signale souvent une erreur de raisonnement.",
      "Un ordre de grandeur sert à repérer les résultats absurdes.",
      "Homogène ne veut pas dire démontré, mais non homogène veut dire faux."
    ]
  },
  {
    slug: "formules-algebre-calculatrice",
    number: 3,
    family: "Formules et calculs",
    title: "Formules, algèbre et calculatrice",
    shortTitle: "Algèbre",
    levels: ["Seconde", "Première", "Terminale", "Bac"],
    description: "Remplacer des valeurs, isoler une grandeur et utiliser correctement une calculatrice scientifique.",
    objective: "Savoir passer d'une relation littérale à un calcul numérique fiable.",
    why: [
      "La physique-chimie utilise des relations entre grandeurs, pas seulement des recettes numériques.",
      "Isoler une grandeur évite de bricoler les nombres.",
      "La calculatrice doit respecter les priorités opératoires, les parenthèses et l'écriture scientifique."
    ],
    typicalUses: [
      "Isoler V dans c = n / V.",
      "Isoler v dans Ec = 1/2 m v².",
      "Utiliser une racine carrée dans une relation d'énergie.",
      "Utiliser une puissance de 10 sur calculatrice.",
      "Éviter les erreurs de parenthèses dans une fraction."
    ],
    quickMethod: [
      "Écris la relation littérale.",
      "Isole la grandeur cherchée avant de remplacer.",
      "Ajoute des parenthèses si une somme ou un produit est au dénominateur.",
      "Utilise la touche EXP ou ×10^ pour l'écriture scientifique."
    ],
    forUnderstanding: "Isoler une grandeur signifie transformer l'égalité sans changer son équilibre. Ce que l'on fait d'un côté doit être cohérent avec ce que l'on fait de l'autre.",
    steps: [
      "Repérer la grandeur cherchée.",
      "Écrire la formule qui contient cette grandeur.",
      "Déplacer les facteurs par division ou multiplication.",
      "Supprimer un carré avec une racine carrée si nécessaire.",
      "Remplacer les grandeurs par des valeurs déjà converties.",
      "Entrer le calcul avec des parenthèses utiles.",
      "Vérifier l'unité et le nombre de chiffres du résultat."
    ],
    formulas: [
      { label: "c = n / V", detail: "donc n = cV et V = n / c" },
      { label: "Ec = 1/2 m v²", detail: "donc v = √(2Ec / m)" },
      { label: "T = 1 / f", detail: "donc f = 1 / T" },
      { label: "U = R I", detail: "donc R = U / I et I = U / R" }
    ],
    examples: [
      {
        title: "Exemple très simple",
        statement: "On connaît n = 2,0 × 10⁻³ mol et c = 0,10 mol·L⁻¹. Calculer V avec c = n / V.",
        steps: [
          "On cherche V.",
          "Relation : c = n / V, donc V = n / c.",
          "Application : V = 2,0 × 10⁻³ / 0,10.",
          "V = 2,0 × 10⁻² L."
        ],
        answer: "Le volume vaut 2,0 × 10⁻² L, soit 20 mL."
      },
      {
        title: "Exemple un peu plus difficile",
        statement: "Un système de masse 0,50 kg possède une énergie cinétique de 25 J. Calculer sa vitesse.",
        steps: [
          "Relation : Ec = 1/2 m v².",
          "On isole v : v = √(2Ec / m).",
          "Application : v = √(2 × 25 / 0,50).",
          "v = √100 = 10."
        ],
        answer: "La vitesse vaut 10 m·s⁻¹."
      }
    ],
    commonMistakes: [
      "Remplacer les valeurs avant d'avoir isolé la grandeur.",
      "Oublier les parenthèses au dénominateur.",
      "Écrire 10^-3 dans la calculatrice d'une façon ambiguë.",
      "Oublier la racine carrée lorsqu'on isole une grandeur au carré.",
      "Arrondir trop tôt dans un calcul en plusieurs étapes."
    ],
    tip: "Quand une formule contient une fraction, réécris-la sur papier avant de saisir la calculatrice.",
    miniExercise: {
      statement: "Avec U = R × I, calcule R si U = 6,0 V et I = 30 mA.",
      correction: [
        "On convertit l'intensité : 30 mA = 0,030 A.",
        "On isole R : R = U / I.",
        "R = 6,0 / 0,030 = 200 Ω.",
        "La résistance vaut 200 Ω."
      ]
    },
    competencies: ["Réaliser", "Calculer", "Manipuler une relation littérale"],
    remember: [
      "La formule littérale vient avant l'application numérique.",
      "Les parenthèses évitent beaucoup d'erreurs.",
      "On n'oublie jamais les unités après le calcul."
    ]
  },
  {
    slug: "relations-quantitatives-chimie",
    number: 4,
    family: "Formules et calculs",
    title: "Relations quantitatives en chimie",
    shortTitle: "Chimie quantitative",
    levels: ["Seconde", "Première", "Terminale", "Bac"],
    description: "Utiliser quantité de matière, concentration, dilution, avancement, titrage et rendement.",
    objective: "Savoir choisir la relation de chimie adaptée à la grandeur cherchée.",
    why: [
      "La chimie quantitative relie les masses, volumes, quantités de matière et concentrations.",
      "Les erreurs viennent souvent du choix de la mauvaise relation.",
      "Les coefficients stœchiométriques doivent être pris en compte dans les réactions."
    ],
    typicalUses: [
      "Calculer n avec n = m / M.",
      "Calculer c avec c = n / V.",
      "Exploiter une dilution : c₁V₁ = c₂V₂.",
      "Établir une relation à l'équivalence d'un titrage.",
      "Calculer un rendement de synthèse.",
      "Utiliser un tableau d'avancement."
    ],
    quickMethod: [
      "Repère si l'énoncé parle de masse, volume, quantité de matière ou concentration.",
      "Écris les unités disponibles.",
      "Choisis la relation qui relie directement les données à la grandeur cherchée.",
      "Pour une réaction, regarde les coefficients stœchiométriques."
    ],
    forUnderstanding: "La mole sert de pont entre l'échelle macroscopique mesurable au laboratoire et la quantité d'entités chimiques.",
    steps: [
      "Identifier l'espèce chimique étudiée.",
      "Repérer la grandeur cherchée : m, M, n, V, c, Cm, x ou rendement.",
      "Sélectionner la relation adaptée.",
      "Convertir les volumes en litre si la concentration est en mol·L⁻¹ ou g·L⁻¹.",
      "Tenir compte des coefficients stœchiométriques si une réaction intervient.",
      "Calculer et conclure avec l'unité."
    ],
    formulas: [
      { label: "n = m / M", detail: "m en g, M en g·mol⁻¹, n en mol" },
      { label: "c = n / V", detail: "V en L, c en mol·L⁻¹" },
      { label: "Cm = m / V", detail: "V en L, Cm en g·L⁻¹" },
      { label: "c₁V₁ = c₂V₂", detail: "dilution dans le cas usuel" },
      { label: "η = n_obtenu / n_max × 100", detail: "rendement en %" }
    ],
    examples: [
      {
        title: "Exemple très simple",
        statement: "Calculer la quantité de matière dans 5,85 g de NaCl, avec M(NaCl) = 58,5 g·mol⁻¹.",
        steps: [
          "On cherche n.",
          "Relation : n = m / M.",
          "Application : n = 5,85 / 58,5.",
          "n = 0,100 mol."
        ],
        answer: "La quantité de matière de chlorure de sodium est 0,100 mol."
      },
      {
        title: "Exemple un peu plus difficile",
        statement: "On dose A par B selon A + 2B → produits. À l'équivalence, VA = 10,0 mL, cB = 2,00 × 10⁻² mol·L⁻¹ et VE = 12,5 mL. Calculer cA.",
        steps: [
          "À l'équivalence : nA / 1 = nB / 2.",
          "Donc cA VA = cB VE / 2.",
          "Les volumes sont dans la même unité, on peut garder mL dans le quotient.",
          "cA = cB VE / (2 VA).",
          "cA = 2,00 × 10⁻² × 12,5 / (2 × 10,0)."
        ],
        answer: "cA = 1,25 × 10⁻² mol·L⁻¹."
      }
    ],
    commonMistakes: [
      "Utiliser m en kg alors que M est en g·mol⁻¹.",
      "Oublier de convertir mL en L dans c = n / V.",
      "Utiliser c₁V₁ = c₂V₂ dans un titrage avec coefficients différents.",
      "Confondre concentration en masse et concentration en quantité de matière.",
      "Oublier les coefficients stœchiométriques dans une relation d'avancement."
    ],
    tip: "En chimie, écris toujours la ligne des unités avant le calcul : elle t'indique souvent la bonne relation.",
    miniExercise: {
      statement: "Calculer la concentration d'une solution contenant n = 2,50 × 10⁻³ mol dans V = 50,0 mL.",
      correction: [
        "On convertit le volume : 50,0 mL = 0,0500 L.",
        "Relation : c = n / V.",
        "c = 2,50 × 10⁻³ / 0,0500.",
        "c = 5,00 × 10⁻² mol·L⁻¹."
      ]
    },
    competencies: ["S'approprier", "Réaliser", "Valider les unités"],
    remember: [
      "n = m / M relie masse et quantité de matière.",
      "c = n / V exige généralement V en litre.",
      "Une réaction chimique impose de regarder les coefficients."
    ]
  },
  {
    slug: "proportionnalite-pourcentages-rendements",
    number: 5,
    family: "Proportionnalité et pourcentages",
    title: "Proportionnalité, pourcentages et rendements",
    shortTitle: "Pourcentages",
    levels: ["Seconde", "Première", "Terminale", "Bac"],
    description: "Utiliser une proportionnalité, un pourcentage, un rendement, un taux d'avancement ou une échelle.",
    objective: "Savoir repérer une proportionnalité et interpréter un pourcentage physiquement.",
    why: [
      "Les pourcentages sont fréquents dans les rendements, les écarts relatifs et les compositions.",
      "La proportionnalité permet de passer d'une valeur mesurée à une valeur cherchée.",
      "Une droite passant par l'origine traduit souvent une relation proportionnelle."
    ],
    typicalUses: [
      "Calculer un rendement de synthèse.",
      "Calculer un taux d'avancement final.",
      "Exploiter une dilution.",
      "Utiliser une échelle sur un schéma ou un vecteur.",
      "Calculer une variation relative.",
      "Interpréter une pente comme coefficient directeur."
    ],
    quickMethod: [
      "Identifie la grandeur de référence.",
      "Écris le rapport partie / total.",
      "Multiplie par 100 si on demande un pourcentage.",
      "Vérifie si le résultat doit être inférieur à 100 %."
    ],
    forUnderstanding: "Un pourcentage est un rapport. Il ne dit rien seul : il faut toujours préciser par rapport à quelle valeur il est calculé.",
    steps: [
      "Repérer la valeur comparée et la valeur de référence.",
      "Écrire le quotient dans le bon sens.",
      "Multiplier par 100 pour un pourcentage.",
      "Préciser l'unité ou le symbole %.",
      "Interpréter : rendement, écart, progression, taux ou composition.",
      "Vérifier si la valeur est physiquement possible."
    ],
    formulas: [
      { label: "pourcentage", detail: "partie / total × 100" },
      { label: "écart relatif", detail: "|valeur - référence| / référence × 100" },
      { label: "rendement", detail: "quantité obtenue / quantité maximale × 100" },
      { label: "taux d'avancement", detail: "x_final / x_max × 100" }
    ],
    examples: [
      {
        title: "Exemple très simple",
        statement: "Une synthèse permet d'obtenir 7,5 g de produit alors que la masse maximale est 10,0 g. Calculer le rendement.",
        steps: [
          "Rendement = masse obtenue / masse maximale × 100.",
          "η = 7,5 / 10,0 × 100.",
          "η = 75 %."
        ],
        answer: "Le rendement de la synthèse est 75 %."
      },
      {
        title: "Exemple un peu plus difficile",
        statement: "Une valeur expérimentale vaut 9,6 m·s⁻² et la valeur de référence vaut 9,81 m·s⁻². Calculer l'écart relatif.",
        steps: [
          "Écart absolu : |9,6 - 9,81| = 0,21.",
          "Écart relatif : 0,21 / 9,81 × 100.",
          "Écart relatif ≈ 2,1 %."
        ],
        answer: "L'écart relatif est d'environ 2,1 %."
      }
    ],
    commonMistakes: [
      "Inverser le numérateur et le dénominateur.",
      "Utiliser un produit en croix sans identifier les grandeurs.",
      "Oublier que le rendement ne dépasse normalement pas 100 % dans ce contexte.",
      "Confondre écart absolu et écart relatif.",
      "Conclure à une proportionnalité sans vérifier l'origine."
    ],
    tip: "Pour un pourcentage, demande toujours : pourcentage de quoi ?",
    miniExercise: {
      statement: "On obtient 3,80 g de produit pour une masse maximale de 5,00 g. Calcule le rendement.",
      correction: [
        "η = m_obtenue / m_max × 100.",
        "η = 3,80 / 5,00 × 100.",
        "η = 76,0 %.",
        "Le rendement est 76,0 %."
      ]
    },
    competencies: ["Analyser", "Calculer", "Interpréter un résultat"],
    remember: [
      "Un pourcentage est toujours un rapport à une référence.",
      "Un rendement compare obtenu et maximal.",
      "Un écart relatif permet de comparer des écarts dans des situations différentes."
    ]
  },
  {
    slug: "graphiques-modelisation-lineaire",
    number: 6,
    family: "Graphiques et modélisation",
    title: "Graphiques, droites et modélisation",
    shortTitle: "Graphiques",
    levels: ["Seconde", "Première", "Terminale", "Bac"],
    description: "Tracer un graphique, lire une pente, exploiter une droite moyenne et distinguer modèle et mesures.",
    objective: "Savoir passer d'un tableau de mesures à une interprétation physique.",
    why: [
      "Un graphique permet de visualiser une relation entre deux grandeurs.",
      "La pente d'une droite peut représenter une grandeur physique.",
      "Les mesures expérimentales ne tombent pas toujours exactement sur le modèle."
    ],
    typicalUses: [
      "Caractéristique tension-intensité d'un dipôle.",
      "Loi de Beer-Lambert A = k c.",
      "Évolution d'une position au cours du temps.",
      "Courbe d'étalonnage d'un capteur.",
      "Régression linéaire avec un tableur ou Python."
    ],
    quickMethod: [
      "Nommer les axes avec les unités.",
      "Placer les points expérimentaux.",
      "Observer l'allure avant de choisir un modèle.",
      "Calculer la pente avec deux points éloignés de la droite.",
      "Interpréter la pente et l'ordonnée à l'origine."
    ],
    forUnderstanding: "Un modèle n'est pas une copie parfaite des mesures. Il résume une tendance pour expliquer ou prévoir dans un domaine limité.",
    steps: [
      "Lire les grandeurs portées sur les axes.",
      "Vérifier les unités et convertir si nécessaire.",
      "Repérer si les points sont alignés, courbés ou dispersés.",
      "Tracer une droite moyenne si le modèle linéaire est pertinent.",
      "Calculer le coefficient directeur : variation verticale / variation horizontale.",
      "Lire ou interpréter l'ordonnée à l'origine.",
      "Commenter les écarts entre points et modèle."
    ],
    formulas: [
      { label: "droite affine", detail: "y = ax + b" },
      { label: "coefficient directeur", detail: "a = Δy / Δx" },
      { label: "proportionnalité", detail: "droite passant par l'origine : y = ax" }
    ],
    examples: [
      {
        title: "Exemple très simple",
        statement: "Pour un conducteur ohmique, on mesure U = 4,0 V pour I = 0,020 A. Estimer R.",
        steps: [
          "Loi d'Ohm : U = R I.",
          "Si la caractéristique passe par l'origine, R est la pente U / I.",
          "R = 4,0 / 0,020 = 200."
        ],
        answer: "La résistance vaut environ 200 Ω."
      },
      {
        title: "Exemple un peu plus difficile",
        statement: "Une droite d'étalonnage vérifie A = 1200 c + 0,005. Une solution inconnue a A = 0,365. Calculer c.",
        steps: [
          "On isole c : c = (A - 0,005) / 1200.",
          "c = (0,365 - 0,005) / 1200.",
          "c = 0,360 / 1200 = 3,00 × 10⁻⁴."
        ],
        answer: "La concentration vaut c = 3,00 × 10⁻⁴ mol·L⁻¹ si la droite utilise cette unité."
      }
    ],
    commonMistakes: [
      "Inverser abscisse et ordonnée.",
      "Calculer la pente avec des unités incohérentes.",
      "Forcer une droite passant par l'origine alors que l'ordonnée à l'origine n'est pas négligeable.",
      "Confondre une courbe d'étalonnage avec un spectre.",
      "Utiliser le modèle en dehors du domaine expérimental."
    ],
    tip: "Une pente a une unité : c'est souvent elle qui donne son sens physique au coefficient directeur.",
    miniExercise: {
      statement: "Une droite U = f(I) passe par les points (0 A ; 0 V) et (0,050 A ; 6,0 V). Calcule la pente.",
      correction: [
        "a = ΔU / ΔI.",
        "a = (6,0 - 0) / (0,050 - 0).",
        "a = 120 V·A⁻¹ = 120 Ω.",
        "La résistance modélisée vaut 120 Ω."
      ]
    },
    competencies: ["Exploiter un graphique", "Modéliser", "Valider un modèle"],
    remember: [
      "Un graphique doit avoir titre, axes, unités et points lisibles.",
      "La pente se calcule avec les unités des axes.",
      "Un modèle s'utilise seulement dans son domaine de validité."
    ]
  },
  {
    slug: "etalonnage-interpolation-points-aberrants",
    number: 7,
    family: "Graphiques et modélisation",
    title: "Étalonnage, interpolation et points aberrants",
    shortTitle: "Étalonnage",
    levels: ["Seconde", "Première", "Terminale", "Bac"],
    description: "Utiliser une courbe d'étalonnage, déterminer une valeur inconnue et commenter les écarts expérimentaux.",
    objective: "Savoir lire une valeur inconnue sur une courbe en restant dans le domaine expérimental.",
    why: [
      "Un capteur ou un dosage par étalonnage transforme une mesure en grandeur physique.",
      "L'interpolation est plus fiable que l'extrapolation.",
      "Un point aberrant doit être discuté, pas supprimé automatiquement."
    ],
    typicalUses: [
      "Dosage spectrophotométrique par étalonnage.",
      "Capteur de température ou de luminosité.",
      "Caractéristique d'un dipôle.",
      "Analyse d'un nuage de points expérimental.",
      "Comparaison entre modèle et mesures."
    ],
    quickMethod: [
      "Vérifie que la valeur inconnue est dans le domaine d'étalonnage.",
      "Reporte la mesure sur le bon axe.",
      "Lis la valeur correspondante sur l'autre axe.",
      "Si tu utilises l'équation de la droite, garde les unités.",
      "Commente la précision et les éventuels points aberrants."
    ],
    forUnderstanding: "Interpoler signifie lire entre des valeurs mesurées. Extrapoler signifie sortir du domaine mesuré : c'est beaucoup plus fragile.",
    steps: [
      "Identifier quelle grandeur est connue et quelle grandeur est cherchée.",
      "Repérer le domaine expérimental de la courbe.",
      "Placer la valeur connue sur son axe.",
      "Lire graphiquement ou calculer avec l'équation du modèle.",
      "Vérifier que la valeur obtenue n'est pas une extrapolation abusive.",
      "Commenter les écarts et les points qui semblent anormaux."
    ],
    formulas: [
      { label: "interpolation", detail: "lecture entre deux valeurs mesurées" },
      { label: "extrapolation", detail: "lecture hors du domaine mesuré : à éviter sans justification" },
      { label: "point aberrant", detail: "point très éloigné du comportement attendu, à analyser" }
    ],
    examples: [
      {
        title: "Exemple très simple",
        statement: "Une courbe d'étalonnage donne U = 0,050 T pour un capteur de température, avec U en V et T en °C. Si U = 1,50 V, calculer T.",
        steps: [
          "On isole T : T = U / 0,050.",
          "T = 1,50 / 0,050.",
          "T = 30."
        ],
        answer: "La température vaut 30 °C."
      },
      {
        title: "Exemple un peu plus difficile",
        statement: "Une gamme étalon d'absorbance est linéaire entre 0 et 5,0 × 10⁻⁴ mol·L⁻¹. Une inconnue donne une concentration calculée de 7,0 × 10⁻⁴ mol·L⁻¹. Peut-on conclure directement ?",
        steps: [
          "La valeur calculée est supérieure à la plus grande concentration étalon.",
          "On sort du domaine d'étalonnage.",
          "La détermination est une extrapolation."
        ],
        answer: "On ne conclut pas directement. Il faut diluer la solution inconnue ou refaire une gamme adaptée."
      }
    ],
    commonMistakes: [
      "Lire sur le mauvais axe.",
      "Utiliser une droite d'étalonnage hors de son domaine.",
      "Supprimer un point aberrant sans justification.",
      "Confondre dispersion normale des mesures et erreur évidente.",
      "Oublier l'unité de la grandeur déterminée."
    ],
    tip: "Sur une courbe d'étalonnage, la première question est toujours : suis-je dans le domaine mesuré ?",
    miniExercise: {
      statement: "Un capteur vérifie U = 0,20 d avec U en V et d en cm. Quelle distance correspond à U = 1,6 V ?",
      correction: [
        "On isole d : d = U / 0,20.",
        "d = 1,6 / 0,20 = 8,0.",
        "La distance vaut 8,0 cm, si cette valeur appartient au domaine d'étalonnage."
      ]
    },
    competencies: ["Lire un graphique", "Valider un domaine", "Interpréter une mesure"],
    remember: [
      "Interpoler est généralement acceptable dans le domaine mesuré.",
      "Extrapoler demande une justification forte.",
      "Un point aberrant se discute scientifiquement."
    ]
  },
  {
    slug: "vecteurs-geometrie-trigonometrie",
    number: 8,
    family: "Vecteurs, géométrie et trigonométrie",
    title: "Vecteurs, géométrie et trigonométrie",
    shortTitle: "Vecteurs",
    levels: ["Seconde", "Première", "Terminale", "Bac"],
    description: "Utiliser Pythagore, sinus, cosinus, tangente, projections et vecteurs en mécanique et optique.",
    objective: "Savoir représenter et exploiter une grandeur vectorielle ou un angle dans une situation physique.",
    why: [
      "Les forces, vitesses, accélérations et champs sont souvent des vecteurs.",
      "La trigonométrie permet de relier une direction inclinée à des composantes sur des axes.",
      "Le signe d'une valeur algébrique ne doit pas être confondu avec la norme d'un vecteur."
    ],
    typicalUses: [
      "Projeter une force sur un axe.",
      "Additionner des forces graphiquement.",
      "Utiliser une échelle vectorielle.",
      "Calculer un travail W = F d cos α.",
      "Exploiter un angle en optique ou en mécanique.",
      "Décomposer une vitesse ou une force."
    ],
    quickMethod: [
      "Dessine la situation.",
      "Choisis les axes.",
      "Repère direction, sens et norme du vecteur.",
      "Utilise cosinus pour la composante adjacente à l'angle.",
      "Utilise sinus pour la composante opposée à l'angle."
    ],
    forUnderstanding: "Un vecteur porte trois informations : direction, sens et valeur. Sa norme est toujours positive, mais sa projection sur un axe peut être positive ou négative.",
    steps: [
      "Faire un schéma clair avec les axes.",
      "Placer l'angle donné au bon endroit.",
      "Identifier l'hypoténuse et les côtés adjacent/opposé.",
      "Choisir sinus, cosinus ou tangente.",
      "Calculer la composante ou la longueur cherchée.",
      "Vérifier le signe si l'on travaille sur un axe orienté.",
      "Conclure avec l'unité."
    ],
    formulas: [
      { label: "Pythagore", detail: "hypoténuse² = côté1² + côté2²" },
      { label: "cos α", detail: "adjacent / hypoténuse" },
      { label: "sin α", detail: "opposé / hypoténuse" },
      { label: "W = F d cos α", detail: "travail d'une force constante" }
    ],
    examples: [
      {
        title: "Exemple très simple",
        statement: "Une force de 10 N fait un angle de 60° avec l'axe horizontal. Calculer sa composante horizontale.",
        steps: [
          "La composante horizontale est adjacente à l'angle.",
          "Fx = F cos α.",
          "Fx = 10 × cos 60° = 10 × 0,50."
        ],
        answer: "La composante horizontale vaut 5,0 N."
      },
      {
        title: "Exemple un peu plus difficile",
        statement: "Une force de 20 N déplace un objet de 3,0 m avec un angle de 30° avec le déplacement. Calculer le travail.",
        steps: [
          "Relation : W = F d cos α.",
          "W = 20 × 3,0 × cos 30°.",
          "cos 30° ≈ 0,866.",
          "W ≈ 52 J."
        ],
        answer: "Le travail de la force vaut environ 52 J."
      }
    ],
    commonMistakes: [
      "Confondre direction et sens.",
      "Confondre norme et valeur algébrique.",
      "Utiliser sinus au lieu de cosinus sans regarder le triangle.",
      "Oublier de régler la calculatrice en degrés.",
      "Choisir une échelle vectorielle illisible."
    ],
    tip: "Avant de choisir sin ou cos, place l'angle et nomme les côtés du triangle.",
    miniExercise: {
      statement: "Une force de 8,0 N fait un angle de 45° avec l'axe horizontal. Calcule sa composante horizontale.",
      correction: [
        "La composante horizontale est Fx = F cos α.",
        "Fx = 8,0 × cos 45°.",
        "cos 45° ≈ 0,707.",
        "Fx ≈ 5,7 N."
      ]
    },
    competencies: ["Schématiser", "Raisonner avec des vecteurs", "Calculer une projection"],
    remember: [
      "Un vecteur a une direction, un sens et une norme.",
      "Une projection peut être positive ou négative selon l'axe.",
      "Le choix de sin ou cos dépend du côté du triangle."
    ]
  },
  {
    slug: "derivees-cinematique-pente-locale",
    number: 9,
    family: "Fonctions, dérivées, exponentielles et logarithmes",
    title: "Dérivées, vitesse et accélération",
    shortTitle: "Dérivées",
    levels: ["Première", "Terminale", "Bac"],
    description: "Comprendre une dérivée comme une vitesse de variation et relier position, vitesse et accélération.",
    objective: "Savoir exploiter une pente locale ou une dérivée fournie dans une situation physique.",
    why: [
      "La vitesse est la dérivée de la position dans un mouvement rectiligne.",
      "L'accélération est la dérivée de la vitesse.",
      "La pente locale d'une courbe indique comment une grandeur varie à un instant donné."
    ],
    typicalUses: [
      "Relier x(t), v(t) et a(t).",
      "Lire une vitesse instantanée sur une tangente.",
      "Exploiter une équation différentielle simple fournie.",
      "Interpréter la pente d'une courbe expérimentale.",
      "Étudier un système électrique ou mécanique en terminale."
    ],
    quickMethod: [
      "Repère la grandeur en fonction du temps.",
      "La dérivée donne la vitesse de variation.",
      "Une pente positive signifie que la grandeur augmente.",
      "Une pente nulle signifie que la grandeur est localement stable."
    ],
    forUnderstanding: "Une dérivée n'est pas seulement un calcul : c'est une pente locale. Elle décrit ce qui se passe autour d'un instant précis.",
    steps: [
      "Identifier la fonction étudiée, par exemple x(t).",
      "Repérer ce que représente sa dérivée.",
      "Calculer ou lire la pente locale.",
      "Associer le signe de la dérivée au sens de variation.",
      "Associer l'unité de la dérivée au quotient des unités.",
      "Conclure physiquement."
    ],
    formulas: [
      { label: "v = dx / dt", detail: "vitesse comme dérivée de la position" },
      { label: "a = dv / dt", detail: "accélération comme dérivée de la vitesse" },
      { label: "pente locale", detail: "variation verticale / variation horizontale autour d'un point" }
    ],
    examples: [
      {
        title: "Exemple très simple",
        statement: "Si x(t) = 3,0 t + 2, avec x en m et t en s, déterminer la vitesse.",
        steps: [
          "La vitesse est la dérivée de x(t).",
          "La dérivée de 3,0 t + 2 est 3,0.",
          "L'unité est m·s⁻¹."
        ],
        answer: "La vitesse vaut 3,0 m·s⁻¹."
      },
      {
        title: "Exemple un peu plus difficile",
        statement: "Si v(t) = 4,0 t - 1,0, avec v en m·s⁻¹ et t en s, déterminer l'accélération.",
        steps: [
          "L'accélération est la dérivée de v(t).",
          "La dérivée de 4,0 t - 1,0 est 4,0.",
          "L'unité est m·s⁻²."
        ],
        answer: "L'accélération vaut 4,0 m·s⁻²."
      }
    ],
    commonMistakes: [
      "Confondre valeur de la fonction et valeur de sa dérivée.",
      "Oublier l'unité de la dérivée.",
      "Lire une pente moyenne alors qu'on demande une pente locale.",
      "Croire qu'une dérivée négative signifie une valeur négative de la grandeur.",
      "Ne pas relier le résultat au sens physique."
    ],
    tip: "Sur un graphique, dériver revient à regarder l'inclinaison de la courbe à l'endroit étudié.",
    miniExercise: {
      statement: "Si x(t) = 5,0 t², quelle est l'expression de v(t) ?",
      correction: [
        "La vitesse est la dérivée de x(t).",
        "La dérivée de 5,0 t² est 10,0 t.",
        "Donc v(t) = 10,0 t, en m·s⁻¹ si x est en m et t en s."
      ]
    },
    competencies: ["Modéliser", "Exploiter une fonction", "Interpréter une pente"],
    remember: [
      "Une dérivée est une vitesse de variation.",
      "Position, vitesse et accélération sont reliées par dérivation.",
      "L'unité de la dérivée se déduit des unités de la fonction et de la variable."
    ]
  },
  {
    slug: "exponentielles-logarithmes",
    number: 10,
    family: "Fonctions, dérivées, exponentielles et logarithmes",
    title: "Exponentielles, logarithmes, pH et demi-vie",
    shortTitle: "Log et exponentielle",
    levels: ["Première", "Terminale", "Bac"],
    description: "Manipuler e^(-t/τ), les demi-vies, le pH, le niveau sonore et les logarithmes simples.",
    objective: "Savoir reconnaître et exploiter une relation logarithmique ou exponentielle au niveau attendu en physique-chimie.",
    why: [
      "Les exponentielles décrivent des évolutions qui ralentissent ou décroissent régulièrement.",
      "Les logarithmes apparaissent dans le pH et les niveaux sonores.",
      "Ces fonctions servent à relier des grandeurs qui varient sur de très grands intervalles."
    ],
    typicalUses: [
      "Radioactivité et demi-vie.",
      "Charge ou décharge d'un condensateur.",
      "Refroidissement ou cinétique dans certains modèles.",
      "Calcul du pH : pH = -log [H₃O⁺].",
      "Niveau sonore en décibel.",
      "Isolement d'une durée dans une relation exponentielle fournie."
    ],
    quickMethod: [
      "Pour e^(-t/τ), vérifie que t et τ ont la même unité.",
      "Pour un logarithme, vérifie que la grandeur à l'intérieur est sans unité ou comparée à une référence.",
      "Pour isoler une variable dans une exponentielle, utilise ln si cela est demandé.",
      "Pour le pH, retiens que [H₃O⁺] = 10⁻pH."
    ],
    forUnderstanding: "Une exponentielle décroissante ne diminue pas de la même quantité à chaque seconde : elle diminue d'une même proportion sur des durées caractéristiques.",
    steps: [
      "Identifier si le modèle est logarithmique ou exponentiel.",
      "Repérer les constantes : τ, demi-vie, référence, concentration.",
      "Vérifier les unités avant d'utiliser la relation.",
      "Utiliser log, ln ou exp avec les parenthèses correctes.",
      "Interpréter le résultat : pH, durée, rapport, niveau ou proportion restante.",
      "Vérifier si la valeur obtenue est plausible."
    ],
    formulas: [
      { label: "pH = -log[H₃O⁺]", detail: "[H₃O⁺] en mol·L⁻¹ dans le cadre usuel" },
      { label: "[H₃O⁺] = 10⁻pH", detail: "relation inverse du pH" },
      { label: "N(t) = N₀ e^(-λt)", detail: "modèle de décroissance" },
      { label: "u(t) = E(1 - e^(-t/τ))", detail: "exemple de charge d'un condensateur" }
    ],
    examples: [
      {
        title: "Exemple très simple",
        statement: "Calculer le pH d'une solution telle que [H₃O⁺] = 1,0 × 10⁻³ mol·L⁻¹.",
        steps: [
          "Relation : pH = -log[H₃O⁺].",
          "pH = -log(1,0 × 10⁻³).",
          "log(10⁻³) = -3."
        ],
        answer: "Le pH vaut 3,0."
      },
      {
        title: "Exemple un peu plus difficile",
        statement: "Pour une charge de condensateur, u(t) = E(1 - e^(-t/τ)). Quelle fraction de E est atteinte à t = τ ?",
        steps: [
          "On remplace t par τ.",
          "u(τ) = E(1 - e⁻¹).",
          "e⁻¹ ≈ 0,37.",
          "u(τ) ≈ E(1 - 0,37) = 0,63 E."
        ],
        answer: "À t = τ, la tension atteint environ 63 % de sa valeur finale."
      }
    ],
    commonMistakes: [
      "Confondre log et ln.",
      "Oublier les parenthèses dans la calculatrice.",
      "Mettre une unité directement dans un logarithme.",
      "Croire qu'une demi-vie correspond à une disparition totale.",
      "Oublier que t et τ doivent être dans la même unité."
    ],
    tip: "Pour le pH, un bon réflexe : pH 3 correspond à environ 10⁻³ mol·L⁻¹ en ions oxonium.",
    miniExercise: {
      statement: "Une solution a pH = 4,0. Estime [H₃O⁺].",
      correction: [
        "Relation inverse : [H₃O⁺] = 10⁻pH.",
        "[H₃O⁺] = 10⁻⁴ mol·L⁻¹.",
        "La concentration en ions oxonium vaut environ 1,0 × 10⁻⁴ mol·L⁻¹."
      ]
    },
    competencies: ["Exploiter un modèle", "Utiliser une calculatrice", "Interpréter une évolution"],
    remember: [
      "Une exponentielle contient souvent une durée caractéristique.",
      "Un logarithme demande des parenthèses et une référence claire.",
      "Le pH est une grandeur logarithmique."
    ]
  },
  {
    slug: "mesures-incertitudes-chiffres-significatifs",
    number: 11,
    family: "Mesures et incertitudes",
    title: "Mesures, incertitudes et chiffres significatifs",
    shortTitle: "Incertitudes",
    levels: ["Seconde", "Première", "Terminale", "Bac"],
    description: "Écrire un résultat avec son incertitude, comparer à une référence et arrondir correctement.",
    objective: "Savoir conclure sur une mesure sans confondre précision, exactitude et nombre de décimales.",
    why: [
      "Une mesure n'est jamais parfaitement exacte.",
      "L'incertitude indique la précision raisonnable du résultat.",
      "Comparer à une valeur de référence demande de tenir compte de l'incertitude."
    ],
    typicalUses: [
      "Écrire un résultat expérimental.",
      "Comparer une valeur mesurée à une valeur tabulée.",
      "Arrondir une valeur calculée.",
      "Commenter une compatibilité.",
      "Identifier des sources d'erreur expérimentale."
    ],
    quickMethod: [
      "Arrondis l'incertitude à un chiffre significatif, parfois deux si nécessaire.",
      "Arrondis la valeur mesurée au même rang que l'incertitude.",
      "Écris valeur ± incertitude avec l'unité.",
      "Compare les intervalles ou l'écart à l'incertitude."
    ],
    forUnderstanding: "Plus de décimales ne signifie pas plus de précision. Une mesure 2,000000 m affichée par une calculatrice peut être beaucoup moins fiable qu'une mesure 2,00 m avec incertitude connue.",
    steps: [
      "Identifier la valeur mesurée ou calculée.",
      "Identifier l'incertitude associée.",
      "Arrondir l'incertitude raisonnablement.",
      "Arrondir la valeur au même rang.",
      "Écrire le résultat avec l'unité.",
      "Comparer à une référence si demandé.",
      "Conclure en utilisant un vocabulaire prudent : compatible, non compatible, plausible."
    ],
    formulas: [
      { label: "résultat", detail: "x = (valeur ± u) unité" },
      { label: "écart relatif", detail: "|x - x_ref| / x_ref × 100" },
      { label: "compatibilité", detail: "on compare l'écart à l'incertitude ou les intervalles" }
    ],
    examples: [
      {
        title: "Exemple très simple",
        statement: "Écrire correctement L = 12,345 cm avec u(L) = 0,2 cm.",
        steps: [
          "L'incertitude est au dixième de centimètre.",
          "On arrondit la valeur au dixième.",
          "12,345 cm devient 12,3 cm."
        ],
        answer: "L = (12,3 ± 0,2) cm."
      },
      {
        title: "Exemple un peu plus difficile",
        statement: "On mesure g = (9,7 ± 0,2) N·kg⁻¹. La référence est 9,81 N·kg⁻¹. Les valeurs sont-elles compatibles ?",
        steps: [
          "L'intervalle de mesure est [9,5 ; 9,9] N·kg⁻¹.",
          "La valeur 9,81 appartient à cet intervalle.",
          "La mesure est donc compatible avec la référence."
        ],
        answer: "La valeur mesurée est compatible avec la valeur de référence."
      }
    ],
    commonMistakes: [
      "Écrire trop de décimales par rapport à l'incertitude.",
      "Dire qu'une mesure est fausse dès qu'elle diffère de la référence.",
      "Confondre erreur et incertitude.",
      "Oublier l'unité dans l'incertitude.",
      "Croire qu'une incertitude est une faute de manipulation."
    ],
    tip: "La valeur et son incertitude doivent s'arrêter au même rang décimal.",
    miniExercise: {
      statement: "Écris m = 5,678 g avec u(m) = 0,03 g.",
      correction: [
        "L'incertitude est au centième de gramme.",
        "On arrondit la masse au centième : 5,678 g devient 5,68 g.",
        "Résultat : m = (5,68 ± 0,03) g."
      ]
    },
    competencies: ["Valider", "Communiquer", "Porter un regard critique"],
    remember: [
      "Une incertitude accompagne l'unité de la grandeur.",
      "La valeur doit être arrondie au même rang que l'incertitude.",
      "La compatibilité se raisonne, elle ne se devine pas."
    ]
  },
  {
    slug: "series-mesures-statistiques",
    number: 12,
    family: "Mesures et incertitudes",
    title: "Séries de mesures, moyenne et dispersion",
    shortTitle: "Statistiques",
    levels: ["Seconde", "Première", "Terminale", "Bac"],
    description: "Exploiter une série de mesures, calculer une moyenne, un écart-type et interpréter une dispersion.",
    objective: "Savoir résumer plusieurs mesures indépendantes sans prétendre obtenir la valeur vraie.",
    why: [
      "Répéter une mesure permet d'observer la variabilité expérimentale.",
      "La moyenne donne une valeur centrale.",
      "La dispersion indique si les mesures sont regroupées ou très étalées."
    ],
    typicalUses: [
      "Mesures répétées d'une période.",
      "Mesures de masse, volume ou température.",
      "Construction d'un histogramme.",
      "Calcul d'une incertitude-type sur une moyenne.",
      "Comparaison de deux protocoles expérimentaux."
    ],
    quickMethod: [
      "Vérifie que toutes les valeurs ont la même unité.",
      "Calcule la moyenne.",
      "Observe la dispersion ou calcule l'écart-type.",
      "Si demandé, estime u(moyenne) ≈ s / √n.",
      "Conclue sur la précision, pas sur une valeur vraie absolue."
    ],
    forUnderstanding: "La moyenne n'est pas automatiquement la valeur vraie. C'est la meilleure estimation dans un cadre expérimental donné.",
    steps: [
      "Recopier les mesures dans la même unité.",
      "Calculer la moyenne.",
      "Repérer les valeurs très éloignées sans les supprimer automatiquement.",
      "Calculer ou estimer la dispersion.",
      "Écrire le résultat avec une incertitude si la méthode est demandée.",
      "Commenter les causes possibles de dispersion."
    ],
    formulas: [
      { label: "moyenne", detail: "(x₁ + x₂ + ... + xₙ) / n" },
      { label: "écart-type s", detail: "mesure la dispersion de la série" },
      { label: "u(moyenne)", detail: "≈ s / √n pour des mesures indépendantes" }
    ],
    examples: [
      {
        title: "Exemple très simple",
        statement: "Calculer la moyenne des périodes 0,82 s ; 0,84 s ; 0,83 s.",
        steps: [
          "On additionne : 0,82 + 0,84 + 0,83 = 2,49 s.",
          "Il y a 3 mesures.",
          "Moyenne = 2,49 / 3 = 0,83 s."
        ],
        answer: "La période moyenne vaut 0,83 s."
      },
      {
        title: "Exemple un peu plus difficile",
        statement: "Deux séries ont la même moyenne 10,0 mL. La série A varie entre 9,9 et 10,1 mL, la série B entre 9,4 et 10,6 mL. Laquelle est la plus dispersée ?",
        steps: [
          "Les deux séries ont la même valeur centrale.",
          "La série B s'étale sur un intervalle plus large.",
          "Elle présente donc une dispersion plus grande."
        ],
        answer: "La série B est plus dispersée et le protocole semble moins précis."
      }
    ],
    commonMistakes: [
      "Croire que la moyenne est exactement la valeur vraie.",
      "Supprimer une valeur éloignée sans justification.",
      "Confondre écart-type et incertitude-type sur la moyenne.",
      "Oublier l'unité de la moyenne.",
      "Comparer deux séries seulement avec leur moyenne."
    ],
    tip: "La moyenne dit où se situe le centre ; la dispersion dit si les mesures sont serrées autour de ce centre.",
    miniExercise: {
      statement: "Calcule la moyenne de 5,11 g ; 5,08 g ; 5,12 g ; 5,09 g.",
      correction: [
        "Somme = 5,11 + 5,08 + 5,12 + 5,09 = 20,40 g.",
        "Il y a 4 mesures.",
        "Moyenne = 20,40 / 4 = 5,10 g.",
        "La masse moyenne vaut 5,10 g."
      ]
    },
    competencies: ["Réaliser", "Valider", "Exploiter une série de mesures"],
    remember: [
      "Une série de mesures permet d'estimer une valeur centrale.",
      "La dispersion renseigne sur la répétabilité.",
      "Plus de mesures ne supprime pas toutes les sources d'incertitude."
    ]
  },
  {
    slug: "raisonnement-redaction-bac",
    number: 13,
    family: "Problèmes et rédaction scientifique",
    title: "Raisonnement et rédaction type bac",
    shortTitle: "Rédaction bac",
    levels: ["Première", "Terminale", "Bac"],
    description: "Analyser un énoncé long, organiser un raisonnement, rédiger calcul, interprétation et conclusion.",
    objective: "Savoir construire une réponse complète et lisible dans un exercice de spécialité.",
    why: [
      "Au lycée, les exercices demandent souvent de choisir soi-même la méthode.",
      "Une réponse type bac doit montrer le raisonnement, pas seulement le résultat.",
      "La conclusion doit interpréter physiquement le calcul."
    ],
    typicalUses: [
      "Exercice de synthèse en mécanique.",
      "Problème de dosage ou de rendement.",
      "Exploitation d'un document expérimental.",
      "Comparaison entre modèle et mesures.",
      "Question ouverte avec plusieurs étapes."
    ],
    quickMethod: [
      "Écris ce que tu cherches.",
      "Liste les données utiles.",
      "Choisis une relation ou un modèle.",
      "Calcule proprement.",
      "Interprète le résultat.",
      "Réponds à la question avec une phrase claire."
    ],
    forUnderstanding: "Un calcul est une étape. L'interprétation explique ce que ce calcul signifie dans la situation étudiée. La conclusion répond à la question posée.",
    steps: [
      "Lire la question et repérer ce qu'on demande.",
      "Identifier la grandeur cherchée.",
      "Lister les données utiles avec leurs unités.",
      "Faire un schéma, un tableau ou une ligne d'avancement si nécessaire.",
      "Choisir la bonne formule, le bon modèle ou la bonne méthode.",
      "Convertir les unités avant de calculer.",
      "Calculer proprement en gardant les unités.",
      "Répondre par une phrase et vérifier si le résultat est logique."
    ],
    formulas: [
      { label: "calcul", detail: "relation + application numérique + unité" },
      { label: "interprétation", detail: "ce que signifie le résultat" },
      { label: "conclusion", detail: "réponse explicite à la question" }
    ],
    examples: [
      {
        title: "Exemple très simple",
        statement: "Une voiture parcourt 150 m en 10,0 s. Déterminer sa vitesse moyenne et conclure.",
        steps: [
          "On cherche une vitesse moyenne.",
          "Données : d = 150 m ; Δt = 10,0 s.",
          "Relation : v = d / Δt.",
          "v = 150 / 10,0 = 15,0 m·s⁻¹."
        ],
        answer: "La voiture a une vitesse moyenne de 15,0 m·s⁻¹ sur cette portion."
      },
      {
        title: "Exemple un peu plus difficile",
        statement: "Un dosage donne c = 1,25 × 10⁻² mol·L⁻¹ alors que l'étiquette annonce 1,30 × 10⁻² mol·L⁻¹. L'incertitude est 0,08 × 10⁻² mol·L⁻¹. Comment conclure ?",
        steps: [
          "Écart : |1,25 - 1,30| × 10⁻² = 0,05 × 10⁻² mol·L⁻¹.",
          "L'écart est inférieur à l'incertitude 0,08 × 10⁻² mol·L⁻¹.",
          "Les valeurs sont compatibles dans les conditions de mesure."
        ],
        answer: "Le dosage est compatible avec l'indication de l'étiquette."
      }
    ],
    commonMistakes: [
      "Faire une suite de calculs sans phrase.",
      "Utiliser toutes les données même quand certaines sont inutiles.",
      "Conclure sans répondre à la question.",
      "Oublier de discuter le modèle ou les incertitudes.",
      "Confondre calcul, interprétation et conclusion."
    ],
    tip: "Une bonne réponse de bac peut souvent se lire en trois temps : je cherche, je calcule, j'interprète.",
    miniExercise: {
      statement: "Une onde parcourt 340 m en 1,00 s. Rédige une réponse complète pour déterminer sa célérité.",
      correction: [
        "On cherche la célérité v de l'onde.",
        "Données : d = 340 m et Δt = 1,00 s.",
        "Relation : v = d / Δt.",
        "Application : v = 340 / 1,00 = 340 m·s⁻¹.",
        "La célérité de l'onde vaut 340 m·s⁻¹, ce qui est cohérent avec la célérité du son dans l'air."
      ]
    },
    competencies: ["S'approprier", "Analyser", "Réaliser", "Valider", "Communiquer"],
    remember: [
      "La rédaction montre la démarche.",
      "Un résultat doit être interprété.",
      "La conclusion répond directement à la question posée."
    ]
  }
];

export function getLyceeMathMethod(slug: string) {
  return methodesMathsLycee.find((method) => method.slug === slug);
}
