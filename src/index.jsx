import "./i18n"; // ✅ i18next 초기화
import "./api/authapi"; // ✅ axios 다국어 헤더 초기화

import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
