// 📁 src/api/authapi.js
import axios from "axios";
import i18next from "i18next"; // ✅ 번역기 import

const API_URL =
  import.meta.env.VITE_API_URL || "https://shop-backend-1-dfsl.onrender.com";

// ✅ 기본 언어가 비어 있으면 태국어로 설정
if (!localStorage.getItem("i18nextLng")) {
  localStorage.setItem("i18nextLng", "th");
}

// ✅ i18n 초기화가 끝날 때까지 기다리는 헬퍼
async function waitForI18n() {
  if (i18next.isInitialized) return;
  await new Promise((resolve) => {
    i18next.on("initialized", () => resolve());
  });
  console.log("🌐 현재 언어:", i18next.language);
}

// ✅ 회원가입
export const signup = async (userData) => {
  await waitForI18n();
  try {
    const res = await axios.post(`${API_URL}/api/auth/signup`, userData);
    alert(i18next.t("authapi.signup_success"));
    return res.data;
  } catch (err) {
    alert(i18next.t("authapi.signup_error"));
    throw err;
  }
};

// ✅ 로그인
export const login = async (email, password) => {
  await waitForI18n();
  try {
    const res = await axios.post(`${API_URL}/api/auth/login`, { email, password });
    alert(i18next.t("authapi.login_success"));
    localStorage.setItem("token", res.data.token);
    localStorage.setItem("refreshToken", res.data.refreshToken);
    return res.data;
  } catch (err) {
    alert(i18next.t("authapi.login_failed"));
    throw err;
  }
};

// ✅ 로그아웃
export const logout = async () => {
  await waitForI18n();
  try {
    const refreshToken = localStorage.getItem("refreshToken");
    await axios.post(`${API_URL}/api/auth/logout`, { refreshToken });
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    alert(i18next.t("authapi.logout_done"));
  } catch {
    alert(i18next.t("authapi.logout_failed"));
  }
};

// ✅ 토큰 갱신
export const refreshAccessToken = async () => {
  await waitForI18n();
  try {
    const refreshToken = localStorage.getItem("refreshToken");
    const res = await axios.post(`${API_URL}/api/auth/refresh`, { refreshToken });
    const { token } = res.data;
    if (token) localStorage.setItem("token", token);
    return token;
  } catch {
    alert(i18next.t("authapi.refresh_failed"));
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    return null;
  }
};

// ✅ 프로필 조회
export const getProfile = async () => {
  await waitForI18n();
  try {
    const token = localStorage.getItem("token");
    const res = await axios.get(`${API_URL}/api/auth/profile`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch {
    alert(i18next.t("authapi.profile_failed"));
    return null;
  }
};

// ✅ 프로필 수정
export const updateProfile = async (updateData) => {
  await waitForI18n();
  try {
    const token = localStorage.getItem("token");
    const res = await axios.put(`${API_URL}/api/auth/profile`, updateData, {
      headers: { Authorization: `Bearer ${token}` },
    });
    alert(i18next.t("authapi.update_success"));
    return res.data;
  } catch {
    alert(i18next.t("authapi.update_failed"));
    throw err;
  }
};

// ✅ 비밀번호 변경
export const changePassword = async (oldPw, newPw) => {
  await waitForI18n();
  try {
    const token = localStorage.getItem("token");
    const res = await axios.post(
      `${API_URL}/api/auth/change-password`,
      { oldPw, newPw },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    alert(i18next.t("authapi.password_changed"));
    return res.data;
  } catch {
    alert(i18next.t("authapi.password_change_failed"));
    throw err;
  }
};

// ✅ 이메일 중복 확인
export const checkEmailExists = async (email) => {
  await waitForI18n();
  try {
    const res = await axios.get(`${API_URL}/api/auth/check-email`, {
      params: { email },
    });
    return res.data.exists;
  } catch {
    alert(i18next.t("authapi.email_check_failed"));
    return false;
  }
};

// ✅ 토큰 검증
export const verifyToken = async () => {
  await waitForI18n();
  try {
    const token = localStorage.getItem("token");
    await axios.post(`${API_URL}/api/auth/verify`, null, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return true;
  } catch {
    alert(i18next.t("authapi.token_invalid"));
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    return false;
  }
};

// ✅ 관리자 확인
export const checkAdmin = async () => {
  await waitForI18n();
  try {
    const token = localStorage.getItem("token");
    const res = await axios.get(`${API_URL}/api/auth/admin`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data.isAdmin;
  } catch {
    alert(i18next.t("authapi.admin_check_failed"));
    return false;
  }
};
