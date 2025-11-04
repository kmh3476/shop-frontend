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

function MainLayout() {
  const { isEditMode, setIsEditMode, isResizeMode, setIsResizeMode } =
    useEditMode();
  const { user } = useAuth();
  const navigate = useNavigate();

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
      alert(`'${product.name}'이(가) 장바구니에 추가되었습니다.`);
    } catch (err) {
      console.error("❌ 장바구니 추가 실패:", err);
      alert("장바구니 추가 중 오류가 발생했습니다.");
    }
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

    /** ✅ 카드 클릭 → 상세 페이지 이동 */
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
          width: `${size.width}px`,
          height: `${size.height}px`,
          fontSize: `${scale * 1}rem`,
          transformOrigin: "top left",
          cursor: isResizeMode ? "se-resize" : "pointer",
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

          {/* ✅ 장바구니 아이콘 버튼 */}
          <div className="flex justify-end">
            <button
              onClick={(e) => handleAddToCartGlobal(product, e)}
              disabled={isLocked}
              className={`p-3 rounded-full transition ${
                isLocked
                  ? "bg-gray-400 text-white cursor-not-allowed"
                  : "bg-gray-800 text-white hover:bg-gray-700"
              }`}
            >
              <ShoppingCartOutlined style={{ fontSize: "1.2rem" }} />
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

    /** ✅ 카드 클릭 → 상세 페이지 이동 */
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
          width: `${size.width}px`,
          height: `${size.height}px`,
          fontSize: `${scale * 1}rem`,
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
          className="p-5 font-['Pretendard'] flex flex-col justify-between h-[30%]"
          style={{ transform: `scale(${scale})`, transformOrigin: "top left" }}
        >
          <div>
            <h3 className="font-semibold text-gray-800 text-lg mb-1">
              {product.name}
            </h3>
            <p className="text-sm text-gray-500">
              {product.price ? `${product.price.toLocaleString()}원` : "#데일리룩"}
            </p>
          </div>

          {/* ✅ 장바구니 아이콘 */}
          <div className="flex justify-end mt-2">
            <button
              onClick={(e) => handleAddToCartGlobal(product, e)}
              disabled={isLocked}
              className={`p-2 rounded-full transition ${
                isLocked
                  ? "bg-gray-400 text-white cursor-not-allowed"
                  : "bg-gray-800 text-white hover:bg-gray-700"
              }`}
            >
              <ShoppingCartOutlined style={{ fontSize: "1rem" }} />
            </button>
          </div>
        </div>
      </motion.div>
    );
  };
  /** ✅ 일반 상품 슬라이드 섹션 */
  const SlideSection = ({ title, products, category }) => {
    const filteredProducts = allProducts.filter(
      (p) => p.categoryName === category
    );

    return (
      <section className="my-16">
        <h2 className="text-2xl font-bold mb-6">{title}</h2>

        <Swiper
          modules={[Navigation, Pagination]}
          spaceBetween={10}
          slidesPerView={3.5}
          navigation={!isEditMode && !isResizeMode}
          pagination={!isEditMode && !isResizeMode ? { clickable: true } : false}
          allowTouchMove={!isEditMode && !isResizeMode}
          simulateTouch={!isEditMode && !isResizeMode}
          draggable={!isEditMode && !isResizeMode}
          loop={filteredProducts.length > 1} // ✅ 수정됨: 상품 1개 이하일 땐 loop 비활성화
          className="pb-12 swiper-backface-hidden"
        >
          {filteredProducts.map((product) => (
            <SwiperSlide key={product._id || product.name}>
              <ProductCard product={product} />
            </SwiperSlide>
          ))}
        </Swiper>
      </section>
    );
  };

  /** ✅ 추천상품 슬라이드 */
  const FeaturedSwiper = () => {
    const featured = allProducts.filter((p) => p.isRecommended);

    return (
      <section className="my-20">
        <h2 className="text-2xl font-bold mb-6">추천 상품</h2>

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
          loop={featured.length > 1} // ✅ 수정됨: 추천상품 1개 이하일 땐 loop 비활성화
          className="pb-12 swiper-horizontal swiper-backface-hidden"
        >
          {featured.map((product) => (
            <SwiperSlide key={product._id || product.name}>
              <FeaturedCard product={product} />
            </SwiperSlide>
          ))}
        </Swiper>
      </section>
    );
  };

  /** ✅ blob URL 정리 (이미지 미리보기 에러 방지용 추가) */
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

  /** ✅ 전체 페이지 구성 */
  return (
    <div className="max-w-[1200px] mx-auto px-4 py-10 font-['Pretendard']">
      <div className="flex justify-end gap-3 mb-6">
        <button
          onClick={toggleEditMode}
          className={`px-4 py-2 rounded-md text-white ${
            isEditMode ? "bg-red-500" : "bg-blue-600"
          }`}
        >
          {isEditMode ? "디자인 모드 종료" : "디자인 모드"}
        </button>
        <button
          onClick={toggleResizeMode}
          className={`px-4 py-2 rounded-md text-white ${
            isResizeMode ? "bg-yellow-500" : "bg-gray-600"
          }`}
        >
          {isResizeMode ? "크기 조절 종료" : "크기 조절"}
        </button>
      </div>
      <EditableText
        id="main-title"
        defaultText="우리의 새로운 컬렉션"
        tag="h1"
        className="text-4xl font-bold mb-4"
      />

      <EditableText
        id="main-subtitle"
        defaultText="지금 바로 만나보세요"
        tag="p"
        className="text-lg text-gray-600 mb-12"
      />

      {/* ✅ 추천 상품 슬라이드 */}
      <FeaturedSwiper />

      {/* ✅ 카테고리별 상품 슬라이드 */}
      <SlideSection title="아우터" products={allProducts} category="outer" />
      <SlideSection title="상의" products={allProducts} category="top" />
      <SlideSection title="하의" products={allProducts} category="bottom" />
      <SlideSection title="기타" products={allProducts} category="etc" />
    </div>
  );
}

export default MainLayout;
