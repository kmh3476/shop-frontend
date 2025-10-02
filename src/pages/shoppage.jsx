import { useEffect, useState } from "react";
import axios from "axios";

function ShopPage() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    const res = await axios.get("http://localhost:4000/products");
    setProducts(res.data);
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
      <h2>상품</h2>
      <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
        {products.map((p) => (
          <div key={p._id} style={{ border: "1px solid #ccc", padding: "10px", width: "200px" }}>
            <h3>{p.name}</h3>
            <p>{p.price}원</p>
            <p>{p.description}</p>
            <button onClick={() => addToCart(p)}>장바구니 담기</button>
          </div>
        ))}
      </div>

      {/* 장바구니 */}
      <h2>🛒 장바구니</h2>
      {cart.length === 0 ? (
        <p>장바구니가 비어있습니다.</p>
      ) : (
        <ul>
          {cart.map((item) => (
            <li key={item._id}>
              {item.name} ({item.quantity}개) - {item.price * item.quantity}원
              <button onClick={() => removeFromCart(item._id)}>삭제</button>
            </li>
          ))}
        </ul>
      )}

      <h3>총합: {getTotal()}원</h3>
    </div>
  );
}

export default ShopPage;
