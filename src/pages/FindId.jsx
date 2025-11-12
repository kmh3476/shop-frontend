import { useState } from "react";
import { useTranslation } from "react-i18next";

export default function FindId() {
  const [email, setEmail] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { t } = useTranslation(); // ✅ 다국어 훅 추가

  const handleFindId = async (e) => {
    e.preventDefault();
    setError("");
    setResult("");
    if (!email) return setError(t("auth.enterEmail")); // ✅ 번역 적용

    try {
      setLoading(true);
      const res = await fetch(
        "https://shop-backend-1-dfsl.onrender.com/api/auth/find-id",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || t("auth.findIdFailed")); // ✅

      setResult(`${t("auth.foundId")}: ${data.userId}`); // ✅
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 font-['Pretendard']">
      <div className="bg-white p-8 rounded-2xl shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold text-center mb-6">
          {t("auth.findIdTitle")} {/* ✅ */}
        </h2>
        <form onSubmit={handleFindId} className="flex flex-col gap-4">
          <input
            type="email"
            placeholder={t("auth.findIdPlaceholder")}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border border-gray-300 rounded-lg p-3 focus:outline-none focus:border-gray-600"
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-black text-white py-3 rounded-lg hover:bg-gray-800 transition"
          >
            {loading ? t("auth.findingId") : t("auth.findIdButton")} {/* ✅ */}
          </button>
        </form>
        {error && <p className="text-red-500 mt-4 text-center">{error}</p>}
        {result && <p className="text-green-600 mt-4 text-center">{result}</p>}
      </div>
    </div>
  );
}
