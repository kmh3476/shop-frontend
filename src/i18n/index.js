// 📁 src/i18n/index.js
import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import translationEN from "../locales/en/translation.json";
import translationKO from "../locales/ko/translation.json";
import translationTH from "../locales/th/translation.json";

// ✅ 1. 리소스 객체 (언어별 번역 파일 연결)
const resources = {
  en: { translation: translationEN },
  ko: { translation: translationKO },
  th: { translation: translationTH },
};

// ✅ 2. 기본 언어를 태국어(th)로 고정
const defaultLang = "th";

// ✅ 3. i18next 초기화
i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: defaultLang, // 🌏 기본 언어
    fallbackLng: "th", // 🌏 번역 누락 시에도 태국어 유지
    debug: true, // 필요 시 false로 변경
    interpolation: {
      escapeValue: false, // React는 XSS 자동 방지하므로 false 권장
    },
  });

// ✅ 4. export
export default i18n;
