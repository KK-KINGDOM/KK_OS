import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import ParentDashboard from './ParentDashboard.tsx';
import './index.css';

const path = window.location.pathname;

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {path === '/parent' ? <ParentDashboard /> : <App />}
  </StrictMode>,
);
