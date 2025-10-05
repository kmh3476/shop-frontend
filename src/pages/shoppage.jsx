import { useEffect, useState } from "react";
import axios from "axios";

function ShopPage() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);

  useEffect(() => {
    fetchProducts();
  }, []);

  // 🔹 상품 불러오기
  const fetchProducts = async () => {
    try {
      // 배포 시에는 서버 주소를 환경변수로 교체 (ex: process.env.REACT_APP_API_URL)
      const res = await axios.get("http://localhost:4000/products");
      setProducts(res.data);
    } catch (err) {
      console.error("❌ 상품 불러오기 실패:", err);
    }
  };

  // 🔹 장바구니 추가
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

  // 🔹 장바구니에서 삭제
  const removeFromCart = (id) => {
    setCart(cart.filter((item) => item._id !== id));
  };

  // 🔹 총합 계산
  const getTotal = () => {
    return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1 style={{ textAlign: "center" }}>🛍️ 쇼핑몰</h1>

      {/* 상품 목록 */}
      <h2 style={{ marginTop: "20px", textAlign: "center" }}>추천 상품</h2>
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
              borderRadius: "12px",
              padding: "15px",
              width: "230px",
              textAlign: "center",
              boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
              transition: "transform 0.2s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.03)")}
            onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
          >
            {/* ✅ 이미지 표시 (imageUrl 또는 image 둘 다 대응) */}
            <img
              src={p.image || p.imageUrl || "https://via.placeholder.com/230x200?text=No+Image"}
              alt={p.name}
              style={{
                width: "100%",
                height: "200px",
                objectFit: "cover",
                borderRadius: "10px",
              }}
            />

            <h3 style={{ marginTop: "10px", fontWeight: "bold" }}>{p.name}</h3>
            <p style={{ color: "#666", fontSize: "14px", minHeight: "40px" }}>
              {p.description}
            </p>
            <p
              style={{
                color: "#0070f3",
                fontWeight: "bold",
                marginBottom: "10px",
              }}
            >
              {p.price.toLocaleString()}원
            </p>

            <button
              onClick={() => addToCart(p)}
              style={{
                background: "#0070f3",
                color: "white",
                border: "none",
                borderRadius: "6px",
                padding: "8px 12px",
                cursor: "pointer",
                width: "100%",
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
              {item.name} ({item.quantity}개) -{" "}
              {(item.price * item.quantity).toLocaleString()}원
              <button
                onClick={() => removeFromCart(item._id)}
                style={{
                  marginLeft: "10px",
                  background: "transparent",
                  border: "1px solid #ccc",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
              >
                삭제
              </button>
            </li>
          ))}
        </ul>
      )}

      <h3 style={{ marginTop: "20px" }}>
        총합: {getTotal().toLocaleString()}원
      </h3>
    </div>
  );
}

export default ShopPage;
