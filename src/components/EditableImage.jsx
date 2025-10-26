// 📁 src/components/EditableImage.jsx
import React, { useState, useRef } from "react";
import { useEditMode } from "../context/EditModeContext";

/**
 * ✅ 사용법:
 * <EditableImage 
 *    id="hero-image" 
 *    defaultSrc="/images/hero.jpg" 
 *    alt="히어로 이미지"
 *    filePath="src/components/HeroSection.jsx"
 *    componentName="HeroSection"
 * />
 * 
 * 이미지도 텍스트와 동일하게 브라우저 내에서만 편집 가능.
 * 선택 시 파일 업로드 또는 URL 입력 가능.
 * 로컬스토리지에 이미지 src + 메타데이터 저장됨.
 */
export default function EditableImage({ id, defaultSrc, alt, filePath, componentName, style = {} }) {
  const { isEditMode, saveEditLog } = useEditMode(); // ✅ saveEditLog 추가
  const [imageSrc, setImageSrc] = useState(() => {
    // 로컬 저장된 이미지 불러오기
    const savedData = localStorage.getItem(`editable-image-${id}`);
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        return parsed.src || defaultSrc;
      } catch {
        return savedData || defaultSrc;
      }
    }
    return defaultSrc;
  });

  const [saved, setSaved] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const fileInputRef = useRef(null);

  /** ✅ 저장 함수 (로컬스토리지 + 메타데이터 포함) */
  const saveImageData = (newSrc) => {
    const saveData = {
      src: newSrc,
      filePath: filePath || "unknown",
      componentName: componentName || "unknown",
      updatedAt: new Date().toISOString(),
    };

    try {
      localStorage.setItem(`editable-image-${id}`, JSON.stringify(saveData));
      console.log(`✅ 로컬에 이미지 저장됨: ${id}`, saveData);

      // ✅ 글로벌 editLogs에도 기록 추가
      if (saveEditLog) {
        saveEditLog({
          text: `이미지 변경: ${id}`,
          filePath: filePath || import.meta.url,
          componentName: componentName || "EditableImage",
          updatedAt: new Date().toISOString(),
        });
      }

      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error("❌ 로컬스토리지 이미지 저장 실패:", err);
    }
  };

  /** ✅ 이미지 클릭 시 파일 선택 창 열기 */
  const handleClick = () => {
    if (!isEditMode) return;
    fileInputRef.current?.click();
  };

  /** ✅ 파일 업로드 시 이미지 미리보기 및 저장 */
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const newSrc = reader.result;
        setImageSrc(newSrc);
        saveImageData(newSrc);
      };
      reader.readAsDataURL(file);
    }
  };

  /** ✅ 우클릭 시 이미지 URL 직접 입력 */
  const handleContextMenu = (e) => {
    if (!isEditMode) return;
    e.preventDefault();
    const newUrl = prompt("이미지 URL을 입력하세요:", imageSrc);
    if (newUrl && newUrl.trim()) {
      setImageSrc(newUrl.trim());
      saveImageData(newUrl.trim());
    }
  };

  return (
    <div
      style={{
        position: "relative",
        display: "inline-block",
        cursor: isEditMode ? "pointer" : "default",
        border: isEditMode && isHovering ? "2px dashed #666" : "none",
        borderRadius: "8px",
        overflow: "hidden",
        transition: "all 0.2s ease",
        ...style,
      }}
      data-file={filePath || "unknown"}
      data-component={componentName || "unknown"}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      onClick={handleClick}
      onContextMenu={handleContextMenu}
    >
      {/* 실제 이미지 */}
      <img
        src={imageSrc}
        alt={alt || ""}
        style={{
          width: "100%",
          height: "auto",
          display: "block",
          opacity: isEditMode && isHovering ? 0.8 : 1,
          transition: "opacity 0.2s ease",
          userSelect: "none",
          pointerEvents: isEditMode ? "none" : "auto",
        }}
        draggable={false}
      />

      {/* 파일 업로드 input (숨김) */}
      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        style={{ display: "none" }}
        onChange={handleFileChange}
      />

      {/* 저장 알림 */}
      {saved && (
        <span
          style={{
            position: "absolute",
            bottom: "8px",
            right: "8px",
            backgroundColor: "rgba(0,0,0,0.7)",
            color: "white",
            fontSize: "0.8em",
            padding: "2px 6px",
            borderRadius: "4px",
          }}
        >
          ✔ 저장됨
        </span>
      )}

      {/* 편집 모드일 때 오버레이 표시 */}
      {isEditMode && isHovering && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.3)",
            color: "#fff",
            fontSize: "0.9em",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            textAlign: "center",
            fontWeight: "bold",
          }}
        >
          클릭: 이미지 교체 <br />
          우클릭: URL 입력
        </div>
      )}
    </div>
  );
}
