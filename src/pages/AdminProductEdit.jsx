// 📁 src/pages/AdminProductEdit.jsx
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../lib/api";
import noImage from "../assets/no-image.png";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

export const quillModules = {
  toolbar: [
    ["bold", "italic", "underline", "strike"],
    [{ header: 1 }, { header: 2 }],
    [{ list: "ordered" }, { list: "bullet" }],
    [{ align: [] }],
    ["link", "image"],
    ["clean"],
  ],
  blotFormatter: {},
  imageResize: {
    displaySize: true,
    modules: ["Resize", "DisplaySize", "Toolbar"],
  },
};

if (typeof window !== "undefined") {
  (async () => {
    try {
      const quillModule = await import("quill");
      const Quill = quillModule.default || quillModule;

      // parchment 로드될 때까지 기다림
      await new Promise((resolve) => {
        const check = () => {
          try {
            const p = Quill.import("parchment");
            if (p) return resolve();
          } catch {}
          setTimeout(check, 30);
        };
        check();
      });

      // ✅ quill-image-resize-module-fixed는 로컬에서 import
      const imageResizeModule = await import("/quill-image-resize-module-fixed/index.js");
      const ImageResize = imageResizeModule.default;

      // ✅ blot formatter를 "lazy" import로 지연 로드
      const blotFormatterModule = await import("/quill-blot-formatter2-fixed/index.js");
      const BlotFormatter = blotFormatterModule.default;

      // ✅ 중복 등록 방지
      if (!Quill.__IS_CUSTOMIZED__) {
        Quill.register("modules/imageResize", ImageResize);
        Quill.register("modules/blotFormatter", BlotFormatter);
        Quill.__IS_CUSTOMIZED__ = true;
        console.log("✅ Quill 모듈 등록 완료 (Vite-safe)");
      }
    } catch (err) {
      console.error("❌ Quill 모듈 등록 실패:", err);
    }
  })();
}





// ✅ 관리자 상품 수정 페이지
function AdminProductEdit() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
  // ✅ 다국어 이름
  i18nNames: { ko: "", en: "", th: "" },

  // ✅ 다국어 설명/상세/사이즈
  i18nDescriptions: { ko: "", en: "", th: "" },
  i18nDetailTexts: { ko: "", en: "", th: "" },
  i18nSizeTexts: { ko: "", en: "", th: "" },

  // ✅ 기존 단일 필드(ko 백업용 + 기존 화면 호환용)
  name: "",
  price: "",
  description: "",
  detailText: "",
  sizeText: "",
  images: [],
  mainImage: "",
  categoryPage: "",
});


  const [pages, setPages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);

  // ✅ 로그인 토큰 헤더
  const getAuthHeader = () => {
    const token =
      localStorage.getItem("token") || sessionStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  // ✅ 초기 로딩 시 상품 불러오기
  useEffect(() => {
    fetchPages();
    fetchProduct();
  }, [id]);

  // ✅ 상품 데이터 가져오기
  const fetchProduct = async () => {
    try {
      const res = await api.get(`/api/products/${id}`, {
        headers: getAuthHeader(),
      });
      const product = res.data;
      setForm({
  // ✅ 다국어 이름: 없으면 name을 ko로 채워주기
 i18nNames: {
  ko: product.i18nNames?.ko ?? product.name ?? "",
  en: product.i18nNames?.en ?? "",
  th: product.i18nNames?.th ?? "",
},

i18nDescriptions: {
  ko: product.i18nDescriptions?.ko ?? product.description ?? "",
  en: product.i18nDescriptions?.en ?? "",
  th: product.i18nDescriptions?.th ?? "",
},

i18nDetailTexts: {
  ko: product.i18nDetailTexts?.ko ?? product.detailText ?? "",
  en: product.i18nDetailTexts?.en ?? "",
  th: product.i18nDetailTexts?.th ?? "",
},

i18nSizeTexts: {
  ko: product.i18nSizeTexts?.ko ?? product.sizeText ?? "",
  en: product.i18nSizeTexts?.en ?? "",
  th: product.i18nSizeTexts?.th ?? "",
},


  // ✅ 다국어 설명: 없으면 기존 description을 ko에 넣기
  i18nDescriptions: product.i18nDescriptions || {
    ko: product.description || "",
    en: "",
    th: "",
  },

  // ✅ 다국어 상세
  i18nDetailTexts: product.i18nDetailTexts || {
    ko: product.detailText || "",
    en: "",
    th: "",
  },

  // ✅ 다국어 사이즈 안내
  i18nSizeTexts: product.i18nSizeTexts || {
    ko: product.sizeText || "",
    en: "",
    th: "",
  },

  // ✅ 단일 필드(ko 기준)
  name: product.name || "",
  price: product.price || "",
  description: product.description || "",
  detailText: product.detailText || "",
  sizeText: product.sizeText || "",
  images: product.images || [],
  mainImage: product.mainImage || "",
  categoryPage: product.categoryPage || "",
});

    } catch (err) {
      console.error("❌ 상품 불러오기 실패:", err);
      alert("상품 정보를 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  };

  // ✅ 카테고리 탭 불러오기
  const fetchPages = async () => {
    try {
      const res = await api.get("/api/pages", { headers: getAuthHeader() });
      setPages(res.data || []);
    } catch (err) {
      console.error("❌ 탭 목록 불러오기 실패:", err);
    }
  };

  // ✅ Cloudinary 업로드
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

  // ✅ 이미지 추가 처리
  const handleFileChange = async (e) => {
    const selected = Array.from(e.target.files);
    if (!selected.length) return;

    // 미리보기
    const previews = selected.map((f) => URL.createObjectURL(f));
    setForm((prev) => ({ ...prev, images: [...prev.images, ...previews] }));

    // ✅ blob 메모리 누수 방지 및 파일 삭제 후 에러 방지
    selected.forEach((f) => {
      const url = URL.createObjectURL(f);
      setTimeout(() => URL.revokeObjectURL(url), 5000);
    });

    // ✅ 업로드
    const uploaded = await handleImageUpload(selected);
    if (uploaded.length) {
      setForm((prev) => {
        // ✅ blob: URL 전부 제거하고 Cloudinary URL만 남기기
        const validOld = prev.images.filter((img) => img.startsWith("http"));
        const merged = [...validOld, ...uploaded].filter(Boolean);

        return {
          ...prev,
          images: merged,
          mainImage: prev.mainImage || merged[0], // 대표 이미지 자동 설정
        };
      });
    }
  };

  // ✅ 메인 이미지 설정
  const setAsMainImage = (img) => {
    setForm((prev) => ({ ...prev, mainImage: img }));
  };
  // ✅ 이미지 삭제
  const removeImage = (index) => {
    const newImages = form.images.filter((_, i) => i !== index);
    const newMain =
      form.mainImage === form.images[index] ? newImages[0] || "" : form.mainImage;
    setForm({ ...form, images: newImages, mainImage: newMain });
  };

  // ✅ 상품 수정 저장
  const saveProduct = async () => {
    if (!form.name || !form.price) {
      alert("상품명과 가격은 필수입니다!");
      return;
    }

    const cleanImages = form.images
      .filter((i) => i && i.startsWith("http"))
      .filter((v, i, arr) => arr.indexOf(v) === i);

    // ✅ setForm은 유지 (UI 업데이트용)
    setForm((prev) => ({ ...prev, images: cleanImages }));

    const mainImg =
      form.mainImage && cleanImages.includes(form.mainImage)
        ? form.mainImage
        : cleanImages[0] || "https://placehold.co/250x200?text=No+Image";

    const productData = {
  // ✅ 다국어 이름
  i18nNames: form.i18nNames,
  name: (form.i18nNames.ko || form.name || "").trim(),

  // ✅ 다국어 설명
  i18nDescriptions: form.i18nDescriptions,
  description: (form.i18nDescriptions.ko || form.description || "").trim(),

  // ✅ 다국어 상세
  i18nDetailTexts: form.i18nDetailTexts,
  detailText: (form.i18nDetailTexts.ko || form.detailText || "").trim(),

  // ✅ 다국어 사이즈
  i18nSizeTexts: form.i18nSizeTexts,
  sizeText: (form.i18nSizeTexts.ko || form.sizeText || "").trim(),

  price: Number(form.price),
  images: cleanImages,
  mainImage: mainImg,
  categoryPage:
    form.categoryPage && form.categoryPage !== "null" && form.categoryPage !== ""
      ? form.categoryPage
      : null,
};


    try {
      setUploading("🕓 상품 수정 중...");
      await api.put(`/api/products/${id}`, productData, {
        headers: getAuthHeader(),
      });

      // ✅ ✅ ✅ [추가된 부분] 상품 수정 후 localStorage 캐시 초기화
      localStorage.removeItem(`detail-name-${id}`);
      localStorage.removeItem(`detail-desc-${id}`);
      localStorage.removeItem(`detail-info-${id}`);
      localStorage.removeItem(`size-info-${id}`);

      // ✅ 상품 수정 후 blob URL 정리
      if (form.images && Array.isArray(form.images)) {
        form.images.forEach((img) => {
          if (img && img.startsWith("blob:")) {
            try {
              URL.revokeObjectURL(img);
            } catch (e) {
              console.warn("blob revoke 실패:", img);
            }
          }
        });
      }

      // ✅ blob 제거 후 UI 상태 정리
      setForm((prev) => ({
        ...prev,
        images: prev.images.filter((img) => !img.startsWith("blob:")),
      }));

      alert("✅ 상품이 성공적으로 수정되었습니다!");
      navigate("/admin/products"); // 수정 후 상품목록으로 이동
    } catch (err) {
      console.error("❌ 상품 수정 실패:", err);
      alert("상품 수정 중 오류가 발생했습니다.");
    } finally {
      setUploading(false);
    }
  };

  // ✅ blob 정리용 useEffect
  useEffect(() => {
    const imagesSnapshot = [...(form.images || [])]; // ✅ 안전 복사
    return () => {
      imagesSnapshot.forEach((img) => {
        if (img && img.startsWith("blob:")) {
          try {
            URL.revokeObjectURL(img);
          } catch (e) {
            console.warn("blob revoke 실패:", img);
          }
        }
      });
    };
  }, [form.images]);

  if (loading) {
    return <p style={{ padding: "20px" }}>⏳ 상품 정보를 불러오는 중...</p>;
  }

  return (
    <div
      style={{
        border: "1px solid #ccc",
        borderRadius: "10px",
        padding: "20px",
        maxWidth: "600px",
        margin: "40px auto",
        background: "#fafafa",
      }}
    >
      <h2 style={{ marginBottom: "20px" }}>🛠 상품 수정</h2>

      {/* ✅ 상품명 (한국어) */}
<input
  type="text"
  placeholder="상품명 (한국어)"
  value={form.i18nNames.ko}
  onChange={(e) =>
    setForm((prev) => ({
      ...prev,
      i18nNames: { ...prev.i18nNames, ko: e.target.value },
      // ko를 기존 name에도 같이 넣어주기
      name: e.target.value,
    }))
  }
  style={{ width: "100%", padding: "10px", marginBottom: "6px", borderRadius: "6px", border: "1px solid #ccc" }}
/>

{/* ✅ 상품명 (영어) */}
<input
  type="text"
  placeholder="상품명 (영어)"
  value={form.i18nNames.en}
  onChange={(e) =>
    setForm((prev) => ({
      ...prev,
      i18nNames: { ...prev.i18nNames, en: e.target.value },
    }))
  }
  style={{ width: "100%", padding: "10px", marginBottom: "6px", borderRadius: "6px", border: "1px solid #ccc" }}
/>

{/* ✅ 상품명 (태국어) */}
<input
  type="text"
  placeholder="상품명 (태국어)"
  value={form.i18nNames.th}
  onChange={(e) =>
    setForm((prev) => ({
      ...prev,
      i18nNames: { ...prev.i18nNames, th: e.target.value },
    }))
  }
  style={{ width: "100%", padding: "10px", marginBottom: "10px", borderRadius: "6px", border: "1px solid #ccc" }}
/>


      {/* ✅ 가격 */}
      <input
        type="number"
        placeholder="가격"
        value={form.price}
        onChange={(e) => setForm({ ...form, price: e.target.value })}
        style={{
          width: "100%",
          padding: "10px",
          marginBottom: "10px",
          borderRadius: "6px",
          border: "1px solid #ccc",
        }}
      />

      {/* ✅ 상품 요약 설명 (한국어) */}
<textarea
  placeholder="상품 요약 설명 (ko)"
  rows={3}
  value={form.i18nDescriptions.ko}
  onChange={(e) =>
    setForm((prev) => ({
      ...prev,
      i18nDescriptions: { ...prev.i18nDescriptions, ko: e.target.value },
      // ko는 기존 description에도 반영
      description: e.target.value,
    }))
  }
  style={{
    width: "100%",
    padding: "10px",
    marginBottom: "6px",
    borderRadius: "6px",
    border: "1px solid #ccc",
  }}
/>

{/* ✅ 상품 요약 설명 (en) */}
<textarea
  placeholder="상품 요약 설명 (en)"
  rows={3}
  value={form.i18nDescriptions.en}
  onChange={(e) =>
    setForm((prev) => ({
      ...prev,
      i18nDescriptions: { ...prev.i18nDescriptions, en: e.target.value },
    }))
  }
  style={{
    width: "100%",
    padding: "10px",
    marginBottom: "6px",
    borderRadius: "6px",
    border: "1px solid #ccc",
  }}
/>

{/* ✅ 상품 요약 설명 (th) */}
<textarea
  placeholder="상품 요약 설명 (th)"
  rows={3}
  value={form.i18nDescriptions.th}
  onChange={(e) =>
    setForm((prev) => ({
      ...prev,
      i18nDescriptions: { ...prev.i18nDescriptions, th: e.target.value },
    }))
  }
  style={{
    width: "100%",
    padding: "10px",
    marginBottom: "10px",
    borderRadius: "6px",
    border: "1px solid #ccc",
  }}
/>


      {/* ✅ 상세정보 */}
      <label>📋 상품 상세정보 (ko)</label>
<ReactQuill
  theme="snow"
  value={form.i18nDetailTexts.ko}
  onChange={(value) =>
    setForm((prev) => ({
      ...prev,
      i18nDetailTexts: { ...prev.i18nDetailTexts, ko: value },
      detailText: value, // ko는 기존 필드에도 반영
    }))
  }
  modules={quillModules}
  style={{ minHeight: "250px", marginBottom: "16px" }}
/>

<label>📋 상품 상세정보 (en)</label>
<ReactQuill
  theme="snow"
  value={form.i18nDetailTexts.en}
  onChange={(value) =>
    setForm((prev) => ({
      ...prev,
      i18nDetailTexts: { ...prev.i18nDetailTexts, en: value },
    }))
  }
  modules={quillModules}
  style={{ minHeight: "250px", marginBottom: "16px" }}
/>

<label>📋 상품 상세정보 (th)</label>
<ReactQuill
  theme="snow"
  value={form.i18nDetailTexts.th}
  onChange={(value) =>
    setForm((prev) => ({
      ...prev,
      i18nDetailTexts: { ...prev.i18nDetailTexts, th: value },
    }))
  }
  modules={quillModules}
  style={{ minHeight: "250px", marginBottom: "24px" }}
/>


<label>📏 사이즈 & 구매안내 (ko)</label>
<ReactQuill
  theme="snow"
  value={form.i18nSizeTexts.ko}
  onChange={(value) =>
    setForm((prev) => ({
      ...prev,
      i18nSizeTexts: { ...prev.i18nSizeTexts, ko: value },
      sizeText: value, // ko는 기존 필드에도 반영
    }))
  }
  modules={quillModules}
  style={{ minHeight: "250px", marginBottom: "16px" }}
/>

<label>📏 사이즈 & 구매안내 (en)</label>
<ReactQuill
  theme="snow"
  value={form.i18nSizeTexts.en}
  onChange={(value) =>
    setForm((prev) => ({
      ...prev,
      i18nSizeTexts: { ...prev.i18nSizeTexts, en: value },
    }))
  }
  modules={quillModules}
  style={{ minHeight: "250px", marginBottom: "16px" }}
/>

<label>📏 사이즈 & 구매안내 (th)</label>
<ReactQuill
  theme="snow"
  value={form.i18nSizeTexts.th}
  onChange={(value) =>
    setForm((prev) => ({
      ...prev,
      i18nSizeTexts: { ...prev.i18nSizeTexts, th: value },
    }))
  }
  modules={quillModules}
  style={{ minHeight: "250px", marginBottom: "24px" }}
/>




      {/* ✅ 카테고리 */}
      <select
        value={form.categoryPage}
        onChange={(e) => setForm({ ...form, categoryPage: e.target.value })}
        style={{
          width: "100%",
          padding: "10px",
          marginBottom: "10px",
          borderRadius: "6px",
          border: "1px solid #ccc",
        }}
      >
        <option value="">탭 선택 없음</option>
        {pages.map((p) => (
          <option key={p._id} value={p._id}>
            {p.label}
          </option>
        ))}
      </select>

      {/* ✅ 이미지 업로드 */}
      <input
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileChange}
        style={{
          width: "100%",
          marginTop: "10px",
          marginBottom: "10px",
        }}
      />

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
              width: "150px",
              height: "150px",
              objectFit: "cover",
              borderRadius: "8px",
              border: "2px solid #007bff",
              marginBottom: "10px",
            }}
          />
        </div>
      )}

      {/* ✅ 버튼 영역 */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginTop: "20px",
        }}
      >
        <button
          onClick={() => navigate("/admin/products")}
          style={{
            background: "#6c757d",
            color: "white",
            border: "none",
            padding: "10px 16px",
            borderRadius: "6px",
            cursor: "pointer",
          }}
        >
          ← 목록으로
        </button>

        <button
          onClick={saveProduct}
          style={{
            background: "#28a745",
            color: "white",
            border: "none",
            padding: "10px 16px",
            borderRadius: "6px",
            cursor: "pointer",
          }}
        >
          💾 수정 완료
        </button>
      </div>
    </div>
  );
}

export default AdminProductEdit;
