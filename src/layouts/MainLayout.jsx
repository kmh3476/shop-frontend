import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useEditMode } from "../context/EditModeContext";
import EditableText from "../components/EditableText";
import EditableImage from "../components/EditableImage";
import { useState, useEffect, useRef } from "react";

function MainLayout() {
  const { isEditMode, setIsEditMode } = useEditMode();
  const [isResizeMode, setIsResizeMode] = useState(false); // ✅ 새로 추가: 크기 조절 모드

  /** ✅ 카드 크기 조절 + 폰트 비율 동기화 Hook */
  const useResizableCard = (id, defaultWidth = 360, defaultHeight = 520) => {
    const [size, setSize] = useState(() => {
      const saved = localStorage.getItem(`card-size-${id}`);
      if (saved) return JSON.parse(saved);
      return { width: defaultWidth, height: defaultHeight };
    });
    const cardRef = useRef(null);
    const resizingRef = useRef(false);
    const startRef = useRef({ x: 0, y: 0, width: 0, height: 0 });

    useEffect(() => {
      const handleMouseMove = (e) => {
        if (!resizingRef.current || !cardRef.current) return;
        const dx = e.clientX - startRef.current.x;
        const dy = e.clientY - startRef.current.y;

        // ✅ Swiper 영역 초과 확대 가능 (최대 폭 제한 완화)
        const newWidth = Math.min(Math.max(240, startRef.current.width + dx), 900);
        const newHeight = Math.min(Math.max(320, startRef.current.height + dy), 900);

        setSize({ width: newWidth, height: newHeight });
      };
      const handleMouseUp = () => {
        if (resizingRef.current) {
          resizingRef.current = false;
          localStorage.setItem(`card-size-${id}`, JSON.stringify(size));
          document.body.style.userSelect = "auto";
        }
      };
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
      return () => {
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("mouseup", handleMouseUp);
      };
    }, [size, id]);

    const startResize = (e) => {
      e.stopPropagation();
      if (!isResizeMode) return; // ✅ 크기조절모드일 때만 실행
      resizingRef.current = true;
      startRef.current = {
        x: e.clientX,
        y: e.clientY,
        width: cardRef.current.offsetWidth,
        height: cardRef.current.offsetHeight,
      };
      document.body.style.userSelect = "none"; // 드래그 중 텍스트 선택 방지
    };

    return { size, cardRef, startResize };
  };

  /** ✅ 추천 상품 카드 */
  const FeaturedCard = ({ i }) => {
    const { size, cardRef, startResize } = useResizableCard(`featured-${i}`, 360, 520);
    const scale = size.width / 360;

    return (
      <motion.div
        ref={cardRef}
        className="border border-gray-200 rounded-3xl shadow-lg hover:shadow-2xl bg-white relative overflow-hidden transition-transform duration-300"
        style={{
          width: `${size.width}px`,
          height: `${size.height}px`,
          fontSize: `${scale * 1}rem`,
          transformOrigin: "top left",
          cursor: isResizeMode ? "se-resize" : "default",
        }}
      >
        <div className="w-full h-[60%] overflow-hidden relative">
          <EditableImage
            id={`featured-img-${i}`}
            defaultSrc={
              i % 3 === 1
                ? "/clothes-sample2.png"
                : i % 3 === 2
                ? "/clothes-sample3.jpg"
                : "/gorani.jpg"
            }
            alt={`sample-${i}`}
            filePath="src/layouts/MainLayout.jsx"
            componentName="FeaturedCard"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
        </div>

        <div
          className="p-6 flex flex-col justify-between h-[40%] font-['Pretendard']"
          style={{ transform: `scale(${scale})`, transformOrigin: "top left" }}
        >
          <div>
            <h3 className="font-bold text-3xl mb-3 text-gray-900 tracking-tight">
              <EditableText
                id={`featured-title-${i}`}
                defaultText={`추천 상품 ${i}`}
                apiUrl="http://localhost:1337/api/texts"
              />
            </h3>
            <p className="text-base text-gray-500 mb-4 leading-relaxed">
              <EditableText
                id={`featured-desc-${i}`}
                defaultText="감각적인 디자인으로 완성된 이번 시즌 베스트."
                apiUrl="http://localhost:1337/api/texts"
              />
            </p>
          </div>
          <div className="flex space-x-3">
            <button className="flex-1 py-3 bg-black text-white text-base font-semibold rounded-lg hover:bg-gray-800 transition">
              바로가기
            </button>
            <button className="flex-1 py-3 bg-gray-800 text-white text-base font-semibold rounded-lg hover:bg-gray-700 transition">
              장바구니
            </button>
          </div>
        </div>

        {isResizeMode && (
          <div
            onMouseDown={startResize}
            className="absolute bottom-1 right-1 w-5 h-5 bg-black/70 cursor-se-resize rounded-sm z-50"
            title="드래그로 카드 크기 조절"
          />
        )}
      </motion.div>
    );
  };

  /** ✅ 일반 상품 카드 */
  const ProductCard = ({ i }) => {
    const { size, cardRef, startResize } = useResizableCard(`product-${i}`, 300, 460);
    const scale = size.width / 300;

    return (
      <motion.div
        ref={cardRef}
        className="border border-gray-200 rounded-2xl shadow-sm hover:shadow-md bg-white relative overflow-hidden transition-transform duration-300"
        style={{
          width: `${size.width}px`,
          height: `${size.height}px`,
          fontSize: `${scale * 1}rem`,
          cursor: isResizeMode ? "se-resize" : "default",
        }}
      >
        <div className="overflow-hidden w-full h-[70%] mx-auto relative">
          <EditableImage
            id={`product-img-${i}`}
            defaultSrc={
              i % 3 === 1
                ? "/clothes-sample2.png"
                : i % 3 === 2
                ? "/clothes-sample3.jpg"
                : "/gorani.jpg"
            }
            alt={`sample-${i}`}
            filePath="src/layouts/MainLayout.jsx"
            componentName="ProductCard"
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        </div>
        <div
          className="p-5 text-center font-['Pretendard']"
          style={{ transform: `scale(${scale})`, transformOrigin: "top left" }}
        >
          <h3 className="font-semibold text-gray-800 text-lg mb-1">
            <EditableText
              id={`product-name-${i}`}
              defaultText={`상품명 ${i}`}
              apiUrl="http://localhost:1337/api/texts"
            />
          </h3>
          <p className="text-sm text-gray-500">
            <EditableText
              id={`product-tag-${i}`}
              defaultText="#데일리룩 #심플핏"
              apiUrl="http://localhost:1337/api/texts"
            />
          </p>
        </div>

        {isResizeMode && (
          <div
            onMouseDown={startResize}
            className="absolute bottom-1 right-1 w-4 h-4 bg-gray-700/70 cursor-se-resize rounded-sm z-50"
            title="드래그로 카드 크기 조절"
          />
        )}
      </motion.div>
    );
  };

  /** ✅ 슬라이드 섹션 */
  const SlideSection = ({ title, id }) => (
    <section className="w-full max-w-[1300px] mx-auto px-6 py-[10vh] bg-white text-black font-['Pretendard']">
      <motion.h2
        className="text-4xl md:text-5xl font-extrabold mb-10 drop-shadow-sm tracking-tight text-gray-900"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        viewport={{ once: true }}
      >
        <EditableText id={id} defaultText={title} apiUrl="http://localhost:1337/api/texts" />
      </motion.h2>

      <Swiper
        modules={[Navigation, Pagination]}
        spaceBetween={16}
        slidesPerView={2.2}
        navigation
        pagination={{ clickable: true }}
        centeredSlides={false}
        allowTouchMove={!isResizeMode} // ✅ 크기조절모드에서는 Swiper 드래그 비활성화
        breakpoints={{
          360: { slidesPerView: 2.2 },
          640: { slidesPerView: 3 },
          1024: { slidesPerView: 4 },
          1280: { slidesPerView: 5 },
        }}
        className="pb-12 swiper-backface-hidden"
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
    <div className="flex flex-col min-h-screen w-full text-white bg-white overflow-x-hidden font-['Pretendard']">
      {/* 🔸 디자인 모드 및 크기조절 모드 버튼 */}
      <div className="fixed top-6 left-6 z-50 flex gap-3">
        <button
          onClick={() => setIsEditMode(!isEditMode)}
          className={`px-5 py-2 rounded-lg text-white font-semibold shadow-lg transition ${
            isEditMode ? "bg-green-600 hover:bg-green-700" : "bg-gray-800 hover:bg-gray-900"
          }`}
        >
          {isEditMode ? "🖊 디자인 모드 ON" : "✏ 디자인 모드 OFF"}
        </button>

        <button
          onClick={() => setIsResizeMode(!isResizeMode)}
          className={`px-5 py-2 rounded-lg text-white font-semibold shadow-lg transition ${
            isResizeMode ? "bg-blue-600 hover:bg-blue-700" : "bg-gray-700 hover:bg-gray-800"
          }`}
        >
          {isResizeMode ? "📐 크기 조절 ON" : "📏 크기 조절 OFF"}
        </button>
      </div>

      {/* 🔸 메인 배경 */}
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
        <div className="relative z-10 mt-[20vh]">
          <EditableImage
            id="main-background-img"
            defaultSrc="/woodcard.jpg"
            alt="메인 배경"
            filePath="src/layouts/MainLayout.jsx"
            componentName="MainBackground"
          />
        </div>
      </section>

      {/* 🔸 추천 상품 섹션 */}
      <section className="flex flex-col items-center justify-center py-[10vh] px-6 bg-white text-black relative -mt-[20vh] md:-mt-[25vh] rounded-t-[2rem] shadow-[0_-10px_30px_rgba(0,0,0,0.08)]">
        <motion.h2
          className="text-5xl md:text-6xl font-extrabold mb-12 drop-shadow-sm tracking-tight text-gray-600"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          viewport={{ once: true }}
        >
          <EditableText
            id="featured-section-title"
            defaultText="🥝 추천 상품"
            apiUrl="http://localhost:1337/api/texts"
          />
        </motion.h2>

        <div className="w-full max-w-[1200px]">
          <Swiper
            modules={[Autoplay, Navigation, Pagination]}
            spaceBetween={24}
            slidesPerView={1.2}
            navigation
            pagination={{ clickable: true }}
            autoplay={{ delay: 4500, disableOnInteraction: false }}
            allowTouchMove={!isResizeMode} // ✅ 크기조절모드일 때 swiper 드래그 중지
            loop
            className="pb-12 swiper-initialized swiper-horizontal swiper-backface-hidden"
          >
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <SwiperSlide key={i}>
                <FeaturedCard i={i} />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </section>

      <SlideSection id="top-section" title="👕 상의" />
      <SlideSection id="bottom-section" title="👖 하의" />
      <SlideSection id="coordi-section" title="🧥 코디 추천" />

      <section
        className="flex flex-col items-center justify-center py-[15vh] px-6 text-center bg-gray-100 font-['Pretendard']"
        style={{
          backgroundImage: "url('/texture.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <motion.h2
          className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6 tracking-tight"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <EditableText
            id="brand-title"
            defaultText="브랜드 스토리"
            apiUrl="http://localhost:1337/api/texts"
          />
        </motion.h2>
        <motion.p
          className="max-w-[700px] text-gray-700 leading-relaxed text-lg md:text-xl font-light"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.8 }}
        >
          <EditableText
            id="brand-description"
            defaultText={`ONYOU는 심플하지만 감각적인 디자인을 통해 일상 속의 편안함을 추구합니다.
자연, 색감, 질감에서 영감을 받아 제작된 제품들은 당신의 일상을 새롭게 만듭니다.`}
            apiUrl="http://localhost:1337/api/texts"
          />
        </motion.p>
      </section>

      <footer className="py-6 text-black text-sm border-t border-gray-300 w-full text-center bg-white font-light tracking-tight">
        © 2025 ONYOU — All rights reserved.
      </footer>
    </div>
  );
}

export default MainLayout;
