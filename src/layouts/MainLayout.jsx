import { motion } from "framer-motion";

function MainLayout() {
  return (
    <div className="flex flex-col min-h-screen w-full text-white bg-white overflow-x-hidden">
      {/* 🔸 Hero Section (배경 이미지) */}
      <section
        className="relative flex flex-col items-center justify-center w-full min-h-[100vh]"
        style={{
          backgroundImage: "url('/woodcard.jpg')",
          backgroundSize: "cover",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center",
          backgroundAttachment: "fixed",
        }}
      >
        <div className="absolute inset-0 bg-black/10" /> {/* 어두운 오버레이 */}
        <div className="relative z-10 flex flex-col items-center justify-center text-center px-6">
          <h1 className="text-5xl md:text-6xl font-extrabold drop-shadow-lg mb-4 text-black">
            ONYOU COLLECTION
          </h1>
          <p className="text-lg md:text-xl text-black opacity-80 max-w-[600px]">
            자연스럽고 감각적인 디자인의 새로운 패션 라인
          </p>
        </div>
      </section>

      {/* 🔸 추천상품 Section */}
      <section className="flex flex-col items-center justify-center py-[8vh] px-6 bg-white text-black">
        <motion.h2
          className="text-3xl font-bold mb-6 drop-shadow-sm"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          🥝 추천 상품
        </motion.h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 max-w-[1100px] w-full">
          {[1, 2, 3].map((i) => (
            <motion.div
              key={i}
              className="border border-gray-200 rounded-2xl shadow-md hover:shadow-xl overflow-hidden bg-gray-50 transition transform hover:-translate-y-2"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: i * 0.15 }}
              viewport={{ once: true }}
            >
              <img
                src={
                  i === 1
                    ? "/clothes-sample2.png"
                    : i === 2
                    ? "/clothes-sample3.jpg"
                    : "/gorani.jpg"
                }
                alt={`sample-${i}`}
                className="w-full h-60 object-cover"
              />
              <div className="p-5">
                <h3 className="font-semibold text-lg mb-1">제목 {i}</h3>
                <p className="text-sm text-gray-600 mb-4">
                  이 섹션의 부제목을 입력할 수 있습니다.
                </p>
                <div className="flex space-x-2">
                  <button className="px-3 py-1 bg-black text-white text-sm rounded hover:bg-gray-800 transition">
                    버튼
                  </button>
                  <button className="px-3 py-1 bg-gray-800 text-white text-sm rounded hover:bg-gray-700 transition">
                    보조 버튼
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 🔸 About Section (선택사항 — 4XR 느낌 강화용) */}
      <section
        className="flex flex-col items-center justify-center py-[15vh] px-6 text-center bg-gray-100"
        style={{
          backgroundImage: "url('/texture.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <motion.h2
          className="text-3xl font-bold text-black mb-4"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          브랜드 스토리
        </motion.h2>
        <motion.p
          className="max-w-[700px] text-gray-700 leading-relaxed"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.8 }}
        >
          ONYOU는 심플하지만 감각적인 디자인을 통해 일상 속의 편안함을 추구합니다.
          <br />
          자연, 색감, 질감에서 영감을 받아 제작된 제품들은 당신의 일상을 새롭게
          만듭니다.
        </motion.p>
      </section>

      {/* 🔸 Footer */}
      <footer className="py-6 text-black text-sm border-t border-gray-300 w-full text-center bg-white">
        © 2025 ONYOU — All rights reserved.
      </footer>
    </div>
  );
}

export default MainLayout;
