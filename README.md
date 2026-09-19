# Hello, Tycoon!

Solve coding problems. Earn **Bytes**. Build the startup office of your dreams,
one floor at a time.

A browser game for learning **Java** or **Python**. Everything runs on your own
computer — there is no account to make, nothing to sign up for, and no internet
needed once it's open (except the very first time you use Python).

---

## How to play it — the easy way

1. Download or copy this whole folder onto your computer.
2. Open the folder called **`dist`**.
3. Double-click **`index.html`**.

That's it. The game opens in your web browser.

> **Tip:** if double-clicking opens the file in a text editor instead of your
> browser, right-click it and choose *Open with → Chrome* (or Firefox, or Edge).

### If the game says your progress won't be saved

You're probably in a private/incognito window, or your browser is blocking
saved data for local files. Open the same file in a normal window and the
warning goes away. Your progress is saved in your browser on **this computer
only** — it doesn't follow you to a different machine.

---

## How to play it — the developer way

Use this if you want to change the game or add your own problems. You need
[Node.js](https://nodejs.org) installed (any recent version).

```bash
npm install
npm start
```

Your browser opens automatically at `http://localhost:5173`. Edit any file and
the page updates instantly.

To rebuild the double-click version in `dist/` after you make changes:

```bash
npm run build
```

To check that every problem still works after you edit them:

```bash
npm test
```

---

## What you actually do in the game

1. **Pick a language** — Java or Python. This is the language every problem
   uses. You can unlock the other one later with Bytes.
2. **Read a problem**, write your code in the editor, press **Run Tests**
   (or `Ctrl+Enter`).
3. **Pass the tests** and you earn Bytes and XP. Get it wrong and you lose
   nothing except your streak — you can try as many times as you like.
4. **Spend Bytes** on better office furniture, and on whole new floors:
   a server room, a gym, a break room, a rooftop lounge, and eventually the
   executive suite.
5. Your office earns Bytes on its own while you work on the next problem.

Some things are locked behind **both** Bytes *and* problems solved, so you
can't skip the coding by leaving the game running.

### Handy things to know

| | |
|---|---|
| `Ctrl+Enter` | run the tests |
| `Tab` / `Shift+Tab` | indent / outdent (it won't jump out of the editor) |
| **Hint** button | gives you one nudge at a time — never the answer |
| **Reset code** | puts the starter code back if you get tangled up |
| ♪ button | turn the sounds off |

---

## Frequently confusing things

**"Python is downloading…"**
The first time you choose Python, the game downloads real Python (about 10 MB)
so it can run your code properly. It only happens once — after that it works
offline. Java needs no download at all.

**"My code works but the test says no."**
Check the *expected* and *your output* boxes side by side. Usually it's a
capital letter, a missing space, or a missing full stop. The tests are picky on
purpose — real code is too.

**"A test is hidden."**
Some tests check awkward cases (an empty list, the number zero, a negative
number). You can see whether they pass, but not what's in them, so you have to
think about the edge cases yourself.

---

## For teachers

Everything students see — problems, rooms, floors, upgrades, prices — is plain
data you can edit without touching the game's logic.

**See [TEACHER_GUIDE.md](TEACHER_GUIDE.md)** for how to add problems, change the
economy, and drop in your own pixel art.

Quick map:

| File | What it controls |
|---|---|
| `src/data/problems/python.js` | the Python problem bank |
| `src/data/problems/java.js` | the Java problem bank |
| `src/data/tiers.js` | topics and when they unlock |
| `src/data/floors.js` | the floors and what they cost |
| `src/data/rooms.js` | room types |
| `src/data/items.js` | furniture upgrade lines and their bonuses |
| `src/data/config.js` | prices, XP curve, prestige, sound |
| `src/data/assets.js` | where pixel art goes when you have some |

Run `npm test` after editing problems — it checks that every problem is
well-formed, that a correct solution really does pass, and that the starter
code doesn't accidentally pass on its own.
