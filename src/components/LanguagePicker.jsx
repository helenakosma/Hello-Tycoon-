/**
 * The very first screen: pick Java or Python.
 *
 * This choice decides which problem bank the whole game uses. It is not
 * permanent — the stats bar later offers the other language as a paid upgrade —
 * but it should feel like a real decision, so both options get a real pitch.
 */

import React from 'react';
import javaProblems from '../data/problems/java.js';
import pythonProblems from '../data/problems/python.js';
import TIERS from '../data/tiers.js';
import { FEATURES } from '../data/config.js';
import { formatNumber } from '../state/selectors.js';

export default function LanguagePicker({ onChoose }) {
  return (
    <div className="picker-screen">
      <div className="picker-inner">
        <h1>Hello, <span>Tycoon!</span></h1>
        <p className="tagline">
          Solve coding problems. Earn Bytes. Build the startup office of your dreams,
          one floor at a time.
        </p>

        <div className="lang-grid">
          <button className="lang-card python" onClick={() => onChoose('python')}>
            <h2>Python</h2>
            <p>
              Friendly to read and quick to write. Runs real CPython right here in your
              browser, so everything you learn works in any Python course.
            </p>
            <div className="meta">
              {pythonProblems.length} problems · {TIERS.length} topics
              <br />needs internet the first time only
            </div>
          </button>

          <button className="lang-card java" onClick={() => onChoose('java')}>
            <h2>Java</h2>
            <p>
              Strict about types, which is exactly why it teaches you so much. Runs
              offline on a built-in Java engine made for this game.
            </p>
            <div className="meta">
              {javaProblems.length} problems · {TIERS.length} topics
              <br />works with no internet at all
            </div>
          </button>
        </div>

        <p className="picker-note">
          Pick whichever your class is using — you can unlock the other one later for
          {' '}{formatNumber(FEATURES.languageSwitchCost)} Bytes, and your progress carries over.
          <br />
          Your game saves automatically in this browser on this computer.
        </p>
      </div>
    </div>
  );
}
