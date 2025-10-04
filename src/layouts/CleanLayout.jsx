import { Outlet, Link } from "react-router-dom";

function CleanLayout() {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-start p-8 relative">
      {/* 🔹 상단 헤더 */}
      <header className="relative w-full flex justify-center items-center mb-14 px-8">
        {/* ✅ 중앙 로고 */}
        <Link to="/" className="absolute top-0">
          <img
            src="/logo-wblue.png"
            alt="Logo"
            className="w-[14vw] max-w-[200px] min-w-[100px] object-contain hover:opacity-80 transition"
          />
        </Link>

        {/* ✅ 오른쪽 메뉴 */}
        <nav className="absolute right-8 flex space-x-6 text-[clamp(0.8rem,1.5vw,1.1rem)] font-medium">
          <Link
            to="/cart"
            className="text-gray-700 hover:text-blue-500 transition"
          >
            🛒 장바구니
          </Link>
          <Link
            to="/admin"
            className="text-gray-700 hover:text-blue-500 transition"
          >
            ⚙ 관리자
          </Link>
        </nav>
      </header>

      {/* 🔹 본문 */}
      <main className="flex-1 w-full max-w-6xl">
        <Outlet />
      </main>

      {/* 🔹 푸터 */}
      <footer className="mt-16 text-gray-400 text-sm border-t pt-4 w-full text-center">
        © 2025 onyou
      </footer>
    </div>
  );
}

export default CleanLayout;
