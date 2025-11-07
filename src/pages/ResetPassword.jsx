import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

function ResetPassword() {
  const { token } = useParams(); // URL에서 토큰 추출
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // ✅ 환경 변수 기반 API URL (없으면 기본값 사용)
  const API_URL =
    import.meta.env.VITE_API_BASE_URL ||
    "https://shop-backend-1-dfsl.onrender.com";

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setMessage("");

    // ✅ 기본 검증
    if (!password || !confirmPassword)
      return setError("비밀번호를 모두 입력해주세요.");
    if (password.length < 6)
      return setError("비밀번호는 최소 6자 이상이어야 합니다.");
    if (password !== confirmPassword)
      return setError("비밀번호가 일치하지 않습니다.");

    try {
      setLoading(true);
      
      const { t } = useTranslation();

      const res = await fetch(`${API_URL}/api/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "비밀번호 변경 실패");

      setMessage("✅ 비밀번호가 성공적으로 변경되었습니다!");
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      console.error("비밀번호 재설정 오류:", err);
      setError(err.message || "서버 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 text-gray-900 font-['Pretendard'] px-6">
      <div className="bg-white rounded-2xl shadow-lg p-10 w-full max-w-md">
        <h2 className="text-3xl font-bold mb-6 text-center">비밀번호 재설정</h2>

        {/* ✅ 메시지 출력 */}
        {message && (
          <div className="mb-4 text-sm text-green-600 bg-green-50 p-3 rounded">
            {message}
          </div>
        )}
        {error && (
          <div className="mb-4 text-sm text-red-600 bg-red-50 p-3 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="password"
            placeholder="새 비밀번호 (6자 이상)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border border-gray-300 rounded-lg p-3 focus:outline-none focus:border-gray-600"
          />
          <input
            type="password"
            placeholder="비밀번호 확인"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="border border-gray-300 rounded-lg p-3 focus:outline-none focus:border-gray-600"
          />
          <button
            type="submit"
            disabled={loading}
            className={`py-3 rounded-lg text-white font-semibold transition ${
              loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-black hover:bg-gray-800"
            }`}
          >
            {loading ? "변경 중..." : "비밀번호 변경"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default ResetPassword;
