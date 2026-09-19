import { runJavaMain, runJavaFunction } from '../src/engine/java/interpreter.js';

let pass = 0, fail = 0;
function check(label, actual, expected) {
  const a = typeof actual === 'string' ? actual : JSON.stringify(actual);
  const e = typeof expected === 'string' ? expected : JSON.stringify(expected);
  if (a === e) { pass++; }
  else { fail++; console.log('FAIL ' + label + '\n  expected: ' + JSON.stringify(e) + '\n  actual:   ' + JSON.stringify(a)); }
}

function main(label, src, expected) {
  const r = runJavaMain(src);
  if (!r.ok) { fail++; console.log('ERROR ' + label + ': ' + r.error.message + (r.error.line ? ' (line ' + r.error.line + ')' : '')); return; }
  check(label, r.output, expected);
}

const wrap = (body) => 'public class Main { public static void main(String[] args) {' + body + '} }';

// --- core semantics --------------------------------------------------------
main('hello', wrap('System.out.println("Hello, World!");'), 'Hello, World!\n');
main('int division', wrap('System.out.println(5 / 2);'), '2\n');
main('double division', wrap('System.out.println(5.0 / 2);'), '2.5\n');
main('double printing', wrap('double x = 4; System.out.println(x);'), '4.0\n');
main('int from int div into double', wrap('double x = 5 / 2; System.out.println(x);'), '2.0\n');
main('cast', wrap('System.out.println((double) 5 / 2);'), '2.5\n');
main('concat', wrap('int a=3; System.out.println("a=" + a + "!");'), 'a=3!\n');
main('modulo', wrap('System.out.println(-7 % 3);'), '-1\n');
main('char math', wrap("char c='A'; System.out.println((char)(c+1)); System.out.println(c+1);"), 'B\n66\n');
main('boolean', wrap('System.out.println(3 > 2 && !(1 == 2));'), 'true\n');
main('ternary', wrap('int n=5; System.out.println(n%2==0 ? "even" : "odd");'), 'odd\n');
main('printf', wrap('System.out.printf("%.2f %5d|%-4s|%n", 3.14159, 42, "ab");'), '3.14    42|ab  |\n');
main('string format', wrap('System.out.println(String.format("%s has %d", "x", 2));'), 'x has 2\n');
main('int overflow', wrap('int x = 2147483647; x = x + 1; System.out.println(x);'), '-2147483648\n');

// --- control flow ----------------------------------------------------------
main('for loop', wrap('for(int i=1;i<=3;i++) System.out.print(i + " ");'), '1 2 3 ');
main('while', wrap('int i=0; while(i<3){ i++; } System.out.println(i);'), '3\n');
main('do while', wrap('int i=5; do { i++; } while(i<3); System.out.println(i);'), '6\n');
main('nested + continue/break', wrap('for(int i=0;i<5;i++){ if(i==1) continue; if(i==3) break; System.out.print(i); }'), '02');
main('switch', wrap('int d=2; switch(d){ case 1: System.out.println("Mon"); break; case 2: System.out.println("Tue"); break; default: System.out.println("?"); }'), 'Tue\n');
main('switch fallthrough default', wrap('int d=9; switch(d){ case 1: System.out.println("a"); break; default: System.out.println("z"); }'), 'z\n');

// --- arrays & collections --------------------------------------------------
main('array literal', wrap('int[] a = {3,1,2}; System.out.println(a.length + " " + a[0]);'), '3 3\n');
main('new array default', wrap('int[] a = new int[3]; System.out.println(a[2]);'), '0\n');
main('Arrays.toString+sort', wrap('int[] a={3,1,2}; java.util.Arrays.sort(a); System.out.println(java.util.Arrays.toString(a));'), '[1, 2, 3]\n');
main('2d array', wrap('int[][] g = new int[2][3]; g[1][2]=7; System.out.println(g[1][2] + " " + g[0][0]);'), '7 0\n');
main('2d literal', wrap('int[][] g = {{1,2},{3,4}}; System.out.println(g[1][0]);'), '3\n');
main('foreach', wrap('int[] a={1,2,3}; int s=0; for(int n : a) s+=n; System.out.println(s);'), '6\n');
main('arraylist', 'import java.util.*; ' + wrap('ArrayList<String> l = new ArrayList<>(); l.add("a"); l.add("b"); System.out.println(l + " " + l.size() + " " + l.get(1));'), '[a, b] 2 b\n');
main('hashmap', 'import java.util.*; ' + wrap('HashMap<String,Integer> m = new HashMap<>(); m.put("a",1); m.put("b",2); System.out.println(m.get("a") + " " + m.containsKey("z") + " " + m.getOrDefault("z",0));'), '1 false 0\n');
main('map foreach keySet', 'import java.util.*; ' + wrap('HashMap<String,Integer> m=new HashMap<>(); m.put("x",1); m.put("y",2); int t=0; for(String k : m.keySet()) t+=m.get(k); System.out.println(t);'), '3\n');
main('stringbuilder', wrap('StringBuilder sb=new StringBuilder(); sb.append("ab").append(1); sb.reverse(); System.out.println(sb.toString());'), '1ba\n');

// --- strings ---------------------------------------------------------------
main('string methods', wrap('String s="Hello World"; System.out.println(s.length()+" "+s.charAt(0)+" "+s.substring(6)+" "+s.toUpperCase()+" "+s.indexOf("World"));'), '11 H World HELLO WORLD 6\n');
main('split', wrap('String[] p = "a,b,c".split(","); System.out.println(p[1] + p.length);'), 'b3\n');
main('equals', wrap('String a="hi"; System.out.println(a.equals("hi"));'), 'true\n');
main('char loop', wrap('String s="abc"; for(int i=0;i<s.length();i++) System.out.print(s.charAt(i)+"-");'), 'a-b-c-');

// --- methods, recursion, classes -------------------------------------------
main('static method', 'public class Main { static int sq(int n){ return n*n; } public static void main(String[] a){ System.out.println(sq(5)); } }', '25\n');
main('recursion', 'public class Main { static int f(int n){ if(n<=1) return 1; return n*f(n-1); } public static void main(String[] a){ System.out.println(f(5)); } }', '120\n');
main('class + toString', 'public class Main { public static void main(String[] a){ Dog d = new Dog("Rex"); System.out.println(d.speak()); System.out.println(d); } } class Dog { private String name; Dog(String n){ name=n; } public String speak(){ return name + " says woof"; } public String toString(){ return "Dog(" + name + ")"; } }', 'Rex says woof\nDog(Rex)\n');
main('inheritance', 'public class Main { public static void main(String[] a){ Cat c=new Cat("Tom"); System.out.println(c.describe()); } } class Animal { String n; Animal(String n){ this.n=n; } String sound(){ return "..."; } String describe(){ return n + " says " + sound(); } } class Cat extends Animal { Cat(String n){ super(n); } String sound(){ return "meow"; } }', 'Tom says meow\n');
main('static field counter', 'public class Main { static int count = 0; static void bump(){ count++; } public static void main(String[] a){ bump(); bump(); System.out.println(count); } }', '2\n');

// --- function-mode calls ---------------------------------------------------
{
  const src = 'public class Main { public static int add(int a, int b) { return a + b; } }';
  const r = runJavaFunction(src, 'add', [2, 3]);
  check('fn add', r.ok && r.result, 5);
}
{
  const src = 'public class Main { public static double half(double x) { return x / 2; } }';
  const r = runJavaFunction(src, 'half', [5]);
  check('fn coerces int arg to double param', r.ok && r.result, 2.5);
}
{
  const src = 'public class Main { public static int[] doubleAll(int[] n) { int[] o = new int[n.length]; for(int i=0;i<n.length;i++) o[i]=n[i]*2; return o; } }';
  const r = runJavaFunction(src, 'doubleAll', [[1, 2, 3]]);
  check('fn array in/out', r.ok && r.result, [2, 4, 6]);
}
{
  const src = 'public class Main { public static String shout(String s) { return s.toUpperCase() + "!"; } }';
  const r = runJavaFunction(src, 'shout', ['hi']);
  check('fn string', r.ok && r.result, 'HI!');
}

// --- error messages --------------------------------------------------------
function errOf(src) { const r = runJavaMain(src); return r.ok ? '(no error)' : r.error.message; }
console.log('\n--- sample error messages ---');
console.log('missing semi  :', errOf(wrap('int x = 5')));
console.log('undeclared    :', errOf(wrap('System.out.println(y);')));
console.log('div by zero   :', errOf(wrap('int a=1, b=0; System.out.println(a/b);')));
console.log('index oob     :', errOf(wrap('int[] a={1,2}; System.out.println(a[5]);')));
console.log('lossy assign  :', errOf(wrap('int x = 2.5;')));
console.log('infinite loop :', errOf(wrap('while(true){ int x=1; }')));
console.log('unclosed brace:', errOf('public class Main { public static void main(String[] a){ int x=1; }'));
console.log('null method   :', errOf(wrap('String s = null; System.out.println(s.length());')));
console.log('no main       :', errOf('public class Main { static int f(){ return 1; } }'));
console.log('assign in if  :', errOf(wrap('int x=1; if (x = 2) { }')));

// --- warnings --------------------------------------------------------------
{
  const r = runJavaMain(wrap('String a="hi"; String b="hi"; System.out.println(a == b);'));
  check('== on strings still works', r.output, 'true\n');
  check('== on strings warns', r.warnings.length > 0, true);
}

console.log('\n' + pass + ' passed, ' + fail + ' failed');
