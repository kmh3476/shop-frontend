import { useEffect, useState } from "react";
import api from "../lib/api";

function ProductList() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem("cart");
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await api.get("/products");
      setProducts(res.data);
    } catch (err) {
      console.error("❌ 상품 불러오기 실패:", err);
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
      <header className="w-full max-w-6xl text-center mb-12">
        <h1 className="text-3xl font-bold text-blue-600">🛍 상품 목록</h1>
        <p className="text-gray-500 mt-2">지금 바로 쇼핑을 시작해보세요!</p>
      </header>

      {/* 🔹 상품 리스트 */}
      <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 w-full max-w-6xl">
        {products.map((p) => (
          <div
            key={p._id}
            className="border rounded-xl p-5 shadow hover:shadow-lg transition bg-white flex flex-col items-center"
          >
            {/* ✅ 이미지 표시 (Cloudinary URL 지원) */}
            <img
              src={p.image || p.imageUrl || "https://via.placeholder.com/250x200?text=No+Image"}
              alt={p.name}
              className="w-full h-48 object-cover rounded-lg mb-4"
            />

            <h2 className="text-lg font-semibold text-gray-800">{p.name}</h2>
            <p className="text-gray-500 text-sm mt-1 line-clamp-2">
              {p.description}
            </p>
            <p className="mt-3 font-bold text-blue-600">
              {p.price.toLocaleString()}원
            </p>

            <button
              onClick={() => addToCart(p)}
              className="mt-4 w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
            >
              장바구니 담기
            </button>
          </div>
        ))}
      </section>

      {/* 🔹 푸터 */}
      <footer className="mt-16 text-gray-400 text-sm border-t pt-4 w-full text-center">
        © 2025 onyou
      </footer>
    </div>
  );
}

export default ProductList;
