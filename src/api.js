import axios from "axios";

// 백엔드 서버 주소 (로컬일 때는 http://localhost:4000/api)
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

export default api;
