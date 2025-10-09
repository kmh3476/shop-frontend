import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { motion } from "framer-motion";

function MainLayout() {
  // 🔸 상품 카드 (공용)
  const ProductCard = ({ i }) => (
    <motion.div
      className="border border-gray-200 rounded-2xl shadow-md hover:shadow-xl overflow-hidden bg-white transition-transform duration-300 hover:-translate-y-2 hover:scale-[1.02]"
      whileHover={{ scale: 1.02 }}
    >
      <div className="w-full h-80 overflow-hidden">
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
      <div className="p-5 flex flex-col justify-between h-[180px]">
        <div>
          <h3 className="font-semibold text-lg mb-1 text-gray-800">상품명 {i}</h3>
          <p className="text-sm text-gray-500 mb-4">
            자연스러움과 감각을 담은 상품입니다.
          </p>
        </div>
        <div className="flex space-x-2">
          <button className="flex-1 py-2 bg-black text-white text-sm rounded hover:bg-gray-800 transition">
            바로가기
          </button>
          <button className="flex-1 py-2 bg-gray-800 text-white text-sm rounded hover:bg-gray-700 transition">
            장바구니
          </button>
        </div>
      </div>
    </motion.div>
  );

  // 🔸 슬라이드 섹션 (공용 — 자동 슬라이드 없음)
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
        slidesPerView={1.2}
        navigation
        pagination={{ clickable: true }}
        loop={false}
        breakpoints={{
          640: { slidesPerView: 2.2 },
          1024: { slidesPerView: 4 },
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
      {/* 🔸 Hero Section */}
      <section
        className="relative flex flex-col items-center justify-center w-full min-h-[110vh]"
        style={{
          backgroundImage: "url('/woodcard.jpg')",
          backgroundSize: "cover",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center",
          backgroundAttachment: "scroll",
        }}
      >
        <div className="absolute inset-0 bg-black/10" />
      </section>

      {/* 🔸 추천상품 (자동 슬라이드 유지) */}
      <section className="flex flex-col items-center justify-center py-[8vh] px-6 bg-white text-black relative -mt-[20vh] md:-mt-[25vh] rounded-t-[2rem] shadow-[0_-10px_30px_rgba(0,0,0,0.08)] transition-all duration-500">
        <motion.h2
          className="text-3xl font-bold mb-8 drop-shadow-sm"
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
                <ProductCard i={i} />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </section>

      {/* 🔸 추가 섹션 (자동 슬라이드 없음) */}
      <SlideSection title="🌿 NEW ITEM" />
      <SlideSection title="👕 상의" />
      <SlideSection title="👖 하의" />
      <SlideSection title="🧥 코디 추천" />
      <SlideSection title="🍂 이달의 계절 룩" />

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
