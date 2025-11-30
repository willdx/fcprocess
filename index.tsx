import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Suppress benign ResizeObserver error common in React Flow / Resizable layouts
const resizeObserverLoopErr = 'ResizeObserver loop completed with undelivered notifications';
window.addEventListener('error', (e) => {
  if (e.message && e.message.includes(resizeObserverLoopErr)) {
    e.stopImmediatePropagation();
  }
});

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);