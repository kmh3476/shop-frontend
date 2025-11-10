import { useEffect, useState } from "react";
import api from "../lib/api";
import noImage from "../assets/no-image.png";
import AdminProductForm from "./AdminProductForm"; // ✅ 상품 등록 컴포넌트 연결 추가
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

// ✅ 로그인 토큰 자동 포함 헬퍼
const getAuthHeader = () => {
  const token =
    localStorage.getItem("token") || sessionStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

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
  const { i18n } = useTranslation();
const currentLang = i18n.language || "en";
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [form, setForm] = useState({
    name: "",
    price: "",
    description: "",
    images: [],
    mainImage: "",
    categoryPage: "",
  });
  const [pages, setPages] = useState([]);
  const [newPage, setNewPage] = useState({
    name: "",
    label: "",
    order: 0,
    image: "",
  }); // ✅ 탭 이미지 필드 추가
  const [editingId, setEditingId] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [modalImages, setModalImages] = useState([]);
  const [modalIndex, setModalIndex] = useState(0);
  const [activeTab, setActiveTab] = useState("all"); // ✅ 현재 선택된 탭
  const [showProductForm, setShowProductForm] = useState(false);
  const [selectedPage, setSelectedPage] = useState(null);
  const [editPage, setEditPage] = useState(null); // ✅ 현재 수정 중인 탭 정보


  useEffect(() => {
    fetchProducts();
    fetchPages();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await api.get("/products?populate=categoryPage", {
        headers: getAuthHeader(),
      });
      const data = res.data.map((p) => ({
        ...p,
        categoryPage:
          typeof p.categoryPage === "object" && p.categoryPage !== null
            ? p.categoryPage
            : null,
      }));
      setProducts(data);
      setFilteredProducts(data);
    } catch (err) {
      console.error("❌ 상품 불러오기 실패:", err);
    }
  };

  // ✅ 탭 목록 불러오기
  const fetchPages = async () => {
    try {
      const res = await api.get("/api/pages", { headers: getAuthHeader() });
      const sorted = res.data.sort((a, b) => a.order - b.order);
      setPages(sorted);
    } catch (err) {
      console.error("❌ 탭 목록 불러오기 실패:", err);
    }
  };

  // ✅ 탭 클릭 시 필터링 + 선택 페이지 설정
  const handleTabClick = (tabId) => {
    setActiveTab(tabId);
    setShowProductForm(false);
    if (tabId === "all") {
      setFilteredProducts(products);
      setSelectedPage(null);
    } else {
      const filtered = products.filter((p) => {
        const categoryId =
          typeof p.categoryPage === "object"
            ? p.categoryPage?._id
            : p.categoryPage;
        return categoryId === tabId;
      });
      setFilteredProducts(filtered);
      setSelectedPage(tabId);
    }
  };
  // ✅ 새 탭 추가 (탭 이미지 업로드 포함)
  const addPage = async () => {
    if (!newPage.name || !newPage.label) {
      alert("탭 이름(name)과 표시명(label)을 입력해주세요!");
      return;
    }

    try {
      await api.post(
        "/api/pages",
        {
          ...newPage,
          order: newPage.order || pages.length + 1,
        },
        { headers: { "Content-Type": "application/json", ...getAuthHeader() } }
      );
      alert("✅ 새 탭이 추가되었습니다!");
      setNewPage({ name: "", label: "", order: 0, image: "" });
      fetchPages();
    } catch (err) {
      console.error("❌ 탭 추가 실패:", err);
      alert(err.response?.data?.message || "탭 생성 실패 (인증 필요)");
    }
  };

  // ✅ 탭 이미지 업로드 (Cloudinary)
  const handlePageImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const formData = new FormData();
      formData.append("image", file);
      const res = await api.post("/api/upload", formData, {
        headers: { "Content-Type": "multipart/form-data", ...getAuthHeader() },
      });
      if (res.data?.imageUrl) {
        setNewPage({ ...newPage, image: res.data.imageUrl });
        alert("🖼️ 탭 이미지 업로드 완료!");
      }
    } catch (err) {
      console.error("❌ 탭 이미지 업로드 실패:", err);
      alert("탭 이미지 업로드 실패");
    }
  };

  // ✅ 수정 중인 탭 이미지 변경
const handleEditPageImageUpload = async (e) => {
  const file = e.target.files[0];
  if (!file || !editPage) return;
  try {
    const formData = new FormData();
    formData.append("image", file);
    const res = await api.post("/api/upload", formData, {
      headers: { "Content-Type": "multipart/form-data", ...getAuthHeader() },
    });
    if (res.data?.imageUrl) {
      setEditPage({ ...editPage, image: res.data.imageUrl });
      alert("🖼️ 수정용 이미지 업로드 완료!");
    }
  } catch (err) {
    console.error("❌ 탭 이미지 업로드 실패:", err);
  }
};


  // ✅ 탭 삭제
  const deletePage = async (id) => {
    if (!window.confirm("정말 이 탭을 삭제할까요?")) return;
    try {
      await api.delete(`/api/pages/${id}`, { headers: getAuthHeader() });
      fetchPages();
    } catch (err) {
      console.error("❌ 탭 삭제 실패:", err);
      alert("탭 삭제 실패 (인증 필요)");
    }
  };

  // ✅ 탭 수정 저장
const updatePage = async () => {
  if (!editPage || !editPage._id) return alert("수정할 탭이 없습니다.");

  try {
    await api.put(`/api/pages/${editPage._id}`, editPage, {
      headers: { "Content-Type": "application/json", ...getAuthHeader() },
    });
    alert("✅ 탭이 수정되었습니다!");
    setEditPage(null);
    fetchPages();
  } catch (err) {
    console.error("❌ 탭 수정 실패:", err);
    alert(err.response?.data?.message || "탭 수정 실패 (인증 필요)");
  }
};


  // ✅ 탭 순서 변경
  const movePage = async (id, direction) => {
    const index = pages.findIndex((p) => p._id === id);
    if (index === -1) return;

    const newPages = [...pages];
    if (direction === "up" && index > 0) {
      [newPages[index - 1], newPages[index]] = [
        newPages[index],
        newPages[index - 1],
      ];
    } else if (direction === "down" && index < newPages.length - 1) {
      [newPages[index + 1], newPages[index]] = [
        newPages[index],
        newPages[index + 1],
      ];
    } else return;

    const updated = newPages.map((p, i) => ({ ...p, order: i + 1 }));
    setPages(updated);

    try {
      await Promise.all(
        updated.map((p) =>
          api.put(
            `/api/pages/${p._id}`,
            { order: p.order },
            { headers: getAuthHeader() }
          )
        )
      );
      fetchPages();
    } catch (err) {
      console.error("❌ 순서 업데이트 실패:", err);
      alert("탭 순서 변경 실패 (인증 필요)");
    }
  };

  // ✅ Cloudinary 업로드 (상품 이미지)
  const uploadSingle = async (file) => {
    try {
      const formData = new FormData();
      formData.append("image", file);
      const res = await api.post("/api/upload", formData, {
        headers: { "Content-Type": "multipart/form-data", ...getAuthHeader() },
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
      await new Promise((r) => setTimeout(r, 400));
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
      categoryPage:
        form.categoryPage &&
        form.categoryPage !== "null" &&
        form.categoryPage !== ""
          ? form.categoryPage
          : selectedPage || null,
    };

    try {
      setUploading("🕓 상품 저장 중...");
      if (editingId) {
        await api.put(`/products/${editingId}`, productData, {
          headers: getAuthHeader(),
        });
      } else {
        await api.post("/products", productData, { headers: getAuthHeader() });
      }
      await fetchProducts();
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
      categoryPage:
        typeof p.categoryPage === "object"
          ? p.categoryPage?._id || ""
          : p.categoryPage || "",
    });
    setShowProductForm(true);
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
    setShowProductForm(false);
  };

  const removeImage = (index) => {
    const newImages = form.images.filter((_, i) => i !== index);
    const newMain =
      form.mainImage === form.images[index] ? newImages[0] || "" : form.mainImage;
    setForm({ ...form, images: newImages, mainImage: newMain });
  };

  const setAsMainImage = (img) => setForm((prev) => ({ ...prev, mainImage: img }));

  const deleteProduct = async (id) => {
    if (!window.confirm("정말 삭제하시겠습니까?")) return;
    try {
      await api.delete(`/products/${id}`, { headers: getAuthHeader() });
      fetchProducts();
    } catch (err) {
      console.error("❌ 상품 삭제 실패:", err);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>📦 관리자 페이지</h1>

      {/* ✅ 새 탭 추가 섹션 */}
      <div
        style={{
          border: "1px solid #ccc",
          padding: "10px",
          borderRadius: "8px",
          marginBottom: "20px",
          maxWidth: "350px",
        }}
      >
        <h3>🆕 새 탭 추가</h3>
        <input
          type="text"
          placeholder="탭 이름 (name)"
          value={newPage.name}
          onChange={(e) => setNewPage({ ...newPage, name: e.target.value })}
        />
        <input
          type="text"
          placeholder="표시명 (label)"
          value={newPage.label}
          onChange={(e) => setNewPage({ ...newPage, label: e.target.value })}
        />
        <input
          type="number"
          placeholder="순서 (order)"
          value={newPage.order}
          onChange={(e) =>
            setNewPage({ ...newPage, order: Number(e.target.value) })
          }
        />

        {/* ✅ 탭 이미지 업로드 */}
        <input
          type="file"
          accept="image/*"
          onChange={handlePageImageUpload}
          style={{ marginTop: "8px" }}
        />
        {newPage.image && (
          <img
            src={newPage.image}
            alt="탭 미리보기"
            style={{
              width: "100px",
              height: "60px",
              objectFit: "cover",
              borderRadius: "6px",
              marginTop: "6px",
              border: "1px solid #ddd",
            }}
          />
        )}
        <button
          onClick={addPage}
          style={{
            display: "block",
            marginTop: "10px",
            padding: "6px 12px",
            background: "#007bff",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
          }}
        >
          ➕ 탭 추가
        </button>
      </div>

      {/* ✅ 탭 목록 */}
      <h2>🗂 탭 목록 / 상품 분류</h2>
      <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
        <button
          onClick={() => handleTabClick("all")}
          style={{
            background: activeTab === "all" ? "#007bff" : "#eee",
            color: activeTab === "all" ? "white" : "black",
            borderRadius: "6px",
            padding: "6px 12px",
          }}
        >
          전체 보기
        </button>
        {pages.map((p) => (
          <button
            key={p._id}
            onClick={() => handleTabClick(p._id)}
            style={{
              background: activeTab === p._id ? "#007bff" : "#eee",
              color: activeTab === p._id ? "white" : "black",
              borderRadius: "6px",
              padding: "6px 12px",
            }}
          >
            {p.i18nLabels?.[currentLang] || p.label}
          </button>
        ))}
      </div>

      {/* ✅ 선택된 탭에 따라 상품 등록 폼 표시 */}
      {selectedPage && (
        <div style={{ marginTop: "30px" }}>
          <h2>🛍 {pages.find((p) => p._id === selectedPage)?.label || "상품"} 추가</h2>
          <AdminProductForm
            selectedPage={selectedPage}
            onSave={() => {
              fetchProducts();
              setShowProductForm(false);
            }}
          />
        </div>
      )}
      {/* ✅ 기존 직접 입력 상품 등록 폼 (수정 시 표시됨) */}
      {editingId && !selectedPage && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "8px",
            maxWidth: "350px",
            marginBottom: "30px",
            marginTop: "30px",
          }}
        >
          <h2>✏️ 상품 수정 중...</h2>
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

          <input type="file" accept="image/*" multiple onChange={handleFileChange} />

          {uploading && <p style={{ color: "blue" }}>{uploading}</p>}

          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
            {form.images.map((img, idx) => (
              <div key={idx} style={{ position: "relative" }}>
                <img
                  src={img}
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
            {editingId ? "💾 수정 완료" : "➕ 상품 추가"}
          </button>

          {editingId && (
            <button
              onClick={cancelEdit}
              style={{
                marginTop: "6px",
                background: "#ccc",
                border: "none",
                padding: "6px 12px",
                borderRadius: "6px",
              }}
            >
              취소
            </button>
          )}
        </div>
      )}

      {/* ✅ 상품 목록 */}
      <h2>📋 상품 목록</h2>
      {filteredProducts.length === 0 ? (
        <p style={{ color: "gray" }}>상품이 없습니다.</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {filteredProducts.map((p) => (
            <li
              key={p._id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "10px",
                border: "1px solid #ddd",
                borderRadius: "8px",
                marginBottom: "10px",
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
                }}
              />
              <div style={{ flex: 1 }}>
                <strong>{p.name}</strong> - {p.price}원
                <br />
                <small>{p.description}</small>
                {p.categoryPage?.label && (
                  <p style={{ fontSize: "12px", color: "gray" }}>
                    📂 탭: {p.categoryPage.label}
                  </p>
                )}
              </div>
              <button
  onClick={() => navigate(`/admin/products/${p._id}/edit`)}
  style={{
    padding: "6px 10px",
    background: "#007bff",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
  }}
>
  ✏️ 수정
</button>

              <button
                onClick={() => deleteProduct(p._id)}
                style={{
                  padding: "6px 10px",
                  background: "#dc3545",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                }}
              >
                🗑 삭제
              </button>
            </li>
          ))}
        </ul>
      )}
      {/* ✅ 상품 상세 이미지 모달 */}
      {modalImages.length > 0 && (
        <ImageModal
          images={modalImages}
          startIndex={modalIndex}
          onClose={() => setModalImages([])}
        />
      )}

      {/* ✅ 탭별 상품 요약 */}
      <div style={{ marginTop: "40px" }}>
        <h2>📑 탭별 상품 현황</h2>
        {pages.map((page) => {
          const count = products.filter((p) => {
            const categoryId =
              typeof p.categoryPage === "object"
                ? p.categoryPage?._id
                : p.categoryPage;
            return categoryId === page._id;
          }).length;
          return (
            <div
              key={page._id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "10px 15px",
                border: "1px solid #ddd",
                borderRadius: "6px",
                marginBottom: "8px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                {page.image ? (
                  <img
                    src={page.image}
                    alt={page.label}
                    style={{
                      width: "60px",
                      height: "40px",
                      objectFit: "cover",
                      borderRadius: "6px",
                      border: "1px solid #ddd",
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: "60px",
                      height: "40px",
                      borderRadius: "6px",
                      background: "#f0f0f0",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      color: "#888",
                      fontSize: "12px",
                    }}
                  >
                    No Img
                  </div>
                )}
                <span>
                  📂 <strong>{page.label}</strong> ({count}개)
                </span>
              </div>

              <div>
                <button
                  onClick={() => handleTabClick(page._id)}
                  style={{
                    marginRight: "6px",
                    padding: "4px 10px",
                    borderRadius: "6px",
                    background: activeTab === page._id ? "#007bff" : "#eee",
                    color: activeTab === page._id ? "white" : "black",
                    cursor: "pointer",
                  }}
                >
                  보기
                </button>
                <button
                  onClick={() => movePage(page._id, "up")}
                  style={{
                    marginRight: "4px",
                    background: "#ddd",
                    border: "none",
                    padding: "4px 8px",
                    borderRadius: "4px",
                    cursor: "pointer",
                  }}
                >
                  ▲
                </button>
                <button
                  onClick={() => movePage(page._id, "down")}
                  style={{
                    background: "#ddd",
                    border: "none",
                    padding: "4px 8px",
                    borderRadius: "4px",
                    cursor: "pointer",
                  }}
                >
                  ▼
                </button>

                <button
  onClick={() => setEditPage(page)}
  style={{
    marginLeft: "6px",
    background: "#ffc107",
    border: "none",
    color: "black",
    padding: "4px 10px",
    borderRadius: "6px",
    cursor: "pointer",
  }}
>
  ✏ 수정
</button>

                <button
                  onClick={() => deletePage(page._id)}
                  style={{
                    marginLeft: "10px",
                    background: "#f55",
                    border: "none",
                    color: "white",
                    padding: "4px 10px",
                    borderRadius: "6px",
                    cursor: "pointer",
                  }}
                >
                  삭제
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* ✅ 페이지 하단 */}
      <footer
        style={{
          marginTop: "60px",
          textAlign: "center",
          padding: "20px 0",
          borderTop: "1px solid #ddd",
          color: "#666",
          fontSize: "14px",
        }}
      >
        © 2025 ONYOU 관리자 — 상품 및 페이지 관리 시스템
      </footer>
    </div>
  );
}

export default Admin;
