import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import api from "../lib/api";
import { useEditMode } from "../context/EditModeContext";
import { useAuth } from "../context/AuthContext";
import EditableText from "../components/EditableText";
import EditableImage from "../components/EditableImage";
import { useTranslation } from "react-i18next";

/** ✅ 공통 크기조절 훅 */
const useResizableCard = (id, isResizeMode, defaultWidth = 230, defaultHeight = 360) => {
  const [size, setSize] = useState(() => {
    const saved = localStorage.getItem(`card-size-${id}`);
    return saved ? JSON.parse(saved) : { width: defaultWidth, height: defaultHeight };
  });

  const sizeRef = useRef(size);
  const cardRef = useRef(null);
  const resizingRef = useRef(false);
  const startRef = useRef({ x: 0, y: 0, width: 0, height: 0 });

  useEffect(() => {
    sizeRef.current = size;
  }, [size]);

  useEffect(() => {
    const handleMove = (e) => {
      if (!isResizeMode || !resizingRef.current) return;
      const dx = e.clientX - startRef.current.x;
      const dy = e.clientY - startRef.current.y;
      setSize({
        width: Math.max(120, startRef.current.width + dx),
        height: Math.max(150, startRef.current.height + dy),
      });
    };

    const handleUp = () => {
      if (!resizingRef.current) return;
      resizingRef.current = false;
      document.body.style.cursor = "auto";
      localStorage.setItem(`card-size-${id}`, JSON.stringify(sizeRef.current));
    };

    if (isResizeMode) {
      window.addEventListener("mousemove", handleMove);
      window.addEventListener("mouseup", handleUp);
    }

    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseup", handleUp);
    };
  }, [isResizeMode]);

  const startResize = (e) => {
    if (!isResizeMode) return;
    if (e.button !== 2) return; // 우클릭만
    e.preventDefault();
    resizingRef.current = true;
    startRef.current = {
      x: e.clientX,
      y: e.clientY,
      width: cardRef.current.offsetWidth,
      height: cardRef.current.offsetHeight,
    };
    document.body.style.cursor = "se-resize";
  };

  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;
    const preventMenu = (e) => isResizeMode && e.preventDefault();
    el.addEventListener("contextmenu", preventMenu);
    return () => el.removeEventListener("contextmenu", preventMenu);
  }, [isResizeMode]);

  return { size, cardRef, startResize };
};

/** ✅ 개별 상품 카드 컴포넌트 */
function ProductCard({ product, isEditMode, isResizeMode, addToCart, navigate }) {
  const { size, cardRef, startResize } = useResizableCard(`product-${product._id}`, isResizeMode);
  const { t } = useTranslation();

  return (
    <div
      ref={cardRef}
      onMouseDown={startResize}
      onClick={() => {
        if (!isEditMode && !isResizeMode) navigate(`/products/${product._id}`);
      }}
      className={`p-5 shadow bg-white flex flex-col items-center rounded-xl transition-all duration-300 ${
        isResizeMode
          ? "border-2 border-dashed border-blue-400"
          : "border border-gray-200 hover:shadow-lg"
      }`}
      style={{
        width: `${size.width}px`,
        height: `${size.height}px`,
        cursor: isResizeMode ? "se-resize" : "pointer",
        userSelect: "none",
      }}
    >
      {/* ✅ 이미지 */}
      <EditableImage
        id={`product-img-${product._id}`}
        defaultSrc={
          product.mainImage ||
          product.image ||
          product.images?.[0] ||
          "https://placehold.co/250x200?text=No+Image"
        }
        alt={product.name}
        filePath="src/pages/ProductList.jsx"
        componentName="ProductCard"
        style={{
          width: "100%",
          height: "12rem",
          borderRadius: "0.5rem",
          objectFit: "cover",
          marginBottom: "1rem",
        }}
      />

      {/* ✅ 상품명 */}
      <h2 className="text-lg font-semibold text-gray-800 text-center">
        <EditableText
          id={`product-name-${product._id}`}
          defaultText={product.name}
          filePath="src/pages/ProductList.jsx"
          componentName="ProductCard"
        />
      </h2>

      {/* ✅ 설명 */}
      <p className="text-gray-500 text-sm mt-1 line-clamp-2 text-center">
        <EditableText
          id={`product-desc-${product._id}`}
          defaultText={product.description || "상품 설명이 없습니다."}
          filePath="src/pages/ProductList.jsx"
          componentName="ProductCard"
        />
      </p>

      {/* ✅ 가격 */}
      <p className="mt-3 font-bold text-blue-600">{product.price?.toLocaleString()}원</p>

      {/* ✅ 장바구니 버튼 */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          if (isEditMode || isResizeMode) return;
          addToCart(product);
        }}
        disabled={isEditMode || isResizeMode}
        className={`mt-4 w-full px-4 py-2 rounded-lg text-white transition ${
          isEditMode || isResizeMode
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-blue-500 hover:bg-blue-600"
        }`}
      >
        장바구니 담기
      </button>
    </div>
  );
}

/** ✅ 전체 상품 리스트 페이지 */
function ProductList() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [pages, setPages] = useState([]);
  const [activePage, setActivePage] = useState("all");
  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem("cart");
    return saved ? JSON.parse(saved) : [];
  });

  const { isEditMode, setIsEditMode, isResizeMode, setIsResizeMode } = useEditMode();
  const { user } = useAuth();
  const navigate = useNavigate();

  /** ✅ 관리자 모드 토글 */
  const toggleEditMode = () => {
    if (!user?.isAdmin) return alert("⚠ 관리자만 디자인 모드를 사용할 수 있습니다.");
    setIsEditMode(!isEditMode);
  };

  const toggleResizeMode = () => {
    if (!user?.isAdmin) return alert("⚠ 관리자만 크기 조절 모드를 사용할 수 있습니다.");
    setIsResizeMode(!isResizeMode);
  };

  /** ✅ 데이터 불러오기 */
  useEffect(() => {
    fetchPages();
    fetchProducts();
  }, []);

  const fetchPages = async () => {
    try {
      const res = await api.get("/api/pages");
      setPages(res.data);
    } catch (err) {
      console.error("❌ 탭 불러오기 실패:", err.message);
    }
  };

  const fetchProducts = async () => {
    try {
      const baseURL = import.meta.env.VITE_API_BASE_URL;
      const endpoint = baseURL.endsWith("/api")
        ? `${baseURL}/products`
        : `${baseURL}/api/products`;
      const res = await api.get(endpoint);
      setProducts(res.data);
      setFilteredProducts(res.data);
    } catch (err) {
      console.error("❌ 상품 불러오기 실패:", err.message, err);
      alert("서버 연결 실패: 백엔드가 켜져 있는지 확인하세요!");
    }
  };

  const handlePageChange = (pageId) => {
    setActivePage(pageId);
    if (pageId === "all") {
      setFilteredProducts(products);
    } else {
      const filtered = products.filter(
        (p) => p.categoryPage === pageId || p.categoryPage?._id === pageId
      );
      setFilteredProducts(filtered);
    }
  };

  const addToCart = (product) => {
    if (isEditMode || isResizeMode) return;
    const exists = cart.find((item) => item._id === product._id);
    let newCart;
    if (exists) {
      newCart = cart.map((item) =>
        item._id === product._id ? { ...item, quantity: item.quantity + 1 } : item
      );
    } else {
      newCart = [...cart, { ...product, quantity: 1 }];
    }
    setCart(newCart);
    localStorage.setItem("cart", JSON.stringify(newCart));
  };

  /** ✅ 렌더링 */
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-start p-8 relative select-none">
      {/* 🧰 관리자 툴바 */}
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

      {/* 헤더 (편집 가능) */}
      <header className="w-full max-w-6xl text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-700">
          <EditableText
            id="productlist-title"
            defaultText="상품 목록"
            filePath="src/pages/ProductList.jsx"
            componentName="HeaderTitle"
          />
        </h1>
        <p className="text-gray-500 mt-2">
          <EditableText
            id="productlist-subtitle"
            defaultText="지금 바로 쇼핑을 시작해보세요!"
            filePath="src/pages/ProductList.jsx"
            componentName="HeaderSubtitle"
          />
        </p>
      </header>

      {/* 탭 */}
      <div className="flex flex-wrap justify-center gap-3 mb-10">
        <button
          onClick={() => handlePageChange("all")}
          className={`px-4 py-2 rounded-full border transition ${
            activePage === "all"
              ? "bg-blue-500 text-white border-blue-500"
              : "bg-white text-gray-600 border-gray-300 hover:bg-blue-50"
          }`}
          disabled={isEditMode || isResizeMode}
        >
          전체 보기
        </button>

        {pages.map((p) => (
          <button
            key={p._id}
            onClick={() => handlePageChange(p._id)}
            className={`px-4 py-2 rounded-full border transition ${
              activePage === p._id
                ? "bg-blue-500 text-white border-blue-500"
                : "bg-white text-gray-600 border-gray-300 hover:bg-blue-50"
            }`}
            disabled={isEditMode || isResizeMode}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* 상품 목록 */}
      <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 
                    gap-x-12 gap-y-14 w-full max-w-[1300px] mx-auto px-4">
  {filteredProducts.map((p) => (
    <ProductCard
      key={p._id}
      product={p}
      isEditMode={isEditMode}
      isResizeMode={isResizeMode}
      addToCart={addToCart}
      navigate={navigate}
    />
  ))}
</section>


      {/* 푸터 */}
      <footer className="mt-16 text-gray-400 text-sm border-t pt-4 w-full text-center">
        © 2025 onyou
      </footer>
    </div>
  );
}

export default ProductList;
