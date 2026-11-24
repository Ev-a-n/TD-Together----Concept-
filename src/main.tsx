import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import { StoreProvider } from './state/store';
import { NavProvider } from './state/nav';
import { UIProvider } from './state/ui';
import './styles/tokens.css';
import './styles/viewer.css';
import './styles/app.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <StoreProvider>
      <NavProvider>
        <UIProvider>
          <App />
        </UIProvider>
      </NavProvider>
    </StoreProvider>
  </StrictMode>,
);
