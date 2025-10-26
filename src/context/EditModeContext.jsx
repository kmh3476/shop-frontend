// 📁 src/context/EditModeContext.jsx
import React, { createContext, useContext, useState, useEffect } from "react";

const EditModeContext = createContext();

export function EditModeProvider({ children }) {
  const [isEditMode, setIsEditMode] = useState(false);

  // ✅ 앱이 처음 로드될 때 localStorage에서 이전 모드 상태 복원
  useEffect(() => {
    const savedMode = localStorage.getItem("editMode");
    if (savedMode === "true") {
      setIsEditMode(true);
    }
  }, []);

  // ✅ 모드 변경될 때 localStorage에 저장 + 변경 로그 기록
  useEffect(() => {
    localStorage.setItem("editMode", isEditMode);

    // 변경 추적용 로그 기록
    const logEntry = {
      text: isEditMode ? "Edit mode enabled" : "Edit mode disabled",
      filePath: import.meta.url || "unknown",
      componentName: "EditModeContext",
      updatedAt: new Date().toISOString(),
    };

    // 기존 로그 불러오기
    const prevLogs = JSON.parse(localStorage.getItem("editLogs") || "[]");
    const newLogs = [...prevLogs, logEntry];

    // 로컬스토리지에 저장
    localStorage.setItem("editLogs", JSON.stringify(newLogs));
  }, [isEditMode]);

  return (
    <EditModeContext.Provider value={{ isEditMode, setIsEditMode }}>
      {children}
    </EditModeContext.Provider>
  );
}

export function useEditMode() {
  return useContext(EditModeContext);
}
