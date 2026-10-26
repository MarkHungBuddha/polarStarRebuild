/// <reference types="vite/client" />
import React, { lazy, Suspense } from 'react';
import ReactDOM from 'react-dom/client';
// Shared styles load first; each screen's techo-*.css is imported by its own component so later rules win over these.
import './App.css';
import './techo.css';
import App from './App';
import { readResultLink } from './resultLink';
import { SharedResultApp } from './SharedResult';

// A result link (#r=…) wins over a question link in the same address; it is read once, so in-page anchors later do not switch pages.
const sharedResult = readResultLink(window.location.hash);
const prototype = import.meta.env.DEV && new URLSearchParams(window.location.search).get('prototype') === 'interactive';
const InteractivePrototype = lazy(() => import('./InteractivePrototype'));
// Pasting another result link into the same tab, or leaving one by its fragment, changes only the hash; start over from the new address.
window.addEventListener('hashchange', () => { if (sharedResult || window.location.hash.startsWith('#r=')) window.location.reload(); });

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {sharedResult ? <SharedResultApp outcome={sharedResult} /> : prototype ? <Suspense fallback={<p>載入試玩版…</p>}><InteractivePrototype /></Suspense> : <App />}
  </React.StrictMode>,
);
