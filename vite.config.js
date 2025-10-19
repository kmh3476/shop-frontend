import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // ✅ .env 파일 로드 (VITE_ 로 시작하는 값만 자동으로 주입됨)
  const env = loadEnv(mode, process.cwd(), "VITE_");

  return {
    plugins: [react()],

    // ✅ 배포 시 루트 경로 (Vercel 같은 정적 호스팅 환경)
    base: "./",

    // ✅ 개발 서버 설정
    server: {
      host: "0.0.0.0", // 로컬 네트워크에서 접근 가능하게 함 (선택)
      port: 5173,      // 기본 포트
      open: true,      // 자동으로 브라우저 열기
    },

    // ✅ 전역 환경변수 주입 (필요한 경우 직접 접근 가능)
    define: {
      "import.meta.env.VITE_API_BASE_URL": JSON.stringify(env.VITE_API_BASE_URL),
      "import.meta.env.VITE_STRAPI_URL": JSON.stringify(env.VITE_STRAPI_URL),
    },
  };
});
