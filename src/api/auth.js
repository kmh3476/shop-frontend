// src/api/auth.js
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export const loginUser = async (email, password) => {
  const res = await axios.post(`${API_URL}/auth/login`, { email, password });
  localStorage.setItem("token", res.data.token);
  return res.data;
};

export const registerUser = async (email, password) => {
  const res = await axios.post(`${API_URL}/auth/register`, { email, password });
  return res.data;
};
