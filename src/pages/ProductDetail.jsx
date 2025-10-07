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
          style={{
            maxWidth: "90vw",
            maxHeight: "85vh",
            objectFit: "contain",
          }}
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
  const [mainImage, setMainImage] = useState(null);
  const [selectedIndex, setSelectedIndex] = useState(null);

  // ✅ 탭 / 섹션 상태
  const [activeTab, setActiveTab] = useState("detail");
  const detailRef = useRef(null);
  const sizeRef = useRef(null);
  const reviewRef = useRef(null);
  const inquiryRef = useRef(null);

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
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  // ✅ 모달 이미지 넘기기
  const handleNavigate = (direction) => {
    setSelectedIndex((prev) => {
      if (!product?.images?.length) return prev;
      if (direction === "next") return (prev + 1) % product.images.length;
      if (direction === "prev") return (prev - 1 + product.images.length) % product.images.length;
      return prev;
    });
  };

  // ✅ 스크롤 시 현재 탭 변경
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

  // ✅ 탭 클릭 → 스무스 스크롤
  const scrollToSection = (ref) => {
    ref.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  if (loading)
    return <p className="text-center mt-10 text-gray-600">불러오는 중...</p>;
  if (!product)
    return <p className="text-center mt-10 text-red-500">상품을 찾을 수 없습니다.</p>;

  return (
    <div className="bg-gray-50 min-h-screen pb-20">
      <div className="max-w-3xl mx-auto py-10">
        <Link to="/products" className="text-blue-500 hover:underline mb-6 block">
          ← 상품 목록으로 돌아가기
        </Link>

        {/* 상품 상단 정보 */}
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

        {/* ✅ 상단 고정 탭 */}
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

        {/* ✅ 스크롤 가능한 섹션들 */}
        <div className="bg-white p-6 mt-2 rounded-lg shadow-sm space-y-16 leading-relaxed">
          <section ref={detailRef}>
            <h2 className="text-lg font-semibold mb-2">📋 상품 상세정보</h2>
            <p>{product.description || "상품 상세정보가 없습니다."}</p>
            {product.images?.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4">
                {product.images.map((img, idx) => (
                  <img
                    key={idx}
                    src={img}
                    alt={`detail-${idx}`}
                    className="rounded-md w-full object-cover"
                    onError={(e) => (e.currentTarget.src = noImage)}
                  />
                ))}
              </div>
            )}
          </section>

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

          <section ref={reviewRef}>
            <h2 className="text-lg font-semibold mb-2">⭐ 상품 후기</h2>
            <p className="text-gray-600">아직 등록된 후기가 없습니다.</p>
          </section>

          <section ref={inquiryRef}>
            <h2 className="text-lg font-semibold mb-2">💬 상품 문의</h2>
            <p className="text-gray-600">상품 관련 문의를 남겨주세요.</p>
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
