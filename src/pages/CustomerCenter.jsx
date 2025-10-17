import React, { useState, useEffect } from "react";

function CustomerCenter() {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    // 🧩 나중에 백엔드 API 연결 시 여기를 fetch로 변경
    setPosts([
      {
        id: 22944,
        product: "[득카] 트윌 스판 밴딩 와이드 팬츠",
        title: "재입고문의",
        author: "k******",
        date: "2025/10/16",
        views: 1,
        img: "/sample1.jpg",
      },
      {
        id: 22943,
        product: "[키작아도괜찮아 106탄 히든포켓와이드]",
        title: "재입고문의",
        author: "신**",
        date: "2025/10/16",
        views: 0,
        img: "/sample2.jpg",
      },
    ]);
  }, []);

  return (
    <div className="min-h-screen bg-white text-black py-12 font-['Pretendard']">
      <h1 className="text-5xl font-extrabold text-center mb-12">고객센터</h1>

      <div className="max-w-6xl mx-auto border-t border-gray-300">
        <table className="w-full border-collapse">
          <thead className="bg-gray-50 border-b border-gray-300 text-lg">
            <tr>
              <th className="py-4 w-[10%]">번호</th>
              <th className="py-4 w-[15%]">상품</th>
              <th className="py-4">제목</th>
              <th className="py-4 w-[15%]">작성자</th>
              <th className="py-4 w-[15%]">작성일</th>
              <th className="py-4 w-[10%]">조회</th>
            </tr>
          </thead>
          <tbody>
            {posts.map((p) => (
              <tr
                key={p.id}
                className="border-b border-gray-200 hover:bg-gray-50 transition"
              >
                <td className="py-4 text-center">{p.id}</td>
                <td className="py-4 flex items-center justify-center">
                  <img
                    src={p.img}
                    alt={p.product}
                    className="w-12 h-16 object-cover rounded"
                  />
                </td>
                <td className="py-4 text-center font-semibold text-gray-800">
                  [{p.product}] {p.title}
                </td>
                <td className="py-4 text-center text-gray-600">{p.author}</td>
                <td className="py-4 text-center text-gray-600">{p.date}</td>
                <td className="py-4 text-center text-gray-600">{p.views}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 글쓰기 버튼 */}
      <div className="max-w-6xl mx-auto flex justify-end mt-8">
        <button className="bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800">
          문의 작성하기
        </button>
      </div>
    </div>
  );
}

export default CustomerCenter;
