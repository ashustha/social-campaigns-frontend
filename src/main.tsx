import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './app/App';
import './styles/index.css';

const el = document.getElementById('root');
if (!el) {
  throw new Error(
    'Root element not found. Ensure index.html contains <div id="root"></div>'
  );
}

createRoot(el).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
