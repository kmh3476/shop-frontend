// 📁 src/pages/ProductSupport.jsx
import React, { useEffect, useState, useRef } from "react";
import API from "../api/axiosInstance";
import { useAuth } from "../context/AuthContext";
import { useLocation, useNavigate } from "react-router-dom";
import { useEditMode } from "../context/EditModeContext";
import EditableText from "../components/EditableText";

/* ✅ 이메일 유효성 검사 (선택 입력용) */
function isValidEmail(email) {
  if (!email) return true;
  const regex = /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/;
  return regex.test(email);
}

/* ✅ 리사이즈 박스 훅 */
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

/* ✅ 메인 컴포넌트 시작 */
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
  const { isEditMode, setIsEditMode, isResizeMode, setIsResizeMode } = useEditMode();
  const location = useLocation();
  const navigate = useNavigate();

  const API_URL = "/api/inquiries";

  /* ✅ 로그인 시 이메일 자동 입력 */
  useEffect(() => {
    if (user?.email) {
      setNewPost((prev) => ({ ...prev, email: user.email }));
    }
  }, [user]);

  /* ✅ 리사이즈 가능한 섹션 */
  const { ref: formRef, size: formSize, startResize: startFormResize } = useResizableBox(
    "product-form",
    { width: 800, height: 540 },
    isResizeMode
  );
  const { ref: tableRef, size: tableSize, startResize: startTableResize } = useResizableBox(
    "product-table",
    { width: 1100, height: 600 },
    isResizeMode
  );
  const { ref: detailRef, size: detailSize, startResize: startDetailResize } = useResizableBox(
    "product-detail",
    { width: 800, height: 540 },
    isResizeMode
  );

  /* ✅ 상품 문의 불러오기 */
  useEffect(() => {
    fetchPosts();
  }, []);

  async function fetchPosts() {
    try {
      const res = await API.get(`${API_URL}/all`);
      const productPosts = res.data
        .filter((p) => p.productId)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setPosts(productPosts);
    } catch (err) {
      console.error("상품 문의 목록 불러오기 실패:", err);
    }
  }

  function displayEmail(email) {
    if (!email || typeof email !== "string") return "익명";
    if (!email.includes("@")) return email;
    const [id] = email.split("@");
    return id.slice(0, 2) + "****";
  }

  /* ✅ 문의 등록 */
  async function handleSubmit(e) {
    e.preventDefault();

    if (!user) {
      alert("로그인 후 상품 문의를 작성할 수 있습니다.");
      return navigate("/login");
    }

    if (!newPost.question || !newPost.answer)
      return alert("제목과 내용을 모두 입력해주세요.");

    if (newPost.email && !isValidEmail(newPost.email))
      return alert("올바른 이메일 형식을 입력해주세요.");

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
      setTimeout(fetchPosts, 500);
    } catch (err) {
      console.error("상품 문의 등록 실패:", err);
      alert(err.response?.data?.message || "문의 등록 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  }
  /* --------------------------------------------------------
   ✅ 문의 작성 폼 (Support.jsx 스타일 동일)
  -------------------------------------------------------- */
  function renderForm() {
    if (!showForm) return null;

    return (
      <div
        ref={formRef}
        onContextMenu={startFormResize}
        style={{
          width: formSize.width,
          height: formSize.height,
        }}
        className="fixed top-28 left-1/2 -translate-x-1/2 bg-white rounded-xl shadow-lg border p-8 z-50"
      >
        <h2 className="text-2xl font-bold mb-6 text-gray-900 text-center">
          상품 문의 작성
        </h2>
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* 이메일 (자동 입력) */}
          <div>
            <label className="block text-sm font-semibold mb-1 text-gray-700">
              이메일 (자동 입력)
            </label>
            <input
              type="email"
              value={newPost.email}
              readOnly
              className="w-full border rounded-lg px-4 py-3 bg-gray-100 text-gray-600 cursor-not-allowed"
            />
          </div>

          {/* 문의 제목 */}
          <div>
            <label className="block text-sm font-semibold mb-1 text-gray-700">
              문의 제목
            </label>
            <input
              type="text"
              value={newPost.question}
              onChange={(e) => setNewPost({ ...newPost, question: e.target.value })}
              placeholder="문의 제목을 입력하세요"
              className="w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-300"
            />
          </div>

          {/* 문의 내용 */}
          <div>
            <label className="block text-sm font-semibold mb-1 text-gray-700">
              문의 내용
            </label>
            <textarea
              value={newPost.answer}
              onChange={(e) => setNewPost({ ...newPost, answer: e.target.value })}
              placeholder="문의 내용을 입력하세요"
              rows={5}
              className="w-full border rounded-lg px-4 py-3 resize-none focus:ring-2 focus:ring-indigo-300"
            />
          </div>

          {/* 공개 여부 */}
          <div className="flex items-center gap-2 mt-2">
            <input
              id="private"
              type="checkbox"
              checked={newPost.isPrivate}
              onChange={(e) => setNewPost({ ...newPost, isPrivate: e.target.checked })}
              className="h-4 w-4 text-indigo-600"
            />
            <label htmlFor="private" className="text-sm text-gray-700">
              비공개 문의로 등록
            </label>
          </div>

          {/* 버튼 */}
          <div className="flex justify-end gap-4 mt-8">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-5 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`px-5 py-2 rounded-lg font-semibold text-white ${
                loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-indigo-900 hover:bg-indigo-800"
              }`}
            >
              {loading ? "등록 중..." : "등록"}
            </button>
          </div>
        </form>
      </div>
    );
  }

  /* --------------------------------------------------------
   ✅ 문의 리스트 (Support.jsx 디자인으로 통일)
  -------------------------------------------------------- */
  function renderTable() {
    return (
      <div
        ref={tableRef}
        onContextMenu={startTableResize}
        style={{
          width: tableSize.width,
          height: tableSize.height,
        }}
        className="bg-white rounded-xl shadow-lg border overflow-hidden mt-10"
      >
        {/* 헤더 영역 */}
        <div className="flex items-center justify-between px-6 py-4 border-b bg-gray-50">
          <h2 className="text-xl font-bold text-gray-800">
            상품 문의 목록
          </h2>

          <div className="flex gap-3">
            {user?.isAdmin && (
              <button
                onClick={() => {
                  const title = prompt("공지 제목을 입력하세요:");
                  const content = prompt("공지 내용을 입력하세요:");
                  if (!title || !content) return;
                  handleNoticeSubmit(title, content);
                }}
                className="bg-yellow-600 hover:bg-yellow-500 text-white font-semibold text-sm px-4 py-2 rounded-lg"
              >
                공지 등록
              </button>
            )}

            <button
              onClick={() => setShowForm(true)}
              className="bg-indigo-900 hover:bg-indigo-800 text-white font-semibold text-sm px-4 py-2 rounded-lg"
            >
              문의 작성
            </button>
          </div>
        </div>

        {/* 테이블 영역 */}
        <div className="overflow-y-auto h-[calc(100%-3rem)]">
          <table className="w-full text-base text-left">
            <thead className="bg-gray-100 sticky top-0">
              <tr>
                <th className="px-6 py-3 font-semibold text-gray-700 w-1/12">번호</th>
                <th className="px-6 py-3 font-semibold text-gray-700 w-2/6">제목</th>
                <th className="px-6 py-3 font-semibold text-gray-700 w-1/6">작성자</th>
                <th className="px-6 py-3 font-semibold text-gray-700 w-1/6">등록일</th>
                <th className="px-6 py-3 font-semibold text-gray-700 w-1/6">답변 상태</th>
              </tr>
            </thead>

            <tbody>
              {posts.map((post, i) => (
                <tr
                  key={post._id}
                  onClick={() => setSelectedPost(post)}
                  className="hover:bg-gray-50 cursor-pointer border-b"
                >
                  <td className="px-6 py-3">{i + 1}</td>
                  <td className="px-6 py-3 text-gray-800 truncate">
                    {post.isNotice ? (
                      <span className="font-semibold text-red-600">📢 {post.question}</span>
                    ) : (
                      post.question
                    )}
                    {post.isPrivate && (
                      <span className="ml-2 text-gray-400 text-xs">(비공개)</span>
                    )}
                  </td>
                  <td className="px-6 py-3">{displayEmail(post.email)}</td>
                  <td className="px-6 py-3 text-gray-500">
                    {new Date(post.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-3">
                    {post.reply ? (
                      <span className="text-green-600 font-medium">답변 완료</span>
                    ) : (
                      <span className="text-gray-500">대기 중</span>
                    )}
                  </td>
                </tr>
              ))}

              {posts.length === 0 && (
                <tr>
                  <td colSpan="5" className="text-center text-gray-500 py-8 bg-gray-50">
                    등록된 상품 문의가 없습니다.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  }
  /* --------------------------------------------------------
   ✅ 관리자 공지 등록 함수
  -------------------------------------------------------- */
  async function handleNoticeSubmit(title, content) {
    try {
      await API.post(`${API_URL}/notice`, { question: title, answer: content });
      alert("공지글이 등록되었습니다.");
      fetchPosts();
    } catch (err) {
      console.error("공지 등록 실패:", err);
      alert("공지 등록 중 오류가 발생했습니다.");
    }
  }

  /* --------------------------------------------------------
   ✅ 문의 상세보기 (Support.jsx 디자인 동일)
  -------------------------------------------------------- */
  function renderDetail() {
    if (!selectedPost) return null;

    const canDelete =
      user?.isAdmin ||
      (user?.email && selectedPost.email && user.email === selectedPost.email);

    return (
      <div
        ref={detailRef}
        onContextMenu={startDetailResize}
        style={{
          width: detailSize.width,
          height: detailSize.height,
        }}
        className="fixed top-28 left-1/2 -translate-x-1/2 bg-white rounded-xl shadow-lg border p-8 z-50"
      >
        <h2 className="text-2xl font-bold mb-6 text-gray-900 text-center">
          {selectedPost.isNotice ? "📢 공지사항" : "상품 문의 상세"}
        </h2>

        <div className="mb-4">
          <p className="text-sm text-gray-500">작성자</p>
          <p className="text-gray-800 font-medium">
            {displayEmail(selectedPost.email)}
          </p>
        </div>

        <div className="mb-4">
          <p className="text-sm text-gray-500">제목</p>
          <p className="text-gray-800 font-semibold">{selectedPost.question}</p>
        </div>

        <div className="mb-4">
          <p className="text-sm text-gray-500">내용</p>
          <div className="border rounded-lg p-3 bg-gray-50 text-gray-700 whitespace-pre-wrap">
            {selectedPost.answer}
          </div>
        </div>

        {selectedPost.reply && (
          <div className="mt-4 border-t pt-3">
            <p className="text-sm text-gray-500">관리자 답변</p>
            <div className="border rounded-lg p-3 bg-green-50 text-gray-800 whitespace-pre-wrap">
              {selectedPost.reply}
            </div>
          </div>
        )}

        <div className="flex justify-end gap-3 mt-8">
          {canDelete && (
            <button
              onClick={() => handleDelete(selectedPost._id)}
              className="bg-red-600 hover:bg-red-500 text-white font-semibold px-4 py-2 rounded-lg"
            >
              삭제
            </button>
          )}
          <button
            onClick={() => setSelectedPost(null)}
            className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium px-4 py-2 rounded-lg"
          >
            닫기
          </button>
        </div>
      </div>
    );
  }

  /* --------------------------------------------------------
   ✅ 문의 삭제
  -------------------------------------------------------- */
  async function handleDelete(postId) {
    if (!window.confirm("정말 이 문의를 삭제하시겠습니까?")) return;

    try {
      await API.delete(`${API_URL}/${postId}`);
      alert("문의가 삭제되었습니다.");
      setSelectedPost(null);
      fetchPosts();
    } catch (err) {
      console.error("문의 삭제 실패:", err);
      alert(err.response?.data?.message || "삭제 중 오류가 발생했습니다.");
    }
  }

  /* --------------------------------------------------------
   ✅ 전체 페이지 레이아웃 (Support.jsx 스타일로 통일)
  -------------------------------------------------------- */
  return (
    <div className="min-h-screen bg-white pt-16 pb-20">
      <div className="max-w-6xl mx-auto text-center">
        {/* 상단 타이틀 */}
        <h1 className="text-3xl font-extrabold text-gray-900 mb-8">
          고객센터
        </h1>

        {/* ✅ 사용자 문의 / 상품 문의 탭 버튼 */}
        <div className="flex justify-center gap-2 mb-10">
          <button
            onClick={() => navigate("/support")}
            className={`px-6 py-2 rounded-full font-semibold text-sm shadow-sm transition-all duration-150 ${
              location.pathname === "/support"
                ? "bg-black text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            사용자 문의
          </button>

          <button
            onClick={() => navigate("/product-support")}
            className={`px-6 py-2 rounded-full font-semibold text-sm shadow-sm transition-all duration-150 ${
              location.pathname === "/product-support"
                ? "bg-black text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            상품 문의
          </button>
        </div>

        {/* 문의 작성 버튼 */}
        <div className="mb-10">
          <button
            onClick={() => setShowForm(true)}
            className="bg-black hover:bg-gray-800 text-white font-medium px-6 py-3 rounded-lg shadow"
          >
            ✉ 문의 작성하기
          </button>
        </div>

        {/* 메인 콘텐츠 */}
        <div className="px-4 sm:px-6 lg:px-8">
          {renderTable()}
          {renderForm()}
          {renderDetail()}
        </div>
      </div>
    </div>
  );
