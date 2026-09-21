/**
 * Python execution for Hello, Tycoon!, powered by Pyodide.
 *
 * Pyodide is CPython compiled to WebAssembly, so students run REAL Python in
 * the browser — no server, no install, no API key. It is fetched from a CDN
 * the first time a student picks Python (about 10 MB), then cached by the
 * browser, so only the very first load needs an internet connection.
 *
 * SAFETY
 * Python in the browser runs on the main thread, so a student's `while True:`
 * would normally freeze the tab with no way out. We install a lightweight
 * trace hook that counts executed lines and raises a TimeoutError after a few
 * seconds, which surfaces as a friendly "your loop never ends" message.
 *
 * TEACHERS: you shouldn't need to change anything here. If you want to allow
 * longer-running programs, raise TIME_LIMIT_SECONDS below.
 */

/** Pinned so a CDN update can never silently change behaviour mid-term. */
const PYODIDE_VERSION = '0.26.4';
const PYODIDE_CDN = `https://cdn.jsdelivr.net/pyodide/v${PYODIDE_VERSION}/full/`;

/** How long a single student program may run before we stop it. */
const TIME_LIMIT_SECONDS = 5;

/**
 * The Python side of the harness. Loaded once, then called for each test.
 *
 * It runs the student's code in a FRESH namespace every time, so one test
 * cannot leak variables into the next.
 */
const HARNESS_SOURCE = `
import json, sys, io, time, traceback

_TIME_LIMIT = ${TIME_LIMIT_SECONDS}

class _Timeout(Exception):
    pass

def _make_watchdog(deadline):
    """Trace hook that aborts runaway loops.

    Checking the clock on every line would be slow, so we only look every
    few thousand lines. That keeps normal programs fast while still catching
    an infinite loop within a fraction of a second of the limit.
    """
    state = {'n': 0}

    def trace(frame, event, arg):
        state['n'] += 1
        if state['n'] % 4000 == 0 and time.time() > deadline:
            raise _Timeout()
        return trace

    return trace


def _friendly_error(exc, tb):
    """Turn a Python exception into something a beginner can act on."""
    name = type(exc).__name__

    if isinstance(exc, _Timeout):
        return ('Your program ran for too long, so I stopped it. '
                'That usually means a loop never reaches its stopping condition.', None)

    if isinstance(exc, SyntaxError):
        line = exc.lineno
        detail = str(exc)
        if 'invalid syntax' in detail or 'expected' in detail:
            return ('Python could not read this line. Check for a missing colon (:) at the '
                    'end of an if/for/while/def line, or a bracket or quote you never closed.', line)
        return (name + ': ' + detail, line)

    if isinstance(exc, IndentationError):
        return ('Your indentation does not line up. Everything inside an if, loop or '
                'function must be indented by the same amount.', exc.lineno)

    if isinstance(exc, RecursionError):
        return ('Your function called itself too many times without stopping. '
                'Check that the base case actually returns.', None)

    # Find the line number inside the student's own file, ignoring harness frames.
    line = None
    for frame in traceback.extract_tb(tb):
        if frame.filename == 'your_code.py':
            line = frame.lineno

    if isinstance(exc, NameError):
        return (str(exc) + '. Check the spelling, and make sure you created it before using it.', line)
    if isinstance(exc, TypeError) and 'NoneType' in str(exc):
        return (str(exc) + '. A function that has no "return" gives back None.', line)
    if isinstance(exc, ZeroDivisionError):
        return ('You divided by zero. Check the value on the right of the / before dividing.', line)
    if isinstance(exc, IndexError):
        return (str(exc) + '. Remember the last index is len(...) - 1.', line)

    return (name + ': ' + str(exc), line)


def _run(source, mode, func_name, args_json, stdin_text):
    namespace = {'__name__': '__main__'}
    captured = io.StringIO()
    real_stdout, real_stdin = sys.stdout, sys.stdin
    sys.stdout = captured
    sys.stdin = io.StringIO(stdin_text or '')

    outcome = {'ok': True, 'output': '', 'result': None, 'error': None, 'errorLine': None}
    deadline = time.time() + _TIME_LIMIT
    old_limit = sys.getrecursionlimit()
    sys.setrecursionlimit(2000)

    try:
        compiled = compile(source, 'your_code.py', 'exec')
        sys.settrace(_make_watchdog(deadline))
        try:
            exec(compiled, namespace)
            if mode == 'function':
                if func_name not in namespace:
                    raise NameError(
                        "I could not find a function called '" + func_name + "'")
                fn = namespace[func_name]
                if not callable(fn):
                    raise TypeError("'" + func_name + "' exists but is not a function")
                outcome['result'] = fn(*json.loads(args_json))
        finally:
            sys.settrace(None)
    except BaseException as exc:
        message, line = _friendly_error(exc, exc.__traceback__)
        outcome['ok'] = False
        outcome['error'] = message
        outcome['errorLine'] = line
    finally:
        sys.settrace(None)
        sys.setrecursionlimit(old_limit)
        sys.stdout = real_stdout
        sys.stdin = real_stdin

    outcome['output'] = captured.getvalue()

    def _plain(value):
        """Make results JSON-safe: tuples and sets become lists."""
        if isinstance(value, tuple) or isinstance(value, set):
            return [_plain(v) for v in value]
        if isinstance(value, list):
            return [_plain(v) for v in value]
        if isinstance(value, dict):
            return {str(k): _plain(v) for k, v in value.items()}
        if isinstance(value, (int, float, str, bool)) or value is None:
            return value
        return repr(value)

    outcome['result'] = _plain(outcome['result'])
    return json.dumps(outcome)
`;

let pyodidePromise = null;

/** Injects the Pyodide loader script, which is not bundled with the app. */
function injectPyodideScript() {
  return new Promise((resolve, reject) => {
    if (window.loadPyodide) { resolve(); return; }
    const script = document.createElement('script');
    script.src = PYODIDE_CDN + 'pyodide.js';
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('network'));
    document.head.appendChild(script);
  });
}

/**
 * Load Python. Safe to call many times — the work happens once.
 * @param {(stage:string)=>void} [onProgress] called with human-readable stages
 * @returns {Promise<object>} the Pyodide instance
 */
export function loadPython(onProgress = () => {}) {
  if (pyodidePromise) return pyodidePromise;

  pyodidePromise = (async () => {
    try {
      onProgress('Downloading Python…');
      await injectPyodideScript();
      onProgress('Starting Python…');
      const pyodide = await window.loadPyodide({ indexURL: PYODIDE_CDN });
      onProgress('Getting things ready…');
      pyodide.runPython(HARNESS_SOURCE);
      onProgress('ready');
      return pyodide;
    } catch (err) {
      pyodidePromise = null; // allow a retry after a network blip
      throw new Error(
        'Python could not be downloaded. The first time you use Python you need an '
        + 'internet connection — after that it works offline. Check your connection and try again.',
      );
    }
  })();

  return pyodidePromise;
}

/** True once Python is loaded and ready to run code. */
export function isPythonReady() {
  return !!(pyodidePromise && window.loadPyodide);
}

/**
 * Run a student's Python program and capture what it printed.
 * @returns {Promise<{ok, output, error, errorLine}>}
 */
export async function runPythonProgram(source, { stdin = '' } = {}) {
  return callHarness(source, 'stdout', '', [], stdin);
}

/**
 * Run a student's Python file, then call one function from it.
 * @returns {Promise<{ok, output, result, error, errorLine}>}
 */
export async function runPythonFunction(source, functionName, args, { stdin = '' } = {}) {
  return callHarness(source, 'function', functionName, args, stdin);
}

async function callHarness(source, mode, functionName, args, stdin) {
  const pyodide = await loadPython();
  const run = pyodide.globals.get('_run');
  try {
    const json = run(source, mode, functionName, JSON.stringify(args ?? []), stdin ?? '');
    return JSON.parse(json);
  } catch (err) {
    // Only reached if the harness itself breaks, not for student errors.
    return {
      ok: false,
      output: '',
      result: null,
      error: 'Something went wrong running your code: ' + (err.message || String(err)),
      errorLine: null,
    };
  } finally {
    run.destroy?.();
  }
}
