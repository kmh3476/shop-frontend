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

  // ✅ 메뉴 열릴 때 body 스크롤 방지
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "auto";
  }, [isOpen]);

  return (
    <>
      {/* 🔹 햄버거 버튼 */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: "fixed",
          top: isMobile ? "22px" : "20px",
          right: isMobile ? "22px" : "24px",
          zIndex: 120,
          backgroundColor: "rgba(0,0,0,0.75)",
          borderRadius: "22px",
          padding: isMobile ? "34px 38px" : "14px 18px",
          backdropFilter: "blur(10px)",
          boxShadow: "0 3px 10px rgba(0,0,0,0.3)",
          cursor: "pointer",
          transition: "all 0.3s ease",
        }}
      >
        <div
          style={{
            width: isMobile ? "58px" : "28px",
            height: isMobile ? "8px" : "3px",
            backgroundColor: "white",
            marginBottom: "12px",
            borderRadius: "4px",
            transform: isOpen ? "rotate(45deg) translateY(18px)" : "none",
            transition: "all 0.3s ease",
          }}
        />
        <div
          style={{
            width: isMobile ? "58px" : "28px",
            height: isMobile ? "8px" : "3px",
            backgroundColor: "white",
            marginBottom: "12px",
            borderRadius: "4px",
            opacity: isOpen ? 0 : 1,
            transition: "opacity 0.3s ease",
          }}
        />
        <div
          style={{
            width: isMobile ? "58px" : "28px",
            height: isMobile ? "8px" : "3px",
            backgroundColor: "white",
            borderRadius: "4px",
            transform: isOpen ? "rotate(-45deg) translateY(-18px)" : "none",
            transition: "all 0.3s ease",
          }}
        />
      </div>

      {/* 🔹 오른쪽 전체 슬라이드 메뉴 */}
      <div
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          width: "100vw",
          height: "100vh",
          backgroundColor: "rgba(0,0,0,0.95)",
          zIndex: 100,
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
            <li style={{ marginBottom: isMobile ? "52px" : "34px" }}>
              <Link
                to="/products"
                onClick={() => setIsOpen(false)}
                style={{
                  fontSize: isMobile ? "42px" : "28px",
                  color: "white",
                  textDecoration: "none",
                  fontWeight: "600",
                }}
              >
                상품목록
              </Link>
            </li>
            <li style={{ marginBottom: isMobile ? "52px" : "34px" }}>
              <Link
                to="/cart"
                onClick={() => setIsOpen(false)}
                style={{
                  fontSize: isMobile ? "42px" : "28px",
                  color: "white",
                  textDecoration: "none",
                  fontWeight: "600",
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
                  fontSize: isMobile ? "42px" : "28px",
                  color: "white",
                  textDecoration: "none",
                  fontWeight: "600",
                }}
              >
                관리자
              </Link>
            </li>
          </ul>
        </nav>
      </div>

      {/* 🔹 어두운 배경 클릭 시 닫기 */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            backgroundColor: "rgba(0,0,0,0.6)",
            zIndex: 90,
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
