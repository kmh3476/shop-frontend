// 📁 src/pages/AdminSupport.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

export default function AdminSupport() {
  const [posts, setPosts] = useState([]);
  const [reply, setReply] = useState({});
  const { token } = useAuth();

  const API = "https://shop-backend-1-dfsl.onrender.com/api/support";

  useEffect(() => {
    fetchPosts();
  }, []);

  async function fetchPosts() {
    try {
      const res = await axios.get(`${API}/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPosts(res.data);
    } catch (err) {
      console.error("문의 목록 조회 실패:", err);
    }
  }

  async function handleReply(id) {
    if (!reply[id]) return alert("답변 내용을 입력하세요.");
    try {
      await axios.post(
        `${API}/${id}/reply`,
        { reply: reply[id] },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("답변 전송 완료!");
      setReply({ ...reply, [id]: "" });
      fetchPosts();
    } catch (err) {
      alert("답변 전송 실패");
    }
  }

  return (
    <div className="min-h-screen bg-white text-black py-12 px-6">
      <h1 className="text-4xl font-bold text-center mb-10">고객 문의 관리</h1>

      <div className="max-w-6xl mx-auto">
        <table className="w-full border-collapse border-t border-gray-300">
          <thead className="bg-gray-100">
            <tr className="text-left">
              <th className="p-3 w-[5%]">번호</th>
              <th className="p-3 w-[20%]">이메일</th>
              <th className="p-3 w-[20%]">제목</th>
              <th className="p-3 w-[30%]">내용</th>
              <th className="p-3 w-[25%]">답변</th>
            </tr>
          </thead>
          <tbody>
            {posts.map((p, i) => (
              <tr
                key={p._id}
                className={`border-b border-gray-200 ${
                  p.reply ? "bg-green-50" : ""
                }`}
              >
                <td className="p-3 text-center">{posts.length - i}</td>
                <td className="p-3">{p.email}</td>
                <td className="p-3">{p.subject}</td>
                <td className="p-3">{p.message}</td>
                <td className="p-3">
                  {p.reply ? (
                    <div>
                      <p className="text-green-700 font-medium">
                        {p.reply}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(p.repliedAt).toLocaleString("ko-KR")}
                      </p>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2">
                      <textarea
                        value={reply[p._id] || ""}
                        onChange={(e) =>
                          setReply({ ...reply, [p._id]: e.target.value })
                        }
                        placeholder="답변 입력"
                        rows="2"
                        className="border border-gray-300 rounded-md p-2 text-sm"
                      />
                      <button
                        onClick={() => handleReply(p._id)}
                        className="bg-black text-white text-sm py-1 rounded hover:bg-gray-800"
                      >
                        전송
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
