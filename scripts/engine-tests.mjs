/**
 * Semantics tests for the built-in Java interpreter.
 *
 * These lock in the behaviours that make the interpreter trustworthy for
 * teaching — especially integer division, double printing, int overflow and
 * the student-facing error messages. If you extend the interpreter, run
 * `npm test` and make sure these still pass.
 */

import { runJavaMain, runJavaFunction } from '../src/engine/java/interpreter.js';

export function runEngineTests({ log = console.log } = {}) {
  let pass = 0;
  const failures = [];

  const check = (label, actual, expected) => {
    const a = JSON.stringify(actual);
    const e = JSON.stringify(expected);
    if (a === e) pass++;
    else failures.push(`${label}\n    expected ${e}\n    actual   ${a}`);
  };

  const main = (label, src, expected) => {
    const r = runJavaMain(src);
    if (!r.ok) {
      failures.push(`${label}\n    error: ${r.error.message}`);
      return;
    }
    check(label, r.output, expected);
  };

  const wrap = (body) => `public class Main { public static void main(String[] args) {${body}} }`;

  // --- the behaviours students trip over ---------------------------------
  main('integer division', wrap('System.out.println(5 / 2);'), '2\n');
  main('double division', wrap('System.out.println(5.0 / 2);'), '2.5\n');
  main('doubles print with .0', wrap('double x = 4; System.out.println(x);'), '4.0\n');
  main('int division assigned to double', wrap('double x = 5 / 2; System.out.println(x);'), '2.0\n');
  main('cast before divide', wrap('System.out.println((double) 5 / 2);'), '2.5\n');
  main('int overflow wraps', wrap('int x = 2147483647; x = x + 1; System.out.println(x);'), '-2147483648\n');
  main('negative modulo', wrap('System.out.println(-7 % 3);'), '-1\n');
  main('char arithmetic', wrap("char c='A'; System.out.println((char)(c+1)); System.out.println(c+1);"), 'B\n66\n');
  main('string concat precedence', wrap('System.out.println("n=" + 1 + 2);'), 'n=12\n');
  main('printf', wrap('System.out.printf("%.2f %5d|%-4s|%n", 3.14159, 42, "ab");'), '3.14    42|ab  |\n');
  main('booleans print lowercase', wrap('System.out.println(true);'), 'true\n');

  // --- control flow --------------------------------------------------------
  main('for loop', wrap('for(int i=1;i<=3;i++) System.out.print(i + " ");'), '1 2 3 ');
  main('while loop', wrap('int i=0; while(i<3){ i++; } System.out.println(i);'), '3\n');
  main('do-while runs once', wrap('int i=5; do { i++; } while(i<3); System.out.println(i);'), '6\n');
  main('break and continue', wrap('for(int i=0;i<5;i++){ if(i==1) continue; if(i==3) break; System.out.print(i); }'), '02');
  main('switch', wrap('int d=2; switch(d){ case 1: System.out.println("Mon"); break; case 2: System.out.println("Tue"); break; default: System.out.println("?"); }'), 'Tue\n');

  // --- data structures -----------------------------------------------------
  main('array literal', wrap('int[] a = {3,1,2}; System.out.println(a.length + " " + a[0]);'), '3 3\n');
  main('array defaults to zero', wrap('int[] a = new int[3]; System.out.println(a[2]);'), '0\n');
  main('2D array', wrap('int[][] g = new int[2][3]; g[1][2]=7; System.out.println(g[1][2] + " " + g[0][0]);'), '7 0\n');
  main('for-each', wrap('int[] a={1,2,3}; int s=0; for(int n : a) s+=n; System.out.println(s);'), '6\n');
  main('Arrays helpers', 'import java.util.*;' + wrap('int[] a={3,1,2}; Arrays.sort(a); System.out.println(Arrays.toString(a));'), '[1, 2, 3]\n');
  main('ArrayList', 'import java.util.*;' + wrap('ArrayList<String> l = new ArrayList<>(); l.add("a"); l.add("b"); System.out.println(l + " " + l.size() + " " + l.get(1));'), '[a, b] 2 b\n');
  main('HashMap', 'import java.util.*;' + wrap('HashMap<String,Integer> m = new HashMap<>(); m.put("a",1); System.out.println(m.get("a") + " " + m.getOrDefault("z",0));'), '1 0\n');
  main('StringBuilder', wrap('StringBuilder sb=new StringBuilder(); sb.append("ab").append(1); sb.reverse(); System.out.println(sb.toString());'), '1ba\n');
  main('String methods', wrap('String s="Hello World"; System.out.println(s.length()+" "+s.charAt(0)+" "+s.substring(6)+" "+s.indexOf("World"));'), '11 H World 6\n');
  main('split', wrap('String[] p = "a,b,c".split(","); System.out.println(p[1] + p.length);'), 'b3\n');

  // --- methods, classes, recursion -----------------------------------------
  main('static method', 'public class Main { static int sq(int n){ return n*n; } public static void main(String[] a){ System.out.println(sq(5)); } }', '25\n');
  main('recursion', 'public class Main { static int f(int n){ if(n<=1) return 1; return n*f(n-1); } public static void main(String[] a){ System.out.println(f(5)); } }', '120\n');
  main('class + toString',
    'public class Main { public static void main(String[] a){ Dog d = new Dog("Rex"); System.out.println(d.speak()); System.out.println(d); } } '
    + 'class Dog { private String name; Dog(String n){ name=n; } public String speak(){ return name + " says woof"; } public String toString(){ return "Dog(" + name + ")"; } }',
    'Rex says woof\nDog(Rex)\n');
  main('inheritance + super + override',
    'public class Main { public static void main(String[] a){ System.out.println(new Cat("Tom").describe()); } } '
    + 'class Animal { String n; Animal(String n){ this.n=n; } String sound(){ return "..."; } String describe(){ return n + " says " + sound(); } } '
    + 'class Cat extends Animal { Cat(String n){ super(n); } String sound(){ return "meow"; } }',
    'Tom says meow\n');
  main('static field', 'public class Main { static int count = 0; static void bump(){ count++; } public static void main(String[] a){ bump(); bump(); System.out.println(count); } }', '2\n');

  // --- function mode (how most problems are graded) ------------------------
  check('fn returns value', runJavaFunction('public class Main { public static int add(int a, int b) { return a + b; } }', 'add', [2, 3]).result, 5);
  check('fn coerces int arg to double param', runJavaFunction('public class Main { public static double half(double x) { return x / 2; } }', 'half', [5]).result, 2.5);
  check('fn array in and out', runJavaFunction('public class Main { public static int[] dbl(int[] n) { int[] o = new int[n.length]; for(int i=0;i<n.length;i++) o[i]=n[i]*2; return o; } }', 'dbl', [[1, 2, 3]]).result, [2, 4, 6]);
  check('fn string', runJavaFunction('public class Main { public static String shout(String s) { return s.toUpperCase() + "!"; } }', 'shout', ['hi']).result, 'HI!');

  // --- error messages stay student-readable --------------------------------
  const errorOf = (src) => { const r = runJavaMain(src); return r.ok ? '(no error)' : r.error.message; };
  const contains = (label, src, fragment) => {
    const message = errorOf(src);
    if (message.toLowerCase().includes(fragment.toLowerCase())) pass++;
    else failures.push(`${label}\n    message did not mention "${fragment}": ${message}`);
  };

  contains('missing semicolon message', wrap('int x = 5'), 'semicolon');
  contains('undeclared variable message', wrap('System.out.println(y);'), 'do not know what "y" is');
  contains('divide by zero message', wrap('int a=1, b=0; System.out.println(a/b);'), 'divided by zero');
  contains('array bounds message', wrap('int[] a={1,2}; System.out.println(a[5]);'), 'out of bounds');
  contains('lossy assignment message', wrap('int x = 2.5;'), 'without a cast');
  contains('infinite loop is stopped', wrap('while(true){ int x=1; }'), 'ran for too long');
  contains('unclosed brace message', 'public class Main { public static void main(String[] a){ int x=1; }', 'closing');
  contains('null method call message', wrap('String s = null; System.out.println(s.length());'), 'null');
  contains('missing main message', 'public class Main { static int f(){ return 1; } }', 'main method');
  contains('assignment in condition message', wrap('int x=1; if (x = 2) { }'), '= (assign)');

  // --- the == on Strings teaching warning ----------------------------------
  const warned = runJavaMain(wrap('String a="hi"; String b="hi"; System.out.println(a == b);'));
  if (warned.warnings.length > 0) pass++;
  else failures.push('comparing Strings with == should produce a teaching warning');

  return { pass, failures };
}
