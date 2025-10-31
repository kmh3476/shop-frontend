// 📁 src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState("");
  const [refreshToken, setRefreshToken] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false); // ✅ 추가: 중복 갱신 방지
  const apiUrl =
    import.meta.env.VITE_API_URL || "https://shop-backend-1-dfsl.onrender.com";

  /* ✅ 앱 시작 시 localStorage에서 유저 & 토큰 복원 */
  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedRefresh = localStorage.getItem("refreshToken");
    const storedUser = localStorage.getItem("user");

    if (storedToken && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        const isAdmin =
          parsedUser?.isAdmin === true ||
          parsedUser?.role === "admin" ||
          parsedUser?.email === "admin@onyou.com";
        const role = isAdmin ? "admin" : "user";
        setToken(storedToken);
        setRefreshToken(storedRefresh || "");
        setUser({ ...parsedUser, isAdmin, role });
      } catch (err) {
        console.error("❌ 유저 복원 실패:", err);
      }
    }
  }, []);

  /* ✅ 로그인 or 회원가입 시 저장 */
  const login = (userData, newToken, newRefreshToken) => {
    const isAdmin =
      userData?.isAdmin === true ||
      userData?.role === "admin" ||
      userData?.email === "admin@onyou.com";
    const role = isAdmin ? "admin" : "user";
    const userWithAdmin = { ...userData, isAdmin, role };

    localStorage.setItem("token", newToken);
    if (newRefreshToken) localStorage.setItem("refreshToken", newRefreshToken);
    localStorage.setItem("user", JSON.stringify(userWithAdmin));

    setToken(newToken);
    setRefreshToken(newRefreshToken || "");
    setUser(userWithAdmin);
  };

  /* ✅ 로그아웃 시 데이터 삭제 */
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    setUser(null);
    setToken("");
    setRefreshToken("");
  };

  /* ✅ 관리자 여부 자동 동기화 */
  useEffect(() => {
    if (user) {
      const isAdmin =
        user?.isAdmin === true ||
        user?.role === "admin" ||
        user?.email === "admin@onyou.com";
      const role = isAdmin ? "admin" : "user";
      if (user.isAdmin !== isAdmin || user.role !== role) {
        setUser({ ...user, isAdmin, role });
      }
    }
  }, [user]);

  /* ✅ 자동 토큰 갱신 (1시간마다 or 만료 시 시도) */
  useEffect(() => {
    if (!refreshToken) return;

    const refreshAccessToken = async () => {
      if (isRefreshing) return; // ✅ 중복 요청 방지
      setIsRefreshing(true);

      try {
        const res = await axios.post(`${apiUrl}/api/auth/refresh`, {
          token: refreshToken,
        });
        const newAccessToken = res.data.token;
        if (newAccessToken) {
          localStorage.setItem("token", newAccessToken);
          setToken(newAccessToken);
          console.log("♻️ Access token 자동 갱신 완료");
        }
      } catch (err) {
        console.warn("⚠️ 토큰 갱신 실패:", err.response?.data || err.message);
        logout(); // 갱신 실패 시 로그아웃 처리
      } finally {
        setIsRefreshing(false);
      }
    };

    // ✅ 55분마다 토큰 자동 갱신
    const interval = setInterval(refreshAccessToken, 55 * 60 * 1000);
    // ✅ 즉시 1회 갱신 시도
    refreshAccessToken();

    return () => clearInterval(interval);
  }, [refreshToken]);

  /* ✅ axios 전역 인터셉터 (요청마다 토큰 자동 삽입 + 401 자동 재시도) */
  useEffect(() => {
    const interceptor = axios.interceptors.request.use(
      (config) => {
        const currentToken = localStorage.getItem("token") || token || "";
        if (currentToken) {
          config.headers.Authorization = `Bearer ${currentToken}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // ✅ 응답 인터셉터: 401 발생 시 자동 refresh 후 재시도
    const responseInterceptor = axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        // 이미 재시도한 요청이면 무한 루프 방지
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const storedRefresh = localStorage.getItem("refreshToken");
            if (!storedRefresh) throw new Error("리프레시 토큰 없음");

            const res = await axios.post(`${apiUrl}/api/auth/refresh`, {
              token: storedRefresh,
            });

            const newToken = res.data.token;
            if (newToken) {
              localStorage.setItem("token", newToken);
              setToken(newToken);

              // 새로운 토큰으로 Authorization 헤더 갱신 후 재요청
              originalRequest.headers.Authorization = `Bearer ${newToken}`;
              console.log("🔁 토큰 갱신 후 요청 재시도됨:", originalRequest.url);
              return axios(originalRequest);
            }
          } catch (refreshErr) {
            console.error("❌ 자동 토큰 갱신 실패:", refreshErr.message);
            logout();
          }
        }

        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.request.eject(interceptor);
      axios.interceptors.response.eject(responseInterceptor);
    };
  }, [token, refreshToken]);

  return (
    <AuthContext.Provider
      value={{ user, token, refreshToken, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

/* ✅ 커스텀 훅 */
export const useAuth = () => useContext(AuthContext);
