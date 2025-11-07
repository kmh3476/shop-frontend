// ✅ src/i18n/index.js
import i18n from "i18next";
import { initReactI18next } from "react-i18next";

// 🔧 현재 언어 감지 (localStorage or 브라우저)
const savedLang = localStorage.getItem("lang") || navigator.language.split("-")[0] || "ko";

// ✅ 리소스 직접 포함 (백엔드 호출 없이)
import ko from "./locales/ko/translation.json";
import en from "./locales/en/translation.json";
import th from "./locales/th/translation.json";

i18n
  .use(initReactI18next)
  .init({
    resources: {
      ko: { translation: ko },
      en: { translation: en },
      th: { translation: th },
    },
    lng: savedLang, // 기본 언어
    fallbackLng: "en",
    interpolation: { escapeValue: false },
    debug: false,
  });

// ✅ 언어 변경 함수 전역화 (언제든 import로 접근 가능)
export const changeLanguage = (lang) => {
  i18n.changeLanguage(lang);
  localStorage.setItem("lang", lang);
};

export default i18n;
