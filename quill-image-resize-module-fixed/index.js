
/**
 * quill-image-resize-module-fixed
 * ESM-safe, Vite-safe, Quill 1.3.x compatible.
 * Minimal feature set: corner handles to resize <img> width (px), optional display size.
 * No use of window.Quill or Quill.imports at module eval time.
 */

const DEFAULTS = {
  displaySize: true,
  minWidth: 20,
  maxWidth: 4096,
  handles: ['nw', 'ne', 'sw', 'se']
};

function createEl(tag, className, parent) {
  const el = document.createElement(tag);
  if (className) el.className = className;
  if (parent) parent.appendChild(el);
  return el;
}

export default class ImageResize {
  constructor(quill, options = {}) {
    this.quill = quill;
    this.options = Object.assign({}, DEFAULTS, options);
    this.box = null;
    this.img = null;
    this.drag = null;

    // Bind
    this.onClick = this.onClick.bind(this);
    this.onScroll = this.onScroll.bind(this);
    this.onKeydown = this.onKeydown.bind(this);
    this.handleMousedown = this.handleMousedown.bind(this);
    this.handleMousemove = this.handleMousemove.bind(this);
    this.handleMouseup = this.handleMouseup.bind(this);

    // Events
    this.quill.root.addEventListener('click', this.onClick);
    this.quill.root.addEventListener('scroll', this.onScroll, true);
    document.addEventListener('keydown', this.onKeydown);
  }

  destroy() {
    this.hide();
    this.quill.root.removeEventListener('click', this.onClick);
    this.quill.root.removeEventListener('scroll', this.onScroll, true);
    document.removeEventListener('keydown', this.onKeydown);
  }

  onKeydown(e) {
    if (e.key === 'Escape') this.hide();
  }

  onScroll() {
    if (this.box) this.reposition();
  }

  onClick(e) {
    const img = e.target && e.target.tagName === 'IMG' ? e.target : null;
    if (img) {
      if (this.img !== img) this.show(img);
    } else if (this.box && !this.box.contains(e.target)) {
      this.hide();
    }
  }

  show(img) {
    this.hide();
    this.img = img;

    const parent = this.quill.root.parentElement || document.body;
    this.box = createEl('div', 'qirmf-box', parent);

    // outline
    const outline = createEl('div', 'qirmf-outline', this.box);

    // handles
    this.handles = {};
    (this.options.handles || []).forEach(pos => {
      const h = createEl('div', `qirmf-handle qirmf-${pos}`, this.box);
      h.dataset.pos = pos;
      h.addEventListener('mousedown', this.handleMousedown);
      this.handles[pos] = h;
    });

    // size label
    if (this.options.displaySize) {
      this.sizeLabel = createEl('div', 'qirmf-size', this.box);
    }

    this.reposition();
  }

  hide() {
    if (this.box) {
      Object.values(this.handles || {}).forEach(h => {
        h.removeEventListener('mousedown', this.handleMousedown);
      });
      this.box.remove();
      this.box = null;
      this.handles = null;
      this.sizeLabel = null;
    }
    this.img = null;
    this.drag = null;
    document.removeEventListener('mousemove', this.handleMousemove);
    document.removeEventListener('mouseup', this.handleMouseup);
  }

  getRect() {
    return this.img ? this.img.getBoundingClientRect() : null;
  }

  reposition() {
    if (!this.box || !this.img) return;
    const r = this.getRect();
    const host = this.quill.root.getBoundingClientRect();
    const top = r.top - host.top + this.quill.root.scrollTop;
    const left = r.left - host.left + this.quill.root.scrollLeft;

    Object.assign(this.box.style, {
      position: 'absolute',
      top: `${top - 2}px`,
      left: `${left - 2}px`,
      width: `${r.width + 4}px`,
      height: `${r.height + 4}px`,
      pointerEvents: 'none',
      zIndex: 10,
    });

    if (this.sizeLabel) {
      this.sizeLabel.textContent = `${Math.round(r.width)} × ${Math.round(r.height)}`;
    }
  }

  handleMousedown(e) {
    e.preventDefault();
    e.stopPropagation();
    if (!this.img) return;
    const rect = this.getRect();
    this.drag = {
      pos: e.currentTarget.dataset.pos,
      startX: e.clientX,
      startY: e.clientY,
      startW: rect.width,
      startH: rect.height,
    };
    document.addEventListener('mousemove', this.handleMousemove);
    document.addEventListener('mouseup', this.handleMouseup);
    // enable pointer events to capture during drag
    this.box.style.pointerEvents = 'auto';
  }

  handleMousemove(e) {
    if (!this.drag || !this.img) return;
    const dx = e.clientX - this.drag.startX;
    const dy = e.clientY - this.drag.startY;

    let newW = this.drag.startW;
    let newH = this.drag.startH;

    // simple aspect ratio preserve by width only
    const ratio = this.drag.startW / this.drag.startH || 1;

    switch (this.drag.pos) {
      case 'ne':
        newW = this.drag.startW + dx;
        newH = newW / ratio;
        break;
      case 'se':
        newW = this.drag.startW + dx;
        newH = newW / ratio;
        break;
      case 'nw':
        newW = this.drag.startW - dx;
        newH = newW / ratio;
        break;
      case 'sw':
        newW = this.drag.startW - dx;
        newH = newW / ratio;
        break;
    }

    newW = Math.max(this.options.minWidth, Math.min(this.options.maxWidth, newW));
    this.img.style.width = `${Math.round(newW)}px`;
    this.img.style.height = 'auto';

    this.reposition();
  }

  handleMouseup() {
    this.box.style.pointerEvents = 'none';
    document.removeEventListener('mousemove', this.handleMousemove);
    document.removeEventListener('mouseup', this.handleMouseup);
    this.drag = null;
    // notify quill of change
    if (this.img) {
      const blot = this.quill.scroll.find(this.img);
      if (blot && blot.domNode) {
        this.quill.update('silent');
      }
    }
  }
}

// Minimal styles injected once
(function ensureStyles(){
  if (typeof document === 'undefined') return;
  if (document.getElementById('qirmf-styles')) return;
  const css = `
    .qirmf-box{box-sizing:border-box;border:2px solid #3b82f6;position:absolute}
    .qirmf-outline{position:absolute;top:0;left:0;right:0;bottom:0;border:1px dashed #3b82f666;pointer-events:none}
    .qirmf-handle{width:10px;height:10px;background:#3b82f6;border:2px solid #fff;border-radius:50%;position:absolute;pointer-events:auto;cursor:nwse-resize}
    .qirmf-nw{top:-6px;left:-6px;cursor:nwse-resize}
    .qirmf-ne{top:-6px;right:-6px;cursor:nesw-resize}
    .qirmf-sw{bottom:-6px;left:-6px;cursor:nesw-resize}
    .qirmf-se{bottom:-6px;right:-6px;cursor:nwse-resize}
    .qirmf-size{position:absolute;left:0;top:-22px;background:#111;color:#fff;font:12px/1.6 monospace;padding:2px 6px;border-radius:4px;pointer-events:none}
  `;
  const style = document.createElement('style');
  style.id = 'qirmf-styles';
  style.textContent = css;
  document.head.appendChild(style);
})();
