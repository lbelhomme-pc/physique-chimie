export interface MethodExample {
  title: string;
  statement: string;
  steps: string[];
  answer: string;
}

export interface MethodFormula {
  label: string;
  detail: string;
}

export interface MethodMiniExercise {
  statement: string;
  correction: string[];
}

export interface MethodLink {
  title: string;
  href: string;
}

export interface CollegeMathMethod {
  slug: string;
  number: number;
  title: string;
  shortTitle: string;
  description: string;
  objective: string;
  why: string[];
  typicalUses: string[];
  keyIdea: string;
  steps: string[];
  examples: [MethodExample, MethodExample];
  commonMistakes: string[];
  tip: string;
  miniExercise: MethodMiniExercise;
  remember: string[];
  formulas?: MethodFormula[];
  related?: MethodLink[];
  visual?: "conversions" | "graph";
}

export const methodesMathsCollege: CollegeMathMethod[] = [
  {
    slug: "unites-conversions",
    number: 1,
    title: "Unités et conversions",
    shortTitle: "Conversions",
    description: "Convertir des longueurs, masses, volumes, capacités, vitesses et unités composées sans perdre le sens physique.",
    objective: "Savoir changer d'unité tout en gardant la même grandeur physique.",
    why: [
      "Une valeur sans unité n'a presque jamais de sens en physique-chimie.",
      "Une formule donne un résultat correct seulement si les unités sont cohérentes entre elles.",
      "Convertir ne change pas l'objet étudié : 1 L et 1000 mL représentent le même volume."
    ],
    typicalUses: [
      "Passer de mL à L pour calculer une concentration.",
      "Passer de km à m ou de h à s pour calculer une vitesse.",
      "Passer de mA à A avant d'utiliser la relation U = R × I.",
      "Passer de g·mL⁻¹ à kg·m⁻³ pour comparer des masses volumiques.",
      "Écrire correctement une unité composée comme m·s⁻¹, g·L⁻¹ ou N·kg⁻¹."
    ],
    keyIdea: "On convertit la valeur numérique, mais la grandeur mesurée reste la même. Il faut donc toujours se demander : quelle grandeur suis-je en train de manipuler ?",
    steps: [
      "Repérer la grandeur : masse, volume, distance, durée, vitesse, tension...",
      "Écrire l'unité de départ et l'unité demandée.",
      "Trouver le lien entre les deux unités : par exemple 1 L = 1000 mL.",
      "Choisir l'opération : multiplier si on va vers une unité plus petite, diviser si on va vers une unité plus grande.",
      "Faire le calcul en gardant les unités visibles.",
      "Vérifier si le résultat est réaliste : 0,5 L doit être plus petit que 5 L, mais plus grand que 5 mL."
    ],
    formulas: [
      { label: "1 km", detail: "= 1000 m" },
      { label: "1 m", detail: "= 100 cm = 1000 mm" },
      { label: "1 L", detail: "= 1000 mL" },
      { label: "1 h", detail: "= 3600 s" },
      { label: "1 A", detail: "= 1000 mA" },
      { label: "1 g·mL⁻¹", detail: "= 1000 kg·m⁻³" }
    ],
    examples: [
      {
        title: "Exemple très simple",
        statement: "Convertir 2,5 L en mL.",
        steps: [
          "On cherche un volume.",
          "On sait que 1 L = 1000 mL.",
          "On multiplie par 1000 : 2,5 × 1000 = 2500."
        ],
        answer: "2,5 L = 2500 mL."
      },
      {
        title: "Exemple un peu plus difficile",
        statement: "Convertir 72 km·h⁻¹ en m·s⁻¹.",
        steps: [
          "Une vitesse contient une distance et une durée.",
          "On convertit la distance : 72 km = 72 000 m.",
          "On convertit la durée : 1 h = 3600 s.",
          "On calcule : 72 000 / 3600 = 20."
        ],
        answer: "72 km·h⁻¹ = 20 m·s⁻¹."
      }
    ],
    commonMistakes: [
      "Écrire seulement le nombre final sans unité.",
      "Confondre mL et L dans une concentration.",
      "Convertir une vitesse en changeant seulement la distance et pas la durée.",
      "Croire que 1 cm³ et 1 L représentent le même volume : en réalité 1 cm³ = 1 mL.",
      "Oublier que le symbole µ signifie micro, donc un millionième."
    ],
    tip: "Quand l'unité contient un trait ou un point, comme km·h⁻¹ ou g·mL⁻¹, convertis séparément chaque partie de l'unité.",
    miniExercise: {
      statement: "Convertis 350 mL en L, puis 3,6 km en m.",
      correction: [
        "350 mL = 350 / 1000 = 0,350 L.",
        "3,6 km = 3,6 × 1000 = 3600 m.",
        "On garde les unités dans la réponse : 0,350 L et 3600 m."
      ]
    },
    remember: [
      "Une conversion change l'unité, pas la grandeur.",
      "Une valeur doit presque toujours être accompagnée d'une unité.",
      "Pour une unité composée, on convertit chaque partie avec attention."
    ],
    related: [
      { title: "Formulaires collège", href: "/outils-methodes/formulaires-college" }
    ],
    visual: "conversions"
  },
  {
    slug: "formules-calculs",
    number: 2,
    title: "Formules et calculs",
    shortTitle: "Formules",
    description: "Remplacer des valeurs dans une formule, calculer une grandeur et isoler une inconnue simple.",
    objective: "Savoir choisir une relation, remplacer les grandeurs par des valeurs et présenter un calcul scientifique.",
    why: [
      "Une formule est une phrase mathématique qui relie des grandeurs physiques.",
      "Elle ne doit pas être utilisée au hasard : il faut d'abord identifier la grandeur cherchée.",
      "Les unités permettent de vérifier que la formule est utilisée correctement."
    ],
    typicalUses: [
      "Calculer une vitesse avec v = d / t.",
      "Calculer une distance avec d = v × t.",
      "Calculer une durée avec t = d / v.",
      "Utiliser P = m × g pour relier poids et masse.",
      "Utiliser ρ = m / V pour une masse volumique.",
      "Utiliser E = P × t pour une énergie transférée.",
      "Utiliser U = R × I pour une relation électrique simple."
    ],
    keyIdea: "Avant de calculer, il faut écrire la formule littérale. Cela évite de se jeter sur les nombres sans comprendre ce qu'ils représentent.",
    steps: [
      "Lire la question et entourer la grandeur cherchée.",
      "Noter les données utiles avec leurs unités.",
      "Choisir la formule qui contient la grandeur cherchée.",
      "Isoler la grandeur si elle n'est pas déjà seule.",
      "Convertir les unités si nécessaire.",
      "Remplacer les lettres par les valeurs numériques.",
      "Calculer, écrire l'unité et rédiger une phrase de conclusion."
    ],
    formulas: [
      { label: "v = d / t", detail: "v en m·s⁻¹, d en m, t en s" },
      { label: "d = v × t", detail: "distance parcourue" },
      { label: "t = d / v", detail: "durée du parcours" },
      { label: "P = m × g", detail: "P en N, m en kg, g en N·kg⁻¹" },
      { label: "ρ = m / V", detail: "masse volumique" },
      { label: "Cm = m / V", detail: "concentration en masse" },
      { label: "E = P × t", detail: "énergie, puissance, durée" },
      { label: "U = R × I", detail: "U en V, R en Ω, I en A" }
    ],
    examples: [
      {
        title: "Exemple très simple",
        statement: "Un objet parcourt 120 m en 20 s. Calculer sa vitesse.",
        steps: [
          "La grandeur cherchée est la vitesse v.",
          "Données : d = 120 m et t = 20 s.",
          "Formule : v = d / t.",
          "Application : v = 120 / 20 = 6."
        ],
        answer: "L'objet se déplace à la vitesse de 6 m·s⁻¹."
      },
      {
        title: "Exemple un peu plus difficile",
        statement: "Une résistance de 100 Ω est traversée par un courant de 50 mA. Calculer la tension U.",
        steps: [
          "La grandeur cherchée est U.",
          "Formule : U = R × I.",
          "On convertit l'intensité : 50 mA = 0,050 A.",
          "Application : U = 100 × 0,050 = 5,0."
        ],
        answer: "La tension vaut 5,0 V."
      }
    ],
    commonMistakes: [
      "Remplacer les nombres avant d'avoir écrit la formule.",
      "Confondre masse et poids : la masse s'exprime en kg, le poids en N.",
      "Utiliser des mA dans U = R × I sans convertir en A.",
      "Oublier d'isoler la grandeur cherchée.",
      "Écrire une formule correcte mais conclure avec une mauvaise unité."
    ],
    tip: "Si une formule ressemble à a = b × c, alors b = a / c et c = a / b. Tu peux vérifier avec des nombres simples.",
    miniExercise: {
      statement: "Une lampe de puissance 12 W fonctionne pendant 300 s. Calcule l'énergie transférée avec E = P × t.",
      correction: [
        "La grandeur cherchée est l'énergie E.",
        "Données : P = 12 W et t = 300 s.",
        "Formule : E = P × t.",
        "Application : E = 12 × 300 = 3600 J.",
        "La lampe transfère une énergie de 3600 J."
      ]
    },
    remember: [
      "On écrit toujours la formule avant le calcul.",
      "On convertit les unités avant de remplacer dans la formule.",
      "Une réponse scientifique contient une phrase, une valeur et une unité."
    ],
    related: [
      { title: "Formulaires collège", href: "/outils-methodes/formulaires-college" }
    ]
  },
  {
    slug: "proportionnalite",
    number: 3,
    title: "Proportionnalité",
    shortTitle: "Proportionnalité",
    description: "Reconnaître une situation proportionnelle, utiliser un tableau et lire une proportionnalité sur un graphique.",
    objective: "Savoir reconnaître et exploiter une relation où deux grandeurs varient dans le même rapport.",
    why: [
      "La proportionnalité permet de prévoir une valeur sans refaire toute l'expérience.",
      "Elle apparaît souvent quand une grandeur dépend régulièrement d'une autre.",
      "Elle doit être vérifiée : toutes les situations où une grandeur augmente ne sont pas proportionnelles."
    ],
    typicalUses: [
      "Distance parcourue et durée quand la vitesse est constante.",
      "Masse et volume pour une même matière homogène.",
      "Tension et intensité pour un conducteur ohmique.",
      "Masse de soluté et volume de solution pour une même concentration."
    ],
    keyIdea: "Deux grandeurs sont proportionnelles si on passe de l'une à l'autre en multipliant toujours par le même nombre.",
    steps: [
      "Repérer les deux grandeurs comparées.",
      "Vérifier que les valeurs sont dans des unités cohérentes.",
      "Chercher le coefficient multiplicateur entre les deux lignes du tableau.",
      "Utiliser ce coefficient pour compléter la valeur manquante.",
      "Sur un graphique, vérifier si les points sont alignés et si la droite passe par l'origine.",
      "Conclure avec une phrase, pas seulement avec un calcul."
    ],
    formulas: [
      { label: "coefficient", detail: "valeur d'arrivée / valeur de départ" },
      { label: "graphique", detail: "proportionnalité si la droite passe par l'origine" }
    ],
    examples: [
      {
        title: "Exemple très simple",
        statement: "1 L d'eau a une masse de 1 kg. Quelle est la masse de 3 L d'eau ?",
        steps: [
          "On compare volume et masse d'une même matière.",
          "Le volume est multiplié par 3.",
          "La masse est donc multipliée par 3."
        ],
        answer: "3 L d'eau ont une masse de 3 kg."
      },
      {
        title: "Exemple un peu plus difficile",
        statement: "Une solution contient 4 g de sucre dans 200 mL. Quelle masse de sucre contient 500 mL de la même solution ?",
        steps: [
          "On garde la même solution : la concentration est la même.",
          "Coefficient entre les volumes : 500 / 200 = 2,5.",
          "On multiplie la masse par 2,5 : 4 × 2,5 = 10."
        ],
        answer: "500 mL de cette solution contiennent 10 g de sucre."
      }
    ],
    commonMistakes: [
      "Croire que toute courbe qui monte représente une proportionnalité.",
      "Oublier que la droite doit passer par l'origine.",
      "Utiliser un produit en croix sans comprendre les grandeurs.",
      "Comparer des valeurs qui ne sont pas dans la même unité."
    ],
    tip: "Test rapide : si la première grandeur double, l'autre doit doubler aussi. Sinon, ce n'est pas une proportionnalité.",
    miniExercise: {
      statement: "À vitesse constante, un élève parcourt 8 m en 4 s. Quelle distance parcourt-il en 10 s ?",
      correction: [
        "On calcule d'abord la distance parcourue en 1 s : 8 / 4 = 2 m.",
        "En 10 s, il parcourt 2 × 10 = 20 m.",
        "La distance parcourue est donc 20 m."
      ]
    },
    remember: [
      "Une proportionnalité garde toujours le même coefficient multiplicateur.",
      "Sur un graphique, la droite doit passer par l'origine.",
      "La proportionnalité doit être justifiée, pas seulement supposée."
    ]
  },
  {
    slug: "graphiques",
    number: 4,
    title: "Graphiques",
    shortTitle: "Graphiques",
    description: "Lire, exploiter et tracer un graphique avec des axes, des unités et une échelle adaptée.",
    objective: "Savoir transformer un tableau de mesures en graphique lisible, puis interpréter ce graphique.",
    why: [
      "Un graphique rend visibles les variations d'une grandeur.",
      "Il permet de repérer une relation : augmentation, diminution, plateau, proportionnalité.",
      "Il oblige à préciser quelles grandeurs sont étudiées et dans quelles unités."
    ],
    typicalUses: [
      "Tracer une distance en fonction du temps.",
      "Exploiter une tension en fonction d'une intensité.",
      "Suivre une température au cours du temps.",
      "Comparer des mesures de niveau sonore à différentes distances."
    ],
    keyIdea: "Un graphique scientifique n'est pas un dessin décoratif : il doit permettre de lire des valeurs et de répondre à une question.",
    steps: [
      "Lire ou écrire le titre du graphique.",
      "Identifier la grandeur placée sur l'axe horizontal et son unité.",
      "Identifier la grandeur placée sur l'axe vertical et son unité.",
      "Choisir une échelle régulière qui utilise bien la place disponible.",
      "Placer les points avec soin à partir du tableau de valeurs.",
      "Ne relier les points que si la situation le justifie.",
      "Interpréter la forme du graphique avec une phrase."
    ],
    formulas: [
      { label: "axe horizontal", detail: "souvent la grandeur que l'on choisit ou le temps" },
      { label: "axe vertical", detail: "souvent la grandeur mesurée ou calculée" },
      { label: "échelle", detail: "graduations régulières et lisibles" }
    ],
    examples: [
      {
        title: "Exemple très simple",
        statement: "Sur un graphique d = f(t), que représente l'axe horizontal ?",
        steps: [
          "L'écriture d = f(t) se lit : distance en fonction du temps.",
          "La grandeur entre parenthèses est généralement placée sur l'axe horizontal."
        ],
        answer: "L'axe horizontal représente le temps t, avec son unité, par exemple la seconde."
      },
      {
        title: "Exemple un peu plus difficile",
        statement: "Une droite d = f(t) passe par l'origine. Que peut-on dire si le mouvement se fait à vitesse constante ?",
        steps: [
          "Les points alignés montrent une relation régulière.",
          "La droite passe par l'origine : distance et temps sont proportionnels.",
          "La distance augmente de la même façon pour des durées égales."
        ],
        answer: "Le mouvement peut être décrit comme uniforme dans cette situation."
      }
    ],
    commonMistakes: [
      "Oublier le nom des grandeurs sur les axes.",
      "Oublier les unités.",
      "Choisir une échelle irrégulière.",
      "Placer les points à vue d'oeil sans lire les graduations.",
      "Relier automatiquement les points alors qu'un nuage de points est demandé."
    ],
    tip: "Avant de placer un point, lis une graduation complète sur chaque axe : cela évite beaucoup d'erreurs.",
    miniExercise: {
      statement: "Sur un graphique, l'axe vertical indique U (V) et l'axe horizontal indique I (A). Quelle grandeur lit-on pour I = 0,20 A ?",
      correction: [
        "On repère 0,20 A sur l'axe horizontal.",
        "On monte jusqu'au point ou jusqu'à la courbe.",
        "On lit ensuite la tension U correspondante sur l'axe vertical.",
        "La grandeur lue est donc une tension en volt."
      ]
    },
    remember: [
      "Un graphique doit avoir un titre, des axes nommés et des unités.",
      "L'échelle doit être régulière.",
      "Interpréter un graphique, c'est expliquer ce que la forme signifie physiquement."
    ],
    visual: "graph"
  },
  {
    slug: "puissances-10",
    number: 5,
    title: "Puissances de 10 et écriture scientifique",
    shortTitle: "Puissances de 10",
    description: "Utiliser les puissances de 10 pour écrire les grands et petits nombres sans erreurs de zéros.",
    objective: "Savoir écrire un nombre en écriture scientifique et utiliser les puissances de 10 dans les conversions.",
    why: [
      "La physique-chimie utilise des nombres très grands, comme les distances astronomiques.",
      "Elle utilise aussi des nombres très petits, comme des tailles microscopiques.",
      "L'écriture scientifique permet de lire ces nombres sans compter tous les zéros."
    ],
    typicalUses: [
      "Écrire la vitesse de la lumière : 3,00 × 10⁸ m·s⁻¹.",
      "Écrire une distance Terre-Lune : environ 3,84 × 10⁸ m.",
      "Écrire une petite longueur en mètre.",
      "Comparer des ordres de grandeur.",
      "Convertir avec milli, micro, kilo ou méga."
    ],
    keyIdea: "Une écriture scientifique a la forme a × 10ⁿ, avec un nombre a compris entre 1 et 10, 10 exclu.",
    steps: [
      "Repérer si le nombre est très grand ou très petit.",
      "Déplacer la virgule pour obtenir un nombre entre 1 et 10.",
      "Compter le nombre de déplacements de la virgule.",
      "Mettre un exposant positif pour un grand nombre.",
      "Mettre un exposant négatif pour un petit nombre.",
      "Vérifier que le résultat a le même ordre de grandeur que le nombre de départ."
    ],
    formulas: [
      { label: "10³", detail: "= 1000" },
      { label: "10⁻³", detail: "= 0,001" },
      { label: "10⁶", detail: "= 1 000 000" },
      { label: "10⁻⁶", detail: "= 0,000001" }
    ],
    examples: [
      {
        title: "Exemple très simple",
        statement: "Écrire 5000 en écriture scientifique.",
        steps: [
          "On déplace la virgule pour obtenir 5,0.",
          "On a déplacé la virgule de 3 rangs vers la gauche.",
          "On utilise donc 10³."
        ],
        answer: "5000 = 5,0 × 10³."
      },
      {
        title: "Exemple un peu plus difficile",
        statement: "Écrire 0,0042 m en écriture scientifique.",
        steps: [
          "On déplace la virgule pour obtenir 4,2.",
          "On a déplacé la virgule de 3 rangs vers la droite.",
          "Comme le nombre de départ est petit, l'exposant est négatif."
        ],
        answer: "0,0042 m = 4,2 × 10⁻³ m."
      }
    ],
    commonMistakes: [
      "Écrire 42 × 10⁻⁴ : ce n'est pas une écriture scientifique, car 42 est plus grand que 10.",
      "Inverser le signe de l'exposant.",
      "Perdre un zéro lors d'une conversion.",
      "Croire que 10⁻³ est négatif : il est positif, mais très petit."
    ],
    tip: "Exposant positif : le nombre devient plus grand. Exposant négatif : le nombre devient plus petit.",
    miniExercise: {
      statement: "Écris 0,00065 m en écriture scientifique.",
      correction: [
        "On cherche un nombre entre 1 et 10 : 6,5.",
        "Il faut déplacer la virgule de 4 rangs.",
        "Le nombre de départ est petit, donc l'exposant est négatif.",
        "0,00065 m = 6,5 × 10⁻⁴ m."
      ]
    },
    remember: [
      "L'écriture scientifique s'écrit a × 10ⁿ avec 1 ≤ a < 10.",
      "Les puissances de 10 évitent les erreurs de zéros.",
      "Il faut toujours vérifier si l'ordre de grandeur est cohérent."
    ]
  },
  {
    slug: "problemes-redaction",
    number: 6,
    title: "Problèmes et rédaction scientifique",
    shortTitle: "Rédaction",
    description: "Calculer une moyenne, arrondir, estimer un ordre de grandeur et présenter une réponse scientifique.",
    objective: "Savoir transformer un raisonnement en réponse claire, avec valeur, unité et phrase de conclusion.",
    why: [
      "Un calcul juste peut perdre du sens s'il n'est pas expliqué.",
      "La rédaction montre quelle grandeur est cherchée et quelle méthode est utilisée.",
      "La vérification permet d'éviter les résultats absurdes."
    ],
    typicalUses: [
      "Calculer la moyenne de plusieurs mesures.",
      "Arrondir un résultat avec un nombre raisonnable de chiffres.",
      "Vérifier la cohérence d'une unité.",
      "Résoudre une situation en plusieurs étapes.",
      "Faire une estimation d'ordre de grandeur."
    ],
    keyIdea: "Une réponse de physique-chimie n'est pas seulement un nombre : c'est une conclusion qui répond à la question.",
    steps: [
      "Lire la question et reformuler ce que l'on cherche.",
      "Lister les données utiles avec leurs unités.",
      "Choisir une formule ou une méthode.",
      "Écrire le calcul proprement.",
      "Arrondir raisonnablement : au collège, deux ou trois chiffres significatifs suffisent souvent.",
      "Écrire une phrase de conclusion.",
      "Vérifier l'ordre de grandeur et l'unité."
    ],
    formulas: [
      { label: "moyenne", detail: "somme des valeurs / nombre de valeurs" },
      { label: "ordre de grandeur", detail: "valeur approximative qui permet de vérifier la cohérence" }
    ],
    examples: [
      {
        title: "Exemple très simple",
        statement: "Calculer la moyenne de 18 °C, 19 °C et 20 °C.",
        steps: [
          "On additionne les valeurs : 18 + 19 + 20 = 57.",
          "Il y a 3 valeurs.",
          "On divise : 57 / 3 = 19."
        ],
        answer: "La température moyenne vaut 19 °C."
      },
      {
        title: "Exemple un peu plus difficile",
        statement: "Une masse de 54 g occupe un volume de 20 mL. Calculer la masse volumique.",
        steps: [
          "La grandeur cherchée est la masse volumique ρ.",
          "Données : m = 54 g et V = 20 mL.",
          "Formule : ρ = m / V.",
          "Application : ρ = 54 / 20 = 2,7."
        ],
        answer: "La masse volumique vaut 2,7 g·mL⁻¹. Cette valeur est plus grande que celle de l'eau, donc le résultat est plausible pour un matériau dense."
      }
    ],
    commonMistakes: [
      "Donner seulement un nombre sans phrase.",
      "Garder trop de chiffres, par exemple 2,666666 g·mL⁻¹.",
      "Arrondir au début du calcul au lieu d'arrondir à la fin.",
      "Oublier l'unité dans la phrase de conclusion.",
      "Ne pas se demander si le résultat est réaliste."
    ],
    tip: "Après le calcul, relis la question : ta phrase finale doit y répondre directement.",
    miniExercise: {
      statement: "Un élève mesure trois durées : 12,1 s ; 12,3 s ; 12,2 s. Calcule la durée moyenne.",
      correction: [
        "On additionne les trois durées : 12,1 + 12,3 + 12,2 = 36,6 s.",
        "Il y a 3 mesures.",
        "Moyenne = 36,6 / 3 = 12,2 s.",
        "La durée moyenne vaut 12,2 s."
      ]
    },
    remember: [
      "Une réponse scientifique contient une phrase, une valeur et une unité.",
      "On arrondit raisonnablement à la fin du calcul.",
      "La vérification de cohérence fait partie de la méthode."
    ]
  },
  {
    slug: "methode-generale",
    number: 7,
    title: "Méthode générale pour résoudre un exercice",
    shortTitle: "Méthode générale",
    description: "Une démarche universelle en 6 étapes pour aborder un exercice de physique-chimie.",
    objective: "Savoir organiser sa réponse quand un exercice mélange lecture, données, formule, calcul et conclusion.",
    why: [
      "Beaucoup d'erreurs viennent du départ : on calcule avant d'avoir compris la question.",
      "Une méthode fixe rassure et évite d'oublier les unités.",
      "Elle fonctionne pour la mécanique, l'électricité, la chimie, les signaux et les mesures."
    ],
    typicalUses: [
      "Exercice de calcul de vitesse.",
      "Exercice avec masse volumique.",
      "Exercice d'électricité avec tension et intensité.",
      "Exercice de lecture graphique.",
      "Tâche courte avec plusieurs étapes."
    ],
    keyIdea: "On avance dans l'ordre : question, grandeur cherchée, données, méthode, calcul, conclusion.",
    steps: [
      "Je lis la question.",
      "Je repère la grandeur cherchée.",
      "Je note les données utiles.",
      "Je choisis la bonne formule ou la bonne méthode.",
      "Je calcule en écrivant les unités.",
      "Je réponds avec une phrase et je vérifie si le résultat est logique."
    ],
    examples: [
      {
        title: "Exemple très simple",
        statement: "Un objet parcourt 30 m en 5 s. Calculer sa vitesse.",
        steps: [
          "Question : on cherche une vitesse.",
          "Données : d = 30 m et t = 5 s.",
          "Formule : v = d / t.",
          "Calcul : v = 30 / 5 = 6 m·s⁻¹."
        ],
        answer: "La vitesse de l'objet est 6 m·s⁻¹."
      },
      {
        title: "Exemple un peu plus difficile",
        statement: "Une solution contient 12 g de sel dans 0,50 L. Calculer sa concentration en masse.",
        steps: [
          "Question : on cherche une concentration en masse Cm.",
          "Données : m = 12 g et V = 0,50 L.",
          "Formule : Cm = m / V.",
          "Calcul : Cm = 12 / 0,50 = 24 g·L⁻¹."
        ],
        answer: "La concentration en masse de la solution est 24 g·L⁻¹."
      }
    ],
    commonMistakes: [
      "Commencer par faire une opération avec tous les nombres de l'énoncé.",
      "Ne pas identifier la grandeur cherchée.",
      "Oublier une conversion.",
      "Écrire le calcul sans expliquer la formule utilisée.",
      "Ne pas vérifier si la réponse répond vraiment à la question."
    ],
    tip: "Si tu bloques, écris d'abord : « Je cherche ... ». Souvent, la bonne formule devient plus facile à choisir.",
    miniExercise: {
      statement: "Un appareil de puissance 40 W fonctionne pendant 60 s. Utilise la méthode générale pour calculer l'énergie transférée.",
      correction: [
        "Je cherche une énergie E.",
        "Données : P = 40 W et t = 60 s.",
        "Formule : E = P × t.",
        "Calcul : E = 40 × 60 = 2400 J.",
        "L'énergie transférée vaut 2400 J. Le résultat est cohérent : l'appareil fonctionne pendant une durée courte, donc l'énergie reste de l'ordre du millier de joules."
      ]
    },
    remember: [
      "La méthode générale évite les calculs au hasard.",
      "Les unités doivent accompagner les données et le résultat.",
      "La phrase finale doit répondre exactement à la question."
    ],
    related: [
      { title: "Formulaires collège", href: "/outils-methodes/formulaires-college" }
    ]
  }
];

export function getCollegeMathMethod(slug: string) {
  return methodesMathsCollege.find((method) => method.slug === slug);
}
