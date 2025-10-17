import { useState } from "react";

export default function Support() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [status, setStatus] = useState({ type: "", message: "" });
  const [loading, setLoading] = useState(false);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    if (!form.name.trim()) return "이름을 입력해주세요.";
    if (!form.email.trim()) return "이메일을 입력해주세요.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      return "유효한 이메일 주소를 입력해주세요.";
    if (!form.message.trim()) return "문의 내용을 입력해주세요.";
    return null;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setStatus({ type: "", message: "" });

    const validationError = validateForm();
    if (validationError) {
      setStatus({ type: "error", message: validationError });
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(
        "https://shop-backend-1-dfsl.onrender.com/api/support",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        }
      );

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "문의 전송 실패");

      setStatus({
        type: "success",
        message: "✅ 문의가 성공적으로 접수되었습니다. 빠른 시일 내에 답변드리겠습니다.",
      });
      setForm({ name: "", email: "", message: "" });

      // 자동 스크롤 이동 (피드백 메시지로 이동)
      setTimeout(() => {
        window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
      }, 200);
    } catch (err) {
      setStatus({
        type: "error",
        message: "❌ 오류가 발생했습니다: " + err.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-10 px-4 font-['Pretendard']">
      <div className="w-full max-w-lg bg-white p-8 rounded-2xl shadow">
        <h1 className="text-2xl font-bold mb-6 text-center text-gray-800">
          고객센터 문의하기
        </h1>

        <form onSubmit={onSubmit} className="space-y-4">
          <input
            type="text"
            name="name"
            placeholder="이름"
            value={form.name}
            onChange={onChange}
            required
            className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
          <input
            type="email"
            name="email"
            placeholder="이메일"
            value={form.email}
            onChange={onChange}
            required
            className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
          <textarea
            name="message"
            placeholder="문의 내용을 입력하세요"
            value={form.message}
            onChange={onChange}
            required
            rows="5"
            className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-lg text-white transition ${
              loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-indigo-600 hover:bg-indigo-700"
            }`}
          >
            {loading ? "전송 중..." : "문의하기"}
          </button>
        </form>

        {status.message && (
          <p
            className={`mt-6 text-center text-sm ${
              status.type === "success"
                ? "text-green-600 bg-green-50"
                : "text-red-600 bg-red-50"
            } p-3 rounded-lg`}
          >
            {status.message}
          </p>
        )}

        <p className="text-xs text-center text-gray-400 mt-6">
          ※ 문의 내용은 관리자에게 이메일로 전송되며, 접수 후 24시간 이내에 답변드립니다.
        </p>
      </div>
    </div>
  );
}
