import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './index.css'

// If the app is opened via a Firebase password-reset link, the URL will contain an `oobCode` query param.
const params = new URLSearchParams(window.location.search)
const oobCode = params.get('oobCode')
const initialPage = oobCode ? 'reset' : undefined

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App initialPage={initialPage} initialOobCode={oobCode} />
  </React.StrictMode>
)
