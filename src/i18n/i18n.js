// 📁 src/i18n.js
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import Backend from "i18next-http-backend";

const API_URL =
  import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "") ||
  "https://shop-backend-1-dfsl.onrender.com"; // ✅ 기본 백엔드 URL fallback

i18n
  .use(Backend)
  .use(initReactI18next)
  .init({
    lng: "th", // ✅ 기본 언어: 태국어
    fallbackLng: "th", // ✅ 번역 누락 시에도 태국어 유지
    debug: true, // 필요 시 false로 바꿔도 됨
    backend: {
      loadPath: `${API_URL}/api/language/{{lng}}`, // ✅ 백엔드에서 번역 JSON 불러옴
    },
    interpolation: {
      escapeValue: false,
    },
  });

// ✅ 초기화 완료 후 강제 적용 (안전)
i18n.on("initialized", () => {
  i18n.changeLanguage("th");
});

export default i18n;
