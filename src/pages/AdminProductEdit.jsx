// 📁 src/pages/AdminProductEdit.jsx
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../lib/api";
import noImage from "../assets/no-image.png";
import ReactQuill, { Quill } from "react-quill"; // ✅ 한 줄만
import "react-quill/dist/quill.snow.css";
import ImageResize from "quill-image-resize-module-react"; // ✅ react 호환 버전 사용

Quill.register("modules/imageResize", ImageResize);

// ✅ ReactQuill 이미지 업로드 모듈 설정
const quillModules = {
  toolbar: {
    container: [
      ["bold", "italic", "underline", "strike"],
      [{ header: 1 }, { header: 2 }],
      [{ list: "ordered" }, { list: "bullet" }],
      [{ align: [] }],
      ["link", "image"],
      ["clean"],
    ],
    handlers: {
      image: function () {
        const input = document.createElement("input");
        input.setAttribute("type", "file");
        input.setAttribute("accept", "image/*");
        input.click();

        input.onchange = async () => {
          const file = input.files[0];
          const formData = new FormData();
          formData.append("file", file);
          formData.append("upload_preset", "onyou_uploads");

          try {
            const res = await fetch(
              "https://api.cloudinary.com/v1_1/dhvw6oqiy/image/upload",
              { method: "POST", body: formData }
            );
            const data = await res.json();
            const quill = this.quill;
            const range = quill.getSelection(true);
            quill.insertEmbed(range.index, "image", data.secure_url);
          } catch (err) {
            alert("이미지 업로드 실패");
            console.error(err);
          }
        };
      },
    },
  },
  imageResize: {
    modules: ["Resize", "DisplaySize", "Toolbar"], // ✅ 이미지 클릭 후 조절 가능
  },
};


// ✅ 관리자 상품 수정 페이지
function AdminProductEdit() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
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
      name: form.name.trim(),
      price: Number(form.price),
      description: form.description.trim(),
      detailText: form.detailText.trim(),
      sizeText: form.sizeText.trim(),
      images: cleanImages, // ✅ 여기 cleanImages 직접 사용
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

      {/* ✅ 상품명 */}
      <input
        type="text"
        placeholder="상품명"
        value={form.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })}
        style={{
          width: "100%",
          padding: "10px",
          marginBottom: "10px",
          borderRadius: "6px",
          border: "1px solid #ccc",
        }}
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

      {/* ✅ 설명 */}
      <textarea
        placeholder="상품 요약 설명"
        rows={3}
        value={form.description}
        onChange={(e) => setForm({ ...form, description: e.target.value })}
        style={{
          width: "100%",
          padding: "10px",
          marginBottom: "10px",
          borderRadius: "6px",
          border: "1px solid #ccc",
        }}
      />

      {/* ✅ 상세정보 */}
      <label>📋 상품 상세정보</label>
<ReactQuill
  theme="snow"
  value={form.detailText || ""}
  onChange={(value) => setForm((prev) => ({ ...prev, detailText: value }))}
  modules={quillModules}
/>

<label>📏 사이즈 & 구매안내</label>
<ReactQuill
  theme="snow"
  value={form.sizeText || ""}
  onChange={(value) => setForm((prev) => ({ ...prev, sizeText: value }))}
  modules={quillModules}
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
