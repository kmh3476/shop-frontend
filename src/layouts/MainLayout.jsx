import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { motion } from "framer-motion";

function MainLayout() {
  return (
    <div className="flex flex-col min-h-screen w-full text-white bg-white overflow-x-hidden">
      {/* 🔸 Hero Section (배경 유지 / 모바일 스크롤 허용) */}
      <section
        className="relative flex flex-col items-center justify-center w-full min-h-[110vh]" // ✅ 약간 줄임
        style={{
          backgroundImage: "url('/woodcard.jpg')",
          backgroundSize: "cover",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center",
          backgroundAttachment: "scroll", // ✅ fixed → scroll (모바일 스크롤 가능)
        }}
      >
        <div className="absolute inset-0 bg-black/10" />
      </section>

      {/* 🔸 추천상품 Section (위쪽으로 약간 올림) */}
      <section className="flex flex-col items-center justify-center py-[8vh] px-6 bg-white text-black relative -mt-[20vh] md:-mt-[12vh] rounded-t-[2rem] shadow-[0_-10px_30px_rgba(0,0,0,0.08)] transition-all duration-500">
        {/* ✅ -mt 추가로 배경 위로 끌어올림 + 위쪽 곡선처럼 자연스럽게 */}
        <motion.h2
          className="text-3xl font-bold mb-5 drop-shadow-sm"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          viewport={{ once: true }}
        >
          🥝 추천 상품
        </motion.h2>

        <div className="w-full max-w-[1200px]">
          <Swiper
            modules={[Autoplay, Navigation, Pagination]}
            spaceBetween={20}
            slidesPerView={1.2}
            navigation
            pagination={{ clickable: true }}
            autoplay={{
              delay: 5000,
              disableOnInteraction: false,
            }}
            loop={true}
            breakpoints={{
              640: { slidesPerView: 2.2 },
              1024: { slidesPerView: 3.2 },
            }}
            className="pb-12"
          >
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <SwiperSlide key={i}>
                <motion.div
                  className="border border-gray-200 rounded-2xl shadow-md hover:shadow-xl overflow-hidden bg-gray-50 transition-transform hover:-translate-y-2"
                  whileHover={{ scale: 1.02 }}
                >
                  <img
                    src={
                      i === 1
                        ? "/clothes-sample2.png"
                        : i === 2
                        ? "/clothes-sample3.jpg"
                        : i === 3
                        ? "/gorani.jpg"
                        : "/clothes-sample2.png"
                    }
                    alt={`sample-${i}`}
                    className="w-full h-72 object-cover"
                  />
                  <div className="p-5">
                    <h3 className="font-semibold text-lg mb-1">추천 상품 {i}</h3>
                    <p className="text-sm text-gray-600 mb-4">
                      이 섹션의 부제목을 입력할 수 있습니다.
                    </p>
                    <div className="flex space-x-2">
                      <button className="px-3 py-1 bg-black text-white text-sm rounded hover:bg-gray-800 transition">
                        바로가기
                      </button>
                      <button className="px-3 py-1 bg-gray-800 text-white text-sm rounded hover:bg-gray-700 transition">
                        장바구니
                      </button>
                    </div>
                  </div>
                </motion.div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </section>

      {/* 🔸 브랜드 스토리 Section */}
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
