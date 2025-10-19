// 📁 src/context/SiteSettingsContext.jsx
import React, { createContext, useContext, useEffect, useState } from "react";

const SiteSettingsContext = createContext();

export function SiteSettingsProvider({ children }) {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ✅ Strapi API 주소 (자신의 Strapi 주소로 바꿔줘야 함)
  const API_URL = "http://localhost:1337/api/site-settings?populate=*";

  useEffect(() => {
    async function fetchSettings() {
      try {
        const res = await fetch(API_URL);
        const data = await res.json();

        if (!res.ok) throw new Error(data.error?.message || "설정 불러오기 실패");

        // ✅ Strapi의 데이터 구조에 맞게 변환
        const attrs = data.data?.attributes || {};
        const formatted = {
          fontFamily: attrs.fontFamily || "Pretendard, sans-serif",
          fontSize: attrs.fontSize || "16px",
          imageMaxWidth: attrs.imageMaxWidth || "600px",
          imageMaxHeight: attrs.imageMaxHeight || "auto",
          textColor: attrs.textColor || "#222",
          backgroundColor: attrs.backgroundColor || "#fff",
        };

        setSettings(formatted);
      } catch (err) {
        console.error("⚠️ 사이트 설정 불러오기 오류:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchSettings();
  }, []);

  // ✅ Strapi 설정값을 CSS 변수로 전역 적용
  useEffect(() => {
    if (settings) {
      const root = document.documentElement;
      root.style.setProperty("--font-family", settings.fontFamily);
      root.style.setProperty("--font-size", settings.fontSize);
      root.style.setProperty("--text-color", settings.textColor);
      root.style.setProperty("--bg-color", settings.backgroundColor);
      root.style.setProperty("--image-max-width", settings.imageMaxWidth);
      root.style.setProperty("--image-max-height", settings.imageMaxHeight);
    }
  }, [settings]);

  return (
    <SiteSettingsContext.Provider value={{ settings, loading, error }}>
      {children}
    </SiteSettingsContext.Provider>
  );
}

// ✅ 다른 컴포넌트에서 쉽게 사용하기 위한 커스텀 훅
export function useSiteSettings() {
  return useContext(SiteSettingsContext);
}
