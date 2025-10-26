// 📁 src/components/EditableText.jsx
import React, { useState } from "react";
import { useEditMode } from "../context/EditModeContext";

/**
 * ✅ 사용법:
 * <EditableText 
 *    id="hero-title" 
 *    defaultText="기본 문구" 
 *    filePath="src/components/HeroSection.jsx"
 *    componentName="HeroSection"
 * />
 * 
 * CMS 연결 없이, 브라우저 내에서만 텍스트 편집 가능.
 * 이제 filePath와 componentName이 로컬스토리지에 함께 저장됨.
 */
export default function EditableText({ id, defaultText, filePath, componentName }) {
  const { isEditMode, saveEditLog } = useEditMode(); // ✅ saveEditLog 추가

  const [text, setText] = useState(() => {
    // 로컬 저장된 값이 있으면 불러오기
    const savedData = localStorage.getItem(`editable-text-${id}`);
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        return parsed.text || defaultText;
      } catch {
        // 예전 버전(문자열 형태) 호환 처리
        return savedData || defaultText;
      }
    }
    return defaultText;
  });

  const [isEditing, setIsEditing] = useState(false);
  const [saved, setSaved] = useState(false);

  // ✅ CMS 요청 제거 — 로컬스토리지 기반 저장
  const handleBlur = (e) => {
    let newText = e.target.innerText.trim();

    if (newText !== text) {
      setText(newText);

      // 새로운 저장 형식 (텍스트 + 메타데이터)
      const saveData = {
        text: newText,
        filePath: filePath || "unknown",
        componentName: componentName || "unknown",
        updatedAt: new Date().toISOString(),
      };

      try {
        localStorage.setItem(`editable-text-${id}`, JSON.stringify(saveData));
        console.log(`✅ 로컬에 저장됨: ${id}`, saveData);

        // ✅ 글로벌 editLogs에도 기록 추가
        if (saveEditLog) {
          saveEditLog({
            text: newText,
            filePath: filePath || import.meta.url,
            componentName: componentName || "EditableText",
            updatedAt: new Date().toISOString(),
          });
        }

      } catch (err) {
        console.error("❌ 로컬스토리지 저장 실패:", err);
      }

      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }

    setIsEditing(false);
  };

  // ✅ 붙여넣기 시 HTML 태그 제거
  const handlePaste = (e) => {
    e.preventDefault();
    const plainText = e.clipboardData.getData("text/plain");
    document.execCommand("insertText", false, plainText);
  };

  // ✅ Enter(줄바꿈) 막기 - 텍스트만 단일 줄 유지
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      e.target.blur();
    }
  };

  return (
    <span
      contentEditable={isEditMode}
      suppressContentEditableWarning={true}
      onBlur={handleBlur}
      onFocus={() => setIsEditing(true)}
      onPaste={handlePaste}
      onKeyDown={handleKeyDown}
      style={{
        outline: isEditMode ? "2px dashed #666" : "none",
        backgroundColor: isEditing ? "#fff3cd" : "transparent",
        cursor: isEditMode ? "text" : "default",
        padding: isEditMode ? "2px 4px" : 0,
        borderRadius: "4px",
        transition: "all 0.2s ease",
        display: "inline-block",
      }}
      data-file={filePath || "unknown"}
      data-component={componentName || "unknown"}
      spellCheck={false}
    >
      {text}
      {saved && (
        <span
          style={{
            marginLeft: "8px",
            color: "green",
            fontSize: "0.8em",
          }}
        >
          ✔ 저장됨
        </span>
      )}
    </span>
  );
}
