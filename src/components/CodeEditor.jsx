/**
 * A small dependency-free code editor.
 *
 * It's a plain <textarea> rendered transparently on top of a syntax-highlighted
 * <pre>. That trick keeps real textarea behaviour (selection, undo, screen
 * readers, mobile keyboards) while still colouring the code, and it avoids
 * pulling a 400KB editor library into a game students download over school wifi.
 *
 * Features students actually need:
 *   - Tab inserts spaces instead of moving focus (Shift+Tab outdents)
 *   - Enter keeps your indentation, and adds one level after `:` or `{`
 *   - line numbers, with the error line highlighted in red
 *   - Ctrl/Cmd+Enter runs the tests
 */

import React, { useCallback, useEffect, useMemo, useRef } from 'react';

const INDENT = '    '; // 4 spaces, in both languages

const PY_KEYWORDS = 'False|None|True|and|as|assert|async|await|break|class|continue|def|del|elif|else|except|finally|for|from|global|if|import|in|is|lambda|nonlocal|not|or|pass|raise|return|try|while|with|yield|self|print|len|range|str|int|float|bool|list|dict|set|sum|max|min|abs|sorted|round|enumerate|zip|input|type';
const JAVA_KEYWORDS = 'abstract|boolean|break|byte|case|catch|char|class|continue|default|do|double|else|enum|extends|final|finally|float|for|if|implements|import|instanceof|int|interface|long|new|package|private|protected|public|return|short|static|super|switch|this|throw|throws|try|void|while|true|false|null|String|System';

const escapeHtml = (s) => s
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;');

/**
 * Build the highlight regex for a language. Order inside the alternation is
 * the precedence: comments beat strings beat numbers, and so on.
 *
 * Note the languages need different comment rules — `//` is a comment in Java
 * but floor division in Python, so we must not share one pattern.
 */
function buildPattern(language) {
  const comment = language === 'python'
    ? '#[^\\n]*'
    : '\\/\\*[\\s\\S]*?\\*\\/|\\/\\/[^\\n]*';
  const strings = language === 'python'
    ? '"""[\\s\\S]*?"""|\'\'\'[\\s\\S]*?\'\'\'|f?"(?:[^"\\\\\\n]|\\\\.)*"|f?\'(?:[^\'\\\\\\n]|\\\\.)*\''
    : '"(?:[^"\\\\\\n]|\\\\.)*"|\'(?:[^\'\\\\\\n]|\\\\.)*\'';
  const keywords = language === 'python' ? PY_KEYWORDS : JAVA_KEYWORDS;

  return new RegExp(
    `(${comment})`                           // 1 comment
    + `|(${strings})`                        // 2 string
    + '|(\\b\\d+(?:\\.\\d+)?[fFlLdD]?\\b)'   // 3 number
    + `|(\\b(?:${keywords})\\b)`             // 4 keyword
    + '|(\\b[A-Za-z_]\\w*(?=\\s*\\())'       // 5 function call
    + '|(\\b[A-Z]\\w*\\b)',                  // 6 class-ish name
    'g',
  );
}

function highlight(code, language) {
  const pattern = buildPattern(language);
  let out = '';
  let last = 0;
  let match;

  while ((match = pattern.exec(code)) !== null) {
    out += escapeHtml(code.slice(last, match.index));
    const text = escapeHtml(match[0]);
    if (match[1]) out += `<span class="tok-com">${text}</span>`;
    else if (match[2]) out += `<span class="tok-str">${text}</span>`;
    else if (match[3]) out += `<span class="tok-num">${text}</span>`;
    else if (match[4]) out += `<span class="tok-key">${text}</span>`;
    else if (match[5]) out += `<span class="tok-fn">${text}</span>`;
    else out += `<span class="tok-type">${text}</span>`;
    last = match.index + match[0].length;
  }
  out += escapeHtml(code.slice(last));
  // A trailing newline needs a character after it or the <pre> collapses and
  // the highlight layer drifts out of sync with the textarea.
  return out + '\n';
}

export default function CodeEditor({ value, onChange, language, errorLine, onRun }) {
  const textareaRef = useRef(null);
  const highlightRef = useRef(null);
  const gutterRef = useRef(null);

  const html = useMemo(() => highlight(value ?? '', language), [value, language]);
  const lineCount = useMemo(() => (value ?? '').split('\n').length, [value]);

  /** Keep the highlight layer and the gutter glued to the textarea's scroll. */
  const syncScroll = useCallback(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    if (highlightRef.current) {
      highlightRef.current.scrollTop = ta.scrollTop;
      highlightRef.current.scrollLeft = ta.scrollLeft;
    }
    if (gutterRef.current) gutterRef.current.scrollTop = ta.scrollTop;
  }, []);

  useEffect(syncScroll, [value, syncScroll]);

  /** Replace the selection and put the caret where the student expects it. */
  const replaceSelection = (insert, caretOffset) => {
    const ta = textareaRef.current;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const next = value.slice(0, start) + insert + value.slice(end);
    onChange(next);
    const caret = start + (caretOffset ?? insert.length);
    requestAnimationFrame(() => {
      ta.selectionStart = caret;
      ta.selectionEnd = caret;
    });
  };

  const handleKeyDown = (event) => {
    const ta = textareaRef.current;

    // Ctrl/Cmd + Enter runs the tests without reaching for the mouse.
    if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
      event.preventDefault();
      onRun?.();
      return;
    }

    // Tab indents; Shift+Tab outdents. Never move focus out of the editor.
    if (event.key === 'Tab') {
      event.preventDefault();
      const start = ta.selectionStart;
      const end = ta.selectionEnd;

      if (start !== end || event.shiftKey) {
        // Indent or outdent every line the selection touches.
        const lineStart = value.lastIndexOf('\n', start - 1) + 1;
        const lineEnd = value.indexOf('\n', end) === -1 ? value.length : value.indexOf('\n', end);
        const block = value.slice(lineStart, lineEnd);
        const changed = event.shiftKey
          ? block.split('\n').map((l) => l.replace(new RegExp(`^ {1,${INDENT.length}}`), '')).join('\n')
          : block.split('\n').map((l) => INDENT + l).join('\n');
        const next = value.slice(0, lineStart) + changed + value.slice(lineEnd);
        onChange(next);
        requestAnimationFrame(() => {
          ta.selectionStart = lineStart;
          ta.selectionEnd = lineStart + changed.length;
        });
      } else {
        replaceSelection(INDENT);
      }
      return;
    }

    // Enter keeps the current indentation, and adds one level after : or {
    if (event.key === 'Enter' && !event.shiftKey) {
      const start = ta.selectionStart;
      const lineStart = value.lastIndexOf('\n', start - 1) + 1;
      const currentLine = value.slice(lineStart, start);
      const indent = (currentLine.match(/^[ \t]*/) || [''])[0];
      const trimmed = currentLine.trimEnd();

      const opensBlock = language === 'python'
        ? trimmed.endsWith(':')
        : trimmed.endsWith('{');

      if (indent || opensBlock) {
        event.preventDefault();
        const extra = opensBlock ? INDENT : '';
        // In Java, typing Enter between { and } puts the closing brace on its
        // own line, which is what a student expects from a real IDE.
        const after = value.slice(ta.selectionEnd);
        if (language === 'java' && opensBlock && after.trimStart().startsWith('}')) {
          const insert = `\n${indent}${extra}\n${indent}`;
          replaceSelection(insert, 1 + indent.length + extra.length);
        } else {
          replaceSelection(`\n${indent}${extra}`);
        }
      }
    }
  };

  return (
    <div className="editor-wrap">
      <div className="gutter" ref={gutterRef} aria-hidden="true">
        {Array.from({ length: lineCount }, (_, i) => (
          <div key={i} className={errorLine === i + 1 ? 'err' : undefined}>{i + 1}</div>
        ))}
      </div>

      <div className="editor-scroll">
        <pre
          className="editor-highlight"
          ref={highlightRef}
          aria-hidden="true"
          // Safe: `html` is built from escaped text in highlight() above.
          dangerouslySetInnerHTML={{ __html: html }}
        />
        <textarea
          className="editor-input"
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onScroll={syncScroll}
          onKeyDown={handleKeyDown}
          spellCheck={false}
          autoCapitalize="off"
          autoCorrect="off"
          autoComplete="off"
          wrap="off"
          rows={Math.max(lineCount + 1, 8)}
          aria-label="Code editor"
        />
      </div>
    </div>
  );
}
