// 📁 src/main.jsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";

// ✅ AuthContext (로그인 상태 전역 관리)
import { AuthProvider } from "./context/AuthContext.jsx";

// ✅ Builder.io 추가
import { builder } from "@builder.io/react";

// ✅ Builder.io Public API Key 초기화
builder.init(import.meta.env.VITE_BUILDER_PUBLIC_API_KEY);

// ✅ root 엘리먼트 생성
const rootElement = document.getElementById("root");

// ✅ React 18 방식 렌더링
createRoot(rootElement).render(
  <StrictMode>
    {/* ✅ 전체 앱을 AuthProvider로 감싸서 로그인 상태 전역 관리 */}
    <AuthProvider>
      {/* ✅ Builder 페이지와 App 라우팅을 함께 포함 */}
      <App />
    </AuthProvider>
  </StrictMode>
);
