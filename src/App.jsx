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

// ✅ 햄버거 메뉴 컴포넌트
function Navigation() {
  const location = useLocation();
  const isHome = location.pathname === "/";
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // ✅ 반응형 감지
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
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
          top: isMobile ? "20px" : "20px",
          right: isMobile ? "20px" : "24px",
          zIndex: 120,
          backgroundColor: isHome
            ? "rgba(0,0,0,0.7)"
            : "rgba(255,255,255,0.9)",
          borderRadius: "18px",
          padding: isMobile ? "26px 30px" : "12px 16px",
          backdropFilter: "blur(8px)",
          boxShadow: "0 3px 10px rgba(0,0,0,0.25)",
          cursor: "pointer",
          transition: "all 0.3s ease",
        }}
      >
        <div
          style={{
            width: isMobile ? "48px" : "26px",
            height: isMobile ? "6px" : "3px",
            backgroundColor: isHome ? "white" : "#333",
            marginBottom: "10px",
            borderRadius: "3px",
            transform: isOpen ? "rotate(45deg) translateY(14px)" : "none",
            transition: "all 0.3s ease",
          }}
        />
        <div
          style={{
            width: isMobile ? "48px" : "26px",
            height: isMobile ? "6px" : "3px",
            backgroundColor: isHome ? "white" : "#333",
            marginBottom: "10px",
            borderRadius: "3px",
            opacity: isOpen ? 0 : 1,
            transition: "opacity 0.3s ease",
          }}
        />
        <div
          style={{
            width: isMobile ? "48px" : "26px",
            height: isMobile ? "6px" : "3px",
            backgroundColor: isHome ? "white" : "#333",
            borderRadius: "3px",
            transform: isOpen ? "rotate(-45deg) translateY(-14px)" : "none",
            transition: "all 0.3s ease",
          }}
        />
      </div>

      {/* 🔹 오른쪽 슬라이드 메뉴 */}
      <div
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          width: isOpen ? "66vw" : "0", // ✅ 가로로 3분의 2 차지
          height: "100vh", // ✅ 세로 꽉
          backgroundColor: "rgba(0,0,0,0.95)",
          zIndex: 100,
          borderTopLeftRadius: "30px",
          borderBottomLeftRadius: "30px",
          transform: isOpen ? "translateX(0)" : "translateX(100%)",
          transition: "transform 0.4s ease",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
        }}
      >
        <nav style={{ textAlign: "center", width: "100%" }}>
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            <li style={{ marginBottom: isMobile ? "46px" : "30px" }}>
              <Link
                to="/products"
                onClick={() => setIsOpen(false)}
                style={{
                  fontSize: isMobile ? "38px" : "26px",
                  color: "white",
                  textDecoration: "none",
                  fontWeight: "600",
                  transition: "color 0.2s ease",
                }}
              >
                상품목록
              </Link>
            </li>
            <li style={{ marginBottom: isMobile ? "46px" : "30px" }}>
              <Link
                to="/cart"
                onClick={() => setIsOpen(false)}
                style={{
                  fontSize: isMobile ? "38px" : "26px",
                  color: "white",
                  textDecoration: "none",
                  fontWeight: "600",
                  transition: "color 0.2s ease",
                }}
              >
                장바구니
              </Link>
            </li>
            <li>
              <Link
                to="/admin"
                onClick={() => setIsOpen(false)}
                style={{
                  fontSize: isMobile ? "38px" : "26px",
                  color: "white",
                  textDecoration: "none",
                  fontWeight: "600",
                  transition: "color 0.2s ease",
                }}
              >
                관리자
              </Link>
            </li>
          </ul>
        </nav>
      </div>

      {/* 🔹 어두운 배경 (남은 왼쪽 영역) */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "34vw",
            height: "100vh",
            backgroundColor: "rgba(0,0,0,0.5)",
            backdropFilter: "blur(3px)",
            zIndex: 90,
            transition: "all 0.3s ease",
          }}
        />
      )}
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

        {/* ✅ CleanLayout 하위 라우트들 */}
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
