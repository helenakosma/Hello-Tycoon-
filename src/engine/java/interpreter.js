/**
 * Java tree-walking interpreter for Hello, Tycoon!
 *
 * Takes the AST from parser.js and actually runs it, collecting everything the
 * student printed. Designed for teaching, so it deliberately:
 *   - reproduces Java's integer division and double printing exactly
 *   - refuses a lossy `int x = someDouble;` the way javac would
 *   - warns (but still works) when a student compares Strings with ==
 *   - stops runaway loops instead of freezing the browser tab
 *
 * TEACHERS: you almost certainly don't need to touch this file. To add library
 * methods, edit runtime.js. To add problems, edit src/data/problems/java.json.
 */

import { parse, JavaSyntaxError } from './parser.js';
import {
  JavaRuntimeError, VOID, NULL, JInt, JLong, JDouble, JBool, JChar, JString,
  JArray, JList, JMap, JSet, JSb,
  isNumeric, numOf, javaToString, valuesEqual, describeType, defaultValueFor,
  javaFormat, callBuiltinMethod, sortValues, hashKey,
  STATICS, STATIC_FIELDS,
} from './runtime.js';

/** Safety limits so a student's infinite loop can't hang the browser tab. */
const MAX_STEPS = 4_000_000;
const MAX_OUTPUT_CHARS = 200_000;
const MAX_CALL_DEPTH = 1200;

/** Control-flow signals, returned up the statement chain rather than thrown. */
const NORMAL = { kind: 'normal' };
const BREAK = { kind: 'break' };
const CONTINUE = { kind: 'continue' };
const mkReturn = (value) => ({ kind: 'return', value });

/** A lexical scope. Slots remember their declared type so we can coerce. */
class Scope {
  constructor(parent = null) {
    this.vars = new Map();
    this.parent = parent;
  }

  declare(name, value, declaredType) {
    this.vars.set(name, { value, declaredType });
  }

  /** Find the slot for `name`, walking outwards. Returns null if undeclared. */
  find(name) {
    let s = this;
    while (s) {
      const slot = s.vars.get(name);
      if (slot) return slot;
      s = s.parent;
    }
    return null;
  }
}

/** A class name used as a value, e.g. the `Math` in `Math.abs(x)`. */
const ClassRef = (name) => ({ t: 'classref', v: name });

export class Interpreter {
  constructor(options = {}) {
    this.classes = new Map();      // className -> ClassDecl
    this.staticFields = new Map(); // className -> Map(fieldName -> slot)
    this.output = [];
    this.outputLength = 0;
    this.warnings = [];
    this.steps = 0;
    this.depth = 0;
    this.stdinLines = (options.stdin || '').length ? String(options.stdin).split('\n') : [];
    this.stdinPos = 0;
  }

  // ----- program setup ----------------------------------------------------

  load(source) {
    const ast = parse(source);
    for (const cls of ast.classes) {
      this.classes.set(cls.name, cls);
    }
    // Initialise static fields after all classes are registered, so a static
    // field can reference another class.
    for (const cls of ast.classes) {
      const slots = new Map();
      this.staticFields.set(cls.name, slots);
      for (const f of cls.fields.filter((x) => x.isStatic)) {
        slots.set(f.name, { value: defaultValueFor(f.varType.text), declaredType: f.varType.text });
      }
    }
    for (const cls of ast.classes) {
      const slots = this.staticFields.get(cls.name);
      const scope = new Scope();
      for (const f of cls.fields.filter((x) => x.isStatic && x.init)) {
        const v = this.evaluate(f.init, scope, { className: cls.name, thisValue: null });
        slots.get(f.name).value = this.coerce(v, f.varType.text, f.line);
      }
    }
    this.ast = ast;
    return ast;
  }

  // ----- output -----------------------------------------------------------

  write(text) {
    this.outputLength += text.length;
    if (this.outputLength > MAX_OUTPUT_CHARS) {
      throw new JavaRuntimeError(
        'Your program printed a huge amount of text. That usually means a loop never stops — '
        + 'check that your loop variable actually changes.', null,
      );
    }
    this.output.push(text);
  }

  getOutput() { return this.output.join(''); }

  tick(line) {
    if (++this.steps > MAX_STEPS) {
      throw new JavaRuntimeError(
        'Your program ran for too long, so I stopped it. This almost always means a loop '
        + 'never reaches its stopping condition.', line,
      );
    }
  }

  // ----- type coercion ----------------------------------------------------

  /**
   * Convert a value to a declared type, the way Java does on assignment.
   * Rejects narrowing conversions that javac would reject, because catching
   * those is a genuine part of learning Java.
   */
  coerce(value, typeText, line) {
    if (!typeText || value === undefined) return value;
    const base = typeText.replace(/<.*>/, '');
    if (base.endsWith('[]')) return value;

    switch (base) {
      case 'int': case 'short': case 'byte': {
        if (value.t === 'double' || value.t === 'float') {
          throw new JavaRuntimeError(
            'Java will not store a decimal number in an int without a cast. '
            + 'Either declare the variable as double, or write (int) in front of the value.', line,
          );
        }
        if (value.t === 'long') return JInt(value.v);
        if (value.t === 'char') return JInt(value.v.charCodeAt(0));
        if (value.t === 'int') return value;
        if (value.t === 'null') return value;
        return value;
      }
      case 'long':
        if (value.t === 'double') {
          throw new JavaRuntimeError(
            'Java will not store a decimal number in a long without a cast. Use (long) to convert it.', line,
          );
        }
        return isNumeric(value.t) ? JLong(numOf(value)) : value;
      case 'double': case 'float':
        return isNumeric(value.t) ? JDouble(numOf(value)) : value;
      case 'boolean':
        return value;
      case 'char':
        if (value.t === 'char' || value.t === 'null') return value;
        if (isNumeric(value.t)) return JChar(String.fromCharCode(numOf(value)));
        return value;
      case 'String':
        if (value.t === 'String' || value.t === 'null') return value;
        if (value.t === 'char') return value; // assigning a char to String is a Java error; stay lenient
        return value;
      default:
        return value;
    }
  }

  // ----- entry points -----------------------------------------------------

  /** Find a method by name (and optional arity) anywhere in the loaded classes. */
  findMethod(className, name, arity) {
    let cls = this.classes.get(className);
    while (cls) {
      const candidates = cls.methods.filter((m) => m.name === name && m.body);
      const exact = arity === undefined ? candidates[0] : candidates.find((m) => m.params.length === arity);
      if (exact) return { method: exact, className: cls.name };
      cls = cls.superclass ? this.classes.get(cls.superclass) : null;
    }
    return null;
  }

  /** Search every loaded class for a static method with this name. */
  findStaticAnywhere(name, arity) {
    for (const [cn, cls] of this.classes) {
      const m = cls.methods.find(
        (x) => x.name === name && x.isStatic && x.body && (arity === undefined || x.params.length === arity),
      );
      if (m) return { method: m, className: cn };
    }
    return null;
  }

  /** Run `public static void main(String[] args)`. */
  runMain() {
    const found = this.findStaticAnywhere('main', 1) || this.findStaticAnywhere('main');
    if (!found) {
      throw new JavaRuntimeError(
        'I could not find a main method. Every runnable Java program needs:\n'
        + '  public static void main(String[] args) { ... }', null,
      );
    }
    this.invoke(found.method, [JArray('String', [])], null, found.className);
    return this.getOutput();
  }

  /** Call one static method directly, coercing arguments to its parameter types. */
  callStatic(name, argValues) {
    const found = this.findStaticAnywhere(name, argValues.length) || this.findStaticAnywhere(name);
    if (!found) {
      const names = [...this.classes.values()]
        .flatMap((c) => c.methods.filter((m) => m.isStatic).map((m) => m.name))
        .filter((n) => n !== 'main');
      throw new JavaRuntimeError(
        'I could not find a method called ' + name + '(). '
        + (names.length
          ? 'I did find: ' + [...new Set(names)].join(', ') + '. Check the spelling and that it is declared static.'
          : 'Make sure it is declared "public static".'),
        null,
      );
    }
    const { method, className } = found;
    if (method.params.length !== argValues.length) {
      throw new JavaRuntimeError(
        'The method ' + name + ' should take ' + argValues.length + ' value(s), but yours takes '
        + method.params.length + '.', method.line,
      );
    }
    const coerced = argValues.map((v, i) => this.coerce(v, method.params[i].varType.text, method.line));
    const result = this.invoke(method, coerced, null, className);
    return this.coerce(result, method.returnType ? method.returnType.text : null, method.line);
  }

  /**
   * Call a method (static or instance).
   * @param method   MethodDecl node
   * @param args     already-coerced argument values
   * @param thisValue the receiver object, or null for static
   * @param className the class the method was found on (for `this`/static lookup)
   */
  invoke(method, args, thisValue, className) {
    if (++this.depth > MAX_CALL_DEPTH) {
      this.depth--;
      throw new JavaRuntimeError(
        'Your methods called each other too many times without stopping. '
        + 'If this is recursion, check that the base case actually returns.', method.line,
      );
    }
    try {
      const scope = new Scope();
      method.params.forEach((p, i) => {
        const raw = args[i] === undefined ? NULL : args[i];
        scope.declare(p.name, this.coerce(raw, p.varType.text, method.line), p.varType.text);
      });
      const ctx = { className, thisValue, method };
      const signal = this.execBlock(method.body, scope, ctx);
      if (signal.kind === 'return') {
        return this.coerce(signal.value ?? VOID, method.returnType ? method.returnType.text : null, method.line);
      }
      // A non-void method that falls off the end is a javac error; flag it.
      if (method.returnType && method.returnType.text !== 'void' && !method.isCtor) {
        throw new JavaRuntimeError(
          'The method ' + method.name + ' promises to return a ' + method.returnType.text
          + ', but it reached the end without a return statement.', method.line,
        );
      }
      return VOID;
    } finally {
      this.depth--;
    }
  }

  // ----- statements -------------------------------------------------------

  execBlock(block, parentScope, ctx) {
    const scope = new Scope(parentScope);
    for (const stmt of block.stmts) {
      const signal = this.execute(stmt, scope, ctx);
      if (signal.kind !== 'normal') return signal;
    }
    return NORMAL;
  }

  execute(node, scope, ctx) {
    this.tick(node.line);

    switch (node.type) {
      case 'Block': return this.execBlock(node, scope, ctx);

      case 'Empty': return NORMAL;

      case 'VarDecl': {
        for (const d of node.declarators) {
          let value = d.init
            ? this.evaluateInit(d.init, d.varType, scope, ctx)
            : defaultValueFor(d.varType.text);
          scope.declare(d.name, this.coerce(value, d.varType.text, d.line), d.varType.text);
        }
        return NORMAL;
      }

      case 'ExprStmt':
        this.evaluate(node.expr, scope, ctx);
        return NORMAL;

      case 'If': {
        if (this.truthy(this.evaluate(node.cond, scope, ctx), node.line)) {
          return this.execute(node.then, scope, ctx);
        }
        if (node.alt) return this.execute(node.alt, scope, ctx);
        return NORMAL;
      }

      case 'While': {
        while (this.truthy(this.evaluate(node.cond, scope, ctx), node.line)) {
          this.tick(node.line);
          const s = this.execute(node.body, scope, ctx);
          if (s.kind === 'break') break;
          if (s.kind === 'return') return s;
        }
        return NORMAL;
      }

      case 'DoWhile': {
        do {
          this.tick(node.line);
          const s = this.execute(node.body, scope, ctx);
          if (s.kind === 'break') break;
          if (s.kind === 'return') return s;
        } while (this.truthy(this.evaluate(node.cond, scope, ctx), node.line));
        return NORMAL;
      }

      case 'For': {
        const loopScope = new Scope(scope);
        if (node.init) this.execute(node.init, loopScope, ctx);
        for (;;) {
          this.tick(node.line);
          if (node.cond && !this.truthy(this.evaluate(node.cond, loopScope, ctx), node.line)) break;
          const s = this.execute(node.body, loopScope, ctx);
          if (s.kind === 'break') break;
          if (s.kind === 'return') return s;
          for (const u of node.update) this.evaluate(u, loopScope, ctx);
        }
        return NORMAL;
      }

      case 'ForEach': {
        const iterable = this.evaluate(node.iterable, scope, ctx);
        const items = this.iterableItems(iterable, node.line);
        for (const item of items) {
          this.tick(node.line);
          const loopScope = new Scope(scope);
          loopScope.declare(node.name, this.coerce(item, node.varType.text, node.line), node.varType.text);
          const s = this.execute(node.body, loopScope, ctx);
          if (s.kind === 'break') break;
          if (s.kind === 'return') return s;
        }
        return NORMAL;
      }

      case 'Switch': {
        const disc = this.evaluate(node.disc, scope, ctx);
        const switchScope = new Scope(scope);
        let matched = false;
        for (const c of node.cases) {
          if (!matched && c.test !== null) {
            if (valuesEqual(disc, this.evaluate(c.test, switchScope, ctx), this)) matched = true;
          }
          if (matched) {
            for (const stmt of c.stmts) {
              const s = this.execute(stmt, switchScope, ctx);
              if (s.kind === 'break') return NORMAL;
              if (s.kind !== 'normal') return s;
            }
          }
        }
        if (!matched) {
          // Run the default branch (and anything after it, Java fall-through).
          let running = false;
          for (const c of node.cases) {
            if (c.test === null) running = true;
            if (running) {
              for (const stmt of c.stmts) {
                const s = this.execute(stmt, switchScope, ctx);
                if (s.kind === 'break') return NORMAL;
                if (s.kind !== 'normal') return s;
              }
            }
          }
        }
        return NORMAL;
      }

      case 'Return':
        return mkReturn(node.value ? this.evaluate(node.value, scope, ctx) : VOID);

      case 'Break': return BREAK;
      case 'Continue': return CONTINUE;

      case 'ClassDecl': return NORMAL; // already registered at load time

      default:
        throw new JavaRuntimeError('I do not know how to run a ' + node.type + ' statement.', node.line);
    }
  }

  /** Array initialisers need the declared type to know their element type. */
  evaluateInit(init, varType, scope, ctx) {
    if (init.type === 'ArrayInit') {
      const elemType = varType.dims > 1
        ? varType.base + '[]'.repeat(varType.dims - 1)
        : varType.base;
      return this.buildArrayFromInit(init, elemType, scope, ctx);
    }
    return this.evaluate(init, scope, ctx);
  }

  buildArrayFromInit(init, elemType, scope, ctx) {
    const items = init.elements.map((el) => {
      if (el.type === 'ArrayInit') {
        const inner = elemType.endsWith('[]') ? elemType.slice(0, -2) : elemType;
        return this.buildArrayFromInit(el, inner, scope, ctx);
      }
      return this.coerce(this.evaluate(el, scope, ctx), elemType, init.line);
    });
    return JArray(elemType, items);
  }

  truthy(value, line) {
    if (value.t === 'boolean') return value.v;
    if (value.t === 'null') {
      throw new JavaRuntimeError('A condition here is null instead of true or false.', line);
    }
    if (isNumeric(value.t)) {
      throw new JavaRuntimeError(
        'A condition must be true or false, but this one is a number. '
        + 'Did you write = (assign) where you meant == (compare)?', line,
      );
    }
    throw new JavaRuntimeError(
      'A condition must be true or false, but this one is a ' + describeType(value) + '.', line,
    );
  }

  iterableItems(value, line) {
    if (value.t === 'array') return value.v.items;
    if (value.t === 'list') return value.v;
    if (value.t === 'set') return [...value.v.values()].map((e) => e.key);
    if (value.t === 'String') return [...value.v].map(JChar);
    if (value.t === 'null') {
      throw new JavaRuntimeError('A for-each loop got null instead of a list or array.', line);
    }
    throw new JavaRuntimeError(
      'A for-each loop needs an array or a list, but got a ' + describeType(value) + '.', line,
    );
  }

  // ----- expressions ------------------------------------------------------

  evaluate(node, scope, ctx) {
    this.tick(node.line);

    switch (node.type) {
      case 'Literal': {
        switch (node.valueType) {
          case 'int': return JInt(node.value);
          case 'long': return JLong(node.value);
          case 'double': return JDouble(node.value);
          case 'boolean': return JBool(node.value);
          case 'char': return JChar(node.value);
          case 'String': return JString(node.value);
          default: return NULL;
        }
      }

      case 'ArrayInit':
        // An array initialiser reached without a declared type (rare).
        return this.buildArrayFromInit(node, 'Object', scope, ctx);

      case 'Name': return this.resolveName(node, scope, ctx);

      case 'This':
        if (!ctx.thisValue) {
          throw new JavaRuntimeError(
            '"this" only works inside an instance method, not in a static method like main.', node.line,
          );
        }
        return ctx.thisValue;

      case 'Super':
        return ctx.thisValue || NULL;

      case 'Field': return this.evaluateField(node, scope, ctx);

      case 'Index': {
        const target = this.evaluate(node.object, scope, ctx);
        const idx = numOf(this.evaluate(node.index, scope, ctx), node.line);
        if (target.t === 'null') {
          throw new JavaRuntimeError(
            'I tried to read an array slot but the array is null — it was never created with "new".', node.line,
          );
        }
        if (target.t === 'list') {
          if (idx < 0 || idx >= target.v.length) {
            throw new JavaRuntimeError(
              'Index ' + idx + ' is out of bounds for a list of size ' + target.v.length + '.', node.line,
            );
          }
          return target.v[idx];
        }
        if (target.t !== 'array') {
          throw new JavaRuntimeError(
            'Square brackets only work on arrays, but this is a ' + describeType(target) + '.', node.line,
          );
        }
        if (idx < 0 || idx >= target.v.items.length) {
          throw new JavaRuntimeError(
            'Index ' + idx + ' is out of bounds — this array has ' + target.v.items.length
            + ' slot' + (target.v.items.length === 1 ? '' : 's') + ', so the last valid index is '
            + (target.v.items.length - 1) + '.', node.line,
          );
        }
        return target.v.items[idx];
      }

      case 'Assign': return this.evaluateAssign(node, scope, ctx);

      case 'Update': return this.evaluateUpdate(node, scope, ctx);

      case 'Unary': {
        const v = this.evaluate(node.operand, scope, ctx);
        if (node.op === '!') return JBool(!this.truthy(v, node.line));
        if (node.op === '-') {
          const n = -numOf(v, node.line);
          return v.t === 'double' ? JDouble(n) : v.t === 'long' ? JLong(n) : JInt(n);
        }
        if (node.op === '+') return v;
        if (node.op === '~') return JInt(~numOf(v, node.line));
        throw new JavaRuntimeError('Unsupported operator ' + node.op + '.', node.line);
      }

      case 'Logical': {
        const left = this.evaluate(node.left, scope, ctx);
        const l = this.truthy(left, node.line);
        // Short-circuit, exactly like Java.
        if (node.op === '&&' && !l) return JBool(false);
        if (node.op === '||' && l) return JBool(true);
        return JBool(this.truthy(this.evaluate(node.right, scope, ctx), node.line));
      }

      case 'Binary': return this.evaluateBinary(node, scope, ctx);

      case 'Ternary':
        return this.truthy(this.evaluate(node.cond, scope, ctx), node.line)
          ? this.evaluate(node.then, scope, ctx)
          : this.evaluate(node.alt, scope, ctx);

      case 'Cast': {
        const v = this.evaluate(node.expr, scope, ctx);
        const base = node.castType.base;
        if (base === 'int' || base === 'short' || base === 'byte') return JInt(Math.trunc(numOf(v, node.line)));
        if (base === 'long') return JLong(Math.trunc(numOf(v, node.line)));
        if (base === 'double' || base === 'float') return JDouble(numOf(v, node.line));
        if (base === 'char') return JChar(v.t === 'char' ? v.v : String.fromCharCode(numOf(v, node.line)));
        if (base === 'boolean') return JBool(v.v);
        if (base === 'String') return v.t === 'null' ? v : JString(javaToString(v, this));
        return v;
      }

      case 'InstanceOf': {
        const v = this.evaluate(node.expr, scope, ctx);
        const target = node.targetType.base;
        if (v.t === 'null') return JBool(false);
        if (v.t === 'object') {
          let cn = v.v.className;
          while (cn) {
            if (cn === target) return JBool(true);
            cn = this.classes.get(cn)?.superclass;
          }
          return JBool(false);
        }
        const tagFor = { String: 'String', Integer: 'int', Double: 'double', Boolean: 'boolean', Character: 'char' };
        return JBool(tagFor[target] === v.t);
      }

      case 'New': return this.evaluateNew(node, scope, ctx);

      case 'NewArray': {
        if (node.init) {
          const elemType = node.elemType.base + '[]'.repeat(Math.max(0, node.dims.length - 1));
          return this.buildArrayFromInit(node.init, elemType, scope, ctx);
        }
        const sizes = node.dims.map((d) => (d ? numOf(this.evaluate(d, scope, ctx), node.line) : 0));
        const build = (level) => {
          const size = sizes[level];
          if (size < 0) {
            throw new JavaRuntimeError('An array cannot have a negative size (' + size + ').', node.line);
          }
          const elemType = node.elemType.base + '[]'.repeat(sizes.length - level - 1);
          const items = [];
          for (let i = 0; i < size; i++) {
            items.push(level + 1 < sizes.length ? build(level + 1) : defaultValueFor(node.elemType.base));
          }
          return JArray(elemType, items);
        };
        return build(0);
      }

      case 'Call': return this.evaluateCall(node, scope, ctx);

      default:
        throw new JavaRuntimeError('I do not know how to evaluate a ' + node.type + '.', node.line);
    }
  }

  /** Resolve a bare identifier: local -> field of this -> static -> class name. */
  resolveName(node, scope, ctx) {
    const slot = scope.find(node.name);
    if (slot) return slot.value;

    if (ctx.thisValue && ctx.thisValue.v.fields.has(node.name)) {
      return ctx.thisValue.v.fields.get(node.name).value;
    }

    const statics = this.staticFields.get(ctx.className);
    if (statics && statics.has(node.name)) return statics.get(node.name).value;

    // A static field inherited from a superclass.
    let sup = this.classes.get(ctx.className)?.superclass;
    while (sup) {
      const s = this.staticFields.get(sup);
      if (s && s.has(node.name)) return s.get(node.name).value;
      sup = this.classes.get(sup)?.superclass;
    }

    if (this.classes.has(node.name) || STATICS[node.name] || STATIC_FIELDS[node.name]
        || node.name === 'System' || node.name === 'java' || node.name === 'javax') {
      // `java` / `javax` let fully-qualified calls like java.util.Arrays.sort()
      // resolve; callStaticOn() strips the package prefix again.
      return ClassRef(node.name);
    }

    throw new JavaRuntimeError(
      'I do not know what "' + node.name + '" is. Check the spelling, and make sure you declared it '
      + '(for example: int ' + node.name + ' = 0;) before using it.', node.line,
    );
  }

  evaluateField(node, scope, ctx) {
    // `System.out` is special-cased so `System.out.println` resolves cleanly.
    if (node.object.type === 'Name' && node.object.name === 'System' && node.name === 'out') {
      return ClassRef('System.out');
    }

    const target = this.evaluate(node.object, scope, ctx);

    if (target.t === 'classref') {
      const simple = simpleName(target.v);
      const consts = STATIC_FIELDS[simple];
      if (consts && consts[node.name] !== undefined) return consts[node.name];
      const slots = this.staticFields.get(simple);
      if (slots && slots.has(node.name)) return slots.get(node.name).value;
      return ClassRef(target.v + '.' + node.name);
    }

    if (node.name === 'length' && target.t === 'array') return JInt(target.v.items.length);

    if (target.t === 'null') {
      throw new JavaRuntimeError(
        'I tried to read "' + node.name + '" from something that is null.', node.line,
      );
    }

    if (target.t === 'object') {
      const slot = target.v.fields.get(node.name);
      if (slot) return slot.value;
      throw new JavaRuntimeError(
        'The class ' + target.v.className + ' has no field called "' + node.name + '".', node.line,
      );
    }

    throw new JavaRuntimeError(
      'I cannot read "' + node.name + '" from a ' + describeType(target) + '.', node.line,
    );
  }

  /** Produce a setter function for an assignable expression. */
  assignTarget(node, scope, ctx) {
    if (node.type === 'Name') {
      const slot = scope.find(node.name);
      if (slot) return { get: () => slot.value, set: (v) => { slot.value = this.coerce(v, slot.declaredType, node.line); } };

      if (ctx.thisValue && ctx.thisValue.v.fields.has(node.name)) {
        const f = ctx.thisValue.v.fields.get(node.name);
        return { get: () => f.value, set: (v) => { f.value = this.coerce(v, f.declaredType, node.line); } };
      }
      const statics = this.staticFields.get(ctx.className);
      if (statics && statics.has(node.name)) {
        const f = statics.get(node.name);
        return { get: () => f.value, set: (v) => { f.value = this.coerce(v, f.declaredType, node.line); } };
      }
      throw new JavaRuntimeError(
        'I cannot assign to "' + node.name + '" because it was never declared. '
        + 'Try writing its type first, like: int ' + node.name + ' = 0;', node.line,
      );
    }

    if (node.type === 'Field') {
      const target = this.evaluate(node.object, scope, ctx);
      if (target.t === 'classref') {
        const slots = this.staticFields.get(target.v);
        if (slots && slots.has(node.name)) {
          const f = slots.get(node.name);
          return { get: () => f.value, set: (v) => { f.value = this.coerce(v, f.declaredType, node.line); } };
        }
      }
      if (target.t === 'object') {
        const f = target.v.fields.get(node.name);
        if (f) return { get: () => f.value, set: (v) => { f.value = this.coerce(v, f.declaredType, node.line); } };
        throw new JavaRuntimeError(
          'The class ' + target.v.className + ' has no field called "' + node.name + '".', node.line,
        );
      }
      if (target.t === 'null') {
        throw new JavaRuntimeError('I tried to set "' + node.name + '" on something that is null.', node.line);
      }
      throw new JavaRuntimeError('I cannot assign to "' + node.name + '" here.', node.line);
    }

    if (node.type === 'Index') {
      const target = this.evaluate(node.object, scope, ctx);
      const idx = numOf(this.evaluate(node.index, scope, ctx), node.line);
      if (target.t === 'list') {
        if (idx < 0 || idx >= target.v.length) {
          throw new JavaRuntimeError('Index ' + idx + ' is out of bounds for a list of size ' + target.v.length + '.', node.line);
        }
        return { get: () => target.v[idx], set: (v) => { target.v[idx] = v; } };
      }
      if (target.t !== 'array') {
        throw new JavaRuntimeError(
          'Square brackets only work on arrays, but this is a ' + describeType(target) + '.', node.line,
        );
      }
      if (idx < 0 || idx >= target.v.items.length) {
        throw new JavaRuntimeError(
          'Index ' + idx + ' is out of bounds — this array has ' + target.v.items.length
          + ' slot' + (target.v.items.length === 1 ? '' : 's') + ', so the last valid index is '
          + (target.v.items.length - 1) + '.', node.line,
        );
      }
      return {
        get: () => target.v.items[idx],
        set: (v) => { target.v.items[idx] = this.coerce(v, target.v.elemType, node.line); },
      };
    }

    throw new JavaRuntimeError('This is not something you can assign to.', node.line);
  }

  evaluateAssign(node, scope, ctx) {
    const ref = this.assignTarget(node.target, scope, ctx);
    let value = this.evaluate(node.value, scope, ctx);

    if (node.op !== '=') {
      const op = node.op.slice(0, -1); // '+=' -> '+'
      value = this.applyBinary(op, ref.get(), value, node.line);
      // Compound assignment in Java has an implicit cast, so `int i; i += 1.5;`
      // is legal. Mirror that by truncating instead of erroring.
      const current = ref.get();
      if (current.t === 'int' && value.t === 'double') value = JInt(Math.trunc(value.v));
    }

    ref.set(value);
    return ref.get();
  }

  evaluateUpdate(node, scope, ctx) {
    const ref = this.assignTarget(node.operand, scope, ctx);
    const before = ref.get();
    const delta = node.op === '++' ? 1 : -1;
    const n = numOf(before, node.line) + delta;
    const after = before.t === 'double' ? JDouble(n)
      : before.t === 'long' ? JLong(n)
        : before.t === 'char' ? JChar(String.fromCharCode(n))
          : JInt(n);
    ref.set(after);
    return node.prefix ? ref.get() : before;
  }

  evaluateBinary(node, scope, ctx) {
    const left = this.evaluate(node.left, scope, ctx);
    const right = this.evaluate(node.right, scope, ctx);
    return this.applyBinary(node.op, left, right, node.line);
  }

  applyBinary(op, left, right, line) {
    // String concatenation wins over arithmetic for '+'.
    if (op === '+' && (left.t === 'String' || right.t === 'String')) {
      return JString(javaToString(left, this) + javaToString(right, this));
    }
    if (op === '+' && (left.t === 'sb' || right.t === 'sb')) {
      return JString(javaToString(left, this) + javaToString(right, this));
    }

    switch (op) {
      case '==': case '!=': {
        // Teaching moment: using == on Strings works here, but not in real Java.
        if (left.t === 'String' && right.t === 'String') {
          this.addWarning(
            'You compared two Strings with ' + op + '. It worked here, but in real Java you should use '
            + '.equals() — == compares whether they are the *same object*, not the same text.',
          );
        }
        const eq = valuesEqual(left, right, this);
        return JBool(op === '==' ? eq : !eq);
      }
      case '<': case '>': case '<=': case '>=': {
        const a = numOf(left, line);
        const b = numOf(right, line);
        return JBool(op === '<' ? a < b : op === '>' ? a > b : op === '<=' ? a <= b : a >= b);
      }
      case '&': case '|': case '^': {
        if (left.t === 'boolean' && right.t === 'boolean') {
          return JBool(op === '&' ? (left.v && right.v) : op === '|' ? (left.v || right.v) : (left.v !== right.v));
        }
        const a = numOf(left, line) | 0;
        const b = numOf(right, line) | 0;
        return JInt(op === '&' ? a & b : op === '|' ? a | b : a ^ b);
      }
      case '<<': return JInt(numOf(left, line) << numOf(right, line));
      case '>>': return JInt(numOf(left, line) >> numOf(right, line));
      case '>>>': return JInt(numOf(left, line) >>> numOf(right, line));
      default: break;
    }

    // Arithmetic: work out the result type the way Java's promotion rules do.
    const a = numOf(left, line);
    const b = numOf(right, line);
    const isDouble = left.t === 'double' || right.t === 'double' || left.t === 'float' || right.t === 'float';
    const isLong = !isDouble && (left.t === 'long' || right.t === 'long');

    let result;
    switch (op) {
      case '+': result = a + b; break;
      case '-': result = a - b; break;
      case '*': result = a * b; break;
      case '/': {
        if (!isDouble && b === 0) {
          throw new JavaRuntimeError(
            'You divided by zero. With whole numbers Java cannot do that — '
            + 'check the value on the right of the / before dividing.', line,
          );
        }
        result = a / b;
        if (!isDouble) result = Math.trunc(result); // integer division: 5 / 2 == 2
        break;
      }
      case '%': {
        if (!isDouble && b === 0) {
          throw new JavaRuntimeError('You used % with zero on the right, which Java cannot do.', line);
        }
        result = a % b;
        break;
      }
      default:
        throw new JavaRuntimeError('I do not know the operator "' + op + '".', line);
    }

    return isDouble ? JDouble(result) : isLong ? JLong(result) : JInt(result);
  }

  addWarning(text) {
    if (!this.warnings.includes(text)) this.warnings.push(text);
  }

  // ----- object creation --------------------------------------------------

  evaluateNew(node, scope, ctx) {
    const name = node.className;
    const args = node.args.map((a) => this.evaluate(a, scope, ctx));

    switch (name) {
      case 'ArrayList': case 'LinkedList': case 'List':
        return JList(args[0] && (args[0].t === 'list') ? [...args[0].v] : []);
      case 'HashMap': case 'TreeMap': case 'LinkedHashMap': case 'Map':
        return JMap(new Map());
      case 'HashSet': case 'TreeSet': case 'LinkedHashSet': case 'Set': {
        const m = new Map();
        if (args[0] && args[0].t === 'list') for (const it of args[0].v) m.set(hashKey(it), { key: it });
        return JSet(m);
      }
      case 'StringBuilder': case 'StringBuffer':
        return JSb(args[0] && args[0].t === 'String' ? args[0].v : '');
      case 'String':
        return JString(args[0] ? javaToString(args[0], this) : '');
      case 'Scanner':
        return { t: 'scanner', v: { tokens: null } };
      case 'Integer': return JInt(numOf(args[0], node.line));
      case 'Double': return JDouble(numOf(args[0], node.line));
      case 'Boolean': return JBool(args[0].v);
      case 'Random':
        throw new JavaRuntimeError(
          'Random is not available in this game, because the tests need your program to give '
          + 'the same answer every time. Use the numbers the problem gives you instead.', node.line,
        );
      default: break;
    }

    const cls = this.classes.get(name);
    if (!cls) {
      throw new JavaRuntimeError(
        'I do not know a class called "' + name + '". Did you define it, or misspell it?', node.line,
      );
    }
    return this.instantiate(cls, args, node.line);
  }

  instantiate(cls, args, line) {
    const fields = new Map();

    // Fields from superclasses first, so subclass declarations win.
    const chain = [];
    let c = cls;
    while (c) { chain.unshift(c); c = c.superclass ? this.classes.get(c.superclass) : null; }

    for (const k of chain) {
      for (const f of k.fields.filter((x) => !x.isStatic)) {
        fields.set(f.name, { value: defaultValueFor(f.varType.text), declaredType: f.varType.text });
      }
    }

    const obj = { t: 'object', v: { className: cls.name, fields, classDecl: cls } };

    // Run field initialisers in declaration order.
    for (const k of chain) {
      for (const f of k.fields.filter((x) => !x.isStatic && x.init)) {
        const v = this.evaluateInit(f.init, f.varType, new Scope(), { className: k.name, thisValue: obj });
        fields.get(f.name).value = this.coerce(v, f.varType.text, f.line);
      }
    }

    // Pick a constructor by argument count; fall back to any.
    const ctor = cls.ctors.find((x) => x.params.length === args.length) || cls.ctors[0];
    if (ctor) {
      if (ctor.params.length !== args.length) {
        throw new JavaRuntimeError(
          'The ' + cls.name + ' constructor takes ' + ctor.params.length + ' value(s), but you gave '
          + args.length + '.', line,
        );
      }
      this.invoke(ctor, args, obj, cls.name);
    } else if (args.length > 0) {
      throw new JavaRuntimeError(
        'The class ' + cls.name + ' has no constructor that takes ' + args.length + ' value(s). '
        + 'Add one like: public ' + cls.name + '(...) { ... }', line,
      );
    }

    return obj;
  }

  // ----- calls ------------------------------------------------------------

  evaluateCall(node, scope, ctx) {
    const callee = node.callee;

    // ---- super(...) / this(...) : constructor chaining --------------------
    if (callee.type === 'Super' || callee.type === 'This') {
      const targetClassName = callee.type === 'Super'
        ? this.classes.get(ctx.className)?.superclass
        : ctx.className;
      const cls = this.classes.get(targetClassName);
      if (!cls) {
        throw new JavaRuntimeError(
          callee.type === 'Super'
            ? 'super(...) only works when your class extends another class.'
            : 'this(...) could not find another constructor to call.',
          node.line,
        );
      }
      const args = node.args.map((a) => this.evaluate(a, scope, ctx));
      const ctor = cls.ctors.find((c) => c.params.length === args.length) || cls.ctors[0];
      if (!ctor) {
        if (args.length === 0) return VOID; // implicit no-arg superclass constructor
        throw new JavaRuntimeError(
          'The class ' + cls.name + ' has no constructor taking ' + args.length + ' value(s).', node.line,
        );
      }
      const coerced = args.map((v, i) => this.coerce(v, ctor.params[i]?.varType.text, node.line));
      this.invoke(ctor, coerced, ctx.thisValue, cls.name);
      return VOID;
    }

    // ---- obj.method(...) / Class.method(...) / System.out.println(...) ----
    if (callee.type === 'Field') {
      // Print family, resolved before generic evaluation for speed + clarity.
      if (this.isSystemOut(callee.object, ctx)) {
        return this.doPrint(callee.name, node.args.map((a) => this.evaluate(a, scope, ctx)), node.line);
      }

      const target = this.evaluate(callee.object, scope, ctx);
      const args = node.args.map((a) => this.evaluate(a, scope, ctx));

      if (target.t === 'classref') {
        return this.callStaticOn(target.v, callee.name, args, node.line);
      }
      if (target.t === 'scanner') {
        return this.scannerMethod(callee.name, node.line);
      }
      return this.callMethod(target, callee.name, args, node.line, callee.object.type === 'Super' ? ctx : null);
    }

    // ---- bareMethod(...) : a method on the current class ------------------
    if (callee.type === 'Name') {
      const args = node.args.map((a) => this.evaluate(a, scope, ctx));

      if (ctx.thisValue) {
        const found = this.findMethod(ctx.thisValue.v.className, callee.name, args.length)
          || this.findMethod(ctx.thisValue.v.className, callee.name);
        if (found) {
          const coerced = args.map((v, i) => this.coerce(v, found.method.params[i]?.varType.text, node.line));
          return this.invoke(found.method, coerced, found.method.isStatic ? null : ctx.thisValue, found.className);
        }
      }

      const own = this.findInClass(ctx.className, callee.name, args.length) || this.findStaticAnywhere(callee.name, args.length);
      if (own) {
        if (own.method.params.length !== args.length) {
          throw new JavaRuntimeError(
            'The method ' + callee.name + ' takes ' + own.method.params.length + ' value(s), but you gave '
            + args.length + '.', node.line,
          );
        }
        const coerced = args.map((v, i) => this.coerce(v, own.method.params[i].varType.text, node.line));
        return this.invoke(own.method, coerced, own.method.isStatic ? null : ctx.thisValue, own.className);
      }

      throw new JavaRuntimeError(
        'I could not find a method called "' + callee.name + '" that takes ' + args.length
        + ' value(s). Check the spelling and the number of arguments.', node.line,
      );
    }

    throw new JavaRuntimeError('This is not something that can be called like a method.', node.line);
  }

  findInClass(className, name, arity) {
    const cls = this.classes.get(className);
    if (!cls) return null;
    const m = cls.methods.find((x) => x.name === name && x.body && (arity === undefined || x.params.length === arity));
    return m ? { method: m, className } : null;
  }

  isSystemOut(objNode, ctx) {
    if (objNode.type !== 'Field') return false;
    if (objNode.name !== 'out' && objNode.name !== 'err') return false;
    return objNode.object.type === 'Name' && objNode.object.name === 'System';
  }

  doPrint(name, args, line) {
    switch (name) {
      case 'println':
        this.write((args.length ? javaToString(args[0], this) : '') + '\n');
        return VOID;
      case 'print':
        this.write(args.length ? javaToString(args[0], this) : '');
        return VOID;
      case 'printf': case 'format':
        this.write(javaFormat(javaToString(args[0], this), args.slice(1), this));
        return VOID;
      case 'flush': return VOID;
      default:
        throw new JavaRuntimeError(
          'System.out has no method called "' + name + '". Did you mean println?', line,
        );
    }
  }

  /**
   * Static call on a built-in (Math.abs) or on a user class (Helper.doIt).
   * Fully-qualified names like java.util.Arrays are reduced to "Arrays" first.
   */
  callStaticOn(qualifiedName, methodName, args, line) {
    if (qualifiedName === 'System.out' || qualifiedName === 'System.err') {
      return this.doPrint(methodName, args, line);
    }
    const className = simpleName(qualifiedName);
    const table = STATICS[className];
    if (table && table[methodName]) return table[methodName](args, line, this);

    const cls = this.classes.get(className);
    if (cls) {
      const found = this.findMethod(className, methodName, args.length) || this.findMethod(className, methodName);
      if (found) {
        const coerced = args.map((v, i) => this.coerce(v, found.method.params[i]?.varType.text, line));
        return this.invoke(found.method, coerced, null, found.className);
      }
    }

    if (table) {
      throw new JavaRuntimeError(
        className + ' has no method called "' + methodName + '". Available: '
        + Object.keys(table).slice(0, 12).join(', ') + '.', line,
      );
    }
    throw new JavaRuntimeError(
      'I do not know how to call ' + className + '.' + methodName + '().', line,
    );
  }

  /** Instance method call: built-in types first, then user classes. */
  callMethod(receiver, name, args, line, superCtx) {
    if (receiver.t === 'object') {
      // `super.foo()` must start the search at the superclass.
      const startClass = superCtx
        ? this.classes.get(superCtx.className)?.superclass || receiver.v.className
        : receiver.v.className;
      const found = this.findMethod(startClass, name, args.length) || this.findMethod(startClass, name);
      if (found) {
        const coerced = args.map((v, i) => this.coerce(v, found.method.params[i]?.varType.text, line));
        return this.invoke(found.method, coerced, receiver, found.className);
      }
      if (name === 'toString') return JString(javaToString(receiver, this));
      if (name === 'equals') return JBool(valuesEqual(receiver, args[0], this));
      if (name === 'getClass') return ClassRef(receiver.v.className);
      throw new JavaRuntimeError(
        'The class ' + receiver.v.className + ' has no method called "' + name + '" taking '
        + args.length + ' value(s).', line,
      );
    }

    const builtin = callBuiltinMethod(receiver, name, args, line, this);
    if (builtin !== undefined) return builtin;

    throw new JavaRuntimeError(
      'A ' + describeType(receiver) + ' has no method called "' + name + '".', line,
    );
  }

  // ----- Scanner (stdin) --------------------------------------------------

  scannerMethod(name, line) {
    const nextToken = () => {
      while (this.stdinPos < this.stdinLines.length) {
        const parts = this.stdinLines[this.stdinPos].trim().split(/\s+/).filter(Boolean);
        if (parts.length) {
          const tok = parts.shift();
          this.stdinLines[this.stdinPos] = parts.join(' ');
          return tok;
        }
        this.stdinPos++;
      }
      return null;
    };

    switch (name) {
      case 'nextLine': {
        if (this.stdinPos >= this.stdinLines.length) {
          throw new JavaRuntimeError('The program asked for another line of input, but there is none left.', line);
        }
        return JString(this.stdinLines[this.stdinPos++]);
      }
      case 'next': {
        const t = nextToken();
        if (t === null) throw new JavaRuntimeError('The program asked for more input, but there is none left.', line);
        return JString(t);
      }
      case 'nextInt': {
        const t = nextToken();
        if (t === null) throw new JavaRuntimeError('The program asked for another number, but there is none left.', line);
        return JInt(Number(t));
      }
      case 'nextDouble': {
        const t = nextToken();
        if (t === null) throw new JavaRuntimeError('The program asked for another number, but there is none left.', line);
        return JDouble(Number(t));
      }
      case 'nextBoolean': return JBool(String(nextToken()).toLowerCase() === 'true');
      case 'hasNext': case 'hasNextInt': case 'hasNextLine':
        return JBool(this.stdinPos < this.stdinLines.length);
      case 'close': return VOID;
      default:
        throw new JavaRuntimeError('Scanner has no method called "' + name + '".', line);
    }
  }
}

// ---------------------------------------------------------------------------
// Bridging between JavaScript test data and Java values
// ---------------------------------------------------------------------------

/** Convert a plain JS value from a test case into a Java value. */
export function jsToJava(x) {
  if (x === null || x === undefined) return NULL;
  if (typeof x === 'number') return Number.isInteger(x) ? JInt(x) : JDouble(x);
  if (typeof x === 'boolean') return JBool(x);
  if (typeof x === 'string') return JString(x);
  if (Array.isArray(x)) {
    const items = x.map(jsToJava);
    const elemType = items.length === 0 ? 'int'
      : items.every((i) => i.t === 'int') ? 'int'
        : items.every((i) => isNumeric(i.t)) ? 'double'
          : items.every((i) => i.t === 'String') ? 'String'
            : items.every((i) => i.t === 'boolean') ? 'boolean' : 'Object';
    return JArray(elemType, items.map((i) => (elemType === 'double' && i.t === 'int' ? JDouble(i.v) : i)));
  }
  if (typeof x === 'object') {
    const m = new Map();
    for (const [k, v] of Object.entries(x)) {
      const key = JString(k);
      m.set(hashKey(key), { key, val: jsToJava(v) });
    }
    return JMap(m);
  }
  return NULL;
}

/** Convert a Java value back to plain JS so the grader can compare it. */
export function javaToJs(value, interp) {
  switch (value.t) {
    case 'null': case 'void': return null;
    case 'int': case 'long': case 'double': return value.v;
    case 'boolean': return value.v;
    case 'char': case 'String': return value.v;
    case 'sb': return value.v.s;
    case 'array': return value.v.items.map((i) => javaToJs(i, interp));
    case 'list': return value.v.map((i) => javaToJs(i, interp));
    case 'set': return [...value.v.values()].map((e) => javaToJs(e.key, interp));
    case 'map': {
      const o = {};
      for (const e of value.v.values()) o[javaToString(e.key, interp)] = javaToJs(e.val, interp);
      return o;
    }
    case 'object': return javaToString(value, interp);
    default: return value.v;
  }
}

// ---------------------------------------------------------------------------
// Public API used by the grader
// ---------------------------------------------------------------------------

/**
 * Run a Java program's main method.
 * @returns {{ok:boolean, output:string, warnings:string[], error?:{message:string,line:number|null}}}
 */
export function runJavaMain(source, options = {}) {
  const interp = new Interpreter(options);
  try {
    interp.load(source);
    interp.runMain();
    return { ok: true, output: interp.getOutput(), warnings: interp.warnings };
  } catch (err) {
    return packError(err, interp);
  }
}

/**
 * Run one static method with arguments and capture its return value.
 * @returns {{ok:boolean, output:string, result?:*, warnings:string[], error?:object}}
 */
export function runJavaFunction(source, methodName, args, options = {}) {
  const interp = new Interpreter(options);
  try {
    interp.load(source);
    const returned = interp.callStatic(methodName, args.map(jsToJava));
    return {
      ok: true,
      output: interp.getOutput(),
      result: javaToJs(returned, interp),
      warnings: interp.warnings,
    };
  } catch (err) {
    return packError(err, interp);
  }
}

/** Normalise any thrown error into something we can show a student. */
function packError(err, interp) {
  if (err instanceof JavaSyntaxError || err instanceof JavaRuntimeError || err.friendly) {
    return {
      ok: false,
      output: interp.getOutput(),
      warnings: interp.warnings,
      error: {
        kind: err.name === 'JavaSyntaxError' ? 'syntax' : 'runtime',
        message: err.message,
        line: err.line ?? null,
      },
    };
  }
  if (err instanceof RangeError) {
    return {
      ok: false,
      output: interp.getOutput(),
      warnings: interp.warnings,
      error: { kind: 'runtime', message: 'Your code recursed too deeply — check that the base case returns.', line: null },
    };
  }
  return {
    ok: false,
    output: interp.getOutput(),
    warnings: interp.warnings,
    error: { kind: 'internal', message: 'Something went wrong running your code: ' + err.message, line: null },
  };
}

/** "java.util.Arrays" -> "Arrays". Used to accept fully-qualified calls. */
function simpleName(qualified) {
  const i = qualified.lastIndexOf('.');
  return i === -1 ? qualified : qualified.slice(i + 1);
}
