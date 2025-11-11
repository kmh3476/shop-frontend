import express from "express";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { createAccessToken, createRefreshToken } from "../utils/token.js";

const router = express.Router();

/* -------------------------------------------------
🆕 i18n 보강 영역 (추가만 함)
-------------------------------------------------- */

// 다국어 메시지 테이블
const MESSAGES = {
  ko: {
    signup_success: "회원가입 성공",
    signup_error: "회원가입 중 오류가 발생했습니다.",
    login_success: "로그인 성공",
    login_failed: "로그인 실패. 아이디나 비밀번호를 확인해주세요.",
    logout_done: "로그아웃 완료",
    refresh_failed: "토큰 갱신 실패",
  },
  en: {
    signup_success: "Sign-up successful",
    signup_error: "Sign-up failed",
    login_success: "Login successful",
    login_failed: "Login failed. Please check your credentials.",
    logout_done: "Logout complete",
    refresh_failed: "Token refresh failed",
  },
  th: {
    signup_success: "สมัครสมาชิกสำเร็จ!",
    signup_error: "เกิดข้อผิดพลาดระหว่างการสมัครสมาชิก",
    login_success: "เข้าสู่ระบบสำเร็จ!",
    login_failed: "เข้าสู่ระบบล้มเหลว กรุณาตรวจสอบข้อมูลอีกครั้ง",
    logout_done: "ออกจากระบบเรียบร้อยแล้ว",
    refresh_failed: "การต่ออายุโทเค็นล้มเหลว",
  },
};

// 언어 감지
function getLang(req) {
  const acceptLang = req.headers["accept-language"];
  if (!acceptLang) return "th"; // 기본은 태국어
  const lang = acceptLang.split(",")[0].split("-")[0];
  return ["ko", "en", "th"].includes(lang) ? lang : "th";
}

// 간단한 t() 팩토리
function tFactory(lang) {
  return (key) => MESSAGES[lang]?.[key] || MESSAGES.th[key] || key;
}

// 미들웨어로 설정
router.use((req, res, next) => {
  const lang = getLang(req);
  res.locals.lang = lang;
  res.locals.t = tFactory(lang);
  next();
});

/* -------------------------------------------------
  ✅ 기존 로직은 그대로 유지 — 아래는 기존 회원가입, 로그인 등
-------------------------------------------------- */

// ✅ 회원가입
router.post("/signup", async (req, res) => {
  try {
    const { userId, password, email } = req.body;
    if (!userId || !password || !email) {
      return res.status(400).json({
        message: "필수 입력값 누락",
        i18n: { code: "signup_error", text: res.locals.t("signup_error") },
      });
    }

    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(409).json({
        message: "이미 등록된 이메일입니다.",
        i18n: { code: "signup_error", text: res.locals.t("signup_error") },
      });
    }

    const user = await User.create({ userId, password, email });
    res.json({
      message: "회원가입 성공",
      i18n: { code: "signup_success", text: res.locals.t("signup_success") },
      user: { id: user._id, email: user.email },
    });
  } catch (err) {
    console.error("회원가입 오류:", err);
    res.status(500).json({
      message: "서버 오류",
      i18n: { code: "signup_error", text: res.locals.t("signup_error") },
    });
  }
});

// ✅ 로그인
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        message: "사용자를 찾을 수 없습니다.",
        i18n: { code: "login_failed", text: res.locals.t("login_failed") },
      });
    }

    if (user.password !== password) {
      return res.status(401).json({
        message: "비밀번호가 일치하지 않습니다.",
        i18n: { code: "login_failed", text: res.locals.t("login_failed") },
      });
    }

    const token = createAccessToken(user);
    const refreshToken = createRefreshToken(user);

    res.json({
      message: "로그인 성공",
      i18n: { code: "login_success", text: res.locals.t("login_success") },
      token,
      refreshToken,
      user: {
        id: user._id,
        userId: user.userId,
        email: user.email,
      },
    });
  } catch (err) {
    console.error("로그인 오류:", err);
    res.status(500).json({
      message: "서버 오류",
      i18n: { code: "login_failed", text: res.locals.t("login_failed") },
    });
  }
});
// ✅ 로그아웃
router.post("/logout", async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({
        message: "리프레시 토큰이 필요합니다.",
        i18n: { code: "logout_failed", text: res.locals.t("refresh_failed") },
      });
    }

    // 실제 로그아웃 로직 (DB 토큰 삭제 등)
    res.json({
      message: "로그아웃 완료",
      i18n: { code: "logout_done", text: res.locals.t("logout_done") },
    });
  } catch (err) {
    console.error("로그아웃 오류:", err);
    res.status(500).json({
      message: "서버 오류",
      i18n: { code: "logout_failed", text: res.locals.t("refresh_failed") },
    });
  }
});

// ✅ 토큰 갱신
router.post("/refresh", async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({
        message: "리프레시 토큰이 필요합니다.",
        i18n: { code: "refresh_failed", text: res.locals.t("refresh_failed") },
      });
    }

    const decoded = jwt.verify(refreshToken, process.env.REFRESH_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({
        message: "유효하지 않은 토큰입니다.",
        i18n: { code: "refresh_failed", text: res.locals.t("refresh_failed") },
      });
    }

    const newToken = createAccessToken(user);
    res.json({
      message: "토큰 갱신 성공",
      i18n: { code: "refresh_success", text: res.locals.t("login_success") },
      token: newToken,
    });
  } catch (err) {
    console.error("토큰 갱신 실패:", err);
    res.status(500).json({
      message: "토큰 갱신 실패",
      i18n: { code: "refresh_failed", text: res.locals.t("refresh_failed") },
    });
  }
});

// ✅ 프로필 조회
router.get("/profile", async (req, res) => {
  try {
    const auth = req.headers.authorization;
    if (!auth)
      return res.status(401).json({
        message: "인증 필요",
        i18n: { code: "login_failed", text: res.locals.t("login_failed") },
      });

    const token = auth.split(" ")[1];
    const decoded = jwt.verify(token, process.env.ACCESS_SECRET);
    const user = await User.findById(decoded.id).select("-password");

    if (!user)
      return res.status(404).json({
        message: "사용자 없음",
        i18n: { code: "login_failed", text: res.locals.t("login_failed") },
      });

    res.json({
      message: "프로필 조회 성공",
      i18n: { code: "profile_success", text: res.locals.t("login_success") },
      user,
    });
  } catch (err) {
    console.error("프로필 오류:", err);
    res.status(500).json({
      message: "서버 오류",
      i18n: { code: "profile_failed", text: res.locals.t("login_failed") },
    });
  }
});

// ✅ 비밀번호 변경
router.post("/change-password", async (req, res) => {
  try {
    const auth = req.headers.authorization;
    const token = auth?.split(" ")[1];
    const decoded = jwt.verify(token, process.env.ACCESS_SECRET);

    const { oldPw, newPw } = req.body;
    const user = await User.findById(decoded.id);

    if (!user || user.password !== oldPw) {
      return res.status(400).json({
        message: "비밀번호가 올바르지 않습니다.",
        i18n: { code: "password_change_failed", text: res.locals.t("login_failed") },
      });
    }

    user.password = newPw;
    await user.save();

    res.json({
      message: "비밀번호 변경 완료",
      i18n: { code: "password_changed", text: res.locals.t("login_success") },
    });
  } catch (err) {
    console.error("비밀번호 변경 실패:", err);
    res.status(500).json({
      message: "서버 오류",
      i18n: { code: "password_change_failed", text: res.locals.t("login_failed") },
    });
  }
});

// ✅ 관리자 확인
router.get("/admin", async (req, res) => {
  try {
    const auth = req.headers.authorization;
    const token = auth?.split(" ")[1];
    const decoded = jwt.verify(token, process.env.ACCESS_SECRET);
    const user = await User.findById(decoded.id);

    if (!user || !user.isAdmin) {
      return res.status(403).json({
        message: "관리자 권한이 없습니다.",
        i18n: { code: "admin_check_failed", text: res.locals.t("login_failed") },
      });
    }

    res.json({
      message: "관리자 확인 성공",
      i18n: { code: "admin_check_success", text: res.locals.t("login_success") },
      isAdmin: true,
    });
  } catch (err) {
    console.error("관리자 확인 실패:", err);
    res.status(500).json({
      message: "서버 오류",
      i18n: { code: "admin_check_failed", text: res.locals.t("login_failed") },
    });
  }
});

export default router;
