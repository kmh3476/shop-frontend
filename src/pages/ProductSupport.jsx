// 📁 src/pages/ProductSupport.jsx
import React from "react";

export default function ProductSupport() {
  return (
    <div className="min-h-screen bg-white text-black py-16 px-4 font-['Pretendard']">
      <h1 className="text-5xl font-extrabold text-center mb-12">
        상품 문의
      </h1>

      <div className="max-w-4xl mx-auto text-center text-gray-700">
        <p className="text-lg mb-6">
          상품 관련 문의를 남겨주세요. 최대한 빠르게 답변드리겠습니다.
        </p>
        <p className="text-gray-500">
          (이 페이지는 Support.jsx처럼 따로 API를 연동해도 됩니다.)
        </p>
      </div>
    </div>
  );
}
