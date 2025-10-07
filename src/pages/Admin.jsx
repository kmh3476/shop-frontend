import { useEffect, useState } from "react";
import api from "../lib/api";
import noImage from "../assets/no-image.png";

// ✅ 모달 컴포넌트
function ImageModal({ imageUrl, onClose }) {
  if (!imageUrl) return null;
  return (
    <div
      className="fixed inset-0 bg-black/70 flex justify-center items-center z-50"
      onClick={onClose}
    >
      <div
        className="relative flex justify-center items-center"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={imageUrl}
          alt="Product"
          className="max-w-[90vw] max-h-[90vh] object-contain rounded-lg shadow-lg"
        />
        <button
          className="absolute top-3 right-3 text-white bg-black/50 rounded-full px-3 py-1 hover:bg-black/70 transition"
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
    mainImage: "", // ✅ 대표 이미지 추가
  });
  const [files, setFiles] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

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

    try {
      const uploadedUrls = [];
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
      console.error("❌ 이미지 업로드 실패:", err);
      alert("이미지 업로드에 실패했습니다.");
      setUploading(false);
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
      name: form.name.trim(),
      price: Number(form.price),
      description: form.description.trim(),
      images: uploadedImages,
      mainImage:
        form.mainImage ||
        uploadedImages[0] ||
        "https://placehold.co/250x200?text=No+Image", // ✅ 대표 이미지
    };

    try {
      let result;
      if (editingId) {
        result = await api.put(`/products/${editingId}`, productData);
        setProducts((prev) =>
          prev.map((p) => (p._id === editingId ? result.data : p))
        );
      } else {
        result = await api.post("/products", productData);
        setProducts((prev) => [...prev, result.data]);
      }

      // ✅ 폼 초기화
      setEditingId(null);
      setForm({
        name: "",
        price: "",
        description: "",
        images: [],
        mainImage: "",
      });
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
      images: p.images || [],
      mainImage: p.mainImage || p.image || "", // ✅ 대표 이미지 불러오기
    });
    setFiles([]);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm({
      name: "",
      price: "",
      description: "",
      images: [],
      mainImage: "",
    });
    setFiles([]);
  };

  // ✅ 파일 선택
  const handleFileChange = (e) => {
    const selected = Array.from(e.target.files);
    setFiles(selected);
    const previewUrls = selected.map((file) => URL.createObjectURL(file));
    setForm((prev) => ({
      ...prev,
      images: [...prev.images, ...previewUrls],
    }));
  };

  const removeImage = (index) => {
    const newImages = form.images.filter((_, i) => i !== index);
    const newMain =
      form.mainImage === form.images[index] ? newImages[0] || "" : form.mainImage;
    setForm({ ...form, images: newImages, mainImage: newMain });
  };

  // ✅ 대표 이미지 선택
  const setAsMainImage = (img) => {
    setForm((prev) => ({ ...prev, mainImage: img }));
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
        <textarea
          placeholder="설명"
          rows={3}
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />

        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileChange}
        />

        {uploading && <p>🕓 이미지 업로드 중...</p>}

        {/* ✅ 이미지 미리보기 + 대표 설정 */}
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
                  border:
                    img === form.mainImage ? "3px solid blue" : "1px solid #ccc",
                  cursor: "pointer",
                }}
                onClick={() => setAsMainImage(img)}
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
              {img === form.mainImage && (
                <span
                  style={{
                    position: "absolute",
                    bottom: "-18px",
                    left: "0",
                    fontSize: "12px",
                    color: "blue",
                  }}
                >
                  대표
                </span>
              )}
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
          const thumbnail =
            p.mainImage ||
            (p.images && p.images[0]) ||
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
                src={thumbnail}
                alt={p.name}
                style={{
                  width: "80px",
                  height: "80px",
                  objectFit: "cover",
                  borderRadius: "8px",
                  cursor: "pointer",
                }}
                onClick={() => setSelectedImage(thumbnail)}
                onError={(e) =>
                  (e.currentTarget.src =
                    "https://placehold.co/100x100?text=No+Image")
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

      <ImageModal
        imageUrl={selectedImage}
        onClose={() => setSelectedImage(null)}
      />
    </div>
  );
}

export default Admin;
