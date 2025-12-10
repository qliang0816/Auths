import ReactDOM from 'react-dom/client';
import React from 'react';
import './style.css';
import { StoreProvider } from '@/store/react/StoreContext';
import Permissions from '@/components-react/Permissions/Permissions';

const root = document.getElementById('root');

if (root) {
  ReactDOM.createRoot(root).render(
    <React.StrictMode>
      <StoreProvider>
        <Permissions />
      </StoreProvider>
    </React.StrictMode>
  );
}