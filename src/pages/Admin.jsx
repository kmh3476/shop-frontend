import { useEffect, useState } from "react";
import api from "../lib/api";
import noImage from "../assets/no-image.png";

// ✅ 모달 컴포넌트
function ImageModal({ imageUrl, onClose }) {
  if (!imageUrl) return null;
  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50"
      onClick={onClose}
    >
      <div
        className="relative max-w-[90vw] max-h-[90vh] flex justify-center items-center"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={imageUrl}
          alt="Product"
          className="max-w-full max-h-full rounded-lg shadow-lg"
        />
        <button
          className="absolute top-2 right-2 text-white bg-black bg-opacity-50 rounded-full p-2 hover:bg-opacity-70 transition"
          onClick={onClose}
        >
          ✖
        </button>
      </div>
    </div>
  );
}

function Admin() {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({
    name: "",
    price: "",
    description: "",
    images: [],
  });
  const [files, setFiles] = useState([]); // ✅ 다중 파일
  const [editingId, setEditingId] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

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

  // ✅ 여러 이미지 업로드
  const handleImageUpload = async () => {
    if (files.length === 0) return form.images;

    setUploading(true);
    const uploadedUrls = [];

    try {
      for (const file of files) {
        const formData = new FormData();
        formData.append("image", file);

        const res = await api.post("/upload", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        uploadedUrls.push(res.data.imageUrl);
      }

      setUploading(false);
      return [...form.images, ...uploadedUrls];
    } catch (err) {
      setUploading(false);
      console.error("❌ 이미지 업로드 실패:", err);
      alert("이미지 업로드에 실패했습니다.");
      return form.images;
    }
  };

  // ✅ 상품 저장
  const saveProduct = async () => {
    if (!form.name || !form.price) {
      alert("상품명과 가격은 필수입니다!");
      return;
    }

    const uploadedImages = await handleImageUpload();

    const productData = {
      ...form,
      images: uploadedImages.length > 0 ? uploadedImages : form.images,
    };

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

      setEditingId(null);
      setForm({ name: "", price: "", description: "", images: [] });
      setFiles([]);
    } catch (err) {
      console.error("❌ 상품 저장 실패:", err);
    }
  };

  // ✅ 수정 모드
  const startEdit = (p) => {
    setEditingId(p._id);
    setForm({
      name: p.name,
      price: p.price,
      description: p.description,
      images: p.images || (p.imageUrl ? [p.imageUrl] : []),
    });
    setFiles([]);
  };

  // ✅ 수정 취소
  const cancelEdit = () => {
    setEditingId(null);
    setForm({ name: "", price: "", description: "", images: [] });
    setFiles([]);
  };

  // ✅ 이미지 미리보기 + 삭제
  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setFiles(selectedFiles);

    const previewUrls = selectedFiles.map((file) => URL.createObjectURL(file));
    setForm((prev) => ({
      ...prev,
      images: [...prev.images, ...previewUrls],
    }));
  };

  const removeImage = (index) => {
    setForm((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const deleteProduct = async (id) => {
    if (!window.confirm("정말 삭제하시겠습니까?")) return;
    try {
      await api.delete(`/products/${id}`);
      setProducts((prev) => prev.filter((p) => p._id !== id));
    } catch (err) {
      console.error("❌ 상품 삭제 실패:", err);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>📦 관리자 페이지</h1>
      <h2>{editingId ? "상품 수정" : "상품 추가"}</h2>

      {/* ✅ 상품 입력폼 */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "10px",
          width: "320px",
        }}
      >
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

        {/* ✅ 여러 장 업로드 */}
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileChange}
        />

        {uploading && <p>🕓 이미지 업로드 중...</p>}

        {/* ✅ 이미지 미리보기 */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "10px",
            marginTop: "10px",
          }}
        >
          {form.images.map((img, idx) => (
            <div key={idx} style={{ position: "relative" }}>
              <img
                src={img}
                alt={`preview-${idx}`}
                style={{
                  width: "80px",
                  height: "80px",
                  objectFit: "cover",
                  borderRadius: "6px",
                  cursor: "pointer",
                }}
                onClick={() => setSelectedImage(img)}
              />
              <button
                onClick={() => removeImage(idx)}
                style={{
                  position: "absolute",
                  top: "-6px",
                  right: "-6px",
                  background: "rgba(0,0,0,0.6)",
                  color: "white",
                  border: "none",
                  borderRadius: "50%",
                  width: "20px",
                  height: "20px",
                  cursor: "pointer",
                }}
              >
                ✖
              </button>
            </div>
          ))}
        </div>

        <button onClick={saveProduct}>
          {editingId ? "💾 수정 완료" : "➕ 상품 추가"}
        </button>
        {editingId && <button onClick={cancelEdit}>취소</button>}
      </div>

      {/* ✅ 상품 목록 */}
      <h2 style={{ marginTop: "40px" }}>상품 목록</h2>
      <ul style={{ listStyle: "none", padding: 0 }}>
        {products.map((p) => {
          const firstImage =
            (p.images && p.images[0]) ||
            p.imageUrl ||
            "https://placehold.co/100x100?text=No+Image";
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
                src={firstImage}
                alt={p.name}
                style={{
                  width: "80px",
                  height: "80px",
                  objectFit: "cover",
                  borderRadius: "8px",
                  cursor: "pointer",
                }}
                onClick={() => setSelectedImage(firstImage)}
                onError={(e) =>
                  (e.currentTarget.src = "https://placehold.co/100x100?text=No+Image")
                }
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

      {/* ✅ 이미지 확대 모달 */}
      <ImageModal imageUrl={selectedImage} onClose={() => setSelectedImage(null)} />
    </div>
  );
}

export default Admin;
