import { useEffect, useState } from "react";
import api from "../lib/api";
import noImage from "../assets/no-image.png";

// ✅ 다중 이미지 지원 모달 컴포넌트
function ImageModal({ images = [], startIndex = 0, onClose }) {
  const [current, setCurrent] = useState(startIndex);

  if (!images.length) return null;

  const handlePrev = (e) => {
    e.stopPropagation();
    setCurrent((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleNext = (e) => {
    e.stopPropagation();
    setCurrent((prev) => (prev + 1) % images.length);
  };

  return (
    <div
      className="fixed inset-0 bg-black/80 flex justify-center items-center z-50"
      onClick={onClose}
    >
      <div
        className="relative flex justify-center items-center"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={images[current]}
          alt="Product"
          className="max-w-[90vw] max-h-[90vh] object-contain rounded-lg shadow-2xl transition"
          onError={(e) => (e.currentTarget.src = noImage)}
        />
        {/* 닫기 버튼 */}
        <button
          className="absolute top-3 right-3 text-white bg-black/50 rounded-full px-3 py-1 hover:bg-black/70 transition"
          onClick={onClose}
        >
          ✖
        </button>

        {/* 이전/다음 버튼 */}
        {images.length > 1 && (
          <>
            <button
              onClick={handlePrev}
              className="absolute left-5 text-white text-3xl bg-black/40 px-3 py-2 rounded-full hover:bg-black/60 transition"
            >
              ‹
            </button>
            <button
              onClick={handleNext}
              className="absolute right-5 text-white text-3xl bg-black/40 px-3 py-2 rounded-full hover:bg-black/60 transition"
            >
              ›
            </button>
            <div className="absolute bottom-4 text-white text-sm bg-black/50 px-3 py-1 rounded-lg">
              {current + 1} / {images.length}
            </div>
          </>
        )}
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
    mainImage: "",
  });
  const [files, setFiles] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [uploading, setUploading] = useState(false);

  // ✅ 모달 관련 상태
  const [modalImages, setModalImages] = useState([]);
  const [modalIndex, setModalIndex] = useState(0);

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
  if (files.length === 0) return form.images.filter((img) => !img.startsWith("blob:"));
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
    // ✅ blob: URL 제거 후 Cloudinary URL만 병합
    const existingValidImages = form.images.filter((img) => !img.startsWith("blob:"));
    return [...existingValidImages, ...uploadedUrls];
  } catch (err) {
    console.error("❌ 이미지 업로드 실패:", err);
    alert("이미지 업로드에 실패했습니다.");
    setUploading(false);
    return form.images.filter((img) => !img.startsWith("blob:"));
  }
};


  const saveProduct = async () => {
    if (!form.name || !form.price) {
      alert("상품명과 가격은 필수입니다!");
      return;
    }

    const uploadedImages = await handleImageUpload();

// ✅ blob: URL 제거 (업로드 안 된 미리보기 주소 제거)
const cleanImages = [...form.images, ...uploadedImages].filter(
  (img) => !img.startsWith("blob:")
);

// ✅ 대표 이미지가 사라지지 않도록 처리
const productData = {
  name: form.name.trim(),
  price: Number(form.price),
  description: form.description.trim(),
  images: cleanImages,
  mainImage:
    cleanImages.includes(form.mainImage)
      ? form.mainImage
      : cleanImages[0] || "https://placehold.co/250x200?text=No+Image",
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

  const startEdit = (p) => {
    setEditingId(p._id);
    setForm({
      name: p.name,
      price: p.price,
      description: p.description,
      images: p.images || [],
      mainImage: p.mainImage || p.image || "",
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

  const setAsMainImage = (img) => {
    setForm((prev) => ({ ...prev, mainImage: img }));
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

      {/* ✅ 상품 입력폼 (기존 그대로 유지) */}
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
                onClick={() => {
                  setModalImages(p.images?.length ? p.images : [thumbnail]);
                  setModalIndex(0);
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

      {/* ✅ 다중 이미지 모달 */}
      {modalImages.length > 0 && (
        <ImageModal
          images={modalImages}
          startIndex={modalIndex}
          onClose={() => setModalImages([])}
        />
      )}
    </div>
  );
}

export default Admin;
