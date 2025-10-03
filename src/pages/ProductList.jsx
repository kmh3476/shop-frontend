import { useEffect, useState } from "react";
import api from "../lib/api"; // axios 인스턴스 사용

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
      console.error("상품 불러오기 실패:", err);
    }
  };

  const addToCart = (product) => {
    const newCart = [...cart, product];
    setCart(newCart);
    localStorage.setItem("cart", JSON.stringify(newCart));
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>🛍 상품 목록</h1>
      <ul>
        {products.map((p) => (
          <li key={p._id} style={{ marginBottom: "15px" }}>
            <strong>{p.name}</strong> - {p.price}원 <br />
            {p.description} <br />
            <button onClick={() => addToCart(p)}>장바구니 담기</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ProductList;
