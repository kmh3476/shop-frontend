import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

function ResetPassword() {
  const { token } = useParams(); // URL에 포함된 토큰
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const API_URL = "https://shop-backend-1-dfsl.onrender.com/api/auth/reset-password";

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!password || !confirmPassword)
      return setError("비밀번호를 모두 입력해주세요.");
    if (password !== confirmPassword)
      return setError("비밀번호가 일치하지 않습니다.");

    try {
      setLoading(true);

      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "비밀번호 변경 실패");

      setMessage("✅ 비밀번호가 성공적으로 변경되었습니다!");
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      console.error("비밀번호 재설정 오류:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 text-gray-900 font-['Pretendard'] px-6">
      <div className="bg-white rounded-2xl shadow-lg p-10 w-full max-w-md">
        <h2 className="text-3xl font-bold mb-6 text-center">비밀번호 재설정</h2>

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
            placeholder="새 비밀번호"
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
            className={`bg-black text-white py-3 rounded-lg mt-2 hover:bg-gray-800 transition ${
              loading ? "opacity-70" : ""
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
