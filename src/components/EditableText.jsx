// 📁 src/components/EditableText.jsx
import React, { useState, useEffect } from "react";
import { useEditMode } from "../context/EditModeContext";

/**
 * ✅ 사용법:
 * <EditableText id="hero-title" defaultText="기본 문구" />
 */
export default function EditableText({ id, defaultText }) {
  const { isEditMode } = useEditMode();
  const [text, setText] = useState(defaultText);
  const [isEditing, setIsEditing] = useState(false);
  const [saved, setSaved] = useState(false);

  // ✅ 환경 변수에서 Strapi API 정보 불러오기
  const apiUrl = `${import.meta.env.VITE_STRAPI_URL}/api/texts`;
  const token = import.meta.env.VITE_STRAPI_TOKEN;

  // ✅ Strapi에서 기존 텍스트 불러오기
  useEffect(() => {
    async function fetchText() {
      try {
        const res = await fetch(`${apiUrl}?filters[key][$eq]=${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();
        const strapiText = data.data?.[0]?.attributes?.content;
        if (strapiText) setText(strapiText);
      } catch (err) {
        console.error("⚠️ 텍스트 불러오기 실패:", err);
      }
    }
    fetchText();
  }, [id, apiUrl, token]);

  // ✅ 수정된 텍스트를 Strapi에 저장
  async function saveToStrapi(newText) {
    try {
      // 기존 데이터 확인
      const checkRes = await fetch(`${apiUrl}?filters[key][$eq]=${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const checkData = await checkRes.json();

      const existing = checkData.data?.[0];
      const url = existing ? `${apiUrl}/${existing.id}` : apiUrl;
      const method = existing ? "PUT" : "POST";

      const payload = existing
        ? { data: { content: newText } }
        : { data: { key: id, content: newText } };

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("저장 실패");
      console.log(`✅ Strapi에 저장 완료: ${id} = ${newText}`);

      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error("⚠️ 저장 오류:", err);
    }
  }

  // ✅ 수정 완료 시 자동 저장
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
