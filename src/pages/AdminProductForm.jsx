import { useState } from "react";
import api from "../lib/api";
import noImage from "../assets/no-image.png";
import { useTranslation } from "react-i18next";

const getAuthHeader = () => {
  const token =
    localStorage.getItem("token") || sessionStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

function AdminProductForm({ selectedPage, onSave }) {
  const { i18n } = useTranslation();
  const currentLang = i18n.language || "ko";

  const [form, setForm] = useState({
    i18nNames: { ko: "", en: "", th: "" }, // ✅ 다국어 상품명 추가
    price: "",
    description: "",
    detailText: "",
    sizeText: "",
    images: [],
    mainImage: "",
    categoryPage: selectedPage || "",
  });

  const [uploading, setUploading] = useState(false);

  // ✅ 단일 이미지 업로드
  const uploadSingle = async (file) => {
    try {
      const formData = new FormData();
      formData.append("image", file);
      const res = await api.post("/api/upload", formData, {
        headers: { "Content-Type": "multipart/form-data", ...getAuthHeader() },
      });
      return res.data?.imageUrl || null;
    } catch (err) {
      console.error("❌ 업로드 실패:", err);
      return null;
    }
  };

  // ✅ 다중 업로드
  const handleImageUpload = async (filesToUpload) => {
    const uploadedUrls = [];
    setUploading("🕓 이미지 업로드 중...");
    for (let i = 0; i < filesToUpload.length; i++) {
      const file = filesToUpload[i];
      const url = await uploadSingle(file);
      if (url) uploadedUrls.push(url);
      await new Promise((r) => setTimeout(r, 400));
    }
    setUploading(false);
    return uploadedUrls;
  };

  // ✅ 업로드 + 미리보기
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

  // ✅ 이미지 삭제
  const removeImage = (index) => {
    const newImages = form.images.filter((_, i) => i !== index);
    const newMain =
      form.mainImage === form.images[index]
        ? newImages[0] || ""
        : form.mainImage;
    setForm({ ...form, images: newImages, mainImage: newMain });
  };

  const setAsMainImage = (img) => setForm({ ...form, mainImage: img });

  // ✅ 상품 저장
  const saveProduct = async () => {
    if (!form.i18nNames?.ko || !form.price) {
      alert("상품명(한국어)과 가격은 필수입니다!");
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
      i18nNames: form.i18nNames,
      name: form.i18nNames?.ko || "Unnamed Product", // ✅ ko 기준
      price: Number(form.price),
      description: form.description.trim(),
      detailText: form.detailText.trim(),
      sizeText: form.sizeText.trim(),
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
      setUploading(false);
      alert("✅ 상품이 등록되었습니다!");
      setForm({
        i18nNames: { ko: "", en: "", th: "" },
        price: "",
        description: "",
        detailText: "",
        sizeText: "",
        images: [],
        mainImage: "",
        categoryPage: selectedPage || "",
      });
      onSave?.();
    } catch (err) {
      console.error("❌ 상품 저장 실패:", err);
      alert("상품 저장 중 오류가 발생했습니다.");
      setUploading(false);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "8px",
        maxWidth: "350px",
        marginBottom: "30px",
      }}
    >
      <h3>🛍 새 상품 추가</h3>

      {/* ✅ 언어별 상품명 입력 */}
      <input
        type="text"
        placeholder="상품명 (한국어)"
        value={form.i18nNames?.ko || ""}
        onChange={(e) =>
          setForm({
            ...form,
            i18nNames: { ...(form.i18nNames || {}), ko: e.target.value },
          })
        }
      />
      <input
        type="text"
        placeholder="상품명 (영어)"
        value={form.i18nNames?.en || ""}
        onChange={(e) =>
          setForm({
            ...form,
            i18nNames: { ...(form.i18nNames || {}), en: e.target.value },
          })
        }
      />
      <input
        type="text"
        placeholder="상품명 (태국어)"
        value={form.i18nNames?.th || ""}
        onChange={(e) =>
          setForm({
            ...form,
            i18nNames: { ...(form.i18nNames || {}), th: e.target.value },
          })
        }
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

      <textarea
        placeholder="상세 설명 (detailText)"
        rows={3}
        value={form.detailText}
        onChange={(e) => setForm({ ...form, detailText: e.target.value })}
      />

      <textarea
        placeholder="사이즈 정보 (sizeText)"
        rows={2}
        value={form.sizeText}
        onChange={(e) => setForm({ ...form, sizeText: e.target.value })}
      />

      {/* ✅ 이미지 업로드 */}
      <input
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileChange}
      />

      {uploading && <p style={{ color: "blue" }}>{uploading}</p>}

      {/* ✅ 이미지 미리보기 */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
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
              onError={(e) => (e.currentTarget.src = noImage)}
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

      {/* ✅ 저장 버튼 */}
      <button
        onClick={saveProduct}
        style={{
          marginTop: "10px",
          background: "#28a745",
          color: "white",
          border: "none",
          padding: "8px 12px",
          borderRadius: "6px",
          cursor: "pointer",
        }}
      >
        💾 상품 저장
      </button>
    </div>
  );
}

export default AdminProductForm;
