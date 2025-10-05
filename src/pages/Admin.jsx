import { useEffect, useState } from "react";
import api from "../lib/api";
import noImage from "../assets/no-image.png";

function Admin() {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({
    name: "",
    price: "",
    description: "",
    imageUrl: "",
  });
  const [imageFile, setImageFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // ✅ 처음 로드 시 상품 목록 가져오기
  useEffect(() => {
    fetchProducts();
  }, []);

  // ✅ 상품 불러오기
  const fetchProducts = async () => {
    try {
      const res = await api.get("/products");
      setProducts(res.data);
    } catch (err) {
      console.error("❌ 상품 불러오기 실패:", err);
      alert("상품 목록을 불러오는 중 오류가 발생했습니다.");
    }
  };

  // ✅ 입력값 변경 처리
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // ✅ 이미지 파일 선택
  const handleImageChange = (e) => {
    setImageFile(e.target.files[0]);
  };

  // ✅ 이미지 Cloudinary 업로드 (백엔드 경유)
  const uploadImage = async () => {
    if (!imageFile) return null;
    setUploading(true);

    const formData = new FormData();
    formData.append("image", imageFile);

    try {
      // ✅ /api 중복 제거 → "/upload" 만
      const res = await api.post("/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setUploading(false);
      return res.data.imageUrl;
    } catch (err) {
      setUploading(false);
      console.error("❌ 이미지 업로드 실패:", err);
      alert("이미지 업로드에 실패했습니다.");
      return null;
    }
  };

  // ✅ 상품 추가
  const addProduct = async () => {
    if (!form.name || !form.price) {
      alert("상품명과 가격은 필수입니다!");
      return;
    }

    let imageUrl = "";
    if (imageFile) imageUrl = await uploadImage();

    try {
      await api.post("/products", { ...form, imageUrl });
      setForm({ name: "", price: "", description: "", imageUrl: "" });
      setImageFile(null);
      fetchProducts();
    } catch (err) {
      console.error("❌ 상품 추가 실패:", err);
      alert("상품 추가 중 오류가 발생했습니다.");
    }
  };

  // ✅ 수정 모드 진입
  const startEdit = (product) => {
    setEditingId(product._id);
    setForm({
      name: product.name,
      price: product.price,
      description: product.description,
      imageUrl: product.imageUrl || "",
    });
  };

  // ✅ 상품 수정
  const updateProduct = async () => {
    if (!editingId) return;

    let imageUrl = form.imageUrl;
    if (imageFile) imageUrl = await uploadImage();

    try {
      await api.put(`/products/${editingId}`, { ...form, imageUrl });
      setEditingId(null);
      setForm({ name: "", price: "", description: "", imageUrl: "" });
      setImageFile(null);
      fetchProducts();
    } catch (err) {
      console.error("❌ 상품 수정 실패:", err);
      alert("상품 수정 중 오류가 발생했습니다.");
    }
  };

  // ✅ 상품 삭제
  const deleteProduct = async (id) => {
    if (!window.confirm("정말 삭제하시겠습니까?")) return;
    try {
      await api.delete(`/products/${id}`);
      fetchProducts();
    } catch (err) {
      console.error("❌ 상품 삭제 실패:", err);
      alert("상품 삭제 중 오류가 발생했습니다.");
    }
  };

  // ✅ 수정 취소
  const cancelEdit = () => {
    setEditingId(null);
    setForm({ name: "", price: "", description: "", imageUrl: "" });
    setImageFile(null);
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>📦 관리자 페이지</h1>

      <h2>{editingId ? "상품 수정" : "상품 추가"}</h2>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "10px",
          width: "300px",
        }}
      >
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
        <input type="file" accept="image/*" onChange={handleImageChange} />
        {uploading && <p>🕓 이미지 업로드 중...</p>}

        {/* ✅ 이미지 미리보기 */}
        {form.imageUrl && (
          <img
            src={form.imageUrl || noImage}
            alt="업로드된 이미지"
            style={{
              width: "250px",
              height: "200px",
              objectFit: "cover",
              borderRadius: "8px",
              marginTop: "10px",
            }}
          />
        )}

        {editingId ? (
          <>
            <button onClick={updateProduct}>💾 수정 완료</button>
            <button onClick={cancelEdit}>❌ 취소</button>
          </>
        ) : (
          <button onClick={addProduct}>➕ 추가</button>
        )}
      </div>

      <h2 style={{ marginTop: "40px" }}>상품 목록</h2>
      <ul style={{ listStyle: "none", padding: 0 }}>
        {products.map((p) => (
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
              src={p.imageUrl || noImage}
              alt={p.name || "이미지 없음"}
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
        ))}
      </ul>
    </div>
  );
}

export default Admin;
