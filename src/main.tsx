import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './app/App';
import './styles/global.css';
import './app/register-sw';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Elemento #root no encontrado');
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
