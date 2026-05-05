import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { FrappeProvider } from '@rustedcompiler/frappe-hooks';
import App from './App.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <FrappeProvider
      options={{
        url: 'http://localhost:8000',
      }}
      // enableDynamicAuth={true} // Enable dynamic authentication
    >
      <App />
    </FrappeProvider>
  </StrictMode>
);
