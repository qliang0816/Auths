import ReactDOM from 'react-dom/client';
import React from 'react';
import './style.css';
import '@/assets/styles/popup.scss';
import '@/components/popup/NewComponents.css';
import '@/components/popup/SecurityComponents.css';
import { StoreProvider } from '@/store/StoreContext';
import Popup from '@/components/popup/Popup';

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
