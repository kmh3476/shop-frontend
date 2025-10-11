import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Signup() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirm: "",
    phone: "",
  });
  const [agree, setAgree] = useState(false);
  const [error, setError] = useState("");

  function onChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!form.name) return setError("이름을 입력해주세요.");
    if (!form.email || !/\S+@\S+\.\S+/.test(form.email)) return setError("유효한 이메일을 입력해주세요.");
    if (form.password.length < 6) return setError("비밀번호는 6자 이상이어야 합니다.");
    if (form.password !== form.confirm) return setError("비밀번호가 일치하지 않습니다.");
    if (!agree) return setError("이용약관에 동의해주세요.");

    // 성공 예시
    // API 요청 후 성공 시 이동
    navigate("/products");
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-start justify-center py-8 px-4 sm:px-6">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="px-6 py-5 bg-black text-white">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-extrabold tracking-tight">회원가입</h1>
            <Link to="/" className="text-sm opacity-80 hover:opacity-100">닫기</Link>
          </div>
          <p className="mt-2 text-sm text-gray-200">간단한 가입으로 쇼핑을 시작하세요.</p>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-8">
          {error && (
            <div className="mb-4 text-sm text-red-600 bg-red-50 p-3 rounded">
              {error}
            </div>
          )}

          <label className="block text-sm font-medium text-gray-700">이름</label>
          <input name="name" value={form.name} onChange={onChange} className="mt-1 mb-4 w-full px-4 py-3 border rounded-lg" />

          <label className="block text-sm font-medium text-gray-700">이메일</label>
          <input name="email" value={form.email} onChange={onChange} type="email" placeholder="you@example.com" className="mt-1 mb-4 w-full px-4 py-3 border rounded-lg" />

          <label className="block text-sm font-medium text-gray-700">비밀번호</label>
          <input name="password" value={form.password} onChange={onChange} type="password" className="mt-1 mb-4 w-full px-4 py-3 border rounded-lg" />

          <label className="block text-sm font-medium text-gray-700">비밀번호 확인</label>
          <input name="confirm" value={form.confirm} onChange={onChange} type="password" className="mt-1 mb-4 w-full px-4 py-3 border rounded-lg" />

          <label className="block text-sm font-medium text-gray-700">휴대전화 (선택)</label>
          <input name="phone" value={form.phone} onChange={onChange} type="tel" className="mt-1 mb-4 w-full px-4 py-3 border rounded-lg" />

          <label className="inline-flex items-start gap-2 mt-2">
            <input type="checkbox" checked={agree} onChange={() => setAgree((s) => !s)} className="mt-1 form-checkbox h-4 w-4" />
            <div className="text-sm text-gray-600">
              <span>이용약관 및 개인정보처리방침에 동의합니다.</span><br />
              <Link to="/terms" className="text-indigo-600 hover:underline text-xs">자세히 보기</Link>
            </div>
          </label>

          <button type="submit" className="mt-6 w-full bg-indigo-900 text-white py-3 rounded-lg font-semibold hover:bg-indigo-800 transition">
            계정 만들기
          </button>

          <div className="mt-4 text-center text-sm text-gray-500">
            이미 계정이 있으신가요? <Link to="/login" className="text-indigo-600 hover:underline">로그인</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
