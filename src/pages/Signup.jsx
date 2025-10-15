import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Signup() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    userId: "",
    nickname: "",
    name: "",
    email: "",
    password: "",
    confirm: "",
  });
  const [agree, setAgree] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  // ✅ 백엔드 주소 (Render 등 배포된 실제 주소)
  const API_URL = "https://shop-backend-1-dfsl.onrender.com/api/auth/signup";

  function onChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccessMsg("");

    if (!form.userId.trim()) return setError("아이디를 입력해주세요.");
    if (!form.nickname.trim()) return setError("닉네임을 입력해주세요.");
    if (!form.name.trim()) return setError("이름을 입력해주세요.");
    if (!form.email || !/\S+@\S+\.\S+/.test(form.email))
      return setError("유효한 이메일을 입력해주세요.");
    if (form.password.length < 6)
      return setError("비밀번호는 6자 이상이어야 합니다.");
    if (form.password !== form.confirm)
      return setError("비밀번호가 일치하지 않습니다.");
    if (!agree) return setError("이용약관에 동의해주세요.");

    try {
      setLoading(true);

      // ✅ 회원가입 요청
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: form.userId,
          nickname: form.nickname,
          name: form.name,
          email: form.email,
          password: form.password,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "회원가입 실패");

      // ✅ 이메일 인증 안내 메시지 출력
      setSuccessMsg(
        "회원가입이 완료되었습니다. 이메일로 전송된 인증 링크를 확인해주세요!"
      );

      // 일정 시간 후 로그인 페이지로 이동
      setTimeout(() => navigate("/login"), 5000);
    } catch (err) {
      console.error("회원가입 오류:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-start justify-center py-8 px-4 sm:px-6">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg overflow-hidden">
        {/* 상단 헤더 */}
        <div className="px-6 py-5 bg-black text-white">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-extrabold tracking-tight">
              회원가입
            </h1>
            <Link to="/" className="text-sm opacity-80 hover:opacity-100">
              닫기
            </Link>
          </div>
          <p className="mt-2 text-sm text-gray-200">
            간단한 가입으로 쇼핑을 시작하세요.
          </p>
        </div>

        {/* 폼 */}
        <form onSubmit={handleSubmit} className="px-6 py-8">
          {error && (
            <div className="mb-4 text-sm text-red-600 bg-red-50 p-3 rounded">
              {error}
            </div>
          )}
          {successMsg && (
            <div className="mb-4 text-sm text-green-700 bg-green-50 p-3 rounded">
              {successMsg}
            </div>
          )}

          {/* 아이디 */}
          <label className="block text-sm font-medium text-gray-700">
            아이디
          </label>
          <input
            name="userId"
            value={form.userId}
            onChange={onChange}
            placeholder="아이디 입력"
            className="mt-1 mb-4 w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />

          {/* 닉네임 */}
          <label className="block text-sm font-medium text-gray-700">
            닉네임
          </label>
          <input
            name="nickname"
            value={form.nickname}
            onChange={onChange}
            placeholder="닉네임 입력"
            className="mt-1 mb-4 w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />

          {/* 이름 */}
          <label className="block text-sm font-medium text-gray-700">
            이름
          </label>
          <input
            name="name"
            value={form.name}
            onChange={onChange}
            placeholder="이름 입력"
            className="mt-1 mb-4 w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />

          {/* 이메일 */}
          <label className="block text-sm font-medium text-gray-700">
            이메일
          </label>
          <input
            name="email"
            type="email"
            value={form.email}
            onChange={onChange}
            placeholder="you@example.com"
            className="mt-1 mb-4 w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />

          {/* 비밀번호 */}
          <label className="block text-sm font-medium text-gray-700">
            비밀번호
          </label>
          <input
            name="password"
            type="password"
            value={form.password}
            onChange={onChange}
            placeholder="6자 이상 입력"
            className="mt-1 mb-4 w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />

          {/* 비밀번호 확인 */}
          <label className="block text-sm font-medium text-gray-700">
            비밀번호 확인
          </label>
          <input
            name="confirm"
            type="password"
            value={form.confirm}
            onChange={onChange}
            placeholder="비밀번호 재입력"
            className="mt-1 mb-4 w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />

          {/* 이용약관 동의 */}
          <label className="inline-flex items-start gap-2 mt-2">
            <input
              type="checkbox"
              checked={agree}
              onChange={() => setAgree((s) => !s)}
              className="mt-1 form-checkbox h-4 w-4 text-indigo-600"
            />
            <div className="text-sm text-gray-600 leading-tight">
              <span>이용약관 및 개인정보처리방침에 동의합니다.</span>
              <br />
              <Link
                to="/terms"
                className="text-indigo-600 hover:underline text-xs"
              >
                자세히 보기
              </Link>
            </div>
          </label>

          {/* 제출 버튼 */}
          <button
            type="submit"
            disabled={loading}
            className={`mt-6 w-full ${
              loading ? "bg-indigo-400" : "bg-indigo-900 hover:bg-indigo-800"
            } text-white py-3 rounded-lg font-semibold transition`}
          >
            {loading ? "가입 중..." : "회원가입"}
          </button>

          {/* 하단 안내 */}
          <div className="mt-4 text-center text-sm text-gray-500">
            이미 계정이 있으신가요?{" "}
            <Link to="/login" className="text-indigo-600 hover:underline">
              로그인
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
