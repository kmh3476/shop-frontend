import React from "react";
import { useEditMode } from "../context/EditModeContext";
import { useAuth } from "../context/AuthContext";

function AdminToolbar() {
  const { isEditMode, setIsEditMode, isResizeMode, setIsResizeMode } = useEditMode();
  const { user } = useAuth();

  // ✅ 관리자만 툴바 보이도록
  if (!user?.isAdmin) return null;

  // ✅ 토글 핸들러
  const toggleEditMode = () => setIsEditMode(!isEditMode);
  const toggleResizeMode = () => setIsResizeMode(!isResizeMode);

  return (
    <div className="fixed top-6 left-6 z-[9999] flex gap-3 items-center">
      {/* 디자인 모드 버튼 */}
      <button
        onClick={toggleEditMode}
        className={`px-5 py-2 rounded-lg text-white font-semibold shadow-md 
          transition-all duration-200 ease-out 
          focus:outline-none focus:ring-0
          ${
            isEditMode
              ? "bg-green-600 hover:bg-green-700 active:scale-[0.98]"
              : "bg-gray-800 hover:bg-gray-900 active:scale-[0.98]"
          }`}
        style={{
          transformOrigin: "center",
          boxShadow: isEditMode
            ? "0 0 0 2px rgba(34,197,94,0.4)"
            : "0 0 0 1px rgba(0,0,0,0.2)",
        }}
      >
        {isEditMode ? "🖊 디자인 모드 ON" : "✏ 디자인 모드 OFF"}
      </button>

      {/* 크기 조절 모드 버튼 */}
      <button
        onClick={toggleResizeMode}
        className={`px-5 py-2 rounded-lg text-white font-semibold shadow-md 
          transition-all duration-200 ease-out 
          focus:outline-none focus:ring-0
          ${
            isResizeMode
              ? "bg-blue-600 hover:bg-blue-700 active:scale-[0.98]"
              : "bg-gray-700 hover:bg-gray-800 active:scale-[0.98]"
          }`}
        style={{
          transformOrigin: "center",
          boxShadow: isResizeMode
            ? "0 0 0 2px rgba(37,99,235,0.4)"
            : "0 0 0 1px rgba(0,0,0,0.2)",
        }}
      >
        {isResizeMode ? "📐 크기 조절 ON" : "📏 크기 조절 OFF"}
      </button>
    </div>
  );
}

export default AdminToolbar;
