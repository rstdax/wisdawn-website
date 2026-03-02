import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { UserProvider } from './contexts/UserContext.tsx' // <-- Import it

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <UserProvider>       {/* <-- Wrap your App */}
      <App />
    </UserProvider>
  </React.StrictMode>,
)