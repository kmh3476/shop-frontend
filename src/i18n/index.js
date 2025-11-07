// src/i18n/index.js
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import axios from "axios";

// ✅ 초기 리소스 (백엔드 데이터가 아직 없을 때 fallback)
const defaultResources = {
  ko: { translation: { loading: "불러오는 중..." } },
  en: { translation: { loading: "Loading..." } },
  th: { translation: { loading: "กำลังโหลด..." } },
};

// ✅ 백엔드에서 번역 데이터 불러오기 함수
async function fetchLanguageResources() {
  try {
    const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/language`);
    const langs = res.data;

    const resources = { ko: { translation: {} }, en: { translation: {} }, th: { translation: {} } };

    langs.forEach((item) => {
      if (item.translations?.ko) resources.ko.translation[item.key] = item.translations.ko;
      if (item.translations?.en) resources.en.translation[item.key] = item.translations.en;
      if (item.translations?.th) resources.th.translation[item.key] = item.translations.th;
    });

    return resources;
  } catch (err) {
    console.error("❌ 언어 데이터 로드 실패:", err);
    return defaultResources;
  }
}

// ✅ i18next 초기화
async function initI18n() {
  const resources = await fetchLanguageResources();

  await i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
      resources,
      fallbackLng: "ko",
      interpolation: { escapeValue: false },
      detection: {
        order: ["localStorage", "navigator"],
        caches: ["localStorage"],
      },
    });

  // ✅ 언어 변경 시 폰트 변경
  i18n.on("languageChanged", (lang) => {
    const fonts = {
      ko: "Noto Sans KR, sans-serif",
      en: "Roboto, sans-serif",
      th: "Sarabun, sans-serif",
    };
    document.body.style.fontFamily = fonts[lang] || fonts.en;
  });
}

initI18n();

export default i18n;
