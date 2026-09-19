/**
 * ============================================================================
 * JAVA PROBLEM BANK
 * ============================================================================
 *
 * The schema is identical to python.js — see the long comment at the top of
 * that file for a full description of every field. This bank mirrors the
 * Python one problem for problem, so a class can run both languages side by
 * side and compare.
 *
 * JAVA-SPECIFIC NOTES
 *  - 'function' mode calls one `public static` method. Keep the signature in
 *    the starter code; students fill in the body.
 *  - 'stdout' mode runs `public static void main(String[] args)`.
 *  - The interpreter models Java's integer division (5 / 2 == 2) and prints
 *    doubles Java-style (1.0, not 1). Several problems below lean on that on
 *    purpose — it is one of the most common real misunderstandings.
 *  - Supported subset: primitives, String, arrays, ArrayList, HashMap,
 *    HashSet, StringBuilder, classes with inheritance, Math/Integer/Character/
 *    Arrays/Collections helpers. No lambdas, streams or try/catch.
 */

/** Strips the leading indentation of this file out of code blocks. */
const code = (strings, ...values) => {
  const raw = String.raw({ raw: strings }, ...values);
  const lines = raw.replace(/^\n/, '').replace(/\n[ \t]*$/, '').split('\n');
  const widths = lines.filter((l) => l.trim()).map((l) => l.match(/^[ \t]*/)[0].length);
  const cut = widths.length ? Math.min(...widths) : 0;
  return lines.map((l) => l.slice(cut)).join('\n');
};

const PROBLEMS = [
  // =========================================================================
  // TIER 1 — OUTPUT & VARIABLES
  // =========================================================================
  {
    id: 'java-out-01',
    tier: 'output',
    title: 'Hello, Tycoon!',
    difficulty: 1,
    prompt:
      'Every company starts with a first commit.\n\n'
      + 'Print exactly this line:\n\n`Hello, Tycoon!`\n\n'
      + 'Spelling, capitals and the exclamation mark all have to match.',
    mode: 'stdout',
    starterCode: code`
      public class Main {
          public static void main(String[] args) {
              // Print the greeting here
          }
      }
    `,
    tests: [{ expected: 'Hello, Tycoon!', label: 'prints the greeting' }],
    hints: [
      'System.out.println(...) prints a line of text.',
      'Text goes inside double quotes, and the line ends with a semicolon.',
      'System.out.println("Hello, Tycoon!");',
    ],
    diagnostics: [
      { outputTrimmedEquals: '', say: 'Nothing was printed. Did you call System.out.println(...)?' },
      { outputTrimmedEquals: 'Hello, World!', say: 'Close! But this company is called Tycoon, not World.' },
      { outputTrimmedEquals: 'Hello, Tycoon', say: 'Almost — the exclamation mark at the end is part of the text too.' },
      { errorContains: 'semicolon', say: 'Every statement in Java ends with a semicolon (;).' },
    ],
  },
  {
    id: 'java-out-02',
    tier: 'output',
    title: 'Name the Company',
    difficulty: 1,
    prompt:
      'Store the company name in a **variable** called `company`, then print a welcome line.\n\n'
      + 'The name is `Bitwise Inc`, and the output should be:\n\n`Welcome to Bitwise Inc`',
    mode: 'stdout',
    starterCode: code`
      public class Main {
          public static void main(String[] args) {
              // 1. Declare a String variable called company
              String company = ;

              // 2. Print the welcome message using that variable
          }
      }
    `,
    tests: [{ expected: 'Welcome to Bitwise Inc' }],
    hints: [
      'Text variables have the type String: String company = "Bitwise Inc";',
      'You can join text with + : "Welcome to " + company',
      'Watch the space after "Welcome to" — it matters.',
    ],
    diagnostics: [
      { outputTrimmedEquals: 'Welcome toBitwise Inc', say: 'You need a space after "to". Try "Welcome to " with a space before the closing quote.' },
      { outputTrimmedEquals: 'Welcome to company', say: 'You printed the word "company" as text. Take it out of the quotes so Java uses the variable.' },
    ],
  },
  {
    id: 'java-out-03',
    tier: 'output',
    title: 'Desk Area',
    difficulty: 1,
    prompt:
      'Write a method `area(int width, int height)` that returns the area of a rectangular desk.\n\n'
      + 'Area is width times height.',
    mode: 'function',
    functionName: 'area',
    starterCode: code`
      public class Main {
          public static int area(int width, int height) {
              // Return the area (width times height)
          }
      }
    `,
    tests: [
      { args: [3, 4], expected: 12, label: 'area(3, 4)' },
      { args: [10, 2], expected: 20, label: 'area(10, 2)' },
      { args: [7, 7], expected: 49, label: 'area(7, 7)' },
      { args: [1, 0], expected: 0, label: 'area(1, 0)', hidden: true },
    ],
    hints: [
      'Multiplication in Java uses the * symbol.',
      'Use `return`, not println — the game checks what the method gives back.',
      'The body is one line: return width * height;',
    ],
    diagnostics: [
      { errorContains: 'without a return', say: 'The method promises to return an int but never does. Add a `return` statement.' },
      { resultEquals: 7, say: 'That looks like width + height. Area uses multiplication (*), not addition.' },
    ],
  },
  {
    id: 'java-out-04',
    tier: 'output',
    title: 'Seconds in a Sprint',
    difficulty: 1,
    prompt:
      'A two-week sprint is 14 days. Write `sprintSeconds(int days)` returning how many '
      + 'seconds are in that many days.\n\n'
      + 'There are 24 hours in a day, 60 minutes in an hour, and 60 seconds in a minute.',
    mode: 'function',
    functionName: 'sprintSeconds',
    starterCode: code`
      public class Main {
          public static int sprintSeconds(int days) {

          }
      }
    `,
    tests: [
      { args: [1], expected: 86400, label: 'sprintSeconds(1)' },
      { args: [14], expected: 1209600, label: 'sprintSeconds(14)' },
      { args: [0], expected: 0, label: 'sprintSeconds(0)', hidden: true },
    ],
    hints: [
      'Start with how many seconds are in one day.',
      'One day = 24 * 60 * 60 seconds.',
      'Then multiply that by `days`.',
    ],
    diagnostics: [
      { resultEquals: 86400, say: 'That is right for ONE day, but the answer has to depend on the `days` parameter too.' },
      { resultEquals: 1440, say: 'That is minutes in a day. Multiply by 60 once more to reach seconds.' },
    ],
  },
  {
    id: 'java-out-05',
    tier: 'output',
    title: 'Server Room Thermostat',
    difficulty: 2,
    prompt:
      'The thermostat reads Celsius but the investors want Fahrenheit.\n\n'
      + 'Write `toFahrenheit(double celsius)` using the formula:\n\n`F = C × 9 / 5 + 32`',
    mode: 'function',
    functionName: 'toFahrenheit',
    starterCode: code`
      public class Main {
          public static double toFahrenheit(double celsius) {

          }
      }
    `,
    tests: [
      { args: [0], expected: 32, label: 'toFahrenheit(0)' },
      { args: [100], expected: 212, label: 'toFahrenheit(100)' },
      { args: [37], expected: 98.6, label: 'toFahrenheit(37)' },
      { args: [-40], expected: -40, label: 'toFahrenheit(-40)', hidden: true },
    ],
    hints: [
      'Do the multiplication and division before adding 32.',
      'Java does * and / before + automatically, so no brackets are needed.',
      'return celsius * 9 / 5 + 32;',
    ],
    diagnostics: [
      { resultEquals: 64, say: 'It looks like you added 32 before multiplying. Remove the brackets around the addition.' },
      { resultEquals: 98, say: 'You lost the .6 to integer division. Make sure the maths happens on a double, not an int.' },
    ],
  },
  {
    id: 'java-out-06',
    tier: 'output',
    title: 'Team Average',
    difficulty: 2,
    prompt:
      'Write `average(int a, int b, int c)` returning the average of three whole numbers as a '
      + '`double`.\n\n'
      + '**Careful:** in Java, dividing an int by an int throws away the decimals.',
    mode: 'function',
    functionName: 'average',
    starterCode: code`
      public class Main {
          public static double average(int a, int b, int c) {

          }
      }
    `,
    tests: [
      { args: [1, 2, 3], expected: 2, label: 'average(1, 2, 3)' },
      { args: [10, 20, 30], expected: 20, label: 'average(10, 20, 30)' },
      { args: [5, 5, 8], expected: 6, label: 'average(5, 5, 8)' },
      { args: [0, 0, 1], expected: 0.3333333333333333, label: 'average(0, 0, 1)', hidden: true },
    ],
    hints: [
      'Add all three numbers together first, inside brackets.',
      'If every value is an int, Java does INTEGER division and drops the fraction.',
      'Divide by 3.0 instead of 3 — that makes Java use decimal division.',
    ],
    diagnostics: [
      { resultEquals: 0, say: 'This is integer division: (0 + 0 + 1) / 3 is 0 in Java because both sides are ints. Divide by 3.0 instead.' },
      { resultEquals: 3.6666666666666665, say: 'Without brackets Java divides only `c`. Wrap the addition: (a + b + c) / 3.0' },
    ],
  },

  // =========================================================================
  // TIER 2 — CONDITIONALS
  // =========================================================================
  {
    id: 'java-cond-01',
    tier: 'conditionals',
    title: 'Even Server Racks',
    difficulty: 1,
    prompt:
      'Racks are installed in pairs. Write `isEven(int n)` returning `true` when `n` is even.',
    mode: 'function',
    functionName: 'isEven',
    starterCode: code`
      public class Main {
          public static boolean isEven(int n) {

          }
      }
    `,
    tests: [
      { args: [4], expected: true, label: 'isEven(4)' },
      { args: [7], expected: false, label: 'isEven(7)' },
      { args: [0], expected: true, label: 'isEven(0)' },
      { args: [-3], expected: false, label: 'isEven(-3)', hidden: true },
    ],
    hints: [
      'The % operator gives the remainder after dividing.',
      'A number is even when dividing by 2 leaves a remainder of 0.',
      'return n % 2 == 0;',
    ],
    diagnostics: [
      { errorContains: 'condition must be true or false', say: 'A number is not a condition in Java. Compare it: n % 2 == 0' },
      { resultEquals: 0, say: 'You returned the remainder itself. Compare it to 0 to get true or false.' },
    ],
  },
  {
    id: 'java-cond-02',
    tier: 'conditionals',
    title: 'Pick the Bigger Budget',
    difficulty: 1,
    prompt:
      'Write `bigger(int a, int b)` returning whichever number is larger.\n\n'
      + 'If they are equal, returning either one is fine.\n\n_Use an `if` — you will meet Math.max later._',
    mode: 'function',
    functionName: 'bigger',
    starterCode: code`
      public class Main {
          public static int bigger(int a, int b) {
              if (   ) {

              } else {

              }
          }
      }
    `,
    tests: [
      { args: [3, 9], expected: 9, label: 'bigger(3, 9)' },
      { args: [12, 4], expected: 12, label: 'bigger(12, 4)' },
      { args: [5, 5], expected: 5, label: 'bigger(5, 5)' },
      { args: [-2, -8], expected: -2, label: 'bigger(-2, -8)', hidden: true },
    ],
    hints: [
      'Compare them with > and decide which one to return.',
      'if (a > b) { return a; }',
      'Then handle the other case with else { return b; }',
    ],
    diagnostics: [
      { errorContains: 'without a return', say: 'One path through your if/else does not return. Both branches need a return statement.' },
    ],
  },
  {
    id: 'java-cond-03',
    tier: 'conditionals',
    title: 'Performance Review',
    difficulty: 2,
    prompt:
      'Turn a score into a letter grade with `grade(int score)`:\n\n'
      + '- 90 and above → `"A"`\n- 80 to 89 → `"B"`\n- 70 to 79 → `"C"`\n- 60 to 69 → `"D"`\n- below 60 → `"F"`',
    mode: 'function',
    functionName: 'grade',
    starterCode: code`
      public class Main {
          public static String grade(int score) {

          }
      }
    `,
    tests: [
      { args: [95], expected: 'A', label: 'grade(95)' },
      { args: [90], expected: 'A', label: 'grade(90)' },
      { args: [85], expected: 'B', label: 'grade(85)' },
      { args: [70], expected: 'C', label: 'grade(70)' },
      { args: [60], expected: 'D', label: 'grade(60)' },
      { args: [12], expected: 'F', label: 'grade(12)' },
      { args: [89], expected: 'B', label: 'grade(89)', hidden: true },
    ],
    hints: [
      'Check the highest grade first, then work downwards.',
      'Use `else if` for the middle cases so only one branch runs.',
      'Because you check 90 first, the next check only needs score >= 80.',
    ],
    diagnostics: [
      { resultEquals: 'F', say: 'Every score is falling through to F. Check that your comparisons use >= and that the chain uses else if.' },
      { resultEquals: 'D', say: 'Check your order — testing the LOW grades first makes every score match them. Start from 90 and work down.' },
    ],
  },
  {
    id: 'java-cond-04',
    tier: 'conditionals',
    title: 'Fizz or Buzz',
    difficulty: 2,
    prompt:
      'Write `fizzBuzz(int n)` returning:\n\n'
      + '- `"FizzBuzz"` if n divides by both 3 and 5\n'
      + '- `"Fizz"` if it divides by 3\n'
      + '- `"Buzz"` if it divides by 5\n'
      + '- otherwise the number as text, e.g. `"7"`',
    mode: 'function',
    functionName: 'fizzBuzz',
    starterCode: code`
      public class Main {
          public static String fizzBuzz(int n) {

          }
      }
    `,
    tests: [
      { args: [3], expected: 'Fizz', label: 'fizzBuzz(3)' },
      { args: [5], expected: 'Buzz', label: 'fizzBuzz(5)' },
      { args: [15], expected: 'FizzBuzz', label: 'fizzBuzz(15)' },
      { args: [7], expected: '7', label: 'fizzBuzz(7)' },
      { args: [30], expected: 'FizzBuzz', label: 'fizzBuzz(30)', hidden: true },
    ],
    hints: [
      'Test the "both" case FIRST, otherwise 15 matches Fizz and stops there.',
      'Combine two conditions with && .',
      'Turn a number into text with String.valueOf(n), or just "" + n .',
    ],
    diagnostics: [
      { resultEquals: 'Fizz', say: 'When n is 15 you returned "Fizz". Check the divide-by-3-AND-5 case before the others.' },
    ],
  },
  {
    id: 'java-cond-05',
    tier: 'conditionals',
    title: 'Leap Year Audit',
    difficulty: 3,
    prompt:
      'Write `isLeap(int year)`.\n\nA year is a leap year if it divides by 4, **except** years that '
      + 'divide by 100 are not — **unless** they also divide by 400.\n\n'
      + 'So 2024 yes, 1900 no, 2000 yes.',
    mode: 'function',
    functionName: 'isLeap',
    starterCode: code`
      public class Main {
          public static boolean isLeap(int year) {

          }
      }
    `,
    tests: [
      { args: [2024], expected: true, label: 'isLeap(2024)' },
      { args: [2023], expected: false, label: 'isLeap(2023)' },
      { args: [1900], expected: false, label: 'isLeap(1900)' },
      { args: [2000], expected: true, label: 'isLeap(2000)' },
      { args: [2100], expected: false, label: 'isLeap(2100)', hidden: true },
    ],
    hints: [
      'There are three rules. Write them as three separate checks first.',
      'Divisible by 400 → always a leap year. Divisible by 100 but not 400 → never.',
      'One way: return year % 4 == 0 && (year % 100 != 0 || year % 400 == 0);',
    ],
    diagnostics: [
      { resultEquals: true, say: 'Careful with 1900 — it divides by 4 AND by 100, but not by 400, so it is not a leap year.' },
      { resultEquals: false, say: 'Careful with 2000 — it divides by 400, so it IS a leap year even though it divides by 100.' },
    ],
  },

  // =========================================================================
  // TIER 3 — LOOPS
  // =========================================================================
  {
    id: 'java-loop-01',
    tier: 'loops',
    title: 'Standup Countdown',
    difficulty: 1,
    prompt: 'Print the numbers 1 to 5, each on its own line:\n\n```\n1\n2\n3\n4\n5\n```',
    mode: 'stdout',
    starterCode: code`
      public class Main {
          public static void main(String[] args) {
              // Use a for loop
          }
      }
    `,
    tests: [{ expected: '1\n2\n3\n4\n5' }],
    hints: [
      'A for loop has three parts: start, keep-going condition, and step.',
      'for (int i = 1; i <= 5; i++) { ... }',
      'Inside the loop: System.out.println(i);',
    ],
    diagnostics: [
      { outputTrimmedEquals: '0\n1\n2\n3\n4', say: 'You started at 0. Begin with int i = 1.' },
      { outputTrimmedEquals: '1\n2\n3\n4', say: 'One short — with i < 5 the loop stops at 4. Use i <= 5.' },
      { outputTrimmedEquals: 'i', say: 'You printed the letter i as text. Take the quotes off so Java prints the variable.' },
    ],
  },
  {
    id: 'java-loop-02',
    tier: 'loops',
    title: 'Sum the Sprint',
    difficulty: 2,
    prompt:
      'Write `sumTo(int n)` that adds every whole number from 1 to `n` and returns the total.\n\n'
      + '`sumTo(5)` is 1+2+3+4+5 = 15.',
    mode: 'function',
    functionName: 'sumTo',
    starterCode: code`
      public class Main {
          public static int sumTo(int n) {
              int total = 0;
              // Loop from 1 up to and including n, adding to total
              return total;
          }
      }
    `,
    tests: [
      { args: [5], expected: 15, label: 'sumTo(5)' },
      { args: [1], expected: 1, label: 'sumTo(1)' },
      { args: [10], expected: 55, label: 'sumTo(10)' },
      { args: [100], expected: 5050, label: 'sumTo(100)', hidden: true },
    ],
    hints: [
      'Start a `total` at 0 before the loop, then add to it inside.',
      'total = total + i;  (or the shortcut total += i;)',
      'Use i <= n so that n itself is included.',
    ],
    diagnostics: [
      { resultEquals: 10, say: 'You are one short: i < n stops BEFORE n. Use i <= n.' },
      { resultEquals: 0, say: 'The total never changed. Check the adding line is INSIDE the loop braces.' },
      { resultEquals: 5, say: 'It looks like `total` is being replaced each time instead of added to. Use total += i;' },
    ],
  },
  {
    id: 'java-loop-03',
    tier: 'loops',
    title: 'Seven Times Table',
    difficulty: 2,
    prompt:
      'Print the 7 times table from 1 to 5, in this exact format:\n\n'
      + '```\n7 x 1 = 7\n7 x 2 = 14\n7 x 3 = 21\n7 x 4 = 28\n7 x 5 = 35\n```',
    mode: 'stdout',
    starterCode: code`
      public class Main {
          public static void main(String[] args) {
              for (int i = 1; i <= 5; i++) {
                  // Print one line of the times table
              }
          }
      }
    `,
    tests: [{ expected: '7 x 1 = 7\n7 x 2 = 14\n7 x 3 = 21\n7 x 4 = 28\n7 x 5 = 35' }],
    hints: [
      'Join text and numbers with + .',
      '"7 x " + i + " = " + (7 * i)',
      'The brackets around 7 * i matter — without them Java glues the digits together as text.',
    ],
    diagnostics: [
      { outputContains: '7 x 1 = 71', say: 'Java is treating 7 * i as text because of the + before it. Put brackets around it: (7 * i)' },
      { outputContains: '7x1', say: 'Check the spaces — the format is "7 x 1 = 7" with a space either side of x and of =.' },
    ],
  },
  {
    id: 'java-loop-04',
    tier: 'loops',
    title: 'Factorial Machine',
    difficulty: 2,
    prompt:
      'Write `factorial(int n)` that multiplies every number from 1 to `n` together.\n\n'
      + '`factorial(5)` is 120. `factorial(0)` is 1.',
    mode: 'function',
    functionName: 'factorial',
    starterCode: code`
      public class Main {
          public static int factorial(int n) {

          }
      }
    `,
    tests: [
      { args: [5], expected: 120, label: 'factorial(5)' },
      { args: [1], expected: 1, label: 'factorial(1)' },
      { args: [0], expected: 1, label: 'factorial(0)' },
      { args: [7], expected: 5040, label: 'factorial(7)', hidden: true },
    ],
    hints: [
      'This is like summing, but with multiplication.',
      'What should the starting value be? Starting at 0 would make everything 0.',
      'Start `result` at 1, then multiply it by each number from 1 to n.',
    ],
    diagnostics: [
      { resultEquals: 0, say: 'Your running total starts at 0, and anything times 0 is 0. Start it at 1 instead.' },
      { resultEquals: 24, say: 'You stopped one early — i < n leaves out n itself. Use i <= n.' },
    ],
  },
  {
    id: 'java-loop-05',
    tier: 'loops',
    title: 'Deploy Until Green',
    difficulty: 3,
    prompt:
      'A flaky deploy halves the number of failing tests each round, rounding down.\n\n'
      + 'Write `deploysNeeded(int failures)` returning how many rounds it takes to reach 0.\n\n'
      + 'For example 8 → 4 → 2 → 1 → 0 is **4** rounds.',
    mode: 'function',
    functionName: 'deploysNeeded',
    starterCode: code`
      public class Main {
          public static int deploysNeeded(int failures) {
              int rounds = 0;
              // Keep halving while there are still failures
              return rounds;
          }
      }
    `,
    tests: [
      { args: [8], expected: 4, label: 'deploysNeeded(8)' },
      { args: [1], expected: 1, label: 'deploysNeeded(1)' },
      { args: [0], expected: 0, label: 'deploysNeeded(0)' },
      { args: [100], expected: 7, label: 'deploysNeeded(100)', hidden: true },
    ],
    hints: [
      'You do not know how many rounds in advance, so use a `while` loop.',
      'Because failures is an int, failures / 2 already rounds down for you.',
      'Count a round every time you halve, and stop when failures reaches 0.',
    ],
    diagnostics: [
      { resultEquals: 0, say: 'The loop never ran. The while condition should keep going WHILE failures > 0.' },
      { errorContains: 'too long', say: 'Your loop never ends. Make sure `failures` actually gets smaller inside the loop.' },
    ],
  },
  {
    id: 'java-loop-06',
    tier: 'loops',
    title: 'FizzBuzz, The Classic',
    difficulty: 3,
    prompt:
      'Print the numbers 1 to 15, one per line — but:\n\n'
      + '- multiples of 3 print `Fizz`\n- multiples of 5 print `Buzz`\n'
      + '- multiples of both print `FizzBuzz`\n\n'
      + 'The first few lines are `1`, `2`, `Fizz`, `4`, `Buzz`, `Fizz`.',
    mode: 'stdout',
    starterCode: code`
      public class Main {
          public static void main(String[] args) {
              for (int i = 1; i <= 15; i++) {

              }
          }
      }
    `,
    tests: [{
      expected: '1\n2\nFizz\n4\nBuzz\nFizz\n7\n8\nFizz\nBuzz\n11\nFizz\n13\n14\nFizzBuzz',
    }],
    hints: [
      'Inside the loop use the same if / else if chain as the Fizz or Buzz problem.',
      'Check the "divides by both" case first.',
      'The final else just prints the number: System.out.println(i);',
    ],
    diagnostics: [
      { outputTrimmedEquals: '1\n2\n3\n4\n5\n6\n7\n8\n9\n10\n11\n12\n13\n14\n15', say: 'Your loop runs, but nothing is being replaced. Check the if conditions use % and == .' },
    ],
  },

  // =========================================================================
  // TIER 4 — METHODS
  // =========================================================================
  {
    id: 'java-func-01',
    tier: 'functions',
    title: 'Best of Three Bids',
    difficulty: 2,
    prompt: 'Write `maxOfThree(int a, int b, int c)` returning the largest of the three.',
    mode: 'function',
    functionName: 'maxOfThree',
    starterCode: code`
      public class Main {
          public static int maxOfThree(int a, int b, int c) {

          }
      }
    `,
    tests: [
      { args: [1, 2, 3], expected: 3, label: 'maxOfThree(1, 2, 3)' },
      { args: [9, 2, 3], expected: 9, label: 'maxOfThree(9, 2, 3)' },
      { args: [1, 8, 3], expected: 8, label: 'maxOfThree(1, 8, 3)' },
      { args: [4, 4, 4], expected: 4, label: 'maxOfThree(4, 4, 4)', hidden: true },
      { args: [-5, -2, -9], expected: -2, label: 'maxOfThree(-5, -2, -9)', hidden: true },
    ],
    hints: [
      'One approach: assume `a` is the biggest, then check the other two against it.',
      'You can also nest the built-in helper: Math.max(a, Math.max(b, c))',
      'If you write it with ifs, compare against the CURRENT biggest, not always `a`.',
    ],
    diagnostics: [
      { errorContains: 'without a return', say: 'Some path through your ifs does not return. Every branch needs a return statement.' },
    ],
  },
  {
    id: 'java-func-02',
    tier: 'functions',
    title: 'Enterprise Discount',
    difficulty: 2,
    prompt:
      'Write `applyDiscount(double price, double percent)` returning the price after taking '
      + 'off that percentage.\n\nA 200 price with 25 percent off returns 150.',
    mode: 'function',
    functionName: 'applyDiscount',
    starterCode: code`
      public class Main {
          public static double applyDiscount(double price, double percent) {

          }
      }
    `,
    tests: [
      { args: [200, 25], expected: 150, label: 'applyDiscount(200, 25)' },
      { args: [100, 10], expected: 90, label: 'applyDiscount(100, 10)' },
      { args: [50, 0], expected: 50, label: 'applyDiscount(50, 0)' },
      { args: [80, 100], expected: 0, label: 'applyDiscount(80, 100)', hidden: true },
    ],
    hints: [
      'First work out how much the discount is worth in money.',
      'double discount = price * percent / 100;',
      'Then subtract it from the price.',
    ],
    diagnostics: [
      { resultEquals: 175, say: 'You subtracted the percentage itself (25) instead of 25% of the price. Multiply by price first.' },
      { resultEquals: 50, say: 'That is the discount amount, not the final price. Subtract it from `price`.' },
    ],
  },
  {
    id: 'java-func-03',
    tier: 'functions',
    title: 'Prime Check',
    difficulty: 3,
    prompt:
      'Write `isPrime(int n)` returning `true` if `n` is prime.\n\n'
      + 'A prime has exactly two divisors: 1 and itself. 0 and 1 are **not** prime.',
    mode: 'function',
    functionName: 'isPrime',
    starterCode: code`
      public class Main {
          public static boolean isPrime(int n) {

          }
      }
    `,
    tests: [
      { args: [7], expected: true, label: 'isPrime(7)' },
      { args: [9], expected: false, label: 'isPrime(9)' },
      { args: [2], expected: true, label: 'isPrime(2)' },
      { args: [1], expected: false, label: 'isPrime(1)' },
      { args: [0], expected: false, label: 'isPrime(0)' },
      { args: [97], expected: true, label: 'isPrime(97)', hidden: true },
    ],
    hints: [
      'Deal with the small cases first: anything below 2 is not prime.',
      'Then try dividing n by every number from 2 up to n - 1.',
      'As soon as one divides evenly you can return false straight away.',
    ],
    diagnostics: [
      { resultEquals: true, say: 'Check n = 1 and n = 0 — they are not prime, so handle them before the loop.' },
    ],
  },
  {
    id: 'java-func-04',
    tier: 'functions',
    title: 'Greatest Common Divisor',
    difficulty: 3,
    prompt:
      'Write `gcd(int a, int b)` returning the largest number that divides both evenly.\n\n'
      + '`gcd(12, 18)` is 6.',
    mode: 'function',
    functionName: 'gcd',
    starterCode: code`
      public class Main {
          public static int gcd(int a, int b) {

          }
      }
    `,
    tests: [
      { args: [12, 18], expected: 6, label: 'gcd(12, 18)' },
      { args: [7, 13], expected: 1, label: 'gcd(7, 13)' },
      { args: [100, 75], expected: 25, label: 'gcd(100, 75)' },
      { args: [9, 9], expected: 9, label: 'gcd(9, 9)', hidden: true },
    ],
    hints: [
      'Simple way: count down from the smaller number and return the first value that divides both.',
      'Faster way (Euclid): while b is not 0, set temp = b, b = a % b, a = temp. Then return a.',
      'Java has no tuple swap, so you need that temporary variable.',
    ],
    diagnostics: [
      { resultEquals: 1, say: 'You are returning 1 every time. Check the loop tests each candidate against BOTH numbers.' },
      { resultEquals: 0, say: 'Returning 0 usually means the loop finished without finding anything — check its starting value.' },
    ],
  },
  {
    id: 'java-func-05',
    tier: 'functions',
    title: 'Compound Interest',
    difficulty: 3,
    prompt:
      'Write `balance(double principal, double rate, int years)` returning the final amount, '
      + '**rounded to 2 decimal places**.\n\nEach year the balance grows by `rate` percent.',
    mode: 'function',
    functionName: 'balance',
    starterCode: code`
      public class Main {
          public static double balance(double principal, double rate, int years) {

          }
      }
    `,
    tests: [
      { args: [1000, 10, 1], expected: 1100, label: 'balance(1000, 10, 1)' },
      { args: [1000, 10, 2], expected: 1210, label: 'balance(1000, 10, 2)' },
      { args: [500, 5, 3], expected: 578.81, label: 'balance(500, 5, 3)' },
      { args: [1000, 0, 5], expected: 1000, label: 'balance(1000, 0, 5)', hidden: true },
    ],
    hints: [
      'Each year multiplies the balance by (1 + rate / 100).',
      'Loop `years` times, or use Math.pow.',
      'To round to 2 places: Math.round(value * 100) / 100.0  — note the .0 so it stays a double.',
    ],
    diagnostics: [
      { resultEquals: 1500, say: 'That is simple interest. Compound interest grows on the NEW balance each year.' },
      { resultEquals: 578.8125, say: 'Right maths! Now round it: Math.round(value * 100) / 100.0' },
      { resultEquals: 578, say: 'Rounding lost the decimals — divide by 100.0 (with the .0), not 100.' },
    ],
  },

  // =========================================================================
  // TIER 5 — ARRAYS
  // =========================================================================
  {
    id: 'java-arr-01',
    tier: 'arrays',
    title: 'Total Headcount',
    difficulty: 2,
    prompt:
      'Write `total(int[] numbers)` that adds up every number in the array.\n\n'
      + 'An empty array totals 0.',
    mode: 'function',
    functionName: 'total',
    starterCode: code`
      public class Main {
          public static int total(int[] numbers) {

          }
      }
    `,
    tests: [
      { args: [[1, 2, 3]], expected: 6, label: 'total({1, 2, 3})' },
      { args: [[10, -2]], expected: 8, label: 'total({10, -2})' },
      { args: [[]], expected: 0, label: 'total({})' },
      { args: [[5]], expected: 5, label: 'total({5})', hidden: true },
    ],
    hints: [
      'Start a running total at 0 BEFORE the loop.',
      'A for-each loop is tidiest here: for (int n : numbers) { ... }',
      'Add each value: sum += n;',
    ],
    diagnostics: [
      { resultEquals: 1, say: 'It looks like the return is inside the loop, so it stops after the first value. Move it after the closing brace.' },
      { errorContains: 'out of bounds', say: 'The last valid index is numbers.length - 1, so loop while i < numbers.length.' },
    ],
  },
  {
    id: 'java-arr-02',
    tier: 'arrays',
    title: 'Top Performer',
    difficulty: 2,
    prompt:
      'Write `largest(int[] numbers)` returning the biggest value.\n\n'
      + 'The array always has at least one number.',
    mode: 'function',
    functionName: 'largest',
    starterCode: code`
      public class Main {
          public static int largest(int[] numbers) {

          }
      }
    `,
    tests: [
      { args: [[3, 9, 2]], expected: 9, label: 'largest({3, 9, 2})' },
      { args: [[5]], expected: 5, label: 'largest({5})' },
      { args: [[-4, -1, -7]], expected: -1, label: 'largest({-4, -1, -7})' },
      { args: [[2, 2, 2]], expected: 2, label: 'largest({2, 2, 2})', hidden: true },
    ],
    hints: [
      'Start by assuming the FIRST value is the biggest: int best = numbers[0];',
      'Then compare every other value and replace `best` when you find something bigger.',
      'Starting `best` at 0 breaks on all-negative arrays — that is why we start at numbers[0].',
    ],
    diagnostics: [
      { resultEquals: 0, say: 'Your starting value of 0 beat every negative number. Start from numbers[0] instead.' },
      { errorContains: 'out of bounds', say: 'You read past the end. The last index is numbers.length - 1.' },
    ],
  },
  {
    id: 'java-arr-03',
    tier: 'arrays',
    title: 'Above the Bar',
    difficulty: 2,
    prompt:
      'Write `countAbove(int[] numbers, int threshold)` returning how many values are '
      + '**strictly greater than** the threshold.',
    mode: 'function',
    functionName: 'countAbove',
    starterCode: code`
      public class Main {
          public static int countAbove(int[] numbers, int threshold) {

          }
      }
    `,
    tests: [
      { args: [[1, 5, 9], 4], expected: 2, label: 'countAbove({1, 5, 9}, 4)' },
      { args: [[1, 2, 3], 10], expected: 0, label: 'countAbove({1, 2, 3}, 10)' },
      { args: [[5, 5, 5], 5], expected: 0, label: 'countAbove({5, 5, 5}, 5)' },
      { args: [[], 0], expected: 0, label: 'countAbove({}, 0)', hidden: true },
    ],
    hints: [
      'Keep a counter starting at 0.',
      'Inside the loop, use an if to decide whether to add 1.',
      '"Strictly greater" means > , not >= .',
    ],
    diagnostics: [
      { resultEquals: 3, say: 'You counted values EQUAL to the threshold too. "Strictly greater" means > , not >= .' },
    ],
  },
  {
    id: 'java-arr-04',
    tier: 'arrays',
    title: 'Reverse the Backlog',
    difficulty: 3,
    prompt:
      'Write `reverse(int[] items)` returning a **new** array with the items in the opposite '
      + 'order.\n\nThe original array must not be changed.',
    mode: 'function',
    functionName: 'reverse',
    starterCode: code`
      public class Main {
          public static int[] reverse(int[] items) {
              int[] result = new int[items.length];
              // Fill result backwards
              return result;
          }
      }
    `,
    tests: [
      { args: [[1, 2, 3]], expected: [3, 2, 1], label: 'reverse({1, 2, 3})' },
      { args: [[4, 5]], expected: [5, 4], label: 'reverse({4, 5})' },
      { args: [[]], expected: [], label: 'reverse({})' },
      { args: [[7]], expected: [7], label: 'reverse({7})', hidden: true },
    ],
    hints: [
      'The item at index i in the original belongs at index length - 1 - i in the result.',
      'Loop i from 0 to items.length - 1 and copy across.',
      'result[items.length - 1 - i] = items[i];',
    ],
    diagnostics: [
      { resultEquals: [1, 2, 3], say: 'That is the original order. Check the index maths: length - 1 - i .' },
      { errorContains: 'out of bounds', say: 'Off by one — with length 3 the valid indexes are 0, 1 and 2, so use length - 1 - i .' },
    ],
  },
  {
    id: 'java-arr-05',
    tier: 'arrays',
    title: 'Runner-Up Salary',
    difficulty: 4,
    prompt:
      'Write `secondLargest(int[] numbers)` returning the second biggest **distinct** value.\n\n'
      + 'So `{5, 5, 3}` returns 3. If there is no second distinct value, return `-1`.',
    mode: 'function',
    functionName: 'secondLargest',
    starterCode: code`
      public class Main {
          public static int secondLargest(int[] numbers) {

          }
      }
    `,
    tests: [
      { args: [[1, 9, 5]], expected: 5, label: 'secondLargest({1, 9, 5})' },
      { args: [[5, 5, 3]], expected: 3, label: 'secondLargest({5, 5, 3})' },
      { args: [[4, 4, 4]], expected: -1, label: 'secondLargest({4, 4, 4})' },
      { args: [[2]], expected: -1, label: 'secondLargest({2})' },
      { args: [[-1, -2]], expected: -2, label: 'secondLargest({-1, -2})', hidden: true },
    ],
    hints: [
      'Distinct matters: {5, 5, 3} has only two distinct values, 5 and 3.',
      'Track the best and second-best as you loop, skipping values equal to the best.',
      'Start both at Integer.MIN_VALUE so negative numbers still work, and return -1 if second never changed.',
    ],
    diagnostics: [
      { resultEquals: 5, say: 'For {5, 5, 3} you returned 5 twice. Skip values that equal the current best.' },
      { resultEquals: 0, say: 'A starting value of 0 breaks on negative numbers. Use Integer.MIN_VALUE instead.' },
    ],
  },

  // =========================================================================
  // TIER 6 — STRINGS
  // =========================================================================
  {
    id: 'java-str-01',
    tier: 'strings',
    title: 'Ship It Loudly',
    difficulty: 1,
    prompt:
      'Write `shout(String text)` returning the text in CAPITALS with an exclamation mark added.\n\n'
      + '`shout("ship it")` returns `"SHIP IT!"`',
    mode: 'function',
    functionName: 'shout',
    starterCode: code`
      public class Main {
          public static String shout(String text) {

          }
      }
    `,
    tests: [
      { args: ['ship it'], expected: 'SHIP IT!', label: 'shout("ship it")' },
      { args: ['Hello'], expected: 'HELLO!', label: 'shout("Hello")' },
      { args: [''], expected: '!', label: 'shout("")', hidden: true },
    ],
    hints: [
      'Strings have a built-in method for capitals: text.toUpperCase()',
      'Glue the exclamation mark on with + .',
      'return text.toUpperCase() + "!";',
    ],
    diagnostics: [
      { resultEquals: 'SHIP IT', say: 'The exclamation mark is missing — add + "!" to the end.' },
      { resultEquals: 'ship it!', say: 'toUpperCase() returns a NEW String; it does not change the original. Use its result.' },
    ],
  },
  {
    id: 'java-str-02',
    tier: 'strings',
    title: 'Count the Vowels',
    difficulty: 2,
    prompt:
      'Write `countVowels(String text)` returning how many vowels (a, e, i, o, u) it contains.\n\n'
      + 'Count capitals too: `countVowels("Apple")` is 2.',
    mode: 'function',
    functionName: 'countVowels',
    starterCode: code`
      public class Main {
          public static int countVowels(String text) {

          }
      }
    `,
    tests: [
      { args: ['Apple'], expected: 2, label: 'countVowels("Apple")' },
      { args: ['xyz'], expected: 0, label: 'countVowels("xyz")' },
      { args: ['AEIOU'], expected: 5, label: 'countVowels("AEIOU")' },
      { args: ['Hello, Tycoon!'], expected: 4, label: 'countVowels("Hello, Tycoon!")', hidden: true },
    ],
    hints: [
      'Loop with an index and pull out each character with text.charAt(i).',
      'Lowercase the whole string first so you only have to check five letters.',
      '"aeiou".indexOf(c) >= 0 is a quick way to test membership.',
    ],
    diagnostics: [
      { resultEquals: 1, say: 'Capitals are being missed. Lowercase the text (or the character) before checking it.' },
      { errorContains: 'out of bounds', say: 'charAt goes from 0 to text.length() - 1, so loop while i < text.length().' },
    ],
  },
  {
    id: 'java-str-03',
    tier: 'strings',
    title: 'Palindrome Check',
    difficulty: 3,
    prompt:
      'Write `isPalindrome(String text)` returning `true` if the text reads the same backwards.\n\n'
      + 'Ignore capitals and spaces: `"Race car"` is a palindrome.',
    mode: 'function',
    functionName: 'isPalindrome',
    starterCode: code`
      public class Main {
          public static boolean isPalindrome(String text) {

          }
      }
    `,
    tests: [
      { args: ['racecar'], expected: true, label: 'isPalindrome("racecar")' },
      { args: ['Race car'], expected: true, label: 'isPalindrome("Race car")' },
      { args: ['hello'], expected: false, label: 'isPalindrome("hello")' },
      { args: [''], expected: true, label: 'isPalindrome("")', hidden: true },
      { args: ['Never odd or even'], expected: true, label: 'a long one', hidden: true },
    ],
    hints: [
      'First clean the text: text.toLowerCase().replace(" ", "")',
      'Then compare the first character with the last, the second with the second-last, and so on.',
      'A StringBuilder can also reverse it for you: new StringBuilder(clean).reverse().toString()',
    ],
    diagnostics: [
      { resultEquals: false, say: 'Check the cleaning step — "Race car" only works once capitals and spaces are removed.' },
      { errorContains: 'Strings with ==', say: 'Use .equals() to compare String contents in Java, not == .' },
    ],
  },
  {
    id: 'java-str-04',
    tier: 'strings',
    title: 'Badge Initials',
    difficulty: 3,
    prompt:
      'Write `initials(String fullName)` turning a name into dotted initials.\n\n'
      + '`initials("Ada Lovelace")` returns `"A.L."`\n\nNames can have two or three parts.',
    mode: 'function',
    functionName: 'initials',
    starterCode: code`
      public class Main {
          public static String initials(String fullName) {

          }
      }
    `,
    tests: [
      { args: ['Ada Lovelace'], expected: 'A.L.', label: 'initials("Ada Lovelace")' },
      { args: ['grace brewster hopper'], expected: 'G.B.H.', label: 'lowercase, three parts' },
      { args: ['Linus'], expected: 'L.', label: 'initials("Linus")', hidden: true },
    ],
    hints: [
      'fullName.split(" ") gives you a String array of the words.',
      'For each word take word.charAt(0) and uppercase it.',
      'Character.toUpperCase(c) uppercases a single character.',
    ],
    diagnostics: [
      { resultEquals: 'A.L', say: 'Every initial gets a dot after it, including the last one.' },
      { resultEquals: 'a.l.', say: 'Uppercase each letter — Character.toUpperCase(...) works on a single char.' },
    ],
  },
  {
    id: 'java-str-05',
    tier: 'strings',
    title: 'Longest Word',
    difficulty: 3,
    prompt:
      'Write `longestWord(String sentence)` returning the longest word.\n\n'
      + 'If two words tie, return the one that appears first.',
    mode: 'function',
    functionName: 'longestWord',
    starterCode: code`
      public class Main {
          public static String longestWord(String sentence) {

          }
      }
    `,
    tests: [
      { args: ['we ship good code'], expected: 'ship', label: 'four words' },
      { args: ['deploy on friday'], expected: 'deploy', label: 'first is longest' },
      { args: ['a bb ccc'], expected: 'ccc', label: 'last is longest' },
      { args: ['tie test size'], expected: 'test', label: 'ties pick the first', hidden: true },
    ],
    hints: [
      'Split the sentence with sentence.split(" ").',
      'Track the best word so far, starting with the first one.',
      'Only replace it when a word is STRICTLY longer — that keeps ties on the earlier word.',
    ],
    diagnostics: [
      { resultEquals: 'size', say: 'On a tie you picked the later word. Use > rather than >= when comparing lengths.' },
      { resultEquals: 4, say: 'You returned the length. The task asks for the word itself.' },
    ],
  },

  // =========================================================================
  // TIER 7 — CLASSES & OBJECTS
  // =========================================================================
  {
    id: 'java-oop-01',
    tier: 'oop',
    title: 'Your First Employee',
    difficulty: 2,
    prompt:
      'Build an `Employee` class.\n\n'
      + 'It needs a constructor taking a name and a salary, and a method `describe()` that '
      + 'returns text like:\n\n`Ada earns 90000`\n\n'
      + '_The `main` method at the top runs your class. Leave it alone._',
    mode: 'stdout',
    starterCode: code`
      public class Main {
          // --- do not change this method ---
          public static void main(String[] args) {
              Employee e = new Employee("Ada", 90000);
              System.out.println(e.describe());
              System.out.println(new Employee("Linus", 50000).describe());
          }
      }

      class Employee {
          // 1. Declare fields for the name and salary

          // 2. Write a constructor that sets them

          // 3. Write describe() returning "NAME earns SALARY"
      }
    `,
    tests: [{ expected: 'Ada earns 90000\nLinus earns 50000' }],
    hints: [
      'Fields go at the top: private String name; private int salary;',
      'The constructor has the same name as the class and no return type: Employee(String name, int salary) { ... }',
      'Inside it, use this.name = name; so the field and the parameter do not get confused.',
    ],
    diagnostics: [
      { errorContains: 'no constructor', say: 'The class needs a constructor taking a String and an int. It has the same name as the class and no return type.' },
      { errorContains: 'no method called "describe"', say: 'Add a describe() method that returns a String.' },
      { outputContains: 'null earns 0', say: 'The fields were never set. Assign them inside the constructor with this.name = name;' },
    ],
  },
  {
    id: 'java-oop-02',
    tier: 'oop',
    title: 'Company Bank Account',
    difficulty: 3,
    prompt:
      'Build a `BankAccount` class that starts at a given balance and supports:\n\n'
      + '- `deposit(int amount)` — adds money\n'
      + '- `withdraw(int amount)` — takes money out, but **refuses** if there is not enough, '
      + 'leaving the balance unchanged\n'
      + '- `getBalance()` — returns the current balance\n\n'
      + '_The `main` method runs your class. Leave it alone._',
    mode: 'stdout',
    starterCode: code`
      public class Main {
          // --- do not change this method ---
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

      }
    `,
    tests: [{ expected: '150\n120\n120' }],
    hints: [
      'One field is enough: private int balance;',
      'deposit adds to balance; withdraw subtracts from it.',
      'Guard the withdrawal with an if: only subtract when amount <= balance.',
    ],
    diagnostics: [
      { outputContains: '-9879', say: 'The overdraft went through. Add a check so withdraw does nothing when the amount is more than the balance.' },
      { errorContains: 'no constructor', say: 'BankAccount needs a constructor taking the starting balance.' },
    ],
  },
  {
    id: 'java-oop-03',
    tier: 'oop',
    title: 'Meeting Room Dimensions',
    difficulty: 3,
    prompt:
      'Build a `Room` class with a constructor taking width and height, plus:\n\n'
      + '- `area()` — width × height\n'
      + '- `perimeter()` — twice the width plus twice the height\n'
      + '- `isSquare()` — `true` when width and height match\n\n'
      + '_The `main` method runs your class. Leave it alone._',
    mode: 'stdout',
    starterCode: code`
      public class Main {
          // --- do not change this method ---
          public static void main(String[] args) {
              Room r = new Room(4, 6);
              System.out.println(r.area());
              System.out.println(r.perimeter());
              System.out.println(r.isSquare());
              System.out.println(new Room(5, 5).isSquare());
          }
      }

      class Room {

      }
    `,
    tests: [{ expected: '24\n20\nfalse\ntrue' }],
    hints: [
      'All three methods read the width and height fields.',
      'Perimeter is 2 * width + 2 * height.',
      'isSquare can return the comparison directly: return width == height;',
    ],
    diagnostics: [
      { outputContains: '10', say: 'Check the perimeter formula — it is 2 × width + 2 × height.' },
      { outputContains: 'True', say: 'Java prints booleans in lowercase: true and false.' },
    ],
  },
  {
    id: 'java-oop-04',
    tier: 'oop',
    title: 'Promote to Manager',
    difficulty: 4,
    prompt:
      'Start from the `Employee` class below, then write a `Manager` class that **extends** it.\n\n'
      + 'A Manager also has a team size, and its `describe()` should return text like:\n\n'
      + '`Grace manages 4 people`\n\n'
      + '_The `main` method runs your classes. Leave it alone._',
    mode: 'stdout',
    starterCode: code`
      public class Main {
          // --- do not change this method ---
          public static void main(String[] args) {
              System.out.println(new Employee("Ada").describe());
              System.out.println(new Manager("Grace", 4).describe());
          }
      }

      class Employee {
          protected String name;

          Employee(String name) {
              this.name = name;
          }

          public String describe() {
              return name + " writes code";
          }
      }

      class Manager extends Employee {
          // Add a teamSize field, a constructor, and your own describe()
      }
    `,
    tests: [{ expected: 'Ada writes code\nGrace manages 4 people' }],
    hints: [
      'The Manager constructor must call super(name) first to set the inherited name field.',
      'Then store the extra value: this.teamSize = teamSize;',
      'Writing describe() in Manager REPLACES the inherited one.',
    ],
    diagnostics: [
      { outputContains: 'Grace writes code', say: 'Manager is still using the inherited describe(). Give Manager its own describe() method.' },
      { errorContains: 'no constructor', say: 'Manager needs its own constructor taking a String and an int, starting with super(name);' },
    ],
  },

  // =========================================================================
  // TIER 8 — RECURSION
  // =========================================================================
  {
    id: 'java-rec-01',
    tier: 'recursion',
    title: 'Factorial, Recursively',
    difficulty: 3,
    prompt:
      'Write `factorial(int n)` **using recursion** — the method must call itself.\n\n'
      + 'Loops are not allowed for this one.\n\n'
      + '`factorial(0)` is 1, and `factorial(n)` is `n × factorial(n - 1)`.',
    mode: 'function',
    functionName: 'factorial',
    starterCode: code`
      public class Main {
          public static int factorial(int n) {
              // Base case: when is the answer just 1?
              // Recursive case: n times the factorial of one less
          }
      }
    `,
    tests: [
      { args: [5], expected: 120, label: 'factorial(5)' },
      { args: [0], expected: 1, label: 'factorial(0)' },
      { args: [1], expected: 1, label: 'factorial(1)' },
      { args: [10], expected: 3628800, label: 'factorial(10)', hidden: true },
    ],
    sourceChecks: [
      { forbid: '\\b(for|while)\\b', message: 'This one has to be recursive — no `for` or `while` loops allowed.' },
    ],
    hints: [
      'A recursive method needs a BASE CASE that returns without calling itself.',
      'Here the base case is n == 0 (or n <= 1), which returns 1.',
      'Otherwise: return n * factorial(n - 1);',
    ],
    diagnostics: [
      { errorContains: 'too many times', say: 'It never stops calling itself. Add a base case that returns 1 when n reaches 0.' },
      { resultEquals: 0, say: 'Check the base case — if it returns 0, everything multiplies down to 0. It should return 1.' },
    ],
  },
  {
    id: 'java-rec-02',
    tier: 'recursion',
    title: 'Fibonacci Growth',
    difficulty: 4,
    prompt:
      'Write `fib(int n)` recursively.\n\n'
      + 'The sequence starts `fib(0) = 0`, `fib(1) = 1`, and after that each value is the sum '
      + 'of the two before it.',
    mode: 'function',
    functionName: 'fib',
    starterCode: code`
      public class Main {
          public static int fib(int n) {

          }
      }
    `,
    tests: [
      { args: [0], expected: 0, label: 'fib(0)' },
      { args: [1], expected: 1, label: 'fib(1)' },
      { args: [7], expected: 13, label: 'fib(7)' },
      { args: [15], expected: 610, label: 'fib(15)', hidden: true },
    ],
    sourceChecks: [
      { forbid: '\\b(for|while)\\b', message: 'This one has to be recursive — no `for` or `while` loops allowed.' },
    ],
    hints: [
      'There are TWO base cases here, one for 0 and one for 1.',
      'The recursive case adds the two previous values.',
      'return fib(n - 1) + fib(n - 2);',
    ],
    diagnostics: [
      { resultEquals: 21, say: 'You are one step ahead — check that fib(0) returns 0 and fib(1) returns 1.' },
      { errorContains: 'too many times', say: 'Missing a base case. You need to stop at both n == 0 and n == 1.' },
    ],
  },
  {
    id: 'java-rec-03',
    tier: 'recursion',
    title: 'Digit Sum',
    difficulty: 4,
    prompt:
      'Write `digitSum(int n)` that recursively adds up the digits of a positive number.\n\n'
      + '`digitSum(1234)` is 1+2+3+4 = 10.',
    mode: 'function',
    functionName: 'digitSum',
    starterCode: code`
      public class Main {
          public static int digitSum(int n) {

          }
      }
    `,
    tests: [
      { args: [1234], expected: 10, label: 'digitSum(1234)' },
      { args: [5], expected: 5, label: 'digitSum(5)' },
      { args: [0], expected: 0, label: 'digitSum(0)' },
      { args: [99999], expected: 45, label: 'digitSum(99999)', hidden: true },
    ],
    sourceChecks: [
      { forbid: '\\b(for|while)\\b', message: 'This one has to be recursive — no `for` or `while` loops allowed.' },
    ],
    hints: [
      'n % 10 gives you the LAST digit.',
      'n / 10 chops that last digit off — and because n is an int, Java rounds down for you.',
      'Base case: when n is 0 there is nothing left to add.',
    ],
    diagnostics: [
      { resultEquals: 4, say: 'Only the last digit is being counted. Add it to digitSum(n / 10) to keep going.' },
      { errorContains: 'too many times', say: 'Add a base case: when n is 0, return 0 without calling yourself again.' },
    ],
  },
  {
    id: 'java-rec-04',
    tier: 'recursion',
    title: 'Power Without Math.pow',
    difficulty: 5,
    prompt:
      'Write `power(int base, int exponent)` recursively, for exponents of 0 or more.\n\n'
      + 'Anything to the power of 0 is 1.\n\n_No `Math.pow`, no loops._',
    mode: 'function',
    functionName: 'power',
    starterCode: code`
      public class Main {
          public static int power(int base, int exponent) {

          }
      }
    `,
    tests: [
      { args: [2, 3], expected: 8, label: 'power(2, 3)' },
      { args: [5, 0], expected: 1, label: 'power(5, 0)' },
      { args: [3, 4], expected: 81, label: 'power(3, 4)' },
      { args: [7, 1], expected: 7, label: 'power(7, 1)' },
      { args: [2, 10], expected: 1024, label: 'power(2, 10)', hidden: true },
    ],
    sourceChecks: [
      { forbid: '\\b(for|while)\\b', message: 'This one has to be recursive — no `for` or `while` loops allowed.' },
      { forbid: 'Math\\s*\\.\\s*pow', message: 'Solve it with recursion rather than Math.pow.' },
    ],
    hints: [
      'Base case: an exponent of 0 always gives 1.',
      'Each step multiplies by `base` and reduces the exponent by 1.',
      'return base * power(base, exponent - 1);',
    ],
    diagnostics: [
      { resultEquals: 0, say: 'The base case is returning 0. Anything to the power of 0 is 1.' },
      { resultEquals: 6, say: 'That looks like base × exponent. Each recursive step should MULTIPLY by base, not add.' },
    ],
  },
];

export default PROBLEMS;
