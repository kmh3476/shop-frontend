import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTranslation } from "react-i18next";

export default function Signup() {
  const navigate = useNavigate();
  const { login } = useAuth();
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
  const [emailVerified, setEmailVerified] = useState(false);
  const [emailCode, setEmailCode] = useState("");
  const [checkingId, setCheckingId] = useState(false);
  const [checkingNick, setCheckingNick] = useState(false);
  const [codeSent, setCodeSent] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);

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
      return alert(
        t(type === "id" ? "signup.enterId" : "signup.enterNickname")
      );

    type === "id" ? setCheckingId(true) : setCheckingNick(true);

    try {
      const res = await fetch(`${API}/check-id`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [field]: value }),
      });
      const data = await res.json();

      if (data.exists) {
        alert(
          t(type === "id" ? "signup.idExists" : "signup.nicknameExists")
        );
      } else {
        alert(
          t(type === "id" ? "signup.idAvailable" : "signup.nicknameAvailable")
        );
      }
    } catch (err) {
      console.error("중복 확인 오류:", err);
      alert(t("signup.serverError"));
    } finally {
      type === "id" ? setCheckingId(false) : setCheckingNick(false);
    }
  }

  /* -------------------- ✅ 이메일 인증 코드 전송 -------------------- */
  async function sendEmailCode() {
    if (!form.email) return alert(t("signup.enterEmail"));

    setSendingEmail(true);
    try {
      const res = await fetch(`${API}/send-email-code`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || t("signup.emailSendFail"));

      alert(t("signup.emailSent"));
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
    if (!emailCode.trim()) return alert(t("signup.enterCode"));

    try {
      const res = await fetch(`${API}/verify-email-code`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email, code: emailCode }),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.message || t("signup.verifyFail"));

      alert(t("signup.emailVerified"));
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

    if (!form.userId.trim()) return setError(t("signup.enterId"));
    if (!form.nickname.trim()) return setError(t("signup.enterNickname"));
    if (!form.email || !/\S+@\S+\.\S+/.test(form.email))
      return setError(t("signup.validEmail"));
    if (!emailVerified) return setError(t("signup.needEmailVerify"));
    if (form.password.length < 6)
      return setError(t("signup.shortPassword"));
    if (form.password !== form.confirm)
      return setError(t("signup.passwordNotMatch"));
    if (!agree) return setError(t("signup.agreeTerms"));

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
      if (!res.ok) throw new Error(data.message || t("signup.failed"));

      if (data.token && data.refreshToken && data.user) {
        login(data.user, data.token, data.refreshToken);
        alert(t("signup.autoLoginSuccess"));
        navigate("/");
        return;
      }

      setSuccessMsg(t("signup.success"));
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
        <div className="px-6 py-5 bg-black text-white">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-extrabold tracking-tight">
              {t("signup.title")}
            </h1>
            <Link to="/" className="text-sm opacity-80 hover:opacity-100">
              {t("signup.close")}
            </Link>
          </div>
          <p className="mt-2 text-sm text-gray-200">
            {t("signup.subtitle")}
          </p>
        </div>

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
          <div className="flex gap-2 items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700">
                {t("signup.id")}
              </label>
              <input
                name="userId"
                value={form.userId}
                onChange={onChange}
                placeholder={t("signup.enterId")}
                className="mt-1 mb-2 w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
            </div>
            <button
              type="button"
              onClick={() => checkDuplicate("id")}
              disabled={checkingId}
              className="h-[42px] bg-gray-800 text-white px-3 py-2 rounded-lg text-sm"
            >
              {checkingId ? t("signup.checking") : t("signup.checkDuplicate")}
            </button>
          </div>

          {/* 닉네임 */}
          <div className="flex gap-2 items-end mt-3">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700">
                {t("signup.nickname")}
              </label>
              <input
                name="nickname"
                value={form.nickname}
                onChange={onChange}
                placeholder={t("signup.enterNickname")}
                className="mt-1 mb-2 w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
            </div>
            <button
              type="button"
              onClick={() => checkDuplicate("nickname")}
              disabled={checkingNick}
              className="h-[42px] bg-gray-800 text-white px-3 py-2 rounded-lg text-sm"
            >
              {checkingNick ? t("signup.checking") : t("signup.checkDuplicate")}
            </button>
          </div>

          {/* 이메일 + 인증 */}
          <div className="flex gap-2 items-end mt-3">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700">
                {t("signup.email")}
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
              {emailVerified
                ? t("signup.verified")
                : sendingEmail
                ? t("signup.sending")
                : t("signup.requestVerify")}
            </button>
          </div>

          {/* 인증 코드 */}
          {codeSent && !emailVerified && (
            <div className="flex gap-2 mt-2">
              <input
                placeholder={t("signup.enterCode")}
                value={emailCode}
                onChange={(e) => setEmailCode(e.target.value)}
                className="flex-1 px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
              />
              <button
                type="button"
                onClick={verifyEmailCode}
                className="bg-green-600 text-white px-3 py-2 rounded-lg text-sm"
              >
                {t("signup.verify")}
              </button>
            </div>
          )}

          {/* 비밀번호 */}
          <label className="block text-sm font-medium text-gray-700 mt-4">
            {t("signup.password")}
          </label>
          <input
            name="password"
            type="password"
            value={form.password}
            onChange={onChange}
            placeholder={t("signup.passwordPlaceholder")}
            className="mt-1 mb-4 w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />

          <label className="block text-sm font-medium text-gray-700">
            {t("signup.confirmPassword")}
          </label>
          <input
            name="confirm"
            type="password"
            value={form.confirm}
            onChange={onChange}
            placeholder={t("signup.reenterPassword")}
            className="mt-1 mb-4 w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />

          {/* 약관 */}
          <label className="inline-flex items-start gap-2 mt-2">
            <input
              type="checkbox"
              checked={agree}
              onChange={() => setAgree((s) => !s)}
              className="mt-1 form-checkbox h-4 w-4 text-indigo-600"
            />
            <div className="text-sm text-gray-600 leading-tight">
              <span>{t("signup.agreeText")}</span>
              <br />
              <Link
                to="/terms"
                className="text-indigo-600 hover:underline text-xs"
              >
                {t("signup.viewDetails")}
              </Link>
            </div>
          </label>

          {/* 버튼 */}
          <button
            type="submit"
            disabled={loading}
            className={`mt-6 w-full ${
              loading ? "bg-indigo-400" : "bg-indigo-900 hover:bg-indigo-800"
            } text-white py-3 rounded-lg font-semibold transition`}
          >
            {loading ? t("signup.signingUp") : t("signup.submit")}
          </button>

          {/* 안내 */}
          <div className="mt-4 text-center text-sm text-gray-500">
            {t("signup.alreadyHave")}{" "}
            <Link to="/login" className="text-indigo-600 hover:underline">
              {t("signup.login")}
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
