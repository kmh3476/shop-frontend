// 📁 src/pages/ProductDetail.jsx
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../lib/api";
import noImage from "../assets/no-image.png";

// ✅ 이미지 확대 모달
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
            maxWidth: "90vw",
            maxHeight: "85vh",
            minWidth: "400px",
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
  const [selectedImage, setSelectedImage] = useState(null); // 모달용
  const [mainImage, setMainImage] = useState(null); // 대표 이미지

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await api.get(`/products/${id}`);
        const data = res.data;

        // ✅ 여러 장이 있으면 첫 번째 이미지를 대표로 설정
        const imageList = data.images && data.images.length > 0
          ? data.images
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

  if (loading) return <p className="text-center mt-10">불러오는 중...</p>;
  if (!product) return <p className="text-center mt-10">상품을 찾을 수 없습니다.</p>;

  return (
    <div className="flex flex-col items-center py-10 bg-gray-50 min-h-screen">
      <Link
        to="/products"
        className="text-blue-500 hover:underline mb-6 self-start ml-6"
      >
        ← 상품 목록으로 돌아가기
      </Link>

      <div className="max-w-2xl w-full bg-white shadow-md rounded-lg overflow-hidden">
        {/* ✅ 대표 이미지 클릭 시 확대 모달 */}
        <img
          src={mainImage || noImage}
          alt={product.name}
          onClick={() => setSelectedImage(mainImage)}
          onError={(e) => (e.currentTarget.src = noImage)}
          className="w-full h-[400px] object-cover cursor-zoom-in hover:opacity-90 transition"
        />

        {/* ✅ 썸네일 리스트 */}
        {product.images && product.images.length > 1 && (
          <div className="flex gap-3 justify-center p-4 bg-gray-100">
            {product.images.map((img, idx) => (
              <img
                key={idx}
                src={img}
                alt={`thumbnail-${idx}`}
                onClick={() => setMainImage(img)}
                className={`w-20 h-20 object-cover rounded-md cursor-pointer border-2 transition ${
                  mainImage === img
                    ? "border-blue-500 scale-105"
                    : "border-transparent hover:scale-105"
                }`}
                onError={(e) => (e.currentTarget.src = noImage)}
              />
            ))}
          </div>
        )}

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
      <ImageModal imageUrl={selectedImage} onClose={() => setSelectedImage(null)} />
    </div>
  );
}

export default ProductDetail;
