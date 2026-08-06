import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { DentalProvider } from './context/DentalContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <DentalProvider>
      <App />
    </DentalProvider>
  </StrictMode>,
)
