import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  function handleSubmit(e) {
    e.preventDefault();
    setError("");

    // 간단 검증 (실서비스는 서버 검증 필요)
    if (!email) return setError("이메일을 입력해주세요.");
    if (!password) return setError("비밀번호를 입력해주세요.");
    // 이메일 형식 간단 체크
    if (!/\S+@\S+\.\S+/.test(email)) return setError("유효한 이메일을 입력해주세요.");

    // 성공 예시: 토큰 저장 등 대신 페이지 이동
    // localStorage.setItem('token', 'dummy');
    navigate("/products"); // 로그인 성공 시 이동 (원하면 변경)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-start justify-center py-8 px-4 sm:px-6">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="px-6 py-5 bg-black text-white">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-extrabold tracking-tight">로그인</h1>
            <Link to="/" className="text-sm opacity-80 hover:opacity-100">홈으로</Link>
          </div>
          <p className="mt-2 text-sm text-gray-200">로그인하시면 더 많은 혜택을 받을 수 있습니다.</p>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-8">
          {error && (
            <div className="mb-4 text-sm text-red-600 bg-red-50 p-3 rounded">
              {error}
            </div>
          )}

          <label className="block text-sm font-medium text-gray-700">이메일</label>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            placeholder="you@example.com"
            className="mt-1 mb-4 w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300"
          />

          <label className="block text-sm font-medium text-gray-700">비밀번호</label>
          <div className="relative mt-1 mb-4">
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type={showPw ? "text" : "password"}
              placeholder="비밀번호"
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

          <div className="flex items-center justify-between mb-6">
            <label className="inline-flex items-center">
              <input type="checkbox" className="form-checkbox h-4 w-4 text-indigo-600" />
              <span className="ml-2 text-sm text-gray-600">로그인 유지</span>
            </label>
            <Link to="/signup" className="text-sm text-indigo-600 hover:underline">회원가입</Link>
          </div>

          <button
            type="submit"
            className="w-full bg-indigo-900 text-white py-3 rounded-lg font-semibold hover:bg-indigo-800 transition"
          >
            로그인
          </button>

          <div className="mt-5">
            <div className="text-center text-sm text-gray-400">또는</div>
            <div className="mt-4 flex gap-3">
              <button type="button" className="w-1/2 py-2 rounded-lg border flex items-center justify-center gap-2">
                {/* 소셜 아이콘 대신 텍스트 */}
                <span className="text-sm">카카오</span>
              </button>
              <button type="button" className="w-1/2 py-2 rounded-lg border flex items-center justify-center gap-2">
                <span className="text-sm">네이버</span>
              </button>
            </div>
          </div>
        </form>

        <div className="px-6 py-4 text-xs text-center text-gray-500 bg-gray-50">
          <Link to="/terms" className="hover:underline mr-4">이용약관</Link>
          <Link to="/privacy" className="hover:underline">개인정보처리방침</Link>
        </div>
      </div>
    </div>
  );
}
