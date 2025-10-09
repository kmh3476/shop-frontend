import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { motion } from "framer-motion";

function MainLayout() {
  // ✅ 추천상품 전용 카드 (크게)
  const FeaturedCard = ({ i }) => (
    <motion.div
      className="border border-gray-200 rounded-3xl shadow-lg hover:shadow-2xl overflow-hidden bg-white transition-transform duration-300 hover:-translate-y-2 hover:scale-[1.05]"
      whileHover={{ scale: 1.05 }}
    >
      <div className="w-full h-[520px] overflow-hidden">
        <img
          src={
            i % 3 === 1
              ? "/clothes-sample2.png"
              : i % 3 === 2
              ? "/clothes-sample3.jpg"
              : "/gorani.jpg"
          }
          alt={`sample-${i}`}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="p-6 flex flex-col justify-between h-[240px]">
        <div>
          <h3 className="font-semibold text-2xl mb-2 text-gray-800">
            추천 상품 {i}
          </h3>
          <p className="text-sm text-gray-500 mb-4">
            감각적인 디자인으로 완성된 이번 시즌 베스트.
          </p>
        </div>
        <div className="flex space-x-3">
          <button className="flex-1 py-3 bg-black text-white text-sm rounded-lg hover:bg-gray-800 transition">
            바로가기
          </button>
          <button className="flex-1 py-3 bg-gray-800 text-white text-sm rounded-lg hover:bg-gray-700 transition">
            장바구니
          </button>
        </div>
      </div>
    </motion.div>
  );

  // ✅ 일반 카드
  const ProductCard = ({ i }) => (
    <motion.div
      className="border border-gray-100 rounded-2xl shadow-sm hover:shadow-md overflow-hidden bg-white transition-transform duration-300 hover:-translate-y-1 hover:scale-[1.02]"
      whileHover={{ scale: 1.02 }}
    >
      <div className="w-full h-[220px] overflow-hidden">
        <img
          src={
            i % 3 === 1
              ? "/clothes-sample2.png"
              : i % 3 === 2
              ? "/clothes-sample3.jpg"
              : "/gorani.jpg"
          }
          alt={`sample-${i}`}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="p-3">
        <h3 className="font-medium text-sm mb-1 text-gray-800">상품명 {i}</h3>
        <p className="text-xs text-gray-500">모던한 감각의 아이템</p>
      </div>
    </motion.div>
  );

  // ✅ 베스트 상품 (상의, 하의, 자켓이 가로로 나열)
  const BestSection = () => {
    const categories = ["상의", "하의", "자켓"];

    return (
      <section className="w-full max-w-[1300px] mx-auto px-6 py-[12vh] bg-white text-black">
        <motion.h2
          className="text-3xl font-bold mb-12 text-center drop-shadow-sm"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          viewport={{ once: true }}
        >
          🌟 베스트 상품
        </motion.h2>

        {/* ✅ 상의/하의/자켓을 가로로 배치 */}
        <div className="overflow-x-auto scrollbar-hide">
          <div className="flex gap-8 min-w-[1100px]">
            {categories.map((cat, idx) => (
              <div
                key={idx}
                className="flex-shrink-0 w-[300px] sm:w-[340px] md:w-[380px]"
              >
                <h3 className="text-2xl font-semibold mb-5 text-gray-800 text-center">
                  {cat}
                </h3>

                {/* 각 카테고리 안의 상품 3개 */}
                <div className="flex flex-col gap-6">
                  {[1, 2, 3].map((i) => (
                    <ProductCard key={i} i={i + idx * 3} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  };

  // ✅ 일반 슬라이드 섹션
  const SlideSection = ({ title }) => (
    <section className="w-full max-w-[1300px] mx-auto px-6 py-[10vh] bg-white text-black">
      <motion.h2
        className="text-2xl font-bold mb-8 drop-shadow-sm"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        viewport={{ once: true }}
      >
        {title}
      </motion.h2>

      <Swiper
        modules={[Navigation, Pagination]}
        spaceBetween={20}
        slidesPerView={2.2}
        navigation
        pagination={{ clickable: true }}
        loop={false}
        breakpoints={{
          640: { slidesPerView: 3 },
          1024: { slidesPerView: 5 },
        }}
        className="pb-12"
      >
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <SwiperSlide key={i}>
            <ProductCard i={i} />
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );

  return (
    <div className="flex flex-col min-h-screen w-full text-white bg-white overflow-x-hidden">
      {/* 🔸 배경 */}
      <section
        className="relative flex flex-col items-center justify-center w-full min-h-[110vh]"
        style={{
          backgroundImage: "url('/woodcard.jpg')",
          backgroundSize: "cover",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-black/10" />
      </section>

      {/* 🔸 추천 상품 */}
      <section className="flex flex-col items-center justify-center py-[10vh] px-6 bg-white text-black relative -mt-[20vh] md:-mt-[25vh] rounded-t-[2rem] shadow-[0_-10px_30px_rgba(0,0,0,0.08)] transition-all duration-500">
        <motion.h2
          className="text-4xl font-bold mb-10 drop-shadow-sm"
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
            spaceBetween={40}
            slidesPerView={1.1}
            navigation
            pagination={{ clickable: true }}
            autoplay={{
              delay: 4500,
              disableOnInteraction: false,
            }}
            loop={true}
            breakpoints={{
              640: { slidesPerView: 1.8 },
              1024: { slidesPerView: 3 },
            }}
            className="pb-12"
          >
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <SwiperSlide key={i}>
                <FeaturedCard i={i} />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </section>

      {/* 🔸 일반 상품 섹션 */}
      <SlideSection title="👕 상의" />
      <SlideSection title="👖 하의" />
      <SlideSection title="🧥 코디 추천" />

      {/* 🔸 베스트 상품 (가로로 구성된 3개 세트) */}
      <BestSection />

      {/* 🔸 브랜드 스토리 */}
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
          자연, 색감, 질감에서 영감을 받아 제작된 제품들은 당신의 일상을 새롭게 만듭니다.
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
