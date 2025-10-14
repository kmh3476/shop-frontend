import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  useLocation,
  useNavigate,
  Navigate,
} from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import CleanLayout from "./layouts/CleanLayout";

import Admin from "./pages/Admin";
import ProductList from "./pages/ProductList";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import Signup from "./pages/Signup"; // ✅ 실제 회원가입 폼 파일 불러오기
import FindId from "./pages/FindId"; // ✅ 아이디 찾기 페이지 추가
import ForgotPassword from "./pages/ForgotPassword"; // ✅ 비밀번호 재설정 페이지 추가
import { useState, useEffect } from "react";
import { useAuth } from "./context/AuthContext"; // ✅ 전역 로그인 상태
import { useAuth as useAuthContext } from "./context/AuthContext"; // ✅ 로그인 페이지용

/* -------------------- ✅ 로그인 페이지 -------------------- */
function Login() {
  const navigate = useNavigate();
  const { login } = useAuthContext();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const API_URL = "https://shop-backend-1-dfsl.onrender.com/api/auth/login";

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!email || !password)
      return setError("이메일과 비밀번호를 입력해주세요.");

    try {
      setLoading(true);

      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "로그인 실패");

      if (data.token && data.user) {
        login(data.user, data.token); // ✅ 로그인 상태 전역 반영
        alert("로그인 성공!");
        navigate("/products");
      }
    } catch (err) {
      console.error("로그인 오류:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 text-gray-900 font-['Pretendard'] px-6">
      <div className="bg-white rounded-2xl shadow-lg p-10 w-full max-w-md">
        <h2 className="text-3xl font-bold mb-6 text-center">로그인</h2>
        {error && (
          <div className="mb-4 text-sm text-red-600 bg-red-50 p-3 rounded">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="email"
            placeholder="이메일"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border border-gray-300 rounded-lg p-3 focus:outline-none focus:border-gray-600"
          />
          <input
            type="password"
            placeholder="비밀번호"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border border-gray-300 rounded-lg p-3 focus:outline-none focus:border-gray-600"
          />
          <button
            type="submit"
            disabled={loading}
            className={`bg-black text-white py-3 rounded-lg mt-2 hover:bg-gray-800 transition ${
              loading ? "opacity-70" : ""
            }`}
          >
            {loading ? "로그인 중..." : "로그인"}
          </button>
        </form>

        {/* ✅ 아이디/비밀번호 찾기 링크 추가 */}
        <div className="flex justify-between mt-4 text-sm text-gray-500">
          <Link to="/find-id" className="hover:text-black">
            아이디 찾기
          </Link>
          <Link to="/forgot-password" className="hover:text-black">
            비밀번호 찾기
          </Link>
        </div>

        <p className="mt-4 text-center text-gray-500">
          계정이 없으신가요?{" "}
          <Link to="/signup" className="text-black font-semibold">
            회원가입
          </Link>
        </p>
      </div>
    </div>
  );
}

/* -------------------- ✅ 관리자 보호 라우트 -------------------- */
function AdminRoute({ children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (!user.isAdmin)
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-center text-gray-700">
        <h2 className="text-2xl font-bold mb-4">🚫 접근 불가</h2>
        <p>관리자만 접근할 수 있는 페이지입니다.</p>
        <Link to="/" className="text-blue-500 underline mt-4">
          홈으로 돌아가기
        </Link>
      </div>
    );
  return children;
}

/* -------------------- ✅ 햄버거 메뉴 -------------------- */
function Navigation() {
  const location = useLocation();
  const isHome = location.pathname === "/";
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const { user, logout } = useAuth();

  useEffect(() => {
    if (typeof window === "undefined") return;

    const checkIsMobile = () => {
      const mobile = window.matchMedia("(max-width: 768px)").matches;
      setIsMobile(mobile);
    };

    checkIsMobile();
    window.addEventListener("resize", checkIsMobile);
    return () => window.removeEventListener("resize", checkIsMobile);
  }, []);

  return (
    <>
      {/* 🔹 햄버거 버튼 */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: "fixed",
          top: "30px",
          right: "30px",
          zIndex: 300,
          backgroundColor: isHome
            ? "rgba(0,0,0,0.8)"
            : "rgba(255,255,255,0.9)",
          borderRadius: "30%",
          padding: "18px",
          width: "120px",
          height: "120px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "18px",
          boxShadow: "0 6px 18px rgba(0,0,0,0.4)",
          cursor: "pointer",
          transition: "all 0.3s ease",
        }}
      >
        <div
          style={{
            width: "80px",
            height: "10px",
            backgroundColor: isHome ? "white" : "#333",
            borderRadius: "1px",
            transform: isOpen ? "rotate(45deg) translate(20px, 18px)" : "none",
            transition: "transform 0.3s ease",
          }}
        />
        <div
          style={{
            width: "80px",
            height: "10px",
            backgroundColor: isHome ? "white" : "#333",
            borderRadius: "1px",
            opacity: isOpen ? 0 : 1,
            transition: "opacity 0.3s ease",
          }}
        />
        <div
          style={{
            width: "80px",
            height: "10px",
            backgroundColor: isHome ? "white" : "#333",
            borderRadius: "1px",
            transform: isOpen
              ? "rotate(-45deg) translate(20px, -18px)"
              : "none",
            transition: "transform 0.3s ease",
          }}
        />
      </div>

      {/* 🔹 슬라이드 메뉴 */}
      <div
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          width: isMobile ? "90vw" : "38vw",
          height: isMobile ? "300dvh" : "100vh",
          backgroundColor: "white",
          color: "black",
          zIndex: 250,
          transform: isOpen ? "translateX(0)" : "translateX(100%)",
          transition: "transform 0.4s ease-in-out",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "flex-start",
          overflow: "hidden",
          paddingTop: isMobile ? "160px" : "120px",
          pointerEvents: isOpen ? "auto" : "none",
        }}
      >
        {/* 🔸 상단 로그인/회원가입 or 사용자 정보 */}
        <div
          style={{
            backgroundColor: "black",
            color: "white",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: "24px",
            fontSize: isMobile ? "32px" : "30px",
            fontWeight: "600",
            padding: "20px 0",
            width: "100%",
          }}
        >
          {user ? (
            <>
              <span>{user.name} 님</span>
              <span>|</span>
              <button
                onClick={() => {
                  logout();
                  setIsOpen(false);
                }}
                style={{
                  color: "white",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                로그아웃
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                onClick={() => setIsOpen(false)}
                style={{ color: "white", textDecoration: "none" }}
              >
                로그인
              </Link>
              <span>|</span>
              <Link
                to="/signup"
                onClick={() => setIsOpen(false)}
                style={{ color: "white", textDecoration: "none" }}
              >
                회원가입
              </Link>
            </>
          )}
        </div>

        {/* 🔸 메뉴 리스트 */}
        <nav style={{ marginTop: "70px", width: "80%" }}>
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {[
              { path: "/products", label: "상품" },
              { path: "/cart", label: "장바구니" },
              ...(user?.isAdmin ? [{ path: "/admin", label: "관리자" }] : []),
              { path: "/style", label: "스타일룸" },
              { path: "/sale", label: "이벤트/세일" },
              { path: "/store", label: "매장안내" },
            ].map((item) => (
              <li
                key={item.path}
                style={{
                  marginBottom: "40px",
                  fontSize: isMobile ? "36px" : "30px",
                  fontWeight: "700",
                  textAlign: "center",
                }}
              >
                <Link
                  to={item.path}
                  onClick={() => setIsOpen(false)}
                  style={{
                    color: "black",
                    textDecoration: "none",
                  }}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* 🔸 하단 고객센터 */}
        <div
          style={{
            marginTop: "20px",
            marginBottom: "60px",
            textAlign: "center",
            color: "#555",
            fontSize: isMobile ? "24px" : "20px",
            lineHeight: "1.6",
          }}
        >
          <p>고객센터</p>
          <p>제휴 / 입점안내</p>
        </div>
      </div>
    </>
  );
}

/* -------------------- ✅ 라우팅 -------------------- */
function App() {
  return (
    <Router>
      <Routes>
        {/* ✅ 홈 */}
        <Route
          path="/"
          element={
            <div style={{ position: "relative" }}>
              <MainLayout />
              <Navigation />
            </div>
          }
        />

        {/* ✅ CleanLayout 하위 라우트 */}
        <Route
          element={
            <>
              <Navigation />
              <CleanLayout />
            </>
          }
        >
          <Route path="/products" element={<ProductList />} />
          <Route path="/products/:id" element={<ProductDetail />} />
          <Route path="/cart" element={<Cart />} />
          {/* ✅ 관리자 보호 라우트 */}
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <Admin />
              </AdminRoute>
            }
          />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          {/* ✅ 추가된 부분 */}
          <Route path="/find-id" element={<FindId />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
        </Route>

        {/* ✅ fallback */}
        <Route
          path="*"
          element={
            <div style={{ padding: "40px", textAlign: "center" }}>
              <h2>🚫 페이지를 찾을 수 없습니다.</h2>
              <Link
                to="/"
                style={{
                  marginTop: "10px",
                  display: "inline-block",
                  color: "#2563eb",
                  textDecoration: "underline",
                }}
              >
                홈으로 이동
              </Link>
            </div>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
