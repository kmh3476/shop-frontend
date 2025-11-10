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

    fallbackLng: "th", // ✅ 기본 언어를 태국어로 설정
    supportedLngs: ["ko", "en", "th"], // ✅ 지원 언어 목록
    preload: ["th"], // ✅ 태국어 먼저 미리 로드
    load: "languageOnly", // ✅ th-TH → th 로 변환

    backend: {
      // ✅ public 폴더 안의 locales 경로에서 불러오기
      loadPath: "/locales/{{lng}}/translation.json",
    },

    detection: {
      order: ["localStorage", "navigator", "htmlTag"],
      caches: ["localStorage"], // ✅ 언어 설정 저장
    },

    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
