import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import App from './App'
import LenisProvider from './components/ux/LenisProvider'
import GrainOverlay from './components/ux/GrainOverlay'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <LenisProvider>
      <GrainOverlay />
      <App />
    </LenisProvider>
  </React.StrictMode>
)
