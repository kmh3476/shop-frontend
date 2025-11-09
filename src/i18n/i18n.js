// src/i18n.js
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import Backend from "i18next-http-backend";

const API_URL = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "");

i18n
  .use(Backend)
  .use(initReactI18next)
  .init({
    lng: "th",
    fallbackLng: "th",
    debug: true,
    backend: {
      loadPath: `${API_URL}/api/language/{{lng}}`, // ✅ 백엔드에서 언어 JSON 제공
    },
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
