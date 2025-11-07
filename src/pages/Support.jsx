// 📁 src/pages/Support.jsx
import React, { useEffect, useState, useRef } from "react";
import API from "../api/axiosInstance";
import { useAuth } from "../context/AuthContext";
import { useEditMode } from "../context/EditModeContext";
import EditableText from "../components/EditableText";
import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

/* --------------------------------------------------------
 ✅ 이메일 유효성 검사
-------------------------------------------------------- */
function isValidEmail(email) {
  if (!email) return true; // 선택입력 허용
  const regex = /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/;
  return regex.test(email);
}

/* --------------------------------------------------------
 ✅ 리사이즈 가능한 박스 훅
-------------------------------------------------------- */
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
        width: Math.max(500, start.current.width + dx),
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

/* --------------------------------------------------------
 ✅ Support 메인 컴포넌트
-------------------------------------------------------- */
export default function Support() {
  const { user } = useAuth();
  const { isEditMode, isResizeMode, setIsEditMode, setIsResizeMode } = useEditMode();
  const [posts, setPosts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [newPost, setNewPost] = useState({
    email: "",
    question: "",
    answer: "",
    isPrivate: false,
  });
  const [loading, setLoading] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();
  const API_URL = "/api/inquiries";

  /* ✅ 로그인 시 이메일 자동입력 */
  useEffect(() => {
    if (user?.email) {
      setNewPost((prev) => ({ ...prev, email: user.email }));
    }
  }, [user]);

  /* ✅ 리사이즈 훅 연결 */
  const { ref: formRef, size: formSize, startResize: startFormResize } = useResizableBox(
    "support-form",
    { width: 800, height: 520 },
    isResizeMode
  );
  const { ref: tableRef, size: tableSize, startResize: startTableResize } = useResizableBox(
    "support-table",
    { width: 1100, height: 580 },
    isResizeMode
  );
  const { ref: detailRef, size: detailSize, startResize: startDetailResize } = useResizableBox(
    "support-detail",
    { width: 800, height: 520 },
    isResizeMode
  );
  const { t } = useTranslation();

  /* --------------------------------------------------------
   ✅ 문의글 불러오기 (상품문의 포함, 공지만 제외)
  -------------------------------------------------------- */
  useEffect(() => {
    fetchPosts();
  }, []);

  async function fetchPosts() {
  try {
    const res = await API.get(`${API_URL}/all`);
    // ✅ 공지 포함 + 일반 문의 표시 (상품문의 제외)
    const filtered = res.data.filter(
      (p) =>
        !p.productId || p.productId === "" || p.productId === null
    );

    // ✅ 공지 먼저 정렬
    const sorted = filtered.sort((a, b) => {
      if (a.isNotice && !b.isNotice) return -1;
      if (!a.isNotice && b.isNotice) return 1;
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

    setPosts(sorted);
  } catch (err) {
    console.error("❌ 사용자 문의 불러오기 실패:", err);
  }
}

  /* ✅ 이메일 마스킹 */
  const displayEmail = (email) => {
    if (!email) return "익명";
    const [id] = email.split("@");
    return id.slice(0, 2) + "****";
  };

  /* --------------------------------------------------------
   ✅ 문의 작성 처리
  -------------------------------------------------------- */
  async function handleSubmit(e) {
    e.preventDefault();

    if (!user) {
      if (window.confirm("로그인이 필요합니다. 로그인 페이지로 이동할까요?")) {
        navigate("/login");
      }
      return;
    }

    if (!newPost.question.trim() || !newPost.answer.trim()) {
      return alert("제목과 내용을 모두 입력해주세요.");
    }

    if (newPost.email && !isValidEmail(newPost.email)) {
      return alert("올바른 이메일 형식을 입력해주세요.");
    }

    try {
      setLoading(true);
      await API.post(API_URL, {
        email: newPost.email || user.email,
        question: newPost.question,
        answer: newPost.answer,
        isPrivate: newPost.isPrivate,
        productId: null, // ✅ 명시적으로 일반 문의로 설정
      });
      alert("✅ 문의가 등록되었습니다!");
      setNewPost({
        email: user.email || "",
        question: "",
        answer: "",
        isPrivate: false,
      });
      setShowForm(false);
      fetchPosts();
    } catch (err) {
      console.error("❌ 문의 등록 실패:", err);
      alert("문의 등록 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  }

  /* --------------------------------------------------------
   ✅ 공지 등록 (사용자문의 전용)
  -------------------------------------------------------- */
  async function handleNoticeSubmit() {
    if (!user?.isAdmin) return;
    const title = prompt("공지 제목을 입력하세요:");
    const content = prompt("공지 내용을 입력하세요:");
    if (!title || !content) return;

    try {
      await API.post(`${API_URL}/notice`, {
        question: title,
        answer: content,
        productId: null, // ✅ 상품 문의와 구분
      });
      alert("✅ 사용자 문의 공지가 등록되었습니다.");
      fetchPosts();
    } catch (err) {
      console.error("❌ 공지 등록 실패:", err);
      alert("공지 등록 중 오류가 발생했습니다.");
    }
  }

  /* --------------------------------------------------------
   ✅ 상세보기 닫기 & 삭제
  -------------------------------------------------------- */
  const closeDetail = () => setSelectedPost(null);

  async function handleDelete(id) {
    if (!window.confirm("정말 삭제하시겠습니까?")) return;
    try {
      await API.delete(`${API_URL}/${id}`);
      alert("삭제되었습니다.");
      setSelectedPost(null);
      fetchPosts();
    } catch (err) {
      console.error("삭제 실패:", err);
      alert("삭제 중 오류가 발생했습니다.");
    }
  }

  /* --------------------------------------------------------
   ✅ 렌더링 시작
  -------------------------------------------------------- */
  return (
    <div className="min-h-screen bg-white text-black py-16 px-4 font-['Pretendard'] relative">
      {/* ✅ 관리자 툴바 */}
      {user?.isAdmin && (
        <div className="fixed top-6 left-6 z-50 flex gap-3">
          <button
            onClick={() => setIsEditMode((p) => !p)}
            className={`px-4 py-2 rounded text-white font-semibold ${
              isEditMode ? "bg-green-600" : "bg-gray-700"
            }`}
          >
            {isEditMode ? "🖊 디자인모드 ON" : "✏ 디자인모드 OFF"}
          </button>
          <button
            onClick={() => setIsResizeMode((p) => !p)}
            className={`px-4 py-2 rounded text-white font-semibold ${
              isResizeMode ? "bg-blue-600" : "bg-gray-700"
            }`}
          >
            {isResizeMode ? "📐 크기조절 ON" : "📏 크기조절 OFF"}
          </button>
          <button
            onClick={handleNoticeSubmit}
            className="px-4 py-2 rounded bg-yellow-500 text-white font-semibold hover:bg-yellow-600"
          >
            📢 공지 등록
          </button>
        </div>
      )}

      {/* ✅ 상단 탭 */}
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

      {/* ✅ 문의 작성 버튼 */}
      {!showForm && !selectedPost && (
        <div className="flex justify-center mb-10">
          <button
            onClick={() => {
              if (!user) {
                if (window.confirm("로그인이 필요합니다. 로그인 페이지로 이동할까요?")) {
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
        <div
          ref={formRef}
          onContextMenu={startFormResize}
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
              placeholder="답변 받을 이메일 (선택)"
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
      {/* ✅ 문의 목록 */}
      {!selectedPost && (
        <div
          ref={tableRef}
          onContextMenu={startTableResize}
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
                  onClick={() => setSelectedPost(p)}
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

              {posts.length === 0 && (
                <tr>
                  <td
                    colSpan="5"
                    className="text-center text-gray-500 py-6 bg-gray-50"
                  >
                    등록된 문의가 없습니다.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* ✅ 문의 상세 보기 */}
      {selectedPost && (
        <div
          ref={detailRef}
          onContextMenu={startDetailResize}
          style={{
            width: `${detailSize.width}px`,
            minHeight: `${detailSize.height}px`,
            cursor: isResizeMode ? "se-resize" : "default",
          }}
          className="max-w-3xl mx-auto bg-gray-50 rounded-2xl p-8 shadow relative"
        >
          <button
            onClick={closeDetail}
            className="absolute top-4 right-4 bg-gray-300 text-black px-3 py-1 rounded hover:bg-gray-400"
          >
            닫기
          </button>

          <h2 className="text-2xl font-bold mb-4">{selectedPost.question}</h2>
          <p className="text-gray-600 text-sm mb-6">
            작성자:{" "}
            {selectedPost.isNotice
              ? "관리자"
              : displayEmail(selectedPost.email)}{" "}
            | {new Date(selectedPost.createdAt).toLocaleDateString()}
            {selectedPost.productId &&
              !selectedPost.isNotice && (
                <span className="ml-2 text-gray-500 text-xs">
                  (상품 관련 문의)
                </span>
              )}
          </p>

          <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
            <p className="text-gray-800 whitespace-pre-wrap">
              {selectedPost.answer}
            </p>
          </div>

          {selectedPost.reply ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="font-semibold text-green-700 mb-2">관리자 답변</h3>
              <p className="text-gray-800 whitespace-pre-wrap">
                {selectedPost.reply}
              </p>
            </div>
          ) : (
            <div className="text-gray-500 italic">
              아직 답변이 등록되지 않았습니다.
            </div>
          )}

          {/* ✅ 삭제 버튼 (작성자 or 관리자만) */}
          {(user?.isAdmin ||
            (user?.email &&
              selectedPost.email &&
              user.email === selectedPost.email)) && (
            <button
              onClick={() => handleDelete(selectedPost._id)}
              className="mt-6 bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded"
            >
              삭제
            </button>
          )}
        </div>
      )}
    </div>
  );
}
