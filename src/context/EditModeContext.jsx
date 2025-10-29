import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext"; // ✅ 관리자 권한 확인용

const EditModeContext = createContext();

export function EditModeProvider({ children }) {
  const [isEditMode, setIsEditMode] = useState(false);
  const [isResizeMode, setIsResizeMode] = useState(false); // ✅ 전역 크기조절 모드 상태
  const { user } = useAuth(); // ✅ 현재 로그인된 사용자 정보 가져오기

  /** ✅ 앱 로드시 localStorage에서 이전 모드 복원 */
  useEffect(() => {
    const savedEditMode = localStorage.getItem("editMode");
    const savedResizeMode = localStorage.getItem("resizeMode");

    if (user?.isAdmin) {
      if (savedEditMode === "true") setIsEditMode(true);
      if (savedResizeMode === "true") setIsResizeMode(true);
    } else {
      // 일반 사용자 접근 제한
      setIsEditMode(false);
      setIsResizeMode(false);
      localStorage.setItem("editMode", "false");
      localStorage.setItem("resizeMode", "false");
    }
  }, [user]);

  /** ✅ 모드 변경 시 localStorage 및 로그 기록 */
  useEffect(() => {
    if (user?.isAdmin) {
      localStorage.setItem("editMode", isEditMode);

      const logEntry = {
        text: isEditMode ? "Edit mode enabled" : "Edit mode disabled",
        filePath: import.meta.url || "unknown",
        componentName: "EditModeContext",
        updatedAt: new Date().toISOString(),
        triggeredBy: user?.email || "unknown",
      };

      const prevLogs = JSON.parse(localStorage.getItem("editLogs") || "[]");
      const newLogs = [...prevLogs, logEntry];
      localStorage.setItem("editLogs", JSON.stringify(newLogs));

      // ✅ 모드 변경 이벤트 브로드캐스트 (EditableText, Image 등에서 감지 가능)
      window.dispatchEvent(
        new CustomEvent("editModeChange", { detail: { enabled: isEditMode } })
      );
    } else {
      if (isEditMode) setIsEditMode(false);
      localStorage.setItem("editMode", "false");
    }
  }, [isEditMode, user]);

  /** ✅ 크기조절 모드 로깅 및 이벤트 브로드캐스트 추가 */
  useEffect(() => {
    if (user?.isAdmin) {
      localStorage.setItem("resizeMode", isResizeMode);

      const logEntry = {
        text: isResizeMode ? "Resize mode enabled" : "Resize mode disabled",
        filePath: import.meta.url || "unknown",
        componentName: "EditModeContext",
        updatedAt: new Date().toISOString(),
        triggeredBy: user?.email || "unknown",
      };

      const prevLogs = JSON.parse(localStorage.getItem("editLogs") || "[]");
      const newLogs = [...prevLogs, logEntry];
      localStorage.setItem("editLogs", JSON.stringify(newLogs));

      // ✅ 크기조절 모드 변경 이벤트 브로드캐스트
      window.dispatchEvent(
        new CustomEvent("resizeModeChange", { detail: { enabled: isResizeMode } })
      );
    } else {
      if (isResizeMode) setIsResizeMode(false);
      localStorage.setItem("resizeMode", "false");
    }
  }, [isResizeMode, user]);

  /** ✅ 공용 로그 저장 함수 */
  const saveEditLog = (entry) => {
    try {
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
    <EditModeContext.Provider
      value={{
        isEditMode,
        setIsEditMode,
        isResizeMode,
        setIsResizeMode,
        saveEditLog,
      }}
    >
      {children}
    </EditModeContext.Provider>
  );
}

export function useEditMode() {
  return useContext(EditModeContext);
}
