// 📁 src/components/AdminToolbar.jsx
import React from "react";
import { useEditMode } from "../context/EditModeContext";
import { useAuth } from "../context/AuthContext";

function AdminToolbar() {
  const { isEditMode, setIsEditMode, isResizeMode, setIsResizeMode } = useEditMode();
  const { user } = useAuth();

  if (!user?.isAdmin) return null;

  const toggleEditMode = () => setIsEditMode(!isEditMode);
  const toggleResizeMode = () => setIsResizeMode(!isResizeMode);

  return (
    <div className="fixed top-6 left-6 z-[9999] flex gap-4 items-center">
      {/* 디자인 모드 버튼 */}
      <button
        onClick={toggleEditMode}
        className={`px-6 py-2.5 text-sm font-semibold text-white shadow-md 
          transition-colors duration-200 ease-out focus:outline-none
          ${
            isEditMode
              ? "bg-green-600 hover:bg-green-700"
              : "bg-gray-800 hover:bg-gray-900"
          }`}
        style={{
          borderRadius: "12px",           // ✅ 깔끔한 둥근 직사각형
          border: "none",                 // ✅ 경계선 제거
          outline: "none",
          boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
        }}
      >
        {isEditMode ? "🖊 디자인 모드 ON" : "✏ 디자인 모드 OFF"}
      </button>

      {/* 크기 조절 모드 버튼 */}
      <button
        onClick={toggleResizeMode}
        className={`px-6 py-2.5 text-sm font-semibold text-white shadow-md 
          transition-colors duration-200 ease-out focus:outline-none
          ${
            isResizeMode
              ? "bg-blue-600 hover:bg-blue-700"
              : "bg-gray-700 hover:bg-gray-800"
          }`}
        style={{
          borderRadius: "12px",           // ✅ 버튼 개별 둥근 테두리
          border: "none",
          outline: "none",
          boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
        }}
      >
        {isResizeMode ? "📐 크기 조절 ON" : "📏 크기 조절 OFF"}
      </button>
    </div>
  );
}

export default AdminToolbar;
