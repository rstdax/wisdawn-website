import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { UserProvider } from './contexts/UserContext.tsx' // <-- Import it

console.log(
  "%c Aryan Dutta %c Web Developer & Frontend Specialist ",
  "color: #ffffff; background: #1a1a1a; padding: 6px 12px; border-radius: 4px 0 0 4px; font-weight: 600; font-family: 'Inter', 'Segoe UI', Arial, sans-serif; font-size: 13px;",
  "color: #ffffff; background: #2563eb; padding: 6px 12px; border-radius: 0 4px 4px 0; font-family: 'Inter', 'Segoe UI', Arial, sans-serif; font-size: 13px; font-weight: 400;"
);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <UserProvider>       {/* <-- Wrap your App */}
      <App />
    </UserProvider>
  </React.StrictMode>,
)