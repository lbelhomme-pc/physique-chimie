import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const base = path.join(root, "src", "data", "mathematiques", "chapters", "lycee", "2nde");
const programDir = path.join(root, "src", "data", "mathematiques", "programmes");
const docsDir = path.join(root, "docs");

const source = {
  id: "bo-2026-mathematiques-seconde-gt",
  title: "Programme d'enseignement de mathématiques de la classe de seconde générale et technologique",
  institution: "Ministère de l'Éducation nationale - DGESCO",
  bulletin: "Bulletin officiel n° 14 du 2 avril 2026",
  date: "2026-04-02",
  arrete: "Arrêté du 26 février 2026, JO du 27 mars 2026",
  application: "Rentrée scolaire 2026-2027",
  url: "https://www.education.gouv.fr/bo/2026/Hebdo14/MENE2602914A",
  annexePdf: "https://www.education.gouv.fr/sites/default/files/document/Annexe%20%E2%80%93%20Programme%20d%26%23039%3Benseignement%20de%20math%C3%A9matiques%20de%20la%20classe%20de%20seconde%20g%C3%A9n%C3%A9rale%20et%20technologique-515402.pdf",
  consultedAt: "2026-07-17",
};

const chapters = [
  {
    slug: "arithmetique-ensembles-logique",
    order: 1,
    title: "Arithmétique, ensembles et logique",
    theme: "Nombres et raisonnement",
    domain: "logique-raisonnement",
    description: "Multiples, diviseurs, ensembles de nombres et premiers raisonnements logiques.",
    duration: "4 semaines",
    tags: ["arithmétique", "ensembles", "logique", "raisonnement"],
    prerequisites: ["calcul avec des entiers", "fractions", "vocabulaire de base des ensembles"],
    competencies: ["raisonner", "calculer", "communiquer"],
    objectives: [
      "Utiliser les notions de multiple, diviseur, nombre pair et nombre impair.",
      "Lire et écrire des appartenances, intersections et réunions d'ensembles.",
      "Distinguer implication, réciproque, équivalence et contre-exemple.",
      "Présenter une fraction sous forme irréductible.",
    ],
    vocab: ["multiple", "diviseur", "ensemble", "appartenance", "inclusion", "intersection", "réunion", "contre-exemple"],
    discovery: "On observe les numéros de casiers ouverts après plusieurs passages d'élèves. La question est de savoir quels numéros peuvent être atteints par deux règles différentes : être multiple de 3 et être pair.",
    definitions: [
      "Un entier a est multiple d'un entier b non nul lorsqu'il existe un entier k tel que a = kb.",
      "Un ensemble regroupe des objets appelés éléments. On écrit x ∈ E pour dire que x appartient à E.",
      "Une proposition mathématique est une phrase dont on peut décider si elle est vraie ou fausse.",
    ],
    properties: [
      "La somme de deux multiples d'un même entier a est encore un multiple de a.",
      "Le carré d'un nombre impair est impair.",
      "Pour prouver qu'une affirmation générale est fausse, un seul contre-exemple suffit.",
    ],
    methods: [
      "Pour tester si a est multiple de b, on vérifie si la division de a par b a un reste nul.",
      "Pour rendre une fraction irréductible, on divise le numérateur et le dénominateur par un diviseur commun jusqu'à ne plus pouvoir simplifier.",
      "Pour lire A ∩ B, on cherche les éléments qui sont à la fois dans A et dans B.",
    ],
    examples: [
      "42 est multiple de 6 car 42 = 6 × 7. Il est aussi multiple de 3 car 42 = 3 × 14.",
      "Si A = {2, 4, 6, 8} et B = {3, 6, 9}, alors A ∩ B = {6} et A ∪ B = {2, 3, 4, 6, 8, 9}.",
    ],
    figure: "set",
    mistakes: [
      "Confondre A ∈ B et A ⊂ B.",
      "Penser qu'une implication vraie impose automatiquement sa réciproque.",
      "Oublier de justifier qu'un quotient est entier pour parler de multiple.",
    ],
    python: {
      title: "Tester un multiple",
      code: "def est_multiple(a, b):\n    return b != 0 and a % b == 0\n\nprint(est_multiple(42, 6))",
      explanation: "L'opérateur % donne le reste de la division euclidienne. Un reste nul signifie que la division tombe juste.",
    },
    formulas: ["a est multiple de b signifie a = kb avec k entier.", "A ∩ B : éléments communs.", "A ∪ B : éléments appartenant à au moins un des deux ensembles."],
    related: ["nombres-reels-intervalles", "probabilites-conditionnelles"],
    exercises: [
      ex("arith-1", "Automatismes sur les multiples", 1, "Parmi 36, 45, 58 et 72, indiquer les multiples de 9.", ["36 = 9 × 4, donc 36 convient.", "45 = 9 × 5, donc 45 convient.", "58 n'est pas divisible par 9.", "72 = 9 × 8, donc 72 convient."], ["multiples"], "nombre"),
      ex("arith-2", "Fraction irréductible", 2, "Rendre irréductible la fraction 84/126.", ["84 et 126 sont divisibles par 42.", "84/126 = 2/3.", "Comme 2 et 3 sont premiers entre eux, la fraction est irréductible."], ["fractions"], "expression"),
      ex("arith-3", "Intersection et réunion", 2, "On donne A = {1, 2, 3, 6} et B = {2, 4, 6, 8}. Déterminer A ∩ B et A ∪ B.", ["Les éléments communs sont 2 et 6.", "A ∩ B = {2, 6}.", "La réunion contient tous les éléments sans répétition : {1, 2, 3, 4, 6, 8}."], ["ensembles"], "expression"),
      ex("arith-4", "Réciproque ou contre-exemple", 3, "L'affirmation 'si un nombre est multiple de 4, alors il est pair' est vraie. Sa réciproque est-elle vraie ?", ["La réciproque serait : si un nombre est pair, alors il est multiple de 4.", "6 est pair mais n'est pas multiple de 4.", "La réciproque est donc fausse."], ["logique"], "text"),
      ex("arith-5", "Carré impair", 4, "Montrer que le carré de 2n + 1 est impair pour tout entier n.", ["On développe : (2n + 1)^2 = 4n^2 + 4n + 1.", "On factorise la partie paire : 4n^2 + 4n + 1 = 2(2n^2 + 2n) + 1.", "C'est de la forme 2k + 1 avec k entier, donc c'est impair."], ["démonstration"], "text"),
    ],
    quiz: [
      q("arith-q1", "Que signifie a est multiple de b ?", ["a + b est entier", "Il existe un entier k tel que a = kb", "a est plus grand que b", "a/b est toujours décimal"], 1, "C'est la définition officielle utilisée en seconde."),
      q("arith-q2", "Dans A ∩ B, on garde...", ["les éléments de A seulement", "les éléments de B seulement", "les éléments communs à A et B", "tous les éléments distincts"], 2, "Le symbole ∩ désigne l'intersection."),
      q("arith-q3", "Un contre-exemple sert à...", ["prouver une formule", "montrer qu'une proposition générale est fausse", "calculer un quotient", "définir un ensemble"], 1, "Un seul cas contraire suffit à invalider une affirmation universelle."),
      q("arith-q4", "La réciproque de 'si A alors B' est...", ["si B alors A", "si non A alors non B", "A et B", "si non B alors non A"], 0, "La contraposée serait 'si non B alors non A'."),
    ],
    cards: [
      card("arith-f1", "Définition d'un multiple", "a est multiple de b s'il existe un entier k tel que a = kb.", "définition"),
      card("arith-f2", "Que signifie A ∩ B ?", "C'est l'ensemble des éléments communs à A et B.", "notation"),
      card("arith-f3", "Comment prouver qu'une proposition est fausse ?", "On peut donner un contre-exemple.", "méthode"),
      card("arith-f4", "Erreur fréquente avec une implication", "Une implication vraie ne rend pas forcément sa réciproque vraie.", "erreur"),
    ],
    coverage: ["notations ℕ et ℤ", "multiples et diviseurs", "fractions irréductibles", "ensembles et symboles", "implication et réciproque", "contre-exemple", "raisonnement par cas"],
  },
  {
    slug: "nombres-reels-intervalles",
    order: 2,
    title: "Nombres réels, intervalles et valeur absolue",
    theme: "Nombres et calculs",
    domain: "nombres-calculs",
    description: "Droite numérique, ensembles de nombres, intervalles, encadrements et distance avec la valeur absolue.",
    duration: "4 semaines",
    tags: ["réels", "intervalles", "valeur absolue", "encadrement"],
    prerequisites: ["droite graduée", "nombres relatifs", "comparaison de nombres"],
    competencies: ["représenter", "calculer", "raisonner"],
    objectives: [
      "Placer et lire un réel sur une droite graduée.",
      "Représenter un intervalle et tester une appartenance.",
      "Utiliser la valeur absolue comme distance.",
      "Donner un encadrement décimal adapté.",
    ],
    vocab: ["réel", "décimal", "rationnel", "irrationnel", "intervalle", "amplitude", "valeur absolue"],
    discovery: "Une application de géolocalisation donne une position à 0,1 km près. On cherche tous les emplacements possibles sur une ligne droite : cela conduit naturellement à un intervalle.",
    definitions: [
      "L'ensemble ℝ contient tous les nombres que l'on peut placer sur une droite numérique.",
      "Un intervalle est un ensemble de nombres réels vérifiant une ou plusieurs inégalités.",
      "|a - b| représente la distance entre les nombres a et b sur la droite numérique.",
    ],
    properties: [
      "L'inéquation |x - a| ≤ r a pour ensemble de solutions [a - r, a + r] lorsque r ≥ 0.",
      "Un encadrement d'amplitude 10^-n donne une précision au rang n.",
      "Certains réels, comme √2 ou π, ne sont pas rationnels.",
    ],
    methods: [
      "Pour représenter [a, b], on trace le segment de a à b et on ferme les bornes.",
      "Pour représenter ]a, +∞[, on ouvre la borne a et on colorie vers la droite.",
      "Pour résoudre |x - a| ≤ r, on traduit : la distance de x à a est au plus r.",
    ],
    examples: [
      "|x - 3| ≤ 2 signifie que x est à une distance inférieure ou égale à 2 de 3, donc x ∈ [1, 5].",
      "1,41 < √2 < 1,42 est un encadrement décimal d'amplitude 0,01.",
    ],
    figure: "numberline",
    mistakes: [
      "Confondre une borne ouverte et une borne fermée.",
      "Utiliser la valeur absolue pour autre chose qu'une distance en seconde.",
      "Écrire un encadrement sans vérifier son amplitude.",
    ],
    python: {
      title: "Encadrer √2 par balayage",
      code: "def encadre_racine2(pas):\n    x = 1\n    while x * x < 2:\n        x = x + pas\n    return x - pas, x\n\nprint(encadre_racine2(0.01))",
      explanation: "Le programme avance par pas réguliers jusqu'à dépasser 2 avec le carré de x.",
    },
    formulas: ["|a - b| est la distance entre a et b.", "|x - a| ≤ r équivaut à x ∈ [a - r, a + r]."],
    related: ["arithmetique-ensembles-logique", "equations-inequations"],
    exercises: [
      ex("reels-1", "Lire un intervalle", 1, "Dire si 4 appartient à l'intervalle ]2 ; 4].", ["La borne 4 est fermée car le crochet est tourné vers 4.", "Donc 4 appartient à ]2 ; 4]."], ["intervalles"], "text"),
      ex("reels-2", "Distance sur la droite", 2, "Calculer |7 - 2| puis interpréter le résultat.", ["|7 - 2| = |5| = 5.", "La distance entre 7 et 2 sur la droite numérique vaut 5."], ["valeur absolue"], "number"),
      ex("reels-3", "Valeur absolue et intervalle", 2, "Résoudre |x - 5| ≤ 3.", ["x est à une distance au plus 3 de 5.", "Les bornes sont 5 - 3 = 2 et 5 + 3 = 8.", "L'ensemble des solutions est [2 ; 8]."], ["intervalles"], "expression"),
      ex("reels-4", "Encadrement", 3, "Donner un encadrement d'amplitude 0,1 du nombre 3,27.", ["On cherche deux nombres décimaux distants de 0,1.", "3,2 < 3,27 < 3,3.", "L'amplitude est 3,3 - 3,2 = 0,1."], ["encadrement"], "expression"),
      ex("reels-5", "Choisir la bonne écriture", 4, "Écrire avec une valeur absolue l'ensemble [6 ; 10].", ["Le centre de l'intervalle est (6 + 10)/2 = 8.", "Le rayon est 10 - 8 = 2.", "L'intervalle s'écrit |x - 8| ≤ 2."], ["valeur absolue"], "expression"),
    ],
    quiz: [
      q("reels-q1", "Que représente |a - b| ?", ["une somme", "une distance", "un quotient", "une aire"], 1, "La valeur absolue sert ici à mesurer une distance sur la droite numérique."),
      q("reels-q2", "Dans ]1 ; 5], le nombre 1 appartient-il à l'intervalle ?", ["oui", "non", "seulement si x = 5", "on ne peut pas savoir"], 1, "Le crochet ouvert exclut 1."),
      q("reels-q3", "L'intervalle solution de |x - 2| ≤ 4 est...", ["[-2 ; 6]", "[2 ; 4]", "] -2 ; 6 [", "[6 ; +∞["], 0, "On calcule 2 - 4 et 2 + 4."),
      q("reels-q4", "√2 est un exemple de nombre...", ["entier", "décimal", "irrationnel", "nul"], 2, "√2 n'est pas rationnel."),
    ],
    cards: [
      card("reels-f1", "Qu'est-ce qu'un intervalle ?", "Un ensemble de réels vérifiant une ou plusieurs inégalités.", "définition"),
      card("reels-f2", "Interprétation de |x - a| ≤ r", "x est à une distance au plus r du nombre a.", "méthode"),
      card("reels-f3", "Borne ouverte", "Une borne ouverte n'appartient pas à l'intervalle.", "notation"),
      card("reels-f4", "Nombre irrationnel", "Un nombre réel qui n'est pas rationnel, par exemple √2 ou π.", "définition"),
    ],
    coverage: ["ensemble ℝ", "intervalles", "valeur absolue comme distance", "encadrements décimaux", "nombres rationnels et irrationnels"],
  },
  {
    slug: "calcul-litteral-puissances-racines",
    order: 3,
    title: "Calcul littéral, puissances et racines carrées",
    theme: "Nombres et calculs",
    domain: "algebre",
    description: "Transformer des expressions, choisir une forme adaptée et calculer avec puissances et racines.",
    duration: "5 semaines",
    tags: ["calcul littéral", "puissances", "racines", "factorisation"],
    prerequisites: ["priorités opératoires", "développement simple", "fractions"],
    competencies: ["calculer", "modéliser", "raisonner"],
    objectives: [
      "Développer, réduire et factoriser des expressions simples.",
      "Utiliser les identités remarquables.",
      "Calculer avec des puissances entières relatives.",
      "Utiliser les règles de base sur les racines carrées positives.",
    ],
    vocab: ["expression", "développer", "factoriser", "réduire", "puissance", "racine carrée", "forme adaptée"],
    discovery: "Pour comparer deux offres de location, on écrit le prix total avec une variable x. La forme développée aide à calculer, la forme factorisée aide à résoudre.",
    definitions: [
      "Développer consiste à transformer un produit en somme.",
      "Factoriser consiste à transformer une somme en produit.",
      "La racine carrée de a ≥ 0 est le nombre positif dont le carré vaut a.",
    ],
    properties: [
      "(a + b)^2 = a^2 + 2ab + b^2.",
      "(a - b)^2 = a^2 - 2ab + b^2.",
      "(a + b)(a - b) = a^2 - b^2.",
      "Pour a ≥ 0 et b ≥ 0, √(ab) = √a × √b.",
    ],
    methods: [
      "Avant de transformer, se demander le but : calculer, résoudre, comparer ou étudier un signe.",
      "Pour factoriser ax + bx, repérer le facteur commun x : ax + bx = (a + b)x.",
      "Pour une expression fractionnaire, commencer par préciser les valeurs interdites.",
    ],
    examples: [
      "(x + 3)^2 = x^2 + 6x + 9.",
      "5x^2 - 10x = 5x(x - 2).",
      "√72 = √(36 × 2) = 6√2.",
    ],
    figure: "algebra",
    mistakes: [
      "Écrire à tort (a + b)^2 = a^2 + b^2.",
      "Oublier que √a est toujours positif.",
      "Transformer une expression sans tenir compte de l'objectif.",
    ],
    python: {
      title: "Première puissance dépassant un seuil",
      code: "def premiere_puissance(base, seuil):\n    n = 0\n    valeur = 1\n    while valeur < seuil:\n        n = n + 1\n        valeur = valeur * base\n    return n, valeur\n\nprint(premiere_puissance(2, 1000))",
      explanation: "La boucle multiplie par la base jusqu'à dépasser le seuil demandé.",
    },
    formulas: ["(a + b)^2 = a^2 + 2ab + b^2", "(a - b)^2 = a^2 - 2ab + b^2", "(a + b)(a - b) = a^2 - b^2", "√(ab) = √a√b pour a,b ≥ 0"],
    related: ["equations-inequations", "fonctions-reference-variations"],
    exercises: [
      ex("calc-1", "Développer", 1, "Développer 3(x + 4).", ["On distribue 3 sur chaque terme.", "3(x + 4) = 3x + 12."], ["développer"], "expression"),
      ex("calc-2", "Identité remarquable", 2, "Développer (x - 5)^2.", ["On utilise (a - b)^2 = a^2 - 2ab + b^2.", "(x - 5)^2 = x^2 - 10x + 25."], ["identités"], "expression"),
      ex("calc-3", "Factoriser", 2, "Factoriser 7x + 14.", ["Le facteur commun est 7.", "7x + 14 = 7(x + 2)."], ["factoriser"], "expression"),
      ex("calc-4", "Racine carrée", 3, "Simplifier √98.", ["98 = 49 × 2.", "√98 = √49 × √2 = 7√2."], ["racines"], "expression"),
      ex("calc-5", "Choisir une forme", 4, "On donne A(x) = (x - 2)(x + 5). Quelle forme permet de résoudre A(x)=0 ? Résoudre.", ["La forme factorisée est adaptée à une équation produit nul.", "A(x)=0 équivaut à x - 2 = 0 ou x + 5 = 0.", "Les solutions sont 2 et -5."], ["forme adaptée"], "expression"),
    ],
    quiz: [
      q("calc-q1", "Développer signifie...", ["transformer une somme en produit", "transformer un produit en somme", "arrondir", "tracer"], 1, "C'est le passage produit vers somme."),
      q("calc-q2", "(a + b)^2 vaut...", ["a^2 + b^2", "a^2 + 2ab + b^2", "a^2 - b^2", "2a + 2b"], 1, "Le double produit 2ab est indispensable."),
      q("calc-q3", "√49 vaut...", ["-7", "7", "±7", "49"], 1, "La racine carrée désigne le nombre positif."),
      q("calc-q4", "La forme factorisée est souvent utile pour...", ["résoudre une équation produit nul", "additionner des fractions", "lire une ordonnée à l'origine", "calculer une moyenne"], 0, "Un produit est nul si l'un de ses facteurs est nul."),
    ],
    cards: [
      card("calc-f1", "Développer", "Transformer un produit en somme.", "définition"),
      card("calc-f2", "Factoriser", "Transformer une somme en produit.", "définition"),
      card("calc-f3", "Piège classique", "(a + b)^2 n'est pas égal à a^2 + b^2.", "erreur"),
      card("calc-f4", "Racine carrée", "√a est le nombre positif dont le carré vaut a, pour a ≥ 0.", "définition"),
    ],
    coverage: ["puissances entières", "racines carrées", "identités remarquables", "factorisation", "expressions fractionnaires simples", "choix de forme"],
  },
  {
    slug: "equations-inequations",
    order: 4,
    title: "Équations, inéquations et modélisation",
    theme: "Algèbre",
    domain: "algebre",
    description: "Résoudre des équations et inéquations simples, modéliser un problème et isoler une variable.",
    duration: "5 semaines",
    tags: ["équations", "inéquations", "modélisation"],
    prerequisites: ["calcul littéral", "priorités opératoires", "droite numérique"],
    competencies: ["modéliser", "calculer", "communiquer"],
    objectives: [
      "Résoudre une équation du premier degré.",
      "Résoudre une inéquation du premier degré.",
      "Résoudre x^2 = a selon le signe de a.",
      "Isoler une variable dans une formule simple.",
    ],
    vocab: ["équation", "inéquation", "solution", "membre", "variable", "modéliser", "ensemble de solutions"],
    discovery: "Une salle facture un forfait puis un prix par heure. On cherche à partir de quelle durée l'offre A devient moins chère que l'offre B : l'inéquation donne la zone de choix.",
    definitions: [
      "Résoudre une équation, c'est trouver toutes les valeurs de la variable qui rendent l'égalité vraie.",
      "Résoudre une inéquation, c'est trouver toutes les valeurs qui rendent l'inégalité vraie.",
      "Modéliser consiste à traduire une situation par une expression, une équation ou une inéquation.",
    ],
    properties: [
      "On peut ajouter ou soustraire un même nombre aux deux membres d'une inégalité sans changer son sens.",
      "Multiplier une inégalité par un nombre négatif inverse son sens.",
      "Si a > 0, l'équation x^2 = a a deux solutions : -√a et √a.",
    ],
    methods: [
      "Pour une équation du premier degré, regrouper les termes en x d'un côté et les nombres de l'autre.",
      "Pour une inéquation, noter à chaque étape si on multiplie ou divise par un nombre négatif.",
      "Pour modéliser, définir clairement la variable avant d'écrire l'équation.",
    ],
    examples: [
      "3x + 5 = 2x - 7 donne x = -12.",
      "-2x + 1 < 7 donne -2x < 6 puis x > -3 car on divise par -2.",
      "x^2 = 9 a pour solutions -3 et 3.",
    ],
    figure: "inequality",
    mistakes: [
      "Oublier d'inverser le sens d'une inégalité en divisant par un nombre négatif.",
      "Donner une seule solution à x^2 = a quand a > 0.",
      "Commencer un problème sans définir la variable.",
    ],
    python: {
      title: "Tester une solution",
      code: "def verifie(x):\n    return 3*x + 5 == 2*x - 7\n\nfor valeur in range(-15, 1):\n    if verifie(valeur):\n        print(valeur)",
      explanation: "Le programme teste des valeurs entières et affiche celles qui vérifient l'équation.",
    },
    formulas: ["Si a > 0, x^2 = a a pour solutions -√a et √a.", "Si on multiplie une inégalité par un réel négatif, on inverse le sens."],
    related: ["calcul-litteral-puissances-racines", "fonctions-generalites"],
    exercises: [
      ex("eq-1", "Équation simple", 1, "Résoudre 4x - 3 = 13.", ["4x = 16.", "x = 4.", "La solution est 4."], ["équation"], "number"),
      ex("eq-2", "Équation avec x des deux côtés", 2, "Résoudre 5x + 2 = 2x - 10.", ["5x - 2x = -10 - 2.", "3x = -12.", "x = -4."], ["équation"], "number"),
      ex("eq-3", "Inéquation", 2, "Résoudre -3x + 6 ≥ 12.", ["-3x ≥ 6.", "On divise par -3, donc on inverse le sens.", "x ≤ -2."], ["inéquation"], "expression"),
      ex("eq-4", "Carré", 3, "Résoudre x^2 = 25.", ["25 est positif.", "Les solutions sont -√25 et √25.", "Donc x = -5 ou x = 5."], ["équation carré"], "expression"),
      ex("eq-5", "Modéliser", 4, "Un abonnement coûte 12 € puis 3 € par séance. À partir de combien de séances le coût dépasse-t-il 30 € ?", ["On note n le nombre de séances.", "Le coût vaut 12 + 3n.", "On résout 12 + 3n > 30, soit 3n > 18, donc n > 6.", "Le coût dépasse 30 € à partir de 7 séances."], ["modélisation"], "text"),
    ],
    quiz: [
      q("eq-q1", "Résoudre une équation, c'est chercher...", ["une figure", "toutes les valeurs qui vérifient l'égalité", "la plus grande valeur seulement", "une unité"], 1, "Une équation peut avoir zéro, une ou plusieurs solutions."),
      q("eq-q2", "Quand on divise une inégalité par -5, on doit...", ["garder le sens", "inverser le sens", "supprimer la variable", "ajouter 5"], 1, "La division par un nombre négatif inverse l'ordre."),
      q("eq-q3", "Les solutions de x² = 16 sont...", ["4 seulement", "-4 seulement", "-4 et 4", "8"], 2, "Deux nombres ont pour carré 16."),
      q("eq-q4", "Avant de modéliser un problème, il faut souvent...", ["choisir la couleur", "définir la variable", "effacer les données", "faire un graphique obligatoire"], 1, "La variable donne le sens de l'expression écrite."),
    ],
    cards: [
      card("eq-f1", "Équation", "Égalité contenant une inconnue dont on cherche les valeurs possibles.", "définition"),
      card("eq-f2", "Inéquation et nombre négatif", "Multiplier ou diviser par un nombre négatif inverse le sens de l'inégalité.", "méthode"),
      card("eq-f3", "Équation x² = a", "Si a > 0, les solutions sont -√a et √a ; si a = 0, la solution est 0 ; si a < 0, pas de solution réelle.", "propriété"),
      card("eq-f4", "Modélisation", "Définir la variable avant d'écrire une équation.", "méthode"),
    ],
    coverage: ["équations du premier degré", "inéquations du premier degré", "équation x² = a", "isoler une variable", "modélisation par inéquation"],
  },
  {
    slug: "fonctions-generalites",
    order: 5,
    title: "Fonctions : langage, courbes et modélisation",
    theme: "Fonctions",
    domain: "analyse",
    description: "Définir une fonction, lire images et antécédents, exploiter une courbe ou une formule.",
    duration: "4 semaines",
    tags: ["fonction", "image", "antécédent", "courbe"],
    prerequisites: ["repère", "lecture graphique", "calcul littéral simple"],
    competencies: ["représenter", "modéliser", "communiquer"],
    objectives: [
      "Utiliser le vocabulaire image, antécédent, variable et courbe représentative.",
      "Exploiter une formule y = f(x).",
      "Lire graphiquement des images et des antécédents.",
      "Modéliser une situation par une fonction.",
    ],
    vocab: ["fonction", "variable", "image", "antécédent", "ensemble de définition", "courbe représentative"],
    discovery: "La hauteur d'eau dans une cuve dépend du temps. À chaque instant, on associe une hauteur : cette dépendance se décrit par une fonction.",
    definitions: [
      "Une fonction associe à chaque valeur de la variable au plus une image.",
      "L'image de x par f se note f(x).",
      "La courbe d'équation y = f(x) est l'ensemble des points de coordonnées (x ; f(x)).",
    ],
    properties: [
      "Un point M(x ; y) appartient à la courbe de f si et seulement si y = f(x).",
      "Un antécédent de k par f est une valeur x telle que f(x) = k.",
      "L'ensemble de définition contient les valeurs de x pour lesquelles f(x) existe.",
    ],
    methods: [
      "Pour calculer une image, remplacer x par la valeur donnée dans la formule.",
      "Pour tester un point, remplacer x dans f(x) et comparer avec l'ordonnée du point.",
      "Pour lire un antécédent sur un graphique, partir de l'ordonnée et rejoindre la courbe puis l'axe des abscisses.",
    ],
    examples: [
      "Si f(x) = 2x + 3, alors f(4) = 11.",
      "Le point A(2 ; 7) appartient à la courbe de f(x)=2x+3 car f(2)=7.",
    ],
    figure: "function",
    mistakes: [
      "Confondre f(2), qui est un nombre, et f, qui est la fonction.",
      "Dire qu'une courbe est une fonction.",
      "Lire l'image sur l'axe des abscisses au lieu de l'axe des ordonnées.",
    ],
    python: {
      title: "Une fonction Python comme programme de calcul",
      code: "def f(x):\n    return 2*x + 3\n\nfor x in [-1, 0, 2, 4]:\n    print(x, f(x))",
      explanation: "La fonction Python reçoit un argument x et renvoie son image par le programme de calcul.",
    },
    formulas: ["M(x ; y) appartient à Cf équivaut à y = f(x).", "f(a) est l'image de a."],
    related: ["fonctions-reference-variations", "droites-plan"],
    exercises: [
      ex("fg-1", "Calculer une image", 1, "Soit f(x)=3x-2. Calculer f(5).", ["f(5)=3×5-2.", "f(5)=15-2=13."], ["image"], "number"),
      ex("fg-2", "Tester un point", 2, "Le point A(4 ; 10) appartient-il à la courbe de f(x)=2x+1 ?", ["f(4)=2×4+1=9.", "L'ordonnée du point est 10.", "A n'appartient pas à la courbe."], ["courbe"], "text"),
      ex("fg-3", "Antécédent", 2, "Trouver un antécédent de 7 par f(x)=x+4.", ["On résout x + 4 = 7.", "x = 3.", "3 est un antécédent de 7."], ["antécédent"], "number"),
      ex("fg-4", "Domaine", 3, "Pour g(x)=1/(x-2), quelle valeur de x est interdite ?", ["Le dénominateur ne doit pas être nul.", "x - 2 = 0 donne x = 2.", "La valeur interdite est 2."], ["ensemble de définition"], "number"),
      ex("fg-5", "Modéliser", 4, "Un taxi coûte 4 € de prise en charge puis 1,80 € par km. Écrire la fonction donnant le prix P(x) pour x km.", ["La partie fixe est 4.", "La partie proportionnelle à la distance est 1,80x.", "P(x)=4+1,80x."], ["modélisation"], "expression"),
    ],
    quiz: [
      q("fg-q1", "f(3) désigne...", ["la fonction entière", "l'image de 3 par f", "un antécédent obligatoire", "l'axe vertical"], 1, "f(3) est un nombre."),
      q("fg-q2", "Un antécédent de k est une valeur x telle que...", ["x = k + 1", "f(x)=k", "f(k)=x toujours", "x est positif"], 1, "C'est la définition."),
      q("fg-q3", "Le point (a ; b) est sur la courbe de f si...", ["a=b", "b=f(a)", "a=f(b)", "f(a)=0"], 1, "L'ordonnée doit être l'image de l'abscisse."),
      q("fg-q4", "Une fonction peut être donnée par...", ["une formule", "un tableau", "une courbe", "toutes ces réponses"], 3, "Plusieurs registres sont utilisés."),
    ],
    cards: [
      card("fg-f1", "Image", "L'image de a par f est le nombre f(a).", "définition"),
      card("fg-f2", "Antécédent", "Un antécédent de k est une valeur x telle que f(x)=k.", "définition"),
      card("fg-f3", "Tester un point", "Calculer f(x) puis comparer avec l'ordonnée y du point.", "méthode"),
      card("fg-f4", "Erreur fréquente", "Une courbe représente une fonction, mais ce n'est pas la fonction elle-même.", "erreur"),
    ],
    coverage: ["notion de fonction", "image et antécédent", "courbe y=f(x)", "ensemble de définition", "modélisation"],
  },
  {
    slug: "fonctions-reference-variations",
    order: 6,
    title: "Fonctions de référence, signes et variations",
    theme: "Fonctions",
    domain: "analyse",
    description: "Fonctions affine, carré, inverse, racine carrée, cube et valeur absolue, avec signes et variations.",
    duration: "6 semaines",
    tags: ["fonctions de référence", "variations", "signe", "tableau"],
    prerequisites: ["fonctions généralités", "équations", "repère"],
    competencies: ["représenter", "raisonner", "calculer"],
    objectives: [
      "Reconnaître les fonctions de référence du programme.",
      "Relier courbe, signe et variations.",
      "Construire un tableau de signes simple.",
      "Résoudre graphiquement ou algébriquement f(x)=k et f(x)<k.",
    ],
    vocab: ["croissante", "décroissante", "maximum", "minimum", "tableau de variations", "tableau de signes", "fonction affine"],
    discovery: "On compare trois programmes de calcul. Leurs courbes n'ont pas la même forme : droite, parabole, hyperbole. Les formes deviennent des repères mentaux.",
    definitions: [
      "Une fonction est croissante sur un intervalle lorsque les images sont rangées dans le même ordre que les nombres de départ.",
      "Un maximum est la plus grande valeur atteinte par la fonction sur un ensemble donné.",
      "Le signe d'une fonction indique où ses images sont positives, négatives ou nulles.",
    ],
    properties: [
      "La fonction affine f(x)=mx+p est croissante si m>0, décroissante si m<0 et constante si m=0.",
      "La fonction carré est décroissante sur ]-∞ ; 0] et croissante sur [0 ; +∞[.",
      "La fonction inverse est décroissante sur ]-∞ ; 0[ et sur ]0 ; +∞[.",
      "La fonction valeur absolue est positive et admet un minimum égal à 0 en 0.",
    ],
    methods: [
      "Pour résoudre f(x)=k graphiquement, chercher les intersections de la courbe avec la droite horizontale y=k.",
      "Pour faire un tableau de signes d'un produit, repérer les zéros de chaque facteur puis combiner les signes.",
      "Pour comparer f(a) et f(b), utiliser les variations lorsque a et b sont dans le même intervalle de monotonie.",
    ],
    examples: [
      "Pour f(x)=2x-6, f(x)>0 équivaut à x>3.",
      "x^2=4 a deux solutions visibles sur la parabole : -2 et 2.",
      "La fonction carré a pour minimum 0 en x=0.",
    ],
    figure: "reference",
    mistakes: [
      "Dire que la fonction carré est croissante sur tout ℝ.",
      "Mélanger le signe de f(x) et le sens de variation de f.",
      "Oublier que la fonction inverse n'est pas définie en 0.",
    ],
    python: {
      title: "Chercher un minimum par balayage",
      code: "def f(x):\n    return (x - 2)**2 + 1\n\nmeilleur_x = -5\nfor k in range(-50, 51):\n    x = k / 10\n    if f(x) < f(meilleur_x):\n        meilleur_x = x\nprint(meilleur_x, f(meilleur_x))",
      explanation: "Le balayage teste des valeurs espacées de 0,1 et garde la meilleure valeur trouvée.",
    },
    formulas: ["f(x)=mx+p : m donne le sens de variation.", "x^2 ≥ 0 pour tout réel x.", "|x| ≥ 0 pour tout réel x."],
    related: ["fonctions-generalites", "calcul-litteral-puissances-racines"],
    exercises: [
      ex("fr-1", "Fonction affine", 1, "La fonction f(x)=-2x+5 est-elle croissante ou décroissante ?", ["Le coefficient directeur vaut -2.", "Il est négatif.", "La fonction est décroissante."], ["affine"], "text"),
      ex("fr-2", "Résolution graphique mentale", 2, "Résoudre x^2 = 9.", ["La fonction carré vaut 9 pour x = -3 et x = 3.", "Les solutions sont -3 et 3."], ["carré"], "expression"),
      ex("fr-3", "Signe affine", 2, "Étudier le signe de 4x - 8.", ["4x - 8 = 0 donne x=2.", "Comme le coefficient 4 est positif, l'expression est négative avant 2 et positive après 2.", "Elle est nulle en 2."], ["signe"], "text"),
      ex("fr-4", "Comparer avec les variations", 3, "Comparer (-1)^2 et (-3)^2 en utilisant les variations de la fonction carré sur ]-∞ ; 0].", ["Sur ]-∞ ; 0], la fonction carré est décroissante.", "-3 < -1 donc f(-3) > f(-1).", "Ainsi 9 > 1."], ["variations"], "text"),
      ex("fr-5", "Tableau de signes", 4, "Déterminer le signe de (x-1)(x+2).", ["Les zéros sont -2 et 1.", "Le produit est positif à l'extérieur des racines et négatif entre elles.", "Il est positif sur ]-∞;-2] ∪ [1;+∞[ et négatif sur [-2;1]."], ["produit"], "text"),
    ],
    quiz: [
      q("fr-q1", "Si m<0, la fonction affine f(x)=mx+p est...", ["croissante", "décroissante", "toujours positive", "non définie"], 1, "Le signe de m donne le sens de variation."),
      q("fr-q2", "La fonction carré est décroissante sur...", ["tout ℝ", "[0;+∞[", "]-∞;0]", "aucun intervalle"], 2, "À gauche de 0, les carrés diminuent quand x augmente."),
      q("fr-q3", "La fonction inverse n'est pas définie en...", ["-1", "0", "1", "2"], 1, "On ne divise pas par zéro."),
      q("fr-q4", "Un tableau de signes sert à savoir où f(x) est...", ["positive, nulle ou négative", "croissante seulement", "continue", "paire"], 0, "Il organise le signe selon les intervalles."),
    ],
    cards: [
      card("fr-f1", "Fonction affine", "f(x)=mx+p ; m est le coefficient directeur et p l'ordonnée à l'origine.", "définition"),
      card("fr-f2", "Fonction carré", "Elle est décroissante sur ]-∞;0] et croissante sur [0;+∞[.", "propriété"),
      card("fr-f3", "Tableau de signes", "Il indique où une expression est positive, négative ou nulle.", "méthode"),
      card("fr-f4", "Erreur fréquente", "Le signe d'une fonction n'est pas son sens de variation.", "erreur"),
    ],
    coverage: ["fonctions affines", "fonctions valeur absolue, carré, inverse, racine carrée, cube", "signes", "tableaux de signes", "variations", "extrémums", "optimisation"],
  },
  {
    slug: "geometrie-reperee-vecteurs",
    order: 7,
    title: "Géométrie repérée et vecteurs",
    theme: "Géométrie",
    domain: "geometrie",
    description: "Coordonnées, distance, milieu, vecteurs, norme, colinéarité et déterminant.",
    duration: "6 semaines",
    tags: ["repère", "vecteurs", "distance", "milieu", "colinéarité"],
    prerequisites: ["repère orthogonal", "coordonnées de points", "théorème de Pythagore"],
    competencies: ["représenter", "calculer", "raisonner"],
    objectives: [
      "Calculer les coordonnées d'un vecteur.",
      "Calculer une distance et le milieu d'un segment.",
      "Utiliser les coordonnées pour additionner des vecteurs.",
      "Caractériser alignement et parallélisme par colinéarité.",
    ],
    vocab: ["vecteur", "représentant", "vecteur nul", "coordonnées", "norme", "déterminant", "colinéarité", "milieu"],
    discovery: "Un déplacement sur une carte peut être décrit par le même vecteur même s'il part d'un autre point : ce qui compte est le déplacement horizontal et vertical.",
    definitions: [
      "Deux vecteurs sont égaux lorsqu'ils ont même direction, même sens et même norme.",
      "Dans un repère, le vecteur AB a pour coordonnées (xB - xA ; yB - yA).",
      "Deux vecteurs sont colinéaires lorsqu'ils ont la même direction ou des directions parallèles.",
    ],
    properties: [
      "La distance AB vaut √((xB-xA)^2 + (yB-yA)^2) dans un repère orthonormé.",
      "Le milieu de [AB] a pour coordonnées ((xA+xB)/2 ; (yA+yB)/2).",
      "Les vecteurs (x ; y) et (x' ; y') sont colinéaires si xy' - yx' = 0.",
    ],
    methods: [
      "Pour calculer AB, soustraire les coordonnées de A à celles de B.",
      "Pour prouver un alignement, montrer que deux vecteurs construits avec les points sont colinéaires.",
      "Pour représenter une somme de vecteurs, placer des représentants de même origine ou utiliser les coordonnées.",
    ],
    examples: [
      "Si A(1 ; 2) et B(5 ; -1), alors AB a pour coordonnées (4 ; -3) et AB=5.",
      "Les vecteurs u(2 ; 3) et v(4 ; 6) sont colinéaires car 2×6 - 3×4 = 0.",
    ],
    figure: "vector",
    mistakes: [
      "Confondre coordonnées d'un point et coordonnées d'un vecteur.",
      "Oublier les parenthèses dans la formule de distance.",
      "Conclure à l'alignement avec des vecteurs qui ne partagent pas les bons points.",
    ],
    python: {
      title: "Tester la colinéarité",
      code: "def colineaires(u, v):\n    return u[0]*v[1] - u[1]*v[0] == 0\n\nprint(colineaires((2, 3), (4, 6)))",
      explanation: "Le déterminant nul caractérise la colinéarité en repère orthonormé.",
    },
    formulas: ["AB(xB-xA ; yB-yA)", "AB = √((xB-xA)^2 + (yB-yA)^2)", "det(u,v)=xy' - yx'"],
    related: ["droites-plan", "fonctions-generalites"],
    exercises: [
      ex("vec-1", "Coordonnées d'un vecteur", 1, "A(2 ; -1) et B(5 ; 3). Calculer les coordonnées de AB.", ["AB = (xB-xA ; yB-yA).", "AB = (5-2 ; 3-(-1)) = (3 ; 4)."], ["vecteur"], "expression"),
      ex("vec-2", "Distance", 2, "Calculer la distance entre A(1 ; 1) et B(4 ; 5).", ["AB = √((4-1)^2+(5-1)^2).", "AB = √(9+16)=√25=5."], ["distance"], "number"),
      ex("vec-3", "Milieu", 2, "Calculer le milieu de A(-2 ; 4) et B(6 ; 0).", ["xI=(-2+6)/2=2.", "yI=(4+0)/2=2.", "Le milieu est I(2 ; 2)."], ["milieu"], "expression"),
      ex("vec-4", "Colinéarité", 3, "Les vecteurs u(3 ; -2) et v(6 ; -4) sont-ils colinéaires ?", ["det(u,v)=3×(-4)-(-2)×6.", "det(u,v)=-12+12=0.", "Ils sont colinéaires."], ["déterminant"], "text"),
      ex("vec-5", "Alignement", 4, "A(0 ; 1), B(2 ; 5), C(3 ; 7). Les points sont-ils alignés ?", ["AB=(2 ; 4) et AC=(3 ; 6).", "det(AB,AC)=2×6-4×3=12-12=0.", "Les vecteurs sont colinéaires, donc A, B et C sont alignés."], ["alignement"], "text"),
    ],
    quiz: [
      q("vec-q1", "Les coordonnées de AB sont...", ["(xA+xB ; yA+yB)", "(xB-xA ; yB-yA)", "(xA-xB ; yA-yB)", "(xA×xB ; yA×yB)"], 1, "On va de A vers B."),
      q("vec-q2", "La norme de u(3 ; 4) vaut...", ["7", "1", "5", "12"], 2, "√(3²+4²)=5."),
      q("vec-q3", "Deux vecteurs sont colinéaires si leur déterminant est...", ["égal à 1", "nul", "positif", "négatif"], 1, "Le déterminant nul est le critère de colinéarité."),
      q("vec-q4", "Le milieu de A(0;2) et B(4;6) est...", ["(4;8)", "(2;4)", "(1;3)", "(0;4)"], 1, "On moyenne les coordonnées."),
    ],
    cards: [
      card("vec-f1", "Coordonnées de AB", "(xB-xA ; yB-yA).", "formule"),
      card("vec-f2", "Distance AB", "AB = √((xB-xA)^2 + (yB-yA)^2).", "formule"),
      card("vec-f3", "Colinéarité", "Deux vecteurs (x;y) et (x';y') sont colinéaires si xy' - yx' = 0.", "propriété"),
      card("vec-f4", "Erreur fréquente", "Un point a des coordonnées de position ; un vecteur a des coordonnées de déplacement.", "erreur"),
    ],
    coverage: ["coordonnées de vecteurs", "norme", "distance", "milieu", "déterminant", "colinéarité", "alignement", "parallélisme"],
  },
  {
    slug: "droites-plan",
    order: 8,
    title: "Droites du plan",
    theme: "Géométrie",
    domain: "geometrie",
    description: "Équations de droites, pente, vecteur directeur, parallélisme et intersection.",
    duration: "5 semaines",
    tags: ["droites", "pente", "équation cartésienne", "équation réduite"],
    prerequisites: ["fonctions affines", "vecteurs", "résolution d'équations"],
    competencies: ["représenter", "calculer", "raisonner"],
    objectives: [
      "Déterminer une équation de droite à partir de données.",
      "Lire une pente ou un vecteur directeur.",
      "Tracer une droite à partir de son équation.",
      "Déterminer le point d'intersection de deux droites sécantes.",
    ],
    vocab: ["droite", "équation réduite", "équation cartésienne", "pente", "coefficient directeur", "vecteur directeur", "sécantes", "parallèles"],
    discovery: "Deux forfaits de téléphone sont représentés par deux droites. Leur intersection indique le volume de données pour lequel les prix sont égaux.",
    definitions: [
      "Une équation réduite de droite non verticale s'écrit y = mx + p.",
      "m est la pente ou coefficient directeur et p l'ordonnée à l'origine.",
      "Une équation cartésienne de droite s'écrit ax + by + c = 0 avec a et b non tous deux nuls.",
    ],
    properties: [
      "Deux droites non verticales de même pente sont parallèles.",
      "Un vecteur directeur d'une droite ax + by + c = 0 est (-b ; a).",
      "Le point d'intersection de deux droites sécantes vérifie les deux équations.",
    ],
    methods: [
      "Avec deux points A et B, calculer la pente m=(yB-yA)/(xB-xA) si xA≠xB.",
      "Pour tracer y=mx+p, placer l'ordonnée à l'origine puis utiliser la pente.",
      "Pour une intersection, résoudre le système formé par les deux équations.",
    ],
    examples: [
      "La droite passant par A(0 ; 1) et B(2 ; 5) a pour pente 2, donc y=2x+1.",
      "Les droites y=3x-1 et y=3x+4 sont parallèles car elles ont la même pente.",
    ],
    figure: "line",
    mistakes: [
      "Utiliser la formule de la pente pour une droite verticale.",
      "Confondre pente et ordonnée à l'origine.",
      "Dire que deux droites de pentes différentes sont parallèles.",
    ],
    python: {
      title: "Équation réduite avec deux points",
      code: "def equation_reduite(A, B):\n    m = (B[1] - A[1]) / (B[0] - A[0])\n    p = A[1] - m * A[0]\n    return m, p\n\nprint(equation_reduite((0, 1), (2, 5)))",
      explanation: "On calcule d'abord la pente, puis p à partir d'un point de la droite.",
    },
    formulas: ["y = mx + p", "m = (yB-yA)/(xB-xA)", "ax + by + c = 0", "vecteur directeur (-b ; a)"],
    related: ["geometrie-reperee-vecteurs", "fonctions-reference-variations"],
    exercises: [
      ex("dr-1", "Lire une pente", 1, "Quelle est la pente de la droite y = -3x + 2 ?", ["Dans y=mx+p, la pente est m.", "Ici m=-3."], ["pente"], "number"),
      ex("dr-2", "Point sur une droite", 2, "Le point A(2 ; 7) appartient-il à la droite y=3x+1 ?", ["Pour x=2, 3x+1=7.", "L'ordonnée est 7.", "A appartient à la droite."], ["appartenance"], "text"),
      ex("dr-3", "Équation avec deux points", 3, "Déterminer l'équation réduite de la droite passant par A(0 ; -1) et B(3 ; 5).", ["m=(5-(-1))/(3-0)=6/3=2.", "Comme A a pour abscisse 0, p=-1.", "L'équation est y=2x-1."], ["équation"], "expression"),
      ex("dr-4", "Parallélisme", 3, "Les droites y=4x-2 et y=4x+9 sont-elles parallèles ?", ["Elles ont la même pente 4.", "Elles ont des ordonnées à l'origine différentes.", "Elles sont parallèles et distinctes."], ["parallélisme"], "text"),
      ex("dr-5", "Intersection", 4, "Trouver l'intersection de y=2x+1 et y=-x+7.", ["On résout 2x+1=-x+7.", "3x=6 donc x=2.", "y=2×2+1=5.", "Le point d'intersection est (2 ; 5)."], ["intersection"], "expression"),
    ],
    quiz: [
      q("dr-q1", "Dans y=mx+p, p est...", ["la pente", "l'ordonnée à l'origine", "l'abscisse à l'origine", "un vecteur"], 1, "p se lit sur l'axe des ordonnées."),
      q("dr-q2", "Deux droites non verticales de même pente sont...", ["perpendiculaires", "parallèles", "toujours confondues", "courbes"], 1, "La même direction donne le parallélisme."),
      q("dr-q3", "Un point d'intersection vérifie...", ["aucune équation", "une seule équation", "les deux équations", "seulement les pentes"], 2, "Il appartient aux deux droites."),
      q("dr-q4", "Un vecteur directeur de ax+by+c=0 est...", ["(a;b)", "(-b;a)", "(c;a)", "(p;m)"], 1, "C'est une direction de la droite."),
    ],
    cards: [
      card("dr-f1", "Équation réduite", "Une droite non verticale peut s'écrire y=mx+p.", "définition"),
      card("dr-f2", "Pente avec deux points", "m=(yB-yA)/(xB-xA) si xA≠xB.", "formule"),
      card("dr-f3", "Intersection", "Résoudre les deux équations simultanément.", "méthode"),
      card("dr-f4", "Erreur fréquente", "La formule de pente ne s'utilise pas si xA=xB.", "erreur"),
    ],
    coverage: ["vecteur directeur", "équation cartésienne", "équation réduite", "pente", "parallélisme", "sécantes", "intersection"],
  },
  {
    slug: "statistiques-information-chiffree",
    order: 9,
    title: "Statistiques et information chiffrée",
    theme: "Statistiques et probabilités",
    domain: "statistiques",
    description: "Proportions, évolutions, indicateurs statistiques, classes et tableaux croisés.",
    duration: "6 semaines",
    tags: ["statistiques", "pourcentages", "évolution", "écart type", "tableau croisé"],
    prerequisites: ["pourcentages", "moyenne", "médiane", "quartiles"],
    competencies: ["modéliser", "calculer", "communiquer"],
    objectives: [
      "Distinguer proportion et évolution.",
      "Calculer évolutions successives et réciproques.",
      "Interpréter moyenne, médiane, quartiles et écart type.",
      "Calculer des fréquences marginales et conditionnelles dans un tableau croisé.",
    ],
    vocab: ["effectif", "fréquence", "proportion", "taux d'évolution", "coefficient multiplicateur", "écart type", "fréquence conditionnelle"],
    discovery: "Deux articles indiquent +20 % puis -20 %. On vérifie que revenir au même pourcentage ne ramène pas forcément à la valeur initiale.",
    definitions: [
      "Une proportion compare une partie à un tout.",
      "Un taux d'évolution compare une variation à la valeur de départ.",
      "Une fréquence conditionnelle se calcule dans une sous-population définie par une condition.",
    ],
    properties: [
      "Augmenter de t % revient à multiplier par 1 + t/100.",
      "Des évolutions successives se composent en multipliant les coefficients multiplicateurs.",
      "La moyenne est sensible aux valeurs extrêmes ; la médiane l'est moins.",
    ],
    methods: [
      "Pour un pourcentage de pourcentage, appliquer successivement les deux proportions.",
      "Pour un taux global, multiplier les coefficients puis revenir au taux.",
      "Dans un tableau croisé, toujours préciser l'ensemble de référence avant de calculer une fréquence.",
    ],
    examples: [
      "30 % de 40 % d'une classe représente 0,30×0,40=0,12, soit 12 % de la classe.",
      "+10 % puis +20 % donne un coefficient global 1,10×1,20=1,32, soit +32 %.",
    ],
    figure: "stats",
    mistakes: [
      "Additionner des taux successifs au lieu de multiplier les coefficients.",
      "Confondre 20 % d'un groupe et 20 points de pourcentage.",
      "Calculer une fréquence conditionnelle avec le mauvais total.",
    ],
    python: {
      title: "Moyenne pondérée par classes",
      code: "centres = [5, 15, 25]\neffectifs = [4, 10, 6]\ntotal = sum(effectifs)\nmoyenne = sum(c*e for c, e in zip(centres, effectifs)) / total\nprint(moyenne)",
      explanation: "On utilise le centre de chaque classe comme valeur représentative lorsque la répartition est supposée uniforme.",
    },
    formulas: ["proportion = partie / tout", "coefficient = valeur finale / valeur initiale", "taux = coefficient - 1"],
    related: ["probabilites-conditionnelles", "algorithmique-python"],
    exercises: [
      ex("stat-1", "Proportion", 1, "Dans un groupe de 25 élèves, 10 pratiquent un sport. Calculer la proportion.", ["La proportion vaut 10/25.", "10/25=0,4.", "Cela représente 40 %."], ["proportion"], "number"),
      ex("stat-2", "Pourcentage de pourcentage", 2, "60 % des 200 élèves sont demi-pensionnaires. Parmi eux, 25 % prennent un fruit. Combien d'élèves cela représente-t-il ?", ["Demi-pensionnaires : 0,60×200=120.", "Prenant un fruit : 0,25×120=30.", "Cela représente 30 élèves."], ["proportions"], "number"),
      ex("stat-3", "Évolutions successives", 2, "Un prix augmente de 10 % puis baisse de 10 %. Quel est le coefficient global ?", ["Les coefficients sont 1,10 puis 0,90.", "Coefficient global : 1,10×0,90=0,99.", "Le prix final vaut 99 % du prix initial."], ["évolution"], "number"),
      ex("stat-4", "Moyenne pondérée", 3, "Une série a 5 valeurs de moyenne 12 et 15 valeurs de moyenne 16. Calculer la moyenne globale.", ["Somme du premier groupe : 5×12=60.", "Somme du second : 15×16=240.", "Total : 300 pour 20 valeurs, donc moyenne 15."], ["moyenne"], "number"),
      ex("stat-5", "Fréquence conditionnelle", 4, "Dans un tableau, 18 élèves sur 30 filles choisissent l'option A. Calculer la fréquence de l'option A parmi les filles.", ["L'ensemble de référence est le groupe des 30 filles.", "La fréquence conditionnelle vaut 18/30=0,6.", "Soit 60 %."], ["fréquence conditionnelle"], "number"),
    ],
    quiz: [
      q("stat-q1", "Une proportion compare...", ["une partie à un tout", "deux dates seulement", "deux droites", "une racine"], 0, "C'est partie divisé par tout."),
      q("stat-q2", "Augmenter de 15 % revient à multiplier par...", ["0,15", "1,15", "15", "0,85"], 1, "On ajoute 15 % à 100 %."),
      q("stat-q3", "Pour composer deux évolutions, on...", ["additionne toujours les taux", "multiplie les coefficients", "soustrait les valeurs", "calcule une médiane"], 1, "Les coefficients multiplicateurs se multiplient."),
      q("stat-q4", "Une fréquence conditionnelle dépend...", ["du total choisi comme référence", "uniquement de la moyenne", "d'une racine carrée", "d'une pente"], 0, "Le choix de la sous-population est essentiel."),
    ],
    cards: [
      card("stat-f1", "Proportion", "partie / tout.", "formule"),
      card("stat-f2", "Taux d'évolution", "(valeur finale - valeur initiale) / valeur initiale.", "formule"),
      card("stat-f3", "Évolutions successives", "Multiplier les coefficients multiplicateurs.", "méthode"),
      card("stat-f4", "Erreur fréquente", "Ne pas additionner automatiquement des pourcentages successifs.", "erreur"),
    ],
    coverage: ["proportions", "pourcentage de pourcentage", "évolutions successives", "évolution réciproque", "moyenne", "médiane", "quartiles", "écart type", "histogramme", "fréquences conditionnelles", "tableaux croisés"],
  },
  {
    slug: "probabilites-conditionnelles",
    order: 10,
    title: "Probabilités conditionnelles et arbres pondérés",
    theme: "Statistiques et probabilités",
    domain: "probabilites",
    description: "Modèles probabilistes, loi des grands nombres, probabilité conditionnelle et arbres pondérés.",
    duration: "5 semaines",
    tags: ["probabilités", "conditionnelle", "arbre", "simulation"],
    prerequisites: ["probabilité simple", "fractions", "tableaux croisés"],
    competencies: ["modéliser", "raisonner", "calculer"],
    objectives: [
      "Distinguer situation réelle et modèle probabiliste.",
      "Utiliser une probabilité conditionnelle.",
      "Construire et lire un arbre pondéré.",
      "Observer la loi des grands nombres par simulation.",
    ],
    vocab: ["expérience aléatoire", "issue", "événement", "probabilité conditionnelle", "arbre pondéré", "fréquence observée"],
    discovery: "Un test médical très fiable peut produire beaucoup de faux positifs si la maladie est rare. La question oblige à distinguer P(positif sachant malade) et P(malade sachant positif).",
    definitions: [
      "PA(B) est la probabilité de B sachant que A est réalisé, lorsque P(A) est non nulle.",
      "Un arbre pondéré représente les étapes d'une expérience aléatoire avec les probabilités sur les branches.",
      "La loi des grands nombres indique que, lorsque n est grand, la fréquence observée est généralement proche de la probabilité.",
    ],
    properties: [
      "La probabilité d'un chemin dans un arbre s'obtient en multipliant les probabilités des branches du chemin.",
      "Dans une situation d'équiprobabilité, P(A)=Card(A)/Card(Ω).",
      "PA(B) et PB(A) ne désignent pas la même probabilité.",
    ],
    methods: [
      "Pour lire un arbre, commencer par nommer l'événement de chaque niveau.",
      "Pour calculer une probabilité de chemin, multiplier les branches rencontrées.",
      "Pour éviter l'inversion de conditionnement, écrire en mots ce qui est connu après 'sachant'.",
    ],
    examples: [
      "Si P(A)=0,4 et PA(B)=0,25, alors la probabilité du chemin A puis B vaut 0,4×0,25=0,10.",
      "Dire PTest+(Malade) n'a pas le même sens que PMalade(Test+).",
    ],
    figure: "tree",
    mistakes: [
      "Confondre P(A sachant B) et P(B sachant A).",
      "Additionner les branches d'un même chemin au lieu de les multiplier.",
      "Présenter l'équiprobabilité comme une certitude démontrée plutôt que comme une hypothèse de modèle.",
    ],
    python: {
      title: "Simuler des lancers de pièce",
      code: "from random import random\n\ndef frequence_pile(n):\n    piles = 0\n    for k in range(n):\n        if random() < 0.5:\n            piles = piles + 1\n    return piles / n\n\nprint(frequence_pile(10000))",
      explanation: "Quand le nombre de répétitions augmente, la fréquence observée se rapproche souvent de 0,5.",
    },
    formulas: ["PA(B) : probabilité de B sachant A.", "P(chemin) = produit des probabilités des branches du chemin.", "P(A)=Card(A)/Card(Ω) en équiprobabilité."],
    related: ["statistiques-information-chiffree", "arithmetique-ensembles-logique"],
    exercises: [
      ex("proba-1", "Équiprobabilité", 1, "On lance un dé équilibré. Calculer la probabilité d'obtenir un nombre pair.", ["Les issues paires sont 2, 4 et 6.", "Il y a 3 issues favorables sur 6.", "La probabilité vaut 3/6 = 1/2."], ["équiprobabilité"], "expression"),
      ex("proba-2", "Chemin d'arbre", 2, "Dans un arbre, P(A)=0,3 et PA(B)=0,8. Calculer la probabilité du chemin A puis B.", ["On multiplie les probabilités des branches.", "0,3×0,8=0,24.", "La probabilité du chemin vaut 0,24."], ["arbre"], "number"),
      ex("proba-3", "Conditionnement", 2, "Traduire en mots PMalade(Positif).", ["L'événement après P est Positif.", "L'indice indique ce qui est supposé réalisé : Malade.", "C'est la probabilité d'avoir un test positif sachant que la personne est malade."], ["conditionnelle"], "text"),
      ex("proba-4", "Tableau croisé", 3, "Dans une population, 12 personnes portent des lunettes parmi 40 adultes. Calculer PAdulte(Lunettes).", ["On se place parmi les adultes : total 40.", "12 portent des lunettes.", "La probabilité conditionnelle vaut 12/40=0,3."], ["conditionnelle"], "number"),
      ex("proba-5", "Faux positifs", 4, "Un test est positif chez 95 % des malades. Peut-on en déduire que 95 % des tests positifs viennent de personnes malades ?", ["Non : on connaît PMalade(Positif).", "La question demande PPositif(Malade).", "Ces deux probabilités conditionnelles peuvent être très différentes."], ["inversion"], "text"),
    ],
    quiz: [
      q("proba-q1", "Dans un arbre, la probabilité d'un chemin se calcule en...", ["additionnant les branches", "multipliant les branches", "prenant la plus grande branche", "ignorant les branches"], 1, "Les branches successives d'un chemin se multiplient."),
      q("proba-q2", "PA(B) se lit...", ["probabilité de A sachant B", "probabilité de B sachant A", "probabilité de A ou B", "probabilité impossible"], 1, "L'indice indique la condition."),
      q("proba-q3", "La loi des grands nombres relie probabilité et...", ["fréquence observée", "pente", "racine", "équation de droite"], 0, "Les fréquences se stabilisent souvent près de la probabilité."),
      q("proba-q4", "En équiprobabilité, P(A) vaut...", ["Card(Ω)/Card(A)", "Card(A)/Card(Ω)", "Card(A)+Card(Ω)", "toujours 1/2"], 1, "Issues favorables sur issues possibles."),
    ],
    cards: [
      card("proba-f1", "PA(B)", "Probabilité de B sachant que A est réalisé.", "notation"),
      card("proba-f2", "Arbre pondéré", "Représentation des étapes d'une expérience aléatoire avec des probabilités sur les branches.", "définition"),
      card("proba-f3", "Chemin", "La probabilité d'un chemin est le produit des probabilités des branches.", "méthode"),
      card("proba-f4", "Erreur fréquente", "PA(B) et PB(A) sont généralement différents.", "erreur"),
    ],
    coverage: ["loi des grands nombres", "probabilité conditionnelle", "arbres pondérés", "tableaux et probabilités", "inversion de conditionnement", "faux positifs"],
  },
  {
    slug: "algorithmique-python",
    order: 11,
    title: "Algorithmique et programmation Python",
    theme: "Algorithmique",
    domain: "algorithmique",
    description: "Variables, affectations, conditions, boucles et fonctions Python au service des mathématiques.",
    duration: "4 semaines en spirale",
    tags: ["Python", "algorithme", "boucle", "fonction"],
    prerequisites: ["calcul numérique", "lecture d'instructions simples"],
    competencies: ["chercher", "calculer", "modéliser"],
    objectives: [
      "Choisir le type d'une variable.",
      "Écrire une affectation, une condition et une boucle.",
      "Écrire et appeler une fonction simple.",
      "Lire, compléter ou modifier un programme mathématique.",
    ],
    vocab: ["variable", "affectation", "booléen", "condition", "boucle bornée", "boucle non bornée", "fonction", "argument"],
    discovery: "Un programme de calcul répété à la main devient vite pénible. On le traduit en Python pour tester beaucoup de valeurs et observer un phénomène.",
    definitions: [
      "Une variable informatique porte un nom et contient une valeur.",
      "Une instruction conditionnelle exécute un bloc seulement si une condition est vraie.",
      "Une fonction Python reçoit des arguments et renvoie éventuellement un résultat.",
    ],
    properties: [
      "Une boucle for répète un bloc un nombre prévu de fois.",
      "Une boucle while répète un bloc tant qu'une condition reste vraie.",
      "Tester un programme sur des cas simples aide à vérifier sa cohérence.",
    ],
    methods: [
      "Avant de coder, écrire les entrées, les sorties et les étapes en langage naturel.",
      "Nommer les variables clairement : total, effectif, seuil, image.",
      "Après le codage, vérifier le résultat sur un exemple calculable à la main.",
    ],
    examples: [
      "Une fonction f(x)=2x+3 en mathématiques se traduit par def f(x): return 2*x + 3.",
      "Une simulation de probabilité utilise souvent random() pour produire une issue aléatoire.",
    ],
    figure: "algo",
    mistakes: [
      "Confondre = en Python, qui affecte une valeur, et l'égalité mathématique.",
      "Écrire une boucle while sans s'assurer qu'elle peut s'arrêter.",
      "Oublier d'appeler une fonction après l'avoir définie.",
    ],
    python: {
      title: "Fonction, condition et boucle",
      code: "def signe_affine(x):\n    y = 2*x - 6\n    if y > 0:\n        return \"positif\"\n    if y == 0:\n        return \"nul\"\n    return \"négatif\"\n\nfor x in range(1, 6):\n    print(x, signe_affine(x))",
      explanation: "Le programme calcule l'image par une fonction affine puis classe son signe.",
    },
    formulas: ["for : boucle bornée.", "while : boucle tant qu'une condition est vraie.", "def nom(arguments): définit une fonction."],
    related: ["fonctions-generalites", "probabilites-conditionnelles", "statistiques-information-chiffree"],
    exercises: [
      ex("algo-1", "Type de variable", 1, "Quel type Python convient pour stocker le texte 'seconde' ?", ["Un texte est une chaine de caractères.", "En Python, le type correspondant est str."], ["types"], "text"),
      ex("algo-2", "Affectation", 2, "Après x = 4 puis x = x + 3, quelle est la valeur de x ?", ["Au départ x vaut 4.", "La nouvelle valeur est l'ancienne valeur plus 3.", "x vaut 7."], ["affectation"], "number"),
      ex("algo-3", "Boucle bornée", 2, "Combien de lignes affiche for k in range(5): print(k) ?", ["range(5) donne 0,1,2,3,4.", "Il y a 5 valeurs.", "La boucle affiche 5 lignes."], ["boucle"], "number"),
      ex("algo-4", "Fonction", 3, "Écrire une fonction Python qui renvoie le carré de x.", ["On définit une fonction avec def.", "Le résultat est x*x ou x**2.", "def carre(x):\n    return x*x"], ["fonction"], "text"),
      ex("algo-5", "Condition", 4, "Compléter l'idée : pour tester si n est pair, on vérifie que...", ["On utilise le reste de la division par 2.", "n est pair si n % 2 == 0.", "Cette condition renvoie un booléen."], ["condition"], "text"),
    ],
    quiz: [
      q("algo-q1", "En Python, l'affectation s'écrit avec...", ["=", "==", "≠", "=>"], 0, "= affecte une valeur."),
      q("algo-q2", "Le test d'égalité s'écrit...", ["=", "==", ":=", "==="], 1, "== compare deux valeurs."),
      q("algo-q3", "Une boucle for est surtout adaptée quand...", ["on connaît le nombre de répétitions", "on ne code jamais", "on trace une droite", "on écrit une fraction"], 0, "C'est une boucle bornée."),
      q("algo-q4", "random() sert souvent à...", ["simuler une valeur aléatoire", "factoriser", "ouvrir un intervalle", "calculer une pente"], 0, "C'est utile pour les simulations probabilistes."),
    ],
    cards: [
      card("algo-f1", "Affectation", "x = 4 place la valeur 4 dans la variable x.", "définition"),
      card("algo-f2", "Condition", "if exécute un bloc si la condition est vraie.", "définition"),
      card("algo-f3", "Boucle while", "Elle se répète tant qu'une condition est vraie.", "définition"),
      card("algo-f4", "Erreur fréquente", "En Python, = affecte et == teste l'égalité.", "erreur"),
    ],
    coverage: ["types de variables", "affectation", "conditions", "boucles for et while", "fonctions Python", "simulation", "vérification de programme"],
  },
];

function ex(id, title, difficulty, statement, correction, skills, answerType) {
  return {
    id,
    chapterId: "",
    title,
    statement,
    consigne: statement,
    difficulty,
    difficultyLabel: ["Automatismes", "Application directe", "Méthode guidée", "Raisonnement", "Synthèse"][difficulty - 1] ?? "Entraînement",
    skills,
    prerequisites: [],
    estimatedTime: difficulty <= 2 ? 5 : difficulty === 3 ? 8 : 12,
    answerType,
    hints: {
      clue: "Repère la donnée qui déclenche la méthode du chapitre.",
      method: "Écris les étapes avant le résultat final.",
      reminder: skills.join(", "),
      commonMistake: "Ne saute pas l'étape de justification.",
    },
    correction,
    commonMistakes: ["Résultat donné sans justification.", "Notation imprécise."],
  };
}

function q(id, question, choices, answer, explanation) {
  return { id, type: "mcq", question, choices, answer, correctAnswer: answer, explanation, difficulty: 1, skills: [] };
}

function card(id, front, back, category) {
  return { id, front, back, category, difficulty: category === "erreur" ? 2 : 1, tags: [category] };
}

function figureSvg(kind, title) {
  const svgs = {
    set: `<svg viewBox="0 0 640 250" role="img" aria-labelledby="${kind}-title ${kind}-desc"><title id="${kind}-title">Intersection et réunion d'ensembles</title><desc id="${kind}-desc">Deux ensembles A et B se recoupent, avec la zone commune mise en évidence.</desc><rect width="640" height="250" fill="none"/><circle cx="270" cy="125" r="82" fill="#dbeafe" stroke="#2563eb" strokeWidth="3"/><circle cx="370" cy="125" r="82" fill="#dcfce7" stroke="#16a34a" strokeWidth="3"/><path d="M320 60 A82 82 0 0 1 320 190 A82 82 0 0 1 320 60" fill="#fde68a" opacity="0.85"/><text x="230" y="125" textAnchor="middle" fontWeight="700">A</text><text x="410" y="125" textAnchor="middle" fontWeight="700">B</text><text x="320" y="128" textAnchor="middle" fontWeight="700">A ∩ B</text><text x="320" y="225" textAnchor="middle">La réunion A ∪ B contient les deux disques.</text></svg>`,
    numberline: `<svg viewBox="0 0 680 210" role="img" aria-labelledby="${kind}-title ${kind}-desc"><title id="${kind}-title">Intervalle centré sur 3</title><desc id="${kind}-desc">Droite graduée montrant les solutions de valeur absolue entre 1 et 5.</desc><line x1="70" y1="105" x2="610" y2="105" stroke="#111827" strokeWidth="3"/><line x1="600" y1="96" x2="610" y2="105" stroke="#111827" strokeWidth="3"/><line x1="600" y1="114" x2="610" y2="105" stroke="#111827" strokeWidth="3"/><line x1="190" y1="105" x2="490" y2="105" stroke="#dc2626" strokeWidth="8"/><circle cx="190" cy="105" r="10" fill="#dc2626"/><circle cx="490" cy="105" r="10" fill="#dc2626"/><line x1="340" y1="80" x2="340" y2="130" stroke="#2563eb" strokeWidth="3"/><text x="190" y="150" textAnchor="middle">1</text><text x="340" y="70" textAnchor="middle" fontWeight="700">3</text><text x="490" y="150" textAnchor="middle">5</text><text x="340" y="185" textAnchor="middle">|x - 3| ≤ 2 correspond à [1 ; 5]</text></svg>`,
    algebra: `<svg viewBox="0 0 680 230" role="img" aria-labelledby="${kind}-title ${kind}-desc"><title id="${kind}-title">Choisir une forme algébrique</title><desc id="${kind}-desc">Trois formes d'une expression reliées à trois usages.</desc><rect x="55" y="45" width="165" height="70" rx="8" fill="#dbeafe" stroke="#2563eb"/><rect x="258" y="45" width="165" height="70" rx="8" fill="#dcfce7" stroke="#16a34a"/><rect x="461" y="45" width="165" height="70" rx="8" fill="#fef3c7" stroke="#d97706"/><text x="138" y="76" textAnchor="middle" fontWeight="700">Forme factorisée</text><text x="138" y="98" textAnchor="middle">résoudre</text><text x="341" y="76" textAnchor="middle" fontWeight="700">Forme développée</text><text x="341" y="98" textAnchor="middle">calculer</text><text x="544" y="76" textAnchor="middle" fontWeight="700">Forme réduite</text><text x="544" y="98" textAnchor="middle">comparer</text><text x="340" y="165" textAnchor="middle">(x - 2)(x + 5) = x² + 3x - 10</text></svg>`,
    inequality: `<svg viewBox="0 0 680 210" role="img" aria-labelledby="${kind}-title ${kind}-desc"><title id="${kind}-title">Solution d'une inéquation</title><desc id="${kind}-desc">Droite numérique montrant x inférieur ou égal à -2.</desc><line x1="80" y1="105" x2="600" y2="105" stroke="#111827" strokeWidth="3"/><line x1="190" y1="105" x2="80" y2="105" stroke="#2563eb" strokeWidth="8"/><circle cx="190" cy="105" r="11" fill="#2563eb"/><text x="190" y="145" textAnchor="middle">-2</text><text x="335" y="180" textAnchor="middle">x ≤ -2 : borne fermée, coloriage vers la gauche</text></svg>`,
    function: `<svg viewBox="0 0 680 300" role="img" aria-labelledby="${kind}-title ${kind}-desc"><title id="${kind}-title">Image et antécédent sur une courbe</title><desc id="${kind}-desc">Courbe affine avec lecture de l'image de 2.</desc><line x1="80" y1="240" x2="610" y2="240" stroke="#111827"/><line x1="120" y1="260" x2="120" y2="40" stroke="#111827"/><path d="M130 220 L570 60" stroke="#2563eb" strokeWidth="4" fill="none"/><line x1="320" y1="240" x2="320" y2="151" stroke="#dc2626" strokeDasharray="6 5"/><line x1="120" y1="151" x2="320" y2="151" stroke="#dc2626" strokeDasharray="6 5"/><circle cx="320" cy="151" r="7" fill="#dc2626"/><text x="320" y="264" textAnchor="middle">x=2</text><text x="95" y="155" textAnchor="end">f(2)</text><text x="430" y="95" fontWeight="700">y = f(x)</text></svg>`,
    reference: `<svg viewBox="0 0 680 320" role="img" aria-labelledby="${kind}-title ${kind}-desc"><title id="${kind}-title">Courbes de référence</title><desc id="${kind}-desc">Repère montrant une droite, une parabole et une courbe inverse stylisée.</desc><line x1="70" y1="250" x2="620" y2="250" stroke="#111827"/><line x1="340" y1="285" x2="340" y2="35" stroke="#111827"/><path d="M110 235 C210 205 280 115 340 80 C400 115 470 205 570 235" stroke="#2563eb" strokeWidth="4" fill="none"/><line x1="110" y1="260" x2="570" y2="80" stroke="#16a34a" strokeWidth="4"/><path d="M370 65 C430 95 475 140 585 205 M95 95 C210 115 265 160 310 235" stroke="#dc2626" strokeWidth="4" fill="none"/><text x="510" y="90" fill="#16a34a">affine</text><text x="455" y="225" fill="#2563eb">carré</text><text x="500" y="180" fill="#dc2626">inverse</text></svg>`,
    vector: `<svg viewBox="0 0 680 320" role="img" aria-labelledby="${kind}-title ${kind}-desc"><title id="${kind}-title">Vecteur dans un repère</title><desc id="${kind}-desc">Repère avec points A et B et vecteur AB.</desc><defs><marker id="arrow-vector" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto"><path d="M0,0 L0,6 L9,3 z" fill="#2563eb"/></marker></defs><line x1="70" y1="250" x2="620" y2="250" stroke="#111827"/><line x1="120" y1="285" x2="120" y2="35" stroke="#111827"/><g stroke="#e5e7eb">${gridLines()}</g><circle cx="220" cy="190" r="7" fill="#dc2626"/><circle cx="420" cy="90" r="7" fill="#dc2626"/><line x1="220" y1="190" x2="420" y2="90" stroke="#2563eb" strokeWidth="4" markerEnd="url(#arrow-vector)"/><text x="205" y="215">A</text><text x="430" y="85">B</text><text x="330" y="115" fontWeight="700">AB(4 ; 2)</text></svg>`,
    line: `<svg viewBox="0 0 680 300" role="img" aria-labelledby="${kind}-title ${kind}-desc"><title id="${kind}-title">Droites sécantes</title><desc id="${kind}-desc">Deux droites se coupent en un point d'intersection.</desc><line x1="70" y1="240" x2="620" y2="240" stroke="#111827"/><line x1="120" y1="270" x2="120" y2="40" stroke="#111827"/><line x1="100" y1="225" x2="590" y2="65" stroke="#2563eb" strokeWidth="4"/><line x1="110" y1="60" x2="570" y2="250" stroke="#16a34a" strokeWidth="4"/><circle cx="355" cy="142" r="8" fill="#dc2626"/><text x="365" y="135" fontWeight="700">Intersection</text><text x="480" y="78" fill="#2563eb">d₁</text><text x="515" y="238" fill="#16a34a">d₂</text></svg>`,
    stats: `<svg viewBox="0 0 680 300" role="img" aria-labelledby="${kind}-title ${kind}-desc"><title id="${kind}-title">Histogramme simplifié</title><desc id="${kind}-desc">Trois classes statistiques avec des hauteurs différentes.</desc><line x1="90" y1="245" x2="610" y2="245" stroke="#111827"/><line x1="100" y1="250" x2="100" y2="50" stroke="#111827"/><rect x="150" y="170" width="100" height="75" fill="#dbeafe" stroke="#2563eb"/><rect x="250" y="105" width="100" height="140" fill="#dcfce7" stroke="#16a34a"/><rect x="350" y="145" width="100" height="100" fill="#fef3c7" stroke="#d97706"/><text x="200" y="268" textAnchor="middle">[0;10[</text><text x="300" y="268" textAnchor="middle">[10;20[</text><text x="400" y="268" textAnchor="middle">[20;30[</text><text x="330" y="40" textAnchor="middle" fontWeight="700">Comparer les distributions</text></svg>`,
    tree: `<svg viewBox="0 0 680 300" role="img" aria-labelledby="${kind}-title ${kind}-desc"><title id="${kind}-title">Arbre pondéré</title><desc id="${kind}-desc">Arbre de probabilité à deux niveaux avec probabilités conditionnelles.</desc><circle cx="95" cy="150" r="6" fill="#111827"/><line x1="105" y1="150" x2="285" y2="85" stroke="#2563eb" strokeWidth="3"/><line x1="105" y1="150" x2="285" y2="215" stroke="#2563eb" strokeWidth="3"/><circle cx="295" cy="85" r="6" fill="#2563eb"/><circle cx="295" cy="215" r="6" fill="#2563eb"/><line x1="305" y1="85" x2="500" y2="50" stroke="#16a34a" strokeWidth="3"/><line x1="305" y1="85" x2="500" y2="120" stroke="#16a34a" strokeWidth="3"/><line x1="305" y1="215" x2="500" y2="180" stroke="#16a34a" strokeWidth="3"/><line x1="305" y1="215" x2="500" y2="250" stroke="#16a34a" strokeWidth="3"/><text x="190" y="95">P(A)</text><text x="190" y="210">P(A̅)</text><text x="400" y="55">PA(B)</text><text x="400" y="130">PA(B̅)</text><text x="400" y="185">PA̅(B)</text><text x="400" y="260">PA̅(B̅)</text><text x="555" y="54">B</text><text x="555" y="124">B̅</text><text x="555" y="184">B</text><text x="555" y="254">B̅</text></svg>`,
    algo: `<svg viewBox="0 0 680 270" role="img" aria-labelledby="${kind}-title ${kind}-desc"><title id="${kind}-title">Structure d'un algorithme</title><desc id="${kind}-desc">Schéma entrée, traitement, sortie.</desc><rect x="60" y="85" width="145" height="80" rx="8" fill="#dbeafe" stroke="#2563eb"/><rect x="268" y="85" width="145" height="80" rx="8" fill="#dcfce7" stroke="#16a34a"/><rect x="475" y="85" width="145" height="80" rx="8" fill="#fef3c7" stroke="#d97706"/><path d="M210 125 H260 M415 125 H468" stroke="#111827" strokeWidth="3"/><text x="132" y="118" textAnchor="middle" fontWeight="700">Entrées</text><text x="132" y="140" textAnchor="middle">données</text><text x="340" y="118" textAnchor="middle" fontWeight="700">Traitement</text><text x="340" y="140" textAnchor="middle">instructions</text><text x="548" y="118" textAnchor="middle" fontWeight="700">Sortie</text><text x="548" y="140" textAnchor="middle">résultat</text></svg>`,
  };
  return svgs[kind] ?? `<svg viewBox="0 0 600 200"><text x="300" y="100" textAnchor="middle">${escapeHtml(title)}</text></svg>`;
}

function gridLines() {
  let out = "";
  for (let x = 120; x <= 620; x += 50) out += `<line x1="${x}" y1="35" x2="${x}" y2="285"/>`;
  for (let y = 50; y <= 250; y += 50) out += `<line x1="70" y1="${y}" x2="620" y2="${y}"/>`;
  return out;
}

function course(chapter) {
  return `## Objectifs

${chapter.objectives.map((item) => `- ${mdxText(item)}`).join("\n")}

## Prérequis

${chapter.prerequisites.map((item) => `- ${mdxText(item)}`).join("\n")}

## Activité de découverte

${mdxText(chapter.discovery)}

## Vocabulaire

${chapter.vocab.map((item) => `- **${mdxText(item)}**`).join("\n")}

## Cours

### Définitions

${chapter.definitions.map((item) => `- ${mdxText(item)}`).join("\n")}

### Propriétés

${chapter.properties.map((item) => `- ${mdxText(item)}`).join("\n")}

### Méthodes

${chapter.methods.map((item, index) => `${index + 1}. ${mdxText(item)}`).join("\n")}

## Exemples corrigés

${chapter.examples.map((item) => `- ${mdxText(item)}`).join("\n")}

<figure className="chapter-figure">
  ${figureSvg(chapter.figure, chapter.title)}
  <figcaption>${chapter.title} : représentation schématique à commenter avant les exercices.</figcaption>
</figure>

## Algorithmique en Python

### ${chapter.python.title}

\`\`\`python
${chapter.python.code}
\`\`\`

${mdxText(chapter.python.explanation)}

## Erreurs fréquentes

${chapter.mistakes.map((item) => `- ${mdxText(item)}`).join("\n")}

## Formules et idées à retenir

${chapter.formulas.map((item) => `- ${mdxText(item)}`).join("\n")}

## Synthèse

Ce chapitre sert à installer des automatismes, mais aussi à choisir une représentation adaptée : texte, formule, tableau, figure, graphique ou programme. Les exercices associés reprennent les cinq niveaux attendus : automatismes, application directe, méthode guidée, raisonnement et synthèse.
`;
}

function meta(chapter) {
  return {
    title: chapter.title,
    description: chapter.description,
    cycle: "lycee",
    niveau: "2nde",
    slug: chapter.slug,
    order: chapter.order,
    theme: chapter.theme,
    domain: chapter.domain,
    duration: chapter.duration,
    tags: chapter.tags,
    prerequisites: chapter.prerequisites,
    competencies: chapter.competencies,
    tools: chapter.python ? ["Python", "KaTeX", "SVG"] : ["KaTeX", "SVG"],
    relatedChapters: chapter.related,
    officialSource: source.id,
    xp: {
      course: 18,
      exercise: 5,
      exercice_all: 18,
      quiz_base: 8,
      quiz_per_correct: 2,
      quiz_perfect: 8,
      flashcards_base: 5,
      flashcard_known: 1,
    },
    seo: {
      title: `${chapter.title} - Mathématiques seconde`,
      description: chapter.description,
      canonical: `/mathematiques/lycee/2nde/${chapter.slug}`,
    },
  };
}

function matrixRows() {
  return chapters.flatMap((chapter) =>
    chapter.coverage.map((notion) => ({
      notion,
      chapter: chapter.title,
      slug: chapter.slug,
      cours: "oui",
      exercices: chapter.exercises.length,
      correction: "oui",
      quiz: chapter.quiz.length,
      flashcards: chapter.cards.length,
      figure: "SVG inline",
      statut: "couvert",
    }))
  );
}

function report() {
  const rows = matrixRows();
  return `# Section Mathématiques de seconde

## Rapport d'analyse initiale

- Le site utilise Astro avec des routes statiques dynamiques.
- La physique-chimie range ses chapitres dans \`src/data/chapters/{cycle}/{niveau}/{matiere}/{chapitre}/\` avec \`meta.json\`, \`cours.mdx\`, \`exercices.json\`, \`quiz.json\` et \`flashcards.json\`.
- La section mathématiques dispose déjà de routes dédiées : \`src/pages/mathematiques/lycee/[niveau]/index.astro\` et \`src/pages/mathematiques/lycee/[niveau]/[chapitre].astro\`.
- La section mathématiques attend les données dans \`src/data/mathematiques/chapters/{cycle}/{niveau}/{chapitre}/\`.
- Les lecteurs existants \`ExercicesPlayer\`, \`QuizPlayer\` et \`FlashcardsPlayer\` sont réutilisés pour conserver la cohérence du site.
- Les figures essentielles sont en SVG inline dans les cours MDX, afin d'éviter les images externes instables.
- Les quiz restent au format QCM compatible avec le moteur existant.

## Source officielle

- Titre : ${source.title}
- Institution : ${source.institution}
- Publication : ${source.bulletin}
- Application : ${source.application}
- URL : ${source.url}
- Annexe PDF : ${source.annexePdf}
- Date de consultation : ${source.consultedAt}

## Progression

${chapters.map((chapter) => `${chapter.order}. ${chapter.title} - ${chapter.theme}`).join("\n")}

## Arborescence créée

${chapters.map((chapter) => `- src/data/mathematiques/chapters/lycee/2nde/${chapter.slug}/
  - meta.json
  - cours.mdx
  - exercices.json
  - quiz.json
  - flashcards.json`).join("\n")}

## Tableau des modifications

| Chemin | Type | Fonction | Justification |
|---|---|---|---|
| src/data/mathematiques/levels.ts | modification | Libellé et description de seconde | Rendre la page niveau cohérente et corriger l'appel à deux paramètres |
| src/data/mathematiques/programmes/seconde-gt-2026.json | création | Référence officielle et progression | Tracer la source BO 2026 |
| src/data/mathematiques/chapters/lycee/2nde/* | création | Contenus de chapitres | Cours, exercices, quiz, flashcards et figures |
| docs/mathematiques-seconde-rapport.md | création | Rapport et matrice de couverture | Livrable demandé par le brief |
| scripts/generate-math-seconde.mjs | création | Génération reproductible | Garder des contenus homogènes et des identifiants stables |
| scripts/validate-math-seconde.mjs | création | Validation locale | Vérifier complétude, identifiants et données jouables |

## Matrice de couverture

| Notion officielle | Chapitre correspondant | Cours | Exercices | Correction | Quiz | Flashcards | Figure ou graphique | Statut |
|---|---|---:|---:|---|---:|---:|---|---|
${rows.map((row) => `| ${row.notion} | ${row.chapter} | ${row.cours} | ${row.exercices} | ${row.correction} | ${row.quiz} | ${row.flashcards} | ${row.figure} | ${row.statut} |`).join("\n")}

## Limites assumées

- Les parties transversales logique, automatismes et Python sont explicitées dans des chapitres dédiés et réinvesties dans les autres chapitres.
- Les quiz utilisent le format QCM compatible avec le moteur actuel ; les types association, classement ou saisie mathématique nécessiteraient une évolution du composant interactif.
- Les corrections sont intégrées et détaillées dans les données d'exercices, mais elles restent adaptées à un usage web synthétique.
`;
}

function escapeHtml(value) {
  return String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}

function mdxText(value) {
  return String(value).replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}

async function writeJson(file, data) {
  await writeFile(file, `${JSON.stringify(data, null, 2)}\n`, "utf8");
}

async function main() {
  await mkdir(base, { recursive: true });
  await mkdir(programDir, { recursive: true });
  await mkdir(docsDir, { recursive: true });

  const coverage = matrixRows();
  await writeJson(path.join(programDir, "seconde-gt-2026.json"), {
    source,
    progression: chapters.map((chapter) => ({
      slug: chapter.slug,
      title: chapter.title,
      theme: chapter.theme,
      order: chapter.order,
      coverage: chapter.coverage,
      relatedChapters: chapter.related,
    })),
    coverage,
  });

  for (const chapter of chapters) {
    const dir = path.join(base, chapter.slug);
    await mkdir(dir, { recursive: true });
    const chapterId = `lycee/2nde/${chapter.slug}`;
    const exercises = chapter.exercises.map((exercise) => ({
      ...exercise,
      chapterId,
      prerequisites: chapter.prerequisites,
    }));
    const quiz = chapter.quiz.map((question) => ({
      ...question,
      chapterId,
      skills: chapter.competencies,
    }));
    const cards = chapter.cards.map((flashcard) => ({
      ...flashcard,
      chapterId,
      tags: [...new Set([...(flashcard.tags ?? []), ...chapter.tags.slice(0, 2)])],
    }));
    await writeJson(path.join(dir, "meta.json"), meta(chapter));
    await writeFile(path.join(dir, "cours.mdx"), course(chapter), "utf8");
    await writeJson(path.join(dir, "exercices.json"), { exercices: exercises });
    await writeJson(path.join(dir, "quiz.json"), { questions: quiz });
    await writeJson(path.join(dir, "flashcards.json"), { cards });
  }

  await writeFile(path.join(docsDir, "mathematiques-seconde-rapport.md"), report(), "utf8");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
