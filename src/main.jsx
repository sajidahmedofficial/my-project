// agent-notes: { ctx: "Client main entry with BrowserRouter and root render", deps: ["react-router-dom", "./App.jsx"], state: "active", last: "anti@2026-08-29" }
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './index.css';
import App from './App.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>
);
