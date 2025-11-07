import Quill from "quill";

export default class BlotFormatter {
  constructor(quill, options = {}) {
    this.quill = quill;
    this.options = options;
    this.overlay = null;

    this.quill.root.addEventListener("click", (e) => {
      const img = e.target && e.target.tagName === "IMG" ? e.target : null;
      if (img) this.showOverlay(img);
      else this.hideOverlay();
    });
  }

  showOverlay(img) {
    this.hideOverlay();

    const rect = img.getBoundingClientRect();
    const parentRect = this.quill.root.getBoundingClientRect();

    this.overlay = document.createElement("div");
    Object.assign(this.overlay.style, {
      position: "absolute",
      border: "2px dashed #3b82f6",
      top: `${rect.top - parentRect.top + this.quill.root.scrollTop}px`,
      left: `${rect.left - parentRect.left + this.quill.root.scrollLeft}px`,
      width: `${rect.width}px`,
      height: `${rect.height}px`,
      pointerEvents: "none",
      zIndex: 10,
    });

    this.quill.root.parentElement.appendChild(this.overlay);
  }

  hideOverlay() {
    if (this.overlay) {
      this.overlay.remove();
      this.overlay = null;
    }
  }
}
