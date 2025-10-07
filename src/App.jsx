import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import CleanLayout from "./layouts/CleanLayout";

import Admin from "./pages/Admin";
import ProductList from "./pages/ProductList";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";

function App() {
  return (
    <Router>
      {/* 🔹 공통 네비게이션 */}
      <nav
        style={{
          padding: "12px 20px",
          backgroundColor: "#f9fafb",
          borderBottom: "1px solid #ddd",
          display: "flex",
          justifyContent: "center",
          gap: "20px",
        }}
      >
        <Link
          to="/products"
          style={{
            textDecoration: "none",
            color: "#2563eb",
            fontWeight: "bold",
          }}
        >
          🛍 상품목록
        </Link>
        <Link
          to="/cart"
          style={{
            textDecoration: "none",
            color: "#2563eb",
            fontWeight: "bold",
          }}
        >
          🛒 장바구니
        </Link>
        <Link
          to="/admin"
          style={{
            textDecoration: "none",
            color: "#2563eb",
            fontWeight: "bold",
          }}
        >
          ⚙ 관리자
        </Link>
      </nav>

      {/* 🔹 라우팅 설정 */}
      <Routes>
        {/* ✅ 홈 (메인 배너, 등) */}
        <Route path="/" element={<MainLayout />} />

        {/* ✅ CleanLayout 하위 라우트들 */}
        <Route element={<CleanLayout />}>
          <Route path="/products" element={<ProductList />} />
          {/* ✅ 상품 상세페이지 경로 수정 (/product → /products) */}
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
