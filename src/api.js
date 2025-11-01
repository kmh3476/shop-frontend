import axios from "axios";

// ✅ 기본 API 인스턴스 생성
const api = axios.create({
  baseURL: "https://shop-backend-1-dfsl.onrender.com/api", // Render 백엔드 주소
  withCredentials: false,
});

// ✅ 요청 인터셉터: 토큰 자동 첨부
api.interceptors.request.use(
  (config) => {
    const token =
      localStorage.getItem("token") || sessionStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ✅ 응답 인터셉터: 401(만료) 처리 → 로그아웃 + 새로고침
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // 이미 재시도한 요청은 중복 방지
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // 토큰 갱신 요청
        const refreshToken = localStorage.getItem("refreshToken");
        if (!refreshToken) throw new Error("리프레시 토큰 없음");

        const res = await axios.post(
          "https://shop-backend-1-dfsl.onrender.com/api/auth/refresh",
          { refreshToken }
        );

        const newToken = res.data?.token;
        if (newToken) {
          localStorage.setItem("token", newToken);
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          console.log("🔁 Access Token 재발급 완료, 요청 재시도:", originalRequest.url);
          return api(originalRequest);
        }
      } catch (refreshErr) {
        console.warn("❌ 토큰 갱신 실패:", refreshErr.message);

        // 로컬 저장소 정리 후 새로고침
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");

        alert("로그인 세션이 만료되었습니다. 다시 로그인해주세요.");
        window.location.reload(); // ✅ 화면만 새로고침
      }
    }

    // 다른 에러 그대로 반환
    return Promise.reject(error);
  }
);

export default api;
