// 📁 src/components/EditableText.jsx
import React, { useState, useEffect } from "react";
import { useEditMode } from "../context/EditModeContext";
import { useTranslation } from "react-i18next";

/**
 * ✅ 사용법:
 * <EditableText 
 *    id="hero-title" 
 *    defaultText={t("main.heroTitle")} 
 *    filePath="src/components/HeroSection.jsx"
 *    componentName="HeroSection"
 * />
 * 
 * 🌍 다국어 완벽 지원 (언어 변경 시 자동 갱신)
 * CMS 없이 로컬스토리지 기반 저장
 */
export default function EditableText({ id, defaultText, filePath, componentName }) {
  const { isEditMode, saveEditLog } = useEditMode();
  const { i18n } = useTranslation(); // ✅ 다국어 감지용

  const [text, setText] = useState(() => {
    const savedData = localStorage.getItem(`editable-text-${id}`);
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        return parsed.text || defaultText;
      } catch {
        return savedData || defaultText;
      }
    }
    return defaultText;
  });

  const [isEditing, setIsEditing] = useState(false);
  const [saved, setSaved] = useState(false);

  // ✅ 언어 변경 시 자동으로 번역 기본값 반영
  useEffect(() => {
    const savedData = localStorage.getItem(`editable-text-${id}`);
    if (!savedData || isEditMode) {
      // 로컬에 저장된 값이 없거나 편집 중이면 번역값으로 갱신
      setText(defaultText);
    }
  }, [i18n.language, defaultText, id, isEditMode]);

  // ✅ 로컬스토리지 저장
  const handleBlur = (e) => {
    let newText = e.target.innerText.trim();

    if (newText !== text) {
      setText(newText);

      const saveData = {
        text: newText,
        filePath: filePath || "unknown",
        componentName: componentName || "unknown",
        updatedAt: new Date().toISOString(),
      };

      try {
        localStorage.setItem(`editable-text-${id}`, JSON.stringify(saveData));
        console.log(`✅ 로컬에 저장됨: ${id}`, saveData);

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

  const handlePaste = (e) => {
    e.preventDefault();
    const plainText = e.clipboardData.getData("text/plain");
    document.execCommand("insertText", false, plainText);
  };

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
