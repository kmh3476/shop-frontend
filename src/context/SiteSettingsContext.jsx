// 📁 src/context/SiteSettingsContext.jsx
import React, { createContext, useContext, useEffect, useState } from "react";

const SiteSettingsContext = createContext();

export function SiteSettingsProvider({ children }) {
  const [page, setPage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ✅ CMS Page API 호출 (slug 기반)
  // const API_URL = `/cms/api/pages?filters[slug][$eq]=home&populate[sections][populate]=*`;
  // ↑ CMS 연결은 제거 (Strapi 호출 안 함)

  useEffect(() => {
    async function fetchPage() {
      try {
        // ✅ CMS 연결 제거 — 대신 로컬 더미 데이터 사용
        const dummyData = {
          id: 1,
          attributes: {
            title: "로컬 홈 페이지",
            slug: "home",
            sections: [
              {
                id: 1,
                type: "hero",
                content: "이건 CMS 없이 직접 로컬에서 불러오는 예시 콘텐츠입니다.",
              },
              {
                id: 2,
                type: "info",
                content: "여기에 원하는 기본 데이터나 테스트용 텍스트를 추가할 수 있습니다.",
              },
            ],
          },
        };

        // CMS처럼 구조를 맞춰서 setPage
        setPage(dummyData);
        setError("");
      } catch (err) {
        console.error("⚠️ 페이지 데이터 불러오기 오류:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchPage();
  }, []);

  return (
    <SiteSettingsContext.Provider value={{ page, loading, error }}>
      {children}
    </SiteSettingsContext.Provider>
  );
}

export function useSiteSettings() {
  return useContext(SiteSettingsContext);
}
