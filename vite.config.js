// 📁 vite.config.js
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "VITE_");

  return {
    plugins: [react()],
    base: "./",

    server: {
      host: "localhost",
      port: 5173,
      open: true,
      historyApiFallback: true,

      // ✅ 파일 시스템 접근 완화
      fs: {
        strict: false,
      },

      // ⚠️ HMR은 완전 비활성화 금지 — 대신 안정화 설정
      hmr: {
        overlay: true, // 오류 발생 시 브라우저 오버레이 표시
        protocol: "ws",
        host: "localhost",
      },
      
      // ✅ CORS 설정
      cors: {
        origin: "*",
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"],
      },

      // ✅ 백엔드 프록시 (Render API 서버 연결)
      proxy: {
        "/api": {
          target:
            env.VITE_API_BASE_URL ||
            "https://shop-backend-1-dfsl.onrender.com",
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/^\/api/, "/api"),
        },

        // ✅ Strapi CMS API 프록시 (필요 시 유지)
        "/cms": {
          target: "http://localhost:1337",
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/^\/cms/, ""),
        },
      },
    },

    // ✅ Vite 빌드 경로 및 별칭 설정
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },

    // ✅ 빌드 옵션 (Vercel과 호환성 강화)
    build: {
      outDir: "dist",
      assetsDir: "assets",
      chunkSizeWarningLimit: 1500,
    },

    define: {
      // ✅ API 기본 경로 (Render 백엔드)
      "import.meta.env.VITE_API_BASE_URL": JSON.stringify(
        env.VITE_API_BASE_URL ||
          "https://shop-backend-1-dfsl.onrender.com/api"
      ),

      // ✅ Strapi CMS 관련 환경변수
      "import.meta.env.VITE_STRAPI_URL": JSON.stringify(
        env.VITE_STRAPI_URL || "http://localhost:1337"
      ),
      "import.meta.env.VITE_STRAPI_TOKEN": JSON.stringify(
        env.VITE_STRAPI_TOKEN || ""
      ),

      // ✅ Builder.io 관련 환경변수
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

      // ✅ Vercel / 로컬 환경 자동 감지
      "import.meta.env.VITE_ENV": JSON.stringify(
        env.VITE_ENV || mode || "development"
      ),
    },
  };
});
