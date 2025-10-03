import { useEffect, useState } from "react";

function Cart() {
  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem("cart");
    return saved ? JSON.parse(saved) : [];
  });

  // localStorage랑 동기화
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  // 장바구니 아이템 삭제
  const removeFromCart = (index) => {
    const newCart = cart.filter((_, i) => i !== index);
    setCart(newCart);
  };

  // 총합 계산
  const totalPrice = cart.reduce((sum, item) => sum + item.price, 0);

  return (
    <div style={{ padding: "20px" }}>
      <h1>🛒 장바구니</h1>
      {cart.length === 0 ? (
        <p>장바구니가 비어 있습니다.</p>
      ) : (
        <div>
          <ul>
            {cart.map((item, index) => (
              <li key={index} style={{ marginBottom: "15px" }}>
                <strong>{item.name}</strong> - {item.price}원 <br />
                {item.description && <span>{item.description}</span>} <br />
                <button
                  onClick={() => removeFromCart(index)}
                  style={{
                    marginTop: "5px",
                    backgroundColor: "red",
                    color: "white",
                    border: "none",
                    padding: "5px 10px",
                    cursor: "pointer",
                    borderRadius: "5px",
                  }}
                >
                  제거
                </button>
              </li>
            ))}
          </ul>
          <h3>총 금액: {totalPrice}원</h3>
        </div>
      )}
    </div>
  );
}

export default Cart;
