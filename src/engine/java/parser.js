/**
 * Java parser for the Hello, Tycoon! teaching interpreter.
 *
 * Consumes the token list from lexer.js and produces an AST that
 * interpreter.js walks. It is a hand-written recursive-descent parser with a
 * standard precedence-climbing expression parser.
 *
 * SUPPORTED SUBSET (deliberately scoped to what a first-year course uses):
 *   - classes with fields, constructors, static + instance methods, `extends`
 *   - primitives int/long/double/float/boolean/char, String, arrays
 *   - generics only as type annotations: ArrayList<Integer>, HashMap<String,Integer>
 *   - if/else, while, do-while, for, for-each, switch, break, continue, return
 *   - full expression set incl. ternary, compound assignment, ++/--, casts
 *
 * NOT supported (on purpose): lambdas, streams, interfaces with bodies,
 * try/catch, threads, file I/O, inner classes, annotations.
 *
 * TEACHERS: you shouldn't need to edit this. Error messages are written to be
 * read by students, so if you change one, keep it plain-English.
 */

import { tokenize, JavaSyntaxError } from './lexer.js';

/** Words that can begin a type in a variable declaration. */
const PRIMITIVE_TYPES = new Set([
  'int', 'long', 'short', 'byte', 'double', 'float', 'boolean', 'char', 'void',
]);

/** Class names we allow in a cast expression, e.g. (String) obj. */
const CASTABLE_CLASSES = new Set(['String', 'Integer', 'Double', 'Boolean', 'Character', 'Object', 'Long']);

/** Modifiers we accept and mostly ignore (we don't enforce access control). */
const MODIFIERS = new Set(['public', 'private', 'protected', 'static', 'final', 'abstract']);

class Parser {
  constructor(tokens) {
    this.tokens = tokens;
    this.pos = 0;
  }

  // ----- token helpers ----------------------------------------------------

  peek(offset = 0) { return this.tokens[this.pos + offset]; }
  get current() { return this.tokens[this.pos]; }

  /** True if the current token is exactly this operator/punctuation. */
  isOp(op, offset = 0) {
    const t = this.peek(offset);
    return t.type === 'op' && t.value === op;
  }

  /** True if the current token is this keyword. */
  isKeyword(kw, offset = 0) {
    const t = this.peek(offset);
    return t.type === 'keyword' && t.value === kw;
  }

  /** Consume the current token and return it. */
  next() { return this.tokens[this.pos++]; }

  /** Consume the current token if it matches; return true on success. */
  eatOp(op) {
    if (this.isOp(op)) { this.pos++; return true; }
    return false;
  }

  eatKeyword(kw) {
    if (this.isKeyword(kw)) { this.pos++; return true; }
    return false;
  }

  /** Consume an expected operator or throw a student-friendly error. */
  expectOp(op, context = '') {
    if (this.isOp(op)) return this.next();
    const t = this.current;
    const found = t.type === 'eof' ? 'the end of your code' : '"' + t.raw + '"';
    // The single most common student error gets its own message.
    if (op === ';') {
      const prev = this.tokens[this.pos - 1];
      throw new JavaSyntaxError(
        'Missing a semicolon (;) at the end of line ' + (prev ? prev.line : t.line) + '.',
        prev ? prev.line : t.line,
        prev ? prev.col : t.col,
      );
    }
    if (op === ')' || op === '}' || op === ']') {
      throw new JavaSyntaxError(
        'I expected a closing "' + op + '" but found ' + found + '. Check that every opening bracket has a matching closing one.',
        t.line, t.col,
      );
    }
    throw new JavaSyntaxError(
      'I expected "' + op + '"' + (context ? ' ' + context : '') + ' but found ' + found + '.',
      t.line, t.col,
    );
  }

  expectIdent(what = 'a name') {
    const t = this.current;
    if (t.type === 'ident') return this.next();
    throw new JavaSyntaxError(
      'I expected ' + what + ' but found "' + (t.raw || 'the end of your code') + '".',
      t.line, t.col,
    );
  }

  // ----- types ------------------------------------------------------------

  /** True if the token at `offset` can start a type name. */
  startsType(offset = 0) {
    const t = this.peek(offset);
    if (t.type === 'keyword' && PRIMITIVE_TYPES.has(t.value)) return true;
    // A capitalised identifier is conventionally a class name (String, ArrayList).
    return t.type === 'ident' && /^[A-Z]/.test(t.value);
  }

  /**
   * Parse a type: int, String, int[], ArrayList<Integer>, HashMap<String,Integer>.
   * @returns {{base:string, args:Array, dims:number, text:string}}
   */
  parseType() {
    const t = this.current;
    let base;
    if (t.type === 'keyword' && PRIMITIVE_TYPES.has(t.value)) base = this.next().value;
    else if (t.type === 'ident') base = this.next().value;
    else throw new JavaSyntaxError('I expected a type (like int or String) but found "' + t.raw + '".', t.line, t.col);

    // Dotted type names such as java.util.List — keep only the last segment.
    while (this.isOp('.') && this.peek(1).type === 'ident') {
      this.next();
      base = this.next().value;
    }

    // Generic arguments. We record them (useful for `new ArrayList<>()`) but
    // the interpreter is dynamically typed, so they're informational.
    const args = [];
    if (this.isOp('<')) {
      this.next();
      if (!this.isOp('>')) {          // `<>` diamond operator is allowed & empty
        do {
          args.push(this.parseType());
        } while (this.eatOp(','));
      }
      // The lexer greedily makes ">>" one token; split it back apart for
      // nested generics like HashMap<String, ArrayList<Integer>>.
      if (this.isOp('>>')) {
        this.current.value = '>';
        this.current.raw = '>';
      } else {
        this.expectOp('>', 'to close the generic type');
      }
    }

    let dims = 0;
    while (this.isOp('[') && this.isOp(']', 1)) { this.next(); this.next(); dims++; }

    const text = base
      + (args.length ? '<' + args.map((a) => a.text).join(', ') + '>' : '')
      + '[]'.repeat(dims);
    return { base, args, dims, text };
  }

  /**
   * Decide whether the statement starting here is a variable declaration.
   *
   * This is the classic Java ambiguity: `Foo bar;` is a declaration but
   * `foo.bar();` is an expression. We look ahead over a candidate type and
   * check whether an identifier follows it.
   */
  looksLikeDeclaration() {
    if (this.isKeyword('final')) return true;
    const t = this.current;
    if (t.type === 'keyword' && PRIMITIVE_TYPES.has(t.value)) return true;
    if (t.type !== 'ident' || !/^[A-Z]/.test(t.value)) return false;

    // Scan forward over Ident, generics and [] pairs, then require an ident.
    let i = this.pos + 1;
    const tok = (k) => this.tokens[k];

    while (tok(i) && tok(i).type === 'op' && tok(i).value === '.' && tok(i + 1)?.type === 'ident') i += 2;

    if (tok(i)?.type === 'op' && tok(i).value === '<') {
      let depth = 0;
      while (tok(i)) {
        const v = tok(i).value;
        if (tok(i).type === 'op') {
          if (v === '<') depth++;
          else if (v === '>') { depth--; if (depth === 0) { i++; break; } }
          else if (v === '>>') { depth -= 2; if (depth <= 0) { i++; break; } }
          else if (v === ';' || v === '{' || v === ')') return false; // ran off the end: it was a comparison
        }
        i++;
      }
    }

    while (tok(i)?.type === 'op' && tok(i).value === '[' && tok(i + 1)?.type === 'op' && tok(i + 1).value === ']') i += 2;

    return tok(i)?.type === 'ident';
  }

  // ----- top level --------------------------------------------------------

  parseProgram() {
    const classes = [];
    // `package foo;` and `import java.util.*;` are accepted and ignored — the
    // interpreter has its standard library built in.
    while (this.isKeyword('package') || this.isKeyword('import')) {
      while (!this.isOp(';') && this.current.type !== 'eof') this.next();
      this.expectOp(';');
    }
    while (this.current.type !== 'eof') {
      if (this.isKeyword('import') || this.isKeyword('package')) {
        while (!this.isOp(';') && this.current.type !== 'eof') this.next();
        this.expectOp(';');
        continue;
      }
      classes.push(this.parseClass());
    }
    if (classes.length === 0) {
      throw new JavaSyntaxError(
        'I could not find a class. Java code needs to live inside something like: public class Main { ... }',
        1, 1,
      );
    }
    return { type: 'Program', classes };
  }

  parseClass() {
    while (this.current.type === 'keyword' && MODIFIERS.has(this.current.value)) this.next();
    const kwTok = this.current;
    if (!this.eatKeyword('class')) {
      throw new JavaSyntaxError(
        'I expected the word "class" here but found "' + kwTok.raw + '".',
        kwTok.line, kwTok.col,
      );
    }
    const nameTok = this.expectIdent('a class name');
    // Ignore generic class parameters like <T>
    if (this.isOp('<')) { while (!this.isOp('>') && this.current.type !== 'eof') this.next(); this.next(); }

    let superclass = null;
    if (this.eatKeyword('extends')) superclass = this.parseType().base;
    if (this.eatKeyword('implements')) {
      do { this.parseType(); } while (this.eatOp(','));
    }

    this.expectOp('{', 'to open the class body');

    const fields = [];
    const methods = [];
    const ctors = [];

    while (!this.isOp('}') && this.current.type !== 'eof') {
      if (this.eatOp(';')) continue; // stray semicolon between members
      const member = this.parseMember(nameTok.value);
      if (member.kind === 'field') fields.push(...member.fields);
      else if (member.kind === 'ctor') ctors.push(member.method);
      else methods.push(member.method);
    }
    this.expectOp('}', 'to close the class body');

    return {
      type: 'ClassDecl',
      name: nameTok.value,
      superclass,
      fields,
      methods,
      ctors,
      line: nameTok.line,
    };
  }

  /** Parse one field, constructor or method inside a class body. */
  parseMember(className) {
    let isStatic = false;
    while (this.current.type === 'keyword' && MODIFIERS.has(this.current.value)) {
      if (this.current.value === 'static') isStatic = true;
      this.next();
    }

    // Constructor: ClassName ( ...
    if (this.current.type === 'ident' && this.current.value === className && this.isOp('(', 1)) {
      const nameTok = this.next();
      const params = this.parseParams();
      const body = this.parseBlock();
      return {
        kind: 'ctor',
        method: {
          type: 'MethodDecl', name: '<init>', returnType: null, params, body,
          isStatic: false, isCtor: true, line: nameTok.line,
        },
      };
    }

    const returnType = this.parseType();
    const nameTok = this.expectIdent('a field or method name');

    // Method: name ( params ) { body }
    if (this.isOp('(')) {
      const params = this.parseParams();
      if (this.eatKeyword('throws')) { do { this.parseType(); } while (this.eatOp(',')); }
      // Abstract / interface methods have no body.
      if (this.eatOp(';')) {
        return {
          kind: 'method',
          method: { type: 'MethodDecl', name: nameTok.value, returnType, params, body: null, isStatic, isCtor: false, line: nameTok.line },
        };
      }
      const body = this.parseBlock();
      return {
        kind: 'method',
        method: {
          type: 'MethodDecl', name: nameTok.value, returnType, params, body,
          isStatic, isCtor: false, line: nameTok.line,
        },
      };
    }

    // Otherwise it's a field declaration, possibly several: int a = 1, b = 2;
    const fields = [];
    let tok = nameTok;
    for (;;) {
      let extraDims = 0;
      while (this.isOp('[') && this.isOp(']', 1)) { this.next(); this.next(); extraDims++; }
      let init = null;
      if (this.eatOp('=')) init = this.isOp('{') ? this.parseArrayInitializer() : this.parseExpression();
      fields.push({
        type: 'FieldDecl',
        name: tok.value,
        varType: { ...returnType, dims: returnType.dims + extraDims },
        isStatic,
        init,
        line: tok.line,
      });
      if (this.eatOp(',')) { tok = this.expectIdent('another field name'); continue; }
      break;
    }
    this.expectOp(';');
    return { kind: 'field', fields };
  }

  parseParams() {
    this.expectOp('(');
    const params = [];
    if (!this.isOp(')')) {
      do {
        while (this.isKeyword('final')) this.next();
        const pType = this.parseType();
        const pName = this.expectIdent('a parameter name');
        let extraDims = 0;
        while (this.isOp('[') && this.isOp(']', 1)) { this.next(); this.next(); extraDims++; }
        params.push({ name: pName.value, varType: { ...pType, dims: pType.dims + extraDims } });
      } while (this.eatOp(','));
    }
    this.expectOp(')');
    return params;
  }

  // ----- statements -------------------------------------------------------

  parseBlock() {
    const open = this.current;
    this.expectOp('{', 'to open a block of code');
    const stmts = [];
    while (!this.isOp('}')) {
      if (this.current.type === 'eof') {
        throw new JavaSyntaxError(
          'This { block is never closed. Every { needs a matching }.',
          open.line, open.col,
        );
      }
      stmts.push(this.parseStatement());
    }
    this.expectOp('}');
    return { type: 'Block', stmts, line: open.line };
  }

  parseStatement() {
    const t = this.current;

    if (this.isOp('{')) return this.parseBlock();
    if (this.eatOp(';')) return { type: 'Empty', line: t.line };

    if (t.type === 'keyword') {
      switch (t.value) {
        case 'if': return this.parseIf();
        case 'while': return this.parseWhile();
        case 'do': return this.parseDoWhile();
        case 'for': return this.parseFor();
        case 'switch': return this.parseSwitch();
        case 'return': {
          this.next();
          const value = this.isOp(';') ? null : this.parseExpression();
          this.expectOp(';');
          return { type: 'Return', value, line: t.line };
        }
        case 'break': this.next(); this.expectOp(';'); return { type: 'Break', line: t.line };
        case 'continue': this.next(); this.expectOp(';'); return { type: 'Continue', line: t.line };
        case 'class': return this.parseClass(); // local class: rare, but harmless
        default: break;
      }
    }

    if (this.looksLikeDeclaration()) {
      const decl = this.parseVarDecl();
      this.expectOp(';');
      return decl;
    }

    const expr = this.parseExpression();
    this.expectOp(';');
    return { type: 'ExprStmt', expr, line: t.line };
  }

  /** `int x = 1, y;` — the trailing semicolon is consumed by the caller. */
  parseVarDecl() {
    const line = this.current.line;
    while (this.isKeyword('final')) this.next();
    const varType = this.parseType();
    const declarators = [];
    do {
      const nameTok = this.expectIdent('a variable name');
      let extraDims = 0;
      while (this.isOp('[') && this.isOp(']', 1)) { this.next(); this.next(); extraDims++; }
      let init = null;
      if (this.eatOp('=')) init = this.isOp('{') ? this.parseArrayInitializer() : this.parseExpression();
      declarators.push({
        name: nameTok.value,
        varType: { ...varType, dims: varType.dims + extraDims },
        init,
        line: nameTok.line,
      });
    } while (this.eatOp(','));
    return { type: 'VarDecl', declarators, line };
  }

  parseIf() {
    const line = this.next().line; // 'if'
    this.expectOp('(', 'after if');
    const cond = this.parseExpression();
    this.expectOp(')');
    const then = this.parseStatement();
    let alt = null;
    if (this.eatKeyword('else')) alt = this.parseStatement();
    return { type: 'If', cond, then, alt, line };
  }

  parseWhile() {
    const line = this.next().line;
    this.expectOp('(', 'after while');
    const cond = this.parseExpression();
    this.expectOp(')');
    const body = this.parseStatement();
    return { type: 'While', cond, body, line };
  }

  parseDoWhile() {
    const line = this.next().line;
    const body = this.parseStatement();
    if (!this.eatKeyword('while')) {
      throw new JavaSyntaxError('A do { ... } block must be followed by while (condition);', this.current.line, this.current.col);
    }
    this.expectOp('(');
    const cond = this.parseExpression();
    this.expectOp(')');
    this.expectOp(';');
    return { type: 'DoWhile', body, cond, line };
  }

  parseFor() {
    const line = this.next().line;
    this.expectOp('(', 'after for');

    // Distinguish for-each (`for (int n : nums)`) from the classic 3-part for.
    const save = this.pos;
    if (this.looksLikeDeclaration()) {
      while (this.isKeyword('final')) this.next();
      const varType = this.parseType();
      if (this.current.type === 'ident' && this.isOp(':', 1)) {
        const nameTok = this.next();
        this.next(); // ':'
        const iterable = this.parseExpression();
        this.expectOp(')');
        const body = this.parseStatement();
        return { type: 'ForEach', varType, name: nameTok.value, iterable, body, line };
      }
      this.pos = save; // not a for-each; rewind and parse normally
    }

    let init = null;
    if (!this.isOp(';')) {
      init = this.looksLikeDeclaration()
        ? this.parseVarDecl()
        : { type: 'ExprStmt', expr: this.parseExpression(), line };
    }
    this.expectOp(';');
    const cond = this.isOp(';') ? null : this.parseExpression();
    this.expectOp(';');
    const update = [];
    if (!this.isOp(')')) {
      do { update.push(this.parseExpression()); } while (this.eatOp(','));
    }
    this.expectOp(')');
    const body = this.parseStatement();
    return { type: 'For', init, cond, update, body, line };
  }

  parseSwitch() {
    const line = this.next().line;
    this.expectOp('(', 'after switch');
    const disc = this.parseExpression();
    this.expectOp(')');
    this.expectOp('{', 'to open the switch body');
    const cases = [];
    while (!this.isOp('}') && this.current.type !== 'eof') {
      let test = null;
      if (this.eatKeyword('case')) {
        test = this.parseExpression();
      } else if (this.eatKeyword('default')) {
        test = null;
      } else {
        throw new JavaSyntaxError(
          'Inside a switch I expected "case" or "default" but found "' + this.current.raw + '".',
          this.current.line, this.current.col,
        );
      }
      this.expectOp(':');
      const stmts = [];
      while (!this.isOp('}') && !this.isKeyword('case') && !this.isKeyword('default') && this.current.type !== 'eof') {
        stmts.push(this.parseStatement());
      }
      cases.push({ test, stmts });
    }
    this.expectOp('}');
    return { type: 'Switch', disc, cases, line };
  }

  /** `{1, 2, 3}` or nested `{{1,2},{3,4}}` */
  parseArrayInitializer() {
    const line = this.current.line;
    this.expectOp('{');
    const elements = [];
    if (!this.isOp('}')) {
      do {
        if (this.isOp('}')) break; // allow a trailing comma
        elements.push(this.isOp('{') ? this.parseArrayInitializer() : this.parseExpression());
      } while (this.eatOp(','));
    }
    this.expectOp('}');
    return { type: 'ArrayInit', elements, line };
  }

  // ----- expressions ------------------------------------------------------

  parseExpression() { return this.parseAssignment(); }

  parseAssignment() {
    const left = this.parseTernary();
    const t = this.current;
    if (t.type === 'op' && ['=', '+=', '-=', '*=', '/=', '%=', '&=', '|=', '^=', '<<=', '>>='].includes(t.value)) {
      this.next();
      const right = this.parseAssignment(); // right-associative
      if (!['Name', 'Field', 'Index'].includes(left.type)) {
        throw new JavaSyntaxError(
          'The left side of "' + t.value + '" must be a variable, a field, or an array slot.',
          t.line, t.col,
        );
      }
      return { type: 'Assign', target: left, op: t.value, value: right, line: t.line };
    }
    return left;
  }

  parseTernary() {
    const cond = this.parseBinary(0);
    if (this.isOp('?')) {
      const line = this.next().line;
      const then = this.parseAssignment();
      this.expectOp(':', 'in a ? : expression');
      const alt = this.parseAssignment();
      return { type: 'Ternary', cond, then, alt, line };
    }
    return cond;
  }

  /**
   * Binary operators by precedence level, lowest first.
   * Index in this array IS the precedence level used by parseBinary.
   */
  static PRECEDENCE = [
    ['||'],
    ['&&'],
    ['|'],
    ['^'],
    ['&'],
    ['==', '!='],
    ['<', '>', '<=', '>=', 'instanceof'],
    ['<<', '>>', '>>>'],
    ['+', '-'],
    ['*', '/', '%'],
  ];

  parseBinary(level) {
    if (level >= Parser.PRECEDENCE.length) return this.parseUnary();
    const ops = Parser.PRECEDENCE[level];
    let left = this.parseBinary(level + 1);
    for (;;) {
      const t = this.current;
      const isInstanceof = t.type === 'keyword' && t.value === 'instanceof' && ops.includes('instanceof');
      if (isInstanceof) {
        this.next();
        const target = this.parseType();
        left = { type: 'InstanceOf', expr: left, targetType: target, line: t.line };
        continue;
      }
      if (t.type !== 'op' || !ops.includes(t.value)) break;
      this.next();
      const right = this.parseBinary(level + 1);
      const nodeType = (t.value === '&&' || t.value === '||') ? 'Logical' : 'Binary';
      left = { type: nodeType, op: t.value, left, right, line: t.line };
    }
    return left;
  }

  parseUnary() {
    const t = this.current;

    if (t.type === 'op' && ['!', '-', '+', '~'].includes(t.value)) {
      this.next();
      return { type: 'Unary', op: t.value, operand: this.parseUnary(), line: t.line };
    }
    if (t.type === 'op' && (t.value === '++' || t.value === '--')) {
      this.next();
      return { type: 'Update', op: t.value, operand: this.parseUnary(), prefix: true, line: t.line };
    }

    // Cast: (int) x, (double) total, (String) obj
    if (t.type === 'op' && t.value === '(') {
      const after = this.peek(1);
      const isPrimitiveCast = after.type === 'keyword' && PRIMITIVE_TYPES.has(after.value);
      const isClassCast = after.type === 'ident' && CASTABLE_CLASSES.has(after.value)
        && this.peek(2).type === 'op' && this.peek(2).value === ')';
      if (isPrimitiveCast || isClassCast) {
        // Guard: `(x)` where x is a bare value, not a cast. A cast must be
        // followed by something that can start an expression.
        const save = this.pos;
        this.next();
        const castType = this.parseType();
        if (this.isOp(')')) {
          this.next();
          const nt = this.current;
          const canFollow = nt.type === 'ident' || nt.type === 'number' || nt.type === 'string'
            || nt.type === 'char' || (nt.type === 'op' && ['(', '-', '!', '+'].includes(nt.value))
            || (nt.type === 'keyword' && ['new', 'this', 'true', 'false', 'null'].includes(nt.value));
          if (canFollow) {
            return { type: 'Cast', castType, expr: this.parseUnary(), line: t.line };
          }
        }
        this.pos = save; // false alarm — it was a parenthesised expression
      }
    }

    return this.parsePostfix();
  }

  parsePostfix() {
    let expr = this.parsePrimary();
    for (;;) {
      const t = this.current;
      if (this.isOp('.')) {
        this.next();
        // Allow `.new` style? No — but allow keyword-ish member names defensively.
        const nameTok = this.current.type === 'ident' ? this.next() : this.expectIdent('a field or method name');
        if (this.isOp('(')) {
          const args = this.parseArgs();
          expr = { type: 'Call', callee: { type: 'Field', object: expr, name: nameTok.value, line: nameTok.line }, args, line: nameTok.line };
        } else {
          expr = { type: 'Field', object: expr, name: nameTok.value, line: nameTok.line };
        }
        continue;
      }
      if (this.isOp('[')) {
        this.next();
        const index = this.parseExpression();
        this.expectOp(']');
        expr = { type: 'Index', object: expr, index, line: t.line };
        continue;
      }
      if (this.isOp('(')) {
        const args = this.parseArgs();
        expr = { type: 'Call', callee: expr, args, line: t.line };
        continue;
      }
      if (this.isOp('++') || this.isOp('--')) {
        this.next();
        expr = { type: 'Update', op: t.value, operand: expr, prefix: false, line: t.line };
        continue;
      }
      break;
    }
    return expr;
  }

  parseArgs() {
    this.expectOp('(');
    const args = [];
    if (!this.isOp(')')) {
      do { args.push(this.parseExpression()); } while (this.eatOp(','));
    }
    this.expectOp(')');
    return args;
  }

  parsePrimary() {
    const t = this.current;

    if (t.type === 'number') {
      this.next();
      return { type: 'Literal', valueType: t.value.type, value: t.value.value, line: t.line };
    }
    if (t.type === 'string') {
      this.next();
      return { type: 'Literal', valueType: 'String', value: t.value, line: t.line };
    }
    if (t.type === 'char') {
      this.next();
      return { type: 'Literal', valueType: 'char', value: t.value, line: t.line };
    }
    if (t.type === 'keyword') {
      if (t.value === 'true' || t.value === 'false') {
        this.next();
        return { type: 'Literal', valueType: 'boolean', value: t.value === 'true', line: t.line };
      }
      if (t.value === 'null') { this.next(); return { type: 'Literal', valueType: 'null', value: null, line: t.line }; }
      if (t.value === 'this') { this.next(); return { type: 'This', line: t.line }; }
      if (t.value === 'super') { this.next(); return { type: 'Super', line: t.line }; }
      if (t.value === 'new') return this.parseNew();
    }
    if (t.type === 'ident') {
      this.next();
      return { type: 'Name', name: t.value, line: t.line, col: t.col };
    }
    if (this.isOp('(')) {
      this.next();
      const expr = this.parseExpression();
      this.expectOp(')');
      return expr;
    }

    const found = t.type === 'eof' ? 'the end of your code' : '"' + t.raw + '"';
    throw new JavaSyntaxError('I expected a value or variable here but found ' + found + '.', t.line, t.col);
  }

  parseNew() {
    const line = this.next().line; // 'new'
    const typeTok = this.current;
    const baseType = this.parseType();

    // Array with explicit size: new int[5] / new int[3][4]
    if (this.isOp('[')) {
      const dims = [];
      while (this.isOp('[')) {
        this.next();
        if (this.isOp(']')) { this.next(); dims.push(null); continue; } // new int[]{...}
        dims.push(this.parseExpression());
        this.expectOp(']');
      }
      let init = null;
      if (this.isOp('{')) init = this.parseArrayInitializer();
      return { type: 'NewArray', elemType: baseType, dims, init, line };
    }

    // Array declared as `new int[] {1,2,3}` is handled above; this is `new Foo(...)`.
    if (!this.isOp('(')) {
      throw new JavaSyntaxError(
        'After "new ' + baseType.text + '" I expected ( ) to create the object, or [ ] to create an array.',
        typeTok.line, typeTok.col,
      );
    }
    const args = this.parseArgs();
    // Anonymous class bodies are not supported; fail clearly instead of oddly.
    if (this.isOp('{')) {
      throw new JavaSyntaxError(
        'Anonymous class bodies are not supported in this game. Define a named class instead.',
        this.current.line, this.current.col,
      );
    }
    return { type: 'New', className: baseType.base, typeArgs: baseType.args, args, line };
  }
}

/**
 * Parse Java source into an AST.
 * @param {string} src
 * @returns {{type:'Program', classes:Array}}
 * @throws {JavaSyntaxError} with .line/.col and a student-readable .message
 */
export function parse(src) {
  const tokens = tokenize(src);
  return new Parser(tokens).parseProgram();
}

export { JavaSyntaxError };
