import ReactDOM from 'react-dom/client';
import React from 'react';
import './style.css';
import { StoreProvider } from '@/store/react/StoreContext';
import Popup from '@/components-react/Popup/Popup';

// Create root element and render the app
const root = document.getElementById('root');

if (root) {
  ReactDOM.createRoot(root).render(
    <React.StrictMode>
      <StoreProvider>
        <Popup />
      </StoreProvider>
    </React.StrictMode>
  );
}
