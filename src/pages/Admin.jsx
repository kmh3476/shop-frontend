import { useEffect, useState } from "react";
import api from "../lib/api"; // axios 대신 api 인스턴스 사용

function Admin() {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({ name: "", price: "", description: "" });

  useEffect(() => {
    fetchProducts();
  }, []);

  // 상품 목록 불러오기
  const fetchProducts = async () => {
    try {
      const res = await api.get("/products"); // http://localhost:4000/api/products
      setProducts(res.data);
    } catch (err) {
      console.error("❌ 상품 불러오기 실패:", err);
    }
  };

  // 입력값 변경
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // 상품 추가
  const addProduct = async () => {
    if (!form.name || !form.price) {
      alert("상품명과 가격은 필수입니다!");
      return;
    }
    try {
      await api.post("/products", {
        name: form.name,
        price: Number(form.price), // 숫자로 변환
        description: form.description,
      });
      setForm({ name: "", price: "", description: "" });
      fetchProducts();
    } catch (err) {
      console.error("❌ 상품 추가 실패:", err);
    }
  };

  // 상품 삭제
  const deleteProduct = async (id) => {
    try {
      await api.delete(`/products/${id}`);
      fetchProducts();
    } catch (err) {
      console.error("❌ 상품 삭제 실패:", err);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>📦 관리자 페이지</h1>

      <h2>상품 추가</h2>
      <input
        type="text"
        name="name"
        placeholder="상품명"
        value={form.name}
        onChange={handleChange}
      />
      <input
        type="number"
        name="price"
        placeholder="가격"
        value={form.price}
        onChange={handleChange}
      />
      <input
        type="text"
        name="description"
        placeholder="설명"
        value={form.description}
        onChange={handleChange}
      />
      <button onClick={addProduct}>추가</button>

      <h2>상품 목록</h2>
      <ul>
        {products.map((p) => (
          <li key={p._id} style={{ marginBottom: "10px" }}>
            <strong>{p.name}</strong> - {p.price}원 <br />
            {p.description} <br />
            <button onClick={() => deleteProduct(p._id)}>삭제</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Admin;
