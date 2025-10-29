import { useEffect, useState } from "react";
import api from "../lib/api";
import noImage from "../assets/no-image.png";

// ✅ 다중 이미지 모달
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
        <button
          className="absolute top-3 right-3 text-white bg-black/50 rounded-full px-3 py-1 hover:bg-black/70 transition"
          onClick={onClose}
        >
          ✖
        </button>

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
    categoryPage: "",
  });
  const [pages, setPages] = useState([]);
  const [newPage, setNewPage] = useState({ name: "", label: "", order: 0 }); // ✅ 추가됨
  const [editingId, setEditingId] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [modalImages, setModalImages] = useState([]);
  const [modalIndex, setModalIndex] = useState(0);

  useEffect(() => {
    fetchProducts();
    fetchPages();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await api.get("/products?populate=categoryPage");
      setProducts(res.data);
    } catch (err) {
      console.error("❌ 상품 불러오기 실패:", err);
    }
  };

  // ✅ 탭 목록 불러오기
  const fetchPages = async () => {
    try {
      const res = await api.get("/api/pages");
      const sorted = res.data.sort((a, b) => a.order - b.order);
      setPages(sorted);
    } catch (err) {
      console.error("❌ 탭 목록 불러오기 실패:", err);
    }
  };

  // ✅ 새 탭 생성
  const addPage = async () => {
    if (!newPage.name || !newPage.label) {
      alert("탭 이름(name)과 표시명(label)을 입력해주세요!");
      return;
    }
    try {
      const res = await api.post("/api/pages", {
        ...newPage,
        order: newPage.order || pages.length + 1,
      });
      alert("✅ 새 탭이 추가되었습니다!");
      setNewPage({ name: "", label: "", order: 0 });
      fetchPages();
    } catch (err) {
      console.error("❌ 탭 추가 실패:", err);
      alert(err.response?.data?.message || "탭 생성 실패");
    }
  };

  // ✅ 탭 삭제
  const deletePage = async (id) => {
    if (!window.confirm("정말 이 탭을 삭제할까요?")) return;
    try {
      await api.delete(`/api/pages/${id}`);
      fetchPages();
    } catch (err) {
      console.error("❌ 탭 삭제 실패:", err);
    }
  };

  // ✅ 탭 이름 수정
  const renamePage = async (id, label) => {
    try {
      await api.put(`/api/pages/${id}`, { label });
      fetchPages();
    } catch (err) {
      console.error("❌ 이름 수정 실패:", err);
    }
  };

  // ✅ 탭 순서 변경
  const movePage = async (id, direction) => {
    const index = pages.findIndex((p) => p._id === id);
    if (index === -1) return;

    const newPages = [...pages];
    if (direction === "up" && index > 0) {
      [newPages[index - 1], newPages[index]] = [newPages[index], newPages[index - 1]];
    } else if (direction === "down" && index < newPages.length - 1) {
      [newPages[index + 1], newPages[index]] = [newPages[index], newPages[index + 1]];
    } else return;

    const updated = newPages.map((p, i) => ({ ...p, order: i + 1 }));
    setPages(updated);

    try {
      await Promise.all(
        updated.map((p) => api.put(`/api/pages/${p._id}`, { order: p.order }))
      );
      fetchPages();
    } catch (err) {
      console.error("❌ 순서 업데이트 실패:", err);
    }
  };

  // ✅ Cloudinary 업로드
  const uploadSingle = async (file) => {
    try {
      const formData = new FormData();
      formData.append("image", file);

      const res = await api.post("/api/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return res.data?.imageUrl || null;
    } catch (err) {
      console.error("❌ 단일 업로드 실패:", err);
      return null;
    }
  };

  const handleImageUpload = async (filesToUpload) => {
    const uploadedUrls = [];
    setUploading("🕓 이미지 업로드 중...");

    for (let i = 0; i < filesToUpload.length; i++) {
      const file = filesToUpload[i];
      const url = await uploadSingle(file);
      if (url) uploadedUrls.push(url);
      await new Promise((r) => setTimeout(r, 500));
    }

    setUploading(false);
    return uploadedUrls;
  };

  const handleFileChange = async (e) => {
    const selected = Array.from(e.target.files);
    if (!selected.length) return;
    const previews = selected.map((f) => URL.createObjectURL(f));
    setForm((prev) => ({ ...prev, images: [...prev.images, ...previews] }));
    const uploaded = await handleImageUpload(selected);
    if (uploaded.length) {
      setForm((prev) => {
        const replaced = prev.images.map((img) =>
          img.startsWith("blob:") ? uploaded.shift() || img : img
        );
        return {
          ...prev,
          images: replaced.filter(Boolean),
          mainImage: prev.mainImage || replaced[0],
        };
      });
    }
  };

  // ✅ 상품 저장
  const saveProduct = async () => {
    if (!form.name || !form.price) {
      alert("상품명과 가격은 필수입니다!");
      return;
    }

    const cleanImages = form.images
      .filter((i) => i && i.startsWith("http"))
      .filter((v, i, arr) => arr.indexOf(v) === i);

    const mainImg =
      form.mainImage && cleanImages.includes(form.mainImage)
        ? form.mainImage
        : cleanImages[0] || "https://placehold.co/250x200?text=No+Image";

    const productData = {
      name: form.name.trim(),
      price: Number(form.price),
      description: form.description.trim(),
      images: cleanImages,
      mainImage: mainImg,
      categoryPage: form.categoryPage || null,
    };

    try {
      setUploading("🕓 상품 저장 중...");
      if (editingId) {
        await api.put(`/products/${editingId}`, productData);
      } else {
        await api.post("/products", productData);
      }
      fetchProducts();
      setEditingId(null);
      setForm({
        name: "",
        price: "",
        description: "",
        images: [],
        mainImage: "",
        categoryPage: "",
      });
      setUploading(false);
    } catch (err) {
      console.error("❌ 상품 저장 실패:", err);
      setUploading(false);
    }
  };

  const startEdit = (p) => {
    setEditingId(p._id);
    setForm({
      name: p.name,
      price: p.price,
      description: p.description,
      images: p.images || [],
      mainImage: p.mainImage || p.images?.[0] || "",
      categoryPage: p.categoryPage?._id || "",
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm({
      name: "",
      price: "",
      description: "",
      images: [],
      mainImage: "",
      categoryPage: "",
    });
  };

  const removeImage = (index) => {
    const newImages = form.images.filter((_, i) => i !== index);
    const newMain =
      form.mainImage === form.images[index] ? newImages[0] || "" : form.mainImage;
    setForm({ ...form, images: newImages, mainImage: newMain });
  };

  const setAsMainImage = (img) =>
    setForm((prev) => ({ ...prev, mainImage: img }));

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

      {/* ✅ 새 탭 추가 영역 */}
      <div
        style={{
          border: "1px solid #ccc",
          padding: "10px",
          borderRadius: "8px",
          marginBottom: "20px",
          maxWidth: "320px",
        }}
      >
        <h3>🆕 새 탭 추가</h3>
        <input
          type="text"
          placeholder="탭 이름 (name)"
          value={newPage.name}
          onChange={(e) => setNewPage({ ...newPage, name: e.target.value })}
          style={{ width: "100%", marginBottom: "6px" }}
        />
        <input
          type="text"
          placeholder="표시명 (label)"
          value={newPage.label}
          onChange={(e) => setNewPage({ ...newPage, label: e.target.value })}
          style={{ width: "100%", marginBottom: "6px" }}
        />
        <input
          type="number"
          placeholder="순서 (order)"
          value={newPage.order}
          onChange={(e) => setNewPage({ ...newPage, order: Number(e.target.value) })}
          style={{ width: "100%", marginBottom: "6px" }}
        />
        <button onClick={addPage} style={{ width: "100%" }}>
          ➕ 탭 추가
        </button>
      </div>

      {/* ✅ 탭 목록 */}
      <h2>🗂 등록된 탭 목록</h2>
      <ul style={{ listStyle: "none", padding: 0 }}>
        {pages.map((p) => (
          <li
            key={p._id}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              borderBottom: "1px solid #ddd",
              padding: "5px 0",
            }}
          >
            <span>
              {p.order}. <strong>{p.label}</strong> ({p.name})
            </span>
            <button onClick={() => movePage(p._id, "up")}>▲</button>
            <button onClick={() => movePage(p._id, "down")}>▼</button>
            <button
              onClick={() => {
                const newLabel = prompt("새 탭 이름을 입력하세요", p.label);
                if (newLabel) renamePage(p._id, newLabel);
              }}
            >
              ✏️ 이름수정
            </button>
            <button onClick={() => deletePage(p._id)}>🗑 삭제</button>
          </li>
        ))}
      </ul>

      {/* ✅ 상품 관리 섹션 */}
      <h2 style={{ marginTop: "40px" }}>{editingId ? "상품 수정" : "상품 추가"}</h2>
      {/* 🔻 기존 상품 입력/이미지 업로드 부분 그대로 유지 🔻 */}
      {/* ... (나머지 코드 그대로 유지) */}

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
              src={
                p.mainImage ||
                p.images?.[0] ||
                "https://placehold.co/100x100?text=No+Image"
              }
              alt={p.name}
              style={{
                width: "80px",
                height: "80px",
                objectFit: "cover",
                borderRadius: "8px",
                cursor: "pointer",
              }}
              onClick={() => {
                setModalImages(p.images?.length ? p.images : [p.mainImage]);
                setModalIndex(0);
              }}
            />
            <div style={{ flex: 1 }}>
              <strong>{p.name}</strong> - {p.price}원 <br />
              <small>{p.description}</small>
              {p.categoryPage?.label && (
                <p style={{ fontSize: "12px", color: "gray" }}>
                  📂 탭: {p.categoryPage.label}
                </p>
              )}
            </div>
            <button onClick={() => startEdit(p)}>✏️ 수정</button>
            <button onClick={() => deleteProduct(p._id)}>🗑 삭제</button>
          </li>
        ))}
      </ul>

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
