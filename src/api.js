// src/lib/api.js
import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:4000/api", // ✅ /api 추가!
});

export default api;
