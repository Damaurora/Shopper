import React from 'react';
import { createRoot } from 'react-dom/client';
import './App.css';
import App from './App';
import { ShoppingProvider } from './context/ShoppingContext';

const root = createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ShoppingProvider>
      <App />
    </ShoppingProvider>
  </React.StrictMode>
);
