// 📁 src/components/EditableImage.jsx
import React, { useState, useRef, useEffect } from "react";
import { useEditMode } from "../context/EditModeContext";

/**
 * ✅ 동작 개요
 * - 디자인 모드 ✏ : 텍스트만 점선 표시 (이미지, 카드에는 점선 표시 안함)
 * - 크기조절 모드 📐 : 카드 전체 파란 점선 표시 + 우클릭 드래그로 크기 변경
 */
export default function EditableImage({
  id,
  defaultSrc,
  alt,
  filePath,
  componentName,
  style = {},
}) {
  const { isEditMode, isResizeMode, saveEditLog } = useEditMode();

  const [imageSrc, setImageSrc] = useState(() => {
    const savedData = localStorage.getItem(`editable-image-${id}`);
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        return parsed.src || defaultSrc;
      } catch {
        return defaultSrc;
      }
    }
    return defaultSrc;
  });

  const [size, setSize] = useState(() => {
    const savedSize = localStorage.getItem(`editable-image-size-${id}`);
    return savedSize ? JSON.parse(savedSize) : { width: 100, height: "auto" };
  });

  const [saved, setSaved] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [resizing, setResizing] = useState(false);
  const fileInputRef = useRef(null);
  const startPos = useRef({ x: 0, y: 0, width: 0, height: 0 });

  /** ✅ 이미지 저장 */
  const saveImageData = (newSrc) => {
    const saveData = {
      src: newSrc,
      filePath: filePath || import.meta.url || "unknown",
      componentName: componentName || "EditableImage",
      updatedAt: new Date().toISOString(),
    };

    try {
      localStorage.setItem(`editable-image-${id}`, JSON.stringify(saveData));
      if (typeof saveEditLog === "function") {
        saveEditLog({
          text: `Image updated (${id})`,
          filePath: saveData.filePath,
          componentName: saveData.componentName,
          updatedAt: saveData.updatedAt,
        });
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error("❌ 이미지 저장 실패:", err);
    }
  };

  /** ✅ 크기 저장 */
  const saveSizeData = (newSize) => {
    localStorage.setItem(`editable-image-size-${id}`, JSON.stringify(newSize));
  };

  /** ✅ 클릭 → 파일 업로드 */
  const handleClick = () => {
    if (!isEditMode) return;
    fileInputRef.current?.click();
  };

  /** ✅ 파일 업로드 */
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const newSrc = reader.result;
        setImageSrc(newSrc);
        saveImageData(newSrc);
        e.target.value = "";
      };
      reader.readAsDataURL(file);
    }
  };

  /** ✅ 우클릭 → URL 직접 입력 */
  const handleContextMenu = (e) => {
    if (!isEditMode) return;
    e.preventDefault();
    const newUrl = prompt("이미지 URL을 입력하세요:", imageSrc);
    if (newUrl && newUrl.trim()) {
      setImageSrc(newUrl.trim());
      saveImageData(newUrl.trim());
    }
  };

  /** ✅ 우클릭으로 크기조절 시작 */
  const handleMouseDown = (e) => {
    if (!isResizeMode) return;
    if (e.button !== 2) return;
    e.preventDefault();
    e.stopPropagation();

    setResizing(true);
    startPos.current = {
      x: e.clientX,
      y: e.clientY,
      width: size.width,
      height: e.target.clientHeight,
    };
    document.body.style.cursor = "se-resize";
    document.body.style.userSelect = "none";
  };

  const handleMouseMove = (e) => {
    if (!resizing) return;
    const dx = e.clientX - startPos.current.x;
    const dy = e.clientY - startPos.current.y;
    const newWidth = Math.max(50, startPos.current.width + dx);
    const newHeight =
      startPos.current.height === "auto"
        ? "auto"
        : Math.max(50, startPos.current.height + dy);
    setSize({ width: newWidth, height: newHeight });
  };

  const handleMouseUp = () => {
    if (resizing) {
      setResizing(false);
      document.body.style.cursor = "auto";
      document.body.style.userSelect = "auto";
      saveSizeData(size);
    }
  };

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
  }, [resizing, size]);

  /** ✅ 우클릭 메뉴 차단 */
  useEffect(() => {
    const handleCtx = (e) => {
      if (isEditMode || isResizeMode) e.preventDefault();
    };
    window.addEventListener("contextmenu", handleCtx);
    return () => window.removeEventListener("contextmenu", handleCtx);
  }, [isEditMode, isResizeMode]);

  return (
    <div
      style={{
        position: "relative",
        display: "inline-block",
        cursor: isEditMode ? "pointer" : isResizeMode ? "se-resize" : "default",
        boxSizing: "border-box",
        zIndex: isEditMode || isResizeMode ? 9999 : "auto",
        overflow: "visible",
        width: typeof size.width === "number" ? `${size.width}px` : size.width,
        height:
          size.height === "auto"
            ? "auto"
            : typeof size.height === "number"
            ? `${size.height}px`
            : size.height,
        // ✅ 크기조절 모드에서만 카드 테두리 표시
        border: "none",
borderRadius: "0",
        transition: "border 0.2s ease",
        ...style,
      }}
      data-file={filePath || import.meta.url || "unknown"}
      data-component={componentName || "EditableImage"}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      onClick={handleClick}
      onMouseDown={handleMouseDown}
      onContextMenu={handleContextMenu}
    >
      {/* ✅ 이미지 본체 */}
      <img
        src={imageSrc}
        alt={alt || ""}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          opacity: isResizeMode && isHovering ? 0.85 : 1,
          transition: "opacity 0.2s ease",
          userSelect: "none",
          pointerEvents: "none",
          display: "block",
          borderRadius: "inherit",
        }}
        draggable={false}
        onError={(e) => (e.target.src = defaultSrc)}
      />

      {/* ✅ 저장됨 표시 */}
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
            zIndex: 10,
          }}
        >
          ✔ 저장됨
        </span>
      )}

      {/* ✅ 크기조절 모드일 때 안내 */}
      {isResizeMode && isHovering && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.25)",
            color: "#fff",
            fontSize: "0.9em",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            textAlign: "center",
            fontWeight: "bold",
            pointerEvents: "none",
            zIndex: 6,
            borderRadius: "inherit",
          }}
        >
          우클릭 + 드래그 : 크기 조절
        </div>
      )}

      {/* ✅ 디자인모드일 때는 오버레이만 (점선 ❌) */}
      {isEditMode && isHovering && !isResizeMode && (
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
            pointerEvents: "none",
            zIndex: 6,
            borderRadius: "inherit",
          }}
        >
          클릭: 이미지 교체 <br />
          우클릭: URL 입력
        </div>
      )}

      {/* ✅ 파일 업로드 input */}
      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        style={{ display: "none" }}
        onChange={handleFileChange}
      />
    </div>
  );
}
