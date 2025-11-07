import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext"; // ✅ 추가

export default function Signup() {
  const navigate = useNavigate();
  const { login } = useAuth(); // ✅ 추가: 회원가입 후 자동 로그인용
  const { t } = useTranslation();

  const [form, setForm] = useState({
    userId: "",
    nickname: "",
    email: "",
    password: "",
    confirm: "",
  });

  const [agree, setAgree] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  // ✅ 추가된 상태들
  const [emailVerified, setEmailVerified] = useState(false);
  const [emailCode, setEmailCode] = useState("");
  const [checkingId, setCheckingId] = useState(false);
  const [checkingNick, setCheckingNick] = useState(false);
  const [codeSent, setCodeSent] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);

  // ✅ API 주소
  const API = "https://shop-backend-1-dfsl.onrender.com/api/auth";

  function onChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  /* -------------------- ✅ 아이디/닉네임 중복 확인 -------------------- */
  async function checkDuplicate(type) {
    const field = type === "id" ? "userId" : "nickname";
    const value = form[field];
    if (!value)
      return alert(`${type === "id" ? "아이디" : "닉네임"}를 입력해주세요.`);

    type === "id" ? setCheckingId(true) : setCheckingNick(true);

    try {
      const res = await fetch(`${API}/check-id`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [field]: value }),
      });

      const data = await res.json();

      if (data.exists) {
        alert(`이미 사용 중인 ${type === "id" ? "아이디" : "닉네임"}입니다.`);
      } else {
        alert(`사용 가능한 ${type === "id" ? "아이디" : "닉네임"}입니다.`);
      }
    } catch (err) {
      console.error("중복 확인 오류:", err);
      alert("서버 오류가 발생했습니다.");
    } finally {
      type === "id" ? setCheckingId(false) : setCheckingNick(false);
    }
  }

  /* -------------------- ✅ 이메일 인증 코드 전송 -------------------- */
  async function sendEmailCode() {
    if (!form.email) return alert("이메일을 입력해주세요.");

    setSendingEmail(true);
    try {
      const res = await fetch(`${API}/send-email-code`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "이메일 전송 실패");

      alert("이메일로 인증 코드가 전송되었습니다!");
      setCodeSent(true);
    } catch (err) {
      console.error("이메일 전송 오류:", err);
      alert(err.message);
    } finally {
      setSendingEmail(false);
    }
  }

  /* -------------------- ✅ 이메일 인증 코드 검증 -------------------- */
  async function verifyEmailCode() {
    if (!emailCode.trim()) return alert("인증 코드를 입력해주세요.");

    try {
      const res = await fetch(`${API}/verify-email-code`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email, code: emailCode }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "인증 실패");

      alert("✅ 이메일 인증이 완료되었습니다!");
      setEmailVerified(true);
    } catch (err) {
      console.error("이메일 인증 오류:", err);
      alert(err.message);
    }
  }

  /* -------------------- ✅ 회원가입 -------------------- */
  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccessMsg("");

    if (!form.userId.trim()) return setError("아이디를 입력해주세요.");
    if (!form.nickname.trim()) return setError("닉네임을 입력해주세요.");
    if (!form.email || !/\S+@\S+\.\S+/.test(form.email))
      return setError("유효한 이메일을 입력해주세요.");
    if (!emailVerified) return setError("이메일 인증을 완료해주세요.");
    if (form.password.length < 6)
      return setError("비밀번호는 6자 이상이어야 합니다.");
    if (form.password !== form.confirm)
      return setError("비밀번호가 일치하지 않습니다.");
    if (!agree) return setError("이용약관에 동의해주세요.");

    try {
      setLoading(true);

      const res = await fetch(`${API}/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: form.userId,
          nickname: form.nickname,
          email: form.email,
          password: form.password,
          emailVerified: true,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "회원가입 실패");

      // ✅ 회원가입 성공 후 자동 로그인 실행
      if (data.token && data.refreshToken && data.user) {
        login(data.user, data.token, data.refreshToken);
        alert("✅ 회원가입 및 자동 로그인 성공!");
        navigate("/");
        return;
      }

      // ✅ 일반 회원가입 성공 시
      setSuccessMsg("회원가입이 완료되었습니다!");
      setTimeout(() => navigate("/login"), 3000);
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
        {/* 헤더 */}
        <div className="px-6 py-5 bg-black text-white">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-extrabold tracking-tight">회원가입</h1>
            <Link to="/" className="text-sm opacity-80 hover:opacity-100">
              닫기
            </Link>
          </div>
          <p className="mt-2 text-sm text-gray-200">
            간단한 가입으로 쇼핑을 시작하세요.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-8">
          {/* 오류 / 성공 메시지 */}
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
          <div className="flex gap-2 items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700">
                아이디
              </label>
              <input
                name="userId"
                value={form.userId}
                onChange={onChange}
                placeholder="아이디 입력"
                className="mt-1 mb-2 w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
            </div>
            <button
              type="button"
              onClick={() => checkDuplicate("id")}
              disabled={checkingId}
              className="h-[42px] bg-gray-800 text-white px-3 py-2 rounded-lg text-sm"
            >
              {checkingId ? "확인중..." : "중복확인"}
            </button>
          </div>

          {/* 닉네임 */}
          <div className="flex gap-2 items-end mt-3">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700">
                닉네임
              </label>
              <input
                name="nickname"
                value={form.nickname}
                onChange={onChange}
                placeholder="닉네임 입력"
                className="mt-1 mb-2 w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
            </div>
            <button
              type="button"
              onClick={() => checkDuplicate("nickname")}
              disabled={checkingNick}
              className="h-[42px] bg-gray-800 text-white px-3 py-2 rounded-lg text-sm"
            >
              {checkingNick ? "확인중..." : "중복확인"}
            </button>
          </div>

          {/* 이메일 + 인증 */}
          <div className="flex gap-2 items-end mt-3">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700">
                이메일
              </label>
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={onChange}
                placeholder="you@example.com"
                className="mt-1 mb-2 w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
                disabled={emailVerified}
              />
            </div>
            <button
              type="button"
              onClick={sendEmailCode}
              disabled={sendingEmail || emailVerified}
              className={`h-[42px] ${
                emailVerified
                  ? "bg-green-500"
                  : "bg-indigo-700 hover:bg-indigo-800"
              } text-white px-3 py-2 rounded-lg text-sm`}
            >
              {emailVerified ? "인증완료" : sendingEmail ? "전송중..." : "인증요청"}
            </button>
          </div>

          {/* 인증 코드 입력 */}
          {codeSent && !emailVerified && (
            <div className="flex gap-2 mt-2">
              <input
                placeholder="인증코드 입력"
                value={emailCode}
                onChange={(e) => setEmailCode(e.target.value)}
                className="flex-1 px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
              />
              <button
                type="button"
                onClick={verifyEmailCode}
                className="bg-green-600 text-white px-3 py-2 rounded-lg text-sm"
              >
                인증확인
              </button>
            </div>
          )}

          {/* 비밀번호 */}
          <label className="block text-sm font-medium text-gray-700 mt-4">
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

          {/* 이용약관 */}
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
