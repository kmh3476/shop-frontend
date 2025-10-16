import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

export default function Login() {
  const [loginInput, setLoginInput] = useState(""); // ✅ 아이디 또는 이메일 통합 입력
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const API = "https://shop-backend-1-dfsl.onrender.com/api/auth/login";

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    // ✅ 기본 검증
    if (!loginInput.trim()) {
      setLoading(false);
      return setError("아이디 또는 이메일을 입력해주세요.");
    }
    if (!password.trim()) {
      setLoading(false);
      return setError("비밀번호를 입력해주세요.");
    }

    try {
      // ✅ 이메일 형식이면 email 필드로, 아니면 userId로 보냄
      const isEmail = /\S+@\S+\.\S+/.test(loginInput);
      const payload = isEmail
        ? { email: loginInput, password }
        : { userId: loginInput, password };

      // ✅ 백엔드 요청
      const res = await axios.post(API, payload);

      // ✅ 성공 시 토큰 저장 및 이동
      localStorage.setItem("token", res.data.token);
      alert("로그인 성공!");
      navigate("/products");
    } catch (err) {
      console.error("로그인 오류:", err);
      setError(err.response?.data?.message || "로그인 실패. 다시 시도해주세요.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-start justify-center py-8 px-4 sm:px-6">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg overflow-hidden">
        {/* 헤더 영역 */}
        <div className="px-6 py-5 bg-black text-white">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-extrabold tracking-tight">로그인</h1>
            <Link to="/" className="text-sm opacity-80 hover:opacity-100">
              홈으로
            </Link>
          </div>
          <p className="mt-2 text-sm text-gray-200">
            로그인하시면 더 많은 혜택을 받을 수 있습니다.
          </p>
        </div>

        {/* 폼 영역 */}
        <form onSubmit={handleSubmit} className="px-6 py-8" autoComplete="off">
          {error && (
            <div className="mb-4 text-sm text-red-600 bg-red-50 p-3 rounded">
              {error}
            </div>
          )}

          {/* 아이디 또는 이메일 */}
          <label className="block text-sm font-medium text-gray-700">
            아이디 또는 이메일
          </label>
          <input
            value={loginInput}
            onChange={(e) => setLoginInput(e.target.value)}
            type="text"
            placeholder="아이디 또는 이메일을 입력하세요"
            className="mt-1 mb-4 w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300"
          />

          {/* 비밀번호 입력 */}
          <label className="block text-sm font-medium text-gray-700">
            비밀번호
          </label>
          <div className="relative mt-1 mb-4">
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type={showPw ? "text" : "password"}
              placeholder="비밀번호를 입력하세요"
              className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300"
            />
            <button
              type="button"
              onClick={() => setShowPw((s) => !s)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-600"
            >
              {showPw ? "숨기기" : "보기"}
            </button>
          </div>

          {/* 옵션 */}
          <div className="flex items-center justify-between mb-6">
            <label className="inline-flex items-center">
              <input
                type="checkbox"
                className="form-checkbox h-4 w-4 text-indigo-600"
              />
              <span className="ml-2 text-sm text-gray-600">로그인 유지</span>
            </label>
            <Link
              to="/signup"
              className="text-sm text-indigo-600 hover:underline"
            >
              회원가입
            </Link>
          </div>

          {/* 로그인 버튼 */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-lg font-semibold transition ${
              loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-indigo-900 text-white hover:bg-indigo-800"
            }`}
          >
            {loading ? "로그인 중..." : "로그인"}
          </button>

          {/* 소셜 로그인 (추후 구현용) */}
          <div className="mt-5">
            <div className="text-center text-sm text-gray-400">또는</div>
            <div className="mt-4 flex gap-3">
              <button
                type="button"
                className="w-1/2 py-2 rounded-lg border flex items-center justify-center gap-2"
              >
                <span className="text-sm">카카오</span>
              </button>
              <button
                type="button"
                className="w-1/2 py-2 rounded-lg border flex items-center justify-center gap-2"
              >
                <span className="text-sm">네이버</span>
              </button>
            </div>
          </div>
        </form>

        {/* 푸터 */}
        <div className="px-6 py-4 text-xs text-center text-gray-500 bg-gray-50">
          <Link to="/terms" className="hover:underline mr-4">
            이용약관
          </Link>
          <Link to="/privacy" className="hover:underline">
            개인정보처리방침
          </Link>
        </div>
      </div>
    </div>
  );
}
