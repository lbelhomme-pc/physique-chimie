const FUNCTIONS: Record<string, (value: number) => number> = {
  sqrt: Math.sqrt,
  sin: (value) => Math.sin(value * Math.PI / 180),
  cos: (value) => Math.cos(value * Math.PI / 180),
  tan: (value) => Math.tan(value * Math.PI / 180),
  log: Math.log10,
  ln: Math.log,
  abs: Math.abs,
};

const CONSTANTS: Record<string, number> = {
  pi: Math.PI,
  e: Math.E,
};

type Token =
  | { type: "number"; value: number }
  | { type: "identifier"; value: string }
  | { type: "operator"; value: "+" | "-" | "*" | "/" | "^" }
  | { type: "paren"; value: "(" | ")" }
  | { type: "comma" };

type OperatorTokenValue = Extract<Token, { type: "operator" }>["value"];

function tokenize(expression: string): Token[] {
  const source = String(expression ?? "")
    .replace(/,/g, ".")
    .replace(/×/g, "*")
    .replace(/÷/g, "/")
    .replace(/π/g, "pi")
    .replace(/√/g, "sqrt");
  const tokens: Token[] = [];
  let index = 0;
  while (index < source.length) {
    const char = source[index];
    if (/\s/.test(char)) {
      index += 1;
      continue;
    }
    const number = source.slice(index).match(/^(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?/i);
    if (number) {
      tokens.push({ type: "number", value: Number(number[0]) });
      index += number[0].length;
      continue;
    }
    const identifier = source.slice(index).match(/^[A-Za-z][A-Za-z0-9_]*/);
    if (identifier) {
      tokens.push({ type: "identifier", value: identifier[0].toLowerCase() });
      index += identifier[0].length;
      continue;
    }
    if ("+-*/^".includes(char)) {
      tokens.push({ type: "operator", value: char as OperatorTokenValue });
      index += 1;
      continue;
    }
    if (char === "(" || char === ")") {
      tokens.push({ type: "paren", value: char });
      index += 1;
      continue;
    }
    if (char === ";") throw new Error("Separateur non autorise");
    throw new Error("Caractere non autorise");
  }
  return tokens;
}

class Parser {
  private index = 0;
  private readonly tokens: Token[];

  constructor(tokens: Token[]) {
    this.tokens = tokens;
  }

  parse(): number {
    const value = this.parseAdditive();
    if (this.index !== this.tokens.length) throw new Error("Expression incomplete");
    if (!Number.isFinite(value)) throw new Error("Resultat non fini");
    return value;
  }

  private current(): Token | undefined {
    return this.tokens[this.index];
  }

  private consume(): Token {
    const token = this.tokens[this.index];
    if (!token) throw new Error("Expression incomplete");
    this.index += 1;
    return token;
  }

  private parseAdditive(): number {
    let value = this.parseMultiplicative();
    while (this.current()?.type === "operator" && (this.current() as Token & { type: "operator" }).value.match(/^[+-]$/)) {
      const op = (this.consume() as Token & { type: "operator" }).value;
      const right = this.parseMultiplicative();
      value = op === "+" ? value + right : value - right;
    }
    return value;
  }

  private parseMultiplicative(): number {
    let value = this.parsePower();
    while (this.current()?.type === "operator" && (this.current() as Token & { type: "operator" }).value.match(/^[*/]$/)) {
      const op = (this.consume() as Token & { type: "operator" }).value;
      const right = this.parsePower();
      value = op === "*" ? value * right : value / right;
    }
    return value;
  }

  private parsePower(): number {
    let value = this.parseUnary();
    if (this.current()?.type === "operator" && (this.current() as Token & { type: "operator" }).value === "^") {
      this.consume();
      value = value ** this.parsePower();
    }
    return value;
  }

  private parseUnary(): number {
    if (this.current()?.type === "operator") {
      const op = (this.current() as Token & { type: "operator" }).value;
      if (op === "+" || op === "-") {
        this.consume();
        const value = this.parseUnary();
        return op === "-" ? -value : value;
      }
    }
    return this.parsePrimary();
  }

  private parsePrimary(): number {
    const token = this.consume();
    if (token.type === "number") return token.value;
    if (token.type === "identifier") {
      if (token.value in CONSTANTS) return CONSTANTS[token.value];
      const next = this.consume();
      if (next.type !== "paren" || next.value !== "(") throw new Error("Fonction attendue");
      const argument = this.parseAdditive();
      const end = this.consume();
      if (end.type !== "paren" || end.value !== ")") throw new Error("Parenthese fermante attendue");
      const fn = FUNCTIONS[token.value];
      if (!fn) throw new Error("Fonction non autorisee");
      return fn(argument);
    }
    if (token.type === "paren" && token.value === "(") {
      const value = this.parseAdditive();
      const end = this.consume();
      if (end.type !== "paren" || end.value !== ")") throw new Error("Parenthese fermante attendue");
      return value;
    }
    throw new Error("Expression invalide");
  }
}

export function evaluateScientificExpression(expression: string): number {
  const parser = new Parser(tokenize(expression));
  return parser.parse();
}
