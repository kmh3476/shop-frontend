import axios from "axios";

const api = axios.create({
  baseURL: "https://shop-backend-1-dfsl.onrender.com/api", // Render 백엔드 주소
});

export default api;
