import { Link } from "react-router-dom";

function MainLayout() {
  return (
    <div className="flex flex-col min-h-screen relative text-white bg-transparent">
      {/* 🔹 상단 여백 섹션 */}
      <div className="h-[5vh] bg-white"></div>

      {/* 🔹 중간 배경 섹션 (woodcard 중앙에 위치, 비율 유지하면서 살짝 확대) */}
      <header className="relative w-full h-[80vh] flex flex-col justify-center items-center text-center overflow-hidden">
        {/* 배경 이미지 */}
        <img
          src="/woodcard.jpg"
          alt="background"
          className="absolute inset-0 w-full h-full object-contain z-0 scale-[1.15]"
          style={{
            objectPosition: "center -80px", // 🔸 살짝 위로 올림
          }}
        />

        <div className="relative z-20"></div>
      </header>

      {/* 🔹 추천 상품 섹션 (위치 조정 + 로고 포함) */}
      <main
        className="flex flex-col flex-1 items-center justify-start relative z-30 -mt-[46rem]"
        style={{
          backgroundColor: "transparent",
        }}
      >
        {/* 로고 */}
        <img
          src="/logo-wblue.png"
          alt="onyou logo"
          className="w-[220px] mb-8 opacity-95 hover:opacity-100 transition drop-shadow-lg"
        />

        <h2 className="text-2xl font-bold text-white mb-10 drop-shadow-lg">
          🥝 추천 상품
        </h2>

        {/* 🔸 추천 상품 카드 목록 */}
        <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 max-w-6xl w-full">
          {/* 카드 1 */}
          <div className="border border-gray-400 rounded-xl shadow-lg hover:shadow-2xl transition overflow-hidden bg-gray-300">
            <img
              src="/clothes-sample2.png"
              alt="Sample1"
              className="w-full h-48 object-cover"
            />
            <div className="p-4 text-black">
              <h3 className="font-semibold text-lg drop-shadow-md">제목</h3>
              <p className="text-sm mt-1 opacity-100 drop-shadow-sm">
                이 섹션의 부제목을 입력할 수 있습니다
              </p>
              <div className="mt-4 flex space-x-2">
                <button className="px-3 py-1 bg-black text-white text-sm rounded hover:bg-gray-800 transition">
                  버튼
                </button>
                <button className="px-3 py-1 bg-black text-white text-sm rounded hover:bg-gray-800 transition">
                  보조 버튼
                </button>
              </div>
            </div>
          </div>

          {/* 카드 2 */}
          <div className="border border-gray-400 rounded-xl shadow-lg hover:shadow-2xl transition overflow-hidden bg-gray-300">
            <img
              src="/clothes-sample3.jpg"
              alt="Sample2"
              className="w-full h-48 object-cover"
            />
            <div className="p-4 text-black">
              <h3 className="font-semibold text-lg drop-shadow-md">제목</h3>
              <p className="text-sm mt-1 opacity-100 drop-shadow-sm">
                이 섹션의 부제목을 입력할 수 있습니다
              </p>
              <div className="mt-4 flex space-x-2">
                <button className="px-3 py-1 bg-black text-white text-sm rounded hover:bg-gray-800 transition">
                  버튼
                </button>
                <button className="px-3 py-1 bg-black text-white text-sm rounded hover:bg-gray-800 transition">
                  보조 버튼
                </button>
              </div>
            </div>
          </div>

          {/* 카드 3 */}
          <div className="border border-gray-400 rounded-xl shadow-lg hover:shadow-2xl transition overflow-hidden bg-gray-300">
            <img
              src="/gorani.jpg"
              alt="Sample3"
              className="w-full h-48 object-cover"
            />
            <div className="p-4 text-black">
              <h3 className="font-semibold text-lg drop-shadow-md">
                야생고라니
              </h3>
              <p className="text-sm mt-1 opacity-100 drop-shadow-sm">
                이 섹션의 부제목을 입력할 수 있습니다
              </p>
              <div className="mt-4 flex space-x-2">
                <button className="px-3 py-1 bg-black text-white text-sm rounded hover:bg-gray-800 transition">
                  버튼
                </button>
                <button className="px-3 py-1 bg-black text-white text-sm rounded hover:bg-gray-800 transition">
                  보조 버튼
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* 🔹 푸터 */}
      <footer className="py-4 text-black text-sm border-t border-gray-300 w-full text-center bg-white">
        © 2025 onyou
      </footer>
    </div>
  );
}

export default MainLayout;
