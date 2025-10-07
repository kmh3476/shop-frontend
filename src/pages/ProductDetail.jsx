// 📁 src/pages/ProductDetail.jsx
import { useEffect, useState, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../lib/api";
import noImage from "../assets/no-image.png";

// ✅ 이미지 확대 모달 (여러 장 지원)
function ImageModal({ images, currentIndex, onClose, onNavigate }) {
  if (!images || images.length === 0) return null;
  const imageUrl = images[currentIndex];

  // ✅ 키보드 화살표로 이동
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
            width: "auto",
            height: "auto",
            maxWidth: "90vw",
            maxHeight: "85vh",
            objectFit: "contain",
          }}
          onError={(e) => (e.currentTarget.src = noImage)}
        />

        {/* 닫기 버튼 */}
        <button
          className="absolute top-3 right-3 text-white bg-black/60 px-3 py-2 rounded-full hover:bg-black/80 transition"
          onClick={onClose}
        >
          ✖
        </button>

        {/* 좌우 화살표 */}
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

            {/* 인덱스 표시 */}
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
  const [selectedIndex, setSelectedIndex] = useState(null); // ✅ 모달용 인덱스

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
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  // ✅ 모달 내 이미지 넘기기 함수
  const handleNavigate = (direction) => {
    setSelectedIndex((prev) => {
      if (!product?.images?.length) return prev;
      if (direction === "next") return (prev + 1) % product.images.length;
      if (direction === "prev") return (prev - 1 + product.images.length) % product.images.length;
      return prev;
    });
  };

  if (loading)
    return <p className="text-center mt-10 text-gray-600">불러오는 중...</p>;
  if (!product)
    return <p className="text-center mt-10 text-red-500">상품을 찾을 수 없습니다.</p>;

  return (
    <div className="flex flex-col items-center py-10 bg-gray-50 min-h-screen">
      <Link
        to="/products"
        className="text-blue-500 hover:underline mb-6 self-start ml-6"
      >
        ← 상품 목록으로 돌아가기
      </Link>

      <div className="max-w-2xl w-full bg-white shadow-md rounded-lg overflow-hidden">
        {/* ✅ 대표 이미지 */}
        <div className="relative w-full bg-gray-100">
          <img
            src={mainImage || noImage}
            alt={product.name}
            onClick={() =>
              setSelectedIndex(product.images.indexOf(mainImage))
            }
            onError={(e) => (e.currentTarget.src = noImage)}
            className="w-full h-[400px] object-cover cursor-zoom-in hover:opacity-90 transition"
          />
          {product.images?.length > 1 && (
            <p className="absolute bottom-3 right-3 bg-black/60 text-white text-xs px-3 py-1 rounded-lg">
              {product.images.indexOf(mainImage) + 1}/{product.images.length}
            </p>
          )}
        </div>

        {/* ✅ 썸네일 리스트 */}
        {product.images && product.images.length > 1 && (
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

        {/* ✅ 상품 정보 */}
        <div className="p-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-3">
            {product.name}
          </h2>
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

      {/* ✅ 이미지 확대 모달 */}
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
