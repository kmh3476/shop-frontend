import { BrowserRouter as Router, Routes, Route, Link, useLocation } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import CleanLayout from "./layouts/CleanLayout";

import Admin from "./pages/Admin";
import ProductList from "./pages/ProductList";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";

// ✅ 햄버거 메뉴 컴포넌트
function Navigation() {
  const location = useLocation();
  const isHome = location.pathname === "/";

  return (
    <div
      style={{
        position: "fixed",
        top: "20px",
        right: "24px",
        zIndex: 100,
        backgroundColor: isHome ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.9)",
        borderRadius: "12px",
        padding: "10px 14px",
        backdropFilter: "blur(6px)",
        boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
        cursor: "pointer",
      }}
    >
      <div
        style={{
          width: "24px",
          height: "2px",
          backgroundColor: isHome ? "white" : "#333",
          marginBottom: "5px",
          borderRadius: "2px",
        }}
      />
      <div
        style={{
          width: "24px",
          height: "2px",
          backgroundColor: isHome ? "white" : "#333",
          marginBottom: "5px",
          borderRadius: "2px",
        }}
      />
      <div
        style={{
          width: "24px",
          height: "2px",
          backgroundColor: isHome ? "white" : "#333",
          borderRadius: "2px",
        }}
      />
    </div>
  );
}

function App() {
  return (
    <Router>
      {/* 🔹 라우팅 설정 */}
      <Routes>
        {/* ✅ 홈 (메인 배너 등) */}
        <Route
          path="/"
          element={
            <div style={{ position: "relative" }}>
              {/* 🔹 배경(메인화면) */}
              <MainLayout />

              {/* ✅ 햄버거 메뉴 */}
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

        {/* ✅ fallback: 잘못된 경로 접근 시 */}
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
