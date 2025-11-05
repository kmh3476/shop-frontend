// 📁 src/pages/ProductDetail.jsx
import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../lib/api";
import noImage from "../assets/no-image.png";
import { useEditMode } from "../context/EditModeContext";
import { useAuth } from "../context/AuthContext";
import EditableText from "../components/EditableText";
import EditableImage from "../components/EditableImage";

// ✅ 이미지 확대 모달
function ImageModal({ images, currentIndex, onClose, onNavigate }) {
  if (!images || images.length === 0) return null;
  const imageUrl = images[currentIndex];

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
          alt="Product"
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

  const refs = {
    detail: useRef(null),
    size: useRef(null),
    review: useRef(null),
    inquiry: useRef(null),
  };

  // ✅ 각 섹션별 리사이즈 훅
  const hero = useResizableBox(`hero-${id}`, { width: 768, height: 999 }, isResizeMode);
  const detailBox = useResizableBox(`detail-box-${id}`, { width: 715, height: 582 }, isResizeMode);
  const sizeBox = useResizableBox(`size-box-${id}`, { width: 715, height: 470 }, isResizeMode);

  // ✅ 관리자 모드 토글
  const toggleEdit = () => {
    if (!user?.isAdmin) return alert("관리자만 접근 가능합니다.");
    setIsEditMode(!isEditMode);
  };
  const toggleResize = () => {
    if (!user?.isAdmin) return alert("관리자만 접근 가능합니다.");
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

        // ✅ blob 제거 및 Cloudinary 이미지만 유지
        const imgs = product.mainImage
          ? [product.mainImage, ...(product.images || []).filter((img) => img && img !== product.mainImage)]
          : (product.images || []).filter((img) => img && img.startsWith("http"));

        // ✅ 중복 제거
        const uniqueImgs = [...new Set(imgs.filter((img) => img && img.startsWith("http")))];

        setProduct({
          ...product,
          name: localStorage.getItem(`detail-name-${id}`) ?? product.name,
          description: localStorage.getItem(`detail-desc-${id}`) ?? product.description,
          detailText: product.detailText || "",
          sizeText: product.sizeText || "",
          images: uniqueImgs,
        });

        // ✅ 대표이미지 우선 표시
        setMainImage(product.mainImage || uniqueImgs[0]);

        setReviews(r.data || []);
        setInquiries(q.data || []);
      } catch (err) {
        console.error("❌ 상품 불러오기 실패:", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  // ✅ 후기 등록
  const addReview = async () => {
    if (!reviewInput.name || !reviewInput.comment) return alert("이름과 내용을 입력해주세요.");
    try {
      const res = await api.post(`/api/reviews`, { productId: id, ...reviewInput });
      setReviews((p) => [res.data, ...p]);
      setReviewInput({ name: "", rating: 5, comment: "" });
    } catch {
      alert("리뷰 등록 실패");
    }
  };

  // ✅ 문의 등록
  const addInquiry = async () => {
    if (!inquiryInput.name || !inquiryInput.question)
      return alert("이름과 문의 내용을 입력해주세요.");
    try {
      const res = await api.post(`/api/inquiries`, { productId: id, ...inquiryInput });
      setInquiries((p) => [res.data, ...p]);
      setInquiryInput({ name: "", question: "" });
    } catch {
      alert("문의 등록 실패");
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

  if (loading) return <p className="text-center mt-10 text-gray-600">불러오는 중...</p>;
  if (!product) return <p className="text-center mt-10 text-red-500">상품을 찾을 수 없습니다.</p>;

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
            {isEditMode ? "🖊 디자인모드 ON" : "✏ 디자인모드 OFF"}
          </button>
          <button
            onClick={toggleResize}
            className={`px-4 py-2 rounded text-white font-semibold ${
              isResizeMode ? "bg-blue-600" : "bg-gray-700"
            }`}
          >
            {isResizeMode ? "📐 크기조절 ON" : "📏 크기조절 OFF"}
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
          ← 상품 목록으로 돌아가기
        </Link>

        {/* ✅ 상품 상단 */}
        <div
          ref={hero.ref}
          onMouseDown={hero.startResize}
          style={{
            width: hero.size.width,
            minHeight: hero.size.height,
            cursor: isResizeMode ? "se-resize" : "default",
          }}
          className="bg-white shadow-md rounded-lg overflow-hidden mb-8"
        >
          <div className="flex flex-col items-center">
  <div className="w-full h-[400px] mb-4">
    <img
      src={mainImage || noImage}
      alt={product.name}
      className="w-full h-full object-contain rounded-lg"
    />
  </div>

  {/* ✅ 이미지 여러 장 썸네일 표시 */}
  <div className="flex gap-2 overflow-x-auto">
    {product.images &&
      product.images.map((img, idx) => (
        <img
          key={idx}
          src={img}
          alt={`thumbnail-${idx}`}
          className={`w-20 h-20 object-cover rounded cursor-pointer ${
            img === mainImage ? "ring-2 ring-blue-500" : ""
          }`}
          onClick={() => setMainImage(img)} // 클릭 시 대표 이미지 변경
        />
      ))}
  </div>
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
                defaultText={product.description || "상품 설명이 없습니다."}
                onSave={(t) => localStorage.setItem(`detail-desc-${id}`, t)}
              />
            </p>

            <p className="text-xl font-bold text-blue-600 mb-6">
              {product.price?.toLocaleString()}원
            </p>

            <button
              disabled={isEditMode || isResizeMode}
              className="px-5 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition disabled:opacity-60"
            >
              🛒 장바구니에 추가
            </button>
          </div>
        </div>

        {/* ✅ 탭 메뉴 */}
        <div className="sticky top-0 bg-white border-b z-40 flex justify-around py-3 shadow-sm">
          {Object.entries({
            detail: "상세정보",
            size: "사이즈 & 구매안내",
            review: "상품후기",
            inquiry: "상품문의",
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
          <section
            ref={refs.detail}
            onMouseDown={detailBox.startResize}
            style={{
              width: detailBox.size.width,
              minHeight: detailBox.size.height,
              cursor: isResizeMode ? "se-resize" : "default",
            }}
            className="p-4 border border-gray-200 rounded-md"
          >
            <h2 className="text-lg font-semibold mb-2">📋 상품 상세정보</h2>
            <EditableText
              key={product.detailText}
              id={`detail-info-${id}`}
              defaultText={product.detailText || "여기에 상품 상세정보를 입력하세요."}
            />
          </section>

          {/* 사이즈 안내 */}
          <section
            ref={refs.size}
            onMouseDown={sizeBox.startResize}
            style={{
              width: sizeBox.size.width,
              minHeight: sizeBox.size.height,
              cursor: isResizeMode ? "se-resize" : "default",
            }}
            className="p-4 border border-gray-200 rounded-md"
          >
            <h2 className="text-lg font-semibold mb-2">📏 사이즈 & 구매안내</h2>
            <EditableText
              id={`size-info-${id}`}
              defaultText={
                product.sizeText ||
                "- 사이즈는 측정 방법에 따라 ±1~3cm 오차가 있을 수 있습니다.\n- 모니터 환경에 따라 색상이 다르게 보일 수 있습니다.\n- 교환 및 반품 정책을 꼭 확인해주세요."
              }
              onSave={(t) => localStorage.setItem(`size-info-${id}`, t)}
            />
          </section>

          {/* 후기 섹션 */}
          <section ref={refs.review}>
            <h2 className="text-lg font-semibold mb-4">⭐ 상품 후기</h2>
            {reviews.length === 0 ? (
              <p>아직 등록된 후기가 없습니다.</p>
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
              <h3 className="font-semibold mb-2">리뷰 작성하기</h3>
              <input
                placeholder="이름"
                className="border px-2 py-1 mr-2 rounded"
                value={reviewInput.name}
                onChange={(e) => setReviewInput({ ...reviewInput, name: e.target.value })}
              />
              <select
                value={reviewInput.rating}
                onChange={(e) => setReviewInput({ ...reviewInput, rating: e.target.value })}
                className="border px-2 py-1 mr-2 rounded"
              >
                {[5, 4, 3, 2, 1].map((n) => (
                  <option key={n}>{n}점</option>
                ))}
              </select>
              <textarea
                className="w-full border p-2 rounded mt-2"
                rows="3"
                placeholder="리뷰 내용을 입력해주세요."
                value={reviewInput.comment}
                onChange={(e) => setReviewInput({ ...reviewInput, comment: e.target.value })}
              />
              <button
                onClick={addReview}
                className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                등록
              </button>
            </div>

            {/* ✅ 상품 문의 전체보기 버튼 */}
            <div className="mt-6 text-center">
              <Link
                to={`/product-support?productId=${id}`} // ✅ 현재 상품 ID 전달
                className="text-blue-600 hover:underline text-sm"
              >
                상품 문의 전체보기
              </Link>
            </div>
          </section>

          {/* 문의 섹션 */}
          <section ref={refs.inquiry}>
            <h2 className="text-lg font-semibold mb-4">💬 상품 문의</h2>
            {inquiries.length === 0 ? (
              <p>아직 등록된 문의가 없습니다.</p>
            ) : (
              inquiries.map((q, i) => (
                <div key={i} className="border p-3 rounded bg-gray-50 text-sm">
                  <p className="font-semibold text-gray-800">{q.name}</p>
                  <p>{q.question}</p>
                </div>
              ))
            )}

            <div className="mt-5 border-t pt-4">
              <h3 className="font-semibold mb-2">상품 문의하기</h3>
              <input
                placeholder="이름"
                className="border px-2 py-1 mr-2 rounded"
                value={inquiryInput.name}
                onChange={(e) => setInquiryInput({ ...inquiryInput, name: e.target.value })}
              />
              <textarea
                className="w-full border p-2 rounded mt-2"
                rows="3"
                placeholder="문의 내용을 입력해주세요."
                value={inquiryInput.question}
                onChange={(e) => setInquiryInput({ ...inquiryInput, question: e.target.value })}
              />
              <button
                onClick={addInquiry}
                className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                등록
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
        const filteredImages = product.images?.filter((img) => img && img.startsWith("http")) || [];
        const total = filteredImages.length;
        return dir === "next" ? (p + 1) % total : (p - 1 + total) % total;
      })
    }
  />
)}
    </div> /* ✅ ProductDetail 최상위 div 닫기 */
  );
}
