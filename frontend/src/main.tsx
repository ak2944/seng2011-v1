import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from "./App"
import React from 'react'

console.log("✅ ENV:", import.meta.env);
console.log("✅ BACKEND:", import.meta.env.VITE_BACKEND_URL);


createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
