import { Link } from "react-router-dom";

function MainLayout() {
  return (
    <div
      className="flex flex-col min-h-[100vh] relative text-white items-center overflow-x-hidden"
      style={{
        backgroundImage: "url('/woodcard.jpg')",
        backgroundSize: "contain", // ✅ 원본 비율 유지
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center top",
        backgroundColor: "white",
      }}
    >
      <style>
        {`
          /* 🔸 반응형 조정 */
          @media (max-width: 1280px) {
            header {
              width: 100% !important;
              height: auto !important;
            }
            .card-grid {
              flex-wrap: nowrap !important;
              gap: 1rem !important;
            }
            .overlay-section {
              margin-top: 20rem !important;
            }
            .logo {
              width: 200px !important;
            }
          }

          /* 🔸 모바일용 */
          @media (max-width: 768px) {
            header {
              width: 100% !important;
              height: auto !important;
            }
            .overlay-section {
              position: relative !important;
              margin-top: 3rem !important;
            }
            .product-card {
              width: 100% !important;
              transform: scale(0.9);
            }
            .product-card h3 {
              font-size: 1rem !important;
            }
            .product-card p {
              font-size: 0.875rem !important;
            }
            .product-card button {
              padding: 0.4em 0.8em !important;
              font-size: 0.75rem !important;
            }
            .product-card img {
              height: 7rem !important;
            }
          }
        `}
      </style>

      {/* 🔹 상단 여백 */}
      <div className="h-[5vh] bg-transparent w-full"></div>

      {/* 🔹 콘텐츠 섹션 */}
      <header
        className="relative flex flex-col justify-center items-center text-center overflow-hidden w-full"
        style={{
          flexGrow: 1,
        }}
      >
        {/* ✅ 중앙 콘텐츠 */}
        <div className="overlay-section relative z-30 w-full flex flex-col items-center px-8 mt-[600px]">
          {/* 제목 */}
          <h2 className="text-2xl font-bold text-black mb-3 drop-shadow-lg text-center">
            🥝 추천 상품
          </h2>

          {/* 카드 목록 */}
          <section className="card-grid flex justify-center items-stretch gap-6 w-full max-w-[1100px] flex-nowrap">
            {/* 카드 1 */}
            <div
              className="product-card border border-gray-400 rounded-xl shadow-lg hover:shadow-2xl transition overflow-hidden bg-gray-300 flex-shrink-0"
              style={{
                width: "30%",
                minWidth: "250px",
                height: "300px",
              }}
            >
              <img
                src="/clothes-sample2.png"
                alt="Sample1"
                className="w-full h-40 object-cover"
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
            <div
              className="product-card border border-gray-400 rounded-xl shadow-lg hover:shadow-2xl transition overflow-hidden bg-gray-300 flex-shrink-0"
              style={{
                width: "30%",
                minWidth: "250px",
                height: "300px",
              }}
            >
              <img
                src="/clothes-sample3.jpg"
                alt="Sample2"
                className="w-full h-40 object-cover"
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
            <div
              className="product-card border border-gray-400 rounded-xl shadow-lg hover:shadow-2xl transition overflow-hidden bg-gray-300 flex-shrink-0"
              style={{
                width: "30%",
                minWidth: "250px",
                height: "300px",
              }}
            >
              <img
                src="/gorani.jpg"
                alt="Sample3"
                className="w-full h-40 object-cover"
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
      <footer className="py-4 text-black text-sm border-t border-gray-300 w-full text-center bg-white mt-auto">
        © 2025 onyou
      </footer>
    </div>
  );
}

export default MainLayout;
