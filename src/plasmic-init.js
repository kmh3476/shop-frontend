// 📁 src/plasmic-init.js
import { initPlasmicLoader } from "@plasmicapp/loader-react";

// ✅ Plasmic 프로젝트 연결 설정
export const PLASMIC = initPlasmicLoader({
  projects: [
    {
      id: "qKCnDrnBdLnY5FSxmB1L78", // ⚙️ Plasmic project ID
      token: "iy6qjhvt72GlSqU1Gn4VgspAEqSL5uXyLVddK89ARIygTVZpCnbGhtjDWoya5mT0gSw2c9avT2NB3BlqH78hw", // ⚙️ 비워도 됨 (public project면)
    },
  ],
});
