import { tokenize } from '../src/engine/java/lexer.js';
const src = 'public class Main { public static void main(String[] a){ int x = 5; System.out.println("hi" + x); } }';
const t = tokenize(src);
console.log(t.length, 'tokens; first 8:', t.slice(0,8).map(x=>x.type+':'+x.raw).join(' '));
