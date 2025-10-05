import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.PROD
    ? "https://shop-backend-1-dfsl.onrender.com/api" // 🔹 Render 배포 서버
    : "http://localhost:4000/api", // 🔹 로컬
});

export default api;