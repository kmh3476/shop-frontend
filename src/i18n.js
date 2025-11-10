// 📁 src/i18n.js
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import Backend from "i18next-http-backend";
import LanguageDetector from "i18next-browser-languagedetector";

i18n
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    debug: true,
    fallbackLng: "th", // ✅ 태국어 기본
    supportedLngs: ["ko", "en", "th"],
    preload: ["th"],
    load: "languageOnly",
    backend: {
      loadPath: "/locales/{{lng}}/translation.json",
    },
    detection: {
      order: ["localStorage"], // ✅ 브라우저 언어 감지 제거
      caches: ["localStorage"], // ✅ 저장된 언어만 따름
    },
    interpolation: {
      escapeValue: false,
    },
  });

// ✅ 앱 실행 시 기본 언어를 태국어로 강제 설정
i18n.changeLanguage("th");

export default i18n;
