import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import CleanLayout from "./layouts/CleanLayout";

import Admin from "./pages/Admin";
import ProductList from "./pages/ProductList";
import Cart from "./pages/Cart";

function App() {
  return (
    <Router>
      <Routes>
        {/* ✅ 기본 레이아웃 (홈 + 장바구니 + 관리자) */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<div />} /> {/* 홈은 배경만 표시 */}
          <Route path="/cart" element={<Cart />} />
          <Route path="/admin" element={<Admin />} />
        </Route>

        {/* ✅ 상품목록 (깨끗한 레이아웃 + 상단 로고 + 장바구니/관리자 메뉴 유지) */}
        <Route element={<CleanLayout />}>
          <Route path="/products" element={<ProductList />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
