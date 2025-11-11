import axios from "axios";
import i18next from "i18next";

/* -------------------------------------------------
✅ 1. 언어 자동 설정
-------------------------------------------------- */
const getCurrentLng = () => {
  const raw = i18next?.language || localStorage.getItem("i18nextLng") || "th";
  return raw.split("-")[0];
};

// 초기 설정
axios.defaults.headers.common["Accept-Language"] = getCurrentLng();

// 언어 변경 시 즉시 반영
i18next.on("languageChanged", (lng) => {
  axios.defaults.headers.common["Accept-Language"] = (lng || "th").split("-")[0];
});

// 요청 직전 인터셉터 (항상 최신 언어 반영)
axios.interceptors.request.use((config) => {
  config.headers = config.headers || {};
  config.headers["Accept-Language"] = getCurrentLng();
  return config;
});

/* -------------------------------------------------
✅ 2. API URL 설정
-------------------------------------------------- */
const API_URL =
  import.meta.env.VITE_API_URL || "https://shop-backend-1-dfsl.onrender.com";

/* -------------------------------------------------
✅ 3. API 함수들
-------------------------------------------------- */

// ✅ 아이디 / 닉네임 / 이메일 중복 확인
export const checkDuplicate = async (data) => {
  const res = await axios.post(`${API_URL}/api/auth/check-id`, data);
  return res.data;
};

// ✅ 이메일 인증 코드 전송
export const sendEmailCode = async (email) => {
  try {
    const res = await axios.post(`${API_URL}/api/auth/send-email-code`, { email });
    alert(res.data.i18n?.text || res.data.message || i18next.t("authapi.email_sent"));
    return res.data;
  } catch (err) {
    console.error("이메일 코드 전송 오류:", err);
    alert(i18next.t("authapi.email_send_failed"));
    throw err;
  }
};

// ✅ 이메일 인증 코드 검증
export const verifyEmailCode = async (email, code) => {
  try {
    const res = await axios.post(`${API_URL}/api/auth/verify-email-code`, { email, code });
    alert(res.data.i18n?.text || res.data.message || i18next.t("authapi.email_verified"));
    return res.data;
  } catch (err) {
    console.error("이메일 인증 코드 오류:", err);
    alert(i18next.t("authapi.email_verify_failed"));
    throw err;
  }
};

// ✅ 회원가입
export const signup = async (userData) => {
  try {
    const res = await axios.post(`${API_URL}/api/auth/signup`, userData);
    alert(res.data.i18n?.text || res.data.message || i18next.t("authapi.signup_success"));
    return res.data;
  } catch (err) {
    console.error("회원가입 오류:", err);
    alert(i18next.t("authapi.signup_error"));
    throw err;
  }
};

// ✅ 로그인
export const login = async (loginData) => {
  try {
    const res = await axios.post(`${API_URL}/api/auth/login`, loginData);
    alert(res.data.i18n?.text || res.data.message || i18next.t("authapi.login_success"));
    localStorage.setItem("token", res.data.token);
    localStorage.setItem("refreshToken", res.data.refreshToken);
    return res.data;
  } catch (err) {
    console.error("로그인 오류:", err);
    alert(i18next.t("authapi.login_failed"));
    throw err;
  }
};

// ✅ 토큰 갱신
export const refreshAccessToken = async (refreshToken) => {
  try {
    const res = await axios.post(`${API_URL}/api/auth/refresh`, { refreshToken });
    localStorage.setItem("token", res.data.token);
    return res.data.token;
  } catch (err) {
    console.error("토큰 갱신 실패:", err);
    alert(i18next.t("authapi.refresh_failed"));
    throw err;
  }
};

// ✅ 로그아웃
export const logout = async () => {
  try {
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    alert(i18next.t("authapi.logout_done"));
  } catch (err) {
    console.error("로그아웃 오류:", err);
    alert(i18next.t("authapi.logout_failed"));
  }
};

// ✅ 프로필 조회
export const getProfile = async () => {
  try {
    const token = localStorage.getItem("token");
    const res = await axios.get(`${API_URL}/api/auth/profile`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (err) {
    console.error("프로필 불러오기 실패:", err);
    alert(i18next.t("authapi.profile_failed"));
    throw err;
  }
};

// ✅ 관리자 확인
export const checkAdmin = async () => {
  try {
    const token = localStorage.getItem("token");
    const res = await axios.get(`${API_URL}/api/auth/admin`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data.isAdmin;
  } catch (err) {
    console.error("관리자 확인 실패:", err);
    alert(i18next.t("authapi.admin_check_failed"));
    return false;
  }
};
