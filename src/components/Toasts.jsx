/**
 * Corner notifications. Each one removes itself after a few seconds.
 */

import React, { useEffect } from 'react';

function Toast({ toast, onDone }) {
  useEffect(() => {
    const timer = setTimeout(() => onDone(toast.id), 3600);
    return () => clearTimeout(timer);
  }, [toast.id, onDone]);

  return <div className={`toast ${toast.tone}`}>{toast.text}</div>;
}

export default function Toasts({ toasts, dispatch }) {
  if (!toasts.length) return null;
  return (
    <div className="toasts" aria-live="polite">
      {/* Only the newest few, so a burst of events can't cover the screen. */}
      {toasts.slice(-4).map((toast) => (
        <Toast
          key={toast.id}
          toast={toast}
          onDone={(id) => dispatch({ type: 'DISMISS_TOAST', id })}
        />
      ))}
    </div>
  );
}
