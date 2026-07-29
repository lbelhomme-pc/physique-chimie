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

export const leaneLevels: LeaneLevel[] = [
  {
    id: "5e",
    title: "Bases 5e",
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
        title: "Priorites",
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
        hint: "Ecris D = (-4)^2 + 3 x (-4).",
        answer: "D = 16 - 12 = 4.",
      },
    ],
  },
  {
    id: "4e",
    title: "Bases 4e",
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
        hint: "Le nombre devant 10 doit etre compris entre 1 et 10.",
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
    title: "Bases 3e",
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
        prompt: "Developpe et reduis : (x - 3)(2x + 5).",
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
      title: "Priorites en deux lignes",
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
      tag: "Priorites",
      front: "Quelle est la règle d'or pour les enchaînements d'opérations ?",
      back: "Parenthèses d'abord, puis multiplications/divisions, puis additions/soustractions.",
    },
  },
  "5e:Calcul littéral de départ": {
    exercise: {
      title: "Remplacer x",
      level: "Application",
      prompt: "Calcule E = 4x - 9 pour x = -2.",
      hint: "Ecris 4 x (-2) - 9.",
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
      prompt: "Developpe et reduis : (x + 6)(2x - 3).",
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
];

export const leaneFlashcards: LeaneFlashcard[] = [
  {
    tag: "Priorites",
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
];
