// 📁 src/pages/Support.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

export default function Support() {
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
  const API = "https://shop-backend-1-dfsl.onrender.com/api/inquiries";
  const NOTICE_API = `${API}/notice`;

  useEffect(() => {
    fetchPosts();
  }, []);

  // ✅ 문의 목록 불러오기
  async function fetchPosts() {
    try {
      const res = await axios.get(API);
      const sorted = res.data.sort(
        (a, b) => (b.isNotice === true) - (a.isNotice === true)
      );
      setPosts(sorted);
    } catch (err) {
      console.error("문의 목록 불러오기 실패:", err);
    }
  }

  // ✅ 이메일 표시
  function displayEmail(email) {
    if (!email || typeof email !== "string") return "익명";
    if (!email.includes("@")) return email;
    const [id] = email.split("@");
    return id.slice(0, 2) + "****";
  }

  // ✅ 문의 작성
  async function handleSubmit(e) {
    e.preventDefault();
    if (!newPost.email || !newPost.question || !newPost.answer)
      return alert("모든 항목을 입력해주세요.");

    try {
      setLoading(true);
      await axios.post(API, {
        email: newPost.email,
        question: newPost.question,
        answer: newPost.answer,
        isPrivate: newPost.isPrivate,
      });
      alert("문의가 등록되었습니다! 답변은 이메일로 발송됩니다.");
      setNewPost({ email: "", question: "", answer: "", isPrivate: false });
      setShowForm(false);
      setTimeout(fetchPosts, 500);
    } catch (err) {
      console.error("문의 작성 실패:", err);
      alert("문의 등록 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  }

  // ✅ 공지글 작성 (관리자)
  async function handleNoticeSubmit() {
    const title = prompt("공지 제목을 입력하세요:");
    const content = prompt("공지 내용을 입력하세요:");
    if (!title || !content) return alert("제목과 내용을 모두 입력해주세요.");

    try {
      await axios.post(NOTICE_API, {
        question: title,
        answer: content,
        isNotice: true,
      });
      alert("공지글이 등록되었습니다!");
      fetchPosts();
    } catch (err) {
      console.error("공지글 등록 실패:", err);
      alert("공지글 등록 중 오류가 발생했습니다.");
    }
  }

  // ✅ 상세 보기
  function handleViewDetail(post) {
    const isOwner =
      user?.email && post.email?.includes(user.email.slice(0, 3));
    if (post.isPrivate && !isOwner) {
      alert("비공개 문의는 작성자만 볼 수 있습니다.");
      return;
    }
    setSelectedPost(post);
  }

  function closeDetail() {
    setSelectedPost(null);
  }

  return (
    <div className="min-h-screen bg-white text-black py-16 px-4 font-['Pretendard']">
      <h1 className="text-5xl font-extrabold text-center mb-14">고객센터</h1>

      {/* ✅ 버튼들 */}
      {!showForm && !selectedPost && (
        <div className="text-center mb-10 flex flex-col items-center gap-4">
          <button
            onClick={() => setShowForm(true)}
            className="bg-black text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-gray-800 transition"
          >
            ✍️ 글쓰기
          </button>

          {user?.isAdmin && (
            <button
              onClick={handleNoticeSubmit}
              className="bg-blue-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-blue-700 transition"
            >
              📢 공지글 작성
            </button>
          )}
        </div>
      )}

      {/* ✅ 문의 작성 폼 */}
      {showForm && !selectedPost && (
        <div className="max-w-3xl mx-auto mb-16 bg-gray-50 rounded-2xl p-8 shadow">
          <h2 className="text-2xl font-bold mb-6">문의 작성</h2>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <input
              type="email"
              placeholder="답변 받을 이메일"
              value={newPost.email}
              onChange={(e) =>
                setNewPost({ ...newPost, email: e.target.value })
              }
              className="border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-black"
            />
            <input
              type="text"
              placeholder="제목을 입력하세요"
              value={newPost.question}
              onChange={(e) =>
                setNewPost({ ...newPost, question: e.target.value })
              }
              className="border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-black"
            />
            <textarea
              placeholder="문의 내용을 입력하세요"
              rows="4"
              value={newPost.answer}
              onChange={(e) =>
                setNewPost({ ...newPost, answer: e.target.value })
              }
              className="border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-black resize-none"
            />
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

            <div className="flex gap-4">
              <button
                type="submit"
                disabled={loading}
                className={`flex-1 bg-black text-white py-3 rounded-lg hover:bg-gray-800 transition font-semibold ${
                  loading ? "opacity-70 cursor-not-allowed" : ""
                }`}
              >
                {loading ? "등록 중..." : "문의 등록"}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="flex-1 bg-gray-300 text-black py-3 rounded-lg hover:bg-gray-400 transition font-semibold"
              >
                취소
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ✅ 상세 보기 */}
      {selectedPost && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg p-8 max-w-2xl w-[90%] relative">
            <button
              onClick={closeDetail}
              className="absolute top-3 right-4 text-gray-500 hover:text-black text-2xl"
            >
              ✕
            </button>
            <h2 className="text-2xl font-bold mb-4">{selectedPost.question}</h2>
            <p className="text-sm text-gray-500 mb-4">
              {displayEmail(selectedPost.email)} •{" "}
              {new Date(selectedPost.createdAt).toLocaleString("ko-KR")}
            </p>

            {/* ✅ 문의 본문 */}
            <div className="border-t border-gray-200 pt-4 text-gray-800 whitespace-pre-wrap">
              {selectedPost.answer}
            </div>

            {/* ✅ 관리자 답변 표시 추가 */}
            {selectedPost.reply && (
              <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <h3 className="font-semibold text-green-700 mb-2">
                  💬 관리자 답변
                </h3>
                <p className="text-gray-800 whitespace-pre-wrap">
                  {selectedPost.reply}
                </p>
                {selectedPost.updatedAt && (
                  <p className="text-xs text-gray-500 mt-2">
                    {new Date(selectedPost.updatedAt).toLocaleString("ko-KR")}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ✅ 문의 목록 */}
      {!selectedPost && (
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold mb-6">문의 목록</h2>
          <table className="w-full border-collapse border-t border-gray-300">
            <thead className="bg-gray-100">
              <tr className="text-left">
                <th className="p-3 w-[8%]">번호</th>
                <th className="p-3 w-[20%]">작성자</th>
                <th className="p-3 w-[25%]">제목</th>
                <th className="p-3 w-[35%]">내용</th>
                <th className="p-3 w-[12%]">상태</th>
              </tr>
            </thead>
            <tbody>
              {posts.length > 0 ? (
                posts.map((p, i) => (
                  <tr
                    key={p._id}
                    className={`border-b border-gray-200 hover:bg-gray-50 transition cursor-pointer ${
                      p.isNotice ? "bg-gray-200" : ""
                    }`}
                    onClick={() => handleViewDetail(p)}
                  >
                    <td className="p-3 text-center">{posts.length - i}</td>
                    <td className="p-3 text-sm">
                      {p.isNotice ? "관리자" : displayEmail(p.email)}
                    </td>
                    <td className="p-3 font-semibold text-gray-800">
                      {p.isNotice && (
                        <span className="text-blue-600 font-bold">[공지]</span>
                      )}{" "}
                      {p.question}
                    </td>
                    <td className="p-3 text-gray-700 text-sm">
                      {p.answer?.length > 40
                        ? p.answer.slice(0, 40) + "..."
                        : p.answer}
                    </td>
                    <td className="p-3 text-center">
                      {p.reply ? (
                        <span className="text-green-600 font-medium">
                          답변 완료
                        </span>
                      ) : p.isNotice ? (
                        <span className="text-blue-600 font-medium">공지</span>
                      ) : (
                        <span className="text-gray-500">처리 중</span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="5"
                    className="text-center text-gray-500 py-8 text-lg"
                  >
                    등록된 문의가 없습니다.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
