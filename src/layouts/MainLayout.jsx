import { Link } from "react-router-dom";

function MainLayout() {
  return (
    <div
      className="flex flex-col min-h-screen text-white items-center overflow-x-hidden"
      style={{
        backgroundImage: "url('/woodcard.jpg')",
        backgroundSize: "cover", // ✅ 화면 꽉 채움
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center top",
        backgroundColor: "white",
      }}
    >
      {/* ✅ 콘텐츠 전체 컨테이너 */}
      <div className="flex flex-col items-center w-full px-6 sm:px-10 md:px-20 lg:px-40">

        {/* 🔹 상단 여백 */}
        <div className="h-[5vh]" />

        {/* 🔹 콘텐츠 섹션 */}
        <header className="relative flex flex-col justify-center items-center text-center w-full flex-grow">

          {/* ✅ 중앙 콘텐츠 */}
          <div className="relative z-30 w-full flex flex-col items-center mt-[25vh] md:mt-[400px]">
            {/* 제목 */}
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-black mb-2 drop-shadow-lg text-center">
              🥝 추천 상품
            </h2>

            {/* 카드 목록 */}
            <section
              className="
                grid 
                grid-cols-1 
                sm:grid-cols-2 
                md:grid-cols-3 
                gap-6 
                w-full 
                max-w-[1100px]
                justify-items-center
              "
            >
              {[1, 2, 3].map((num) => (
                <div
                  key={num}
                  className="product-card border border-gray-400 rounded-xl shadow-lg hover:shadow-2xl transition overflow-hidden bg-gray-300 w-full sm:w-[90%] md:w-[300px]"
                >
                  <img
                    src={
                      num === 1
                        ? "/clothes-sample2.png"
                        : num === 2
                        ? "/clothes-sample3.jpg"
                        : "/gorani.jpg"
                    }
                    alt={`Sample${num}`}
                    className="w-full h-40 md:h-48 object-cover"
                  />
                  <div className="p-4 text-black">
                    <h3 className="font-semibold text-lg drop-shadow-md">
                      {num === 3 ? "야생고라니" : "제목"}
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
              ))}
            </section>
          </div>
        </header>

        {/* 🔹 푸터 */}
        <footer className="py-4 text-black text-xs sm:text-sm border-t border-gray-300 w-full text-center bg-white mt-auto">
          © 2025 onyou
        </footer>
      </div>
    </div>
  );
}

export default MainLayout;
