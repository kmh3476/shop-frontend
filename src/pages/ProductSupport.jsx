// 📁 src/pages/ProductSupport.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext"; // ✅ 로그인 정보 불러오기
import { useLocation, useNavigate } from "react-router-dom";

export default function ProductSupport() {
  const [posts, setPosts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [newPost, setNewPost] = useState({
    email: "",
    question: "",
    answer: "",
    productId: "", // ✅ 상품 페이지에서 작성 시 productId 포함
    isPrivate: false,
  });
  const [loading, setLoading] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);

  const { user } = useAuth(); // ✅ 로그인 유저 가져오기
  const location = useLocation();
  const navigate = useNavigate();

  const API = "https://shop-backend-1-dfsl.onrender.com/api/inquiries";

  // ✅ 유저 이메일 자동 반영
  useEffect(() => {
    if (user?.email) {
      setNewPost((prev) => ({ ...prev, email: user.email }));
    }
  }, [user]);

  useEffect(() => {
    fetchPosts();
  }, []);

  // ✅ 상품 문의만 불러오기 (productId 존재하는 글만)
  async function fetchPosts() {
    try {
      const res = await axios.get(`${API}/all`);
      const productPosts = res.data
        .filter((post) => post.productId) // ✅ 상품에서 작성된 문의만 필터링
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)); // 최신순
      setPosts(productPosts);
    } catch (err) {
      console.error("상품 문의 목록 불러오기 실패:", err);
    }
  }

  // ✅ 이메일 마스킹
  function displayEmail(email) {
    if (!email || typeof email !== "string") return "익명";
    if (!email.includes("@")) return email;
    const [id] = email.split("@");
    return id.slice(0, 2) + "****";
  }

  // ✅ 상품 문의 작성
  async function handleSubmit(e) {
    e.preventDefault();

    // ✅ 로그인 필수
    if (!user) {
      alert("로그인 후에만 상품 문의를 작성할 수 있습니다.");
      return navigate("/login");
    }

    if (!newPost.question || !newPost.answer)
      return alert("제목과 내용을 모두 입력해주세요.");

    try {
      setLoading(true);
      await axios.post(API, {
        email: user.email, // ✅ 로그인 이메일 자동 사용
        question: newPost.question,
        answer: newPost.answer,
        productId: newPost.productId || "default-product",
        isPrivate: newPost.isPrivate,
      });
      alert("상품 문의가 등록되었습니다!");
      setNewPost({
        email: user.email || "",
        question: "",
        answer: "",
        productId: "",
        isPrivate: false,
      });
      setShowForm(false);
      setTimeout(fetchPosts, 500);
    } catch (err) {
      console.error("상품 문의 등록 실패:", err);
      alert("상품 문의 등록 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  }
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">상품 문의</h2>
          <button
            onClick={() => setShowForm((s) => !s)}
            className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition"
          >
            {showForm ? "목록 보기" : "문의 작성"}
          </button>
        </div>

        {/* ✅ 문의 작성 폼 */}
        {showForm && (
          <form
            onSubmit={handleSubmit}
            className="border border-gray-200 rounded-xl p-5 bg-gray-50 mb-6"
          >
            {/* 이메일 입력 (자동 입력, 수정 불가) */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                이메일
              </label>
              <input
                type="email"
                value={newPost.email}
                readOnly
                placeholder="로그인된 이메일이 자동 입력됩니다"
                className="border border-gray-200 bg-gray-100 rounded-lg p-3 w-full text-gray-500"
              />
            </div>

            {/* 제목 입력 */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                제목
              </label>
              <input
                type="text"
                placeholder="문의 제목을 입력해주세요"
                value={newPost.question}
                onChange={(e) =>
                  setNewPost({ ...newPost, question: e.target.value })
                }
                className="border border-gray-300 rounded-lg p-3 w-full focus:ring-2 focus:ring-black"
              />
            </div>

            {/* 내용 입력 */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                내용
              </label>
              <textarea
                placeholder="문의 내용을 입력해주세요"
                value={newPost.answer}
                onChange={(e) =>
                  setNewPost({ ...newPost, answer: e.target.value })
                }
                rows={5}
                className="border border-gray-300 rounded-lg p-3 w-full resize-none focus:ring-2 focus:ring-black"
              />
            </div>

            {/* 비공개 여부 */}
            <label className="inline-flex items-center mb-6">
              <input
                type="checkbox"
                checked={newPost.isPrivate}
                onChange={(e) =>
                  setNewPost({ ...newPost, isPrivate: e.target.checked })
                }
                className="form-checkbox text-black"
              />
              <span className="ml-2 text-sm text-gray-700">비공개 문의로 등록</span>
            </label>

            {/* 제출 버튼 */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 rounded-lg font-semibold transition ${
                loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-black text-white hover:bg-gray-800"
              }`}
            >
              {loading ? "등록 중..." : "등록하기"}
            </button>
          </form>
        )}

        {/* ✅ 문의 상세 보기 */}
        {selectedPost && (
          <div className="border border-gray-200 rounded-xl p-5 bg-gray-50 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {selectedPost.question}
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              {selectedPost.answer}
            </p>

            {selectedPost.reply && (
              <div className="mt-4 bg-gray-100 rounded-lg p-4">
                <p className="text-sm text-gray-800 whitespace-pre-line">
                  <strong>답변:</strong> {selectedPost.reply}
                </p>
              </div>
            )}

            <div className="mt-4 text-right">
              <button
                onClick={() => setSelectedPost(null)}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                닫기
              </button>
            </div>
          </div>
        )}
        {/* ✅ 문의 목록 */}
        {!showForm && (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-200 text-sm">
              <thead className="bg-gray-100">
                <tr className="text-left">
                  <th className="p-3 border border-gray-200 w-[20%]">작성자</th>
                  <th className="p-3 border border-gray-200">제목</th>
                  <th className="p-3 border border-gray-200 w-[20%]">작성일</th>
                  <th className="p-3 border border-gray-200 w-[10%] text-center">
                    삭제
                  </th>
                </tr>
              </thead>
              <tbody>
                {posts.length === 0 ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="text-center py-6 text-gray-400 italic"
                    >
                      등록된 상품 문의가 없습니다.
                    </td>
                  </tr>
                ) : (
                  posts.map((post) => (
                    <tr
                      key={post._id}
                      className="hover:bg-gray-50 cursor-pointer"
                    >
                      <td className="p-3 border border-gray-200 text-gray-700">
                        {displayEmail(post.email)}
                      </td>
                      <td
                        className="p-3 border border-gray-200 text-gray-900"
                        onClick={() => setSelectedPost(post)}
                      >
                        {post.isPrivate ? "🔒 비공개 문의" : post.question}
                      </td>
                      <td className="p-3 border border-gray-200 text-gray-500">
                        {new Date(post.createdAt).toLocaleDateString("ko-KR")}
                      </td>

                      {/* ✅ 삭제 버튼 (작성자 본인 또는 관리자만 표시) */}
                      <td className="p-3 border border-gray-200 text-center">
                        {(user?.isAdmin ||
                          (user?.email &&
                            post.email &&
                            user.email === post.email)) && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(post._id);
                            }}
                            className="text-red-600 hover:text-red-800"
                          >
                            삭제
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------
 ✅ 문의 삭제 기능 (작성자 본인 or 관리자만)
------------------------------------------------------ */
async function handleDelete(postId) {
  if (!window.confirm("이 문의를 삭제하시겠습니까?")) return;

  try {
    const token = localStorage.getItem("token");
    await axios.delete(
      `https://shop-backend-1-dfsl.onrender.com/api/inquiries/${postId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    alert("문의가 삭제되었습니다.");
    window.location.reload();
  } catch (err) {
    console.error("문의 삭제 실패:", err);
    alert("삭제 중 오류가 발생했습니다.");
  }
}
