// 📁 src/lib/api.js
import axios from "axios";

/**
 * 🛍️ 기존 상점 백엔드용 Axios 인스턴스
 * (로그인, 상품, 결제 등)
 */
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:4000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * 🧩 Strapi CMS용 Axios 인스턴스
 * (배너, 텍스트, 설정 등 콘텐츠)
 */
export const cms = axios.create({
  baseURL: (import.meta.env.VITE_STRAPI_URL || "http://localhost:1337") + "/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// ✅ Strapi 요청 인터셉터 (API Token 자동 주입)
cms.interceptors.request.use(
  (config) => {
    const token = import.meta.env.VITE_STRAPI_TOKEN;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * 📦 기본 내보내기 (기존 코드 호환용)
 * 👉 기존 `import api from "@/lib/api"` 코드도 그대로 동작
 */
export default api;
