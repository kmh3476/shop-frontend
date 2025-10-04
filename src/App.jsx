import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Admin from "./pages/Admin";
import ProductList from "./pages/ProductList";
import Cart from "./pages/Cart";

function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen relative">

        {/* 상단 헤더 */}
        <header className="absolute top-0 left-0 w-full h-[40vh] flex flex-col justify-center items-center text-center text-white overflow-hidden">
          {/* 배경 이미지 */}
          <img
            src="/clothes-sample.png"
            alt="Background"
            className="absolute inset-0 w-full h-full object-cover z-0"
          />

          {/* 반투명 오버레이 */}
          <div className="absolute inset-0 bg-black/40 z-10"></div>

          {/* 로고 */}
          <img
            src="/logo-wblue.png"
            alt="tlogo"
            className="relative z-20 w-[20vw] max-w-[200px] min-w-[100px] object-contain mt-[2vh]"
          />
        </header>

        {/* 네비게이션 */}
        <nav className="absolute top-0 right-0 flex space-x-6 py-[1vh] px-[2vw] text-[clamp(0.8rem,1.5vw,1.1rem)] font-medium z-30">
          <Link to="/products" className="text-white hover:text-blue-300 transition">
            🛍 상품목록
          </Link>
          <Link to="/cart" className="text-white hover:text-blue-300 transition">
            🛒 장바구니
          </Link>
          <Link to="/admin" className="text-white hover:text-blue-300 transition">
            ⚙ 관리자
          </Link>
        </nav>

        {/* 메인 컨텐츠 */}
        <main className="flex flex-1 w-full max-w-3xl mx-auto items-center justify-center p-6 mt-[40vh] z-40">
          <div className="w-full text-center">
            <Routes>
              <Route path="/products" element={<ProductList />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/admin" element={<Admin />} />
            </Routes>
          </div>
        </main>

        {/* 푸터 */}
        <footer className="w-full py-2 border-t bg-white flex justify-center items-center space-x-4 text-[clamp(0.7rem,1vw,0.9rem)] text-gray-500">
          {/* 로고 (반응형 크기) */}
          <img
            src="/logo-wblack.png"
            alt="Logo"
            className="object-contain w-[10vw] max-w-[100px] min-w-[60px]"
          />
          <span>© 2025 onyou</span>
        </footer>
      </div>
    </Router>
  );
}

export default App;
