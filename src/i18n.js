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

// ✅ 초기화가 끝난 뒤 태국어로 전환
i18n.on("initialized", () => {
  i18n.changeLanguage("th");
  localStorage.setItem("i18nextLng", "th");
  console.log("✅ i18n initialized → 기본 언어: th");
});
 

export default i18n;
