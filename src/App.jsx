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
          top: isMobile ? "80px" : "20px", // 위치도 약간 내려줌
          right: isMobile ? "80px" : "24px",
          zIndex: 120,
          backgroundColor: isHome
            ? "rgba(0,0,0,0.75)"
            : "rgba(255,255,255,0.95)",
          borderRadius: "50%",
          padding: isMobile ? "120px 140px" : "16px 20px", // ✅ 6배 커짐
          backdropFilter: "blur(10px)",
          boxShadow: "0 6px 18px rgba(0,0,0,0.4)",
          cursor: "pointer",
          transition: "all 0.3s ease",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: isMobile ? "30px" : "6px", // 줄 간격 넓힘
        }}
      >
        {/* ✅ 햄버거 막대 1 */}
        <div
          style={{
            width: isMobile ? "180px" : "30px",
            height: isMobile ? "24px" : "4px",
            backgroundColor: isHome ? "white" : "#333",
            borderRadius: "12px",
            transformOrigin: "center",
            transform: isOpen
              ? "rotate(45deg) translate(25px, 25px)"
              : "none",
            transition: "transform 0.4s ease",
          }}
        />
        {/* ✅ 햄버거 막대 2 (중간줄) */}
        <div
          style={{
            width: isMobile ? "180px" : "30px",
            height: isMobile ? "24px" : "4px",
            backgroundColor: isHome ? "white" : "#333",
            borderRadius: "12px",
            opacity: isOpen ? 0 : 1,
            transition: "opacity 0.3s ease",
          }}
        />
        {/* ✅ 햄버거 막대 3 */}
        <div
          style={{
            width: isMobile ? "180px" : "30px",
            height: isMobile ? "24px" : "4px",
            backgroundColor: isHome ? "white" : "#333",
            borderRadius: "12px",
            transformOrigin: "center",
            transform: isOpen
              ? "rotate(-45deg) translate(25px, -25px)"
              : "none",
            transition: "transform 0.4s ease",
          }}
        />
      </div>

      {/* 🔹 오른쪽 슬라이드 메뉴 */}
      <div
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          width: isOpen ? "66vw" : "0",
          height: "100vh",
          backgroundColor: "rgba(0,0,0,0.85)",
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
            <li style={{ marginBottom: isMobile ? "90px" : "30px" }}>
              <Link
                to="/products"
                onClick={() => setIsOpen(false)}
                style={{
                  fontSize: isMobile ? "76px" : "26px",
                  color: "white",
                  textDecoration: "none",
                  fontWeight: "600",
                  transition: "color 0.2s ease",
                }}
              >
                상품목록
              </Link>
            </li>
            <li style={{ marginBottom: isMobile ? "90px" : "30px" }}>
              <Link
                to="/cart"
                onClick={() => setIsOpen(false)}
                style={{
                  fontSize: isMobile ? "76px" : "26px",
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
                  fontSize: isMobile ? "76px" : "26px",
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
