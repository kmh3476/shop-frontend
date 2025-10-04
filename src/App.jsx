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
        {/* ✅ 기본 홈화면 (배경 + 로고 + 네비게이션) */}
        <Route path="/" element={<MainLayout />} />

        {/* ✅ 깨끗한 화면(CleanLayout)에 들어갈 페이지들 */}
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
