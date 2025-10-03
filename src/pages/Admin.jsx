import { useEffect, useState } from "react";
import axios from "axios";

function Admin() {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({ name: "", price: "", description: "" });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    const res = await axios.get("http://localhost:4000/products");
    setProducts(res.data);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const addProduct = async () => {
    if (!form.name || !form.price) {
      alert("상품명과 가격은 필수입니다!");
      return;
    }
    await axios.post("http://localhost:4000/products", form);
    setForm({ name: "", price: "", description: "" });
    fetchProducts();
  };

  const deleteProduct = async (id) => {
    await axios.delete(`http://localhost:4000/products/${id}`);
    fetchProducts();
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
