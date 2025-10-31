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
import axios from "axios"; // ✅ 상품 데이터 연동용 추가

function MainLayout() {
  const { isEditMode, setIsEditMode, isResizeMode, setIsResizeMode } = useEditMode();
  const { user } = useAuth();

  /** ✅ 상품 데이터 상태 */
  const [featuredProducts, setFeaturedProducts] = useState([]); // 추천 상품
  const [allProducts, setAllProducts] = useState([]); // 전체 상품

  /** ✅ 상품 데이터 불러오기 */
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL || "https://shop-backend-1-dfsl.onrender.com";
        const response = await axios.get(`${apiUrl}/api/products`);
        if (Array.isArray(response.data)) {
          setAllProducts(response.data);
          setFeaturedProducts(response.data.slice(0, 8)); // 앞 8개는 추천상품
        } else {
          console.warn("⚠ 상품 데이터 형식이 배열이 아닙니다:", response.data);
        }
      } catch (error) {
        console.error("❌ 상품 데이터를 불러오지 못했습니다:", error);
      }
    };
    fetchProducts();
  }, []);

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

    const sizeRef = useRef(size);
    const cardRef = useRef(null);
    const resizingRef = useRef(false);
    const startRef = useRef({ x: 0, y: 0, width: 0, height: 0 });

    useEffect(() => {
      sizeRef.current = size;
    }, [size]);

    useEffect(() => {
      let frameId = null;

      const handleMouseMove = (e) => {
        if (!resizingRef.current || !cardRef.current || !isResizeMode) return;

        const dx = e.clientX - startRef.current.x;
        const dy = e.clientY - startRef.current.y;

        const newWidth = Math.max(100, startRef.current.width + dx);
        const newHeight = Math.max(100, startRef.current.height + dy);

        if (!frameId) {
          frameId = requestAnimationFrame(() => {
            setSize({ width: newWidth, height: newHeight });
            frameId = null;
          });
        }
      };

      const handleMouseUp = () => {
        if (!resizingRef.current) return;
        resizingRef.current = false;

        document.body.style.userSelect = "auto";
        document.body.style.cursor = "auto";

        localStorage.setItem(`card-size-${id}`, JSON.stringify(sizeRef.current));
      };

      if (isResizeMode) {
        window.addEventListener("mousemove", handleMouseMove, { passive: true });
        window.addEventListener("mouseup", handleMouseUp);
      }

      return () => {
        if (frameId) cancelAnimationFrame(frameId);
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("mouseup", handleMouseUp);
        resizingRef.current = false;
        document.body.style.userSelect = "auto";
        document.body.style.cursor = "auto";
      };
    }, [isResizeMode, id]);
    /** ✅ 오른쪽 클릭으로 크기조절 시작 */
    const startResize = (e) => {
      if (!isResizeMode) return;
      if (e.button !== 2) return;
      e.preventDefault();
      e.stopPropagation();

      resizingRef.current = true;
      startRef.current = {
        x: e.clientX,
        y: e.clientY,
        width: cardRef.current?.offsetWidth || 0,
        height: cardRef.current?.offsetHeight || 0,
      };

      document.body.style.userSelect = "none";
      document.body.style.cursor = "se-resize";
    };

    /** ✅ 우클릭 메뉴 차단 */
    useEffect(() => {
      const el = cardRef.current;
      if (!el) return;
      const preventContextMenu = (e) => {
        if (isResizeMode) e.preventDefault();
      };
      el.addEventListener("contextmenu", preventContextMenu);
      return () => el.removeEventListener("contextmenu", preventContextMenu);
    }, [isResizeMode]);

    return { size, cardRef, startResize };
  };

  /** ✅ 추천 상품 카드 */
  const FeaturedCard = ({ product }) => {
    const { size, cardRef, startResize } = useResizableCard(
      `featured-${product._id || product.name}`,
      360,
      520
    );
    const scale = size.width / 360;
    const isLocked = isEditMode;

    return (
      <motion.div
        ref={cardRef}
        onMouseDown={startResize}
        className={`rounded-3xl shadow-lg bg-white relative overflow-hidden transition-transform duration-300 ${
          isResizeMode
            ? "border-2 border-dashed border-blue-400"
            : "border border-gray-200 hover:shadow-2xl"
        } ${isLocked ? "pointer-events-none" : ""}`}
        style={{
          width: `${size.width}px`,
          height: `${size.height}px`,
          fontSize: `${scale * 1}rem`,
          transformOrigin: "top left",
          cursor: isResizeMode ? "se-resize" : "default",
          userSelect: "none",
        }}
      >
        <div className="w-full h-[60%] overflow-hidden relative select-none">
          <EditableImage
            id={`featured-img-${product._id || product.name}`}
            defaultSrc={product.mainImage || "/gorani.jpg"}
            alt={product.name}
            filePath="src/layouts/MainLayout.jsx"
            componentName="FeaturedCard"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              pointerEvents: "none",
            }}
          />
        </div>

        <div
          className="p-6 flex flex-col justify-between h-[40%] font-['Pretendard'] select-none"
          style={{ transform: `scale(${scale})`, transformOrigin: "top left" }}
        >
          <div>
            <h3 className="font-bold text-3xl mb-3 text-gray-900 tracking-tight">
              {product.name}
            </h3>
            <p className="text-base text-gray-500 mb-4 leading-relaxed">
              {product.description || "감각적인 디자인으로 완성된 이번 시즌 베스트."}
            </p>
          </div>

          <div className="flex space-x-3">
            <button
              disabled={isLocked}
              className={`flex-1 py-3 rounded-lg text-base font-semibold transition ${
                isLocked
                  ? "bg-gray-400 text-white cursor-not-allowed"
                  : "bg-black text-white hover:bg-gray-800"
              }`}
            >
              바로가기
            </button>
            <button
              disabled={isLocked}
              className={`flex-1 py-3 rounded-lg text-base font-semibold transition ${
                isLocked
                  ? "bg-gray-400 text-white cursor-not-allowed"
                  : "bg-gray-800 text-white hover:bg-gray-700"
              }`}
            >
              장바구니
            </button>
          </div>
        </div>
      </motion.div>
    );
  };

  /** ✅ 일반 상품 카드 */
  const ProductCard = ({ product }) => {
    const { size, cardRef, startResize } = useResizableCard(
      `product-${product._id || product.name}`,
      300,
      460
    );
    const scale = size.width / 300;
    const isLocked = isEditMode;

    return (
      <motion.div
        ref={cardRef}
        onMouseDown={startResize}
        className={`rounded-2xl shadow-sm bg-white relative overflow-hidden transition-transform duration-300 ${
          isResizeMode
            ? "border-2 border-dashed border-blue-400"
            : "border border-gray-200 hover:shadow-md"
        } ${isLocked ? "pointer-events-none" : ""}`}
        style={{
          width: `${size.width}px`,
          height: `${size.height}px`,
          fontSize: `${scale * 1}rem`,
          cursor: isResizeMode ? "se-resize" : "default",
          userSelect: "none",
        }}
      >
        <div className="overflow-hidden w-full h-[70%] mx-auto relative select-none">
          <EditableImage
            id={`product-img-${product._id || product.name}`}
            defaultSrc={product.mainImage || "/gorani.jpg"}
            alt={product.name}
            filePath="src/layouts/MainLayout.jsx"
            componentName="ProductCard"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              pointerEvents: "none",
            }}
          />
        </div>

        <div
          className="p-5 text-center font-['Pretendard'] select-none"
          style={{ transform: `scale(${scale})`, transformOrigin: "top left" }}
        >
          <h3 className="font-semibold text-gray-800 text-lg mb-1">
            {product.name}
          </h3>
          <p className="text-sm text-gray-500">
            {product.price ? `${product.price.toLocaleString()}원` : "#데일리룩"}
          </p>
        </div>
      </motion.div>
    );
  };

  /** ✅ 추천상품 Swiper */
  const FeaturedSwiper = () => (
    <Swiper
      modules={[Autoplay, Navigation, Pagination]}
      spaceBetween={10}
      slidesPerView={2.8}
      navigation={!isEditMode && !isResizeMode}
      pagination={!isEditMode && !isResizeMode ? { clickable: true } : false}
      autoplay={
        isResizeMode || isEditMode
          ? false
          : { delay: 4500, disableOnInteraction: false }
      }
      allowTouchMove={!isEditMode && !isResizeMode}
      simulateTouch={!isEditMode && !isResizeMode}
      draggable={!isEditMode && !isResizeMode}
      loop
      className="pb-12 swiper-horizontal swiper-backface-hidden"
    >
      {featuredProducts.length > 0 ? (
        featuredProducts.map((product) => (
          <SwiperSlide key={product._id || product.name}>
            <FeaturedCard product={product} />
          </SwiperSlide>
        ))
      ) : (
        <p className="text-gray-500 text-center w-full py-10">
          상품이 없습니다.
        </p>
      )}
    </Swiper>
  );
  /** ✅ 상품 섹션 */
  const SlideSection = ({ title, id, filter }) => {
    const filteredProducts = allProducts.filter((p) =>
      filter ? filter(p) : true
    );

    return (
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
          spaceBetween={10}
          slidesPerView={3.5}
          navigation={!isEditMode && !isResizeMode}
          pagination={!isEditMode && !isResizeMode ? { clickable: true } : false}
          allowTouchMove={!isEditMode && !isResizeMode}
          simulateTouch={!isEditMode && !isResizeMode}
          draggable={!isEditMode && !isResizeMode}
          loop
          className="pb-12 swiper-backface-hidden"
        >
          {filteredProducts.length > 0 ? (
            filteredProducts.map((product) => (
              <SwiperSlide key={product._id || product.name}>
                <ProductCard product={product} />
              </SwiperSlide>
            ))
          ) : (
            <p className="text-gray-500 text-center w-full py-10">
              상품이 없습니다.
            </p>
          )}
        </Swiper>
      </section>
    );
  };

  return (
    <div className="flex flex-col min-h-screen w-full text-white bg-white overflow-x-hidden font-['Pretendard']">
      {/* 관리자 모드 버튼 */}
      {user?.isAdmin && (
        <div className="fixed top-6 left-6 z-[9999] flex gap-3 items-center">
          <button
            onClick={toggleEditMode}
            className={`px-5 py-2 rounded-lg text-white font-semibold shadow-md transition-colors duration-200 ${
              isEditMode ? "bg-green-600" : "bg-gray-800"
            }`}
          >
            {isEditMode ? "🖊 디자인 모드 ON" : "✏ 디자인 모드 OFF"}
          </button>
          <button
            onClick={toggleResizeMode}
            className={`px-5 py-2 rounded-lg text-white font-semibold shadow-md transition-colors duration-200 ${
              isResizeMode ? "bg-blue-600" : "bg-gray-700"
            }`}
          >
            {isResizeMode ? "📐 크기 조절 ON" : "📏 크기 조절 OFF"}
          </button>
        </div>
      )}

      {/* 메인 배경 */}
      <section
        className="relative flex flex-col items-center justify-center w-full min-h-[110vh]"
        style={{
          backgroundImage: "url('/woodcard.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      ></section>

      {/* 추천상품 */}
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
            defaultText="추천 상품"
            apiUrl="http://localhost:1337/api/texts"
          />
        </motion.h2>
        <div className="w-full max-w-[1200px]">
          <FeaturedSwiper />
        </div>
      </section>

      {/* 상품 섹션 */}
      <SlideSection
        id="top-section"
        title="상의"
        filter={(p) => p.categoryPage?.label === "상의"}
      />
      <SlideSection
        id="bottom-section"
        title="하의"
        filter={(p) => p.categoryPage?.label === "하의"}
      />
      <SlideSection
        id="coordi-section"
        title="코디 추천"
        filter={(p) => p.categoryPage?.label === "코디 추천"}
      />

      {/* 브랜드 스토리 */}
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

      {/* 푸터 */}
      <footer className="py-6 text-black text-sm border-t border-gray-300 w-full text-center bg-white font-light tracking-tight">
        © 2025 ONYOU — All rights reserved.
      </footer>
    </div>
  );
}

export default MainLayout;
