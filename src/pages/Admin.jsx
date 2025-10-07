import { useEffect, useState } from "react";
import api from "../lib/api";
import noImage from "../assets/no-image.png";

// ✅ 모달 컴포넌트 (이미지 넘기기 가능)
function ImageModal({ images = [], currentIndex = 0, onClose }) {
  const [index, setIndex] = useState(currentIndex);

  if (!images || images.length === 0) return null;

  const handlePrev = (e) => {
    e.stopPropagation();
    setIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNext = (e) => {
    e.stopPropagation();
    setIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const imageUrl = images[index] || noImage;

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
          src={imageUrl}
          alt={`Product ${index + 1}`}
          className="max-w-[90vw] max-h-[85vh] object-contain rounded-lg shadow-lg"
          onError={(e) => (e.currentTarget.src = noImage)}
        />

        {/* 닫기 */}
        <button
          className="absolute top-3 right-3 text-white bg-black/60 rounded-full px-3 py-1 hover:bg-black/80 transition"
          onClick={onClose}
        >
          ✖
        </button>

        {/* 좌우 버튼 */}
        {images.length > 1 && (
          <>
            <button
              onClick={handlePrev}
              className="absolute left-5 text-white bg-black/40 hover:bg-black/70 p-3 rounded-full text-2xl"
            >
              ‹
            </button>
            <button
              onClick={handleNext}
              className="absolute right-5 text-white bg-black/40 hover:bg-black/70 p-3 rounded-full text-2xl"
            >
              ›
            </button>
            <div className="absolute bottom-4 text-white text-sm bg-black/50 px-3 py-1 rounded-full">
              {index + 1} / {images.length}
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

  // ✅ 모달 상태
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

  // ✅ 이미지 업로드
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
      alert("이미지 업로드 실패");
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
        "https://placehold.co/250x200?text=No+Image",
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

      {/* ✅ 상품 목록 */}
      <h2 style={{ marginTop: "40px" }}>상품 목록</h2>
      <ul style={{ listStyle: "none", padding: 0 }}>
        {products.map((p) => {
          const thumb =
            p.mainImage || (p.images && p.images[0]) || noImage;

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
              {/* ✅ 이미지 클릭 시 모든 이미지 모달로 보기 */}
              <img
                src={thumb}
                alt={p.name}
                style={{
                  width: "80px",
                  height: "80px",
                  objectFit: "cover",
                  borderRadius: "8px",
                  cursor: "pointer",
                }}
                onClick={() => {
                  setModalImages(p.images || [thumb]);
                  setModalIndex(0);
                }}
                onError={(e) => (e.currentTarget.src = noImage)}
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

      {/* ✅ 여러 장 넘길 수 있는 모달 */}
      {modalImages.length > 0 && (
        <ImageModal
          images={modalImages}
          currentIndex={modalIndex}
          onClose={() => setModalImages([])}
        />
      )}
    </div>
  );
}

export default Admin;
