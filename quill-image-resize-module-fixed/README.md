
# quill-image-resize-module-fixed

Minimal, **Vite/ESM-safe** image resize module for **Quill 1.3.x** (works great with `react-quill@2.x`).  
No reliance on `window.Quill` or `Quill.imports` at evaluation time, so it avoids the classic
`Cannot read properties of undefined (reading 'imports')` and `Class extends value undefined` errors.

## Usage

```js
import Quill from "quill";
import ImageResize from "quill-image-resize-module-fixed";

Quill.register("modules/imageResize", ImageResize);

const modules = {
  toolbar: [...],
  imageResize: { displaySize: true }
};
```

## Notes
- Resizes by changing the `<img>` width style in pixels and keeps aspect ratio.
- Provides 4 corner handles (nw, ne, sw, se) and a size label.
- Designed for Quill 1.3.x only.
