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
 * 이미지 업로드 / URL 변경 / 크기 조절 (편집 모드에서만) 가능.
 * 모든 데이터는 로컬스토리지에 저장됨.
 */
export default function EditableImage({
  id,
  defaultSrc,
  alt,
  filePath,
  componentName,
  style = {},
}) {
  const { isEditMode, saveEditLog } = useEditMode();

  // ✅ 이미지 저장/복원
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

  // ✅ 이미지 크기 저장/복원
  const [size, setSize] = useState(() => {
    const savedSize = localStorage.getItem(`editable-image-size-${id}`);
    return savedSize ? JSON.parse(savedSize) : { width: 100, height: "auto" };
  });

  const [saved, setSaved] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [resizing, setResizing] = useState(false);
  const fileInputRef = useRef(null);
  const startPos = useRef({ x: 0, y: 0, width: 0, height: 0 });

  /** ✅ 이미지 및 메타데이터 저장 */
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

      console.log(`✅ 로컬에 이미지 저장됨: ${id}`, saveData);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error("❌ 로컬스토리지 이미지 저장 실패:", err);
    }
  };

  /** ✅ 크기 저장 */
  const saveSizeData = (newSize) => {
    localStorage.setItem(`editable-image-size-${id}`, JSON.stringify(newSize));
  };

  /** ✅ 이미지 클릭 → 파일 선택 */
  const handleClick = () => {
    if (!isEditMode) return;
    fileInputRef.current?.click();
  };

  /** ✅ 이미지 업로드 */
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const newSrc = reader.result;
        setImageSrc(newSrc);
        saveImageData(newSrc);
        e.target.value = ""; // 같은 파일 재선택 시도 시에도 동작하게 함
      };
      reader.readAsDataURL(file);
    }
  };

  /** ✅ 우클릭 시 URL 직접 입력 */
  const handleContextMenu = (e) => {
    if (!isEditMode) return;
    e.preventDefault();
    const newUrl = prompt("이미지 URL을 입력하세요:", imageSrc);
    if (newUrl && newUrl.trim()) {
      setImageSrc(newUrl.trim());
      saveImageData(newUrl.trim());
    }
  };

  /** ✅ 우클릭으로 크기 조절 시작 */
  const handleMouseDown = (e) => {
    if (!isEditMode) return;
    if (e.button !== 2) return; // ✅ 오른쪽 클릭만 허용
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

  /** ✅ 크기 조절 중 */
  const handleMouseMove = (e) => {
    if (!resizing) return;
    const dx = e.clientX - startPos.current.x;
    const dy = e.clientY - startPos.current.y;
    const newWidth = Math.max(50, startPos.current.width + dx);
    const newHeight =
      startPos.current.height === "auto"
        ? "auto"
        : Math.max(50, startPos.current.height + dy);

    const updated = { width: newWidth, height: newHeight };
    setSize(updated);
  };

  /** ✅ 크기 조절 종료 */
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

  /** ✅ 편집모드일 때 우클릭 메뉴 막기 */
  useEffect(() => {
    const handleContextMenu = (e) => {
      if (isEditMode) e.preventDefault();
    };
    window.addEventListener("contextmenu", handleContextMenu);
    return () => window.removeEventListener("contextmenu", handleContextMenu);
  }, [isEditMode]);

  return (
    <div
      style={{
        position: "relative",
        display: "inline-block",
        cursor: isEditMode ? "pointer" : "default",
        boxSizing: "border-box",
        zIndex: isEditMode ? 9999 : "auto",
        overflow: "visible",
        width: typeof size.width === "number" ? `${size.width}px` : size.width,
        height:
          size.height === "auto"
            ? "auto"
            : typeof size.height === "number"
            ? `${size.height}px`
            : size.height,
        ...style,
      }}
      data-file={filePath || import.meta.url || "unknown"}
      data-component={componentName || "EditableImage"}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      onClick={handleClick}
      onContextMenu={handleContextMenu}
      onMouseDown={handleMouseDown}
    >
      {/* ✅ 실제 이미지 */}
      <img
        src={imageSrc}
        alt={alt || ""}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          opacity: isEditMode && isHovering ? 0.85 : 1,
          transition: "opacity 0.2s ease",
          userSelect: "none",
          pointerEvents: "none",
          display: "block",
        }}
        draggable={false}
        onError={(e) => (e.target.src = defaultSrc)}
      />

      {/* ✅ 점선 border를 이미지 위에 올림 */}
      {isEditMode && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            border: "2px dashed rgba(59,130,246,0.9)",
            borderRadius: "8px",
            pointerEvents: "none",
            zIndex: 5, // ✅ 이미지보다 위
          }}
        />
      )}

      {/* ✅ 파일 선택 input */}
      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        style={{ display: "none" }}
        onChange={handleFileChange}
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

      {/* ✅ 편집 모드 안내 오버레이 */}
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
            pointerEvents: "none",
            zIndex: 6,
          }}
        >
          클릭: 이미지 교체 <br />
          우클릭: URL 입력 <br />
          우클릭 + 드래그: 크기 조절
        </div>
      )}
    </div>
  );
}
