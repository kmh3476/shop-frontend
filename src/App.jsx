import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Admin from "./pages/Admin";
import ProductList from "./pages/ProductList";
import Cart from "./pages/Cart";

function App() {
  return (
    <Router>
      {/* 네비게이션 */}
      <nav style={{ padding: "10px", borderBottom: "1px solid #ddd" }}>
        <Link to="/products" style={{ marginRight: "10px" }}>🛍 상품목록</Link>
        <Link to="/cart" style={{ marginRight: "10px" }}>🛒 장바구니</Link>
        <Link to="/admin">⚙ 관리자</Link>
      </nav>

      {/* 라우팅 */}
      <Routes>
        <Route path="/products" element={<ProductList />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </Router>
  );
}

export default App;
