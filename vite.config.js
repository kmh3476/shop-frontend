import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],

  // ✅ 배포 시 루트 경로 (Vercel 같은 정적 호스팅 환경)
  base: "./",

  // ✅ 개발 서버 설정
  server: {
    host: "0.0.0.0", // 로컬 네트워크에서 접근 가능하게 함 (선택)
    port: 5173,      // 기본 포트
    open: true,      // 자동으로 브라우저 열기
  },
});
