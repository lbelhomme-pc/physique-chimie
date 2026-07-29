export type LeaneCourse = {
  title: string;
  focus: string;
  points: string[];
  example: string;
  trap: string;
};

export type LeaneExercise = {
  title: string;
  level: string;
  prompt: string;
  hint: string;
  answer: string;
};

export type LeaneLevel = {
  id: "5e" | "4e" | "3e";
  title: string;
  subtitle: string;
  objective: string;
  accent: string;
  courses: LeaneCourse[];
  exercises: LeaneExercise[];
};

export type LeaneQuizQuestion = {
  question: string;
  choices: string[];
  answer: number;
};

export type LeaneFlashcard = {
  front: string;
  back: string;
  tag: string;
};

export type LeaneCoursePractice = {
  exercise: LeaneExercise;
  quiz: LeaneQuizQuestion;
  flashcard: LeaneFlashcard;
};

export type LeaneCoursePracticeEntry = {
  level: LeaneLevel;
  course: LeaneCourse;
  practice: LeaneCoursePractice;
  exercises: LeaneExercise[];
};

export const leaneLevels: LeaneLevel[] = [
  {
    id: "5e",
    title: "Bases 5ème",
    subtitle: "Reprendre les automatismes sans stress",
    objective: "Poser un calcul propre, respecter les priorités et manipuler une expression simple.",
    accent: "#1f6feb",
    courses: [
      {
        title: "Enchaînements d'opérations",
        focus: "Une ligne = une seule transformation.",
        points: [
          "Parenthèses d'abord, en commençant par les plus intérieures.",
          "Multiplications et divisions avant additions et soustractions.",
          "À priorité égale, on avance de gauche à droite.",
        ],
        example: "50 - [3 x (9 - 5)] = 50 - [3 x 4] = 50 - 12 = 38",
        trap: "36 / 6 x 4 se calcule de gauche à droite : 6 x 4 = 24.",
      },
      {
        title: "Calcul littéral de départ",
        focus: "Remplacer une lettre par un nombre et réduire les termes de même nature.",
        points: [
          "7 x x s'écrit 7x ; 1 x a s'écrit a ; -1 x b s'écrit -b.",
          "Avec une valeur négative, on garde les parenthèses : (-4)^2 = 16.",
          "On additionne seulement les termes comparables : x avec x, x^2 avec x^2.",
        ],
        example: "Pour x = -3, 2x - 7 = 2 x (-3) - 7 = -13",
        trap: "7x + 3 ne devient jamais 10x : 3 n'est pas un terme en x.",
      },
      {
        title: "Statistiques essentielles",
        focus: "Effectif, fréquence, moyenne : trois mots à stabiliser.",
        points: [
          "L'effectif total est le nombre de données.",
          "Une fréquence se calcule avec effectif de la valeur / effectif total.",
          "La moyenne simple est la somme des valeurs divisée par le nombre de valeurs.",
        ],
        example: "12 ; 15 ; 9 ; 14 ; 10 donne une moyenne de 60 / 5 = 12",
        trap: "Une moyenne reste entre la plus petite et la plus grande valeur.",
      },
    ],
    exercises: [
      {
        title: "Priorités",
        level: "Niveau 1",
        prompt: "Calcule A = 8 + 6 x 5 puis B = 72 / 8 x 3 - 4.",
        hint: "Commence par la multiplication ou la division, puis avance de gauche à droite.",
        answer: "A = 38. B = 9 x 3 - 4 = 27 - 4 = 23.",
      },
      {
        title: "Parenthèses",
        level: "Niveau 2",
        prompt: "Calcule C = 16 - [4 x (8 - 5)].",
        hint: "La parenthèse la plus intérieure se traite en premier.",
        answer: "C = 16 - [4 x 3] = 16 - 12 = 4.",
      },
      {
        title: "Substitution",
        level: "Niveau 2",
        prompt: "Calcule D = x^2 + 3x pour x = -4.",
        hint: "Écris D = (-4)^2 + 3 x (-4).",
        answer: "D = 16 - 12 = 4.",
      },
    ],
  },
  {
    id: "4e",
    title: "Bases 4ème",
    subtitle: "Solidifier fractions, puissances et équations",
    objective: "Gagner en sécurité sur les calculs qui reviennent constamment au lycée.",
    accent: "#15a887",
    courses: [
      {
        title: "Fractions",
        focus: "Additionner demande un dénominateur commun ; multiplier demande de simplifier avant.",
        points: [
          "Pour additionner : on met au même dénominateur.",
          "Pour multiplier : on multiplie les numérateurs et les dénominateurs.",
          "Pour diviser : on multiplie par l'inverse.",
        ],
        example: "3/4 - 5/6 = 9/12 - 10/12 = -1/12",
        trap: "On n'additionne pas les dénominateurs : 1/3 + 1/3 = 2/3.",
      },
      {
        title: "Puissances",
        focus: "Les puissances servent à écrire vite de grands ou petits nombres.",
        points: [
          "a^0 = 1 si a n'est pas nul.",
          "a^-n = 1 / a^n.",
          "Une notation scientifique s'écrit a x 10^n avec 1 <= |a| < 10.",
        ],
        example: "0,00056 = 5,6 x 10^-4",
        trap: "(-5)^2 = 25, mais -5^2 = -25.",
      },
      {
        title: "Équations",
        focus: "Le but est d'isoler x en gardant l'égalité vraie.",
        points: [
          "On peut ajouter, soustraire, multiplier ou diviser les deux membres par le même nombre non nul.",
          "On regroupe les x d'un côté et les nombres de l'autre.",
          "On vérifie rapidement dans l'équation de départ.",
        ],
        example: "5x - 7 = 2x + 8 donne 3x = 15 donc x = 5",
        trap: "Si on deplace un terme, on change son signe.",
      },
    ],
    exercises: [
      {
        title: "Fraction",
        level: "Niveau 1",
        prompt: "Calcule et simplifie : 7/9 / (-14/27).",
        hint: "Diviser par une fraction revient a multiplier par son inverse.",
        answer: "7/9 x 27/(-14) = 7 x 3 / (-14) = 21 / -14 = -3/2.",
      },
      {
        title: "Puissance",
        level: "Niveau 2",
        prompt: "Écris 0,0042 en notation scientifique.",
        hint: "Le nombre devant 10 doit être compris entre 1 et 10.",
        answer: "0,0042 = 4,2 x 10^-3.",
      },
      {
        title: "Équation",
        level: "Niveau 2",
        prompt: "Résous 4 - 3x = x + 12.",
        hint: "Regroupe les x à droite ou à gauche, puis les nombres de l'autre côté.",
        answer: "-4x = 8 donc x = -2.",
      },
    ],
  },
  {
    id: "3e",
    title: "Bases 3ème",
    subtitle: "Préparer l'entrée au lycée",
    objective: "Relier calcul littéral, factorisation, fonctions et probabilités avant la première.",
    accent: "#7c5cff",
    courses: [
      {
        title: "Développer et factoriser",
        focus: "Développer enlève les parenthèses ; factoriser remet sous forme de produit.",
        points: [
          "Distributivité simple : k(a + b) = ka + kb.",
          "Double distributivité : chaque terme multiplie chaque terme.",
          "Identité utile : a^2 - b^2 = (a - b)(a + b).",
        ],
        example: "(2x - 1)(x + 4) = 2x^2 + 8x - x - 4 = 2x^2 + 7x - 4",
        trap: "Un signe moins devant une parenthèse change tous les signes.",
      },
      {
        title: "Équations-produits",
        focus: "Un produit est nul si au moins un de ses facteurs est nul.",
        points: [
          "On factorise si l'expression n'est pas déjà un produit.",
          "On résout chaque facteur égal à 0.",
          "On donne toutes les solutions.",
        ],
        example: "(2x - 6)(x + 5) = 0 donne x = 3 ou x = -5",
        trap: "On ne divise pas par une expression qui peut valoir 0.",
      },
      {
        title: "Fonctions",
        focus: "Une fonction transforme une valeur de départ en image.",
        points: [
          "f(2) se lit l'image de 2 par f.",
          "Un antécédent de 5 est une valeur x telle que f(x) = 5.",
          "Une fonction affine s'ecrit f(x) = ax + b.",
        ],
        example: "Si f(x) = -2x + 7, alors f(3) = 1",
        trap: "f(x) n'est pas f multiplie par x : c'est une notation.",
      },
    ],
    exercises: [
      {
        title: "Développement",
        level: "Niveau 2",
        prompt: "Développe et réduis : (x - 3)(2x + 5).",
        hint: "Chaque terme de la première parenthèse multiplie chaque terme de la seconde.",
        answer: "2x^2 + 5x - 6x - 15 = 2x^2 - x - 15.",
      },
      {
        title: "Produit nul",
        level: "Niveau 2",
        prompt: "Résous (3x + 9)(x - 4) = 0.",
        hint: "Chaque facteur peut être égal à 0.",
        answer: "3x + 9 = 0 donne x = -3 ; x - 4 = 0 donne x = 4.",
      },
      {
        title: "Fonction affine",
        level: "Niveau 3",
        prompt: "Pour f(x) = 2x - 5, calcule f(-3) puis cherche x tel que f(x) = 9.",
        hint: "Remplace x par -3, puis résous 2x - 5 = 9.",
        answer: "f(-3) = -11. 2x - 5 = 9 donne x = 7.",
      },
    ],
  },
];

export const leaneCoursePractices: Record<string, LeaneCoursePractice> = {
  "5e:Enchaînements d'opérations": {
    exercise: {
      title: "Priorités en deux lignes",
      level: "Application",
      prompt: "Calcule A = 18 - 4 x (7 - 2), en écrivant une seule transformation par ligne.",
      hint: "Commence par la parenthèse, puis la multiplication.",
      answer: "A = 18 - 4 x 5 = 18 - 20 = -2.",
    },
    quiz: {
      question: "Dans 18 - 4 x (7 - 2), quelle étape vient en premier ?",
      choices: ["7 - 2", "4 x 7", "18 - 4"],
      answer: 0,
    },
    flashcard: {
      tag: "Priorités",
      front: "Quelle est la règle d'or pour les enchaînements d'opérations ?",
      back: "Parenthèses d'abord, puis multiplications/divisions, puis additions/soustractions.",
    },
  },
  "5e:Calcul littéral de départ": {
    exercise: {
      title: "Remplacer x",
      level: "Application",
      prompt: "Calcule E = 4x - 9 pour x = -2.",
      hint: "Écris 4 x (-2) - 9.",
      answer: "E = 4 x (-2) - 9 = -8 - 9 = -17.",
    },
    quiz: {
      question: "Que vaut 3x + 5 pour x = -4 ?",
      choices: ["-7", "17", "-17"],
      answer: 0,
    },
    flashcard: {
      tag: "Calcul littéral",
      front: "Pourquoi mettre des parentheses quand x est negatif ?",
      back: "Pour garder le signe du nombre et éviter les erreurs de priorité ou de puissance.",
    },
  },
  "5e:Statistiques essentielles": {
    exercise: {
      title: "Moyenne simple",
      level: "Application",
      prompt: "Calcule la moyenne de 8 ; 11 ; 14 ; 7.",
      hint: "Additionne les quatre valeurs, puis divise par 4.",
      answer: "(8 + 11 + 14 + 7) / 4 = 40 / 4 = 10.",
    },
    quiz: {
      question: "Une moyenne de notes doit toujours être...",
      choices: ["entre la plus petite et la plus grande note", "plus grande que toutes les notes", "egale a l'effectif total"],
      answer: 0,
    },
    flashcard: {
      tag: "Statistiques",
      front: "Comment calcule-t-on une moyenne simple ?",
      back: "On additionne les valeurs, puis on divise par le nombre de valeurs.",
    },
  },
  "4e:Fractions": {
    exercise: {
      title: "Fraction et inverse",
      level: "Application",
      prompt: "Calcule et simplifie : 5/6 / 10/9.",
      hint: "Multiplier par l'inverse de 10/9.",
      answer: "5/6 x 9/10 = 45/60 = 3/4.",
    },
    quiz: {
      question: "Pour diviser par 2/7, on multiplie par...",
      choices: ["7/2", "2/7", "2 x 7"],
      answer: 0,
    },
    flashcard: {
      tag: "Fractions",
      front: "Quelle est la méthode pour additionner deux fractions ?",
      back: "Les mettre au même dénominateur, puis additionner les numérateurs.",
    },
  },
  "4e:Puissances": {
    exercise: {
      title: "Notation scientifique",
      level: "Application",
      prompt: "Écris 0,000073 en notation scientifique.",
      hint: "Le nombre devant 10 doit être entre 1 et 10.",
      answer: "0,000073 = 7,3 x 10^-5.",
    },
    quiz: {
      question: "Que vaut 10^-3 ?",
      choices: ["0,001", "1000", "-30"],
      answer: 0,
    },
    flashcard: {
      tag: "Puissances",
      front: "Que signifie un exposant négatif ?",
      back: "Il indique l'inverse : a^-n = 1 / a^n, avec a non nul.",
    },
  },
  "4e:Équations": {
    exercise: {
      title: "Isoler x",
      level: "Application",
      prompt: "Résous 6x - 5 = 2x + 11.",
      hint: "Regroupe les x d'un côté et les nombres de l'autre.",
      answer: "4x = 16 donc x = 4.",
    },
    quiz: {
      question: "Dans une équation, on peut garder l'égalité vraie si...",
      choices: ["on fait la même opération des deux côtés", "on change seulement le membre de gauche", "on supprime les signes moins"],
      answer: 0,
    },
    flashcard: {
      tag: "Equations",
      front: "Quelle est la vérification rapide après une équation ?",
      back: "Remplacer x par la valeur trouvée dans l'équation de départ.",
    },
  },
  "3e:Développer et factoriser": {
    exercise: {
      title: "Double distributivité",
      level: "Application",
      prompt: "Développe et réduis : (x + 6)(2x - 3).",
      hint: "Multiplie chaque terme de la première parenthèse par chaque terme de la seconde.",
      answer: "2x^2 - 3x + 12x - 18 = 2x^2 + 9x - 18.",
    },
    quiz: {
      question: "Factoriser, c'est...",
      choices: ["ecrire sous forme de produit", "supprimer tous les x", "calculer une moyenne"],
      answer: 0,
    },
    flashcard: {
      tag: "Factoriser",
      front: "Quelle différence entre développer et factoriser ?",
      back: "Développer transforme un produit en somme ; factoriser transforme une somme en produit.",
    },
  },
  "3e:Équations-produits": {
    exercise: {
      title: "Produit nul",
      level: "Application",
      prompt: "Résous (x - 8)(3x + 6) = 0.",
      hint: "Un produit est nul si l'un des facteurs est nul.",
      answer: "x - 8 = 0 donne x = 8 ; 3x + 6 = 0 donne x = -2.",
    },
    quiz: {
      question: "La règle du produit nul s'applique quand le second membre vaut...",
      choices: ["0", "1", "-1"],
      answer: 0,
    },
    flashcard: {
      tag: "Produit nul",
      front: "Si A x B = 0, que peut-on conclure ?",
      back: "A = 0 ou B = 0.",
    },
  },
  "3e:Fonctions": {
    exercise: {
      title: "Image et antécédent",
      level: "Application",
      prompt: "Pour f(x) = -3x + 2, calcule f(5), puis cherche x tel que f(x) = 11.",
      hint: "Remplace x par 5, puis résous -3x + 2 = 11.",
      answer: "f(5) = -15 + 2 = -13. -3x + 2 = 11 donne -3x = 9 donc x = -3.",
    },
    quiz: {
      question: "Si f(2) = 7, alors 7 est...",
      choices: ["l'image de 2", "un antécédent de 2", "le nom de la fonction"],
      answer: 0,
    },
    flashcard: {
      tag: "Fonctions",
      front: "Quelle est la différence entre image et antécédent ?",
      back: "L'antécédent est la valeur de départ ; l'image est le résultat donné par la fonction.",
    },
  },
};

export const leaneCourseExerciseSeries: Record<string, LeaneExercise[]> = {
  "5e:Enchaînements d'opérations": [
    { title: "Priorités simples", level: "1", prompt: "Calcule : 6 + 4 x 3.", hint: "La multiplication passe avant l'addition.", answer: "6 + 4 x 3 = 6 + 12 = 18." },
    { title: "Gauche à droite", level: "1", prompt: "Calcule : 48 / 6 x 2.", hint: "Division et multiplication ont la même priorité.", answer: "48 / 6 x 2 = 8 x 2 = 16." },
    { title: "Parenthèses", level: "1", prompt: "Calcule : 5 x (9 - 4).", hint: "Commence dans la parenthèse.", answer: "5 x (9 - 4) = 5 x 5 = 25." },
    { title: "Deux étapes", level: "2", prompt: "Calcule : 30 - 2 x (7 + 3).", hint: "Parenthèse, multiplication, soustraction.", answer: "30 - 2 x 10 = 30 - 20 = 10." },
    { title: "Crochets", level: "2", prompt: "Calcule : 4 + [18 - 3 x 5].", hint: "Dans le crochet, fais la multiplication avant la soustraction.", answer: "4 + [18 - 15] = 4 + 3 = 7." },
    { title: "Expression négative", level: "2", prompt: "Calcule : 12 - 5 x 4.", hint: "La multiplication se fait avant.", answer: "12 - 20 = -8." },
    { title: "Priorités mélangées", level: "2", prompt: "Calcule : 2 x 9 + 36 / 6.", hint: "Traite les deux opérations prioritaires.", answer: "18 + 6 = 24." },
    { title: "Double parenthèse", level: "3", prompt: "Calcule : 50 - [3 x (8 - 2) + 4].", hint: "Commence par 8 - 2.", answer: "50 - [3 x 6 + 4] = 50 - [18 + 4] = 28." },
    { title: "Une ligne à la fois", level: "3", prompt: "Calcule : 7 x (12 - 8) - 18 / 3.", hint: "Parenthèse, puis multiplication et division.", answer: "7 x 4 - 6 = 28 - 6 = 22." },
    { title: "Bilan priorités", level: "3", prompt: "Calcule : 64 / [2 x (9 - 5)].", hint: "Calcule d'abord le dénominateur.", answer: "64 / [2 x 4] = 64 / 8 = 8." },
  ],
  "5e:Calcul littéral de départ": [
    { title: "Remplacer x", level: "1", prompt: "Calcule 3x + 4 pour x = 5.", hint: "Remplace x par 5.", answer: "3 x 5 + 4 = 15 + 4 = 19." },
    { title: "Nombre négatif", level: "1", prompt: "Calcule 2x - 7 pour x = -3.", hint: "Écris 2 x (-3) - 7.", answer: "-6 - 7 = -13." },
    { title: "Carré", level: "1", prompt: "Calcule x^2 + 1 pour x = -4.", hint: "Garde les parenthèses autour de -4.", answer: "(-4)^2 + 1 = 16 + 1 = 17." },
    { title: "Réduire", level: "2", prompt: "Réduis : 4x + 7x.", hint: "Ce sont deux termes en x.", answer: "4x + 7x = 11x." },
    { title: "Termes différents", level: "2", prompt: "Réduis : 5x + 3 - 2x + 8.", hint: "Regroupe les x puis les nombres.", answer: "5x - 2x + 3 + 8 = 3x + 11." },
    { title: "Attention au signe", level: "2", prompt: "Réduis : 9a - 4a - 6.", hint: "9a - 4a donne 5a.", answer: "5a - 6." },
    { title: "Substitution longue", level: "2", prompt: "Calcule 5x - 2x^2 pour x = -2.", hint: "Commence par x^2.", answer: "5 x (-2) - 2 x 4 = -10 - 8 = -18." },
    { title: "Expression simple", level: "3", prompt: "Réduis puis calcule 6x + 2 - x pour x = 4.", hint: "Réduis avant de remplacer.", answer: "6x - x + 2 = 5x + 2, donc 22." },
    { title: "Parenthèse négative", level: "3", prompt: "Calcule 3(x + 2) pour x = -5.", hint: "Remplace d'abord dans la parenthèse.", answer: "3 x (-5 + 2) = 3 x (-3) = -9." },
    { title: "Bilan littéral", level: "3", prompt: "Calcule x^2 - 4x + 1 pour x = -3.", hint: "Garde les parenthèses pour -3.", answer: "9 - 4 x (-3) + 1 = 9 + 12 + 1 = 22." },
  ],
  "5e:Statistiques essentielles": [
    { title: "Effectif total", level: "1", prompt: "Dans la série 4 ; 7 ; 7 ; 9 ; 10, quel est l'effectif total ?", hint: "Compte les valeurs.", answer: "Il y a 5 valeurs, donc l'effectif total est 5." },
    { title: "Moyenne simple", level: "1", prompt: "Calcule la moyenne de 8 ; 10 ; 12.", hint: "Additionne puis divise par 3.", answer: "(8 + 10 + 12) / 3 = 30 / 3 = 10." },
    { title: "Étendue", level: "1", prompt: "Calcule l'étendue de 3 ; 5 ; 11 ; 14.", hint: "Plus grande valeur moins plus petite valeur.", answer: "14 - 3 = 11." },
    { title: "Fréquence", level: "2", prompt: "Dans 20 élèves, 5 portent des lunettes. Quelle est la fréquence ?", hint: "5 / 20.", answer: "5 / 20 = 0,25 = 25%." },
    { title: "Effectif d'une valeur", level: "2", prompt: "Dans 6 ; 8 ; 8 ; 9 ; 8 ; 10, quel est l'effectif de 8 ?", hint: "Compte le nombre de 8.", answer: "La valeur 8 apparaît 3 fois." },
    { title: "Moyenne pondérée", level: "2", prompt: "Deux notes 10 et 16 ont coefficients 1 et 2. Calcule la moyenne.", hint: "Compte 16 deux fois.", answer: "(10 + 16 + 16) / 3 = 42 / 3 = 14." },
    { title: "Pourcentage", level: "2", prompt: "12 réussites sur 30 essais : quel pourcentage ?", hint: "12 / 30 puis x 100.", answer: "12 / 30 = 0,4, donc 40%." },
    { title: "Comparer", level: "3", prompt: "Une moyenne de 13 avec des notes entre 9 et 17 est-elle possible ?", hint: "Une moyenne reste entre le minimum et le maximum.", answer: "Oui, 13 est entre 9 et 17." },
    { title: "Retrouver une somme", level: "3", prompt: "La moyenne de 4 valeurs est 12. Quelle est leur somme ?", hint: "Somme = moyenne x effectif.", answer: "12 x 4 = 48." },
    { title: "Bilan statistiques", level: "3", prompt: "Dans 5 ; 5 ; 8 ; 12 ; 15, donne effectif total, étendue et moyenne.", hint: "Traite les trois demandes une par une.", answer: "Effectif total 5 ; étendue 10 ; moyenne 45 / 5 = 9." },
  ],
  "4e:Fractions": [
    { title: "Même dénominateur", level: "1", prompt: "Calcule : 3/7 + 2/7.", hint: "Additionne les numérateurs.", answer: "3/7 + 2/7 = 5/7." },
    { title: "Dénominateur commun", level: "1", prompt: "Calcule : 1/2 + 1/4.", hint: "Mets 1/2 en quarts.", answer: "2/4 + 1/4 = 3/4." },
    { title: "Soustraction", level: "1", prompt: "Calcule : 5/6 - 1/3.", hint: "1/3 = 2/6.", answer: "5/6 - 2/6 = 3/6 = 1/2." },
    { title: "Multiplication", level: "2", prompt: "Calcule : 3/5 x 10/9.", hint: "Simplifie avant si possible.", answer: "3 x 10 / (5 x 9) = 30/45 = 2/3." },
    { title: "Division", level: "2", prompt: "Calcule : 4/7 / 2/3.", hint: "Multiplie par l'inverse.", answer: "4/7 x 3/2 = 12/14 = 6/7." },
    { title: "Signe", level: "2", prompt: "Calcule : -2/3 + 5/6.", hint: "-2/3 = -4/6.", answer: "-4/6 + 5/6 = 1/6." },
    { title: "Simplifier", level: "2", prompt: "Simplifie : 42/56.", hint: "Divise par 14.", answer: "42/56 = 3/4." },
    { title: "Expression", level: "3", prompt: "Calcule : 2/3 + 5/6 x 3/5.", hint: "La multiplication passe avant.", answer: "5/6 x 3/5 = 1/2, donc 2/3 + 1/2 = 7/6." },
    { title: "Fraction négative", level: "3", prompt: "Calcule : -3/4 / 9/8.", hint: "Multiplie par 8/9.", answer: "-3/4 x 8/9 = -24/36 = -2/3." },
    { title: "Bilan fractions", level: "3", prompt: "Calcule : 1 - 2/5 + 3/10.", hint: "Écris tout en dixièmes.", answer: "10/10 - 4/10 + 3/10 = 9/10." },
  ],
  "4e:Puissances": [
    { title: "Puissance simple", level: "1", prompt: "Calcule : 2^5.", hint: "2 x 2 x 2 x 2 x 2.", answer: "2^5 = 32." },
    { title: "Exposant zéro", level: "1", prompt: "Que vaut 7^0 ?", hint: "Tout nombre non nul puissance 0 vaut 1.", answer: "7^0 = 1." },
    { title: "Exposant négatif", level: "1", prompt: "Écris 10^-2 sous forme décimale.", hint: "10^-2 = 1 / 100.", answer: "10^-2 = 0,01." },
    { title: "Produit de puissances", level: "2", prompt: "Simplifie : 10^3 x 10^4.", hint: "On additionne les exposants.", answer: "10^7." },
    { title: "Quotient", level: "2", prompt: "Simplifie : 10^6 / 10^2.", hint: "On soustrait les exposants.", answer: "10^4." },
    { title: "Notation scientifique", level: "2", prompt: "Écris 42 000 en notation scientifique.", hint: "Le nombre devant 10 doit être entre 1 et 10.", answer: "42 000 = 4,2 x 10^4." },
    { title: "Petit nombre", level: "2", prompt: "Écris 0,00035 en notation scientifique.", hint: "Déplace la virgule jusqu'à 3,5.", answer: "0,00035 = 3,5 x 10^-4." },
    { title: "Comparer", level: "3", prompt: "Quel est le plus grand : 6 x 10^5 ou 9 x 10^4 ?", hint: "Écris 9 x 10^4 = 0,9 x 10^5.", answer: "6 x 10^5 est plus grand." },
    { title: "Signe et carré", level: "3", prompt: "Compare (-4)^2 et -4^2.", hint: "Les parenthèses changent tout.", answer: "(-4)^2 = 16, mais -4^2 = -16." },
    { title: "Bilan puissances", level: "3", prompt: "Simplifie : (10^3 x 10^-5) / 10^-1.", hint: "Regroupe les exposants.", answer: "10^(3 - 5 - (-1)) = 10^-1." },
  ],
  "4e:Équations": [
    { title: "Addition", level: "1", prompt: "Résous : x + 7 = 12.", hint: "Soustrais 7.", answer: "x = 5." },
    { title: "Soustraction", level: "1", prompt: "Résous : x - 9 = -2.", hint: "Ajoute 9.", answer: "x = 7." },
    { title: "Multiplication", level: "1", prompt: "Résous : 5x = 35.", hint: "Divise par 5.", answer: "x = 7." },
    { title: "Deux étapes", level: "2", prompt: "Résous : 3x + 4 = 19.", hint: "Soustrais 4 puis divise par 3.", answer: "3x = 15 donc x = 5." },
    { title: "Signe négatif", level: "2", prompt: "Résous : -2x + 6 = 14.", hint: "Soustrais 6.", answer: "-2x = 8 donc x = -4." },
    { title: "x des deux côtés", level: "2", prompt: "Résous : 4x - 3 = x + 9.", hint: "Regroupe les x d'un côté.", answer: "3x = 12 donc x = 4." },
    { title: "Vérification", level: "2", prompt: "Résous puis vérifie : 2x - 5 = 11.", hint: "Ajoute 5 puis divise par 2.", answer: "x = 8. Vérif : 16 - 5 = 11." },
    { title: "Parenthèse", level: "3", prompt: "Résous : 2(x + 3) = 18.", hint: "Divise par 2 ou développe.", answer: "x + 3 = 9 donc x = 6." },
    { title: "Décimaux", level: "3", prompt: "Résous : 0,5x + 2 = 7.", hint: "0,5x = 5.", answer: "x = 10." },
    { title: "Bilan équations", level: "3", prompt: "Résous : 7 - 2x = 3x - 8.", hint: "Regroupe les x à droite.", answer: "15 = 5x donc x = 3." },
  ],
  "3e:Développer et factoriser": [
    { title: "Distributivité", level: "1", prompt: "Développe : 3(x + 5).", hint: "3 multiplie chaque terme.", answer: "3x + 15." },
    { title: "Signe moins", level: "1", prompt: "Développe : -2(x - 4).", hint: "-2 multiplie x et -4.", answer: "-2x + 8." },
    { title: "Réduire", level: "1", prompt: "Réduis : 4x + 3x - 2.", hint: "Regroupe les termes en x.", answer: "7x - 2." },
    { title: "Double distributivité", level: "2", prompt: "Développe : (x + 2)(x + 3).", hint: "Chaque terme multiplie chaque terme.", answer: "x^2 + 3x + 2x + 6 = x^2 + 5x + 6." },
    { title: "Avec signe négatif", level: "2", prompt: "Développe : (x - 5)(x + 1).", hint: "Attention à -5 x 1.", answer: "x^2 + x - 5x - 5 = x^2 - 4x - 5." },
    { title: "Factoriser commun", level: "2", prompt: "Factorise : 6x + 18.", hint: "Cherche le facteur commun 6.", answer: "6(x + 3)." },
    { title: "Facteur x", level: "2", prompt: "Factorise : 5x^2 - 10x.", hint: "Facteur commun : 5x.", answer: "5x(x - 2)." },
    { title: "Identité utile", level: "3", prompt: "Factorise : x^2 - 25.", hint: "C'est a^2 - b^2.", answer: "(x - 5)(x + 5)." },
    { title: "Développer puis réduire", level: "3", prompt: "Développe : (2x - 3)(x + 4).", hint: "Multiplie les quatre produits.", answer: "2x^2 + 8x - 3x - 12 = 2x^2 + 5x - 12." },
    { title: "Bilan calcul littéral", level: "3", prompt: "Factorise : 9x^2 - 12x.", hint: "Le facteur commun est 3x.", answer: "3x(3x - 4)." },
  ],
  "3e:Équations-produits": [
    { title: "Produit nul simple", level: "1", prompt: "Résous : (x - 4)(x + 2) = 0.", hint: "Chaque facteur peut valoir 0.", answer: "x = 4 ou x = -2." },
    { title: "Facteur négatif", level: "1", prompt: "Résous : (x + 7)(x - 1) = 0.", hint: "x + 7 = 0 ou x - 1 = 0.", answer: "x = -7 ou x = 1." },
    { title: "Coefficient", level: "1", prompt: "Résous : (2x - 6)(x + 5) = 0.", hint: "Résous 2x - 6 = 0.", answer: "x = 3 ou x = -5." },
    { title: "Deux coefficients", level: "2", prompt: "Résous : (3x + 9)(2x - 8) = 0.", hint: "Traite les deux facteurs.", answer: "x = -3 ou x = 4." },
    { title: "Factoriser avant", level: "2", prompt: "Résous : x(x - 6) = 0.", hint: "Un facteur est déjà x.", answer: "x = 0 ou x = 6." },
    { title: "Mise en facteur", level: "2", prompt: "Résous : 5x(x + 2) = 0.", hint: "5 n'annule pas le produit.", answer: "x = 0 ou x = -2." },
    { title: "Carré nul", level: "2", prompt: "Résous : (x - 9)^2 = 0.", hint: "Le facteur x - 9 doit valoir 0.", answer: "x = 9." },
    { title: "Développer interdit", level: "3", prompt: "Résous : (4x + 1)(x - 3) = 0.", hint: "Ne développe pas, applique le produit nul.", answer: "x = -1/4 ou x = 3." },
    { title: "Après factorisation", level: "3", prompt: "Résous : x^2 - 16 = 0.", hint: "Factorise avec a^2 - b^2.", answer: "(x - 4)(x + 4) = 0, donc x = 4 ou x = -4." },
    { title: "Bilan produit nul", level: "3", prompt: "Résous : 2x^2 - 10x = 0.", hint: "Factorise par 2x.", answer: "2x(x - 5) = 0, donc x = 0 ou x = 5." },
  ],
  "3e:Fonctions": [
    { title: "Image simple", level: "1", prompt: "Pour f(x) = 2x + 1, calcule f(3).", hint: "Remplace x par 3.", answer: "f(3) = 2 x 3 + 1 = 7." },
    { title: "Image négative", level: "1", prompt: "Pour f(x) = -x + 4, calcule f(6).", hint: "-6 + 4.", answer: "f(6) = -2." },
    { title: "Lire une image", level: "1", prompt: "Si f(5) = 12, que représente 12 ?", hint: "C'est le résultat donné par la fonction.", answer: "12 est l'image de 5." },
    { title: "Antécédent", level: "2", prompt: "Pour f(x) = x + 8, cherche l'antécédent de 13.", hint: "Résous x + 8 = 13.", answer: "x = 5." },
    { title: "Fonction affine", level: "2", prompt: "Pour f(x) = 3x - 2, calcule f(-1).", hint: "Remplace x par -1.", answer: "f(-1) = -3 - 2 = -5." },
    { title: "Équation associée", level: "2", prompt: "Pour f(x) = 2x - 5, cherche x tel que f(x) = 9.", hint: "Résous 2x - 5 = 9.", answer: "2x = 14 donc x = 7." },
    { title: "Tableau", level: "2", prompt: "Complète : si f(x) = -2x, que vaut f(4) ?", hint: "-2 x 4.", answer: "f(4) = -8." },
    { title: "Comparer deux images", level: "3", prompt: "Pour f(x) = x^2 - 1, calcule f(0) et f(3).", hint: "Remplace x par chaque valeur.", answer: "f(0) = -1 et f(3) = 8." },
    { title: "Antécédent négatif", level: "3", prompt: "Pour f(x) = -3x + 2, cherche l'antécédent de 11.", hint: "Résous -3x + 2 = 11.", answer: "-3x = 9 donc x = -3." },
    { title: "Bilan fonctions", level: "3", prompt: "Pour f(x) = 4 - 2x, calcule f(-2), puis cherche x tel que f(x) = 0.", hint: "Deux tâches : image puis équation.", answer: "f(-2) = 8. 4 - 2x = 0 donne x = 2." },
  ],
};

export function getLeaneCourseExercises(levelId: LeaneLevel["id"], courseTitle: string) {
  const exercises = leaneCourseExerciseSeries[`${levelId}:${courseTitle}`];
  if (!exercises) {
    throw new Error(`Missing Leane exercise series for ${levelId}:${courseTitle}`);
  }
  return exercises;
}

export function getLeaneCoursePractice(levelId: LeaneLevel["id"], courseTitle: string) {
  const practice = leaneCoursePractices[`${levelId}:${courseTitle}`];
  if (!practice) {
    throw new Error(`Missing Leane practice for ${levelId}:${courseTitle}`);
  }
  return practice;
}

export const leaneCoursePracticeEntries = leaneLevels.flatMap((level) =>
  level.courses.map((course) => ({
    level,
    course,
    practice: getLeaneCoursePractice(level.id, course.title),
    exercises: getLeaneCourseExercises(level.id, course.title),
  })),
);

export const leaneBridgeItems = [
  "Manipuler des fractions sans perdre le signe.",
  "Développer, réduire et factoriser avec une ligne par étape.",
  "Résoudre une équation simple puis vérifier la solution.",
  "Lire une fonction : image, antécédent, variation simple.",
];

export const leaneQuiz: LeaneQuizQuestion[] = [
  {
    question: "Dans 7 + 3 x 4, que calcule-t-on en premier ?",
    choices: ["7 + 3", "3 x 4", "Le résultat final sans étape"],
    answer: 1,
  },
  {
    question: "Quelle est la bonne notation scientifique de 0,00082 ?",
    choices: ["8,2 x 10^-4", "82 x 10^-5", "0,82 x 10^-3"],
    answer: 0,
  },
  {
    question: "Si (x - 2)(x + 5) = 0, quelles sont les solutions ?",
    choices: ["2 et -5", "-2 et 5", "2 seulement"],
    answer: 0,
  },
  {
    question: "Pour f(x) = 3x - 1, quelle est l'image de 4 ?",
    choices: ["10", "11", "12"],
    answer: 1,
  },
  { question: "Dans 18 - 2 x 5, le résultat est...", choices: ["80", "8", "16"], answer: 1 },
  { question: "Dans 4 x (6 + 2), on commence par...", choices: ["4 x 6", "6 + 2", "2 x 4"], answer: 1 },
  { question: "48 / 6 x 2 vaut...", choices: ["4", "16", "1"], answer: 1 },
  { question: "Pour x = -2, 4x + 1 vaut...", choices: ["-7", "9", "-9"], answer: 0 },
  { question: "Réduire 5x + 3x donne...", choices: ["8x", "8x^2", "15x"], answer: 0 },
  { question: "On ne peut pas réduire directement...", choices: ["2x + 3x", "7a - a", "4x + 4"], answer: 2 },
  { question: "La moyenne de 6, 8 et 10 est...", choices: ["8", "24", "7"], answer: 0 },
  { question: "L'étendue de 2, 9, 11 est...", choices: ["9", "11", "13"], answer: 0 },
  { question: "5 élèves sur 20 représentent...", choices: ["20%", "25%", "50%"], answer: 1 },
  { question: "1/3 + 1/3 vaut...", choices: ["2/6", "2/3", "1/6"], answer: 1 },
  { question: "1/2 + 1/4 vaut...", choices: ["2/6", "3/4", "1/8"], answer: 1 },
  { question: "Diviser par 3/5 revient à multiplier par...", choices: ["3/5", "5/3", "15"], answer: 1 },
  { question: "2^4 vaut...", choices: ["8", "16", "24"], answer: 1 },
  { question: "10^-2 vaut...", choices: ["0,01", "100", "-20"], answer: 0 },
  { question: "3,4 x 10^5 est une notation scientifique car...", choices: ["3,4 est entre 1 et 10", "10 est positif", "5 est petit"], answer: 0 },
  { question: "Résoudre x + 8 = 15 donne...", choices: ["x = 7", "x = 23", "x = -7"], answer: 0 },
  { question: "Résoudre 3x = 21 donne...", choices: ["x = 18", "x = 7", "x = 63"], answer: 1 },
  { question: "Résoudre 2x - 5 = 9 donne...", choices: ["x = 2", "x = 7", "x = -7"], answer: 1 },
  { question: "Dans une équation, on conserve l'égalité si...", choices: ["on fait la même opération des deux côtés", "on change un seul côté", "on enlève les x"], answer: 0 },
  { question: "Développer 3(x + 2) donne...", choices: ["3x + 2", "3x + 6", "x + 6"], answer: 1 },
  { question: "Développer -2(x - 5) donne...", choices: ["-2x + 10", "-2x - 10", "2x - 10"], answer: 0 },
  { question: "Factoriser 6x + 12 donne...", choices: ["6(x + 2)", "x(6 + 12)", "18x"], answer: 0 },
  { question: "x^2 - 25 se factorise en...", choices: ["(x - 5)(x + 5)", "(x - 25)(x + 1)", "(x - 5)^2"], answer: 0 },
  { question: "Si (x - 4)(x + 1) = 0, alors...", choices: ["x = 4 ou x = -1", "x = -4 ou x = 1", "x = 5"], answer: 0 },
  { question: "Dans (2x - 6)(x + 3) = 0, une solution est...", choices: ["x = 3", "x = 6", "x = -6"], answer: 0 },
  { question: "La règle du produit nul s'applique quand le produit vaut...", choices: ["0", "1", "-1"], answer: 0 },
  { question: "Pour f(x) = 2x + 1, f(5) vaut...", choices: ["10", "11", "12"], answer: 1 },
  { question: "Si f(3) = 8, alors 8 est...", choices: ["l'image de 3", "un antécédent de 3", "le nom de la fonction"], answer: 0 },
  { question: "Pour f(x) = x - 4, l'antécédent de 10 est...", choices: ["6", "10", "14"], answer: 2 },
  { question: "Pour f(x) = -2x, f(-3) vaut...", choices: ["-6", "6", "1"], answer: 1 },
  { question: "Une fonction affine s'écrit sous la forme...", choices: ["ax + b", "a/x", "x^2 seulement"], answer: 0 },
  { question: "Avant de remplacer x par -4, il faut souvent...", choices: ["mettre des parenthèses", "supprimer le signe moins", "changer l'exposant"], answer: 0 },
  { question: "Une moyenne de 18 avec des valeurs entre 2 et 12 est...", choices: ["possible", "impossible", "obligatoire"], answer: 1 },
];

export const leaneFlashcards: LeaneFlashcard[] = [
  {
    tag: "Priorités",
    front: "Dans quel ordre calcule-t-on une expression avec parenthèses, multiplications et additions ?",
    back: "Parenthèses, puis multiplications/divisions, puis additions/soustractions de gauche à droite.",
  },
  {
    tag: "Fractions",
    front: "Comment diviser par une fraction ?",
    back: "On multiplie par son inverse : a/b / c/d = a/b x d/c.",
  },
  {
    tag: "Puissances",
    front: "Que vaut a^-n ?",
    back: "a^-n = 1/a^n, avec a non nul.",
  },
  {
    tag: "Equation",
    front: "Pourquoi vérifier une solution d'équation ?",
    back: "Pour confirmer que la valeur trouvée rend bien l'égalité de départ vraie.",
  },
  {
    tag: "Fonctions",
    front: "Que signifie f(3) ?",
    back: "C'est l'image de 3 par la fonction f.",
  },
  {
    tag: "Statistiques",
    front: "Comment vérifier rapidement qu'une moyenne est plausible ?",
    back: "Elle doit rester entre la plus petite et la plus grande valeur.",
  },
  {
    tag: "Calcul littéral",
    front: "Pourquoi réduire avant de remplacer x peut aider ?",
    back: "Parce que l'expression devient plus courte et limite les erreurs de calcul.",
  },
  {
    tag: "Produit nul",
    front: "Quand peut-on utiliser la règle du produit nul ?",
    back: "Quand une expression sous forme de produit est égale à 0.",
  },
  {
    tag: "Factoriser",
    front: "Que cherche-t-on en premier pour factoriser ?",
    back: "Un facteur commun ou une identité remarquable simple.",
  },
  {
    tag: "Méthode",
    front: "Pourquoi écrire une seule transformation par ligne ?",
    back: "Pour repérer les erreurs et garder un raisonnement lisible.",
  },
];
