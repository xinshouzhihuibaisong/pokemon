
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

// Global error handler for deployment debugging
window.addEventListener('error', (event) => {
    const root = document.getElementById('root');
    if (root) {
        root.innerHTML = `
            <div style="padding: 20px; color: #ff6b6b; background: #2d1b1b; height: 100vh; font-family: monospace;">
                <h1>Game Crash Detected</h1>
                <p>${event.message}</p>
                <pre>${event.filename}:${event.lineno}:${event.colno}</pre>
                <button onclick="window.location.reload()" style="padding: 10px; margin-top: 20px;">Reload</button>
            </div>
        `;
    }
});

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
