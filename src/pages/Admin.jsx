import { useEffect, useState } from "react";
import api from "../lib/api";

function Admin() {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({ name: "", price: "", description: "" });
  const [editingId, setEditingId] = useState(null); // ✨ 수정 중인 상품 ID

  useEffect(() => {
    fetchProducts();
  }, []);

  // ✅ 상품 불러오기
  const fetchProducts = async () => {
    try {
      const res = await api.get("/products");
      setProducts(res.data);
    } catch (err) {
      console.error("상품 불러오기 실패:", err);
    }
  };

  // ✅ 입력 변경 처리
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // ✅ 상품 추가
  const addProduct = async () => {
    if (!form.name || !form.price) {
      alert("상품명과 가격은 필수입니다!");
      return;
    }
    try {
      await api.post("/products", form);
      setForm({ name: "", price: "", description: "" });
      fetchProducts();
    } catch (err) {
      console.error("상품 추가 실패:", err);
    }
  };

  // ✅ 상품 수정 시작
  const startEdit = (product) => {
    setEditingId(product._id);
    setForm({
      name: product.name,
      price: product.price,
      description: product.description,
    });
  };

  // ✅ 상품 수정 완료
  const updateProduct = async () => {
    if (!editingId) return;
    try {
      await api.put(`/products/${editingId}`, form);
      setEditingId(null);
      setForm({ name: "", price: "", description: "" });
      fetchProducts();
    } catch (err) {
      console.error("상품 수정 실패:", err);
    }
  };

  // ✅ 상품 삭제
  const deleteProduct = async (id) => {
    try {
      await api.delete(`/products/${id}`);
      fetchProducts();
    } catch (err) {
      console.error("상품 삭제 실패:", err);
    }
  };

  // ✅ 폼 초기화
  const cancelEdit = () => {
    setEditingId(null);
    setForm({ name: "", price: "", description: "" });
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>📦 관리자 페이지</h1>

      <h2>{editingId ? "상품 수정" : "상품 추가"}</h2>
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
      {editingId ? (
        <>
          <button onClick={updateProduct}>수정 완료</button>
          <button onClick={cancelEdit}>취소</button>
        </>
      ) : (
        <button onClick={addProduct}>추가</button>
      )}

      <h2>상품 목록</h2>
      <ul>
        {products.map((p) => (
          <li key={p._id} style={{ marginBottom: "10px" }}>
            <strong>{p.name}</strong> - {p.price}원 <br />
            {p.description} <br />
            <button onClick={() => startEdit(p)}>수정</button>
            <button onClick={() => deleteProduct(p._id)}>삭제</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Admin;
