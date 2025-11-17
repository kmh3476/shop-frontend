// 📁 src/pages/ProductDetail.jsx
import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../lib/api";
import noImage from "../assets/no-image.png";
import { useEditMode } from "../context/EditModeContext";
import { useAuth } from "../context/AuthContext";
import EditableText from "../components/EditableText";
import EditableImage from "../components/EditableImage";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { useTranslation } from "react-i18next";

function ImageModal({ images, currentIndex, onClose, onNavigate }) {
  if (!images || images.length === 0) return null;
  const imageUrl = images[currentIndex];
  const { t } = useTranslation();

  const handleKey = useCallback(
    (e) => {
      if (e.key === "ArrowLeft") onNavigate("prev");
      else if (e.key === "ArrowRight") onNavigate("next");
      else if (e.key === "Escape") onClose();
    },
    [onNavigate, onClose]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [handleKey]);

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
          src={imageUrl || noImage}
          alt={t("product.altImage")}
          className="rounded-lg shadow-2xl transition-transform duration-300 cursor-zoom-out"
          style={{ maxWidth: "90vw", maxHeight: "85vh", objectFit: "contain" }}
          onError={(e) => (e.currentTarget.src = noImage)}
        />
        <button
          className="absolute top-3 right-3 text-white bg-black/60 px-3 py-2 rounded-full hover:bg-black/80 transition"
          onClick={onClose}
        >
          ✖
        </button>

        {images.length > 1 && (
          <>
            <button
              className="absolute left-5 text-white text-3xl bg-black/50 px-3 py-1 rounded-full hover:bg-black/70"
              onClick={(e) => {
                e.stopPropagation();
                onNavigate("prev");
              }}
            >
              ←
            </button>
            <button
              className="absolute right-5 text-white text-3xl bg-black/50 px-3 py-1 rounded-full hover:bg-black/70"
              onClick={(e) => {
                e.stopPropagation();
                onNavigate("next");
              }}
            >
              →
            </button>
            <div className="absolute bottom-5 text-white bg-black/40 px-3 py-1 rounded-lg text-sm">
              {currentIndex + 1} / {images.length}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ✅ 리사이즈 훅
function useResizableBox(id, defaultSize = { width: 900, height: 400 }, active) {
  const [size, setSize] = useState(() => {
    const saved = localStorage.getItem(`resizable-${id}`);
    return saved ? JSON.parse(saved) : defaultSize;
  });
  const ref = useRef(null);
  const resizing = useRef(false);
  const start = useRef({ x: 0, y: 0, width: 0, height: 0 });

  useEffect(() => {
    const move = (e) => {
      if (!active || !resizing.current) return;
      const dx = e.clientX - start.current.x;
      const dy = e.clientY - start.current.y;
      setSize({
        width: Math.max(300, start.current.width + dx),
        height: Math.max(220, start.current.height + dy),
      });
    };
    const up = () => {
      if (resizing.current) {
        resizing.current = false;
        document.body.style.cursor = "auto";
        localStorage.setItem(`resizable-${id}`, JSON.stringify(size));
      }
    };
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", up);
    return () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseup", up);
    };
  }, [active, id, size]);

  const startResize = (e) => {
    if (!active || e.button !== 2) return;
    e.preventDefault();
    resizing.current = true;
    start.current = {
      x: e.clientX,
      y: e.clientY,
      width: ref.current.offsetWidth,
      height: ref.current.offsetHeight,
    };
    document.body.style.cursor = "se-resize";
  };

  return { ref, size, startResize };
}

export default function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mainImage, setMainImage] = useState(null);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [activeTab, setActiveTab] = useState("detail");
  const [reviewInput, setReviewInput] = useState({ name: "", rating: 5, comment: "" });
  const [inquiryInput, setInquiryInput] = useState({ name: "", question: "" });
  const { user } = useAuth();
  const { isEditMode, setIsEditMode, isResizeMode, setIsResizeMode } = useEditMode();
  const { t } = useTranslation();

  const refs = {
    detail: useRef(null),
    size: useRef(null),
    review: useRef(null),
    inquiry: useRef(null),
  };

  // ✅ 각 섹션별 리사이즈 훅
  const hero = useResizableBox(`hero-${id}`, { width: 768, height: 520 }, isResizeMode);
  const detailBox = useResizableBox(`detail-box-${id}`, { width: 715, height: 582 }, isResizeMode);
  const sizeBox = useResizableBox(`size-box-${id}`, { width: 715, height: 470 }, isResizeMode);

  // ✅ 관리자 모드 토글
  const toggleEdit = () => {
    if (!user?.isAdmin) return alert(t("product.adminOnly"));
    setIsEditMode(!isEditMode);
  };
  const toggleResize = () => {
    if (!user?.isAdmin) return alert(t("product.adminOnly"));
    setIsResizeMode(!isResizeMode);
  };

  // ✅ 상품 불러오기
  useEffect(() => {
    const load = async () => {
      try {
        const [p, r, q] = await Promise.all([
          api.get(`/api/products/${id}`),
          api.get(`/api/reviews/${id}`),
          api.get(`/api/inquiries/${id}`),
        ]);
        const product = p.data;
        const imgs = product.mainImage
          ? [product.mainImage, ...(product.images || []).filter((img) => img && img !== product.mainImage)]
          : (product.images || []).filter((img) => img && img.startsWith("http"));
        const uniqueImgs = [...new Set(imgs.filter((img) => img && img.startsWith("http")))];

        setProduct({
          ...product,
          name: localStorage.getItem(`detail-name-${id}`) ?? product.name,
          description: localStorage.getItem(`detail-desc-${id}`) ?? product.description,
          detailText: product.detailText || "",
          sizeText: product.sizeText || "",
          images: uniqueImgs,
        });

        setMainImage(product.mainImage || uniqueImgs[0]);
        setReviews(r.data || []);
        setInquiries(q.data || []);
      } catch (err) {
        console.error("❌", t("product.loadFail"), err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);
  // ✅ 후기 등록
  const addReview = async () => {
    if (!reviewInput.name || !reviewInput.comment)
      return alert(t("product.review.missingFields"));
    try {
      const res = await api.post(`/api/reviews`, { productId: id, ...reviewInput });
      setReviews((p) => [res.data, ...p]);
      setReviewInput({ name: "", rating: 5, comment: "" });
    } catch {
      alert(t("product.review.submitFail"));
    }
  };

  // ✅ 문의 등록
  const addInquiry = async () => {
    if (!inquiryInput.name || !inquiryInput.question)
      return alert(t("product.inquiry.missingFields"));
    try {
      const res = await api.post(`/api/inquiries`, { productId: id, ...inquiryInput });
      setInquiries((p) => [res.data, ...p]);
      setInquiryInput({ name: "", question: "" });
    } catch {
      alert(t("product.inquiry.submitFail"));
    }
  };

  // ✅ 탭 스크롤 연동
  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY + 200;
      const order = ["inquiry", "review", "size", "detail"];
      for (let k of order) {
        if (refs[k].current && y >= refs[k].current.offsetTop) {
          setActiveTab(k);
          break;
        }
      }
    };
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollTo = (r) => r.current?.scrollIntoView({ behavior: "smooth", block: "start" });

  if (loading) return <p className="text-center mt-10 text-gray-600">{t("product.loading")}</p>;
  if (!product)
    return <p className="text-center mt-10 text-red-500">{t("product.notFound")}</p>;

  return (
    <div className="bg-gray-50 min-h-screen pb-20">
      {/* ✅ 관리자 툴바 */}
      {user?.isAdmin && (
        <div className="fixed top-6 left-6 z-50 flex gap-3">
          <button
            onClick={toggleEdit}
            className={`px-4 py-2 rounded text-white font-semibold ${
              isEditMode ? "bg-green-600" : "bg-gray-700"
            }`}
          >
            {isEditMode ? t("product.designModeOn") : t("product.designModeOff")}
          </button>
          <button
            onClick={toggleResize}
            className={`px-4 py-2 rounded text-white font-semibold ${
              isResizeMode ? "bg-blue-600" : "bg-gray-700"
            }`}
          >
            {isResizeMode ? t("product.resizeOn") : t("product.resizeOff")}
          </button>
        </div>
      )}
      <div className="max-w-3xl mx-auto py-10">
        <Link
          to="/products"
          onClick={(e) => (isEditMode || isResizeMode) && e.preventDefault()}
          className={`text-blue-500 hover:underline mb-6 block ${
            isEditMode || isResizeMode ? "pointer-events-none opacity-50" : ""
          }`}
        >
          ← {t("product.backToList")}
        </Link>

        {/* ✅ 상품 상단 */}
        <div
  ref={hero.ref}
  onMouseDown={hero.startResize}
  style={{
    width: "100%",                 // 모바일에서 꽉 차게
    maxWidth: hero.size.width,     // PC에서는 리사이즈 폭 유지
    minHeight: isResizeMode ? hero.size.height : undefined,
    cursor: isResizeMode ? "se-resize" : "default",
  }}
  className="bg-white shadow-md rounded-lg overflow-hidden mb-8 mx-auto"
>
          {/* ✅ 상품 이미지 영역 */}
          <div className="flex flex-col items-center relative select-none">
            <div
  className="
    relative w-full flex justify-center items-center 
    bg-white rounded-lg overflow-hidden
    aspect-[3/4]              /* 가로:세로 비율 */
    max-[480px]:aspect-[3/5]  /* 모바일에서는 조금 더 낮게 */
  "
>

              <img
                src={mainImage || noImage}
                alt={product.name}
                className="w-auto h-auto max-w-none max-h-none object-scale-down transition-transform duration-300"
                style={{
                  width: "100%",
                  height: "auto",
                  objectFit: "cover",
                }}
              />

              {product.images?.length > 1 && (
                <>
                  <button
                    className="absolute left-3 text-3xl text-white bg-black/40 hover:bg-black/60 rounded-full p-2 transition"
                    onClick={(e) => {
                      e.stopPropagation();
                      const filteredImages =
                        product.images?.filter((img) => img && img.startsWith("http")) || [];
                      const currentIdx = filteredImages.indexOf(mainImage);
                      const prevIdx =
                        currentIdx <= 0 ? filteredImages.length - 1 : currentIdx - 1;
                      setMainImage(filteredImages[prevIdx]);
                    }}
                  >
                    ←
                  </button>

                  <button
                    className="absolute right-3 text-3xl text-white bg-black/40 hover:bg-black/60 rounded-full p-2 transition"
                    onClick={(e) => {
                      e.stopPropagation();
                      const filteredImages =
                        product.images?.filter((img) => img && img.startsWith("http")) || [];
                      const currentIdx = filteredImages.indexOf(mainImage);
                      const nextIdx =
                        currentIdx >= filteredImages.length - 1 ? 0 : currentIdx + 1;
                      setMainImage(filteredImages[nextIdx]);
                    }}
                  >
                    →
                  </button>
                </>
              )}
            </div>

            {/* ✅ 썸네일 리스트 */}
            {product.images?.length > 1 && (
              <div className="flex gap-2 mt-4 overflow-x-auto justify-center w-full px-2">
                {product.images
                  .filter((img) => img && img.startsWith("http"))
                  .map((img, idx) => (
                    <img
                      key={idx}
                      src={img}
                      alt={`thumb-${idx}`}
                      onClick={() => setMainImage(img)}
                      className={`w-20 h-20 object-cover rounded-lg cursor-pointer transition-all ${
                        img === mainImage
                          ? "ring-4 ring-blue-500 scale-105"
                          : "opacity-80 hover:opacity-100"
                      }`}
                    />
                  ))}
              </div>
            )}
          </div>

          <div className="p-6">
            <h2 className="text-2xl font-semibold mb-2">
              <EditableText
                id={`detail-name-${id}`}
                defaultText={product.name}
                onSave={(t) => localStorage.setItem(`detail-name-${id}`, t)}
              />
            </h2>

            <p className="text-gray-600 mb-4 whitespace-pre-line">
              <EditableText
                id={`detail-desc-${id}`}
                defaultText={product.description || t("product.noDescription")}
                onSave={(t) => localStorage.setItem(`detail-desc-${id}`, t)}
              />
            </p>

            <p className="text-xl font-bold text-blue-600 mb-6">
              {product.price?.toLocaleString()}
              {t("product.currency")}
            </p>

            <button
              disabled={isEditMode || isResizeMode}
              className="px-5 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition disabled:opacity-60"
            >
              🛒 {t("product.addToCart")}
            </button>
          </div>
        </div>
        {/* ✅ 탭 메뉴 */}
        <div className="sticky top-0 bg-white border-b z-40 flex justify-around py-3 shadow-sm">
          {Object.entries({
            detail: t("product.tab.detail"),
            size: t("product.tab.size"),
            review: t("product.tab.review"),
            inquiry: t("product.tab.inquiry"),
          }).map(([key, label]) => (
            <button
              key={key}
              onClick={() => scrollTo(refs[key])}
              className={`text-sm font-medium pb-2 ${
                activeTab === key
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-600 hover:text-blue-500"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* ✅ 상세 섹션 */}
        <div className="bg-white p-6 mt-2 rounded-lg shadow-sm space-y-16">
          {/* 상세정보 */}
          // 상세
<section
  ref={refs.detail}
  onMouseDown={detailBox.startResize}
  style={{
    width: "100%",
    maxWidth: detailBox.size.width,
    minHeight: isResizeMode ? detailBox.size.height : undefined,
    cursor: isResizeMode ? "se-resize" : "default",
  }}
  className="p-4 border border-gray-200 rounded-md mx-auto"
>

            <h2 className="text-lg font-semibold mb-2">📋 {t("product.detailInfo")}</h2>
            <div
              className="prose max-w-none"
              dangerouslySetInnerHTML={{ __html: product.detailText || "" }}
            />
          </section>

          {/* 사이즈 안내 */}
          // 사이즈
<section
  ref={refs.size}
  onMouseDown={sizeBox.startResize}
  style={{
    width: "100%",
    maxWidth: sizeBox.size.width,
    minHeight: isResizeMode ? sizeBox.size.height : undefined,
    cursor: isResizeMode ? "se-resize" : "default",
  }}
  className="p-4 border border-gray-200 rounded-md mx-auto"
>

            <h2 className="text-lg font-semibold mb-2">📏 {t("product.sizeGuide")}</h2>
            <EditableText
              id={`size-info-${id}`}
              defaultText={
                product.sizeText ||
                t("product.sizeDefault", {
                  note1: "- 사이즈는 측정 방법에 따라 ±1~3cm 오차가 있을 수 있습니다.",
                  note2: "- 모니터 환경에 따라 색상이 다르게 보일 수 있습니다.",
                  note3: "- 교환 및 반품 정책을 꼭 확인해주세요.",
                })
              }
              onSave={(t) => localStorage.setItem(`size-info-${id}`, t)}
            />
          </section>

          {/* 후기 섹션 */}
          <section ref={refs.review}>
            <h2 className="text-lg font-semibold mb-4">⭐ {t("product.review.title")}</h2>
            {reviews.length === 0 ? (
              <p>{t("product.review.none")}</p>
            ) : (
              reviews.map((r, i) => (
                <div key={i} className="border p-3 rounded bg-gray-50 text-sm">
                  <p className="font-semibold text-blue-600">
                    {r.name} ({r.rating}⭐)
                  </p>
                  <p>{r.comment}</p>
                </div>
              ))
            )}
            <div className="mt-5 border-t pt-4">
              <h3 className="font-semibold mb-2">{t("product.review.writeTitle")}</h3>
              <input
                placeholder={t("product.review.namePlaceholder")}
                className="border px-2 py-1 mr-2 rounded"
                value={reviewInput.name}
                onChange={(e) =>
                  setReviewInput({ ...reviewInput, name: e.target.value })
                }
              />
              <select
                value={reviewInput.rating}
                onChange={(e) =>
                  setReviewInput({ ...reviewInput, rating: e.target.value })
                }
                className="border px-2 py-1 mr-2 rounded"
              >
                {[5, 4, 3, 2, 1].map((n) => (
                  <option key={n}>{n}점</option>
                ))}
              </select>
              <textarea
                className="w-full border p-2 rounded mt-2"
                rows="3"
                placeholder={t("product.review.commentPlaceholder")}
                value={reviewInput.comment}
                onChange={(e) =>
                  setReviewInput({ ...reviewInput, comment: e.target.value })
                }
              />
              <button
                onClick={addReview}
                className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                {t("product.review.submit")}
              </button>
            </div>

            {/* ✅ 상품 문의 전체보기 버튼 */}
            <div className="mt-6 text-center">
              <Link
                to={`/product-support?productId=${id}`}
                className="text-blue-600 hover:underline text-sm"
              >
                {t("product.inquiry.all")}
              </Link>
            </div>
          </section>
          {/* 문의 섹션 */}
          <section ref={refs.inquiry}>
            <h2 className="text-lg font-semibold mb-4">💬 {t("product.inquiry.title")}</h2>
            {inquiries.length === 0 ? (
              <p>{t("product.inquiry.none")}</p>
            ) : (
              inquiries.map((q, i) => (
                <div key={i} className="border p-3 rounded bg-gray-50 text-sm">
                  <p className="font-semibold text-gray-800">{q.name}</p>
                  <p>{q.question}</p>
                </div>
              ))
            )}

            <div className="mt-5 border-t pt-4">
              <h3 className="font-semibold mb-2">{t("product.inquiry.writeTitle")}</h3>
              <input
                placeholder={t("product.inquiry.namePlaceholder")}
                className="border px-2 py-1 mr-2 rounded"
                value={inquiryInput.name}
                onChange={(e) =>
                  setInquiryInput({ ...inquiryInput, name: e.target.value })
                }
              />
              <textarea
                className="w-full border p-2 rounded mt-2"
                rows="3"
                placeholder={t("product.inquiry.questionPlaceholder")}
                value={inquiryInput.question}
                onChange={(e) =>
                  setInquiryInput({ ...inquiryInput, question: e.target.value })
                }
              />
              <button
                onClick={addInquiry}
                className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                {t("product.inquiry.submit")}
              </button>
            </div>
          </section>
        </div>
      </div>

      {/* ✅ 이미지 모달 */}
      {selectedIndex !== null && (
        <ImageModal
          images={product.images?.filter((img) => img && img.startsWith("http")) || []}
          currentIndex={selectedIndex}
          onClose={() => setSelectedIndex(null)}
          onNavigate={(dir) =>
            setSelectedIndex((p) => {
              const filteredImages =
                product.images?.filter((img) => img && img.startsWith("http")) || [];
              const total = filteredImages.length;
              return dir === "next"
                ? (p + 1) % total
                : (p - 1 + total) % total;
            })
          }
        />
      )}
    </div> /* ✅ ProductDetail 최상위 div 닫기 */
  );
}
