/**
 * ============================================================================
 * PYTHON PROBLEM BANK
 * ============================================================================
 *
 * HOW TO ADD A PROBLEM
 * Copy any block below and change the fields. The `id` must be unique across
 * this file (it is what the save file records as "solved").
 *
 * FIELDS
 *   id            unique string, e.g. 'py-loops-07'
 *   tier          one of the tier ids in ../tiers.js
 *   title         short name shown in the problem list
 *   difficulty    1-5. Bytes earned = tier.rewardBase × difficulty × bonuses
 *   prompt        the question. Supports **bold**, `inline code`, and blank
 *                 lines between paragraphs. Keep it short and concrete.
 *   starterCode   what appears in the editor. Use the code`` helper so the
 *                 indentation in THIS file doesn't leak into the editor.
 *   mode          'function' — we call one function with arguments and check
 *                              what it returns (best for most problems)
 *                 'stdout'   — we run the whole program and check what it
 *                              printed (best for print-and-loop exercises)
 *   functionName  required when mode is 'function'
 *   tests         see below
 *   hints         shown one at a time when a student asks for a hint
 *   diagnostics   targeted feedback — if a student's WRONG answer matches one
 *                 of these, they get this message instead of a generic "nope".
 *                 This is where most of the teaching happens; add one for
 *                 every mistake you see students actually make.
 *   sourceChecks  optional rules about the code itself, e.g. forbidding loops
 *                 in a recursion problem.
 *
 * TEST SHAPES
 *   function mode: { args: [2, 3], expected: 5, label: 'add(2, 3)' }
 *   stdout mode:   { expected: 'Hello!', stdin: '' }
 *   Add `hidden: true` to keep a test's details out of the student's view
 *   (they still see whether it passed).
 *
 * DIAGNOSTIC SHAPES  (all optional, first match wins)
 *   { resultEquals: 10, say: '...' }          the function returned this
 *   { outputTrimmedEquals: 'hi', say: '...' } the program printed exactly this
 *   { outputContains: 'None', say: '...' }    the program printed this somewhere
 *   { errorContains: 'IndentationError', say: '...' }
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
    id: 'py-out-01',
    tier: 'output',
    title: 'Hello, Tycoon!',
    difficulty: 1,
    prompt:
      'Every company starts with a first commit.\n\n'
      + 'Print exactly this line:\n\n`Hello, Tycoon!`\n\n'
      + 'Spelling, capitals and the exclamation mark all have to match.',
    mode: 'stdout',
    starterCode: code`
      # Print the greeting below.
      # Remember: text goes inside quotes.
    `,
    tests: [{ expected: 'Hello, Tycoon!', label: 'prints the greeting' }],
    hints: [
      'The `print` function shows text on the screen.',
      'Text needs quotes around it: print("some text")',
      'The whole line is: print("Hello, Tycoon!")',
    ],
    diagnostics: [
      { outputTrimmedEquals: '', say: 'Nothing was printed. Did you remember to call print(...)?' },
      { outputTrimmedEquals: 'Hello, World!', say: 'Close! But this company is called Tycoon, not World.' },
      { outputTrimmedEquals: 'Hello, Tycoon', say: 'Almost — the exclamation mark at the end is part of the text too.' },
      { outputTrimmedEquals: 'hello, tycoon!', say: 'Check your capital letters: H and T are both uppercase.' },
    ],
  },
  {
    id: 'py-out-02',
    tier: 'output',
    title: 'Name the Company',
    difficulty: 1,
    prompt:
      'Store the company name in a **variable** called `company`, then print a welcome line.\n\n'
      + 'The name is `Bitwise Inc`, and the output should be:\n\n`Welcome to Bitwise Inc`',
    mode: 'stdout',
    starterCode: code`
      # 1. Put the company name in a variable
      company =

      # 2. Print the welcome message using that variable
    `,
    tests: [{ expected: 'Welcome to Bitwise Inc' }],
    hints: [
      'A variable is made with = , like this: company = "Bitwise Inc"',
      'You can glue text together with + : "Welcome to " + company',
      'Watch the space after "Welcome to" — it matters.',
    ],
    diagnostics: [
      { outputTrimmedEquals: 'Welcome toBitwise Inc', say: 'You need a space after "to". Try "Welcome to " with a space before the closing quote.' },
      { outputTrimmedEquals: 'Welcome to company', say: 'You printed the word "company" as text. Take it out of the quotes so Python uses the variable.' },
      { errorContains: 'SyntaxError', say: 'Python could not read your code. Check that the variable has a value after the = sign.' },
    ],
  },
  {
    id: 'py-out-03',
    tier: 'output',
    title: 'Desk Area',
    difficulty: 1,
    prompt:
      'Write a function `area(width, height)` that returns the area of a rectangular desk.\n\n'
      + 'Area is width times height.',
    mode: 'function',
    functionName: 'area',
    starterCode: code`
      def area(width, height):
          # Return the area (width times height)
          pass
    `,
    tests: [
      { args: [3, 4], expected: 12, label: 'area(3, 4)' },
      { args: [10, 2], expected: 20, label: 'area(10, 2)' },
      { args: [7, 7], expected: 49, label: 'area(7, 7)' },
      { args: [1, 0], expected: 0, label: 'area(1, 0)', hidden: true },
    ],
    hints: [
      'Multiplication in Python uses the * symbol.',
      'Use `return`, not `print` — the game checks what the function gives back.',
      'The body is one line: return width * height',
    ],
    diagnostics: [
      { resultEquals: null, say: 'Your function returned nothing. Replace `pass` with a `return` statement.' },
      { resultEquals: 7, say: 'That looks like width + height. Area uses multiplication (*), not addition.' },
    ],
  },
  {
    id: 'py-out-04',
    tier: 'output',
    title: 'Seconds in a Sprint',
    difficulty: 1,
    prompt:
      'A two-week sprint is 14 days. Write `sprint_seconds(days)` that returns how many '
      + 'seconds are in that many days.\n\n'
      + 'There are 24 hours in a day, 60 minutes in an hour, and 60 seconds in a minute.',
    mode: 'function',
    functionName: 'sprint_seconds',
    starterCode: code`
      def sprint_seconds(days):
          # 24 hours × 60 minutes × 60 seconds in every day
          pass
    `,
    tests: [
      { args: [1], expected: 86400, label: 'sprint_seconds(1)' },
      { args: [14], expected: 1209600, label: 'sprint_seconds(14)' },
      { args: [0], expected: 0, label: 'sprint_seconds(0)', hidden: true },
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
    id: 'py-out-05',
    tier: 'output',
    title: 'Server Room Thermostat',
    difficulty: 2,
    prompt:
      'The server room thermostat reads Celsius but the American investors want Fahrenheit.\n\n'
      + 'Write `to_fahrenheit(celsius)` using the formula:\n\n`F = C × 9 / 5 + 32`',
    mode: 'function',
    functionName: 'to_fahrenheit',
    starterCode: code`
      def to_fahrenheit(celsius):
          pass
    `,
    tests: [
      { args: [0], expected: 32, label: 'to_fahrenheit(0)' },
      { args: [100], expected: 212, label: 'to_fahrenheit(100)' },
      { args: [37], expected: 98.6, label: 'to_fahrenheit(37)' },
      { args: [-40], expected: -40, label: 'to_fahrenheit(-40)', hidden: true },
    ],
    hints: [
      'Do the multiplication and division before adding 32.',
      'Python does * and / before + automatically, so you can write it in one line.',
      'return celsius * 9 / 5 + 32',
    ],
    diagnostics: [
      { resultEquals: 0, say: 'Check the order: multiply by 9 and divide by 5 FIRST, then add 32.' },
      { resultEquals: 64, say: 'It looks like you added 32 before multiplying. Brackets change the order — here you do not want any.' },
    ],
  },
  {
    id: 'py-out-06',
    tier: 'output',
    title: 'Team Average',
    difficulty: 2,
    prompt:
      'Write `average(a, b, c)` that returns the average of three numbers.\n\n'
      + 'The average is the total divided by how many numbers there are.',
    mode: 'function',
    functionName: 'average',
    starterCode: code`
      def average(a, b, c):
          pass
    `,
    tests: [
      { args: [1, 2, 3], expected: 2, label: 'average(1, 2, 3)' },
      { args: [10, 20, 30], expected: 20, label: 'average(10, 20, 30)' },
      { args: [5, 5, 8], expected: 6, label: 'average(5, 5, 8)' },
      { args: [0, 0, 1], expected: 0.3333333333333333, label: 'average(0, 0, 1)', hidden: true },
    ],
    hints: [
      'Add all three numbers together first.',
      'You need brackets so the addition happens before the division.',
      'return (a + b + c) / 3',
    ],
    diagnostics: [
      { resultEquals: 3.6666666666666665, say: 'Without brackets Python divides only `c` by 3. Wrap the addition: (a + b + c) / 3' },
    ],
  },

  // =========================================================================
  // TIER 2 — CONDITIONALS
  // =========================================================================
  {
    id: 'py-cond-01',
    tier: 'conditionals',
    title: 'Even Server Racks',
    difficulty: 1,
    prompt:
      'Racks are installed in pairs. Write `is_even(n)` that returns `True` when `n` is '
      + 'even and `False` when it is odd.',
    mode: 'function',
    functionName: 'is_even',
    starterCode: code`
      def is_even(n):
          pass
    `,
    tests: [
      { args: [4], expected: true, label: 'is_even(4)' },
      { args: [7], expected: false, label: 'is_even(7)' },
      { args: [0], expected: true, label: 'is_even(0)' },
      { args: [-3], expected: false, label: 'is_even(-3)', hidden: true },
    ],
    hints: [
      'The % operator gives you the remainder after dividing.',
      'A number is even when dividing by 2 leaves a remainder of 0.',
      'return n % 2 == 0',
    ],
    diagnostics: [
      { resultEquals: 0, say: 'You returned the remainder itself. Compare it to 0 to get True or False: n % 2 == 0' },
      { errorContains: 'name \'true\'', say: 'Python spells them `True` and `False`, with capital letters.' },
    ],
  },
  {
    id: 'py-cond-02',
    tier: 'conditionals',
    title: 'Pick the Bigger Budget',
    difficulty: 1,
    prompt:
      'Write `bigger(a, b)` that returns whichever number is larger.\n\n'
      + 'If they are equal, returning either one is fine.\n\n'
      + '_Do it with an `if` statement — you will meet `max()` later._',
    mode: 'function',
    functionName: 'bigger',
    starterCode: code`
      def bigger(a, b):
          if ...:
              pass
          else:
              pass
    `,
    tests: [
      { args: [3, 9], expected: 9, label: 'bigger(3, 9)' },
      { args: [12, 4], expected: 12, label: 'bigger(12, 4)' },
      { args: [5, 5], expected: 5, label: 'bigger(5, 5)' },
      { args: [-2, -8], expected: -2, label: 'bigger(-2, -8)', hidden: true },
    ],
    hints: [
      'Compare them with > and decide which one to return.',
      'if a > b: return a',
      'Then handle the other case with else: return b',
    ],
    diagnostics: [
      { resultEquals: true, say: 'You returned the comparison (True/False). The task asks for the actual number.' },
      { errorContains: 'invalid syntax', say: 'Check that your `if` line ends with a colon (:) and the line below it is indented.' },
    ],
  },
  {
    id: 'py-cond-03',
    tier: 'conditionals',
    title: 'Performance Review',
    difficulty: 2,
    prompt:
      'Turn a score into a letter grade with `grade(score)`:\n\n'
      + '- 90 and above → `"A"`\n- 80 to 89 → `"B"`\n- 70 to 79 → `"C"`\n- 60 to 69 → `"D"`\n- below 60 → `"F"`',
    mode: 'function',
    functionName: 'grade',
    starterCode: code`
      def grade(score):
          pass
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
      'Use `elif` for the middle cases so only one branch runs.',
      'Because you check 90 first, the next check only needs `score >= 80`.',
    ],
    diagnostics: [
      { resultEquals: 'F', say: 'Every score is falling through to F. Make sure you use `if` / `elif` and that your comparisons use >= .' },
      { resultEquals: 'D', say: 'Check your order — if you test the LOW grades first, every score matches them. Start from 90 and work down.' },
    ],
  },
  {
    id: 'py-cond-04',
    tier: 'conditionals',
    title: 'Fizz or Buzz',
    difficulty: 2,
    prompt:
      'Write `fizz_buzz(n)` that returns:\n\n'
      + '- `"FizzBuzz"` if n divides by both 3 and 5\n'
      + '- `"Fizz"` if it divides by 3\n'
      + '- `"Buzz"` if it divides by 5\n'
      + '- otherwise the number itself as text, e.g. `"7"`',
    mode: 'function',
    functionName: 'fizz_buzz',
    starterCode: code`
      def fizz_buzz(n):
          pass
    `,
    tests: [
      { args: [3], expected: 'Fizz', label: 'fizz_buzz(3)' },
      { args: [5], expected: 'Buzz', label: 'fizz_buzz(5)' },
      { args: [15], expected: 'FizzBuzz', label: 'fizz_buzz(15)' },
      { args: [7], expected: '7', label: 'fizz_buzz(7)' },
      { args: [30], expected: 'FizzBuzz', label: 'fizz_buzz(30)', hidden: true },
    ],
    hints: [
      'Test the "both" case FIRST, otherwise 15 will match Fizz and stop there.',
      'Combine two conditions with `and`.',
      'Turn a number into text with str(n).',
    ],
    diagnostics: [
      { resultEquals: 'Fizz', say: 'When n is 15 you returned "Fizz". Check the divide-by-3-AND-5 case before the others.' },
      { resultEquals: 7, say: 'You returned the number itself. The task asks for text — wrap it in str(...).' },
    ],
  },
  {
    id: 'py-cond-05',
    tier: 'conditionals',
    title: 'Leap Year Audit',
    difficulty: 3,
    prompt:
      'Write `is_leap(year)`.\n\nA year is a leap year if it divides by 4, **except** years that '
      + 'divide by 100 are not — **unless** they also divide by 400.\n\n'
      + 'So 2024 yes, 1900 no, 2000 yes.',
    mode: 'function',
    functionName: 'is_leap',
    starterCode: code`
      def is_leap(year):
          pass
    `,
    tests: [
      { args: [2024], expected: true, label: 'is_leap(2024)' },
      { args: [2023], expected: false, label: 'is_leap(2023)' },
      { args: [1900], expected: false, label: 'is_leap(1900)' },
      { args: [2000], expected: true, label: 'is_leap(2000)' },
      { args: [2100], expected: false, label: 'is_leap(2100)', hidden: true },
    ],
    hints: [
      'There are three rules. Write them as three separate checks first.',
      'Divisible by 400 → always a leap year. Divisible by 100 but not 400 → never.',
      'One way: return year % 4 == 0 and (year % 100 != 0 or year % 400 == 0)',
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
    id: 'py-loop-01',
    tier: 'loops',
    title: 'Standup Countdown',
    difficulty: 1,
    prompt:
      'Print the numbers 1 to 5, each on its own line:\n\n```\n1\n2\n3\n4\n5\n```',
    mode: 'stdout',
    starterCode: code`
      # Use a for loop and range()
    `,
    tests: [{ expected: '1\n2\n3\n4\n5' }],
    hints: [
      'range(5) gives 0, 1, 2, 3, 4 — that is five numbers, but starting at 0.',
      'range(1, 6) gives 1, 2, 3, 4, 5. The second number is where it STOPS, not the last value.',
      'for i in range(1, 6):\n    print(i)',
    ],
    diagnostics: [
      { outputTrimmedEquals: '0\n1\n2\n3\n4', say: 'You started at 0. range(1, 6) starts at 1 and stops before 6.' },
      { outputTrimmedEquals: '1\n2\n3\n4', say: 'One short! range stops BEFORE the second number, so you need range(1, 6).' },
      { outputTrimmedEquals: 'i', say: 'You printed the letter i as text. Take the quotes off so Python prints the variable.' },
    ],
  },
  {
    id: 'py-loop-02',
    tier: 'loops',
    title: 'Sum the Sprint',
    difficulty: 2,
    prompt:
      'Write `sum_to(n)` that adds up every whole number from 1 to `n` and returns the total.\n\n'
      + 'For example `sum_to(5)` is 1+2+3+4+5 = 15.',
    mode: 'function',
    functionName: 'sum_to',
    starterCode: code`
      def sum_to(n):
          total = 0
          # Loop from 1 up to and including n, adding to total
          return total
    `,
    tests: [
      { args: [5], expected: 15, label: 'sum_to(5)' },
      { args: [1], expected: 1, label: 'sum_to(1)' },
      { args: [10], expected: 55, label: 'sum_to(10)' },
      { args: [100], expected: 5050, label: 'sum_to(100)', hidden: true },
    ],
    hints: [
      'Start a `total` at 0 before the loop, then add to it inside the loop.',
      'total = total + i  (or the shortcut total += i)',
      'Use range(1, n + 1) so that n itself is included.',
    ],
    diagnostics: [
      { resultEquals: 10, say: 'You are one short: range(1, n) stops BEFORE n. Use range(1, n + 1).' },
      { resultEquals: 5, say: 'It looks like `total` is being replaced each time instead of added to. Use total += i .' },
      { resultEquals: 0, say: 'The total never changed. Check that the line adding to `total` is indented INSIDE the loop.' },
    ],
  },
  {
    id: 'py-loop-03',
    tier: 'loops',
    title: 'Seven Times Table',
    difficulty: 2,
    prompt:
      'Print the 7 times table from 1 to 5, in this exact format:\n\n'
      + '```\n7 x 1 = 7\n7 x 2 = 14\n7 x 3 = 21\n7 x 4 = 28\n7 x 5 = 35\n```',
    mode: 'stdout',
    starterCode: code`
      for i in range(1, 6):
          # Print one line of the times table
          pass
    `,
    tests: [{ expected: '7 x 1 = 7\n7 x 2 = 14\n7 x 3 = 21\n7 x 4 = 28\n7 x 5 = 35' }],
    hints: [
      'Each line mixes text and numbers. An f-string is the tidiest way.',
      'f"7 x {i} = {7 * i}"  puts the values straight into the text.',
      'print(f"7 x {i} = {7 * i}")',
    ],
    diagnostics: [
      { outputContains: '7 x i', say: 'The letter i is being printed as text. Inside an f-string it needs curly braces: {i}' },
      { outputContains: '7x1', say: 'Check the spaces — the format is "7 x 1 = 7" with a space either side of x and of =.' },
    ],
  },
  {
    id: 'py-loop-04',
    tier: 'loops',
    title: 'Factorial Machine',
    difficulty: 2,
    prompt:
      'Write `factorial(n)` that multiplies every number from 1 to `n` together.\n\n'
      + '`factorial(5)` is 1×2×3×4×5 = 120. `factorial(0)` is 1.',
    mode: 'function',
    functionName: 'factorial',
    starterCode: code`
      def factorial(n):
          pass
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
      'Start `result` at 1, then multiply it by each number in range(1, n + 1).',
    ],
    diagnostics: [
      { resultEquals: 0, say: 'Your running total starts at 0, and anything times 0 is 0. Start it at 1 instead.' },
      { resultEquals: 24, say: 'You stopped one early — range(1, n) leaves out n itself. Use range(1, n + 1).' },
    ],
  },
  {
    id: 'py-loop-05',
    tier: 'loops',
    title: 'Deploy Until Green',
    difficulty: 3,
    prompt:
      'A flaky deploy halves the number of failing tests each round, rounding down.\n\n'
      + 'Write `deploys_needed(failures)` that returns how many rounds it takes to reach 0 failures.\n\n'
      + 'For example 8 → 4 → 2 → 1 → 0 is **4** rounds.',
    mode: 'function',
    functionName: 'deploys_needed',
    starterCode: code`
      def deploys_needed(failures):
          rounds = 0
          # Keep halving while there are still failures
          return rounds
    `,
    tests: [
      { args: [8], expected: 4, label: 'deploys_needed(8)' },
      { args: [1], expected: 1, label: 'deploys_needed(1)' },
      { args: [0], expected: 0, label: 'deploys_needed(0)' },
      { args: [100], expected: 7, label: 'deploys_needed(100)', hidden: true },
    ],
    hints: [
      'You do not know how many rounds in advance, so use a `while` loop.',
      'Halving and rounding down is what // does: failures = failures // 2',
      'Count a round every time you halve, and stop when failures reaches 0.',
    ],
    diagnostics: [
      { resultEquals: 0, say: 'The loop never ran. Check the while condition — it should keep going WHILE failures > 0.' },
      { errorContains: 'too long', say: 'Your loop never ends. Make sure `failures` actually gets smaller inside the loop, and use // (not /) so it reaches a whole 0.' },
    ],
  },
  {
    id: 'py-loop-06',
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
      for i in range(1, 16):
          pass
    `,
    tests: [{
      expected: '1\n2\nFizz\n4\nBuzz\nFizz\n7\n8\nFizz\nBuzz\n11\nFizz\n13\n14\nFizzBuzz',
    }],
    hints: [
      'Inside the loop you need the same if/elif chain as the Fizz or Buzz problem.',
      'Check the "divides by both" case first.',
      'The final `else` just prints the number: print(i)',
    ],
    diagnostics: [
      { outputContains: 'FizzBuzz\n11', say: 'Very close — check line 15. It should be FizzBuzz, and it looks like something earlier is off.' },
      { outputTrimmedEquals: '1\n2\n3\n4\n5\n6\n7\n8\n9\n10\n11\n12\n13\n14\n15', say: 'Your loop runs, but no numbers are being replaced. Check that the if/elif conditions use % and == .' },
    ],
  },

  // =========================================================================
  // TIER 4 — FUNCTIONS
  // =========================================================================
  {
    id: 'py-func-01',
    tier: 'functions',
    title: 'Best of Three Bids',
    difficulty: 2,
    prompt: 'Write `max_of_three(a, b, c)` that returns the largest of the three values.',
    mode: 'function',
    functionName: 'max_of_three',
    starterCode: code`
      def max_of_three(a, b, c):
          pass
    `,
    tests: [
      { args: [1, 2, 3], expected: 3, label: 'max_of_three(1, 2, 3)' },
      { args: [9, 2, 3], expected: 9, label: 'max_of_three(9, 2, 3)' },
      { args: [1, 8, 3], expected: 8, label: 'max_of_three(1, 8, 3)' },
      { args: [4, 4, 4], expected: 4, label: 'max_of_three(4, 4, 4)', hidden: true },
      { args: [-5, -2, -9], expected: -2, label: 'max_of_three(-5, -2, -9)', hidden: true },
    ],
    hints: [
      'One approach: assume `a` is the biggest, then check the other two against it.',
      'You can also nest the built-in max: max(a, max(b, c))',
      'If you write it with ifs, remember to compare the CURRENT biggest, not always `a`.',
    ],
    diagnostics: [
      { resultEquals: null, say: 'Some path through your ifs does not return anything. Make sure every case ends in a return.' },
    ],
  },
  {
    id: 'py-func-02',
    tier: 'functions',
    title: 'Enterprise Discount',
    difficulty: 2,
    prompt:
      'Write `apply_discount(price, percent)` that returns the price after taking off that '
      + 'percentage.\n\nFor example a 200 price with 25 percent off returns 150.',
    mode: 'function',
    functionName: 'apply_discount',
    starterCode: code`
      def apply_discount(price, percent):
          pass
    `,
    tests: [
      { args: [200, 25], expected: 150, label: 'apply_discount(200, 25)' },
      { args: [100, 10], expected: 90, label: 'apply_discount(100, 10)' },
      { args: [50, 0], expected: 50, label: 'apply_discount(50, 0)' },
      { args: [80, 100], expected: 0, label: 'apply_discount(80, 100)', hidden: true },
    ],
    hints: [
      'First work out how much the discount is worth in money.',
      'discount = price * percent / 100',
      'Then subtract it from the price.',
    ],
    diagnostics: [
      { resultEquals: 175, say: 'You subtracted the percentage itself (25) instead of 25% of the price. Multiply by price first.' },
      { resultEquals: 50, say: 'That is the discount amount, not the final price. Subtract it from `price`.' },
    ],
  },
  {
    id: 'py-func-03',
    tier: 'functions',
    title: 'Prime Check',
    difficulty: 3,
    prompt:
      'Write `is_prime(n)` that returns `True` if `n` is a prime number.\n\n'
      + 'A prime has exactly two divisors: 1 and itself. Note that 0 and 1 are **not** prime.',
    mode: 'function',
    functionName: 'is_prime',
    starterCode: code`
      def is_prime(n):
          pass
    `,
    tests: [
      { args: [7], expected: true, label: 'is_prime(7)' },
      { args: [9], expected: false, label: 'is_prime(9)' },
      { args: [2], expected: true, label: 'is_prime(2)' },
      { args: [1], expected: false, label: 'is_prime(1)' },
      { args: [0], expected: false, label: 'is_prime(0)' },
      { args: [97], expected: true, label: 'is_prime(97)', hidden: true },
      { args: [1_000_003], expected: true, label: 'a big one', hidden: true },
    ],
    hints: [
      'Deal with the small cases first: anything below 2 is not prime.',
      'Then try dividing n by every number from 2 up to n - 1. If any divides evenly, it is not prime.',
      'You only actually need to check up to the square root of n — that is what makes the big test fast.',
    ],
    diagnostics: [
      { resultEquals: true, say: 'Check n = 1 and n = 0 — they are not prime, so handle them before the loop.' },
      { errorContains: 'too long', say: 'Checking every number up to n is too slow for the big test. Stop at int(n ** 0.5) + 1.' },
    ],
  },
  {
    id: 'py-func-04',
    tier: 'functions',
    title: 'Greatest Common Divisor',
    difficulty: 3,
    prompt:
      'Write `gcd(a, b)` returning the largest number that divides both `a` and `b` evenly.\n\n'
      + '`gcd(12, 18)` is 6.',
    mode: 'function',
    functionName: 'gcd',
    starterCode: code`
      def gcd(a, b):
          pass
    `,
    tests: [
      { args: [12, 18], expected: 6, label: 'gcd(12, 18)' },
      { args: [7, 13], expected: 1, label: 'gcd(7, 13)' },
      { args: [100, 75], expected: 25, label: 'gcd(100, 75)' },
      { args: [9, 9], expected: 9, label: 'gcd(9, 9)', hidden: true },
    ],
    hints: [
      'Simple way: count down from the smaller number and return the first value that divides both.',
      'Faster way (Euclid): while b is not 0, replace (a, b) with (b, a % b), then return a.',
      'a, b = b, a % b swaps them both in one line.',
    ],
    diagnostics: [
      { resultEquals: 1, say: 'You are returning 1 every time. Check that the loop actually tests each candidate against BOTH numbers.' },
      { resultEquals: 0, say: 'Returning 0 usually means the loop finished without finding anything — check its starting value.' },
    ],
  },
  {
    id: 'py-func-05',
    tier: 'functions',
    title: 'Compound Interest',
    difficulty: 3,
    prompt:
      'Your seed round earns compound interest. Write `balance(principal, rate, years)` that '
      + 'returns the final amount, **rounded to 2 decimal places**.\n\n'
      + 'Each year the balance grows by `rate` percent.',
    mode: 'function',
    functionName: 'balance',
    starterCode: code`
      def balance(principal, rate, years):
          pass
    `,
    tests: [
      { args: [1000, 10, 1], expected: 1100, label: 'balance(1000, 10, 1)' },
      { args: [1000, 10, 2], expected: 1210, label: 'balance(1000, 10, 2)' },
      { args: [500, 5, 3], expected: 578.81, label: 'balance(500, 5, 3)' },
      { args: [1000, 0, 5], expected: 1000, label: 'balance(1000, 0, 5)', hidden: true },
    ],
    hints: [
      'Each year multiplies the balance by (1 + rate / 100).',
      'Loop `years` times, or use the ** power operator.',
      'Round at the very end with round(value, 2).',
    ],
    diagnostics: [
      { resultEquals: 1500, say: 'That is simple interest. Compound interest grows on the NEW balance each year, not the original.' },
      { resultEquals: 578.8125, say: 'Right maths! Just round the final answer: round(value, 2)' },
    ],
  },

  // =========================================================================
  // TIER 5 — ARRAYS & LISTS
  // =========================================================================
  {
    id: 'py-arr-01',
    tier: 'arrays',
    title: 'Total Headcount',
    difficulty: 2,
    prompt:
      'Write `total(numbers)` that adds up every number in the list and returns the sum.\n\n'
      + 'An empty list totals 0.\n\n_Write the loop yourself rather than using `sum()`._',
    mode: 'function',
    functionName: 'total',
    starterCode: code`
      def total(numbers):
          pass
    `,
    tests: [
      { args: [[1, 2, 3]], expected: 6, label: 'total([1, 2, 3])' },
      { args: [[10, -2]], expected: 8, label: 'total([10, -2])' },
      { args: [[]], expected: 0, label: 'total([])' },
      { args: [[5]], expected: 5, label: 'total([5])', hidden: true },
    ],
    hints: [
      'Start a running total at 0 BEFORE the loop.',
      'for n in numbers:  walks through each value directly.',
      'Add each value: running += n',
    ],
    diagnostics: [
      { resultEquals: 3, say: 'Check the indentation — it looks like the return is inside the loop, so it stops after the first value.' },
      { resultEquals: null, say: 'Nothing was returned. Make sure `return` is the last line, lined up with the `for`, not inside it.' },
    ],
  },
  {
    id: 'py-arr-02',
    tier: 'arrays',
    title: 'Top Performer',
    difficulty: 2,
    prompt:
      'Write `largest(numbers)` that returns the biggest value in the list.\n\n'
      + 'The list always has at least one number. _Write the loop yourself rather than using `max()`._',
    mode: 'function',
    functionName: 'largest',
    starterCode: code`
      def largest(numbers):
          pass
    `,
    tests: [
      { args: [[3, 9, 2]], expected: 9, label: 'largest([3, 9, 2])' },
      { args: [[5]], expected: 5, label: 'largest([5])' },
      { args: [[-4, -1, -7]], expected: -1, label: 'largest([-4, -1, -7])' },
      { args: [[2, 2, 2]], expected: 2, label: 'largest([2, 2, 2])', hidden: true },
    ],
    hints: [
      'Start by assuming the FIRST value is the biggest: best = numbers[0]',
      'Then compare every other value against `best` and replace it when you find something bigger.',
      'Starting `best` at 0 breaks on lists of all-negative numbers — that is why we start at numbers[0].',
    ],
    diagnostics: [
      { resultEquals: 0, say: 'Your starting value of 0 beat every negative number. Start from numbers[0] instead.' },
      { errorContains: 'IndexError', say: 'You read past the end of the list. Remember the last index is len(numbers) - 1.' },
    ],
  },
  {
    id: 'py-arr-03',
    tier: 'arrays',
    title: 'Above the Bar',
    difficulty: 2,
    prompt:
      'Write `count_above(numbers, threshold)` that returns how many values are **strictly '
      + 'greater than** the threshold.',
    mode: 'function',
    functionName: 'count_above',
    starterCode: code`
      def count_above(numbers, threshold):
          pass
    `,
    tests: [
      { args: [[1, 5, 9], 4], expected: 2, label: 'count_above([1, 5, 9], 4)' },
      { args: [[1, 2, 3], 10], expected: 0, label: 'count_above([1, 2, 3], 10)' },
      { args: [[5, 5, 5], 5], expected: 0, label: 'count_above([5, 5, 5], 5)' },
      { args: [[], 0], expected: 0, label: 'count_above([], 0)', hidden: true },
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
    id: 'py-arr-04',
    tier: 'arrays',
    title: 'Reverse the Backlog',
    difficulty: 3,
    prompt:
      'Write `reverse(items)` that returns a **new** list with the items in the opposite order.\n\n'
      + 'The original list must not be changed.\n\n_Build it yourself — no `.reverse()` or `[::-1]`._',
    mode: 'function',
    functionName: 'reverse',
    starterCode: code`
      def reverse(items):
          result = []
          # Add each item to the front of result, or loop backwards
          return result
    `,
    tests: [
      { args: [[1, 2, 3]], expected: [3, 2, 1], label: 'reverse([1, 2, 3])' },
      { args: [['a', 'b']], expected: ['b', 'a'], label: "reverse(['a', 'b'])" },
      { args: [[]], expected: [], label: 'reverse([])' },
      { args: [[7]], expected: [7], label: 'reverse([7])', hidden: true },
    ],
    hints: [
      'range(len(items) - 1, -1, -1) counts backwards from the last index to 0.',
      'Or loop forwards and use result.insert(0, item) to push each one to the front.',
      'Remember the last valid index is len(items) - 1, not len(items).',
    ],
    diagnostics: [
      { resultEquals: [1, 2, 3], say: 'That is the original order. Check that your loop really walks backwards (the step should be -1).' },
      { errorContains: 'IndexError', say: 'Off by one — the last index is len(items) - 1. Starting at len(items) reads past the end.' },
    ],
  },
  {
    id: 'py-arr-05',
    tier: 'arrays',
    title: 'Runner-Up Salary',
    difficulty: 4,
    prompt:
      'Write `second_largest(numbers)` returning the second biggest **distinct** value.\n\n'
      + 'So `[5, 5, 3]` returns 3. If there is no second distinct value, return `None`.',
    mode: 'function',
    functionName: 'second_largest',
    starterCode: code`
      def second_largest(numbers):
          pass
    `,
    tests: [
      { args: [[1, 9, 5]], expected: 5, label: 'second_largest([1, 9, 5])' },
      { args: [[5, 5, 3]], expected: 3, label: 'second_largest([5, 5, 3])' },
      { args: [[4, 4, 4]], expected: null, label: 'second_largest([4, 4, 4])' },
      { args: [[2]], expected: null, label: 'second_largest([2])' },
      { args: [[-1, -2]], expected: -2, label: 'second_largest([-1, -2])', hidden: true },
    ],
    hints: [
      'Distinct matters: [5, 5, 3] has only two distinct values, 5 and 3.',
      'One clean way: build a list of the unique values, sort it, and take the second from the end.',
      'If there are fewer than 2 distinct values, return None.',
    ],
    diagnostics: [
      { resultEquals: 5, say: 'For [5, 5, 3] you returned 5 twice. Remove duplicates before picking the second biggest.' },
      { errorContains: 'IndexError', say: 'Check the case where the list has fewer than 2 distinct values — that should return None.' },
    ],
  },

  // =========================================================================
  // TIER 6 — STRINGS
  // =========================================================================
  {
    id: 'py-str-01',
    tier: 'strings',
    title: 'Ship It Loudly',
    difficulty: 1,
    prompt:
      'Write `shout(text)` that returns the text in CAPITALS with an exclamation mark added.\n\n'
      + '`shout("ship it")` returns `"SHIP IT!"`',
    mode: 'function',
    functionName: 'shout',
    starterCode: code`
      def shout(text):
          pass
    `,
    tests: [
      { args: ['ship it'], expected: 'SHIP IT!', label: "shout('ship it')" },
      { args: ['Hello'], expected: 'HELLO!', label: "shout('Hello')" },
      { args: [''], expected: '!', label: "shout('')", hidden: true },
    ],
    hints: [
      'Strings have a built-in method for capitals: text.upper()',
      'Glue the exclamation mark on with + .',
      'return text.upper() + "!"',
    ],
    diagnostics: [
      { resultEquals: 'SHIP IT', say: 'The exclamation mark is missing — add + "!" to the end.' },
      { resultEquals: 'ship it!', say: 'Remember .upper() returns a NEW string; it does not change the original in place.' },
    ],
  },
  {
    id: 'py-str-02',
    tier: 'strings',
    title: 'Count the Vowels',
    difficulty: 2,
    prompt:
      'Write `count_vowels(text)` returning how many vowels (a, e, i, o, u) it contains.\n\n'
      + 'Count capitals too: `count_vowels("Apple")` is 2.',
    mode: 'function',
    functionName: 'count_vowels',
    starterCode: code`
      def count_vowels(text):
          pass
    `,
    tests: [
      { args: ['Apple'], expected: 2, label: "count_vowels('Apple')" },
      { args: ['xyz'], expected: 0, label: "count_vowels('xyz')" },
      { args: ['AEIOU'], expected: 5, label: "count_vowels('AEIOU')" },
      { args: ['Hello, Tycoon!'], expected: 4, label: "count_vowels('Hello, Tycoon!')", hidden: true },
    ],
    hints: [
      'You can loop over a string directly: for letter in text:',
      'Make the comparison case-insensitive by lowering each letter first.',
      'if letter.lower() in "aeiou":  then add 1 to your counter.',
    ],
    diagnostics: [
      { resultEquals: 1, say: 'Capitals are being missed. Convert each letter with .lower() before checking it.' },
      { resultEquals: 0, say: 'Nothing matched. Check you are comparing single letters, not the whole string.' },
    ],
  },
  {
    id: 'py-str-03',
    tier: 'strings',
    title: 'Palindrome Check',
    difficulty: 3,
    prompt:
      'Write `is_palindrome(text)` returning `True` if the text reads the same backwards.\n\n'
      + 'Ignore capitals and spaces: `"Race car"` is a palindrome.',
    mode: 'function',
    functionName: 'is_palindrome',
    starterCode: code`
      def is_palindrome(text):
          pass
    `,
    tests: [
      { args: ['racecar'], expected: true, label: "is_palindrome('racecar')" },
      { args: ['Race car'], expected: true, label: "is_palindrome('Race car')" },
      { args: ['hello'], expected: false, label: "is_palindrome('hello')" },
      { args: [''], expected: true, label: "is_palindrome('')", hidden: true },
      { args: ['Never odd or even'], expected: true, label: 'a long one', hidden: true },
    ],
    hints: [
      'First clean the text: lowercase it and remove the spaces.',
      'text.replace(" ", "") removes every space.',
      'Then compare the cleaned string with its reverse, cleaned[::-1].',
    ],
    diagnostics: [
      { resultEquals: false, say: 'Check the cleaning step — "Race car" only works once capitals and spaces are removed.' },
    ],
  },
  {
    id: 'py-str-04',
    tier: 'strings',
    title: 'Badge Initials',
    difficulty: 3,
    prompt:
      'Write `initials(full_name)` that turns a name into dotted initials.\n\n'
      + '`initials("Ada Lovelace")` returns `"A.L."`\n\n'
      + 'Names can have two or three parts.',
    mode: 'function',
    functionName: 'initials',
    starterCode: code`
      def initials(full_name):
          pass
    `,
    tests: [
      { args: ['Ada Lovelace'], expected: 'A.L.', label: "initials('Ada Lovelace')" },
      { args: ['grace brewster hopper'], expected: 'G.B.H.', label: 'lowercase, three parts' },
      { args: ['Linus'], expected: 'L.', label: "initials('Linus')", hidden: true },
    ],
    hints: [
      'full_name.split() breaks the name into a list of words.',
      'For each word you want its first letter: word[0]',
      'Uppercase it and add a dot, building up the result as you go.',
    ],
    diagnostics: [
      { resultEquals: 'A.L', say: 'Every initial gets a dot after it, including the last one.' },
      { resultEquals: 'AL', say: 'The dots are missing. Add "." after each letter.' },
      { resultEquals: 'a.l.', say: 'Uppercase each letter with .upper() before adding it.' },
    ],
  },
  {
    id: 'py-str-05',
    tier: 'strings',
    title: 'Longest Word',
    difficulty: 3,
    prompt:
      'Write `longest_word(sentence)` returning the longest word in the sentence.\n\n'
      + 'If two words tie, return the one that appears first.',
    mode: 'function',
    functionName: 'longest_word',
    starterCode: code`
      def longest_word(sentence):
          pass
    `,
    tests: [
      { args: ['we ship good code'], expected: 'ship', label: 'four words' },
      { args: ['deploy on friday'], expected: 'deploy', label: 'first is longest' },
      { args: ['a bb ccc'], expected: 'ccc', label: 'last is longest' },
      { args: ['tie test size'], expected: 'test', label: 'ties pick the first', hidden: true },
    ],
    hints: [
      'Split the sentence into words first.',
      'Track the best word so far, starting with the first one.',
      'Only replace it when you find something STRICTLY longer — that keeps ties on the earlier word.',
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
    id: 'py-oop-01',
    tier: 'oop',
    title: 'Your First Employee',
    difficulty: 2,
    prompt:
      'Build an `Employee` class.\n\n'
      + 'It needs a constructor taking `name` and `salary`, and a method `describe()` '
      + 'that returns text like:\n\n`Ada earns 90000`\n\n'
      + '_The code at the bottom runs your class. Leave it alone._',
    mode: 'stdout',
    starterCode: code`
      class Employee:
          def __init__(self, name, salary):
              # Store name and salary on self
              pass

          def describe(self):
              # Return "NAME earns SALARY"
              pass


      # --- do not change below this line ---
      e = Employee("Ada", 90000)
      print(e.describe())
      print(Employee("Linus", 50000).describe())
    `,
    tests: [{ expected: 'Ada earns 90000\nLinus earns 50000' }],
    hints: [
      'Inside __init__, save the values with self.name = name',
      'describe() can read them back with self.name and self.salary',
      'Use an f-string: return f"{self.name} earns {self.salary}"',
    ],
    diagnostics: [
      { outputContains: 'None', say: 'describe() printed None, which means it has no `return`. Add one.' },
      { errorContains: 'AttributeError', say: 'The object does not have that attribute. Check you stored it with self.name = name inside __init__.' },
      { errorContains: 'takes 2 positional', say: 'Every method needs `self` as its first parameter, including __init__.' },
    ],
  },
  {
    id: 'py-oop-02',
    tier: 'oop',
    title: 'Company Bank Account',
    difficulty: 3,
    prompt:
      'Build a `BankAccount` class that starts at a given balance and supports:\n\n'
      + '- `deposit(amount)` — adds money\n'
      + '- `withdraw(amount)` — takes money out, but **refuses** if there is not enough, '
      + 'leaving the balance unchanged\n'
      + '- `get_balance()` — returns the current balance\n\n'
      + '_The code at the bottom runs your class. Leave it alone._',
    mode: 'stdout',
    starterCode: code`
      class BankAccount:
          def __init__(self, starting):
              pass

          def deposit(self, amount):
              pass

          def withdraw(self, amount):
              pass

          def get_balance(self):
              pass


      # --- do not change below this line ---
      acct = BankAccount(100)
      acct.deposit(50)
      print(acct.get_balance())
      acct.withdraw(30)
      print(acct.get_balance())
      acct.withdraw(9999)
      print(acct.get_balance())
    `,
    tests: [{ expected: '150\n120\n120' }],
    hints: [
      'Store the money in self.balance inside __init__.',
      'deposit adds to self.balance; withdraw subtracts from it.',
      'Guard the withdrawal with an if: only subtract when amount <= self.balance.',
    ],
    diagnostics: [
      { outputContains: '-9879', say: 'The overdraft went through. Add a check so withdraw does nothing when the amount is more than the balance.' },
      { outputContains: 'None', say: 'get_balance() returned None — it needs to `return self.balance`.' },
    ],
  },
  {
    id: 'py-oop-03',
    tier: 'oop',
    title: 'Meeting Room Dimensions',
    difficulty: 3,
    prompt:
      'Build a `Room` class with a constructor taking `width` and `height`, plus:\n\n'
      + '- `area()` — width × height\n'
      + '- `perimeter()` — twice the width plus twice the height\n'
      + '- `is_square()` — `True` when width and height match\n\n'
      + '_The code at the bottom runs your class. Leave it alone._',
    mode: 'stdout',
    starterCode: code`
      class Room:
          def __init__(self, width, height):
              pass

          def area(self):
              pass

          def perimeter(self):
              pass

          def is_square(self):
              pass


      # --- do not change below this line ---
      r = Room(4, 6)
      print(r.area())
      print(r.perimeter())
      print(r.is_square())
      print(Room(5, 5).is_square())
    `,
    tests: [{ expected: '24\n20\nFalse\nTrue' }],
    hints: [
      'All three methods read self.width and self.height.',
      'Perimeter is 2 * width + 2 * height.',
      'is_square can return the comparison directly: return self.width == self.height',
    ],
    diagnostics: [
      { outputContains: '10', say: 'Check the perimeter formula — it is 2 × width + 2 × height, not width + height.' },
    ],
  },
  {
    id: 'py-oop-04',
    tier: 'oop',
    title: 'Promote to Manager',
    difficulty: 4,
    prompt:
      'Start from the `Employee` class below, then write a `Manager` class that **inherits** '
      + 'from it.\n\n'
      + 'A Manager also has a `team_size`, and its `describe()` should return text like:\n\n'
      + '`Grace manages 4 people`\n\n'
      + '_The code at the bottom runs your classes. Leave it alone._',
    mode: 'stdout',
    starterCode: code`
      class Employee:
          def __init__(self, name):
              self.name = name

          def describe(self):
              return self.name + " writes code"


      class Manager(Employee):
          def __init__(self, name, team_size):
              # Call the Employee constructor, then save team_size
              pass

          def describe(self):
              pass


      # --- do not change below this line ---
      print(Employee("Ada").describe())
      print(Manager("Grace", 4).describe())
    `,
    tests: [{ expected: 'Ada writes code\nGrace manages 4 people' }],
    hints: [
      'super().__init__(name) runs the parent constructor so self.name gets set.',
      'Then store the extra value: self.team_size = team_size',
      'Writing describe() in Manager REPLACES the one it inherited.',
    ],
    diagnostics: [
      { outputContains: 'writes code\nGrace writes code', say: 'Manager is still using the inherited describe(). Define its own describe() method inside the Manager class.' },
      { errorContains: 'AttributeError', say: 'self.name is missing — call super().__init__(name) at the start of the Manager constructor.' },
    ],
  },

  // =========================================================================
  // TIER 8 — RECURSION
  // =========================================================================
  {
    id: 'py-rec-01',
    tier: 'recursion',
    title: 'Factorial, Recursively',
    difficulty: 3,
    prompt:
      'Write `factorial(n)` **using recursion** — the function must call itself.\n\n'
      + 'Loops are not allowed for this one.\n\n'
      + 'Remember: `factorial(0)` is 1, and `factorial(n)` is `n × factorial(n - 1)`.',
    mode: 'function',
    functionName: 'factorial',
    starterCode: code`
      def factorial(n):
          # Base case: when is the answer just 1?
          # Recursive case: n times the factorial of one less
          pass
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
      'A recursive function needs a BASE CASE that returns without calling itself.',
      'Here the base case is n == 0 (or n <= 1), which returns 1.',
      'Otherwise: return n * factorial(n - 1)',
    ],
    diagnostics: [
      { errorContains: 'too deep', say: 'It never stops calling itself. Add a base case that returns 1 when n reaches 0.' },
      { errorContains: 'recursion', say: 'It never stops calling itself. Add a base case that returns 1 when n reaches 0.' },
      { resultEquals: 0, say: 'Check the base case — if it returns 0, everything multiplies down to 0. It should return 1.' },
    ],
  },
  {
    id: 'py-rec-02',
    tier: 'recursion',
    title: 'Fibonacci Growth',
    difficulty: 4,
    prompt:
      'Write `fib(n)` recursively.\n\n'
      + 'The sequence starts `fib(0) = 0`, `fib(1) = 1`, and after that each value is the sum '
      + 'of the two before it.',
    mode: 'function',
    functionName: 'fib',
    starterCode: code`
      def fib(n):
          pass
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
      'return fib(n - 1) + fib(n - 2)',
    ],
    diagnostics: [
      { resultEquals: 21, say: 'You are one step ahead — check that fib(0) returns 0 and fib(1) returns 1.' },
      { errorContains: 'too deep', say: 'Missing a base case. You need to stop at both n == 0 and n == 1.' },
    ],
  },
  {
    id: 'py-rec-03',
    tier: 'recursion',
    title: 'Digit Sum',
    difficulty: 4,
    prompt:
      'Write `digit_sum(n)` that recursively adds up the digits of a positive number.\n\n'
      + '`digit_sum(1234)` is 1+2+3+4 = 10.',
    mode: 'function',
    functionName: 'digit_sum',
    starterCode: code`
      def digit_sum(n):
          pass
    `,
    tests: [
      { args: [1234], expected: 10, label: 'digit_sum(1234)' },
      { args: [5], expected: 5, label: 'digit_sum(5)' },
      { args: [0], expected: 0, label: 'digit_sum(0)' },
      { args: [99999], expected: 45, label: 'digit_sum(99999)', hidden: true },
    ],
    sourceChecks: [
      { forbid: '\\b(for|while)\\b', message: 'This one has to be recursive — no `for` or `while` loops allowed.' },
    ],
    hints: [
      'n % 10 gives you the LAST digit.',
      'n // 10 chops that last digit off.',
      'Base case: when n is 0 there is nothing left to add.',
    ],
    diagnostics: [
      { errorContains: 'too deep', say: 'Use // (whole-number division) to shrink n. Plain / gives decimals, so it never reaches 0.' },
      { resultEquals: 4, say: 'Only the last digit is being counted. Add it to digit_sum(n // 10) to keep going.' },
    ],
  },
  {
    id: 'py-rec-04',
    tier: 'recursion',
    title: 'Power Without Pow',
    difficulty: 5,
    prompt:
      'Write `power(base, exponent)` recursively, for exponents of 0 or more.\n\n'
      + 'Anything to the power of 0 is 1.\n\n_No `**`, no `pow()`, no loops._',
    mode: 'function',
    functionName: 'power',
    starterCode: code`
      def power(base, exponent):
          pass
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
      { forbid: '\\*\\*|pow\\s*\\(', message: 'Solve it with recursion rather than ** or pow().' },
    ],
    hints: [
      'Base case: an exponent of 0 always gives 1.',
      'Each step multiplies by `base` and reduces the exponent by 1.',
      'return base * power(base, exponent - 1)',
    ],
    diagnostics: [
      { resultEquals: 0, say: 'The base case is returning 0. Anything to the power of 0 is 1, so it should return 1.' },
      { resultEquals: 6, say: 'That looks like base × exponent. Each recursive step should MULTIPLY by base, not add.' },
    ],
  },
];

export default PROBLEMS;
