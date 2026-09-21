/**
 * Entry point. Mounts the game into <div id="root"> from index.html.
 */

import React from 'react';
import { createRoot } from 'react-dom/client';

import './styles/global.css';
import App from './App.jsx';
import { GameProvider } from './state/gameStore.jsx';

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <GameProvider>
      <App />
    </GameProvider>
  </React.StrictMode>,
);
