// 📁 src/components/EditableText.jsx
import React, { useState, useEffect } from "react";
import { useEditMode } from "../context/EditModeContext";

/**
 * ✅ 사용법:
 * <EditableText
 *   id="hero-title"
 *   defaultText="기본 문구"
 *   apiUrl="http://localhost:1337/api/texts"
 * />
 */
export default function EditableText({ id, defaultText, apiUrl }) {
  const { isEditMode } = useEditMode();
  const [text, setText] = useState(defaultText);
  const [isEditing, setIsEditing] = useState(false);
  const [saved, setSaved] = useState(false);

  // ✅ 컴포넌트가 처음 로드될 때 Strapi에서 데이터 불러오기
  useEffect(() => {
    async function fetchText() {
      try {
        const res = await fetch(`${apiUrl}?filters[key][$eq]=${id}`);
        const data = await res.json();
        const strapiText = data.data?.[0]?.attributes?.content;
        if (strapiText) setText(strapiText);
      } catch (err) {
        console.error("⚠️ 텍스트 불러오기 실패:", err);
      }
    }
    fetchText();
  }, [id, apiUrl]);

  // ✅ 수정된 텍스트를 Strapi로 저장
  async function saveToStrapi(newText) {
    try {
      // 먼저 기존 데이터가 있는지 확인
      const checkRes = await fetch(`${apiUrl}?filters[key][$eq]=${id}`);
      const checkData = await checkRes.json();

      const existing = checkData.data?.[0];
      const url = existing
        ? `${apiUrl}/${existing.id}`
        : apiUrl;

      const method = existing ? "PUT" : "POST";

      const payload = existing
        ? { data: { content: newText } }
        : { data: { key: id, content: newText } };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("저장 실패");
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error("⚠️ 저장 오류:", err);
    }
  }

  // ✅ 수정 완료 시 저장
  const handleBlur = (e) => {
    const newText = e.target.innerText.trim();
    setText(newText);
    setIsEditing(false);
    saveToStrapi(newText);
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
