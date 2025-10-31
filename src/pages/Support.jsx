// 📁 src/pages/Support.jsx
import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { useLocation, useNavigate } from "react-router-dom";
import { useEditMode } from "../context/EditModeContext";
import EditableText from "../components/EditableText";

// ✅ 리사이즈 훅
function useResizableBox(id, defaultSize = { width: 900, height: 600 }, active) {
  const [size, setSize] = useState(() => {
    const saved = localStorage.getItem(`resizable-${id}`);
    return saved ? JSON.parse(saved) : defaultSize;
  });
  const ref = useRef(null);
  const resizing = useRef(false);
  const start = useRef({ x: 0, y: 0, width: 0, height: 0 });

  useEffect(() => {
    const move = (e) => {
      if (!active || !resizing.current) return;
      const dx = e.clientX - start.current.x;
      const dy = e.clientY - start.current.y;
      setSize({
        width: Math.max(400, start.current.width + dx),
        height: Math.max(300, start.current.height + dy),
      });
    };
    const up = () => {
      if (resizing.current) {
        resizing.current = false;
        document.body.style.cursor = "auto";
        localStorage.setItem(`resizable-${id}`, JSON.stringify(size));
      }
    };
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", up);
    return () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseup", up);
    };
  }, [active, id, size]);

  const startResize = (e) => {
    if (!active || e.button !== 2) return;
    e.preventDefault();
    resizing.current = true;
    start.current = {
      x: e.clientX,
      y: e.clientY,
      width: ref.current.offsetWidth,
      height: ref.current.offsetHeight,
    };
    document.body.style.cursor = "se-resize";
  };

  return { ref, size, startResize };
}

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
  const { isEditMode, setIsEditMode, isResizeMode, setIsResizeMode } = useEditMode();
  const location = useLocation();
  const navigate = useNavigate();

  const API = "https://shop-backend-1-dfsl.onrender.com/api/inquiries";
  const NOTICE_API = `${API}/notice`;

  // ✅ 리사이즈 가능한 주요 영역
  const { ref: formRef, size: formSize, startResize: startFormResize } = useResizableBox(
    "support-form",
    { width: 800, height: 540 },
    isResizeMode
  );
  const { ref: tableRef, size: tableSize, startResize: startTableResize } = useResizableBox(
    "support-table",
    { width: 1100, height: 600 },
    isResizeMode
  );
  const { ref: detailRef, size: detailSize, startResize: startDetailResize } = useResizableBox(
    "support-detail",
    { width: 800, height: 540 },
    isResizeMode
  );

  useEffect(() => {
    console.log("✅ Support 페이지 렌더링됨");
    fetchPosts();
  }, []);

  // ✅ 문의 목록 불러오기
  async function fetchPosts() {
    try {
      const res = await axios.get(API);
      const filtered = res.data.filter((p) => !p.productId);
      const sorted = filtered.sort((a, b) => {
        if (a.isNotice && !b.isNotice) return -1;
        if (!a.isNotice && b.isNotice) return 1;
        return new Date(b.createdAt) - new Date(a.createdAt);
      });
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
    const isOwner = user?.email && post.email?.includes(user.email.slice(0, 3));
    if (post.isPrivate && !isOwner) {
      alert("비공개 문의는 작성자만 볼 수 있습니다.");
      return;
    }
    setSelectedPost(post);
  }

  function closeDetail() {
    setSelectedPost(null);
  }

  const toggleEdit = () => {
    if (!user?.isAdmin) return alert("관리자만 접근 가능합니다.");
    setIsEditMode(!isEditMode);
  };
  const toggleResize = () => {
    if (!user?.isAdmin) return alert("관리자만 접근 가능합니다.");
    setIsResizeMode(!isResizeMode);
  };

  return (
    <div className="min-h-screen bg-white text-black py-16 px-4 font-['Pretendard'] relative">
      {/* 관리자 툴바 */}
      {user?.isAdmin && (
        <div className="fixed top-6 left-6 z-50 flex gap-3">
          <button
            onClick={toggleEdit}
            className={`px-4 py-2 rounded text-white font-semibold ${
              isEditMode ? "bg-green-600" : "bg-gray-700"
            }`}
          >
            {isEditMode ? "🖊 디자인모드 ON" : "✏ 디자인모드 OFF"}
          </button>
          <button
            onClick={toggleResize}
            className={`px-4 py-2 rounded text-white font-semibold ${
              isResizeMode ? "bg-blue-600" : "bg-gray-700"
            }`}
          >
            {isResizeMode ? "📐 크기조절 ON" : "📏 크기조절 OFF"}
          </button>
        </div>
      )}

      {/* 상단 탭 */}
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

      <h1 className="text-4xl font-extrabold text-center mb-14">
        <EditableText id="support-title" defaultText="고객센터" />
      </h1>

      {/* 작성 폼 */}
      {showForm && !selectedPost && (
        <div
          ref={formRef}
          onMouseDown={startFormResize}
          style={{
            width: `${formSize.width}px`,
            minHeight: `${formSize.height}px`,
            cursor: isResizeMode ? "se-resize" : "default",
          }}
          className="max-w-3xl mx-auto mb-16 bg-gray-50 rounded-2xl p-8 shadow"
        >
          <h2 className="text-2xl font-bold mb-6">문의 작성</h2>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <input
              type="email"
              placeholder="답변 받을 이메일"
              value={newPost.email}
              onChange={(e) => setNewPost({ ...newPost, email: e.target.value })}
              className="border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-black"
            />
            <input
              type="text"
              placeholder="제목을 입력하세요"
              value={newPost.question}
              onChange={(e) => setNewPost({ ...newPost, question: e.target.value })}
              className="border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-black"
            />
            <textarea
              placeholder="문의 내용을 입력하세요"
              rows="4"
              value={newPost.answer}
              onChange={(e) => setNewPost({ ...newPost, answer: e.target.value })}
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

      {/* 문의 목록 */}
      {!selectedPost && (
        <div
          ref={tableRef}
          onMouseDown={startTableResize}
          style={{
            width: `${tableSize.width}px`,
            minHeight: `${tableSize.height}px`,
            cursor: isResizeMode ? "se-resize" : "default",
          }}
          className="max-w-6xl mx-auto bg-white p-4 rounded shadow"
        >
          <h2 className="text-3xl font-bold mb-6">문의 목록</h2>
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
                    ) : p.isNotice ? (
                      <span className="text-blue-600 font-medium">공지</span>
                    ) : (
                      <span className="text-gray-500">처리 중</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
