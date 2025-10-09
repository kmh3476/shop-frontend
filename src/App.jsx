import { BrowserRouter as Router, Routes, Route, Link, useLocation } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import CleanLayout from "./layouts/CleanLayout";

import Admin from "./pages/Admin";
import ProductList from "./pages/ProductList";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";

// ✅ 네비게이션 컴포넌트 분리
function Navigation() {
  const location = useLocation();

  // ✅ 홈("/")에서는 배경 아래쪽에 배치되게 (absolute → relative)
  const isHome = location.pathname === "/";

  return (
    <nav
      style={{
        padding: "12px 20px",
        backgroundColor: isHome ? "transparent" : "#f9fafb",
        borderBottom: isHome ? "none" : "1px solid #ddd",
        display: "flex",
        justifyContent: "center",
        gap: "20px",
        position: isHome ? "relative" : "sticky",
        top: 0,
        zIndex: 50,
      }}
    >
      <Link
        to="/products"
        style={{
          textDecoration: "none",
          color: isHome ? "white" : "#2563eb",
          fontWeight: "bold",
        }}
      >
        🛍 상품목록
      </Link>
      <Link
        to="/cart"
        style={{
          textDecoration: "none",
          color: isHome ? "white" : "#2563eb",
          fontWeight: "bold",
        }}
      >
        🛒 장바구니
      </Link>
      <Link
        to="/admin"
        style={{
          textDecoration: "none",
          color: isHome ? "white" : "#2563eb",
          fontWeight: "bold",
        }}
      >
        ⚙ 관리자
      </Link>
    </nav>
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
            <>
              <MainLayout />
              {/* ✅ 배경 밑으로 네비게이션 배치 */}
              <div
                style={{
                  marginTop: "-80px",
                  position: "relative",
                  zIndex: 10,
                }}
              >
                <Navigation />
              </div>
            </>
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
                to="/products"
                style={{
                  marginTop: "10px",
                  display: "inline-block",
                  color: "#2563eb",
                  textDecoration: "underline",
                }}
              >
                상품목록으로 이동
              </Link>
            </div>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
