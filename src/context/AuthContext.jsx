// 📁 src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState("");
  const [refreshToken, setRefreshToken] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);
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
    if (newRefreshToken)
      localStorage.setItem("refreshToken", newRefreshToken);
    localStorage.setItem("user", JSON.stringify(userWithAdmin));

    setToken(newToken);
    setRefreshToken(newRefreshToken || "");
    setUser(userWithAdmin);
  };

  /* ✅ 로그아웃 */
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
  /* ✅ 자동 토큰 갱신 */
  useEffect(() => {
    if (!refreshToken) return;

    const refreshAccessToken = async () => {
      if (isRefreshing) return;
      setIsRefreshing(true);

      try {
        const res = await axios.post(`${apiUrl}/api/auth/refresh`, {
          refreshToken,
        });
        const newAccessToken = res.data.token;
        if (newAccessToken) {
          localStorage.setItem("token", newAccessToken);
          setToken(newAccessToken);
          console.log("♻️ Access token 자동 갱신 완료");
        }
      } catch (err) {
        console.warn("⚠️ 토큰 갱신 실패:", err.response?.data || err.message);
        // ✅ 수정: 로그아웃 대신 새로고침
        window.location.reload();
      } finally {
        setIsRefreshing(false);
      }
    };

    const interval = setInterval(refreshAccessToken, 55 * 60 * 1000);
    refreshAccessToken();

    return () => clearInterval(interval);
  }, [refreshToken]);

  /* ✅ axios 인터셉터 (401 재시도 포함) */
  useEffect(() => {
    const requestInterceptor = axios.interceptors.request.use(
      (config) => {
        const currentToken = localStorage.getItem("token") || token || "";
        if (currentToken) {
          config.headers.Authorization = `Bearer ${currentToken}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    const responseInterceptor = axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const storedRefresh = localStorage.getItem("refreshToken");
            if (!storedRefresh) throw new Error("리프레시 토큰 없음");

            const res = await axios.post(`${apiUrl}/api/auth/refresh`, {
              refreshToken: storedRefresh,
            });

            const newToken = res.data.token;
            if (newToken) {
              localStorage.setItem("token", newToken);
              setToken(newToken);
              originalRequest.headers.Authorization = `Bearer ${newToken}`;
              console.log("🔁 토큰 갱신 후 요청 재시도:", originalRequest.url);
              return axios(originalRequest);
            }
          } catch (refreshErr) {
            console.error("❌ 자동 토큰 갱신 실패:", refreshErr.message);
            // ✅ 수정: 로그아웃 대신 새로고침
            window.location.reload();
          }
        }

        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.request.eject(requestInterceptor);
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

export const useAuth = () => useContext(AuthContext);
