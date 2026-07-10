import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Global Fetch Interceptor to automatically attach x-user-email header
const originalFetch = window.fetch;
try {
  Object.defineProperty(window, 'fetch', {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function (url: RequestInfo | URL, options: RequestInit = {}) {
      try {
        const sessionStr = localStorage.getItem('finora_session');
        if (sessionStr) {
          const session = JSON.parse(sessionStr);
          if (session && session.email) {
            if (!options.headers) {
              options.headers = {};
            }
            if (options.headers instanceof Headers) {
              options.headers.set('x-user-email', session.email);
            } else if (Array.isArray(options.headers)) {
              options.headers.push(['x-user-email', session.email]);
            } else {
              options.headers = {
                ...options.headers,
                'x-user-email': session.email
              };
            }
          }
        }
      } catch (err) {
        console.error("Fetch interceptor error:", err);
      }
      return originalFetch(url, options);
    }
  });
} catch (e) {
  console.error("Could not redefine window.fetch via defineProperty:", e);
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
