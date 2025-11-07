import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import noImage from "../assets/no-image.png"; // 기본 이미지
import { useTranslation } from "react-i18next";

function Cart() {
  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem("cart");
    return saved ? JSON.parse(saved) : [];
  });
  const navigate = useNavigate();
  const { t } = useTranslation();

  // ✅ localStorage 동기화
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  // ✅ 상품 이미지 결정
  const getImageUrl = (item) => {
    if (item.mainImage?.startsWith("http")) return item.mainImage;
    if (Array.isArray(item.images) && item.images.length > 0) {
      const valid = item.images.find((img) => img?.startsWith("http"));
      if (valid) return valid;
    }
    return noImage;
  };

  // ✅ 수량 증가
  const increaseQty = (index) => {
    const updated = [...cart];
    updated[index].quantity = (updated[index].quantity || 1) + 1;
    setCart(updated);
  };

  // ✅ 수량 감소
  const decreaseQty = (index) => {
    const updated = [...cart];
    if (updated[index].quantity > 1) {
      updated[index].quantity -= 1;
      setCart(updated);
    } else {
      removeFromCart(index);
    }
  };

  // ✅ 아이템 제거
  const removeFromCart = (index) => {
    const newCart = cart.filter((_, i) => i !== index);
    setCart(newCart);
  };

  // ✅ 전체 삭제
  const clearCart = () => {
    if (window.confirm("장바구니를 모두 비우시겠습니까?")) {
      setCart([]);
    }
  };

  // ✅ 총합 계산 (수량 포함)
  const totalPrice = cart.reduce(
    (sum, item) => sum + (Number(item.price) || 0) * (item.quantity || 1),
    0
  );

  // ✅ 상품 클릭 시 상세 페이지 이동
  const goToDetail = (item) => {
    if (item._id) navigate(`/products/${item._id}`); // ✅ 경로 수정됨
    else alert("상품 상세 정보를 찾을 수 없습니다.");
  };

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
                {/* ✅ 상품 이미지 (클릭 시 상세페이지 이동) */}
                <img
                  src={getImageUrl(item)}
                  alt={item.name}
                  style={{
                    width: "80px",
                    height: "80px",
                    objectFit: "cover",
                    borderRadius: "8px",
                    cursor: "pointer",
                  }}
                  onClick={() => goToDetail(item)}
                  onError={(e) => (e.currentTarget.src = noImage)}
                />

                {/* ✅ 상품 정보 */}
                <div
                  style={{ flex: 1, cursor: "pointer" }}
                  onClick={() => goToDetail(item)}
                >
                  <strong>{item.name}</strong> -{" "}
                  {Number(item.price).toLocaleString()}원
                  <br />
                  {item.description && (
                    <small style={{ color: "#555" }}>{item.description}</small>
                  )}
                </div>

                {/* ✅ 수량 조절 */}
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <button
                    onClick={() => decreaseQty(index)}
                    style={{
                      width: "28px",
                      height: "28px",
                      border: "1px solid #aaa",
                      borderRadius: "50%",
                      background: "white",
                      cursor: "pointer",
                    }}
                  >
                    −
                  </button>
                  <span>{item.quantity || 1}</span>
                  <button
                    onClick={() => increaseQty(index)}
                    style={{
                      width: "28px",
                      height: "28px",
                      border: "1px solid #aaa",
                      borderRadius: "50%",
                      background: "white",
                      cursor: "pointer",
                    }}
                  >
                    +
                  </button>
                </div>

                {/* ✅ 개별 삭제 */}
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

          {/* ✅ 총합 및 전체삭제 */}
          <div
            style={{
              marginTop: "30px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <h3>총 금액: {totalPrice.toLocaleString()}원</h3>
            <button
              onClick={clearCart}
              style={{
                backgroundColor: "#444",
                color: "white",
                border: "none",
                padding: "8px 16px",
                borderRadius: "8px",
                cursor: "pointer",
              }}
            >
              🧹 전체 비우기
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Cart;
