// src/lib/api.js
import axios from "axios";

// 환경변수에서 API 주소 불러오기
// 배포할 때는 Vercel/Netlify 환경변수에 VITE_API_URL을 넣으면 됨
const API_URL = import.meta.env.VITE_API_URL || "https://shop-backend-1-dfsl.onrender.com/api";

const api = axios.create({
  baseURL: API_URL,
});

export default api;
