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

  // ✅ 모드 변경될 때 localStorage에 저장
  useEffect(() => {
    localStorage.setItem("editMode", isEditMode);
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
