// 📁 src/pages/ProductSupport.jsx
import React, { useEffect, useState } from "react";
import API from "../api/axiosInstance"; // ✅ axiosInstance
import { useAuth } from "../context/AuthContext";
import { useLocation, useNavigate } from "react-router-dom";

/* --------------------------------------------------------
 ✅ 이메일 유효성 검사 (선택 입력용)
-------------------------------------------------------- */
function isValidEmail(email) {
  if (!email) return true;
  const regex = /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/;
  return regex.test(email);
}

/* --------------------------------------------------------
 ✅ 상품 문의 페이지 (고객센터 탭 스타일 적용)
-------------------------------------------------------- */
export default function ProductSupport() {
  const [posts, setPosts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [newPost, setNewPost] = useState({
    email: "",
    question: "",
    answer: "",
    isPrivate: false,
  });
  const [loading, setLoading] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);

  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const API_URL = "/api/inquiries";

  /* ✅ 로그인 시 이메일 자동 채움 */
  useEffect(() => {
    if (user?.email) {
      setNewPost((prev) => ({ ...prev, email: user.email }));
    }
  }, [user]);

  /* ✅ 초기 로드 시 상품 문의만 가져오기 */
  useEffect(() => {
    fetchPosts();
  }, []);

  /* ✅ 상품 문의 데이터만 불러오기 */
  async function fetchPosts() {
    try {
      const res = await API.get(`${API_URL}/all`);
      // ✅ 상품 문의만 (공지글, 일반 문의 제외)
      const productPosts = res.data.filter(
        (p) => p.productId && !p.isNotice
      );
      const sorted = productPosts.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
      setPosts(sorted);
    } catch (err) {
      console.error("상품 문의 목록 불러오기 실패:", err);
    }
  }

  /* ✅ 이메일 마스킹 */
  function displayEmail(email) {
    if (!email || typeof email !== "string") return "익명";
    if (!email.includes("@")) return email;
    const [id] = email.split("@");
    return id.slice(0, 2) + "****";
  }

  /* ✅ 문의 등록 처리 */
  async function handleSubmit(e) {
    e.preventDefault();

    if (!user) {
      alert("로그인 후 상품 문의를 작성할 수 있습니다.");
      return navigate("/login");
    }

    if (!newPost.question || !newPost.answer) {
      return alert("제목과 내용을 모두 입력해주세요.");
    }

    if (newPost.email && !isValidEmail(newPost.email)) {
      return alert("올바른 이메일 형식을 입력해주세요.");
    }

    try {
      setLoading(true);
      await API.post(API_URL, {
        email: user.email,
        question: newPost.question,
        answer: newPost.answer,
        isPrivate: newPost.isPrivate,
        productId: "default-product",
      });
      alert("상품 문의가 등록되었습니다!");
      setNewPost({
        email: user?.email || "",
        question: "",
        answer: "",
        isPrivate: false,
      });
      setShowForm(false);
      fetchPosts();
    } catch (err) {
      console.error("상품 문의 등록 실패:", err);
      alert(
        err.response?.data?.message || "문의 등록 중 오류가 발생했습니다."
      );
    } finally {
      setLoading(false);
    }
  }

  /* ✅ 문의 상세 보기 열기 */
  function handleViewDetail(post) {
    setSelectedPost(post);
  }

  /* ✅ 문의 상세 닫기 */
  function closeDetail() {
    setSelectedPost(null);
  }
  /* --------------------------------------------------------
   ✅ 전체 UI 렌더링 시작
  -------------------------------------------------------- */
  return (
    <div className="min-h-screen bg-white text-black py-16 px-4 font-['Pretendard'] relative">
      {/* 상단 탭 (사용자 문의 / 상품 문의) */}
      <div className="flex justify-center mb-12">
        <div className="inline-flex bg-gray-100 rounded-full p-1 shadow-sm">
          <button
            onClick={() => navigate("/support")}
            className={`px-6 py-2 rounded-full text-base font-medium transition-all ${
              location.pathname === "/support"
                ? "bg-black text-white shadow-sm"
                : "text-gray-600 hover:text-black"
            }`}
          >
            사용자 문의
          </button>
          <button
            onClick={() => navigate("/product-support")}
            className={`px-6 py-2 rounded-full text-base font-medium transition-all ${
              location.pathname === "/product-support"
                ? "bg-black text-white shadow-sm"
                : "text-gray-600 hover:text-black"
            }`}
          >
            상품 문의
          </button>
        </div>
      </div>

      {/* 페이지 제목 */}
      <h1 className="text-4xl font-extrabold text-center mb-14">
        고객센터
      </h1>

        {/* ✅ 문의 작성 버튼 */}
      {!showForm && !selectedPost && (
        <div className="flex justify-center mb-10 gap-4">
          {/* ✅ 관리자 공지 등록 버튼 */}
          {user?.isAdmin && (
            <button
              onClick={handleNoticeSubmit}
              className="px-4 py-2 rounded bg-yellow-500 text-white font-semibold hover:bg-yellow-600"
            >
              📢 공지 등록
            </button>
          )}

          <button
            onClick={() => {
              if (!user) {
                if (
                  window.confirm("로그인이 필요합니다. 로그인 페이지로 이동할까요?")
                ) {
                  navigate("/login");
                }
                return;
              }
              setShowForm(true);
            }}
            className="bg-black text-white px-8 py-3 rounded-lg font-semibold hover:bg-gray-800 transition-all"
          >
            ✉ 문의 작성하기
          </button>
        </div>
      )}

      {/* ✅ 문의 작성 폼 */}
      {showForm && user && !selectedPost && (
        <div className="max-w-3xl mx-auto mb-16 bg-gray-50 rounded-2xl p-8 shadow">
          <h2 className="text-2xl font-bold mb-6">상품 문의 작성</h2>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* ✅ 이메일 입력칸 — 자동 입력 + 수정 가능 */}
            <input
              type="email"
              placeholder="답변 받을 이메일 (선택)"
              value={newPost.email}
              onChange={(e) =>
                setNewPost({ ...newPost, email: e.target.value })
              }
              className="border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-black"
            />

            {/* 제목 */}
            <input
              type="text"
              placeholder="문의 제목을 입력하세요"
              value={newPost.question}
              onChange={(e) =>
                setNewPost({ ...newPost, question: e.target.value })
              }
              className="border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-black"
            />

            {/* 내용 */}
            <textarea
              placeholder="문의 내용을 입력하세요"
              rows="5"
              value={newPost.answer}
              onChange={(e) =>
                setNewPost({ ...newPost, answer: e.target.value })
              }
              className="border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-black resize-none"
            />

            {/* 비공개 체크 */}
            <label className="flex items-center gap-2 text-gray-700 text-sm">
              <input
                type="checkbox"
                checked={newPost.isPrivate}
                onChange={(e) =>
                  setNewPost({ ...newPost, isPrivate: e.target.checked })
                }
              />
              비공개 문의로 등록하기
            </label>

            {/* 버튼 영역 */}
            <div className="flex gap-4 mt-4">
              <button
                type="submit"
                disabled={loading}
                className={`flex-1 bg-black text-white py-3 rounded-lg hover:bg-gray-800 ${
                  loading ? "opacity-70 cursor-not-allowed" : ""
                }`}
              >
                {loading ? "등록 중..." : "문의 등록"}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="flex-1 bg-gray-300 text-black py-3 rounded-lg hover:bg-gray-400"
              >
                취소
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ✅ 문의 목록 */}
      {!selectedPost && (
        <div className="max-w-6xl mx-auto bg-white p-4 rounded shadow">
          <h2 className="text-3xl font-bold mb-6">상품 문의 목록</h2>

          <table className="w-full border-collapse border-t border-gray-300">
            <thead className="bg-gray-100">
              <tr className="text-left">
                <th className="p-3 text-center w-[8%]">번호</th>
                <th className="p-3 w-[20%]">작성자</th>
                <th className="p-3 w-[25%]">제목</th>
                <th className="p-3 w-[35%]">내용</th>
                <th className="p-3 text-center w-[12%]">상태</th>
              </tr>
            </thead>

            <tbody>
              {posts.map((p, i) => (
                <tr
                  key={p._id}
                  className={`border-b border-gray-200 hover:bg-gray-50 ${
                    p.isNotice ? "bg-gray-200" : ""
                  }`}
                  onClick={() => handleViewDetail(p)}
                >
                  <td className="p-3 text-center">{i + 1}</td>
                  <td className="p-3 text-sm">
                    {p.isNotice ? "관리자" : displayEmail(p.email)}
                  </td>
                  <td className="p-3 font-semibold text-gray-800">
                    {p.isNotice && (
                      <span className="text-blue-600 font-bold">[공지]</span>
                    )}{" "}
                    {p.question}
                    {p.isPrivate && (
                      <span className="ml-1 text-gray-500 text-xs">🔒</span>
                    )}
                  </td>
                  <td className="p-3 text-gray-700 text-sm">
                    {p.isPrivate ? (
                      <span className="italic text-gray-400">🔒 비공개 문의</span>
                    ) : p.answer?.length > 40 ? (
                      p.answer.slice(0, 40) + "..."
                    ) : (
                      p.answer
                    )}
                  </td>
                  <td className="p-3 text-center">
                    {p.reply ? (
                      <span className="text-green-600 font-medium">답변 완료</span>
                    ) : (
                      <span className="text-gray-500">처리 중</span>
                    )}
                  </td>
                </tr>
              ))}
              {posts.length === 0 && (
                <tr>
                  <td colSpan="5" className="text-center text-gray-500 py-6 bg-gray-50">
                    등록된 상품 문의가 없습니다.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* ✅ 문의 상세 보기 */}
      {selectedPost && (
        <div className="max-w-3xl mx-auto bg-gray-50 rounded-2xl p-8 shadow relative">
          {/* 닫기 버튼 */}
          <button
            onClick={closeDetail}
            className="absolute top-4 right-4 bg-gray-300 text-black px-3 py-1 rounded hover:bg-gray-400"
          >
            닫기
          </button>

          {/* 제목 */}
          <h2 className="text-2xl font-bold mb-4">
            {selectedPost.isNotice ? "📢 공지사항" : selectedPost.question}
          </h2>

          {/* 작성자 정보 */}
          <p className="text-gray-600 text-sm mb-6">
            작성자:{" "}
            {selectedPost.isNotice
              ? "관리자"
              : displayEmail(selectedPost.email)}{" "}
            | {new Date(selectedPost.createdAt).toLocaleDateString()}
          </p>

          {/* 문의 내용 */}
          <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
            <p className="text-gray-800 whitespace-pre-wrap">
              {selectedPost.answer}
            </p>
          </div>

          {/* 관리자 답변 */}
          {selectedPost.reply ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="font-semibold text-green-700 mb-2">
                관리자 답변
              </h3>
              <p className="text-gray-800 whitespace-pre-wrap">
                {selectedPost.reply}
              </p>
            </div>
          ) : (
            <div className="text-gray-500 italic">
              아직 답변이 등록되지 않았습니다.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
