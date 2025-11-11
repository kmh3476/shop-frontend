// 📁 src/i18n.js
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import Backend from "i18next-http-backend";
import LanguageDetector from "i18next-browser-languagedetector";

// ✅ 강제 설정: 실행 직후 localStorage 초기화
localStorage.setItem("i18nextLng", "th");

i18n
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    debug: true,
    lng: "th", // ✅ 앱 시작 시 기본 언어를 직접 지정
    fallbackLng: "th", // ✅ 기본 언어 태국어
    supportedLngs: ["ko", "en", "th"],
    backend: {
      loadPath: "/locales/{{lng}}/translation.json",
    },
    detection: {
      order: ["localStorage"], // ✅ 브라우저 언어 감지 제거
      caches: ["localStorage"],
    },
    interpolation: {
      escapeValue: false,
    },
  });

// ✅ 초기화 후에도 언어 강제 고정
i18n.on("initialized", () => {
  i18n.changeLanguage("th");
  console.log("✅ i18n initialized → 기본 언어: th");
});

window.i18next = i18n;

export default i18n;
