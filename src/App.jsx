import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  useLocation,
} from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import CleanLayout from "./layouts/CleanLayout";

import Admin from "./pages/Admin";
import ProductList from "./pages/ProductList";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import { useState, useEffect } from "react";

// ✅ 로그인 페이지
function Login() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 text-gray-900 font-['Pretendard'] px-6">
      <div className="bg-white rounded-2xl shadow-lg p-10 w-full max-w-md">
        <h2 className="text-3xl font-bold mb-6 text-center">로그인</h2>
        <form className="flex flex-col gap-4">
          <input
            type="email"
            placeholder="이메일"
            className="border border-gray-300 rounded-lg p-3 focus:outline-none focus:border-gray-600"
          />
          <input
            type="password"
            placeholder="비밀번호"
            className="border border-gray-300 rounded-lg p-3 focus:outline-none focus:border-gray-600"
          />
          <button
            type="submit"
            className="bg-black text-white py-3 rounded-lg mt-2 hover:bg-gray-800 transition"
          >
            로그인
          </button>
        </form>
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

// ✅ 회원가입 페이지
function Signup() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 text-gray-900 font-['Pretendard'] px-6">
      <div className="bg-white rounded-2xl shadow-lg p-10 w-full max-w-md">
        <h2 className="text-3xl font-bold mb-6 text-center">회원가입</h2>
        <form className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="이름"
            className="border border-gray-300 rounded-lg p-3 focus:outline-none focus:border-gray-600"
          />
          <input
            type="email"
            placeholder="이메일"
            className="border border-gray-300 rounded-lg p-3 focus:outline-none focus:border-gray-600"
          />
          <input
            type="password"
            placeholder="비밀번호"
            className="border border-gray-300 rounded-lg p-3 focus:outline-none focus:border-gray-600"
          />
          <button
            type="submit"
            className="bg-black text-white py-3 rounded-lg mt-2 hover:bg-gray-800 transition"
          >
            회원가입
          </button>
        </form>
        <p className="mt-4 text-center text-gray-500">
          이미 계정이 있으신가요?{" "}
          <Link to="/login" className="text-black font-semibold">
            로그인
          </Link>
        </p>
      </div>
    </div>
  );
}

// ✅ 햄버거 메뉴 컴포넌트
function Navigation() {
  const location = useLocation();
  const isHome = location.pathname === "/";
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
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
          padding: isMobile ? "36px" : "18px",
          width: isMobile ? "85px" : "120px",
          height: isMobile ? "85px" : "120px",
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
        {/* ✅ 햄버거 / X 애니메이션 */}
        <div
          style={{
            width: isMobile ? "38px" : "80px",
            height: "10px",
            backgroundColor: isHome ? "white" : "#333",
            borderRadius: "1px",
            transform: isOpen ? "rotate(45deg) translate(20px, 18px)" : "none",
            transition: "transform 0.3s ease",
          }}
        />
        <div
          style={{
            width: isMobile ? "38px" : "80px",
            height: "10px",
            backgroundColor: isHome ? "white" : "#333",
            borderRadius: "1px",
            opacity: isOpen ? 0 : 1,
            transition: "opacity 0.3s ease",
          }}
        />
        <div
          style={{
            width: isMobile ? "38px" : "80px",
            height: "10px",
            backgroundColor: isHome ? "white" : "#333",
            borderRadius: "1px",
            transform: isOpen ? "rotate(-45deg) translate(20px, -18px)" : "none",
            transition: "transform 0.3s ease",
          }}
        />
      </div>

      {/* 🔹 슬라이드 메뉴 */}
      <div
        style={{
          position: "fixed",
          top: 0,
          right: "200px",
          width: isOpen
            ? isMobile
              ? "100dvw" // 모바일: 전체화면
              : "38vw" // 데스크탑: 3분의 2만 덮기
            : "0",
          height: "300dvh",
          minHeight: "300vh",
          backgroundColor: "white",
          color: "black",
          zIndex: 250,
          transform: isOpen ? "translateX(0)" : "translateX(100%)",
          transition: "transform 0.4s ease",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "flex-start",
          overflow: "hidden",
          paddingTop: isMobile ? "160px" : "160px",
        }}
      >
        {/* 🔸 상단 로그인/회원가입 (검정 배경) */}
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
        </div>

        {/* 🔸 메뉴 리스트 */}
        <nav style={{ marginTop: "70px", width: "80%" }}>
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {[
              { path: "/products", label: "상품" },
              { path: "/cart", label: "장바구니" },
              { path: "/admin", label: "관리자" },
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
          <Route path="/admin" element={<Admin />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
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
