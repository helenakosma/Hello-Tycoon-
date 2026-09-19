/**
 * Java lexer (tokenizer) for the Hello, Tycoon! teaching interpreter.
 *
 * Turns Java source text into a flat list of tokens that parser.js consumes.
 * Every token carries its line/column so error messages can point a student at
 * the exact spot ("line 7, column 12") — which is the whole reason we wrote our
 * own instead of hacking regexes.
 *
 * TEACHERS: you shouldn't need to edit this file. It covers the Java syntax
 * used by the problem bank. If you add a problem needing syntax we don't
 * tokenize yet, students will see "I don't recognize the character ..." and
 * you'll know to extend KEYWORDS / OPERATORS below.
 */

export class JavaSyntaxError extends Error {
  constructor(message, line, col) {
    super(message);
    this.name = 'JavaSyntaxError';
    this.line = line;
    this.col = col;
    this.friendly = true; // safe to show a student verbatim
  }
}

/** Reserved words we understand. Anything else is treated as an identifier. */
const KEYWORDS = new Set([
  'class', 'interface', 'enum', 'extends', 'implements',
  'public', 'private', 'protected', 'static', 'final', 'abstract',
  'void', 'int', 'long', 'short', 'byte', 'double', 'float', 'boolean', 'char',
  'if', 'else', 'while', 'for', 'do', 'switch', 'case', 'default',
  'return', 'break', 'continue',
  'new', 'this', 'super', 'instanceof',
  'true', 'false', 'null',
  'import', 'package',
  'try', 'catch', 'finally', 'throw', 'throws',
]);

/**
 * Multi-character operators, listed LONGEST FIRST so ">>=" is matched before
 * ">>", which is matched before ">".
 */
const OPERATORS = [
  '>>>=', '<<=', '>>=', '>>>',
  '==', '!=', '<=', '>=', '&&', '||', '++', '--',
  '+=', '-=', '*=', '/=', '%=', '&=', '|=', '^=',
  '<<', '>>', '->', '::',
  '+', '-', '*', '/', '%', '=', '<', '>', '!', '&', '|', '^', '~', '?', ':',
  '(', ')', '{', '}', '[', ']', ';', ',', '.',
];

const isDigit = (c) => c >= '0' && c <= '9';
const isIdentStart = (c) => /[A-Za-z_$]/.test(c);
const isIdentPart = (c) => /[A-Za-z0-9_$]/.test(c);

/**
 * Resolve a backslash escape sequence.
 * @returns {{char: string, length: number}} length counts chars AFTER the backslash
 */
function readEscape(src, i, line, col) {
  const c = src[i];
  switch (c) {
    case 'n': return { char: '\n', length: 1 };
    case 't': return { char: '\t', length: 1 };
    case 'r': return { char: '\r', length: 1 };
    case 'b': return { char: '\b', length: 1 };
    case 'f': return { char: '\f', length: 1 };
    case '0': return { char: '\0', length: 1 };
    case '\\': return { char: '\\', length: 1 };
    case "'": return { char: "'", length: 1 };
    case '"': return { char: '"', length: 1 };
    case 'u': {
      const hex = src.slice(i + 1, i + 5);
      if (!/^[0-9a-fA-F]{4}$/.test(hex)) {
        throw new JavaSyntaxError('A \\u escape needs exactly 4 hex digits, like \\u0041.', line, col);
      }
      return { char: String.fromCharCode(parseInt(hex, 16)), length: 5 };
    }
    default:
      throw new JavaSyntaxError('I do not know the escape sequence \\' + c + '.', line, col);
  }
}

/**
 * Tokenize Java source.
 * @param {string} src
 * @returns {Array<{type:string, value:*, raw:string, line:number, col:number}>}
 */
export function tokenize(src) {
  const tokens = [];
  let i = 0;
  let line = 1;
  let col = 1;

  const push = (type, value, raw, tLine, tCol) =>
    tokens.push({ type, value, raw, line: tLine, col: tCol });

  const advance = (n = 1) => {
    for (let k = 0; k < n; k++) {
      if (src[i] === '\n') { line++; col = 1; } else { col++; }
      i++;
    }
  };

  while (i < src.length) {
    const c = src[i];

    // --- whitespace -------------------------------------------------------
    if (c === ' ' || c === '\t' || c === '\r' || c === '\n') { advance(); continue; }

    // --- comments ---------------------------------------------------------
    if (c === '/' && src[i + 1] === '/') {
      while (i < src.length && src[i] !== '\n') advance();
      continue;
    }
    if (c === '/' && src[i + 1] === '*') {
      const startLine = line, startCol = col;
      advance(2);
      let closed = false;
      while (i < src.length) {
        if (src[i] === '*' && src[i + 1] === '/') { advance(2); closed = true; break; }
        advance();
      }
      if (!closed) {
        throw new JavaSyntaxError('This /* comment is never closed - add a */ somewhere.', startLine, startCol);
      }
      continue;
    }

    const tLine = line, tCol = col;

    // --- numbers ----------------------------------------------------------
    if (isDigit(c) || (c === '.' && isDigit(src[i + 1]))) {
      let text = '';
      let isFloat = false;

      // Hex literal: 0x1F
      if (c === '0' && (src[i + 1] === 'x' || src[i + 1] === 'X')) {
        text = '0x';
        advance(2);
        while (i < src.length && /[0-9a-fA-F_]/.test(src[i])) { text += src[i]; advance(); }
        const n = parseInt(text.replace(/_/g, ''), 16);
        let type = 'int';
        if (src[i] === 'L' || src[i] === 'l') { type = 'long'; advance(); }
        push('number', { value: n, type }, text, tLine, tCol);
        continue;
      }

      while (i < src.length && (isDigit(src[i]) || src[i] === '_')) { text += src[i]; advance(); }
      if (src[i] === '.' && isDigit(src[i + 1])) {
        isFloat = true;
        text += '.'; advance();
        while (i < src.length && (isDigit(src[i]) || src[i] === '_')) { text += src[i]; advance(); }
      }
      if (src[i] === 'e' || src[i] === 'E') {
        isFloat = true;
        text += 'e'; advance();
        if (src[i] === '+' || src[i] === '-') { text += src[i]; advance(); }
        while (i < src.length && isDigit(src[i])) { text += src[i]; advance(); }
      }

      // Type suffix: 10L (long), 1.5f / 1.5d (float/double)
      let type = isFloat ? 'double' : 'int';
      if (src[i] === 'L' || src[i] === 'l') { type = 'long'; advance(); }
      else if (src[i] === 'f' || src[i] === 'F' || src[i] === 'd' || src[i] === 'D') { type = 'double'; advance(); }

      push('number', { value: Number(text.replace(/_/g, '')), type }, text, tLine, tCol);
      continue;
    }

    // --- string literal ---------------------------------------------------
    if (c === '"') {
      advance();
      let value = '';
      let closed = false;
      while (i < src.length) {
        if (src[i] === '"') { advance(); closed = true; break; }
        if (src[i] === '\n') break; // Java strings cannot span lines
        if (src[i] === '\\') {
          advance();
          const esc = readEscape(src, i, line, col);
          value += esc.char;
          advance(esc.length);
        } else {
          value += src[i];
          advance();
        }
      }
      if (!closed) {
        throw new JavaSyntaxError('This text is missing its closing double-quote (").', tLine, tCol);
      }
      push('string', value, value, tLine, tCol);
      continue;
    }

    // --- char literal -----------------------------------------------------
    if (c === "'") {
      advance();
      let value;
      if (src[i] === '\\') {
        advance();
        const esc = readEscape(src, i, line, col);
        value = esc.char;
        advance(esc.length);
      } else {
        value = src[i];
        advance();
      }
      if (src[i] !== "'") {
        throw new JavaSyntaxError(
          'A char literal holds exactly one character and ends with a single quote. Did you mean double-quotes for text?',
          tLine, tCol,
        );
      }
      advance();
      push('char', value, value, tLine, tCol);
      continue;
    }

    // --- identifiers & keywords -------------------------------------------
    if (isIdentStart(c)) {
      let text = '';
      while (i < src.length && isIdentPart(src[i])) { text += src[i]; advance(); }
      push(KEYWORDS.has(text) ? 'keyword' : 'ident', text, text, tLine, tCol);
      continue;
    }

    // --- operators & punctuation ------------------------------------------
    const op = OPERATORS.find((o) => src.startsWith(o, i));
    if (op) {
      advance(op.length);
      push('op', op, op, tLine, tCol);
      continue;
    }

    throw new JavaSyntaxError('I do not recognize the character "' + c + '" here.', tLine, tCol);
  }

  push('eof', null, '', line, col);
  return tokens;
}
