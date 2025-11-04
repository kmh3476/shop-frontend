// 📁 src/components/EditableImage.jsx
import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import { useEditMode } from "../context/EditModeContext";

/**
 * ✅ 동작 개요
 * - 디자인 모드 ✏ : 클릭 시 이미지 교체 / 우클릭 시 URL 입력
 * - 크기조절 모드 📐 : 우클릭 드래그로 크기 조절
 * - Cloudinary 업로드 / blob URL 정리 추가
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
  const [previewUrl, setPreviewUrl] = useState(null); // ✅ blob 프리뷰 관리용
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

  /** ✅ 파일 업로드 (Cloudinary 적용) */
  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // ✅ blob 미리보기 생성
    const tempPreview = URL.createObjectURL(file);
    setPreviewUrl(tempPreview);
    setImageSrc(tempPreview);

    try {
      const formData = new FormData();
      formData.append("image", file);

      const { data } = await axios.post(
        "https://shop-backend-1-dfsl.onrender.com/api/upload",
        formData
      );

      if (data?.imageUrl) {
        // ✅ Cloudinary URL 적용
        setImageSrc(data.imageUrl);
        saveImageData(data.imageUrl);
      } else {
        console.warn("⚠️ 업로드 결과에 imageUrl이 없습니다:", data);
      }
    } catch (err) {
      console.error("❌ 이미지 업로드 실패:", err);
      alert("이미지 업로드 중 오류가 발생했습니다.");
    } finally {
      // ✅ blob URL 정리
      if (tempPreview.startsWith("blob:")) {
        URL.revokeObjectURL(tempPreview);
        setPreviewUrl(null);
      }
      e.target.value = "";
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
  /** ✅ 마우스 이동 / 업로드 종료 시 크기조절 종료 */
  useEffect(() => {
    if (!resizing) return;

    const handleMouseMove = (e) => {
      const dx = e.clientX - startPos.current.x;
      const dy = e.clientY - startPos.current.y;
      const newWidth = Math.max(50, startPos.current.width + dx);
      const newHeight = Math.max(50, startPos.current.height + dy);
      const updated = { width: newWidth, height: newHeight };
      setSize(updated);
      saveSizeData(updated);
    };

    const handleMouseUp = () => {
      setResizing(false);
      document.body.style.cursor = "auto";
      document.body.style.userSelect = "auto";
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [resizing]);

  /** ✅ Blob URL 정리 (unmount 시점) */
  useEffect(() => {
    return () => {
      if (previewUrl && previewUrl.startsWith("blob:")) {
        try {
          URL.revokeObjectURL(previewUrl);
          console.log("🧹 Blob URL 정리 완료:", previewUrl);
        } catch (err) {
          console.warn("⚠️ Blob 정리 중 오류:", err);
        }
      }
    };
  }, [previewUrl]);

  /** ✅ hover 상태 시 시각적 표시 */
  const overlayStyle = {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    background: isEditMode
      ? "rgba(0,0,0,0.3)"
      : "rgba(0,0,0,0)",
    color: "white",
    display: isHovering && isEditMode ? "flex" : "none",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "1rem",
    fontWeight: "500",
    transition: "all 0.2s ease",
    borderRadius: "0.5rem",
  };

  return (
    <div
      style={{
        position: "relative",
        width:
          typeof size.width === "number" ? `${size.width}px` : size.width,
        height:
          typeof size.height === "number"
            ? `${size.height}px`
            : size.height,
        overflow: "hidden",
        border:
          isResizeMode && !isEditMode
            ? "2px dashed #4a90e2"
            : "none",
        borderRadius: "0.5rem",
        cursor: isResizeMode
          ? "se-resize"
          : isEditMode
          ? "pointer"
          : "default",
        ...style,
      }}
      onClick={handleClick}
      onContextMenu={handleContextMenu}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      onMouseDown={handleMouseDown}
    >
      <img
        src={imageSrc}
        alt={alt || "EditableImage"}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          display: "block",
          borderRadius: "0.5rem",
          pointerEvents: "none",
        }}
        onError={(e) => {
          e.target.src = "/fallback.jpg";
        }}
      />

      {isEditMode && (
        <div style={overlayStyle}>
          <span>이미지 변경</span>
        </div>
      )}

      {/* ✅ 저장 알림 표시 */}
      {saved && (
        <div
          style={{
            position: "absolute",
            bottom: "8px",
            right: "8px",
            background: "rgba(0,0,0,0.6)",
            color: "#fff",
            padding: "4px 8px",
            borderRadius: "4px",
            fontSize: "0.8rem",
          }}
        >
          ✅ 저장됨
        </div>
      )}

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
