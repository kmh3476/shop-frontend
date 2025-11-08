import { useState } from "react";
import { useTranslation } from "react-i18next";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [userId, setUserId] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();

  const handleForgot = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!email || !userId)
      return setError(t("forgot.missingInputs"));

    try {
      setLoading(true);

      // ✅ 백엔드 URL을 환경변수에서 불러오도록 수정
      const baseUrl =
        import.meta.env.VITE_API_BASE_URL ||
        "https://shop-backend-1-dfsl.onrender.com";

      const res = await fetch(`${baseUrl}/api/auth/forgot`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, userId }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || t("forgot.failed"));

      // ✅ 성공 시 메시지
      setMessage(t("forgot.successMessage"));
    } catch (err) {
      setError(err.message || t("forgot.serverError"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 font-['Pretendard']">
      <div className="bg-white p-8 rounded-2xl shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold text-center mb-6">
          {t("forgot.title")}
        </h2>
        <form onSubmit={handleForgot} className="flex flex-col gap-4">
          <input
            type="text"
            placeholder={t("forgot.inputId")}
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            className="border border-gray-300 rounded-lg p-3 focus:outline-none focus:border-gray-600"
          />
          <input
            type="email"
            placeholder={t("forgot.inputEmail")}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border border-gray-300 rounded-lg p-3 focus:outline-none focus:border-gray-600"
          />
          <button
            type="submit"
            disabled={loading}
            className={`py-3 rounded-lg text-white transition ${
              loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-black hover:bg-gray-800"
            }`}
          >
            {loading ? t("forgot.loading") : t("forgot.submit")}
          </button>
        </form>

        {/* ✅ 에러 / 성공 메시지 */}
        {error && <p className="text-red-500 mt-4 text-center">{error}</p>}
        {message && <p className="text-green-600 mt-4 text-center">{message}</p>}
      </div>
    </div>
  );
}
