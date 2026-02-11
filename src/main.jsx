import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { BrandProvider } from './context/BrandContext';
import { LanguageProvider } from './context/LanguageContext';
import App from './App';
import './styles/global.css';
import './styles/layout.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <BrandProvider>
        <LanguageProvider>
          <App />
        </LanguageProvider>
      </BrandProvider>
    </BrowserRouter>
  </React.StrictMode>
);
