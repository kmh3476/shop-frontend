import { useEffect, useState } from "react";
import api from "../lib/api";

function ProductList() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem("cart");
    return saved ? JSON.parse(saved) : [];
  });

  // ✅ 모달 상태 (추가됨)
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      // ✅ 백엔드 API 기본 URL 처리
      const baseURL = import.meta.env.VITE_API_BASE_URL;
      const endpoint = baseURL.endsWith("/api")
        ? `${baseURL}/products`
        : `${baseURL}/api/products`;

      console.log("📡 Fetching from:", endpoint);

      const res = await api.get(endpoint);
      setProducts(res.data);
    } catch (err: any) {
      console.error("❌ 상품 불러오기 실패:", err.message, err);
      alert("서버 연결 실패: 백엔드가 켜져 있는지 확인하세요!");
    }
  };

  const addToCart = (product: any) => {
    const exists = cart.find((item: any) => item._id === product._id);
    let newCart;
    if (exists) {
      newCart = cart.map((item: any) =>
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
      <header className="w-full max-w-6xl text-center mb-12">
        <h1 className="text-3xl font-bold text-blue-600">🛍 상품 목록</h1>
        <p className="text-gray-500 mt-2">지금 바로 쇼핑을 시작해보세요!</p>
      </header>

      {/* 🔹 상품 리스트 */}
      <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 w-full max-w-6xl">
        {products.length === 0 ? (
          <p className="text-gray-400 col-span-full text-center">
            상품이 없습니다 😢
          </p>
        ) : (
          products.map((p: any) => {
            // 이미지 URL 정리
            const imageUrl = p.image?.startsWith("http")
              ? p.image
              : p.image
              ? `${import.meta.env.VITE_API_BASE_URL.replace("/api", "")}/${p.image}`
              : "https://placehold.co/250x200?text=No+Image";

            return (
              <div
                key={p._id}
                className="border rounded-xl p-5 shadow hover:shadow-lg transition bg-white flex flex-col items-center"
              >
                {/* ✅ 이미지 클릭 → 모달 열기 */}
                <img
                  src={imageUrl}
                  alt={p.name}
                  className="w-full h-48 object-cover rounded-lg mb-4 cursor-pointer"
                  onClick={() => setSelectedImage(imageUrl)}
                  onError={(e) =>
                    (e.currentTarget.src =
                      "https://placehold.co/250x200?text=No+Image")
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
                  onClick={() => addToCart(p)}
                  className="mt-4 w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
                >
                  장바구니 담기
                </button>
              </div>
            );
          })
        )}
      </section>

      {/* ✅ 이미지 모달 */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50"
          onClick={() => setSelectedImage(null)}
        >
          <img
            src={selectedImage}
            alt="상품 이미지 크게 보기"
            className="max-w-[90%] max-h-[90%] rounded-lg shadow-lg"
          />
        </div>
      )}

      {/* 🔹 푸터 */}
      <footer className="mt-16 text-gray-400 text-sm border-t pt-4 w-full text-center">
        © 2025 onyou
      </footer>
    </div>
  );
}

export default ProductList;
