"""Runs the Python problem bank's reference solutions locally, mirroring what
the in-browser Pyodide harness does. Used only to validate the bank."""
import json, sys, io, traceback

payload = json.load(open(sys.argv[1], encoding='utf-8'))
results = []

for case in payload:
    namespace = {'__name__': '__main__'}
    captured = io.StringIO()
    real_stdout = sys.stdout
    sys.stdout = captured
    entry = {'id': case['id'], 'ok': True, 'output': '', 'result': None, 'error': None}
    try:
        exec(compile(case['source'], 'your_code.py', 'exec'), namespace)
        if case['mode'] == 'function':
            fn = namespace[case['functionName']]
            entry['result'] = fn(*case['args'])
    except Exception as exc:
        entry['ok'] = False
        entry['error'] = type(exc).__name__ + ': ' + str(exc)
    finally:
        sys.stdout = real_stdout
    entry['output'] = captured.getvalue()

    def plain(value):
        if isinstance(value, (tuple, set, list)):
            return [plain(v) for v in value]
        if isinstance(value, dict):
            return {str(k): plain(v) for k, v in value.items()}
        if isinstance(value, (int, float, str, bool)) or value is None:
            return value
        return repr(value)

    entry['result'] = plain(entry['result'])
    results.append(entry)

print(json.dumps(results))
