/**
 * Java runtime values + standard library for the Hello, Tycoon! interpreter.
 *
 * WHY VALUES ARE TAGGED
 * Every Java value is represented as a small object { t, v }:
 *   t = the Java type tag ('int', 'double', 'boolean', 'char', 'String',
 *       'array', 'list', 'map', 'sb', 'object', 'null')
 *   v = the underlying JavaScript value
 *
 * Carrying the type is what lets us reproduce the two Java behaviours students
 * trip over constantly, which a naive JS-backed interpreter gets wrong:
 *   1. Integer division:   5 / 2  ==  2      (not 2.5)
 *   2. Double printing:    System.out.println(1.0)  prints "1.0"  (not "1")
 *
 * TEACHERS: the bottom half of this file is the built-in library (String
 * methods, Math, ArrayList, ...). If a problem you write needs a method we
 * don't have yet, add it to the relevant table down there — each one is just a
 * small function from (receiver, args) to a value.
 */

/** Thrown for runtime problems (null access, bad index, ...). Student-safe text. */
export class JavaRuntimeError extends Error {
  constructor(message, line) {
    super(message);
    this.name = 'JavaRuntimeError';
    this.line = line;
    this.friendly = true;
  }
}

// ---------------------------------------------------------------------------
// Value constructors
// ---------------------------------------------------------------------------

/** 32-bit wrap, matching Java int overflow. */
const wrapInt = (n) => n | 0;

export const VOID = { t: 'void', v: null };
export const NULL = { t: 'null', v: null };

export const JInt = (n) => ({ t: 'int', v: wrapInt(Math.trunc(n)) });
export const JLong = (n) => ({ t: 'long', v: Math.trunc(n) });
export const JDouble = (n) => ({ t: 'double', v: n });
export const JBool = (b) => ({ t: 'boolean', v: !!b });
export const JChar = (c) => ({ t: 'char', v: c });
export const JString = (s) => ({ t: 'String', v: s });
export const JArray = (elemType, items) => ({ t: 'array', v: { elemType, items } });
export const JList = (items = []) => ({ t: 'list', v: items });
export const JMap = (entries) => ({ t: 'map', v: entries || new Map() });
export const JSet = (entries) => ({ t: 'set', v: entries || new Map() });
export const JSb = (s = '') => ({ t: 'sb', v: { s } });

/** True for tags that behave like numbers in arithmetic. */
export const isNumeric = (t) => t === 'int' || t === 'long' || t === 'double' || t === 'char';

/** The default value Java gives an uninitialised field of this type. */
export function defaultValueFor(typeText) {
  switch (typeText) {
    case 'int': case 'short': case 'byte': return JInt(0);
    case 'long': return JLong(0);
    case 'double': case 'float': return JDouble(0);
    case 'boolean': return JBool(false);
    case 'char': return JChar('\0');
    default: return NULL;
  }
}

// ---------------------------------------------------------------------------
// Conversion & printing
// ---------------------------------------------------------------------------

/** Numeric payload of a value, with char promoting to its code point. */
export function numOf(value, line) {
  if (value.t === 'char') return value.v.charCodeAt(0);
  if (isNumeric(value.t)) return value.v;
  if (value.t === 'null') {
    throw new JavaRuntimeError('I tried to do maths with null. A variable here was never given a value.', line);
  }
  throw new JavaRuntimeError(
    'I expected a number here but found a ' + describeType(value) + '.', line,
  );
}

/** Friendly type name for error messages. */
export function describeType(value) {
  switch (value.t) {
    case 'String': return 'String (text)';
    case 'array': return 'array';
    case 'list': return 'ArrayList';
    case 'map': return 'HashMap';
    case 'sb': return 'StringBuilder';
    case 'object': return value.v.className;
    case 'null': return 'null';
    default: return value.t;
  }
}

/**
 * Format a double the way Java's Double.toString does for classroom-sized
 * numbers: whole numbers get a ".0" suffix.
 */
export function formatDouble(n) {
  if (Number.isNaN(n)) return 'NaN';
  if (n === Infinity) return 'Infinity';
  if (n === -Infinity) return '-Infinity';
  if (Number.isInteger(n) && Math.abs(n) < 1e7) return n.toFixed(1);
  // Java switches to scientific notation at 1e7 and below 1e-3, same as this.
  if (n !== 0 && (Math.abs(n) >= 1e7 || Math.abs(n) < 1e-3)) {
    return n.toExponential().replace('e+', 'E').replace('e-', 'E-');
  }
  return String(n);
}

/**
 * Java's String.valueOf / implicit string conversion.
 * `ctx` (optional) lets us call a user-defined toString() on objects.
 */
export function javaToString(value, ctx) {
  switch (value.t) {
    case 'null': return 'null';
    case 'void': return 'null';
    case 'String': return value.v;
    case 'char': return value.v;
    case 'boolean': return value.v ? 'true' : 'false';
    case 'int': case 'long': return String(value.v);
    case 'double': return formatDouble(value.v);
    case 'sb': return value.v.s;
    case 'array':
      // Real Java prints something like "[I@6d06d69c" here. We keep that
      // behaviour on purpose so students learn to reach for Arrays.toString().
      return '[' + (value.v.elemType === 'int' ? 'I' : 'L' + value.v.elemType + ';') + '@1b6d3586';
    case 'list':
      return '[' + value.v.map((e) => javaToString(e, ctx)).join(', ') + ']';
    case 'set':
      return '[' + [...value.v.values()].map((e) => javaToString(e.key, ctx)).join(', ') + ']';
    case 'map':
      return '{' + [...value.v.values()]
        .map((e) => javaToString(e.key, ctx) + '=' + javaToString(e.val, ctx)).join(', ') + '}';
    case 'object': {
      if (ctx && ctx.findMethod(value.v.className, 'toString', 0)) {
        const r = ctx.callMethod(value, 'toString', []);
        return r.t === 'String' ? r.v : javaToString(r, ctx);
      }
      return value.v.className + '@1b6d3586';
    }
    default: return String(value.v);
  }
}

/** Java `==` / .equals() semantics, used by tests and by map keys. */
export function valuesEqual(a, b, ctx) {
  if (a.t === 'null' || b.t === 'null') return a.t === b.t;
  if (isNumeric(a.t) && isNumeric(b.t)) return numOf(a) === numOf(b);
  if (a.t === 'boolean' && b.t === 'boolean') return a.v === b.v;
  if (a.t === 'String' && b.t === 'String') return a.v === b.v;
  if (a.t === 'list' && b.t === 'list') {
    return a.v.length === b.v.length && a.v.every((x, i) => valuesEqual(x, b.v[i], ctx));
  }
  if (a.t === 'array' && b.t === 'array') {
    return a.v.items.length === b.v.items.length
      && a.v.items.every((x, i) => valuesEqual(x, b.v.items[i], ctx));
  }
  if (a.t === 'object' && b.t === 'object') {
    if (ctx && ctx.findMethod(a.v.className, 'equals', 1)) {
      return !!ctx.callMethod(a, 'equals', [b]).v;
    }
    return a.v === b.v; // identity, like Object.equals
  }
  return a === b;
}

/** Stable string key used for HashMap / HashSet buckets. */
export function hashKey(value) {
  if (value.t === 'null') return 'null';
  if (isNumeric(value.t)) return 'n:' + numOf(value);
  if (value.t === 'boolean') return 'b:' + value.v;
  if (value.t === 'String') return 's:' + value.v;
  if (value.t === 'list' || value.t === 'array') {
    const items = value.t === 'list' ? value.v : value.v.items;
    return 'a:[' + items.map(hashKey).join(',') + ']';
  }
  return 'o:' + (value.v.__id || (value.v.__id = ++hashKey.counter));
}
hashKey.counter = 0;

// ---------------------------------------------------------------------------
// String.format / printf
// ---------------------------------------------------------------------------

/**
 * Minimal but faithful implementation of Java's format strings.
 * Supports: %d %s %f %b %c %n %% with optional flags, width and precision,
 * e.g. "%-10s|%05.2f%n".
 */
export function javaFormat(fmt, args, ctx) {
  let argIndex = 0;
  return fmt.replace(
    /%(-)?(0)?(\+)?(,)?(\d+)?(?:\.(\d+))?([dsfbcn%])/g,
    (match, leftAlign, zeroPad, plusSign, comma, width, precision, conv) => {
      if (conv === '%') return '%';
      if (conv === 'n') return '\n';

      const arg = args[argIndex++];
      if (arg === undefined) {
        throw new JavaRuntimeError(
          'Your format string has more % placeholders than values to fill them.', null,
        );
      }

      let out;
      switch (conv) {
        case 'd': {
          let n = Math.trunc(numOf(arg));
          out = String(Math.abs(n));
          if (comma) out = out.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
          if (n < 0) out = '-' + out;
          else if (plusSign) out = '+' + out;
          break;
        }
        case 'f': {
          const p = precision === undefined ? 6 : Number(precision);
          let n = numOf(arg);
          out = Math.abs(n).toFixed(p);
          if (comma) {
            const [ip, fp] = out.split('.');
            out = ip.replace(/\B(?=(\d{3})+(?!\d))/g, ',') + (fp ? '.' + fp : '');
          }
          if (n < 0) out = '-' + out;
          else if (plusSign) out = '+' + out;
          break;
        }
        case 's':
          out = javaToString(arg, ctx);
          if (precision !== undefined) out = out.slice(0, Number(precision));
          break;
        case 'b': out = arg.t === 'null' ? 'false' : (arg.t === 'boolean' ? String(arg.v) : 'true'); break;
        case 'c': out = arg.t === 'char' ? arg.v : String.fromCharCode(numOf(arg)); break;
        default: out = javaToString(arg, ctx);
      }

      const w = width ? Number(width) : 0;
      if (out.length < w) {
        if (leftAlign) out = out.padEnd(w, ' ');
        else if (zeroPad && (conv === 'd' || conv === 'f')) {
          const neg = out.startsWith('-') || out.startsWith('+');
          out = neg ? out[0] + out.slice(1).padStart(w - 1, '0') : out.padStart(w, '0');
        } else out = out.padStart(w, ' ');
      }
      return out;
    },
  );
}

// ---------------------------------------------------------------------------
// Instance methods on built-in types
// ---------------------------------------------------------------------------

const checkIndex = (i, len, line, what) => {
  if (!Number.isInteger(i) || i < 0 || i >= len) {
    throw new JavaRuntimeError(
      'Index ' + i + ' is out of bounds — this ' + what + ' has ' + len
      + ' slot' + (len === 1 ? '' : 's') + ', so valid indexes are 0 to ' + (len - 1) + '.',
      line,
    );
  }
};

/** Methods available on a String receiver. */
const STRING_METHODS = {
  length: (s) => JInt(s.length),
  isEmpty: (s) => JBool(s.length === 0),
  isBlank: (s) => JBool(s.trim().length === 0),
  charAt: (s, [i], line) => { const n = numOf(i); checkIndex(n, s.length, line, 'String'); return JChar(s[n]); },
  indexOf: (s, [a, from]) => JInt(s.indexOf(javaToString(a), from ? numOf(from) : 0)),
  lastIndexOf: (s, [a]) => JInt(s.lastIndexOf(javaToString(a))),
  contains: (s, [a]) => JBool(s.includes(javaToString(a))),
  substring: (s, [a, b], line) => {
    const start = numOf(a);
    const end = b === undefined ? s.length : numOf(b);
    if (start < 0 || end > s.length || start > end) {
      throw new JavaRuntimeError(
        'substring(' + start + (b === undefined ? '' : ', ' + end) + ') does not fit in a String of length '
        + s.length + '.', line,
      );
    }
    return JString(s.slice(start, end));
  },
  toUpperCase: (s) => JString(s.toUpperCase()),
  toLowerCase: (s) => JString(s.toLowerCase()),
  trim: (s) => JString(s.trim()),
  strip: (s) => JString(s.trim()),
  equals: (s, [a]) => JBool(a.t === 'String' && a.v === s),
  equalsIgnoreCase: (s, [a]) => JBool(a.t === 'String' && a.v.toLowerCase() === s.toLowerCase()),
  compareTo: (s, [a]) => { const o = javaToString(a); return JInt(s < o ? -1 : s > o ? 1 : 0); },
  startsWith: (s, [a]) => JBool(s.startsWith(javaToString(a))),
  endsWith: (s, [a]) => JBool(s.endsWith(javaToString(a))),
  concat: (s, [a]) => JString(s + javaToString(a)),
  replace: (s, [a, b]) => JString(s.split(javaToString(a)).join(javaToString(b))),
  repeat: (s, [a]) => JString(s.repeat(numOf(a))),
  split: (s, [a]) => {
    const sep = javaToString(a);
    // Java's split takes a regex; the separators students use ("," " " "\\s+")
    // are handled here without exposing full regex behaviour.
    const parts = sep === '\\s+' ? s.trim().split(/\s+/) : s.split(sep);
    return JArray('String', parts.map(JString));
  },
  toCharArray: (s) => JArray('char', [...s].map(JChar)),
  chars: (s) => JList([...s].map((c) => JInt(c.charCodeAt(0)))),
  hashCode: (s) => { let h = 0; for (let i = 0; i < s.length; i++) h = wrapInt(31 * h + s.charCodeAt(i)); return JInt(h); },
  toString: (s) => JString(s),
  matches: (s, [a]) => { try { return JBool(new RegExp('^(?:' + javaToString(a) + ')$').test(s)); } catch { return JBool(false); } },
};

/** Methods available on an ArrayList / List receiver. */
const LIST_METHODS = {
  add: (items, args) => {
    if (args.length === 2) { items.splice(numOf(args[0]), 0, args[1]); return VOID; }
    items.push(args[0]); return JBool(true);
  },
  get: (items, [i], line) => { const n = numOf(i); checkIndex(n, items.length, line, 'list'); return items[n]; },
  set: (items, [i, e], line) => { const n = numOf(i); checkIndex(n, items.length, line, 'list'); const old = items[n]; items[n] = e; return old; },
  size: (items) => JInt(items.length),
  isEmpty: (items) => JBool(items.length === 0),
  clear: (items) => { items.length = 0; return VOID; },
  remove: (items, [a], line, ctx) => {
    // remove(int index) vs remove(Object) — Java picks by static type; we use
    // the runtime tag, which matches what students mean in practice.
    if (a.t === 'int') { const n = a.v; checkIndex(n, items.length, line, 'list'); return items.splice(n, 1)[0]; }
    const idx = items.findIndex((x) => valuesEqual(x, a, ctx));
    if (idx >= 0) { items.splice(idx, 1); return JBool(true); }
    return JBool(false);
  },
  contains: (items, [a], line, ctx) => JBool(items.some((x) => valuesEqual(x, a, ctx))),
  indexOf: (items, [a], line, ctx) => JInt(items.findIndex((x) => valuesEqual(x, a, ctx))),
  addAll: (items, [a]) => { items.push(...(a.t === 'list' ? a.v : a.v.items)); return JBool(true); },
  toString: (items, args, line, ctx) => JString(javaToString(JList(items), ctx)),
  sort: (items) => { sortValues(items); return VOID; },
};

/** Methods available on a HashMap receiver. `entries` is a Map of hashKey -> {key,val}. */
const MAP_METHODS = {
  put: (entries, [k, v]) => {
    const key = hashKey(k);
    const prev = entries.get(key);
    entries.set(key, { key: k, val: v });
    return prev ? prev.val : NULL;
  },
  get: (entries, [k]) => { const e = entries.get(hashKey(k)); return e ? e.val : NULL; },
  getOrDefault: (entries, [k, d]) => { const e = entries.get(hashKey(k)); return e ? e.val : d; },
  containsKey: (entries, [k]) => JBool(entries.has(hashKey(k))),
  containsValue: (entries, [v], line, ctx) => JBool([...entries.values()].some((e) => valuesEqual(e.val, v, ctx))),
  remove: (entries, [k]) => { const key = hashKey(k); const e = entries.get(key); entries.delete(key); return e ? e.val : NULL; },
  size: (entries) => JInt(entries.size),
  isEmpty: (entries) => JBool(entries.size === 0),
  clear: (entries) => { entries.clear(); return VOID; },
  keySet: (entries) => { const m = new Map(); for (const [k, e] of entries) m.set(k, { key: e.key }); return JSet(m); },
  values: (entries) => JList([...entries.values()].map((e) => e.val)),
  toString: (entries, args, line, ctx) => JString(javaToString(JMap(entries), ctx)),
};

/** Methods available on a HashSet receiver. */
const SET_METHODS = {
  add: (entries, [a]) => { const k = hashKey(a); if (entries.has(k)) return JBool(false); entries.set(k, { key: a }); return JBool(true); },
  contains: (entries, [a]) => JBool(entries.has(hashKey(a))),
  remove: (entries, [a]) => JBool(entries.delete(hashKey(a))),
  size: (entries) => JInt(entries.size),
  isEmpty: (entries) => JBool(entries.size === 0),
  clear: (entries) => { entries.clear(); return VOID; },
  addAll: (entries, [a]) => { const items = a.t === 'list' ? a.v : a.v.items; for (const it of items) entries.set(hashKey(it), { key: it }); return JBool(true); },
  toString: (entries, args, line, ctx) => JString(javaToString(JSet(entries), ctx)),
};

/** Methods available on a StringBuilder receiver. `box` is { s }. */
const SB_METHODS = {
  // Returns the same builder so chained calls work: sb.append("a").append("b")
  append: (box, [a], line, ctx) => { box.s += javaToString(a, ctx); return { t: 'sb', v: box }; },
  toString: (box) => JString(box.s),
  length: (box) => JInt(box.s.length),
  charAt: (box, [i], line) => { const n = numOf(i); checkIndex(n, box.s.length, line, 'StringBuilder'); return JChar(box.s[n]); },
  reverse: (box) => { box.s = [...box.s].reverse().join(''); return { t: 'sb', v: box }; },
  insert: (box, [i, a], line, ctx) => { const n = numOf(i); box.s = box.s.slice(0, n) + javaToString(a, ctx) + box.s.slice(n); return { t: 'sb', v: box }; },
  deleteCharAt: (box, [i], line) => { const n = numOf(i); checkIndex(n, box.s.length, line, 'StringBuilder'); box.s = box.s.slice(0, n) + box.s.slice(n + 1); return { t: 'sb', v: box }; },
  setCharAt: (box, [i, c], line) => { const n = numOf(i); checkIndex(n, box.s.length, line, 'StringBuilder'); box.s = box.s.slice(0, n) + c.v + box.s.slice(n + 1); return VOID; },
  setLength: (box, [i]) => { const n = numOf(i); box.s = box.s.slice(0, n).padEnd(n, '\0'); return VOID; },
  isEmpty: (box) => JBool(box.s.length === 0),
};

/** Sort a JS array of values in place using Java's natural ordering. */
export function sortValues(items) {
  items.sort((a, b) => {
    if (a.t === 'String' && b.t === 'String') return a.v < b.v ? -1 : a.v > b.v ? 1 : 0;
    if (a.t === 'char' && b.t === 'char') return a.v < b.v ? -1 : a.v > b.v ? 1 : 0;
    return numOf(a) - numOf(b);
  });
  return items;
}

/**
 * Call a method on a built-in (non user-defined) receiver.
 * Returns undefined if the receiver type has no such method, so the
 * interpreter can fall back to user-defined classes and then report a
 * helpful "no such method" error.
 */
export function callBuiltinMethod(receiver, name, args, line, ctx) {
  let table = null;
  let target = null;

  switch (receiver.t) {
    case 'String': table = STRING_METHODS; target = receiver.v; break;
    case 'list': table = LIST_METHODS; target = receiver.v; break;
    case 'map': table = MAP_METHODS; target = receiver.v; break;
    case 'set': table = SET_METHODS; target = receiver.v; break;
    case 'sb': table = SB_METHODS; target = receiver.v; break;
    case 'array':
      if (name === 'length') return JInt(receiver.v.items.length);
      return undefined;
    case 'int': case 'long': case 'double': case 'boolean': case 'char':
      // Autoboxed helpers students reach for on wrapper objects.
      if (name === 'equals') return JBool(valuesEqual(receiver, args[0], ctx));
      if (name === 'toString') return JString(javaToString(receiver, ctx));
      if (name === 'compareTo') return JInt(Math.sign(numOf(receiver) - numOf(args[0])));
      if (name === 'intValue') return JInt(numOf(receiver));
      if (name === 'doubleValue') return JDouble(numOf(receiver));
      return undefined;
    case 'null':
      throw new JavaRuntimeError(
        'I tried to call .' + name + '() on something that is null. '
        + 'A variable here was never given a real value.', line,
      );
    default: return undefined;
  }

  const fn = table[name];
  if (!fn) return undefined;
  return fn(target, args, line, ctx);
}

// ---------------------------------------------------------------------------
// Static classes (Math, Integer, Arrays, ...)
// ---------------------------------------------------------------------------

/**
 * Static methods, keyed by ClassName then method name.
 * TEACHERS: add new helpers here, e.g. STATICS.Math.clamp = (args) => ...
 */
export const STATICS = {
  Math: {
    abs: ([a]) => (a.t === 'double' ? JDouble(Math.abs(a.v)) : JInt(Math.abs(numOf(a)))),
    max: ([a, b]) => (a.t === 'double' || b.t === 'double' ? JDouble(Math.max(numOf(a), numOf(b))) : JInt(Math.max(numOf(a), numOf(b)))),
    min: ([a, b]) => (a.t === 'double' || b.t === 'double' ? JDouble(Math.min(numOf(a), numOf(b))) : JInt(Math.min(numOf(a), numOf(b)))),
    pow: ([a, b]) => JDouble(Math.pow(numOf(a), numOf(b))),
    sqrt: ([a]) => JDouble(Math.sqrt(numOf(a))),
    cbrt: ([a]) => JDouble(Math.cbrt(numOf(a))),
    floor: ([a]) => JDouble(Math.floor(numOf(a))),
    ceil: ([a]) => JDouble(Math.ceil(numOf(a))),
    round: ([a]) => JLong(Math.round(numOf(a))),
    random: () => JDouble(Math.random()),
    hypot: ([a, b]) => JDouble(Math.hypot(numOf(a), numOf(b))),
    log: ([a]) => JDouble(Math.log(numOf(a))),
    log10: ([a]) => JDouble(Math.log10(numOf(a))),
    exp: ([a]) => JDouble(Math.exp(numOf(a))),
    sin: ([a]) => JDouble(Math.sin(numOf(a))),
    cos: ([a]) => JDouble(Math.cos(numOf(a))),
    tan: ([a]) => JDouble(Math.tan(numOf(a))),
    toRadians: ([a]) => JDouble((numOf(a) * Math.PI) / 180),
    signum: ([a]) => JDouble(Math.sign(numOf(a))),
  },
  Integer: {
    parseInt: ([a], line) => {
      const s = javaToString(a).trim();
      if (!/^[+-]?\d+$/.test(s)) {
        throw new JavaRuntimeError(
          'Integer.parseInt could not turn "' + s + '" into a whole number.', line,
        );
      }
      return JInt(Number(s));
    },
    valueOf: ([a]) => (a.t === 'String' ? JInt(Number(a.v)) : JInt(numOf(a))),
    toString: ([a]) => JString(String(Math.trunc(numOf(a)))),
    toBinaryString: ([a]) => JString((numOf(a) >>> 0).toString(2)),
    compare: ([a, b]) => JInt(Math.sign(numOf(a) - numOf(b))),
    max: ([a, b]) => JInt(Math.max(numOf(a), numOf(b))),
    min: ([a, b]) => JInt(Math.min(numOf(a), numOf(b))),
    sum: ([a, b]) => JInt(numOf(a) + numOf(b)),
  },
  Double: {
    parseDouble: ([a], line) => {
      const s = javaToString(a).trim();
      const n = Number(s);
      if (s === '' || Number.isNaN(n)) {
        throw new JavaRuntimeError('Double.parseDouble could not turn "' + s + '" into a number.', line);
      }
      return JDouble(n);
    },
    valueOf: ([a]) => JDouble(a.t === 'String' ? Number(a.v) : numOf(a)),
    toString: ([a]) => JString(formatDouble(numOf(a))),
    compare: ([a, b]) => JInt(Math.sign(numOf(a) - numOf(b))),
  },
  Long: {
    parseLong: ([a]) => JLong(Number(javaToString(a).trim())),
    valueOf: ([a]) => JLong(numOf(a)),
    toString: ([a]) => JString(String(Math.trunc(numOf(a)))),
  },
  Boolean: {
    parseBoolean: ([a]) => JBool(javaToString(a).toLowerCase() === 'true'),
    valueOf: ([a]) => JBool(a.t === 'String' ? a.v.toLowerCase() === 'true' : !!a.v),
    toString: ([a]) => JString(a.v ? 'true' : 'false'),
  },
  Character: {
    isDigit: ([a]) => JBool(/^[0-9]$/.test(charOf(a))),
    isLetter: ([a]) => JBool(/^[A-Za-z]$/.test(charOf(a))),
    isLetterOrDigit: ([a]) => JBool(/^[A-Za-z0-9]$/.test(charOf(a))),
    isUpperCase: ([a]) => { const c = charOf(a); return JBool(/^[A-Za-z]$/.test(c) && c === c.toUpperCase()); },
    isLowerCase: ([a]) => { const c = charOf(a); return JBool(/^[A-Za-z]$/.test(c) && c === c.toLowerCase()); },
    isWhitespace: ([a]) => JBool(/^\s$/.test(charOf(a))),
    isAlphabetic: ([a]) => JBool(/^[A-Za-z]$/.test(charOf(a))),
    toUpperCase: ([a]) => JChar(charOf(a).toUpperCase()),
    toLowerCase: ([a]) => JChar(charOf(a).toLowerCase()),
    getNumericValue: ([a]) => JInt(parseInt(charOf(a), 36)),
    toString: ([a]) => JString(charOf(a)),
  },
  String: {
    valueOf: ([a], line, ctx) => JString(javaToString(a, ctx)),
    format: ([fmt, ...rest], line, ctx) => JString(javaFormat(javaToString(fmt), rest, ctx)),
    join: ([sep, ...rest], line, ctx) => {
      const sepStr = javaToString(sep);
      if (rest.length === 1 && (rest[0].t === 'list' || rest[0].t === 'array')) {
        const items = rest[0].t === 'list' ? rest[0].v : rest[0].v.items;
        return JString(items.map((x) => javaToString(x, ctx)).join(sepStr));
      }
      return JString(rest.map((x) => javaToString(x, ctx)).join(sepStr));
    },
  },
  Arrays: {
    toString: ([a], line, ctx) => {
      if (a.t !== 'array') return JString(javaToString(a, ctx));
      return JString('[' + a.v.items.map((x) => javaToString(x, ctx)).join(', ') + ']');
    },
    deepToString: ([a], line, ctx) => {
      const render = (val) => (val.t === 'array'
        ? '[' + val.v.items.map(render).join(', ') + ']'
        : javaToString(val, ctx));
      return JString(render(a));
    },
    sort: ([a]) => { sortValues(a.v.items); return VOID; },
    fill: ([a, v]) => { a.v.items.fill(v); return VOID; },
    copyOf: ([a, n]) => {
      const len = numOf(n);
      const items = [];
      for (let i = 0; i < len; i++) {
        items.push(i < a.v.items.length ? a.v.items[i] : defaultValueFor(a.v.elemType));
      }
      return JArray(a.v.elemType, items);
    },
    equals: ([a, b], line, ctx) => JBool(valuesEqual(a, b, ctx)),
    asList: ([a]) => JList(a.t === 'array' ? [...a.v.items] : [a]),
    stream: ([a]) => JList([...a.v.items]),
  },
  Collections: {
    sort: ([a]) => { sortValues(a.v); return VOID; },
    reverse: ([a]) => { a.v.reverse(); return VOID; },
    max: ([a]) => sortValues([...a.v]).at(-1) || NULL,
    min: ([a]) => sortValues([...a.v])[0] || NULL,
  },
  List: {
    of: (args) => JList([...args]),
  },
  Objects: {
    equals: ([a, b], line, ctx) => JBool(valuesEqual(a, b, ctx)),
    toString: ([a], line, ctx) => JString(javaToString(a, ctx)),
  },
};

/** Constants like Integer.MAX_VALUE or Math.PI. */
export const STATIC_FIELDS = {
  Math: { PI: JDouble(Math.PI), E: JDouble(Math.E) },
  Integer: { MAX_VALUE: JInt(2147483647), MIN_VALUE: JInt(-2147483648) },
  Long: { MAX_VALUE: JLong(9223372036854775807), MIN_VALUE: JLong(-9223372036854775808) },
  Double: { MAX_VALUE: JDouble(1.7976931348623157e308), MIN_VALUE: JDouble(4.9e-324) },
};

function charOf(value) {
  if (value.t === 'char') return value.v;
  if (isNumeric(value.t)) return String.fromCharCode(numOf(value));
  return javaToString(value)[0] || '';
}
