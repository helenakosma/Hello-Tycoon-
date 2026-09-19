import { parse } from '../src/engine/java/parser.js';
const src = `
import java.util.ArrayList;
public class Main {
  static int counter = 0;
  public static int add(int a, int b) { return a + b; }
  public static void main(String[] args) {
    int[] nums = {1, 2, 3};
    ArrayList<Integer> list = new ArrayList<>();
    for (int n : nums) { list.add(n * 2); }
    for (int i = 0; i < 3; i++) {
      if (i % 2 == 0) { System.out.println("even " + i); }
      else System.out.println("odd " + i);
    }
    double avg = (double) add(5, 6) / 2;
    String s = "x";
    while (s.length() < 3) s += "y";
    switch (nums[0]) { case 1: System.out.println("one"); break; default: break; }
    System.out.println(avg + s + (counter++));
  }
}
class Dog { private String name; Dog(String n) { this.name = n; } public String speak() { return name + " says woof"; } }
`;
const ast = parse(src);
console.log('classes:', ast.classes.map(c => c.name + '(fields=' + c.fields.length + ',methods=' + c.methods.length + ',ctors=' + c.ctors.length + ')').join(' '));
console.log('main stmts:', ast.classes[0].methods.find(m=>m.name==='main').body.stmts.map(s=>s.type).join(', '));
