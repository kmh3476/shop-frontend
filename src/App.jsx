import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Admin from "./pages/Admin";
import ProductList from "./pages/ProductList";
import Cart from "./pages/Cart";

function App() {
  return (
    <Router>
<div className="flex flex-col min-h-screen"></div>

      <header className="absolute top-0 left-0 w-full h-96 flex flex-col justify-center items-center text-center text-white">
  {/* 배경 이미지 */}
  <img
    src="/clothes-sample.png"
    alt="Background"
    className="absolute inset-0 w-full h-full object-cover z-0"/>

<img
    src="/logo-wblue.png"
    alt="tlogo"
    className="absolute top-2 inset-0 w-full h-full h-20 object-contain z-50"
  />

  </header>

  {/* 오버레이 (배경 위에 반투명 검은색 레이어) */}
  <div className="absolute inset-0 h-96 bg-black/40 z-0"></div>
  
      {/* 네비게이션 */}
      <nav className="absolute top-0 right-0 flex space-x-6 py-4 px-8 text-lg font-medium">
        <Link to="/products" className="text-white">
          🛍 상품목록
        </Link>
        <Link to="/cart" className="text-white">
          🛒 장바구니
        </Link>
        <Link to="/admin" className="text-white">
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

      <footer className="w-full py-2 border-t bg-white flex justify-center items-center space-x-4 text-sm text-gray-500">
  {/* 로고 먼저 */}
  <img
    src="/logo-wblack.png"
    alt="Logo"
    className="h-24 object-contain"
  />
  {/* 그다음 텍스트 */}
  <span>© 2025 onyou</span>
</footer>
    </Router>
  );
}

export default App;
