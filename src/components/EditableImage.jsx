// 📁 src/components/EditableImage.jsx
import React, { useState, useRef, useEffect } from "react";
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
 * 이미지 교체 + 크기조절 모두 가능.
 * - 클릭: 이미지 업로드
 * - 우클릭: URL 직접 입력
 * - 드래그: 편집모드에서 크기조절 가능
 */
export default function EditableImage({ id, defaultSrc, alt, filePath, componentName, style = {} }) {
  const { isEditMode, saveEditLog } = useEditMode();

  // ✅ 이미지 src 복원
  const [imageSrc, setImageSrc] = useState(() => {
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

  // ✅ 크기 복원
  const [imageSize, setImageSize] = useState(() => {
    const saved = localStorage.getItem(`editable-image-${id}-size`);
    if (saved) return JSON.parse(saved);
    return { width: "100%", height: "auto" };
  });

  const [saved, setSaved] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const fileInputRef = useRef(null);

  // ✅ 크기 조절 관련 상태
  const [resizing, setResizing] = useState(false);
  const startPos = useRef({ x: 0, width: 0 });

  /** ✅ 이미지 저장 (로컬스토리지 + 로그) */
  const saveImageData = (newSrc) => {
    const saveData = {
      src: newSrc,
      filePath: filePath || import.meta.url || "unknown",
      componentName: componentName || "EditableImage",
      updatedAt: new Date().toISOString(),
    };

    try {
      localStorage.setItem(`editable-image-${id}`, JSON.stringify(saveData));

      // ✅ 로그 남기기 (EditModeContext 있으면 사용, 없으면 직접 기록)
      if (typeof saveEditLog === "function") {
        saveEditLog({
          text: `Image updated (${id})`,
          filePath: saveData.filePath,
          componentName: saveData.componentName,
          updatedAt: saveData.updatedAt,
        });
      } else {
        const prevLogs = JSON.parse(localStorage.getItem("editLogs") || "[]");
        localStorage.setItem(
          "editLogs",
          JSON.stringify([...prevLogs, {
            text: `Image updated (${id})`,
            filePath: saveData.filePath,
            componentName: saveData.componentName,
            updatedAt: saveData.updatedAt,
          }])
        );
      }

      console.log(`✅ 로컬에 이미지 저장됨: ${id}`, saveData);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error("❌ 로컬스토리지 이미지 저장 실패:", err);
    }
  };

  /** ✅ 크기 저장 (로컬스토리지) */
  const saveImageSize = (size) => {
    localStorage.setItem(`editable-image-${id}-size`, JSON.stringify(size));
    console.log(`📏 이미지 크기 저장됨: ${id}`, size);
  };

  /** ✅ 파일 선택창 열기 */
  const handleClick = () => {
    if (!isEditMode) return;
    fileInputRef.current?.click();
  };

  /** ✅ 파일 업로드 처리 */
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const newSrc = reader.result;
        setImageSrc(newSrc);
        saveImageData(newSrc);
        e.target.value = ""; // 같은 파일 다시 선택해도 반응
      };
      reader.readAsDataURL(file);
    }
  };

  /** ✅ URL 입력 */
  const handleContextMenu = (e) => {
    if (!isEditMode) return;
    e.preventDefault();
    const newUrl = prompt("이미지 URL을 입력하세요:", imageSrc);
    if (newUrl && newUrl.trim()) {
      setImageSrc(newUrl.trim());
      saveImageData(newUrl.trim());
    }
  };

  /** ✅ 드래그 시작 (크기조절) */
  const handleMouseDown = (e) => {
    if (!isEditMode) return;
    setResizing(true);
    startPos.current = { x: e.clientX, width: e.currentTarget.offsetWidth };
  };

  /** ✅ 드래그 중 */
  const handleMouseMove = (e) => {
    if (!resizing) return;
    const diff = e.clientX - startPos.current.x;
    const newWidth = Math.max(80, startPos.current.width + diff);
    const newSize = { width: `${newWidth}px`, height: "auto" };
    setImageSize(newSize);
  };

  /** ✅ 드래그 끝 */
  const handleMouseUp = () => {
    if (!resizing) return;
    setResizing(false);
    saveImageSize(imageSize);
  };

  /** ✅ 드래그 이벤트 전역 등록 */
  useEffect(() => {
    if (resizing) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    } else {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    }
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [resizing, imageSize]);

  return (
    <div
      style={{
        position: "relative",
        display: "inline-block",
        cursor: isEditMode ? (resizing ? "grabbing" : "grab") : "default",
        border: isEditMode && isHovering ? "2px dashed #666" : "none",
        borderRadius: "8px",
        overflow: "hidden",
        transition: "all 0.2s ease",
        ...imageSize,
        ...style,
      }}
      data-file={filePath || import.meta.url || "unknown"}
      data-component={componentName || "EditableImage"}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      onClick={handleClick}
      onContextMenu={handleContextMenu}
      onMouseDown={handleMouseDown} // ✅ 추가: 드래그 시작
    >
      {/* ✅ 이미지 */}
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
          pointerEvents: "none",
        }}
        draggable={false}
      />

      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        style={{ display: "none" }}
        onChange={handleFileChange}
      />

      {/* ✅ 저장 표시 */}
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

      {/* ✅ 편집모드 안내 오버레이 */}
      {isEditMode && isHovering && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.35)",
            color: "#fff",
            fontSize: "0.9em",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            textAlign: "center",
            fontWeight: "bold",
            pointerEvents: "none",
          }}
        >
          클릭: 이미지 교체 <br />
          우클릭: URL 입력 <br />
          드래그: 크기 조절
        </div>
      )}
    </div>
  );
}
