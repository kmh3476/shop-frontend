// 📁 src/utils/api.js
const CMS_BASE_URL = "/cms/api"; // ✅ vite.config.js의 proxy 기준

const CMS_TOKEN = import.meta.env.VITE_STRAPI_TOKEN;

/**
 * 특정 slug에 해당하는 페이지 데이터를 CMS(Strapi)에서 불러옵니다.
 * @param {string} slug - 페이지 슬러그
 */
export async function fetchPageBySlug(slug) {
  try {
    const res = await fetch(`${CMS_BASE_URL}/pages?filters[slug][$eq]=${slug}&populate=*`, {
      headers: {
        Authorization: `Bearer ${CMS_TOKEN}`,
      },
    });

    if (!res.ok) {
      console.error(`❌ CMS 요청 실패 (${res.status})`);
      return null;
    }

    const data = await res.json();
    if (!data.data || data.data.length === 0) return null;

    return data.data[0];
  } catch (err) {
    console.error("🚨 페이지 데이터 불러오기 실패:", err);
    return null;
  }
}
