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

export const leaneLevels: LeaneLevel[] = [
  {
    id: "5e",
    title: "Bases 5e",
    subtitle: "Reprendre les automatismes sans stress",
    objective: "Poser un calcul propre, respecter les priorites et manipuler une expression simple.",
    accent: "#1f6feb",
    courses: [
      {
        title: "Enchainements d'operations",
        focus: "Une ligne = une seule transformation.",
        points: [
          "Parentheses d'abord, en commencant par les plus interieures.",
          "Multiplications et divisions avant additions et soustractions.",
          "A priorite egale, on avance de gauche a droite.",
        ],
        example: "50 - [3 x (9 - 5)] = 50 - [3 x 4] = 50 - 12 = 38",
        trap: "36 / 6 x 4 se calcule de gauche a droite : 6 x 4 = 24.",
      },
      {
        title: "Calcul litteral de depart",
        focus: "Remplacer une lettre par un nombre et reduire les termes de meme nature.",
        points: [
          "7 x x s'ecrit 7x ; 1 x a s'ecrit a ; -1 x b s'ecrit -b.",
          "Avec une valeur negative, on garde les parentheses : (-4)^2 = 16.",
          "On additionne seulement les termes comparables : x avec x, x^2 avec x^2.",
        ],
        example: "Pour x = -3, 2x - 7 = 2 x (-3) - 7 = -13",
        trap: "7x + 3 ne devient jamais 10x : 3 n'est pas un terme en x.",
      },
      {
        title: "Statistiques essentielles",
        focus: "Effectif, frequence, moyenne : trois mots a stabiliser.",
        points: [
          "L'effectif total est le nombre de donnees.",
          "Une frequence se calcule avec effectif de la valeur / effectif total.",
          "La moyenne simple est la somme des valeurs divisee par le nombre de valeurs.",
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
        hint: "Commence par la multiplication ou la division, puis avance de gauche a droite.",
        answer: "A = 38. B = 9 x 3 - 4 = 27 - 4 = 23.",
      },
      {
        title: "Parentheses",
        level: "Niveau 2",
        prompt: "Calcule C = 16 - [4 x (8 - 5)].",
        hint: "La parenthese la plus interieure se traite en premier.",
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
    subtitle: "Solidifier fractions, puissances et equations",
    objective: "Gagner en securite sur les calculs qui reviennent constamment au lycee.",
    accent: "#15a887",
    courses: [
      {
        title: "Fractions",
        focus: "Additionner demande un denominateur commun ; multiplier demande de simplifier avant.",
        points: [
          "Pour additionner : on met au meme denominateur.",
          "Pour multiplier : on multiplie les numerateurs et les denominateurs.",
          "Pour diviser : on multiplie par l'inverse.",
        ],
        example: "3/4 - 5/6 = 9/12 - 10/12 = -1/12",
        trap: "On n'additionne pas les denominateurs : 1/3 + 1/3 = 2/3.",
      },
      {
        title: "Puissances",
        focus: "Les puissances servent a ecrire vite de grands ou petits nombres.",
        points: [
          "a^0 = 1 si a n'est pas nul.",
          "a^-n = 1 / a^n.",
          "Une notation scientifique s'ecrit a x 10^n avec 1 <= |a| < 10.",
        ],
        example: "0,00056 = 5,6 x 10^-4",
        trap: "(-5)^2 = 25, mais -5^2 = -25.",
      },
      {
        title: "Equations",
        focus: "Le but est d'isoler x en gardant l'egalite vraie.",
        points: [
          "On peut ajouter, soustraire, multiplier ou diviser les deux membres par le meme nombre non nul.",
          "On regroupe les x d'un cote et les nombres de l'autre.",
          "On verifie rapidement dans l'equation de depart.",
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
        prompt: "Ecris 0,0042 en notation scientifique.",
        hint: "Le nombre devant 10 doit etre compris entre 1 et 10.",
        answer: "0,0042 = 4,2 x 10^-3.",
      },
      {
        title: "Equation",
        level: "Niveau 2",
        prompt: "Resous 4 - 3x = x + 12.",
        hint: "Regroupe les x a droite ou a gauche, puis les nombres de l'autre cote.",
        answer: "-4x = 8 donc x = -2.",
      },
    ],
  },
  {
    id: "3e",
    title: "Bases 3e",
    subtitle: "Preparer l'entree au lycee",
    objective: "Relier calcul litteral, factorisation, fonctions et probabilites avant la premiere.",
    accent: "#7c5cff",
    courses: [
      {
        title: "Developper et factoriser",
        focus: "Developper enleve les parentheses ; factoriser remet sous forme de produit.",
        points: [
          "Distributivite simple : k(a + b) = ka + kb.",
          "Double distributivite : chaque terme multiplie chaque terme.",
          "Identite utile : a^2 - b^2 = (a - b)(a + b).",
        ],
        example: "(2x - 1)(x + 4) = 2x^2 + 8x - x - 4 = 2x^2 + 7x - 4",
        trap: "Un signe moins devant une parenthese change tous les signes.",
      },
      {
        title: "Equations-produits",
        focus: "Un produit est nul si au moins un de ses facteurs est nul.",
        points: [
          "On factorise si l'expression n'est pas deja un produit.",
          "On resout chaque facteur egal a 0.",
          "On donne toutes les solutions.",
        ],
        example: "(2x - 6)(x + 5) = 0 donne x = 3 ou x = -5",
        trap: "On ne divise pas par une expression qui peut valoir 0.",
      },
      {
        title: "Fonctions",
        focus: "Une fonction transforme une valeur de depart en image.",
        points: [
          "f(2) se lit l'image de 2 par f.",
          "Un antecedent de 5 est une valeur x telle que f(x) = 5.",
          "Une fonction affine s'ecrit f(x) = ax + b.",
        ],
        example: "Si f(x) = -2x + 7, alors f(3) = 1",
        trap: "f(x) n'est pas f multiplie par x : c'est une notation.",
      },
    ],
    exercises: [
      {
        title: "Developpement",
        level: "Niveau 2",
        prompt: "Developpe et reduis : (x - 3)(2x + 5).",
        hint: "Chaque terme de la premiere parenthese multiplie chaque terme de la seconde.",
        answer: "2x^2 + 5x - 6x - 15 = 2x^2 - x - 15.",
      },
      {
        title: "Produit nul",
        level: "Niveau 2",
        prompt: "Resous (3x + 9)(x - 4) = 0.",
        hint: "Chaque facteur peut etre egal a 0.",
        answer: "3x + 9 = 0 donne x = -3 ; x - 4 = 0 donne x = 4.",
      },
      {
        title: "Fonction affine",
        level: "Niveau 3",
        prompt: "Pour f(x) = 2x - 5, calcule f(-3) puis cherche x tel que f(x) = 9.",
        hint: "Remplace x par -3, puis resous 2x - 5 = 9.",
        answer: "f(-3) = -11. 2x - 5 = 9 donne x = 7.",
      },
    ],
  },
];

export const leaneBridgeItems = [
  "Manipuler des fractions sans perdre le signe.",
  "Developper, reduire et factoriser avec une ligne par etape.",
  "Resoudre une equation simple puis verifier la solution.",
  "Lire une fonction : image, antecedent, variation simple.",
];

export const leaneQuiz: LeaneQuizQuestion[] = [
  {
    question: "Dans 7 + 3 x 4, que calcule-t-on en premier ?",
    choices: ["7 + 3", "3 x 4", "Le resultat final sans etape"],
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
    front: "Dans quel ordre calcule-t-on une expression avec parentheses, multiplications et additions ?",
    back: "Parentheses, puis multiplications/divisions, puis additions/soustractions de gauche a droite.",
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
    front: "Pourquoi verifier une solution d'equation ?",
    back: "Pour confirmer que la valeur trouvee rend bien l'egalite de depart vraie.",
  },
  {
    tag: "Fonctions",
    front: "Que signifie f(3) ?",
    back: "C'est l'image de 3 par la fonction f.",
  },
];
