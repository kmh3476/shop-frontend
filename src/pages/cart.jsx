import { useState, useEffect } from "react";

function Cart() {
  const [cart, setCart] = useState([]);

  useEffect(() => {
    const saved = localStorage.getItem("cart");
    if (saved) {
      setCart(JSON.parse(saved));
    }
  }, []);

  const removeItem = (index) => {
    const newCart = cart.filter((_, i) => i !== index);
    setCart(newCart);
    localStorage.setItem("cart", JSON.stringify(newCart));
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>🛒 장바구니</h1>
      {cart.length === 0 ? (
        <p>장바구니가 비었습니다.</p>
      ) : (
        <ul>
          {cart.map((item, idx) => (
            <li key={idx} style={{ marginBottom: "10px" }}>
              <strong>{item.name}</strong> - {item.price}원 <br />
              <button onClick={() => removeItem(idx)}>삭제</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default Cart;
