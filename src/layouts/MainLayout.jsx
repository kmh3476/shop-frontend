import { Link, useLocation } from "react-router-dom";

function MainLayout() {
  const location = useLocation();

  // ✅ 현재 경로가 상품목록, 장바구니, 관리자 중 하나면 네비게이션 숨김
  const hideNavOnPages = ["/products", "/cart", "/admin"];
  const shouldHideNav = hideNavOnPages.includes(location.pathname);

  return (
    <div className="flex flex-col min-h-screen relative">
      {/* 🔹 상단 배경 헤더 */}
      <header className="relative w-full h-[40vh] flex flex-col justify-center items-center text-center text-white overflow-hidden">
        {/* 배경 이미지 */}
        <img
          src="/clothes-sample.png"
          alt="Background"
          className="absolute inset-0 w-full h-full object-cover z-0"
        />

        {/* 반투명 오버레이 */}
        <div className="absolute inset-0 bg-black/40 z-10"></div>

        {/* 로고 */}
        <Link to="/" className="relative z-20 mt-[2vh]">
          <img
            src="/logo-wblue.png"
            alt="Logo"
            className="w-[20vw] max-w-[180px] min-w-[100px] object-contain hover:opacity-80 transition"
          />
        </Link>

        {/* ✅ 네비게이션 (특정 페이지에서는 숨김) */}
        {!shouldHideNav && (
          <nav className="absolute top-[2vh] right-[3vw] flex space-x-6 text-[clamp(0.8rem,1.5vw,1.1rem)] font-medium z-30">
            <Link to="/products" className="text-white hover:text-blue-300">
              🛍 상품목록
            </Link>
            <Link to="/cart" className="text-white hover:text-blue-300">
              🛒 장바구니
            </Link>
            <Link to="/admin" className="text-white hover:text-blue-300">
              ⚙ 관리자
            </Link>
          </nav>
        )}
      </header>

      {/* 🔹 배경 밑 섹션 */}
      <main className="flex flex-col flex-1 bg-white items-center justify-start p-12">
        <h2 className="text-2xl font-bold text-gray-800 mb-10">🥝 추천 상품</h2>

        <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 max-w-6xl w-full">
          {/* 카드 1 */}
          <div className="border rounded-xl shadow hover:shadow-lg transition bg-white overflow-hidden">
            <img
              src="/clothes-sample2.png"
              alt="Sample1"
              className="w-full h-48 object-cover"
            />
            <div className="p-4">
              <h3 className="font-semibold text-gray-800">제목</h3>
              <p className="text-gray-500 text-sm mt-1">
                이 섹션의 부제목을 입력할 수 있습니다
              </p>
              <div className="mt-4 flex space-x-2">
                <button className="px-3 py-1 bg-black text-white text-sm rounded">
                  버튼
                </button>
                <button className="px-3 py-1 border rounded text-sm">
                  보조 버튼
                </button>
              </div>
            </div>
          </div>

          {/* 카드 2 */}
          <div className="border rounded-xl shadow hover:shadow-lg transition bg-white overflow-hidden">
            <img
              src="/clothes-sample3.jpg"
              alt="Sample2"
              className="w-full h-48 object-cover"
            />
            <div className="p-4">
              <h3 className="font-semibold text-gray-800">제목</h3>
              <p className="text-gray-500 text-sm mt-1">
                이 섹션의 부제목을 입력할 수 있습니다
              </p>
              <div className="mt-4 flex space-x-2">
                <button className="px-3 py-1 bg-black text-white text-sm rounded">
                  버튼
                </button>
                <button className="px-3 py-1 border rounded text-sm">
                  보조 버튼
                </button>
              </div>
            </div>
          </div>

          {/* 카드 3 */}
          <div className="border rounded-xl shadow hover:shadow-lg transition bg-white overflow-hidden">
            <img
              src="/gorani.jpg"
              alt="Sample3"
              className="w-full h-48 object-cover"
            />
            <div className="p-4">
              <h3 className="font-semibold text-gray-800">야생고라니</h3>
              <p className="text-gray-500 text-sm mt-1">
                이 섹션의 부제목을 입력할 수 있습니다
              </p>
              <div className="mt-4 flex space-x-2">
                <button className="px-3 py-1 bg-black text-white text-sm rounded">
                  버튼
                </button>
                <button className="px-3 py-1 border rounded text-sm">
                  보조 버튼
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* 푸터 */}
      <footer className="py-6 text-gray-400 text-sm border-t w-full text-center">
        © 2025 onyou
      </footer>
    </div>
  );
}

export default MainLayout;
