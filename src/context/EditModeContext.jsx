// 📁 src/context/EditModeContext.jsx
import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext"; // ✅ 수정: 관리자 권한 확인을 위해 추가

const EditModeContext = createContext();

export function EditModeProvider({ children }) {
  const [isEditMode, setIsEditMode] = useState(false);
  const { user } = useAuth(); // ✅ 현재 로그인된 사용자 정보 가져오기

  // ✅ 앱이 처음 로드될 때 localStorage에서 이전 모드 상태 복원
  useEffect(() => {
    const savedMode = localStorage.getItem("editMode");

    // ✅ 관리자일 때만 복원 허용
    if (savedMode === "true" && user?.isAdmin) {
      setIsEditMode(true);
    } else {
      setIsEditMode(false); // 일반 유저는 항상 비활성화
      localStorage.setItem("editMode", "false");
    }
  }, [user]); // ✅ user 변경될 때마다 권한 재검사

  // ✅ 모드 변경될 때 localStorage에 저장 + 변경 로그 기록
  useEffect(() => {
    // ✅ 관리자일 때만 로컬 저장 허용
    if (user?.isAdmin) {
      localStorage.setItem("editMode", isEditMode);

      // 변경 추적용 로그 기록
      const logEntry = {
        text: isEditMode ? "Edit mode enabled" : "Edit mode disabled",
        filePath: import.meta.url || "unknown",
        componentName: "EditModeContext",
        updatedAt: new Date().toISOString(),
        triggeredBy: user?.email || "unknown", // ✅ 누가 켰는지 기록
      };

      const prevLogs = JSON.parse(localStorage.getItem("editLogs") || "[]");
      const newLogs = [...prevLogs, logEntry];
      localStorage.setItem("editLogs", JSON.stringify(newLogs));
    } else {
      // ✅ 일반 유저는 편집모드 강제 비활성화
      if (isEditMode) setIsEditMode(false);
      localStorage.setItem("editMode", "false");
    }
  }, [isEditMode, user]);

  // ✅ 전역 로그 기록 함수 (EditableText / EditableImage 등에서 사용)
  const saveEditLog = (entry) => {
    try {
      // ✅ 관리자만 로그 저장 가능
      if (!user?.isAdmin) return;

      const prev = JSON.parse(localStorage.getItem("editLogs") || "[]");
      const newLogs = [...prev, entry];
      localStorage.setItem("editLogs", JSON.stringify(newLogs));
      console.log("📝 editLogs에 기록됨:", entry);
    } catch (err) {
      console.error("❌ editLogs 저장 실패:", err);
    }
  };

  return (
    <EditModeContext.Provider value={{ isEditMode, setIsEditMode, saveEditLog }}>
      {children}
    </EditModeContext.Provider>
  );
}

export function useEditMode() {
  return useContext(EditModeContext);
}
