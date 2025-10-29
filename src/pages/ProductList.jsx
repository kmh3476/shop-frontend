import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../lib/api";

function ProductList() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]); // ✅ 현재 탭에 해당하는 상품 목록
  const [pages, setPages] = useState([]); // ✅ 탭 목록
  const [activePage, setActivePage] = useState("all"); // ✅ 현재 선택된 탭
  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem("cart");
    return saved ? JSON.parse(saved) : [];
  });

  const navigate = useNavigate();

  // ✅ 페이지(탭) + 상품 둘 다 불러오기
  useEffect(() => {
    fetchPages();
    fetchProducts();
  }, []);

  // ✅ 탭 목록 불러오기
  const fetchPages = async () => {
    try {
      const res = await api.get("/api/pages"); // ✅ 관리자에서 만든 탭 목록 불러오기
      setPages(res.data);
    } catch (err) {
      console.error("❌ 탭 불러오기 실패:", err.message);
    }
  };

  // ✅ 상품 불러오기
  const fetchProducts = async () => {
    try {
      const baseURL = import.meta.env.VITE_API_BASE_URL;
      const endpoint = baseURL.endsWith("/api")
        ? `${baseURL}/products`
        : `${baseURL}/api/products`;

      console.log("📡 Fetching from:", endpoint);
      const res = await api.get(endpoint);
      setProducts(res.data);
      setFilteredProducts(res.data); // 초기엔 전체 상품
    } catch (err) {
      console.error("❌ 상품 불러오기 실패:", err.message, err);
      alert("서버 연결 실패: 백엔드가 켜져 있는지 확인하세요!");
    }
  };

  // ✅ 탭 클릭 시 상품 필터링
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
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-start p-8">
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
              className="border rounded-xl p-5 shadow hover:shadow-lg transition bg-white flex flex-col items-center cursor-pointer"
            >
              {/* ✅ 이미지 표시 */}
              <img
                src={
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
                className="w-full h-48 object-cover rounded-lg mb-4"
                onError={(e) =>
                  (e.target.src = "https://placehold.co/250x200?text=No+Image")
                }
              />

              <h2 className="text-lg font-semibold text-gray-800">{p.name}</h2>
              <p className="text-gray-500 text-sm mt-1 line-clamp-2">
                {p.description}
              </p>
              <p className="mt-3 font-bold text-blue-600">
                {p.price?.toLocaleString()}원
              </p>

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
