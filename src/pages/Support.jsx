// 📁 src/pages/Support.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";

export default function Support() {
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState({ email: "", title: "", message: "" });
  const [reply, setReply] = useState({});
  const [loading, setLoading] = useState(false);

  // ✅ 백엔드 API 주소 (Render에서 배포된 백엔드)
  const API = "https://shop-backend-1-dfsl.onrender.com/api/support";

  // ✅ 문의 목록 불러오기
  useEffect(() => {
    fetchPosts();
  }, []);

  async function fetchPosts() {
    try {
      const res = await axios.get(API);
      setPosts(res.data);
    } catch (err) {
      console.error("게시글 불러오기 실패:", err);
    }
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
      });
      alert("문의가 등록되었습니다! 답변은 이메일로 발송됩니다.");
      setNewPost({ email: "", title: "", message: "" });
      fetchPosts();
    } catch (err) {
      console.error("문의 작성 실패:", err);
      alert("문의 등록 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  }

  // ✅ 관리자 답변 전송
  async function handleReply(id) {
    if (!reply[id]) return alert("답변 내용을 입력해주세요.");
    try {
      await axios.post(`${API}/${id}/reply`, { reply: reply[id] });
      alert("답변이 이메일로 전송되었습니다.");
      setReply({ ...reply, [id]: "" });
      fetchPosts();
    } catch (err) {
      console.error("답변 실패:", err);
      alert("답변 전송 중 오류 발생");
    }
  }

  return (
    <div className="min-h-screen bg-white text-black py-16 px-4 font-['Pretendard']">
      <h1 className="text-5xl font-extrabold text-center mb-14">고객센터</h1>

      {/* ✅ 문의 작성 폼 */}
      <div className="max-w-3xl mx-auto mb-16 bg-gray-50 rounded-2xl p-8 shadow">
        <h2 className="text-2xl font-bold mb-6">문의 작성</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="email"
            placeholder="답변 받을 이메일을 입력하세요"
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
          <button
            type="submit"
            disabled={loading}
            className={`bg-black text-white py-3 rounded-lg hover:bg-gray-800 transition font-semibold ${
              loading ? "opacity-70 cursor-not-allowed" : ""
            }`}
          >
            {loading ? "등록 중..." : "문의 등록"}
          </button>
        </form>
      </div>

      {/* ✅ 문의 목록 */}
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold mb-6">문의 목록</h2>
        <table className="w-full border-collapse border-t border-gray-300">
          <thead className="bg-gray-100">
            <tr className="text-left">
              <th className="p-3 w-[8%]">번호</th>
              <th className="p-3 w-[15%]">이메일</th>
              <th className="p-3 w-[20%]">제목</th>
              <th className="p-3 w-[27%]">내용</th>
              <th className="p-3 w-[10%]">상태</th>
              <th className="p-3 w-[20%]">답변</th>
            </tr>
          </thead>
          <tbody>
            {posts.length > 0 ? (
              posts.map((p, i) => (
                <tr
                  key={p._id}
                  className={`border-b border-gray-200 transition ${
                    p.isRead ? "bg-white" : "bg-yellow-50"
                  }`}
                >
                  <td className="p-3 text-center">{posts.length - i}</td>
                  <td className="p-3 text-sm">{p.email}</td>
                  <td className="p-3 font-semibold text-gray-800">{p.subject}</td>
                  <td className="p-3 text-gray-700 text-sm">{p.message}</td>

                  {/* ✅ 상태 표시 */}
                  <td className="p-3 text-center">
                    {p.reply ? (
                      <span className="text-green-600 font-medium">답변 완료</span>
                    ) : p.isRead ? (
                      <span className="text-blue-600 font-medium">읽음</span>
                    ) : (
                      <span className="text-gray-500">안 읽음</span>
                    )}
                  </td>

                  {/* ✅ 관리자 답변 */}
                  <td className="p-3">
                    {p.reply ? (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-2 text-sm">
                        <strong>답변:</strong> {p.reply}
                        <div className="text-xs text-gray-400 mt-1">
                          ({new Date(p.repliedAt).toLocaleString("ko-KR")})
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-2">
                        <textarea
                          placeholder="답변 내용을 입력하세요"
                          value={reply[p._id] || ""}
                          onChange={(e) =>
                            setReply({ ...reply, [p._id]: e.target.value })
                          }
                          className="border border-gray-300 rounded-md p-2 text-sm resize-none"
                          rows="2"
                        />
                        <button
                          onClick={() => handleReply(p._id)}
                          className="bg-black text-white text-sm py-1 rounded hover:bg-gray-800"
                        >
                          답변 전송
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="6"
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
