import React from 'react'
import ReactDOM from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import './index.css'
import App from './App'
import LenisProvider from './components/ux/LenisProvider'
import GrainOverlay from './components/ux/GrainOverlay'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <HashRouter>
      <LenisProvider>
        <GrainOverlay />
        <App />
      </LenisProvider>
    </HashRouter>
  </React.StrictMode>
)
