import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// ✅ AuthContext 추가
import { AuthProvider } from './context/AuthContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/* ✅ 전체 앱을 AuthProvider로 감싸서 로그인 상태 전역 관리 */}
    <AuthProvider>
      <App />
    </AuthProvider>
  </StrictMode>,
)
