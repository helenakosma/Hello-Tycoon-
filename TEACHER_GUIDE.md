# Teacher's Guide

Everything here assumes you can open a text editor and save a file. You do not
need to understand React to change any of the content.

**Golden rule: after editing anything in `src/data/`, run `npm test`.** It
catches typos in expected answers, duplicate ids, unreachable unlock
requirements, and problems whose starter code accidentally already passes.

---

## 1. Where everything lives

```
src/data/
  problems/python.js   the Python problem bank
  problems/java.js     the Java problem bank
  tiers.js             topics (Loops, Strings, …) and when they unlock
  floors.js            the tower's floors, costs and requirements
  rooms.js             room types and their placeholder colours
  items.js             furniture upgrade lines and their gameplay bonuses
  config.js            economy, XP curve, prestige, feature switches
  assets.js            how sprite keys map to image files
```

These are `.js` files rather than `.json` so they can hold comments and tolerate
trailing commas — JSON's strictness makes hand-editing miserable. They are still
just lists of objects, and you edit them the same way.

---

## 2. Adding a problem

Copy an existing block in `src/data/problems/python.js` (or `java.js`) and
change the fields. The only hard requirement is that `id` is unique.

```js
{
  id: 'py-loops-07',            // unique; the save file records this as "solved"
  tier: 'loops',                // must match an id in tiers.js
  title: 'Count the Servers',
  difficulty: 2,                // 1-5. Bytes = tier.rewardBase × difficulty × bonuses
  prompt: 'Write `count(n)` that ...',
  mode: 'function',             // or 'stdout'
  functionName: 'count',        // required when mode is 'function'
  starterCode: code`
    def count(n):
        pass
  `,
  tests: [
    { args: [3], expected: 6, label: 'count(3)' },
    { args: [0], expected: 0, hidden: true },
  ],
  hints: ['Start a total at 0.', 'Add to it inside the loop.'],
  diagnostics: [
    { resultEquals: 3, say: 'That is n itself — you need the running total.' },
  ],
}
```

### The two modes

**`mode: 'function'`** — the game calls one function with arguments and checks
what it **returns**. Use this for most problems: it is precise, and it lets you
test edge cases cheaply.

**`mode: 'stdout'`** — the game runs the whole program and checks what it
**printed**. Use this for print-and-loop exercises, and for class exercises
where you supply a driver in the starter code (see the OOP problems for the
pattern — put "do not change below this line" above the driver).

Output comparison forgives Windows line endings, trailing spaces at the end of a
line, and blank lines at the very end. It does **not** forgive capitalisation or
missing punctuation.

### The `code` helper

`starterCode` uses a tagged template called `` code`...` `` at the top of each
problem file. It strips this file's own indentation out of the snippet, so you
can indent the block naturally without that indentation leaking into the
student's editor. Always use it.

### Hidden tests

`hidden: true` means the student sees whether it passed but never sees its
values. Use it for the edge case you want them to *think* about — an empty list,
zero, a negative number, a tie — rather than pattern-match to.

---

## 3. Diagnostics — where the actual teaching happens

A `diagnostic` fires when a student's **wrong** answer matches a pattern you
predicted. Instead of "expected 15, got 10" they get the reason.

```js
diagnostics: [
  { resultEquals: 10,
    say: 'You are one short: range(1, n) stops BEFORE n. Use range(1, n + 1).' },
  { outputTrimmedEquals: 'Hello, World!',
    say: 'Close! But this company is called Tycoon, not World.' },
  { outputContains: 'None',
    say: 'Printing None usually means a function has no return statement.' },
  { errorContains: 'IndentationError',
    say: 'Everything inside a loop must be indented by the same amount.' },
]
```

The four matchers:

| Matcher | Fires when |
|---|---|
| `resultEquals` | the function returned exactly this value |
| `outputTrimmedEquals` | the program printed exactly this |
| `outputContains` | the printed output contains this text |
| `errorContains` | the error message contains this text (case-insensitive) |

They are checked **in order and the first match wins**, so put the most specific
first. They are matched against the *first failing test*.

**This is the highest-value thing you can add.** Every time you watch a student
make the same mistake twice, add a diagnostic for it. Three or four per problem
is plenty.

### Source rules

To require (or forbid) a technique, use `sourceChecks`:

```js
sourceChecks: [
  { forbid: '\\b(for|while)\\b',
    message: 'This one has to be recursive — no for or while loops.' },
]
```

Comments and string literals are stripped before the check, so a student
mentioning "for" in a comment won't trip it.

---

## 4. Tuning the economy

All in `src/data/config.js`.

| Want to… | Change |
|---|---|
| make the whole game more generous | `ECONOMY.globalRewardMultiplier` |
| make streaks matter more or less | `ECONOMY.streakStepBonus` |
| level up faster | lower `PROGRESSION.xpCurve` or raise `xpPerDifficulty` |
| let students prestige sooner | `PRESTIGE.requiredLevel` / `requiredProblemsSolved` |
| turn sound off by default | `FEATURES.soundEnabled` |
| remove the language-switch upgrade | set `FEATURES.languageSwitchCost` to `null` |

**Rewards** are `tier.rewardBase × problem.difficulty` (from `tiers.js`) times
every multiplier the player has earned. So to make a whole topic worth more,
raise that tier's `rewardBase`.

**Unlocks** deliberately use two gates at once:

- a **tier** opens at *N problems solved* **and** *player level L*
- a **floor** is built with *C Bytes* **and** *N problems solved*

Levels come only from solving problems, so a student who hoards Bytes still
faces harder content, and a student who idles still can't build upward. If you
want a pure sandbox, set the `requiresProblems` values to 0.

**Prestige** ("Series B Funding") resets Bytes and the tower but deliberately
**keeps** solved problems, XP and level. A student never has to re-solve work
they already did.

---

## 5. Adding rooms, floors and upgrades

**A new floor:** append to `src/data/floors.js`. Keep `level` sequential — a
floor can only be built once the one below exists. You can reuse a `roomType`
(the tower already has two bullpens and two server rooms).

**A new room type:** add it to `rooms.js` with an `id`, then give it upgrade
lines in `items.js` under that same id, then add a floor that uses it.

**A new upgrade line:** add it to the room's list in `items.js`. Tier 1 must
cost `0` — it comes free with the room so a new floor looks furnished — and each
tier after that must cost more than the one before. `npm test` enforces both.

The five bonus types:

| Type | Effect | Thematic home |
|---|---|---|
| `bytesPerSec` | flat passive income | server room, executive desk |
| `passiveMult` | % boost to all passive income | gym, cooling, lounge seating |
| `rewardMult` | % more Bytes per solved problem | chairs, monitors, snacks |
| `xpMult` | % more XP | desks, meeting tables, recovery |
| `streakBonus` | % stronger streaks | coffee, game corner |

Bonuses within a line **do not stack** — buying tier 3 replaces tier 2's bonus.
The UI says so on every upgrade.

> **A note on one deliberate change from the original design sketch:** the brief
> suggested break-room upgrades should shorten a "problem cooldown". I made them
> boost the **streak multiplier** instead, because a forced wait between problems
> would have worked directly against the point of the game — nobody should ever
> be blocked from practising. Streaks reward momentum without punishing a student
> who needs to stop and think. If you do want a cooldown, the bonus plumbing is
> in `selectors.js` and adding a sixth type is about ten lines.

---

## 6. Dropping in real pixel art

The game currently draws every room and item as a coloured box. Nothing in the
game logic knows that — each room and item carries a `sprite` key, and
`src/data/assets.js` is the only file that turns a key into an image path.

**To switch to real art:**

1. Save your PNGs into `public/assets/rooms/` and `public/assets/items/`.
2. Change `ASSET_MODE` in `src/data/assets.js` from `'placeholder'` to `'auto'`.
3. Refresh.

In `'auto'` mode each sprite is looked up once: if the file exists you get the
art, and if it doesn't you keep the coloured box. **So you can convert one room
at a time** — there is no all-or-nothing switch.

**To see the exact filenames the game is looking for**, open the game and click
the **`art`** button in the top bar. It lists every file and what it is, built
from your current rooms and items — so if you add content, the list updates
itself.

The naming rule is mechanical:

| Sprite key | File |
|---|---|
| `room.bullpen` | `public/assets/rooms/bullpen.png` |
| `item.chair.t2` | `public/assets/items/chair_t2.png` |

Suggested sizes are in `SPRITE_SIZES` in `assets.js` (rooms ≈ 320×96, items ≈
32×32, transparent background). Images are scaled with
`image-rendering: pixelated`, so small crisp sprites stay sharp.

---

## 7. How the code runs students' code

**Python** uses [Pyodide](https://pyodide.org) — real CPython compiled to
WebAssembly. Students get genuine Python semantics and genuine error messages.
It downloads once (~10 MB from a CDN) and is then cached by the browser. A trace
hook stops runaway loops after 5 seconds instead of freezing the tab.

**Java** uses an interpreter written for this project, in
`src/engine/java/` (lexer → parser → interpreter). This was a deliberate choice:
running real Java in a browser needs either a huge JVM-in-WASM download or a
server, and a server was off the table.

It covers what a first-year course uses: primitives, `String`, arrays,
`ArrayList`, `HashMap`, `HashSet`, `StringBuilder`, classes with constructors
and inheritance, and the common `Math` / `Integer` / `Character` / `Arrays` /
`Collections` helpers. It does **not** support lambdas, streams, `try`/`catch`,
threads, file I/O, or inner classes.

Crucially it reproduces the things students get wrong, rather than papering over
them:

- `5 / 2` is `2`, not `2.5`
- `System.out.println(1.0)` prints `1.0`, not `1`
- `int x = 2.5;` is refused, the way `javac` refuses it
- `int` arithmetic overflows at 32 bits
- comparing Strings with `==` works but raises a visible teaching warning

If a problem you write needs a library method the interpreter doesn't have, add
it to the tables in `src/engine/java/runtime.js` — each one is a small function
from `(receiver, args)` to a value. `npm test` will tell you if you break
something.

---

## 8. Classroom notes

- **Saves are per-browser, per-computer.** There is no login and nothing is sent
  anywhere. A student on a shared machine should use their own browser profile,
  or they'll share a save. The `reset` button wipes it.
- **Java works with no internet at all.** If your wifi is unreliable, start the
  class on Java.
- **Both banks mirror each other**, problem for problem, so a mixed-language
  class stays in step and you can put the same question on the board twice.
- Difficulty ratings and the XP curve are tuned so the 40 problems in a bank
  carry a student to roughly level 8 and floor 10. If your class blazes through,
  the Series B reset gives them a permanent multiplier and something to chase.
