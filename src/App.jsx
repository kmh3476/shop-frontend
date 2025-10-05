import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import CleanLayout from "./layouts/CleanLayout";

import Admin from "./pages/Admin";
import ProductList from "./pages/ProductList";
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
        <Link to="/products" style={{ textDecoration: "none", color: "#2563eb", fontWeight: "bold" }}>
          🛍 상품목록
        </Link>
        <Link to="/cart" style={{ textDecoration: "none", color: "#2563eb", fontWeight: "bold" }}>
          🛒 장바구니
        </Link>
        <Link to="/admin" style={{ textDecoration: "none", color: "#2563eb", fontWeight: "bold" }}>
          ⚙ 관리자
        </Link>
      </nav>

      {/* 🔹 라우팅 설정 */}
      <Routes>
        {/* ✅ 홈 화면 (MainLayout) */}
        <Route path="/" element={<MainLayout />} />

        {/* ✅ CleanLayout 하위 페이지들 */}
        <Route element={<CleanLayout />}>
          <Route path="/products" element={<ProductList />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/admin" element={<Admin />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
