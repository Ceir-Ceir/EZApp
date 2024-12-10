// src/index.js
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './app'; // Note the capital A in App
import './styles.css';

// No need to import AuthProvider here as it's already in App.js

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error("Failed to find the root element");
}

const root = ReactDOM.createRoot(rootElement);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
