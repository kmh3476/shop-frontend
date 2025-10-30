// 📁 src/pages/ProductDetail.jsx
import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../lib/api";
import noImage from "../assets/no-image.png";

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

        {/* 닫기 버튼 */}
        <button
          className="absolute top-3 right-3 text-white bg-black/60 px-3 py-2 rounded-full hover:bg-black/80 transition"
          onClick={onClose}
        >
          ✖
        </button>

        {/* 좌우 탐색 버튼 */}
        {images.length > 1 && (
          <>
            <button
              className="absolute left-5 text-white text-3xl bg-black/50 px-3 py-1 rounded-full hover:bg-black/70 transition"
              onClick={(e) => {
                e.stopPropagation();
                onNavigate("prev");
              }}
            >
              ←
            </button>
            <button
              className="absolute right-5 text-white text-3xl bg-black/50 px-3 py-1 rounded-full hover:bg-black/70 transition"
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

function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mainImage, setMainImage] = useState(null);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [activeTab, setActiveTab] = useState("detail");

  const detailRef = useRef(null);
  const sizeRef = useRef(null);
  const reviewRef = useRef(null);
  const inquiryRef = useRef(null);

  const [reviews, setReviews] = useState([]);
  const [inquiries, setInquiries] = useState([]);
  const [reviewInput, setReviewInput] = useState({ name: "", rating: 5, comment: "" });
  const [inquiryInput, setInquiryInput] = useState({ name: "", question: "" });

  // ✅ 상품 및 리뷰/문의 불러오기
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await api.get(`/products/${id}`);
        const data = res.data;
        const imageList =
          Array.isArray(data.images) && data.images.length > 0
            ? data.images.filter(Boolean)
            : [data.imageUrl || data.image || noImage];
        setProduct({ ...data, images: imageList });
        setMainImage(imageList[0]);
      } catch (err) {
        console.error("❌ 상품 불러오기 실패:", err);
        setError("상품 정보를 불러오는 데 실패했습니다.");
      } finally {
        setLoading(false);
      }
    };

    const fetchExtras = async () => {
      try {
        const [reviewRes, inquiryRes] = await Promise.allSettled([
          api.get(`/reviews/${id}`),
          api.get(`/inquiries/${id}`),
        ]);

        if (reviewRes.status === "fulfilled") setReviews(reviewRes.value.data || []);
        else if (reviewRes.reason?.response?.status === 404) setReviews([]);
        else console.warn("⚠ 리뷰 불러오기 실패:", reviewRes.reason);

        if (inquiryRes.status === "fulfilled") setInquiries(inquiryRes.value.data || []);
        else if (inquiryRes.reason?.response?.status === 404) setInquiries([]);
        else console.warn("⚠ 문의 불러오기 실패:", inquiryRes.reason);
      } catch (err) {
        console.error("❌ 리뷰/문의 데이터 요청 중 오류:", err);
      }
    };

    fetchProduct();
    fetchExtras();
  }, [id]);

  // ✅ 후기 등록 함수
  const handleAddReview = async () => {
    if (!reviewInput.name || !reviewInput.comment) return alert("이름과 내용을 입력해주세요.");
    try {
      const payload = {
        productId: id,
        name: reviewInput.name,
        rating: Number(reviewInput.rating),
        comment: reviewInput.comment,
      };
      const res = await api.post(`/reviews`, payload);
      setReviews((prev) => [res.data, ...prev]);
      setReviewInput({ name: "", rating: 5, comment: "" });
    } catch (err) {
      console.error("❌ 리뷰 등록 실패:", err);
      alert("리뷰 등록 중 오류가 발생했습니다.");
    }
  };

  // ✅ 문의 등록 함수
  const handleAddInquiry = async () => {
    if (!inquiryInput.name || !inquiryInput.question)
      return alert("이름과 문의 내용을 입력해주세요.");
    try {
      const res = await api.post(`/inquiries`, { productId: id, ...inquiryInput });
      setInquiries((prev) => [res.data, ...prev]);
      setInquiryInput({ name: "", question: "" });
    } catch (err) {
      console.error("❌ 문의 등록 실패:", err);
      alert("문의 등록 중 오류가 발생했습니다.");
    }
  };

  // ✅ 이미지 모달 내 네비게이션
  const handleNavigate = (direction) => {
    setSelectedIndex((prev) => {
      if (!product?.images?.length) return prev;
      if (direction === "next") return (prev + 1) % product.images.length;
      if (direction === "prev") return (prev - 1 + product.images.length) % product.images.length;
      return prev;
    });
  };

  // ✅ 탭 스크롤 연동
  useEffect(() => {
    const sections = [
      { key: "detail", ref: detailRef },
      { key: "size", ref: sizeRef },
      { key: "review", ref: reviewRef },
      { key: "inquiry", ref: inquiryRef },
    ];

    const onScroll = () => {
      const scrollY = window.scrollY + 200;
      for (let i = sections.length - 1; i >= 0; i--) {
        const { key, ref } = sections[i];
        if (ref.current && scrollY >= ref.current.offsetTop) {
          setActiveTab(key);
          break;
        }
      }
    };

    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollToSection = (ref) => {
    ref.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  if (loading) return <p className="text-center mt-10 text-gray-600">불러오는 중...</p>;
  if (error)
    return (
      <p className="text-center mt-10 text-red-600 font-semibold">
        ⚠ {error}
      </p>
    );
  if (!product)
    return <p className="text-center mt-10 text-red-500">상품을 찾을 수 없습니다.</p>;

  return (
    <div className="bg-gray-50 min-h-screen pb-20">
      <div className="max-w-3xl mx-auto py-10">
        <Link to="/products" className="text-blue-500 hover:underline mb-6 block">
          ← 상품 목록으로 돌아가기
        </Link>

        {/* 상품 상단 */}
        <div className="bg-white shadow-md rounded-lg overflow-hidden mb-8">
          <div className="relative bg-gray-100">
            <img
              src={mainImage || noImage}
              alt={product.name}
              onClick={() => setSelectedIndex(product.images.indexOf(mainImage))}
              onError={(e) => (e.currentTarget.src = noImage)}
              className="w-full h-[400px] object-cover cursor-zoom-in hover:opacity-90 transition"
            />
            {product.images?.length > 1 && (
              <p className="absolute bottom-3 right-3 bg-black/60 text-white text-xs px-3 py-1 rounded-lg">
                {product.images.indexOf(mainImage) + 1}/{product.images.length}
              </p>
            )}
          </div>

          {/* 썸네일 */}
          {product.images?.length > 1 && (
            <div className="flex gap-3 justify-center flex-wrap p-4 bg-gray-100">
              {product.images.map((img, idx) => (
                <img
                  key={idx}
                  src={img}
                  alt={`thumbnail-${idx}`}
                  onClick={() => setMainImage(img)}
                  onError={(e) => (e.currentTarget.src = noImage)}
                  className={`w-20 h-20 object-cover rounded-md cursor-pointer border-2 transition ${
                    mainImage === img
                      ? "border-blue-500 scale-105"
                      : "border-transparent hover:scale-105"
                  }`}
                />
              ))}
            </div>
          )}

          {/* 상품 설명 */}
          <div className="p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-3">{product.name}</h2>
            <p className="text-gray-600 mb-4 whitespace-pre-line">
              {product.description || "상품 설명이 없습니다."}
            </p>
            <p className="text-xl font-bold text-blue-600 mb-6">
              {product.price?.toLocaleString()}원
            </p>
            <button className="px-5 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition">
              🛒 장바구니에 추가
            </button>
          </div>
        </div>

        {/* 탭 메뉴 */}
        <div className="sticky top-0 bg-white border-b z-40 flex justify-around py-3 shadow-sm">
          {[
            { key: "detail", label: "상세정보", ref: detailRef },
            { key: "size", label: "사이즈 & 구매안내", ref: sizeRef },
            { key: "review", label: "상품후기", ref: reviewRef },
            { key: "inquiry", label: "상품문의", ref: inquiryRef },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => scrollToSection(tab.ref)}
              className={`text-sm font-medium pb-2 transition ${
                activeTab === tab.key
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-600 hover:text-blue-500"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* 상세 섹션 */}
        <div className="bg-white p-6 mt-2 rounded-lg shadow-sm space-y-16 leading-relaxed">
          {/* 상세정보 */}
          <section ref={detailRef}>
            <h2 className="text-lg font-semibold mb-2">📋 상품 상세정보</h2>
            {product.images?.length > 0 && (
              <div className="flex flex-col items-center gap-6 mt-6">
                {product.images.map((img, idx) => (
                  <img
                    key={idx}
                    src={img}
                    alt={`detail-${idx}`}
                    className="w-full max-w-[600px] object-contain rounded-md shadow-sm"
                    onError={(e) => (e.currentTarget.src = noImage)}
                  />
                ))}
              </div>
            )}
          </section>

          {/* 사이즈 안내 */}
          <section ref={sizeRef}>
            <h2 className="text-lg font-semibold mb-2">📏 사이즈 & 구매안내</h2>
            <p>
              - 사이즈는 측정 방법에 따라 ±1~3cm 오차가 있을 수 있습니다.
              <br />
              - 모니터 환경에 따라 색상이 다르게 보일 수 있습니다.
              <br />
              - 교환 및 반품 정책을 꼭 확인해주세요.
            </p>
          </section>

          {/* 상품 후기 */}
          <section ref={reviewRef}>
            <h2 className="text-lg font-semibold mb-4">⭐ 상품 후기</h2>
            <div className="space-y-3">
              {reviews.length === 0 ? (
                <p className="text-gray-600">아직 등록된 후기가 없습니다.</p>
              ) : (
                reviews.map((r, i) => (
                  <div key={i} className="border p-3 rounded-md bg-gray-50 text-sm">
                    <p className="font-semibold text-blue-600">
                      {r.name} ({r.rating}⭐)
                    </p>
                    <p>{r.comment}</p>
                  </div>
                ))
              )}
            </div>

            {/* 후기 작성 */}
            <div className="mt-5 border-t pt-4">
              <h3 className="font-semibold mb-2">리뷰 작성하기</h3>
              <input
                type="text"
                placeholder="이름"
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
                  <option key={n} value={n}>
                    {n}점
                  </option>
                ))}
              </select>
              <textarea
                placeholder="리뷰 내용을 입력해주세요."
                className="w-full border p-2 rounded mt-2"
                rows="3"
                value={reviewInput.comment}
                onChange={(e) =>
                  setReviewInput({ ...reviewInput, comment: e.target.value })
                }
              ></textarea>
              <button
                onClick={handleAddReview}
                className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                등록
              </button>
            </div>
          </section>

          {/* 상품 문의 */}
          <section ref={inquiryRef}>
            <h2 className="text-lg font-semibold mb-4">💬 상품 문의</h2>
            <div className="space-y-3">
              {inquiries.length === 0 ? (
                <p className="text-gray-600">아직 등록된 문의가 없습니다.</p>
              ) : (
                inquiries.map((q, i) => (
                  <div key={i} className="border p-3 rounded-md bg-gray-50 text-sm">
                    <p className="font-semibold text-gray-800">{q.name}</p>
                    <p>{q.question}</p>
                  </div>
                ))
              )}
            </div>

            {/* 문의 작성 */}
            <div className="mt-5 border-t pt-4">
              <h3 className="font-semibold mb-2">상품 문의하기</h3>
              <input
                type="text"
                placeholder="이름"
                className="border px-2 py-1 mr-2 rounded"
                value={inquiryInput.name}
                onChange={(e) =>
                  setInquiryInput({ ...inquiryInput, name: e.target.value })
                }
              />
              <textarea
                placeholder="문의 내용을 입력해주세요."
                className="w-full border p-2 rounded mt-2"
                rows="3"
                value={inquiryInput.question}
                onChange={(e) =>
                  setInquiryInput({ ...inquiryInput, question: e.target.value })
                }
              ></textarea>
              <button
                onClick={handleAddInquiry}
                className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                등록
              </button>
            </div>
          </section>
        </div>
      </div>

      {/* 이미지 모달 */}
      {selectedIndex !== null && (
        <ImageModal
          images={product.images}
          currentIndex={selectedIndex}
          onClose={() => setSelectedIndex(null)}
          onNavigate={handleNavigate}
        />
      )}
    </div>
  );
}

export default ProductDetail;
