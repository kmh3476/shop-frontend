import { useEffect, useState } from "react";
import noImage from "../assets/no-image.png"; // ✅ 기본 이미지 추가

function Cart() {
  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem("cart");
    return saved ? JSON.parse(saved) : [];
  });

  // ✅ localStorage 동기화
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  // ✅ 장바구니 아이템 삭제
  const removeFromCart = (index) => {
    const newCart = cart.filter((_, i) => i !== index);
    setCart(newCart);
  };

  // ✅ 상품 이미지 가져오기 (대표 > 첫번째 > 기본 이미지)
  const getImageUrl = (item) => {
    if (item.mainImage?.startsWith("http")) return item.mainImage;
    if (Array.isArray(item.images) && item.images.length > 0) {
      const valid = item.images.find((img) => img?.startsWith("http"));
      if (valid) return valid;
    }
    return noImage;
  };

  // ✅ 총합 계산
  const totalPrice = cart.reduce((sum, item) => sum + item.price, 0);

  return (
    <div style={{ padding: "20px" }}>
      <h1>🛒 장바구니</h1>

      {cart.length === 0 ? (
        <p>장바구니가 비어 있습니다.</p>
      ) : (
        <div>
          <ul style={{ listStyle: "none", padding: 0 }}>
            {cart.map((item, index) => (
              <li
                key={index}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "15px",
                  marginBottom: "20px",
                  padding: "10px",
                  border: "1px solid #ddd",
                  borderRadius: "10px",
                }}
              >
                {/* ✅ 상품 이미지 */}
                <img
                  src={getImageUrl(item)}
                  alt={item.name}
                  style={{
                    width: "80px",
                    height: "80px",
                    objectFit: "cover",
                    borderRadius: "8px",
                  }}
                  onError={(e) => (e.currentTarget.src = noImage)}
                />

                {/* ✅ 상품 정보 */}
                <div style={{ flex: 1 }}>
                  <strong>{item.name}</strong> - {item.price}원
                  <br />
                  {item.description && (
                    <small style={{ color: "#555" }}>{item.description}</small>
                  )}
                </div>

                {/* ✅ 삭제 버튼 */}
                <button
                  onClick={() => removeFromCart(index)}
                  style={{
                    backgroundColor: "red",
                    color: "white",
                    border: "none",
                    padding: "6px 12px",
                    borderRadius: "6px",
                    cursor: "pointer",
                  }}
                >
                  제거
                </button>
              </li>
            ))}
          </ul>

          <h3 style={{ marginTop: "20px" }}>총 금액: {totalPrice}원</h3>
        </div>
      )}
    </div>
  );
}

export default Cart;
