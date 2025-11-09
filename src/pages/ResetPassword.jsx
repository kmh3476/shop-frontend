import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";

function ResetPassword() {
  const { token } = useParams(); // URL에서 토큰 추출
  const navigate = useNavigate();
  const { t } = useTranslation();

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
      return setError(t("resetPassword.fillAllFields"));
    if (password.length < 6)
      return setError(t("resetPassword.minLength"));
    if (password !== confirmPassword)
      return setError(t("resetPassword.notMatch"));

    try {
      setLoading(true);

      const res = await fetch(`${API_URL}/api/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || t("resetPassword.failed"));

      setMessage(t("resetPassword.success"));
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      console.error("비밀번호 재설정 오류:", err);
      setError(err.message || t("resetPassword.serverError"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 text-gray-900 font-['Pretendard'] px-6">
      <div className="bg-white rounded-2xl shadow-lg p-10 w-full max-w-md">
        <h2 className="text-3xl font-bold mb-6 text-center">
          {t("resetPassword.title")}
        </h2>

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
            placeholder={t("resetPassword.newPassword")}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border border-gray-300 rounded-lg p-3 focus:outline-none focus:border-gray-600"
          />
          <input
            type="password"
            placeholder={t("resetPassword.confirmPassword")}
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
            {loading ? t("resetPassword.loading") : t("resetPassword.submit")}
          </button>
        </form>
      </div>
    </div>
  );
}

export default ResetPassword;
