// src/components/ImageModal.jsx
import { X } from "lucide-react";

export default function ImageModal({ imageUrl, onClose }) {
  if (!imageUrl) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50"
      onClick={onClose}
    >
      <div
        className="relative max-w-[90vw] max-h-[90vh] flex justify-center items-center"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={imageUrl}
          alt="Product"
          className="max-w-full max-h-full rounded-lg shadow-lg"
        />
        <button
          className="absolute top-2 right-2 text-white bg-black bg-opacity-50 rounded-full p-2 hover:bg-opacity-70 transition"
          onClick={onClose}
        >
          <X size={24} />
        </button>
      </div>
    </div>
  );
}
