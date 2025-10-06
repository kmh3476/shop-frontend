import { useEffect, useState } from "react";
import api from "../lib/api";
import noImage from "../assets/no-image.png";

function Admin() {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({ name: "", price: "", description: "", imageUrl: "" });
  const [file, setFile] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [uploading, setUploading] = useState(false);

  // ✅ 상품 목록 불러오기
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await api.get("/products");
      setProducts(res.data);
    } catch (err) {
      console.error("❌ 상품 불러오기 실패:", err);
    }
  };

  // ✅ 이미지 업로드 (업로드 후 form.imageUrl 갱신)
  const handleImageUpload = async () => {
    if (!file) return form.imageUrl;
    setUploading(true);

    const formData = new FormData();
    formData.append("image", file);

    try {
      const res = await api.post("/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setUploading(false);

      // ✅ 새 이미지 URL을 즉시 상태에 반영
      const uploadedUrl = res.data.imageUrl;
      setForm((prev) => ({ ...prev, imageUrl: uploadedUrl }));

      return uploadedUrl;
    } catch (err) {
      setUploading(false);
      console.error("❌ 이미지 업로드 실패:", err);
      alert("이미지 업로드에 실패했습니다.");
      return form.imageUrl;
    }
  };

const saveProduct = async () => {
  if (!form.name || !form.price) {
    alert("상품명과 가격은 필수입니다!");
    return;
  }

  // ✅ 업로드 실행
  const uploadedUrl = await handleImageUpload();

  // ✅ 저장할 데이터 확정
  const productData = {
    ...form,
    imageUrl: uploadedUrl || form.imageUrl || "",
  };

  console.log("📦 저장 데이터:", productData);

  try {
    let updatedProduct;

    if (editingId) {
      const res = await api.put(`/products/${editingId}`, productData);
      updatedProduct = res.data;
      setProducts((prev) =>
        prev.map((p) => (p._id === editingId ? updatedProduct : p))
      );
    } else {
      const res = await api.post("/products", productData);
      updatedProduct = res.data;
      setProducts((prev) => [...prev, updatedProduct]);
    }

    // 초기화
    setEditingId(null);
    setForm({ name: "", price: "", description: "", imageUrl: "" });
    setFile(null);
  } catch (err) {
    console.error("❌ 상품 저장 실패:", err);
  }
};


  // ✅ 수정 모드 진입
  const startEdit = (p) => {
    setEditingId(p._id);
    setForm({
      name: p.name,
      price: p.price,
      description: p.description,
      imageUrl: p.imageUrl || p.image || "",
    });
    setFile(null);
  };

  // ✅ 수정 취소
  const cancelEdit = () => {
    setEditingId(null);
    setForm({ name: "", price: "", description: "", imageUrl: "" });
    setFile(null);
  };

  // ✅ 상품 삭제
  const deleteProduct = async (id) => {
    if (!window.confirm("정말 삭제하시겠습니까?")) return;
    try {
      await api.delete(`/products/${id}`);
      setProducts((prev) => prev.filter((p) => p._id !== id));
    } catch (err) {
      console.error("❌ 상품 삭제 실패:", err);
    }
  };

  // ✅ 파일 선택 시 미리보기 즉시 갱신
  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    setFile(selected);
    if (selected) {
      const previewUrl = URL.createObjectURL(selected);
      setForm((prev) => ({ ...prev, imageUrl: previewUrl }));
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>📦 관리자 페이지</h1>
      <h2>{editingId ? "상품 수정" : "상품 추가"}</h2>

      <div style={{ display: "flex", flexDirection: "column", gap: "10px", width: "300px" }}>
        <input
          type="text"
          placeholder="상품명"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
        <input
          type="number"
          placeholder="가격"
          value={form.price}
          onChange={(e) => setForm({ ...form, price: e.target.value })}
        />
        <input
          type="text"
          placeholder="설명"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />
        <input type="file" accept="image/*" onChange={handleFileChange} />
        {uploading && <p>🕓 이미지 업로드 중...</p>}

        {/* ✅ 미리보기 */}
        <img
          src={form.imageUrl || noImage}
          alt="미리보기"
          style={{
            width: "250px",
            height: "200px",
            objectFit: "cover",
            borderRadius: "8px",
            marginTop: "10px",
          }}
        />

        <button onClick={saveProduct}>{editingId ? "💾 수정 완료" : "➕ 상품 추가"}</button>
        {editingId && <button onClick={cancelEdit}>취소</button>}
      </div>

      <h2 style={{ marginTop: "40px" }}>상품 목록</h2>
      <ul style={{ listStyle: "none", padding: 0 }}>
  {products.map((p) => {
    const imgSrc = (() => {
      const url = p.imageUrl || p.image || noImage;
      // ✅ base64 형태이면 그대로 사용 (쿼리 안 붙임)
      if (url.startsWith("data:image")) return url;
      // ✅ 일반 URL이면 캐시 무효화를 위해 쿼리 추가
      return `${url}?v=${Date.now()}`;
    })();

    return (
      <li
        key={p._id}
        style={{
          marginBottom: "20px",
          padding: "10px",
          border: "1px solid #ddd",
          borderRadius: "10px",
          display: "flex",
          alignItems: "center",
          gap: "10px",
        }}
      >
        <img
          src={imgSrc}
          alt={p.name}
          style={{
            width: "80px",
            height: "80px",
            objectFit: "cover",
            borderRadius: "8px",
          }}
        />
        <div style={{ flex: 1 }}>
          <strong>{p.name}</strong> - {p.price}원 <br />
          <small>{p.description}</small>
        </div>
        <button onClick={() => startEdit(p)}>✏️ 수정</button>
        <button onClick={() => deleteProduct(p._id)}>🗑 삭제</button>
      </li>
    );
  })}
</ul>
    </div>
  );
}

export default Admin;
