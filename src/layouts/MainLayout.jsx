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
import { ShoppingCartOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useTranslation } from "react-i18next"; // ✅ 추가

function MainLayout() {
  const isMobile = window.innerWidth <= 480;
  const { isEditMode, setIsEditMode, isResizeMode, setIsResizeMode } =
    useEditMode();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation(); // ✅ 추가

  /** ✅ 상품 데이터 상태 */
  const [allProducts, setAllProducts] = useState([]);

  /** ✅ 상품 데이터 불러오기 */
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const apiUrl =
          import.meta.env.VITE_API_URL ||
          "https://shop-backend-1-dfsl.onrender.com";
        const response = await axios.get(`${apiUrl}/api/products`);
        if (Array.isArray(response.data)) {
          setAllProducts(response.data);
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
      alert(t("main.adminOnlyDesign")); // ✅ 번역 적용
      return;
    }
    setIsEditMode(!isEditMode);
  };

  const toggleResizeMode = () => {
    if (!user?.isAdmin) {
      alert(t("main.adminOnlyResize")); // ✅ 번역 적용
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

  /** ✅ 장바구니 추가 (localStorage 기반) */
  const handleAddToCartGlobal = (product, e) => {
    e.stopPropagation();
    try {
      const saved = JSON.parse(localStorage.getItem("cart")) || [];
      const exists = saved.find((item) => item._id === product._id);

      if (exists) {
        exists.quantity = (exists.quantity || 1) + 1;
      } else {
        saved.push({ ...product, quantity: 1 });
      }

      localStorage.setItem("cart", JSON.stringify(saved));
      alert(t("main.addedToCart", { name: product.name })); // ✅ 번역 적용
    } catch (err) {
      console.error("❌ 장바구니 추가 실패:", err);
      alert(t("main.addToCartError")); // ✅ 번역 적용
    }
  };
  /** ✅ 추천 상품 카드 */
  const FeaturedCard = ({ product }) => {
    const { size, cardRef, startResize } = useResizableCard(
      `featured-${product._id || product.name}`,
      360,
      520
    );
    const scale = isMobile ? (size.width / 360) : 1;
    const isLocked = isEditMode;

    const handleCardClick = () => {
      if (!isResizeMode && !isEditMode) {
        navigate(`/products/${product._id}`);
      }
    };

    return (
      <motion.div
        ref={cardRef}
        onMouseDown={startResize}
        onClick={handleCardClick}
        className={`rounded-3xl shadow-lg bg-white relative overflow-hidden transition-transform duration-300 ${
          isResizeMode
            ? "border-2 border-dashed border-blue-400"
            : "border border-gray-200 hover:shadow-2xl"
        } ${isLocked ? "pointer-events-none" : ""}`}
        style={{
  width: isMobile ? `${size.width * 0.45}px` : `${size.width}px`,
height: "auto",
aspectRatio: `${size.width / size.height}`,

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
  className="px-5 py-4 flex flex-col h-[45%] text-left font-['Pretendard'] select-none"
  style={{
    transform: `scale(${scale})`,
    transformOrigin: "top left",
  }}
>
  {/* 상품명 */}
   <h3
    className={`font-bold text-gray-900 tracking-tight mb-2 ${
      isMobile ? "text-xl" : "text-3xl"
    }`}
  >
    {product.name}
  </h3>

  {/* 상품 가격 — 검정색 */}
  <p
    className={`font-semibold text-gray-900 ${
      isMobile ? "text-base" : "text-xl"
    }`}
  >
    {product.price?.toLocaleString()}
    {t("main.won")}
  </p>
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
    const scale = isMobile ? (size.width / 300) : 1;
    const isLocked = isEditMode;

    const handleCardClick = () => {
      if (!isResizeMode && !isEditMode) {
        navigate(`/products/${product._id}`);
      }
    };

    return (
      <motion.div
        ref={cardRef}
        onMouseDown={startResize}
        onClick={handleCardClick}
        className={`rounded-2xl shadow-sm bg-white relative overflow-hidden transition-transform duration-300 ${
          isResizeMode
            ? "border-2 border-dashed border-blue-400"
            : "border border-gray-200 hover:shadow-md"
        } ${isLocked ? "pointer-events-none" : ""}`}
        style={{
          width: isMobile ? `${size.width * 0.4}px` : `${size.width}px`,
height: isMobile ? `${size.height * 0.48}px` : `${size.height}px`,
fontSize: `${scale * (isMobile ? 0.75 : 1)}rem`,

          cursor: isResizeMode ? "se-resize" : "pointer",
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
  className="px-3 py-2 font-['Pretendard'] flex flex-col h-[30%] text-left"
  style={{ transform: `scale(${scale})`, transformOrigin: "top left" }}
>
  {/* 상품명 */}
 <h3
  className={`font-semibold text-gray-800 mb-1 ${
    isMobile ? "text-sm" : "text-xl"
  }`}
>
  {product.name}
</h3>

<p
  className={`text-gray-500 ${
    isMobile ? "text-xs" : "text-base"
  }`}
>
  {product.price
    ? `${product.price.toLocaleString()}${t("main.won")}`
    : t("main.defaultTag")}
</p>

</div>

      </motion.div>
    );
  };

  /** ✅ 공용 상품 슬라이드 섹션 */
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
          transition={{ duration: 0.8, ease: 'easeOut' }}
          viewport={{ once: true }}
        >
         <EditableText
  id={id}
  defaultText={title}
  apiUrl={`${import.meta.env.VITE_API_URL}/api/texts`}
/>

        </motion.h2>

        <Swiper
          modules={[Navigation, Pagination]}
          spaceBetween={10}
          slidesPerView={
  window.innerWidth <= 480
    ? 2.2
    : window.innerWidth <= 1024
    ? 2.5
    : 3.5
}

          navigation={!isEditMode && !isResizeMode}
          pagination={!isEditMode && !isResizeMode ? { clickable: true } : false}
          allowTouchMove={!isEditMode && !isResizeMode}
          simulateTouch={!isEditMode && !isResizeMode}
          draggable={!isEditMode && !isResizeMode}
          loop={filteredProducts.length > 1}
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
              {t("main.noProducts")}
            </p>
          )}
        </Swiper>
      </section>
    );
  };
 /** ✅ 추천상품 전용 Swiper */
const FeaturedSwiper = () => {
  const featured = allProducts.filter((p) => p.categoryKey === "featured");

  return (
    <Swiper
      modules={[Autoplay, Navigation, Pagination]}
      spaceBetween={10}
      slidesPerView={
  window.innerWidth <= 480
    ? 2
    : window.innerWidth <= 1024
    ? 2.8
    : 3.2
}

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
      loop={featured.length > 1}
      className="pb-12 swiper-horizontal swiper-backface-hidden"
    >
      {featured.length > 0 ? (
        featured.map((product) => (
          <SwiperSlide key={product._id || product.name}>
            <FeaturedCard product={product} />
          </SwiperSlide>
        ))
      ) : (
        <p className="text-gray-500 text-center w-full py-10">
          {t("main.noFeatured")}
        </p>
      )}
    </Swiper>
  );
};

  /** ✅ blob URL 정리 */
  useEffect(() => {
    return () => {
      allProducts.forEach((p) => {
        if (Array.isArray(p.images)) {
          p.images.forEach((img) => {
            if (typeof img === "string" && img.startsWith("blob:")) {
              URL.revokeObjectURL(img);
            }
          });
        }
      });
    };
  }, [allProducts]);

  /** ✅ 메인 구조 */
  return (
    <div className="flex flex-col min-h-screen w-full text-white bg-white overflow-x-hidden font-['Pretendard']">
      {/* ✅ 관리자 모드 버튼 */}
      {user?.isAdmin && (
        <div className="fixed top-6 left-6 z-[9999] flex gap-3 items-center">
          <button
            onClick={toggleEditMode}
            className={`px-5 py-2 rounded-lg text-white font-semibold shadow-md transition-colors duration-200 ${
              isEditMode ? "bg-green-600" : "bg-gray-800"
            }`}
          >
            {isEditMode ? t("main.designOn") : t("main.designOff")}
          </button>
          <button
            onClick={toggleResizeMode}
            className={`px-5 py-2 rounded-lg text-white font-semibold shadow-md transition-colors duration-200 ${
              isResizeMode ? "bg-blue-600" : "bg-gray-700"
            }`}
          >
            {isResizeMode ? t("main.resizeOn") : t("main.resizeOff")}
          </button>
        </div>
      )}

      {/* ✅ 메인 비주얼 영역 */}
      <section
  className="
    relative 
    w-full 
    min-h-[100vh]
    bg-cover
    bg-[40%_199%]              // PC
    max-[480px]:bg-[55%_-120px]  // Mobile: 위로 더 올림
  "
  style={{
    backgroundImage: "url('/woodcard.jpg')",
  }}
>
</section>



      {/* ✅ 추천상품 섹션 */}
<section className="flex flex-col items-center justify-center py-[10vh] px-6 bg-white text-black relative -mt-[20vh] md:-mt-[25vh] rounded-t-[2rem] shadow-[0_-10px_30px_rgba(0,0,0,0.08)]">
  <motion.h2
    className="text-5xl md:text-6xl font-extrabold mb-12 drop-shadow-sm tracking-tight text-gray-600"
    initial={{ opacity: 0, y: 40 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.8, ease: "easeOut" }}
    viewport={{ once: true }}
  >
    <EditableText id="featured-section-title" defaultText={t("main.featuredSection")} />
  </motion.h2>

  <div className="w-full max-w-[1200px]">
    <FeaturedSwiper />
  </div>
</section>


      {/* ✅ 상품 섹션 */}
      <SlideSection
        id="top-section"
        title={t("main.topSection")}
        filter={(p) => p.categoryKey === "top"}
      />
      <SlideSection
        id="bottom-section"
        title={t("main.bottomSection")}
        filter={(p) => p.categoryKey === "bottom"}
      />
      <SlideSection
        id="coordi-section"
        title={t("main.coordiSection")}
        filter={(p) => p.categoryKey === "coordi"}
      />

      {/* ✅ 브랜드 스토리 */}
      <section
        className="flex flex-col items-center justify-center py-[15vh] px-6 text-center bg-gray-100 font-['Pretendard']"
      >
        <motion.h2
          className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6 tracking-tight"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
         <EditableText
      id="brand-title" // ✅ 여기가 타이틀 ID
      defaultText={t("main.brandStoryTitle")} // ✅ 번역 키
      apiUrl={`${import.meta.env.VITE_API_URL}/api/texts`}
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
    defaultText={t("main.brandStoryDesc")}
    apiUrl={`${import.meta.env.VITE_API_URL}/api/texts`}
  />
</motion.p>
      </section>

      {/* ✅ 푸터 */}
      <footer className="py-6 text-black text-sm border-t border-gray-300 w-full text-center bg-white font-light tracking-tight">
        © 2025 ONYOU — {t("main.footer")}
      </footer>
    </div>
  );
}

export default MainLayout;
