import { useState } from "react";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [userId, setUserId] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleForgot = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!email || !userId)
      return setError("이메일과 아이디를 모두 입력해주세요.");

    try {
      setLoading(true);
      const res = await fetch(
        "https://shop-backend-1-dfsl.onrender.com/api/auth/forgot",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, userId }),
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "비밀번호 재설정 요청 실패");

      setMessage(data.message);
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
          비밀번호 재설정
        </h2>
        <form onSubmit={handleForgot} className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="아이디를 입력하세요"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            className="border border-gray-300 rounded-lg p-3 focus:outline-none focus:border-gray-600"
          />
          <input
            type="email"
            placeholder="이메일을 입력하세요"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border border-gray-300 rounded-lg p-3 focus:outline-none focus:border-gray-600"
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-black text-white py-3 rounded-lg hover:bg-gray-800 transition"
          >
            {loading ? "처리 중..." : "비밀번호 재설정 링크 받기"}
          </button>
        </form>
        {error && <p className="text-red-500 mt-4 text-center">{error}</p>}
        {message && <p className="text-green-600 mt-4 text-center">{message}</p>}
      </div>
    </div>
  );
}
