import { Link } from "react-router-dom";

function MainLayout() {
  return (
    <div className="flex flex-col min-h-screen relative text-white bg-transparent items-center overflow-x-hidden">
      {/* ✅ Tailwind + CSS로 반응형 조정 */}
      <style>
        {`
          @media (max-width: 1280px) {
            header {
              width: 100% !important;
              height: 70vh !important;
            }
            .card-grid {
              grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
              gap: 1.5rem !important;
            }
            .logo {
              width: 200px !important;
            }
          }

          @media (max-width: 768px) {
            header {
              width: 100% !important;
              height: 60vh !important;
            }
            .card-grid {
              grid-template-columns: 1fr !important;
              gap: 1.25rem !important;
            }
            .logo {
              width: 160px !important;
            }
          }
        `}
      </style>

      {/* 🔹 상단 여백 섹션 */}
      <div className="h-[5vh] bg-white w-full"></div>

      {/* 🔹 배경 섹션 (적당히 축소된 woodcard) */}
      <header
        className="relative flex flex-col justify-center items-center text-center overflow-hidden w-full max-w-[1280px] mx-auto"
        style={{
          height: "75vh",
        }}
      >
        {/* ✅ 배경 이미지 (object-contain + scale로 축소) */}
        <img
          src="/woodcard.jpg"
          alt="background"
          className="absolute inset-0 w-full h-full object-contain z-0 scale-[0.9]"
          style={{
            objectPosition: "center -20px", // 살짝 위로
          }}
        />

        {/* ✅ 추천상품 섹션 (배경 위로 오버레이) */}
        <div className="absolute bottom-[-8rem] left-1/2 transform -translate-x-1/2 w-full flex flex-col items-center z-30">
          {/* 로고 */}
          <img
            src="/logo-wblue.png"
            alt="onyou logo"
            className="logo w-[240px] mb-8 opacity-95 hover:opacity-100 transition drop-shadow-lg"
          />

          {/* 제목 */}
          <h2 className="text-2xl font-bold text-white mb-10 drop-shadow-lg text-center">
            🥝 추천 상품
          </h2>

          {/* 상품 카드 섹션 */}
          <section
            className="card-grid grid grid-cols-3 gap-8 px-6 w-full max-w-[1150px]"
          >
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
        </div>
      </header>

      {/* 🔹 푸터 */}
      <footer className="py-4 text-black text-sm border-t border-gray-300 w-full text-center bg-white mt-32">
        © 2025 onyou
      </footer>
    </div>
  );
}

export default MainLayout;
