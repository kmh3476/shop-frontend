// 📁 vite.config.js
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "VITE_");

  return {
    plugins: [react()],
    base: "./", // ✅ 상대경로 — Vercel 정적 배포 시 필수

    server: {
      host: "localhost",
      port: 5173,
      open: true,
      historyApiFallback: true, // SPA 라우팅
      fs: { strict: false },
      hmr: {
        overlay: true,
        protocol: "ws",
        host: "localhost",
        clientPort: 5173,
      },
      cors: {
        origin: [
          "http://localhost:5173",
          "https://project-onyou.vercel.app",
          "https://shop-backend-1-dfsl.onrender.com",
        ],
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"],
        credentials: true,
      },
      proxy: {
        "/api": {
          target:
            env.VITE_API_BASE_URL ||
            "https://shop-backend-1-dfsl.onrender.com",
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/^\/api/, "/api"),
        },
        "/cms": {
          target: env.VITE_STRAPI_URL || "http://localhost:1337",
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/^\/cms/, ""),
        },
      },
    },

    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },

    // ✅ React-Quill / Quill 관련 안정 구성
    optimizeDeps: {
      include: ["react-quill", "@enzedonline/quill-blot-formatter2"],
      exclude: ["quill", "quill-image-resize-module", "quill-image-resize-module-fixed"],
    },

    ssr: {
      noExternal: [
        "react-quill",
        "quill",
        "quill-image-resize-module-fixed",
        "@enzedonline/quill-blot-formatter2",
      ],
    },

    build: {
      outDir: "dist",
      assetsDir: "assets",
      chunkSizeWarningLimit: 1500,
      rollupOptions: {
        external: [],
        output: {
          manualChunks: undefined,
        },
      },
      commonjsOptions: {
        include: [/node_modules/],
      },
      // ✅ HTML fallback 지원 (MIME 오류 방지)
      emptyOutDir: true,
    },

    define: {
      "import.meta.env.VITE_API_BASE_URL": JSON.stringify(
        env.VITE_API_BASE_URL ||
          "https://shop-backend-1-dfsl.onrender.com/api"
      ),
      "import.meta.env.VITE_STRAPI_URL": JSON.stringify(
        env.VITE_STRAPI_URL || "http://localhost:1337"
      ),
      "import.meta.env.VITE_STRAPI_TOKEN": JSON.stringify(
        env.VITE_STRAPI_TOKEN || ""
      ),
      "import.meta.env.VITE_BUILDER_PUBLIC_API_KEY": JSON.stringify(
        env.VITE_BUILDER_PUBLIC_API_KEY || ""
      ),
      "import.meta.env.VITE_BUILDER_API_URL": JSON.stringify(
        env.VITE_BUILDER_API_URL || "https://cdn.builder.io/api/v3"
      ),
      "import.meta.env.VITE_BUILDER_MODEL": JSON.stringify(
        env.VITE_BUILDER_MODEL || "page"
      ),
      "import.meta.env.VITE_BUILDER_PREVIEW": JSON.stringify(
        env.VITE_BUILDER_PREVIEW || "true"
      ),
      "import.meta.env.VITE_ENV": JSON.stringify(
        process.env.VERCEL ? "production" : env.VITE_ENV || mode
      ),
      "import.meta.env.IS_VERCEL": JSON.stringify(!!process.env.VERCEL),
    },
  };
});
