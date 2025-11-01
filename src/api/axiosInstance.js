// 📁 src/api/axiosInstance.js
import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, ""), // ✅ 슬래시 중복 방지
  withCredentials: true, // ✅ 쿠키 기반 인증 시 필요 (선택적)
});

// ✅ 요청 인터셉터 (Authorization 자동 첨부)
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ✅ 응답 인터셉터 (토큰 만료 시 자동 갱신)
API.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config;

    // 401 에러 + refreshToken 존재 시
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem("refreshToken");

      if (!refreshToken) {
        console.warn("⚠️ Refresh Token 없음, 로그인 페이지로 이동");
        window.location.href = "/login";
        return Promise.reject(error);
      }

      try {
        // ✅ refresh 요청 (서버에 refreshToken 전달)
        const refreshRes = await axios.post(
          `${import.meta.env.VITE_API_BASE_URL}/api/auth/refresh`,
          { refreshToken },
          { headers: { "Content-Type": "application/json" } }
        );

        if (refreshRes.status === 200 && refreshRes.data.token) {
          console.log("🔁 새 토큰 발급 성공");

          // ✅ 새 토큰 저장
          localStorage.setItem("token", refreshRes.data.token);

          // ✅ Authorization 헤더 업데이트 후 재요청
          originalRequest.headers.Authorization = `Bearer ${refreshRes.data.token}`;
          return API(originalRequest);
        } else {
          throw new Error("리프레시 토큰 응답이 올바르지 않습니다.");
        }
      } catch (err) {
        console.error("🔒 자동 재로그인 실패:", err);
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
        alert("세션이 만료되었습니다. 다시 로그인해주세요.");
        window.location.href = "/login";
      }
    }

    // 다른 오류는 그대로 전달
    return Promise.reject(error);
  }
);

export default API;
