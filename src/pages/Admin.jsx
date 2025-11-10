import { useEffect, useState } from "react";
import api from "../lib/api";
import noImage from "../assets/no-image.png";
import AdminProductForm from "./AdminProductForm";
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
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language || "en";
  const navigate = useNavigate();

  // ✅ selectedPage를 form보다 위로 이동 (순서 오류 수정)
  const [selectedPage, setSelectedPage] = useState(null);

  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [form, setForm] = useState({
    i18nNames: { ko: "", en: "", th: "" },
    name: "",
    price: "",
    description: "",
    detailText: "",
    sizeText: "",
    images: [],
    mainImage: "",
    categoryPage: "", // ✅ selectedPage 참조 제거
  });

  const [pages, setPages] = useState([]);
  const [newPage, setNewPage] = useState({
    name: "",
    order: 0,
    image: "",
    i18nLabels: { ko: "", en: "", th: "" },
  });
  const [editingId, setEditingId] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [modalImages, setModalImages] = useState([]);
  const [modalIndex, setModalIndex] = useState(0);
  const [activeTab, setActiveTab] = useState("all");
  const [showProductForm, setShowProductForm] = useState(false);
  const [editPage, setEditPage] = useState(null);

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

  const fetchPages = async () => {
    try {
      const res = await api.get("/api/pages", { headers: getAuthHeader() });
      const sorted = res.data.sort((a, b) => a.order - b.order);
      setPages(sorted);
    } catch (err) {
      console.error("❌ 탭 목록 불러오기 실패:", err);
    }
  };

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
  // ✅ 새 탭 추가
  const addPage = async () => {
    if (!newPage.name || !newPage.i18nLabels?.ko) {
      alert("탭 이름(name)과 한국어 표시명(ko)은 필수입니다!");
      return;
    }

    try {
      await api.post(
        "/api/pages",
        {
          name: newPage.name,
          order: newPage.order || pages.length + 1,
          image: newPage.image,
          i18nLabels: newPage.i18nLabels,
        },
        { headers: { "Content-Type": "application/json", ...getAuthHeader() } }
      );
      alert("✅ 새 탭이 추가되었습니다!");
      setNewPage({
        name: "",
        order: 0,
        image: "",
        i18nLabels: { ko: "", en: "", th: "" },
      });
      fetchPages();
    } catch (err) {
      console.error("❌ 탭 추가 실패:", err);
      alert(err.response?.data?.message || "탭 생성 실패 (인증 필요)");
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

  return (
    <div style={{ padding: "20px" }}>
      <h1>📦 관리자 페이지</h1>

      {/* ✅ 새 탭 추가 섹션 (상품명 입력칸 제거 완료) */}
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

        {/* ✅ 탭 이름 (내부 name 값) */}
        <input
          type="text"
          placeholder="탭 이름 (예: top)"
          value={newPage.name}
          onChange={(e) =>
            setNewPage({ ...newPage, name: e.target.value })
          }
          style={{ display: "block", marginBottom: "8px", width: "100%" }}
        />

        {/* ✅ 언어별 표시명 입력 */}
        <input
          type="text"
          placeholder="한국어 표시명 (ko)"
          value={newPage.i18nLabels?.ko || ""}
          onChange={(e) =>
            setNewPage({
              ...newPage,
              i18nLabels: {
                ...(newPage.i18nLabels || {}),
                ko: e.target.value,
              },
            })
          }
          style={{ display: "block", marginBottom: "8px", width: "100%" }}
        />

        <input
          type="text"
          placeholder="영어 표시명 (en)"
          value={newPage.i18nLabels?.en || ""}
          onChange={(e) =>
            setNewPage({
              ...newPage,
              i18nLabels: {
                ...(newPage.i18nLabels || {}),
                en: e.target.value,
              },
            })
          }
          style={{ display: "block", marginBottom: "8px", width: "100%" }}
        />

        <input
          type="text"
          placeholder="태국어 표시명 (th)"
          value={newPage.i18nLabels?.th || ""}
          onChange={(e) =>
            setNewPage({
              ...newPage,
              i18nLabels: {
                ...(newPage.i18nLabels || {}),
                th: e.target.value,
              },
            })
          }
          style={{ display: "block", marginBottom: "8px", width: "100%" }}
        />

        {/* ✅ 순서 입력 */}
        <input
          type="number"
          placeholder="순서 (order)"
          value={newPage.order}
          onChange={(e) =>
            setNewPage({ ...newPage, order: Number(e.target.value) })
          }
          style={{ display: "block", marginBottom: "8px", width: "100%" }}
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
      {pages.map((p) => (
        <button
          key={p._id}
          onClick={() => handleTabClick(p._id)}
          style={{
            background: activeTab === p._id ? "#007bff" : "#eee",
            color: activeTab === p._id ? "white" : "black",
            borderRadius: "6px",
            padding: "6px 12px",
            marginRight: "6px",
            marginBottom: "6px",
            border: "none",
            cursor: "pointer",
          }}
        >
          {p.i18nLabels?.[currentLang] || p.label || p.name}
        </button>
      ))}

      {/* ✅ 선택된 탭에 따라 상품 등록 폼 표시 */}
      {selectedPage && (
        <div style={{ marginTop: "30px" }}>
          <h2>
            🛍{" "}
            {pages.find((p) => p._id === selectedPage)?.i18nLabels?.[
              currentLang
            ] ||
              pages.find((p) => p._id === selectedPage)?.label ||
              "상품"}{" "}
            추가
          </h2>

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
            placeholder="설명"
            rows={3}
            value={form.description}
            onChange={(e) =>
              setForm({ ...form, description: e.target.value })
            }
          />
          <select
            value={form.categoryPage}
            onChange={(e) =>
              setForm({ ...form, categoryPage: e.target.value })
            }
          >
            <option value="">탭 선택 없음</option>
            {pages.map((p) => (
              <option key={p._id} value={p._id}>
                {t(`tabs.${p.name}`, { defaultValue: p.label })}
              </option>
            ))}
          </select>

          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileChange}
          />

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
                      img === form.mainImage
                        ? "3px solid blue"
                        : "1px solid #ccc",
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
                <strong>{p.i18nNames?.[currentLang] || p.name}</strong> -{" "}
                {p.price}원
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
                  📂{" "}
                  <strong>
                    {page.i18nLabels?.[currentLang] || page.label || page.name}
                  </strong>{" "}
                  ({count}개)
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

        {/* ✅ 탭 수정 폼 */}
        {editPage && (
          <div
            style={{
              marginTop: "30px",
              padding: "15px",
              border: "1px solid #ddd",
              borderRadius: "8px",
              maxWidth: "400px",
              marginInline: "auto",
            }}
          >
            <h3>✏️ 탭 수정 중: {editPage.label}</h3>
            <input
              type="text"
              placeholder="탭 이름 (name)"
              value={editPage.name}
              onChange={(e) =>
                setEditPage({ ...editPage, name: e.target.value })
              }
              style={{ display: "block", marginBottom: "8px", width: "100%" }}
            />

            {/* ✅ 언어별 표시명 */}
            <input
              type="text"
              placeholder="한국어 표시명 (ko)"
              value={editPage.i18nLabels?.ko || ""}
              onChange={(e) =>
                setEditPage({
                  ...editPage,
                  i18nLabels: {
                    ...(editPage.i18nLabels || {}),
                    ko: e.target.value,
                  },
                })
              }
              style={{ display: "block", marginBottom: "8px", width: "100%" }}
            />
            <input
              type="text"
              placeholder="영어 표시명 (en)"
              value={editPage.i18nLabels?.en || ""}
              onChange={(e) =>
                setEditPage({
                  ...editPage,
                  i18nLabels: {
                    ...(editPage.i18nLabels || {}),
                    en: e.target.value,
                  },
                })
              }
              style={{ display: "block", marginBottom: "8px", width: "100%" }}
            />
            <input
              type="text"
              placeholder="태국어 표시명 (th)"
              value={editPage.i18nLabels?.th || ""}
              onChange={(e) =>
                setEditPage({
                  ...editPage,
                  i18nLabels: {
                    ...(editPage.i18nLabels || {}),
                    th: e.target.value,
                  },
                })
              }
              style={{ display: "block", marginBottom: "8px", width: "100%" }}
            />

            {/* ✅ 순서 */}
            <input
              type="number"
              placeholder="순서 (order)"
              value={editPage.order}
              onChange={(e) =>
                setEditPage({
                  ...editPage,
                  order: Number(e.target.value),
                })
              }
              style={{ display: "block", marginBottom: "8px", width: "100%" }}
            />

            {/* ✅ 이미지 업로드 */}
            <input
              type="file"
              accept="image/*"
              onChange={handleEditPageImageUpload}
              style={{ display: "block", marginBottom: "8px" }}
            />

            {editPage.image && (
              <img
                src={editPage.image}
                alt="미리보기"
                style={{
                  width: "120px",
                  height: "80px",
                  objectFit: "cover",
                  borderRadius: "8px",
                  border: "1px solid #ccc",
                  marginBottom: "10px",
                }}
              />
            )}

            <button
              onClick={updatePage}
              style={{
                background: "#28a745",
                color: "white",
                border: "none",
                padding: "8px 12px",
                borderRadius: "6px",
                cursor: "pointer",
                marginRight: "8px",
              }}
            >
              💾 수정 완료
            </button>
            <button
              onClick={() => setEditPage(null)}
              style={{
                background: "#ccc",
                border: "none",
                padding: "8px 12px",
                borderRadius: "6px",
                cursor: "pointer",
              }}
            >
              취소
            </button>
          </div>
        )}
      </footer>
    </div>
  );
}

export default Admin;