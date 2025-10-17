// 📁 src/pages/Support.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";

export default function Support() {
  const [posts, setPosts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [newPost, setNewPost] = useState({
    email: "",
    title: "",
    message: "",
    isPrivate: false,
  });
  const [loading, setLoading] = useState(false);

  const API = "https://shop-backend-1-dfsl.onrender.com/api/support";

  useEffect(() => {
    fetchPosts();
  }, []);

  // ✅ 문의 목록 불러오기
  async function fetchPosts() {
    try {
      const res = await axios.get(API);
      setPosts(res.data);
    } catch (err) {
      console.error("문의 목록 불러오기 실패:", err);
    }
  }

  // ✅ 이메일 모자이크 처리
  function maskEmail(email) {
    if (!email.includes("@")) return email;
    const [id, domain] = email.split("@");
    if (id.length <= 3) return "***@" + domain;
    return id.slice(0, 3) + "***@" + domain;
  }

  // ✅ 문의 작성
  async function handleSubmit(e) {
    e.preventDefault();
    if (!newPost.email || !newPost.title || !newPost.message)
      return alert("모든 항목을 입력해주세요.");

    try {
      setLoading(true);
      await axios.post(API, {
        email: newPost.email,
        subject: newPost.title,
        message: newPost.message,
        isPrivate: newPost.isPrivate,
      });
      alert("문의가 등록되었습니다! 답변은 이메일로 발송됩니다.");
      setNewPost({ email: "", title: "", message: "", isPrivate: false });
      setShowForm(false);
      fetchPosts();
    } catch (err) {
      console.error("문의 작성 실패:", err);
      alert("문의 등록 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-white text-black py-16 px-4 font-['Pretendard']">
      <h1 className="text-5xl font-extrabold text-center mb-14">고객센터</h1>

      {/* ✅ 글쓰기 버튼 */}
      {!showForm && (
        <div className="text-center mb-10">
          <button
            onClick={() => setShowForm(true)}
            className="bg-black text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-gray-800 transition"
          >
            ✍️ 글쓰기
          </button>
        </div>
      )}

      {/* ✅ 문의 작성 폼 */}
      {showForm && (
        <div className="max-w-3xl mx-auto mb-16 bg-gray-50 rounded-2xl p-8 shadow">
          <h2 className="text-2xl font-bold mb-6">문의 작성</h2>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <input
              type="email"
              placeholder="답변 받을 이메일"
              value={newPost.email}
              onChange={(e) => setNewPost({ ...newPost, email: e.target.value })}
              className="border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-black"
            />
            <input
              type="text"
              placeholder="제목을 입력하세요"
              value={newPost.title}
              onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
              className="border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-black"
            />
            <textarea
              placeholder="문의 내용을 입력하세요"
              rows="4"
              value={newPost.message}
              onChange={(e) =>
                setNewPost({ ...newPost, message: e.target.value })
              }
              className="border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-black resize-none"
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

      {/* ✅ 문의 목록 */}
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold mb-6">문의 목록</h2>
        <table className="w-full border-collapse border-t border-gray-300">
          <thead className="bg-gray-100">
            <tr className="text-left">
              <th className="p-3 w-[8%]">번호</th>
              <th className="p-3 w-[20%]">이메일</th>
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
                  className="border-b border-gray-200 hover:bg-gray-50 transition"
                >
                  <td className="p-3 text-center">{posts.length - i}</td>
                  <td className="p-3 text-sm">{maskEmail(p.email)}</td>
                  <td className="p-3 font-semibold text-gray-800">
                    {p.subject}
                  </td>
                  <td className="p-3 text-gray-700 text-sm">
                    {p.isPrivate ? (
                      <span className="italic text-gray-400">
                        🔒 비공개 문의입니다.
                      </span>
                    ) : (
                      p.message
                    )}
                  </td>
                  <td className="p-3 text-center">
                    {p.reply ? (
                      <span className="text-green-600 font-medium">
                        답변 완료
                      </span>
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
    </div>
  );
}
