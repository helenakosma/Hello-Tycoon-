/**
 * A deliberately tiny Markdown renderer for problem prompts.
 *
 * It supports only what the problem bank actually uses, which keeps the game
 * dependency-free and means a teacher can never break the page with an odd
 * character:
 *
 *   **bold**          `inline code`          _italic_
 *   - bullet lists    ```fenced code```      blank line = new paragraph
 *
 * Everything is rendered as React elements (never raw HTML), so prompt text
 * can't inject markup.
 */

import React from 'react';

/** Split a line into bold / code / italic runs. */
function renderInline(text, keyPrefix) {
  const parts = [];
  const pattern = /(\*\*[^*]+\*\*|`[^`]+`|_[^_]+_)/g;
  let last = 0;
  let match;
  let i = 0;

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > last) parts.push(text.slice(last, match.index));
    const token = match[0];
    const key = `${keyPrefix}-${i++}`;
    if (token.startsWith('**')) parts.push(<strong key={key}>{token.slice(2, -2)}</strong>);
    else if (token.startsWith('`')) parts.push(<code key={key}>{token.slice(1, -1)}</code>);
    else parts.push(<em key={key}>{token.slice(1, -1)}</em>);
    last = match.index + token.length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return parts;
}

export default function Markdown({ text }) {
  if (!text) return null;

  const blocks = [];
  const lines = String(text).split('\n');
  let paragraph = [];
  let list = [];
  let fence = null;

  const flushParagraph = () => {
    if (!paragraph.length) return;
    blocks.push(
      <p key={`p${blocks.length}`}>{renderInline(paragraph.join(' '), `p${blocks.length}`)}</p>,
    );
    paragraph = [];
  };
  const flushList = () => {
    if (!list.length) return;
    blocks.push(
      <ul key={`u${blocks.length}`}>
        {list.map((item, i) => <li key={i}>{renderInline(item, `u${blocks.length}-${i}`)}</li>)}
      </ul>,
    );
    list = [];
  };

  for (const line of lines) {
    // Fenced code block: everything inside is shown verbatim.
    if (line.trim().startsWith('```')) {
      if (fence === null) {
        flushParagraph();
        flushList();
        fence = [];
      } else {
        blocks.push(<pre key={`c${blocks.length}`}><code>{fence.join('\n')}</code></pre>);
        fence = null;
      }
      continue;
    }
    if (fence !== null) { fence.push(line); continue; }

    if (line.trim() === '') { flushParagraph(); flushList(); continue; }

    if (/^\s*-\s+/.test(line)) {
      flushParagraph();
      list.push(line.replace(/^\s*-\s+/, ''));
      continue;
    }

    flushList();
    paragraph.push(line.trim());
  }

  // An unclosed fence still renders, rather than swallowing the rest.
  if (fence !== null) blocks.push(<pre key={`c${blocks.length}`}><code>{fence.join('\n')}</code></pre>);
  flushParagraph();
  flushList();

  return <>{blocks}</>;
}
