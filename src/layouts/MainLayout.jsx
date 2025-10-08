import { Link } from "react-router-dom";

function MainLayout() {
  return (
    <div className="flex flex-col min-h-screen relative text-white bg-transparent items-center overflow-x-hidden">
      <style>
        {`
          /* 🔸 반응형 조정 */
          @media (max-width: 1280px) {
            header {
              width: 100% !important;
              height: 70vh !important;
            }
            .card-grid {
              grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
              gap: 1.5rem !important;
            }
            .overlay-section {
              top: 60% !important;
              transform: translate(-50%, -50%) !important;
            }
            .logo {
              width: 200px !important;
            }
          }

          /* 🔸 모바일용 */
          @media (max-width: 768px) {
            header {
              width: 100% !important;
              height: 60vh !important;
            }
            .overlay-section {
              position: relative !important;
              top: 0 !important;
              left: 0 !important;
              transform: none !important;
              margin-top: 2rem;
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

      {/* 🔹 상단 여백 */}
      <div className="h-[5vh] bg-white w-full"></div>

      {/* 🔹 배경 이미지 섹션 */}
      <header
        className="relative flex flex-col justify-center items-center text-center overflow-hidden w-full max-w-[1280px] mx-auto"
        style={{ height: "75vh" }}
      >
        <img
          src="/woodcard.jpg"
          alt="background"
          className="absolute inset-0 w-full h-full object-contain z-0 scale-[0.9]"
          style={{
            objectPosition: "center -20px",
          }}
        />

        {/* ✅ 로고 + 추천상품 + 카드 (중앙에 배치) */}
        <div className="overlay-section absolute top-[75%] left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full flex flex-col items-center z-30 px-6">
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

          {/* 카드 목록 */}
          <section className="card-grid grid grid-cols-3 gap-8 w-full max-w-[1150px]">
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
