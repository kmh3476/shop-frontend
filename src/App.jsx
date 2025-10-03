import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Admin from "./pages/Admin";
import ProductList from "./pages/ProductList";
import Cart from "./pages/Cart";

function App() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-2xl shadow-lg text-center">
        <h1 className="text-3xl font-bold text-blue-600">Shop Frontend</h1>
        <p className="text-gray-600 mt-2">Tailwind CSS 적용 완료 🎉</p>
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
      </div>
    </div>
  );
}

export default App;
