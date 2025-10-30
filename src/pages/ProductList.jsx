import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import api from "../lib/api";
import { useEditMode } from "../context/EditModeContext";
import { useAuth } from "../context/AuthContext";
import EditableText from "../components/EditableText";
import EditableImage from "../components/EditableImage";

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

  // ✅ 관리자 모드 토글
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

  // ✅ 페이지(탭) + 상품 둘 다 불러오기
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
    const exists = cart.find((item) => item._id === product._id);
    let newCart;
    if (exists) {
      newCart = cart.map((item) =>
        item._id === product._id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      );
    } else {
      newCart = [...cart, { ...product, quantity: 1 }];
    }
    setCart(newCart);
    localStorage.setItem("cart", JSON.stringify(newCart));
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-start p-8 relative">
      {/* ✅ 관리자 전용 툴바 */}
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

      {/* 🔹 상단 헤더 */}
      <header className="w-full max-w-6xl text-center mb-8">
        <h1 className="text-3xl font-bold text-blue-600">🛍 상품 목록</h1>
        <p className="text-gray-500 mt-2">지금 바로 쇼핑을 시작해보세요!</p>
      </header>

      {/* 🔹 탭 네비게이션 */}
      <div className="flex flex-wrap justify-center gap-3 mb-10">
        <button
          onClick={() => handlePageChange("all")}
          className={`px-4 py-2 rounded-full border transition ${
            activePage === "all"
              ? "bg-blue-500 text-white border-blue-500"
              : "bg-white text-gray-600 border-gray-300 hover:bg-blue-50"
          }`}
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
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* 🔹 상품 리스트 */}
      <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 w-full max-w-6xl">
        {filteredProducts.length === 0 ? (
          <p className="text-gray-400 col-span-full text-center">
            상품이 없습니다 😢
          </p>
        ) : (
          filteredProducts.map((p) => (
            <div
              key={p._id}
              onClick={() => navigate(`/products/${p._id}`)}
              className={`p-5 shadow hover:shadow-lg transition bg-white flex flex-col items-center cursor-pointer rounded-xl ${
                isResizeMode
                  ? "border-2 border-dashed border-blue-400" // 📐 크기조절 모드일 때만 점선 표시
                  : "border border-gray-200"
              }`}
            >
              {/* ✅ 이미지 (EditableImage로 교체 가능) */}
              <EditableImage
                id={`product-img-${p._id}`}
                defaultSrc={
                  p.mainImage?.startsWith("http")
                    ? p.mainImage
                    : p.image?.startsWith("http")
                    ? p.image
                    : p.images?.[0]?.startsWith("http")
                    ? p.images[0]
                    : p.imageUrl?.startsWith("http")
                    ? p.imageUrl
                    : "https://placehold.co/250x200?text=No+Image"
                }
                alt={p.name}
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

              {/* ✅ 상품명 / 설명 (디자인모드에서만 점선 표시) */}
              <h2 className="text-lg font-semibold text-gray-800 text-center">
                <EditableText
                  id={`product-name-${p._id}`}
                  defaultText={p.name}
                  filePath="src/pages/ProductList.jsx"
                  componentName="ProductCard"
                />
              </h2>
              <p className="text-gray-500 text-sm mt-1 line-clamp-2 text-center">
                <EditableText
                  id={`product-desc-${p._id}`}
                  defaultText={p.description || "상품 설명이 없습니다."}
                  filePath="src/pages/ProductList.jsx"
                  componentName="ProductCard"
                />
              </p>

              {/* ✅ 가격 */}
              <p className="mt-3 font-bold text-blue-600">
                {p.price?.toLocaleString()}원
              </p>

              {/* ✅ 장바구니 버튼 */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  addToCart(p);
                }}
                className="mt-4 w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
              >
                장바구니 담기
              </button>
            </div>
          ))
        )}
      </section>

      {/* 🔹 푸터 */}
      <footer className="mt-16 text-gray-400 text-sm border-t pt-4 w-full text-center">
        © 2025 onyou
      </footer>
    </div>
  );
}

export default ProductList;
