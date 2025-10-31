// 📁 vite.config.js
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "VITE_");

  return {
    plugins: [react()],
    base: "./", // ✅ Vercel 정적 배포용 상대 경로 설정

    server: {
      host: "localhost",
      port: 5173,
      open: true,
      historyApiFallback: true, // ✅ SPA 라우팅 fallback 보장

      // ✅ 파일 시스템 접근 완화
      fs: {
        strict: false,
      },

      // ✅ HMR 안정화 (Vercel dev 환경에서도 오류 방지)
      hmr: {
        overlay: true, // 오류 발생 시 브라우저 오버레이 표시
        protocol: "ws",
        host: "localhost",
        clientPort: 5173,
      },

      // ✅ CORS 설정 (백엔드 Render + 로컬 둘 다 허용)
      cors: {
        origin: [
          "http://localhost:5173",
          "https://project-onyou.vercel.app",
          "https://shop-backend-1-dfsl.onrender.com"
        ],
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"],
        credentials: true,
      },

      // ✅ 백엔드 프록시 (Render 서버)
      proxy: {
        "/api": {
          target:
            env.VITE_API_BASE_URL ||
            "https://shop-backend-1-dfsl.onrender.com",
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/^\/api/, "/api"),
        },

        // ✅ Strapi CMS API 프록시 (선택적으로 유지)
        "/cms": {
          target: env.VITE_STRAPI_URL || "http://localhost:1337",
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/^\/cms/, ""),
        },
      },
    },

    // ✅ 별칭 설정 (import 경로 간결화)
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },

    // ✅ 빌드 옵션 (Vercel 환경 최적화)
    build: {
      outDir: "dist",
      assetsDir: "assets",
      chunkSizeWarningLimit: 1500,
      rollupOptions: {
        output: {
          manualChunks: undefined, // ✅ 빌드 크기 균형 유지
        },
      },
    },

    define: {
      // ✅ API 기본 경로 (Render 백엔드)
      "import.meta.env.VITE_API_BASE_URL": JSON.stringify(
        env.VITE_API_BASE_URL ||
          "https://shop-backend-1-dfsl.onrender.com/api"
      ),

      // ✅ CMS 관련
      "import.meta.env.VITE_STRAPI_URL": JSON.stringify(
        env.VITE_STRAPI_URL || "http://localhost:1337"
      ),
      "import.meta.env.VITE_STRAPI_TOKEN": JSON.stringify(
        env.VITE_STRAPI_TOKEN || ""
      ),

      // ✅ Builder.io 관련
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

      // ✅ 환경 자동 감지 (로컬 / Vercel)
      "import.meta.env.VITE_ENV": JSON.stringify(
        process.env.VERCEL ? "production" : env.VITE_ENV || mode
      ),

      // ✅ 빌드 시점에 Vercel 여부 감지용 변수
      "import.meta.env.IS_VERCEL": JSON.stringify(!!process.env.VERCEL),
    },
  };
});
