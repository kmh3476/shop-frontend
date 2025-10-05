import { useEffect, useState } from "react";
import axios from "axios";

function ShopPage() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      // 🔹 실제 배포 주소로 변경 가능
      const res = await axios.get("http://localhost:4000/products");
      setProducts(res.data);
    } catch (err) {
      console.error("❌ 상품 불러오기 실패:", err);
    }
  };

  const addToCart = (product) => {
    const exists = cart.find((item) => item._id === product._id);
    if (exists) {
      setCart(
        cart.map((item) =>
          item._id === product._id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
  };

  const removeFromCart = (id) => {
    setCart(cart.filter((item) => item._id !== id));
  };

  const getTotal = () => {
    return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>🛍️ 쇼핑몰</h1>

      {/* 상품 목록 */}
      <h2 style={{ marginTop: "20px" }}>상품</h2>
      <div
        style={{
          display: "flex",
          gap: "20px",
          flexWrap: "wrap",
          justifyContent: "center",
        }}
      >
        {products.map((p) => (
          <div
            key={p._id}
            style={{
              border: "1px solid #ddd",
              borderRadius: "10px",
              padding: "10px",
              width: "220px",
              textAlign: "center",
              boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
            }}
          >
            {/* 🔹 상품 이미지 */}
            <img
              src={p.imageUrl || "https://via.placeholder.com/200"}
              alt={p.name}
              style={{
                width: "100%",
                height: "200px",
                objectFit: "cover",
                borderRadius: "8px",
              }}
            />

            <h3 style={{ marginTop: "10px", fontWeight: "bold" }}>{p.name}</h3>
            <p style={{ color: "#666" }}>{p.description}</p>
            <p style={{ color: "#0070f3", fontWeight: "bold" }}>
              {p.price}원
            </p>

            <button
              onClick={() => addToCart(p)}
              style={{
                marginTop: "10px",
                background: "#0070f3",
                color: "white",
                border: "none",
                borderRadius: "6px",
                padding: "8px 12px",
                cursor: "pointer",
              }}
            >
              장바구니 담기
            </button>
          </div>
        ))}
      </div>

      {/* 장바구니 */}
      <h2 style={{ marginTop: "40px" }}>🛒 장바구니</h2>
      {cart.length === 0 ? (
        <p>장바구니가 비어있습니다.</p>
      ) : (
        <ul>
          {cart.map((item) => (
            <li key={item._id}>
              {item.name} ({item.quantity}개) - {item.price * item.quantity}원
              <button
                onClick={() => removeFromCart(item._id)}
                style={{ marginLeft: "10px" }}
              >
                삭제
              </button>
            </li>
          ))}
        </ul>
      )}

      <h3 style={{ marginTop: "20px" }}>총합: {getTotal()}원</h3>
    </div>
  );
}

export default ShopPage;
