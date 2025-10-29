// 📁 src/components/AdminToolbar.jsx
import React from "react";
import { useEditMode } from "../context/EditModeContext";
import { useAuth } from "../context/AuthContext";

function AdminToolbar() {
  const { isEditMode, setIsEditMode, isResizeMode, setIsResizeMode } = useEditMode();
  const { user } = useAuth();

  // ✅ 관리자만 툴바 보이도록
  if (!user?.isAdmin) return null;

  // ✅ 토글 핸들러
  const toggleEditMode = () => {
    setIsEditMode(!isEditMode);
  };

  const toggleResizeMode = () => {
    setIsResizeMode(!isResizeMode);
  };

  return (
    <div className="fixed top-6 left-6 z-[9999] flex gap-3">
      {/* 디자인 모드 버튼 */}
      <button
        onClick={toggleEditMode}
        className={`px-5 py-2 rounded-lg text-white font-semibold shadow-lg transition ${
          isEditMode ? "bg-green-600 hover:bg-green-700" : "bg-gray-800 hover:bg-gray-900"
        }`}
      >
        {isEditMode ? "🖊 디자인 모드 ON" : "✏ 디자인 모드 OFF"}
      </button>

      {/* 크기 조절 모드 버튼 */}
      <button
        onClick={toggleResizeMode}
        className={`px-5 py-2 rounded-lg text-white font-semibold shadow-lg transition ${
          isResizeMode ? "bg-blue-600 hover:bg-blue-700" : "bg-gray-700 hover:bg-gray-800"
        }`}
      >
        {isResizeMode ? "📐 크기 조절 ON" : "📏 크기 조절 OFF"}
      </button>
    </div>
  );
}

export default AdminToolbar;
