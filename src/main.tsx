import React from 'react';
import ReactDOM from 'react-dom/client';
// Shared styles load first; each screen's techo-*.css is imported by its own component so later rules win over these.
import './App.css';
import './techo.css';
import App from './App';

const prototype = import.meta.env.DEV ? new URLSearchParams(location.search).get('prototype') : null;
const Root = prototype === 'image' ? (await import('./ResultImagePrototype')).ResultImagePrototype
  : prototype ? (await import('./ResultSharePrototype')).ResultSharePrototype : App;

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>,
);
