// 📁 src/api/authapi.js
import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import User from "../models/User.js";

const router = express.Router();

// ✅ Access Token 생성
const createAccessToken = (user) =>
  jwt.sign(
    { id: user._id, email: user.email, isAdmin: user.isAdmin },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );

// ✅ Refresh Token 생성
const createRefreshToken = (user) =>
  jwt.sign(
    { id: user._id, email: user.email },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: "7d" }
  );


// ✅ 회원가입
router.post("/signup", async (req, res) => {
  try {
    const { userId, nickname, email, password } = req.body;

    // 1️⃣ 필수값 확인
    if (!userId || !nickname || !email || !password) {
      return res.status(400).json({ message: "모든 필드를 입력해주세요." });
    }

    // 2️⃣ 중복 확인
    const existing = await User.findOne({ $or: [{ email }, { userId }] });
    if (existing) {
      return res.status(400).json({ message: "이미 존재하는 계정입니다." });
    }

    // 3️⃣ 비밀번호 암호화
    const hashedPw = await bcrypt.hash(password, 10);

    // 4️⃣ 새 유저 생성
    const newUser = new User({
      userId,
      nickname,
      email,
      password: hashedPw,
      isAdmin: false,
    });
    await newUser.save();

    // 5️⃣ 토큰 발급 (회원가입 후 자동 로그인)
    const token = createAccessToken(newUser);
    const refreshToken = createRefreshToken(newUser);

    // 6️⃣ 응답 반환
    res.status(201).json({
      message: "회원가입 성공",
      token,
      refreshToken,
      user: {
        id: newUser._id,
        userId: newUser.userId,
        nickname: newUser.nickname,
        email: newUser.email,
        isAdmin: false,
      },
    });
  } catch (err) {
    console.error("회원가입 오류:", err);
    res.status(500).json({ message: "회원가입 중 서버 오류가 발생했습니다." });
  }
});


// ✅ 로그인
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "이메일과 비밀번호를 입력해주세요." });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "이메일이 존재하지 않습니다." });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "비밀번호가 틀립니다." });

    const token = createAccessToken(user);
    const refreshToken = createRefreshToken(user);

    res.json({
      message: "로그인 성공",
      token,
      refreshToken,
      user: {
        id: user._id,
        userId: user.userId,
        nickname: user.nickname,
        email: user.email,
        isAdmin: user.isAdmin || false,
      },
    });
  } catch (err) {
    console.error("로그인 오류:", err);
    res.status(500).json({ message: "서버 오류가 발생했습니다." });
  }
});


// ✅ 토큰 재발급 (자동 로그인용)
router.post("/refresh", async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken)
      return res.status(401).json({ message: "리프레시 토큰이 필요합니다." });

    jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET, async (err, decoded) => {
      if (err) {
        console.error("Refresh token 검증 실패:", err);
        return res.status(403).json({ message: "유효하지 않은 리프레시 토큰입니다." });
      }

      const user = await User.findById(decoded.id);
      if (!user)
        return res.status(404).json({ message: "사용자를 찾을 수 없습니다." });

      const newAccessToken = createAccessToken(user);
      res.json({ token: newAccessToken });
    });
  } catch (err) {
    console.error("리프레시 오류:", err);
    res.status(500).json({ message: "서버 오류가 발생했습니다." });
  }
});


// ✅ 로그아웃
router.post("/logout", (req, res) => {
  try {
    res.json({ message: "로그아웃 완료" });
  } catch (err) {
    console.error("로그아웃 오류:", err);
    res.status(500).json({ message: "로그아웃 중 오류가 발생했습니다." });
  }
});

export default router;
