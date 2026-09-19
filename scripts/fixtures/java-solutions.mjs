// Reference solutions for every Java problem, used only to validate the bank.
const C = (s) => s;

export default {
  'java-out-01': C(`public class Main { public static void main(String[] args) { System.out.println("Hello, Tycoon!"); } }`),
  'java-out-02': C(`public class Main { public static void main(String[] args) { String company = "Bitwise Inc"; System.out.println("Welcome to " + company); } }`),
  'java-out-03': C(`public class Main { public static int area(int width, int height) { return width * height; } }`),
  'java-out-04': C(`public class Main { public static int sprintSeconds(int days) { return days * 24 * 60 * 60; } }`),
  'java-out-05': C(`public class Main { public static double toFahrenheit(double celsius) { return celsius * 9 / 5 + 32; } }`),
  'java-out-06': C(`public class Main { public static double average(int a, int b, int c) { return (a + b + c) / 3.0; } }`),

  'java-cond-01': C(`public class Main { public static boolean isEven(int n) { return n % 2 == 0; } }`),
  'java-cond-02': C(`public class Main { public static int bigger(int a, int b) { if (a > b) { return a; } else { return b; } } }`),
  'java-cond-03': C(`public class Main { public static String grade(int score) {
    if (score >= 90) return "A";
    else if (score >= 80) return "B";
    else if (score >= 70) return "C";
    else if (score >= 60) return "D";
    else return "F";
  } }`),
  'java-cond-04': C(`public class Main { public static String fizzBuzz(int n) {
    if (n % 3 == 0 && n % 5 == 0) return "FizzBuzz";
    if (n % 3 == 0) return "Fizz";
    if (n % 5 == 0) return "Buzz";
    return String.valueOf(n);
  } }`),
  'java-cond-05': C(`public class Main { public static boolean isLeap(int year) { return year % 4 == 0 && (year % 100 != 0 || year % 400 == 0); } }`),

  'java-loop-01': C(`public class Main { public static void main(String[] args) { for (int i = 1; i <= 5; i++) System.out.println(i); } }`),
  'java-loop-02': C(`public class Main { public static int sumTo(int n) { int total = 0; for (int i = 1; i <= n; i++) total += i; return total; } }`),
  'java-loop-03': C(`public class Main { public static void main(String[] args) { for (int i = 1; i <= 5; i++) System.out.println("7 x " + i + " = " + (7 * i)); } }`),
  'java-loop-04': C(`public class Main { public static int factorial(int n) { int r = 1; for (int i = 1; i <= n; i++) r *= i; return r; } }`),
  'java-loop-05': C(`public class Main { public static int deploysNeeded(int failures) { int rounds = 0; while (failures > 0) { failures = failures / 2; rounds++; } return rounds; } }`),
  'java-loop-06': C(`public class Main { public static void main(String[] args) {
    for (int i = 1; i <= 15; i++) {
      if (i % 3 == 0 && i % 5 == 0) System.out.println("FizzBuzz");
      else if (i % 3 == 0) System.out.println("Fizz");
      else if (i % 5 == 0) System.out.println("Buzz");
      else System.out.println(i);
    }
  } }`),

  'java-func-01': C(`public class Main { public static int maxOfThree(int a, int b, int c) { return Math.max(a, Math.max(b, c)); } }`),
  'java-func-02': C(`public class Main { public static double applyDiscount(double price, double percent) { return price - price * percent / 100; } }`),
  'java-func-03': C(`public class Main { public static boolean isPrime(int n) {
    if (n < 2) return false;
    for (int i = 2; i * i <= n; i++) { if (n % i == 0) return false; }
    return true;
  } }`),
  'java-func-04': C(`public class Main { public static int gcd(int a, int b) { while (b != 0) { int t = b; b = a % b; a = t; } return a; } }`),
  'java-func-05': C(`public class Main { public static double balance(double principal, double rate, int years) {
    double amount = principal;
    for (int i = 0; i < years; i++) amount = amount * (1 + rate / 100);
    return Math.round(amount * 100) / 100.0;
  } }`),

  'java-arr-01': C(`public class Main { public static int total(int[] numbers) { int sum = 0; for (int n : numbers) sum += n; return sum; } }`),
  'java-arr-02': C(`public class Main { public static int largest(int[] numbers) { int best = numbers[0]; for (int n : numbers) if (n > best) best = n; return best; } }`),
  'java-arr-03': C(`public class Main { public static int countAbove(int[] numbers, int threshold) { int c = 0; for (int n : numbers) if (n > threshold) c++; return c; } }`),
  'java-arr-04': C(`public class Main { public static int[] reverse(int[] items) {
    int[] result = new int[items.length];
    for (int i = 0; i < items.length; i++) result[items.length - 1 - i] = items[i];
    return result;
  } }`),
  'java-arr-05': C(`public class Main { public static int secondLargest(int[] numbers) {
    int best = Integer.MIN_VALUE;
    int second = Integer.MIN_VALUE;
    for (int n : numbers) {
      if (n > best) { second = best; best = n; }
      else if (n > second && n != best) { second = n; }
    }
    if (second == Integer.MIN_VALUE) return -1;
    return second;
  } }`),

  'java-str-01': C(`public class Main { public static String shout(String text) { return text.toUpperCase() + "!"; } }`),
  'java-str-02': C(`public class Main { public static int countVowels(String text) {
    int count = 0;
    String lower = text.toLowerCase();
    for (int i = 0; i < lower.length(); i++) { if ("aeiou".indexOf(lower.charAt(i)) >= 0) count++; }
    return count;
  } }`),
  'java-str-03': C(`public class Main { public static boolean isPalindrome(String text) {
    String clean = text.toLowerCase().replace(" ", "");
    String flipped = new StringBuilder(clean).reverse().toString();
    return clean.equals(flipped);
  } }`),
  'java-str-04': C(`public class Main { public static String initials(String fullName) {
    String[] parts = fullName.split(" ");
    String out = "";
    for (int i = 0; i < parts.length; i++) out += Character.toUpperCase(parts[i].charAt(0)) + ".";
    return out;
  } }`),
  'java-str-05': C(`public class Main { public static String longestWord(String sentence) {
    String[] words = sentence.split(" ");
    String best = words[0];
    for (int i = 1; i < words.length; i++) { if (words[i].length() > best.length()) best = words[i]; }
    return best;
  } }`),

  'java-oop-01': C(`public class Main {
    public static void main(String[] args) {
      Employee e = new Employee("Ada", 90000);
      System.out.println(e.describe());
      System.out.println(new Employee("Linus", 50000).describe());
    }
  }
  class Employee {
    private String name;
    private int salary;
    Employee(String name, int salary) { this.name = name; this.salary = salary; }
    public String describe() { return name + " earns " + salary; }
  }`),
  'java-oop-02': C(`public class Main {
    public static void main(String[] args) {
      BankAccount acct = new BankAccount(100);
      acct.deposit(50);
      System.out.println(acct.getBalance());
      acct.withdraw(30);
      System.out.println(acct.getBalance());
      acct.withdraw(9999);
      System.out.println(acct.getBalance());
    }
  }
  class BankAccount {
    private int balance;
    BankAccount(int starting) { balance = starting; }
    public void deposit(int amount) { balance += amount; }
    public void withdraw(int amount) { if (amount <= balance) balance -= amount; }
    public int getBalance() { return balance; }
  }`),
  'java-oop-03': C(`public class Main {
    public static void main(String[] args) {
      Room r = new Room(4, 6);
      System.out.println(r.area());
      System.out.println(r.perimeter());
      System.out.println(r.isSquare());
      System.out.println(new Room(5, 5).isSquare());
    }
  }
  class Room {
    private int width;
    private int height;
    Room(int width, int height) { this.width = width; this.height = height; }
    public int area() { return width * height; }
    public int perimeter() { return 2 * width + 2 * height; }
    public boolean isSquare() { return width == height; }
  }`),
  'java-oop-04': C(`public class Main {
    public static void main(String[] args) {
      System.out.println(new Employee("Ada").describe());
      System.out.println(new Manager("Grace", 4).describe());
    }
  }
  class Employee {
    protected String name;
    Employee(String name) { this.name = name; }
    public String describe() { return name + " writes code"; }
  }
  class Manager extends Employee {
    private int teamSize;
    Manager(String name, int teamSize) { super(name); this.teamSize = teamSize; }
    public String describe() { return name + " manages " + teamSize + " people"; }
  }`),

  'java-rec-01': C(`public class Main { public static int factorial(int n) { if (n <= 1) return 1; return n * factorial(n - 1); } }`),
  'java-rec-02': C(`public class Main { public static int fib(int n) { if (n == 0) return 0; if (n == 1) return 1; return fib(n - 1) + fib(n - 2); } }`),
  'java-rec-03': C(`public class Main { public static int digitSum(int n) { if (n == 0) return 0; return n % 10 + digitSum(n / 10); } }`),
  'java-rec-04': C(`public class Main { public static int power(int base, int exponent) { if (exponent == 0) return 1; return base * power(base, exponent - 1); } }`),
};
