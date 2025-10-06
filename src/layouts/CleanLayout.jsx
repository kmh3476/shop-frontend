import { Outlet, Link } from "react-router-dom";

function CleanLayout() {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center">
      {/* 중앙 로고 */}
      <Link
        to="/"
        className="absolute left-1/2 top-[6vh] transform -translate-x-1/2"
      >
        <img
          src="/logo-wblue.png"
          alt="Logo"
          className="w-[20vw] max-w-[180px] min-w-[100px] object-contain hover:opacity-80 transition"
        />
      </Link>

      {/* 페이지 내용 */}
      <main className="flex flex-col flex-1 w-full max-w-5xl mt-[20vh] px-6">
        <Outlet />
      </main>

      {/* 하단 푸터 */}
      <footer className="mt-10 py-4 text-gray-400 text-sm border-t w-full text-center">
        © 2025 onyou
      </footer>
    </div>
  );
}

export default CleanLayout;
