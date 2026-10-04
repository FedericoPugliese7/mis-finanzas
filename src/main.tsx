import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './app/App';
import { MotionProvider } from './app/providers';
import './styles/global.css';
import './app/register-sw';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Root element not found');
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <MotionProvider>
      <App />
    </MotionProvider>
  </React.StrictMode>
);
