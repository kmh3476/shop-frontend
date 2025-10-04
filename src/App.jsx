import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Admin from "./pages/Admin";
import ProductList from "./pages/ProductList";
import Cart from "./pages/Cart";

function App() {
  return (
    <Router>
      <header className="relative w-full h-64 flex flex-col items-center justify-center text-center bg-white overflow-hidden">
        {/* 배경 이미지 */}
        <img
          src="/logo-wblack.png"
          alt="Logo"
          className="absolute inset-0 w-full h-full object-contain"
        />
        {/* 텍스트 */}
        <h1 className="relative z-0 mt-48 text-3xl font-bold text-blue-600">
          Shop Frontend
        </h1>
        <p className="relative z-0 mt-2 text-gray-600">
          Tailwind CSS 적용 완료 🎉
        </p>
      </header>

      {/* 네비게이션 */}
      <nav className="flex space-x-6 py-8 text-lg font-medium w-full justify-center bg-white border-b">
        <Link to="/products" className="hover:text-blue-500">
          🛍 상품목록
        </Link>
        <Link to="/cart" className="hover:text-blue-500">
          🛒 장바구니
        </Link>
        <Link to="/admin" className="hover:text-blue-500">
          ⚙ 관리자
        </Link>
      </nav>

      {/* 메인 컨텐츠 */}
      <main className="flex flex-1 w-full max-w-3xl mx-auto items-center justify-center p-6">
        <div className="w-full text-center">
          <Routes>
            <Route path="/products" element={<ProductList />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/admin" element={<Admin />} />
          </Routes>
        </div>
      </main>

      {/* 푸터 */}
      <footer className="py-4 text-gray-400 text-sm border-t w-full text-center">
        © 2025 onyou
      </footer>
    </Router>
  );
}

export default App;
