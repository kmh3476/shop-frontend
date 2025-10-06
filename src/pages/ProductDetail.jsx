// 📁 src/pages/ProductDetail.jsx
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../lib/api";
import noImage from "../assets/no-image.png";

function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

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

  return (
    <div className="flex flex-col items-center py-10">
      <Link
        to="/products"
        className="text-blue-500 hover:underline mb-6 self-start ml-6"
      >
        ← 상품 목록으로 돌아가기
      </Link>

      <div className="max-w-2xl w-full bg-white shadow-md rounded-lg overflow-hidden">
        <img
          src={product.imageUrl || noImage}
          alt={product.name}
          onError={(e) => (e.currentTarget.src = noImage)}
          className="w-full h-[350px] object-cover"
        />
        <div className="p-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">
            {product.name}
          </h2>
          <p className="text-gray-500 mb-4">{product.description}</p>
          <p className="text-lg font-bold text-blue-600 mb-6">
            {product.price.toLocaleString()}원
          </p>

          <button className="px-5 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition">
            🛒 장바구니에 추가
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProductDetail;
