// 📁 src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState("");

  // ✅ 앱 시작 시 localStorage에서 유저 & 토큰 복원
  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (storedToken && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);

        // ✅ 관리자 여부 판단 로직 추가
        const isAdmin =
          parsedUser?.isAdmin === true ||
          parsedUser?.role === "admin" ||
          parsedUser?.email === "admin@onyou.com"; // 필요시 이메일 기준 변경 가능

        // ✅ role 필드 자동 설정 (Support.jsx에서도 인식되게)
        const role = isAdmin ? "admin" : "user";

        setToken(storedToken);
        setUser({ ...parsedUser, isAdmin, role }); // ✅ role 필드 추가
      } catch (err) {
        console.error("❌ 유저 복원 실패:", err);
      }
    }
  }, []);

  // ✅ 로그인 또는 회원가입 성공 시 저장
  const login = (userData, newToken) => {
    // ✅ 관리자 여부 판단 로직
    const isAdmin =
      userData?.isAdmin === true ||
      userData?.role === "admin" ||
      userData?.email === "admin@onyou.com"; // ✅ 관리자 이메일 지정 가능

    // ✅ role 필드 자동 설정
    const role = isAdmin ? "admin" : "user";

    const userWithAdmin = { ...userData, isAdmin, role };

    localStorage.setItem("token", newToken);
    localStorage.setItem("user", JSON.stringify(userWithAdmin));

    setToken(newToken);
    setUser(userWithAdmin);
  };

  // ✅ 로그아웃 시 데이터 삭제
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setToken("");
  };

  // ✅ 관리자 여부 자동 동기화 (user가 바뀌면 다시 체크)
  useEffect(() => {
    if (user) {
      const isAdmin =
        user?.isAdmin === true ||
        user?.role === "admin" ||
        user?.email === "admin@onyou.com";

      const role = isAdmin ? "admin" : "user";

      if (user.isAdmin !== isAdmin || user.role !== role) {
        setUser({ ...user, isAdmin, role }); // ✅ role까지 항상 동기화
      }
    }
  }, [user]);

  // ✅ Context로 user, token, 함수들 제공
  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// ✅ 커스텀 훅
export const useAuth = () => useContext(AuthContext);
