// ✅ shop-frontend/src/lib/api.js
import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:4000/api", // 👈 여기 중요
});

export default api;