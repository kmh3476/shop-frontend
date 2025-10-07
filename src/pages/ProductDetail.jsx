// 📁 src/pages/ProductDetail.jsx
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../lib/api";
import noImage from "../assets/no-image.png";

// ✅ 수정된 ImageModal (작은 원본 이미지도 크게 보이도록 개선)
function ImageModal({ imageUrl, onClose }) {
  if (!imageUrl) return null;
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
          src={imageUrl}
          alt="Product"
          className="rounded-lg shadow-2xl transition-transform duration-300 cursor-zoom-out"
          style={{
            width: "auto",
            height: "auto",
            maxWidth: "90vw",   // 👉 화면 너비의 최대 90%
            maxHeight: "85vh",  // 👉 화면 높이의 최대 85%
            minWidth: "400px",  // 👉 너무 작은 이미지도 400px은 유지
            objectFit: "contain",
          }}
        />
        <button
          className="absolute top-3 right-3 text-white bg-black/60 px-3 py-2 rounded-full hover:bg-black/80 transition"
          onClick={onClose}
        >
          ✖
        </button>
      </div>
    </div>
  );
}

function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null); // ✅ 클릭 시 이미지 모달용

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await api.get(`/products/${id}`);
        setProduct(res.data);
      } catch (err) {
        console.error("❌ 상품 불러오기 실패:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  if (loading) return <p className="text-center mt-10">불러오는 중...</p>;
  if (!product) return <p className="text-center mt-10">상품을 찾을 수 없습니다.</p>;

  // ✅ 이미지 경로 처리
  const imageSrc =
    product.image?.startsWith("http")
      ? product.image
      : product.imageUrl?.startsWith("http")
      ? product.imageUrl
      : noImage;

  return (
    <div className="flex flex-col items-center py-10 bg-gray-50 min-h-screen">
      <Link
        to="/products"
        className="text-blue-500 hover:underline mb-6 self-start ml-6"
      >
        ← 상품 목록으로 돌아가기
      </Link>

      <div className="max-w-2xl w-full bg-white shadow-md rounded-lg overflow-hidden">
        {/* ✅ 클릭 시 확대 모달 열기 */}
        <img
          src={imageSrc}
          alt={product.name}
          onClick={() => setSelectedImage(imageSrc)}
          onError={(e) => (e.currentTarget.src = noImage)}
          className="w-full h-[350px] object-cover cursor-zoom-in hover:opacity-90 transition"
        />

        <div className="p-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">
            {product.name}
          </h2>
          <p className="text-gray-500 mb-4">{product.description}</p>
          <p className="text-lg font-bold text-blue-600 mb-6">
            {product.price?.toLocaleString()}원
          </p>

          <button className="px-5 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition">
            🛒 장바구니에 추가
          </button>
        </div>
      </div>

      {/* ✅ 이미지 확대 모달 */}
      <ImageModal
        imageUrl={selectedImage}
        onClose={() => setSelectedImage(null)}
      />
    </div>
  );
}

export default ProductDetail;
