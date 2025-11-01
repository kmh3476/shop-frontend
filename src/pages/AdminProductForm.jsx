import { useState, useEffect } from "react";
import api from "../lib/api";
import noImage from "../assets/no-image.png";

// ✅ 로그인 토큰 자동 포함
const getAuthHeader = () => {
  const token =
    localStorage.getItem("token") || sessionStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

function AdminProductForm({ selectedPage, onSave }) {
  const [form, setForm] = useState({
    name: "",
    price: "",
    description: "",
    images: [],
    mainImage: "",
    categoryPage: selectedPage || "",
  });

  const [pages, setPages] = useState([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchPages();
  }, []);

  useEffect(() => {
    if (selectedPage) {
      setForm((prev) => ({ ...prev, categoryPage: selectedPage }));
    }
  }, [selectedPage]);

  // ✅ 탭(카테고리 페이지) 목록 불러오기
  const fetchPages = async () => {
    try {
      const res = await api.get("/api/pages", { headers: getAuthHeader() });
      setPages(res.data || []);
    } catch (err) {
      console.error("❌ 탭 불러오기 실패:", err);
    }
  };

  // ✅ Cloudinary 단일 업로드
  const uploadSingle = async (file) => {
    try {
      const formData = new FormData();
      formData.append("image", file);
      const res = await api.post("/api/upload", formData, {
        headers: { "Content-Type": "multipart/form-data", ...getAuthHeader() },
      });
      return res.data?.imageUrl || null;
    } catch (err) {
      console.error("❌ 이미지 업로드 실패:", err);
      return null;
    }
  };

  // ✅ 여러 이미지 업로드
  const handleImageUpload = async (filesToUpload) => {
    const uploadedUrls = [];
    setUploading("🕓 이미지 업로드 중...");
    for (let i = 0; i < filesToUpload.length; i++) {
      const file = filesToUpload[i];
      const url = await uploadSingle(file);
      if (url) uploadedUrls.push(url);
      await new Promise((r) => setTimeout(r, 300));
    }
    setUploading(false);
    return uploadedUrls;
  };

  // ✅ 이미지 선택 시 업로드 처리
  const handleFileChange = async (e) => {
    const selected = Array.from(e.target.files);
    if (!selected.length) return;

    // 미리보기
    const previews = selected.map((f) => URL.createObjectURL(f));
    setForm((prev) => ({ ...prev, images: [...prev.images, ...previews] }));

    // 업로드
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

  // ✅ 메인 이미지 설정
  const setAsMainImage = (img) => {
    setForm((prev) => ({ ...prev, mainImage: img }));
  };

  // ✅ 이미지 제거
  const removeImage = (index) => {
    const newImages = form.images.filter((_, i) => i !== index);
    const newMain =
      form.mainImage === form.images[index] ? newImages[0] || "" : form.mainImage;
    setForm({ ...form, images: newImages, mainImage: newMain });
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
      categoryPage:
        form.categoryPage && form.categoryPage !== "null" && form.categoryPage !== ""
          ? form.categoryPage
          : selectedPage || null,
    };

    try {
      setUploading("🕓 상품 저장 중...");
      await api.post("/products", productData, { headers: getAuthHeader() });
      alert("✅ 상품이 추가되었습니다!");
      if (onSave) onSave();
      setForm({
        name: "",
        price: "",
        description: "",
        images: [],
        mainImage: "",
        categoryPage: selectedPage || "",
      });
      setUploading(false);
    } catch (err) {
      console.error("❌ 상품 저장 실패:", err);
      alert("상품 저장 실패 (권한 필요)");
      setUploading(false);
    }
  };

  return (
    <div
      style={{
        border: "1px solid #ccc",
        borderRadius: "10px",
        padding: "20px",
        maxWidth: "400px",
        marginBottom: "30px",
      }}
    >
      <h3>🛒 상품 추가</h3>
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
        placeholder="상품 설명"
        rows={3}
        value={form.description}
        onChange={(e) => setForm({ ...form, description: e.target.value })}
      />
      <select
        value={form.categoryPage}
        onChange={(e) => setForm({ ...form, categoryPage: e.target.value })}
      >
        <option value="">탭 선택 없음</option>
        {pages.map((p) => (
          <option key={p._id} value={p._id}>
            {p.label}
          </option>
        ))}
      </select>
      {/* ✅ 이미지 업로드 입력 */}
      <input
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileChange}
        style={{ marginTop: "10px" }}
      />

      {/* ✅ 업로드 상태 표시 */}
      {uploading && (
        <p style={{ color: "blue", marginTop: "8px" }}>
          {uploading === true ? "업로드 중..." : uploading}
        </p>
      )}

      {/* ✅ 이미지 미리보기 */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "8px",
          marginTop: "10px",
        }}
      >
        {form.images.map((img, idx) => (
          <div key={idx} style={{ position: "relative" }}>
            <img
              src={img || noImage}
              alt="preview"
              style={{
                width: "80px",
                height: "80px",
                objectFit: "cover",
                border:
                  img === form.mainImage ? "3px solid blue" : "1px solid #ccc",
                borderRadius: "6px",
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
          </div>
        ))}
      </div>

      {/* ✅ 메인 이미지 표시 */}
      {form.mainImage && (
        <div style={{ marginTop: "10px" }}>
          <p style={{ fontSize: "12px", color: "gray" }}>메인 이미지 미리보기</p>
          <img
            src={form.mainImage || noImage}
            alt="main"
            style={{
              width: "120px",
              height: "120px",
              objectFit: "cover",
              borderRadius: "8px",
              border: "2px solid #007bff",
            }}
          />
        </div>
      )}

      {/* ✅ 저장 버튼 */}
      <button
        onClick={saveProduct}
        style={{
          display: "block",
          marginTop: "20px",
          background: "#28a745",
          color: "white",
          border: "none",
          padding: "8px 12px",
          borderRadius: "6px",
          cursor: "pointer",
        }}
      >
        💾 상품 추가 완료
      </button>
    </div>
  );
}

export default AdminProductForm;
