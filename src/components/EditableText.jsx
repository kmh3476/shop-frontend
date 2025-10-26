// 📁 src/components/EditableText.jsx
import React, { useState } from "react";
import { useEditMode } from "../context/EditModeContext";

/**
 * ✅ 사용법:
 * <EditableText id="hero-title" defaultText="기본 문구" />
 * CMS 연결 없이, 브라우저 내에서만 텍스트 편집 가능.
 */
export default function EditableText({ id, defaultText }) {
  const { isEditMode } = useEditMode();
  const [text, setText] = useState(() => {
    // 로컬 저장된 값이 있으면 불러오기
    const savedText = localStorage.getItem(`editable-text-${id}`);
    return savedText || defaultText;
  });
  const [isEditing, setIsEditing] = useState(false);
  const [saved, setSaved] = useState(false);

  // ✅ CMS 요청 제거 — 로컬스토리지 기반 저장
  const handleBlur = (e) => {
    const newText = e.target.innerText.trim();
    if (newText !== text) {
      setText(newText);
      localStorage.setItem(`editable-text-${id}`, newText);
      console.log(`✅ 로컬에 저장됨: ${id} = ${newText}`);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
    setIsEditing(false);
  };

  return (
    <span
      contentEditable={isEditMode}
      suppressContentEditableWarning={true}
      onBlur={handleBlur}
      onFocus={() => setIsEditing(true)}
      style={{
        outline: isEditMode ? "2px dashed #666" : "none",
        backgroundColor: isEditing ? "#fff3cd" : "transparent",
        cursor: isEditMode ? "text" : "default",
        padding: isEditMode ? "2px 4px" : 0,
        borderRadius: "4px",
        transition: "all 0.2s ease",
        display: "inline-block",
      }}
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
