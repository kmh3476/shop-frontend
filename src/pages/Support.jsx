import React, { useEffect, useState, useRef } from "react";
import API from "../api/axiosInstance";
import { useAuth } from "../context/AuthContext";
import { useEditMode } from "../context/EditModeContext";
import EditableText from "../components/EditableText";
import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

function isValidEmail(email) {
  if (!email) return true;
  const regex = /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/;
  return regex.test(email);
}

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

export default function Support() {
  const [showAdminToolbar, setShowAdminToolbar] = useState(false);
  const isMobile = window.innerWidth <= 480;
  const { user } = useAuth();
  const { isEditMode, isResizeMode, setIsEditMode, setIsResizeMode } =
    useEditMode();
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
  const { t } = useTranslation();

  useEffect(() => {
    if (user?.email) {
      setNewPost((prev) => ({ ...prev, email: user.email }));
    }
  }, [user]);

  const { ref: formRef, size: formSize, startResize: startFormResize } =
    useResizableBox("support-form", { width: 800, height: 520 }, isResizeMode);
  const { ref: tableRef, size: tableSize, startResize: startTableResize } =
    useResizableBox("support-table", { width: 1100, height: 580 }, isResizeMode);
  const { ref: detailRef, size: detailSize, startResize: startDetailResize } =
    useResizableBox("support-detail", { width: 800, height: 520 }, isResizeMode);

  useEffect(() => {
    fetchPosts();
  }, []);

  async function fetchPosts() {
    try {
      const res = await API.get(`${API_URL}/all`);
      const filtered = res.data.filter(
        (p) => !p.productId || p.productId === "" || p.productId === null
      );
      const sorted = filtered.sort((a, b) => {
        if (a.isNotice && !b.isNotice) return -1;
        if (!a.isNotice && b.isNotice) return 1;
        return new Date(b.createdAt) - new Date(a.createdAt);
      });
      setPosts(sorted);
    } catch (err) {
      console.error(t("support.fetchFail"), err);
    }
  }

  const displayEmail = (email) => {
    if (!email) return t("support.anonymous");
    const [id] = email.split("@");
    return id.slice(0, 2) + "****";
  };
  async function handleSubmit(e) {
    e.preventDefault();

    if (!user) {
      if (window.confirm(t("support.needLoginConfirm"))) {
        navigate("/login");
      }
      return;
    }

    if (!newPost.question.trim() || !newPost.answer.trim()) {
      return alert(t("support.fillAllFields"));
    }

    if (newPost.email && !isValidEmail(newPost.email)) {
      return alert(t("support.invalidEmail"));
    }

    try {
      setLoading(true);
      await API.post(API_URL, {
        email: newPost.email || user.email,
        question: newPost.question,
        answer: newPost.answer,
        isPrivate: newPost.isPrivate,
        productId: null,
      });
      alert(t("support.submitSuccess"));
      setNewPost({
        email: user.email || "",
        question: "",
        answer: "",
        isPrivate: false,
      });
      setShowForm(false);
      fetchPosts();
    } catch (err) {
      console.error(t("support.submitFail"), err);
      alert(t("support.submitError"));
    } finally {
      setLoading(false);
    }
  }

  async function handleNoticeSubmit() {
    if (!user?.isAdmin) return;
    const title = prompt(t("support.enterNoticeTitle"));
    const content = prompt(t("support.enterNoticeContent"));
    if (!title || !content) return;

    try {
      await API.post(`${API_URL}/notice`, {
        question: title,
        answer: content,
        productId: null,
      });
      alert(t("support.noticeSuccess"));
      fetchPosts();
    } catch (err) {
      console.error(t("support.noticeFail"), err);
      alert(t("support.noticeError"));
    }
  }

  const closeDetail = () => setSelectedPost(null);

  async function handleDelete(id) {
    if (!window.confirm(t("support.confirmDelete"))) return;
    try {
      await API.delete(`${API_URL}/${id}`);
      alert(t("support.deleted"));
      setSelectedPost(null);
      fetchPosts();
    } catch (err) {
      console.error(t("support.deleteFail"), err);
      alert(t("support.deleteError"));
    }
  }

  // 📱 모바일 전용 전체폭 스타일
const mobileSafeStyle = isMobile
  ? { width: "100%", minWidth: "100%", maxWidth: "100%" }
  : {};


  return (
  <div
  className="
  min-h-screen bg-white text-black 
  py-4 px-3 
  max-[480px]:py-1 max-[480px]:px-2
"

>


      {/* 🔧 모바일용 관리자 툴바 ON/OFF 토글 버튼 */}
      {user?.isAdmin && isMobile && (
        <button
          onClick={() => {
            const newState = !showAdminToolbar;
            setShowAdminToolbar(newState);

            // OFF 될 때는 디자인/리사이즈 모드도 같이 끄기
            if (!newState) {
              setIsEditMode(false);
              setIsResizeMode(false);
            }
          }}
          className="fixed top-4 left-4 z-[9999] bg-black text-white px-3 py-2 rounded-lg shadow-md text-sm"

        >
          {showAdminToolbar ? "OFF" : "ON"}
        </button>
      )}

      {/* 🧰 관리자 툴바 (PC에서는 항상, 모바일에선 ON일 때만) */}
      {user?.isAdmin && (showAdminToolbar || !isMobile) && (
  <div className="fixed top-16 left-4 z-[9999] flex flex-col gap-2">

    {/* 디자인 모드 */}
    <button
      onClick={() => setIsEditMode(p => !p)}
      className={`px-3 py-2 rounded text-white font-semibold text-sm shadow ${
        isEditMode ? "bg-green-600" : "bg-gray-700"
      }`}
    >
      {isEditMode ? t("support.designModeOn") : t("support.designModeOff")}
    </button>

    {/* 리사이즈 모드 */}
    <button
      onClick={() => setIsResizeMode(p => !p)}
      className={`px-3 py-2 rounded text-white font-semibold text-sm shadow ${
        isResizeMode ? "bg-blue-600" : "bg-gray-700"
      }`}
    >
      {isResizeMode ? t("support.resizeModeOn") : t("support.resizeModeOff")}
    </button>

    {/* 공지추가 */}
    <button
      onClick={handleNoticeSubmit}
      className="px-3 py-2 rounded bg-yellow-500 text-white font-semibold text-sm shadow hover:bg-yellow-600"
    >
      📢 {t("support.addNotice")}
    </button>

  </div>
)}



      <div className="
  flex justify-center mb-12 
  max-[480px]:mb-6 max-[480px]:mt-2
">
  <div className="
    inline-flex bg-gray-100 rounded-full p-1 shadow-sm 
    max-[480px]:p-0.5
  ">
    <button
      onClick={() => navigate("/support")}
      className={`
        px-6 py-2 rounded-full text-base font-medium transition-all
        ${location.pathname === "/support"
          ? "bg-black text-white shadow-sm"
          : "text-gray-600 hover:text-black"}
        max-[480px]:px-3 max-[480px]:py-1.5 max-[480px]:text-xs
      `}
    >
      {t("support.userInquiry")}
    </button>

    <button
      onClick={() => navigate("/product-support")}
      className={`
        px-6 py-2 rounded-full text-base font-medium transition-all
        ${location.pathname === "/product-support"
          ? "bg-black text-white shadow-sm"
          : "text-gray-600 hover:text-black"}
        max-[480px]:px-3 max-[480px]:py-1.5 max-[480px]:text-xs
      `}
    >
      {t("support.productInquiry")}
    </button>
  </div>
</div>


      <h1
  className="
    text-4xl font-extrabold text-center mb-8
    max-[480px]:text-2xl max-[480px]:mb-3
  "
>

        <EditableText id="support-title" defaultText={t("support.title")} />
      </h1>

      {!showForm && !selectedPost && (
        <div className="flex justify-center mb-10">
          <button
            onClick={() => {
              if (!user) {
                if (window.confirm(t("support.needLoginConfirm"))) {
                  navigate("/login");
                }
                return;
              }
              setShowForm(true);
            }}
            className="bg-black text-white px-8 py-3 rounded-lg font-semibold hover:bg-gray-800 transition-all"
          >
            ✉ {t("support.writeInquiry")}
          </button>
        </div>
      )}
      {showForm && user && !selectedPost && (
        <div
          ref={formRef}
          onContextMenu={startFormResize}
          style={{
  ...(isMobile ? mobileSafeStyle : { width: `${formSize.width}px` }),
  minHeight: `${formSize.height}px`,
  cursor: isResizeMode ? "se-resize" : "default",
}}

          className="max-w-3xl mx-auto mb-16 bg-gray-50 rounded-2xl p-8 shadow"
        >
          <h2 className="text-2xl font-bold mb-6">{t("support.writeFormTitle")}</h2>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <input
              type="email"
              placeholder={t("support.emailPlaceholder")}
              value={newPost.email}
              onChange={(e) => setNewPost({ ...newPost, email: e.target.value })}
              className="border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-black"
            />
            <input
              type="text"
              placeholder={t("support.titlePlaceholder")}
              value={newPost.question}
              onChange={(e) => setNewPost({ ...newPost, question: e.target.value })}
              className="border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-black"
            />
            <textarea
              placeholder={t("support.contentPlaceholder")}
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
              {t("support.privateOption")}
            </label>
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={loading}
                className={`flex-1 bg-black text-white py-3 rounded-lg hover:bg-gray-800 ${
                  loading ? "opacity-70 cursor-not-allowed" : ""
                }`}
              >
                {loading ? t("support.submitting") : t("support.submit")}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="flex-1 bg-gray-300 text-black py-3 rounded-lg hover:bg-gray-400"
              >
                {t("support.cancel")}
              </button>
            </div>
          </form>
        </div>
      )}

      {!selectedPost && (
        <div
          ref={tableRef}
          onContextMenu={startTableResize}
         style={{
  ...(isMobile ? mobileSafeStyle : { width: `${tableSize.width}px` }),
  minHeight: `${tableSize.height}px`,
  cursor: isResizeMode ? "se-resize" : "default",
}}

          className="
  w-full mx-auto bg-white p-4 rounded shadow
 max-[480px]:px-1 max-[480px]:py-2 max-[480px]:rounded-lg
"


        >
          <h2 className="text-3xl font-bold mb-6">{t("support.listTitle")}</h2>
          <table
  className="
    w-full border-collapse border-t border-gray-300
    text-base
    max-[480px]:text-xs
  "
>

            <thead className="bg-gray-100">
  <tr className="text-left max-[480px]:text-center">
    {/* 번호 */}
    <th
      className="
        p-3 text-center w-[8%]
        max-[480px]:p-1 max-[480px]:text-xs
      "
    >
      {t("support.number")}
    </th>

    {/* 작성자 */}
    <th
      className="
        p-3 w-[20%]
        max-[480px]:p-1 max-[480px]:text-xs
      "
    >
      {t("support.writer")}
    </th>

    {/* 제목 */}
    <th
      className="
        p-3 w-[25%]
        max-[480px]:p-1 max-[480px]:text-xs
      "
    >
      {t("support.title")}
    </th>

    {/* 내용 */}
    <th
      className="
        p-3 w-[35%]
        max-[480px]:p-1 max-[480px]:text-xs
      "
    >
      {t("support.content")}
    </th>

    {/* 상태 */}
    <th
      className="
        p-3 text-center w-[12%]
        max-[480px]:p-1 max-[480px]:text-xs
      "
    >
      {t("support.status")}
    </th>
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
                  <td
  className="
    p-3 text-center
    max-[480px]:p-1 max-[480px]:text-xs
  "
>
{i + 1}</td>
                  <td
  className="
    p-3 text-sm
    max-[480px]:p-1 max-[480px]:text-xs
  "
>

                    {p.isNotice ? t("support.admin") : displayEmail(p.email)}
                  </td>
                  <td
  className="
    p-3 font-semibold text-gray-800
    max-[480px]:p-1 max-[480px]:text-xs
  "
>

                    {p.isNotice && (
                      <span className="text-blue-600 font-bold">
                        [{t("support.notice")}]
                      </span>
                    )}{" "}
                    {p.question}
                    {p.isPrivate && (
                      <span className="ml-1 text-gray-500 text-xs">🔒</span>
                    )}
                  </td>
                  <td
  className="
    p-3 text-gray-700 text-sm
    max-[480px]:p-1 max-[480px]:text-xs
  "
>

                    {p.isPrivate ? (
                      <span className="italic text-gray-400">
                        🔒 {t("support.privateInquiry")}
                      </span>
                    ) : p.answer?.length > 40 ? (
                      p.answer.slice(0, 40) + "..."
                    ) : (
                      p.answer
                    )}
                  </td>
                  <td
  className="
    p-3 text-center
    max-[480px]:p-1 max-[480px]:text-xs
  "
>

                    {p.reply ? (
                      <span className="text-green-600 font-medium">
                        {t("support.answered")}
                      </span>
                    ) : p.isNotice ? (
                      <span className="text-blue-600 font-medium">
                        {t("support.notice")}
                      </span>
                    ) : (
                      <span className="text-gray-500">
                        {t("support.pending")}
                      </span>
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
                    {t("support.noInquiries")}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
      {selectedPost && (
        <div
          ref={detailRef}
          onContextMenu={startDetailResize}
          style={{
  ...(isMobile ? mobileSafeStyle : { width: `${detailSize.width}px` }),
  minHeight: `${detailSize.height}px`,
  cursor: isResizeMode ? "se-resize" : "default",
}}

          className="max-w-3xl mx-auto bg-gray-50 rounded-2xl p-8 shadow relative"
        >
          <button
            onClick={closeDetail}
            className="absolute top-4 right-4 bg-gray-300 text-black px-3 py-1 rounded hover:bg-gray-400"
          >
            {t("support.close")}
          </button>

          <h2 className="text-2xl font-bold mb-4">
            {selectedPost.question}
          </h2>

          <p className="text-gray-600 text-sm mb-6">
            {t("support.writer")} :{" "}
            {selectedPost.isNotice
              ? t("support.admin")
              : displayEmail(selectedPost.email)}{" "}
            | {new Date(selectedPost.createdAt).toLocaleDateString()}
            {selectedPost.productId &&
              !selectedPost.isNotice && (
                <span className="ml-2 text-gray-500 text-xs">
                  ({t("support.productRelated")})
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
              <h3 className="font-semibold text-green-700 mb-2">
                {t("support.adminReply")}
              </h3>
              <p className="text-gray-800 whitespace-pre-wrap">
                {selectedPost.reply}
              </p>
            </div>
          ) : (
            <div className="text-gray-500 italic">
              {t("support.noReplyYet")}
            </div>
          )}

          {(user?.isAdmin ||
            (user?.email &&
              selectedPost.email &&
              user.email === selectedPost.email)) && (
            <button
              onClick={() => handleDelete(selectedPost._id)}
              className="mt-6 bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded"
            >
              {t("support.delete")}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
