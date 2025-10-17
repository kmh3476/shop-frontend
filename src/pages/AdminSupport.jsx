// 📁 src/pages/AdminSupport.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

export default function AdminSupport() {
  const [posts, setPosts] = useState([]);
  const [reply, setReply] = useState({});
  const [editMode, setEditMode] = useState({});
  const { token, user } = useAuth();

  const API = "https://shop-backend-1-dfsl.onrender.com/api/support";

  /* ✅ 공통 Axios 헤더 설정 */
  const axiosConfig = {
    headers: {
      Authorization: token ? `Bearer ${token}` : "",
      "Content-Type": "application/json",
    },
  };

  useEffect(() => {
    if (!token) return;
    fetchPosts();
  }, [token]);

  /* ✅ 관리자 여부 확인 */
  useEffect(() => {
    if (user && !user.isAdmin) {
      alert("관리자만 접근 가능한 페이지입니다.");
      window.location.href = "/";
    }
  }, [user]);

  /* ✅ 문의 목록 불러오기 */
  async function fetchPosts() {
    try {
      const res = await axios.get(`${API}`, axiosConfig);
      setPosts(res.data);
    } catch (err) {
      console.error("문의 목록 조회 실패:", err.response || err.message);
      if (err.response?.status === 401) {
        alert("인증이 만료되었거나 관리자 권한이 없습니다.");
      } else {
        alert("문의 목록을 불러올 수 없습니다.");
      }
    }
  }

  /* ✅ 관리자 답변 전송 */
  async function handleReply(id) {
    if (!reply[id]) return alert("답변 내용을 입력하세요.");
    try {
      await axios.post(`${API}/${id}/reply`, { reply: reply[id] }, axiosConfig);
      alert("답변이 성공적으로 전송되었습니다!");
      setReply({ ...reply, [id]: "" });
      fetchPosts();
    } catch (err) {
      console.error("답변 전송 실패:", err.response || err.message);
      if (err.response?.status === 401) {
        alert("관리자 권한이 없거나 세션이 만료되었습니다.");
      } else {
        alert("답변 전송 중 오류가 발생했습니다.");
      }
    }
  }

  /* ✅ 문의 삭제 */
  async function handleDelete(id) {
    if (!window.confirm("정말 이 문의를 삭제하시겠습니까?")) return;
    try {
      await axios.delete(`${API}/${id}`, axiosConfig);
      alert("문의가 삭제되었습니다.");
      fetchPosts();
    } catch (err) {
      console.error("삭제 실패:", err.response || err.message);
      alert("문의 삭제 중 오류가 발생했습니다.");
    }
  }

  /* ✅ 읽음 처리 토글 */
  async function toggleRead(id, current) {
    try {
      await axios.patch(`${API}/${id}`, { isRead: !current }, axiosConfig);
      fetchPosts();
    } catch (err) {
      console.error("읽음 상태 변경 실패:", err.response || err.message);
    }
  }

  /* ✅ 이메일 중간 모자이크 처리 */
  const maskEmail = (email) => {
    if (!email) return "";
    const [id, domain] = email.split("@");
    const visible = id.slice(0, 2);
    return `${visible}${"*".repeat(Math.max(0, id.length - 2))}@${domain}`;
  };

  return (
    <div className="min-h-screen bg-white text-black py-12 px-6 font-['Pretendard']">
      <h1 className="text-4xl font-bold text-center mb-12">📨 고객 문의 관리</h1>

      <div className="max-w-7xl mx-auto overflow-x-auto">
        <table className="w-full border-collapse border-t border-gray-300 text-sm">
          <thead className="bg-gray-100">
            <tr className="text-left">
              <th className="p-3 w-[5%] text-center">번호</th>
              <th className="p-3 w-[15%]">이메일</th>
              <th className="p-3 w-[15%]">제목</th>
              <th className="p-3 w-[25%]">내용</th>
              <th className="p-3 w-[10%] text-center">상태</th>
              <th className="p-3 w-[20%]">답변</th>
              <th className="p-3 w-[10%] text-center">관리</th>
            </tr>
          </thead>
          <tbody>
            {posts.length > 0 ? (
              posts.map((p, i) => (
                <tr
                  key={p._id}
                  className={`border-b border-gray-200 transition ${
                    p.reply
                      ? "bg-green-50"
                      : p.isRead
                      ? "bg-blue-50"
                      : "bg-yellow-50"
                  }`}
                >
                  {/* 번호 */}
                  <td className="p-3 text-center">{posts.length - i}</td>

                  {/* 이메일 (모자이크 처리) */}
                  <td className="p-3">{maskEmail(p.email)}</td>

                  {/* 제목 */}
                  <td className="p-3 font-semibold text-gray-800">
                    {p.subject}
                    {p.isPrivate && (
                      <span className="ml-2 text-xs text-gray-500">🔒</span>
                    )}
                  </td>

                  {/* 내용 */}
                  <td className="p-3 text-gray-700">
                    {p.isPrivate ? (
                      <span className="text-gray-400 italic">
                        (비공개 문의입니다)
                      </span>
                    ) : p.message ? (
                      <div className="whitespace-pre-wrap">{p.message}</div>
                    ) : (
                      <span className="text-gray-400 italic">(내용 없음)</span>
                    )}
                  </td>

                  {/* 상태 */}
                  <td className="p-3 text-center">
                    <button
                      onClick={() => toggleRead(p._id, p.isRead)}
                      className={`px-2 py-1 rounded text-xs font-semibold ${
                        p.reply
                          ? "bg-green-100 text-green-700"
                          : p.isRead
                          ? "bg-blue-100 text-blue-700"
                          : "bg-gray-200 text-gray-600"
                      }`}
                    >
                      {p.reply
                        ? "답변 완료"
                        : p.isRead
                        ? "읽음"
                        : "안 읽음"}
                    </button>
                  </td>

                  {/* 답변 */}
                  <td className="p-3">
                    {p.reply && !editMode[p._id] ? (
                      <div>
                        <p className="text-green-700 font-medium">{p.reply}</p>
                        <p className="text-xs text-gray-400 mt-1">
                          ({new Date(p.repliedAt).toLocaleString("ko-KR")})
                        </p>
                        <button
                          onClick={() =>
                            setEditMode({ ...editMode, [p._id]: true })
                          }
                          className="text-xs text-blue-600 mt-1 hover:underline"
                        >
                          수정
                        </button>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-2">
                        <textarea
                          value={reply[p._id] || p.reply || ""}
                          onChange={(e) =>
                            setReply({ ...reply, [p._id]: e.target.value })
                          }
                          placeholder="답변 입력"
                          rows="2"
                          className="border border-gray-300 rounded-md p-2 text-sm resize-none"
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleReply(p._id)}
                            className="flex-1 bg-black text-white text-sm py-1 rounded hover:bg-gray-800"
                          >
                            {p.reply ? "수정 완료" : "전송"}
                          </button>
                          {p.reply && (
                            <button
                              onClick={() =>
                                setEditMode({ ...editMode, [p._id]: false })
                              }
                              className="flex-1 bg-gray-300 text-sm py-1 rounded hover:bg-gray-400"
                            >
                              취소
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </td>

                  {/* 관리 버튼 */}
                  <td className="p-3 text-center">
                    <button
                      onClick={() => handleDelete(p._id)}
                      className="text-red-600 hover:text-red-800 text-sm font-medium"
                    >
                      삭제
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="7"
                  className="text-center text-gray-500 py-10 text-lg"
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
