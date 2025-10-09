import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

function MainLayout() {
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const updateScale = () => {
      const baseWidth = 1920; // 기준 화면 너비
      const newScale = Math.min(window.innerWidth / baseWidth, 1);
      setScale(newScale);
    };

    updateScale();
    window.addEventListener("resize", updateScale);
    return () => window.removeEventListener("resize", updateScale);
  }, []);

  return (
    <div
      className="flex flex-col min-h-[100vh] relative text-white items-center overflow-x-hidden"
      style={{
        backgroundImage: "url('/woodcard.jpg')",
        backgroundSize: "contain",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center top",
        backgroundColor: "white",
        transform: `scale(${scale})`,
        transformOrigin: "top center",
        width: "100%",
      }}
    >
      <div className="w-full flex flex-col items-center">
        <div className="h-[5vh] bg-transparent w-full"></div>

        <header
          className="relative flex flex-col justify-center items-center text-center overflow-hidden w-full"
          style={{
            flexGrow: 1,
          }}
        >
          <div className="overlay-section relative z-30 w-full flex flex-col items-center px-8 mt-[600px]">
            <h2 className="text-2xl font-bold text-black mb-3 drop-shadow-lg text-center">
              🥝 추천 상품
            </h2>

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

        <footer className="py-4 text-black text-sm border-t border-gray-300 w-full text-center bg-white mt-auto">
          © 2025 onyou
        </footer>
      </div>
    </div>
  );
}

export default MainLayout;
