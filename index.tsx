import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { AuthProvider } from './context/AuthContext.tsx';
import { CartProvider } from './context/CartContext.tsx';
import './index.css';
import { AppProvider } from './context/AppContext.tsx';
import { SiteProvider } from './context/SiteContext.tsx';
import { UIProvider } from './context/UIContext.tsx';
import { queryClient } from './services/queryClient';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Root element not found');
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <SiteProvider>
            <UIProvider>
              <CartProvider>
                <AppProvider>
                  <App />
                </AppProvider>
              </CartProvider>
            </UIProvider>
          </SiteProvider>
        </AuthProvider>
      </QueryClientProvider>
    </BrowserRouter>
  </React.StrictMode>
);
