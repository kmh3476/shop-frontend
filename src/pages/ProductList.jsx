import { useEffect, useState } from "react";
import api from "../lib/api"; // axios 인스턴스 불러오기

function ProductList() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState(() => {
    // 로컬스토리지에서 불러오기
    const saved = localStorage.getItem("cart");
    return saved ? JSON.parse(saved) : [];
  });

  // 상품 목록 불러오기
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await api.get("/products"); // http://localhost:4000/api/products
        setProducts(res.data);
      } catch (err) {
        console.error("❌ 상품 불러오기 실패:", err);
      }
    };

    fetchProducts();
  }, []);

  // 장바구니 추가
  const addToCart = (product) => {
    const newCart = [...cart, product];
    setCart(newCart);
    localStorage.setItem("cart", JSON.stringify(newCart));
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>🛍 상품 목록</h1>

      {products.length === 0 ? (
        <p>상품이 없습니다. 관리자로 로그인해 상품을 추가해보세요.</p>
      ) : (
        <ul>
          {products.map((p) => (
            <li key={p._id} style={{ marginBottom: "15px" }}>
              <strong>{p.name}</strong> - {p.price}원 <br />
              {p.description} <br />
              <button onClick={() => addToCart(p)}>장바구니 담기</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default ProductList;
