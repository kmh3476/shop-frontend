import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { motion } from "framer-motion";
import { useEditMode } from "../context/EditModeContext";
import EditableText from "../components/EditableText";
import EditableImage from "../components/EditableImage";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";

function MainLayout() {
  const { isEditMode, setIsEditMode, isResizeMode, setIsResizeMode } = useEditMode();
  const { user } = useAuth();

  /** ✅ 관리자 전용 토글 */
  const toggleEditMode = () => {
    if (!user?.isAdmin) {
      alert("⚠ 관리자만 디자인 모드를 사용할 수 있습니다.");
      return;
    }
    setIsEditMode(!isEditMode);
  };

  const toggleResizeMode = () => {
    if (!user?.isAdmin) {
      alert("⚠ 관리자만 크기 조절 모드를 사용할 수 있습니다.");
      return;
    }
    setIsResizeMode(!isResizeMode);
  };

  /** ✅ 카드 크기 조절 Hook */
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
        if (!resizingRef.current || !cardRef.current || !isResizeMode) return;
        const dx = e.clientX - startRef.current.x;
        const dy = e.clientY - startRef.current.y;
        const newWidth = Math.min(Math.max(240, startRef.current.width + dx), 900);
        const newHeight = Math.min(Math.max(320, startRef.current.height + dy), 900);
        setSize({ width: newWidth, height: newHeight });
      };

      const handleMouseUp = () => {
        if (resizingRef.current) {
          resizingRef.current = false;
          document.body.style.userSelect = "auto";
          localStorage.setItem(`card-size-${id}`, JSON.stringify(size));
        }
      };

      if (isResizeMode) {
        window.addEventListener("mousemove", handleMouseMove);
        window.addEventListener("mouseup", handleMouseUp);
      }

      return () => {
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("mouseup", handleMouseUp);
        resizingRef.current = false;
        document.body.style.userSelect = "auto";
      };
    }, [size, id, isResizeMode]);

    const startResize = (e) => {
      e.stopPropagation();
      if (!isResizeMode) return;
      resizingRef.current = true;
      startRef.current = {
        x: e.clientX,
        y: e.clientY,
        width: cardRef.current.offsetWidth,
        height: cardRef.current.offsetHeight,
      };
      document.body.style.userSelect = "none";
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
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
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

        {isResizeMode && user?.isAdmin && (
          <div
            onMouseDown={startResize}
            className="absolute bottom-1 right-1 w-5 h-5 bg-black/70 cursor-se-resize rounded-sm z-50 transition-transform duration-200 hover:scale-125"
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

        {isResizeMode && user?.isAdmin && (
          <div
            onMouseDown={startResize}
            className="absolute bottom-1 right-1 w-4 h-4 bg-gray-700/70 cursor-se-resize rounded-sm z-50 transition-transform duration-200 hover:scale-125"
            title="드래그로 카드 크기 조절"
          />
        )}
      </motion.div>
    );
  };

  /** ✅ 섹션 */
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
        spaceBetween={5}
        slidesPerView={4}
        navigation
        pagination={{ clickable: true }}
        allowTouchMove={!isResizeMode}
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
      {/* ✅ 관리자 전용 디자인/크기조절 모드 버튼 */}
      {user?.isAdmin && (
        <div className="fixed top-6 left-6 z-[9999] flex gap-3 items-center">
          {/* 디자인 모드 */}
          <button
            onClick={toggleEditMode}
            className={`px-5 py-2 rounded-lg text-white font-semibold shadow-md 
              transition-all duration-200 ease-out 
              focus:outline-none focus:ring-0
              ${
                isEditMode
                  ? "bg-green-600 hover:bg-green-700 active:scale-[0.98]"
                  : "bg-gray-800 hover:bg-gray-900 active:scale-[0.98]"
              }`}
            style={{
              transformOrigin: "center",
              boxShadow: isEditMode
                ? "0 0 0 2px rgba(34,197,94,0.4)"
                : "0 0 0 1px rgba(0,0,0,0.2)",
            }}
          >
            {isEditMode ? "🖊 디자인 모드 ON" : "✏ 디자인 모드 OFF"}
          </button>

          {/* 크기 조절 */}
          <button
            onClick={toggleResizeMode}
            className={`px-5 py-2 rounded-lg text-white font-semibold shadow-md 
              transition-all duration-200 ease-out 
              focus:outline-none focus:ring-0
              ${
                isResizeMode
                  ? "bg-blue-600 hover:bg-blue-700 active:scale-[0.98]"
                  : "bg-gray-700 hover:bg-gray-800 active:scale-[0.98]"
              }`}
            style={{
              transformOrigin: "center",
              boxShadow: isResizeMode
                ? "0 0 0 2px rgba(37,99,235,0.4)"
                : "0 0 0 1px rgba(0,0,0,0.2)",
            }}
          >
            {isResizeMode ? "📐 크기 조절 ON" : "📏 크기 조절 OFF"}
          </button>
        </div>
      )}

      {/* 🔸 나머지 메인 섹션 */}
      <section
        className="relative flex flex-col items-center justify-center w-full min-h-[110vh]"
        style={{
          backgroundImage: "url('/woodcard.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />
      {/* 이하 동일 */}
    </div>
  );
}

export default MainLayout;
