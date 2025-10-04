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
    const newCart = [...cart, product];
    setCart(newCart);
    localStorage.setItem("cart", JSON.stringify(newCart));
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-start p-8">
      {/* 🔹 상단 헤더 */}
      <header className="w-full max-w-5xl text-center mb-12">
        <h1 className="text-3xl font-bold text-blue-600">🛍 상품 목록</h1>
        <p className="text-gray-500 mt-2">지금 바로 쇼핑을 시작해보세요!</p>
      </header>

      {/* 🔹 상품 리스트 */}
      <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 w-full max-w-5xl">
        {products.map((p) => (
          <div
            key={p._id}
            className="border rounded-xl p-6 shadow hover:shadow-lg transition bg-white"
          >
            <h2 className="text-lg font-semibold text-gray-800">{p.name}</h2>
            <p className="text-gray-500 text-sm mt-1">{p.description}</p>
            <p className="mt-3 font-bold text-blue-600">{p.price}원</p>
            <button
              onClick={() => addToCart(p)}
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
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
