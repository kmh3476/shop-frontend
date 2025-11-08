import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { useTranslation } from "react-i18next";

export default function Login() {
  const [loginInput, setLoginInput] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();

  const navigate = useNavigate();
  const { login } = useAuth();

  const API = "https://shop-backend-1-dfsl.onrender.com/api/auth/login";

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!loginInput.trim()) {
      setLoading(false);
      return setError(t("login.missingIdOrEmail"));
    }
    if (!password.trim()) {
      setLoading(false);
      return setError(t("login.missingPassword"));
    }

    try {
      const isEmail = /\S+@\S+\.\S+/.test(loginInput);
      const payload = isEmail
        ? { email: loginInput, password }
        : { userId: loginInput, password };

      const res = await axios.post(API, payload);

      if (!res.data?.token) {
        throw new Error(t("login.noToken"));
      }

      login(res.data.user, res.data.token, res.data.refreshToken);

      alert(t("login.success"));
      navigate("/");
    } catch (err) {
      console.error("로그인 오류:", err);
      setError(
        err.response?.data?.message || t("login.failed")
      );
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
            <h1 className="text-2xl font-extrabold tracking-tight">
              {t("login.title")}
            </h1>
            <Link to="/" className="text-sm opacity-80 hover:opacity-100">
              {t("login.home")}
            </Link>
          </div>
          <p className="mt-2 text-sm text-gray-200">
            {t("login.subtitle")}
          </p>
        </div>

        {/* 폼 */}
        <form onSubmit={handleSubmit} className="px-6 py-8" autoComplete="off">
          {error && (
            <div className="mb-4 text-sm text-red-600 bg-red-50 p-3 rounded">
              {error}
            </div>
          )}

          {/* 아이디/이메일 */}
          <label className="block text-sm font-medium text-gray-700">
            {t("login.idOrEmail")}
          </label>
          <input
            value={loginInput}
            onChange={(e) => setLoginInput(e.target.value)}
            type="text"
            placeholder={t("login.placeholderIdOrEmail")}
            className="mt-1 mb-4 w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300"
          />

          {/* 비밀번호 */}
          <label className="block text-sm font-medium text-gray-700">
            {t("login.password")}
          </label>
          <div className="relative mt-1 mb-4">
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type={showPw ? "text" : "password"}
              placeholder={t("login.placeholderPassword")}
              className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300"
            />
            <button
              type="button"
              onClick={() => setShowPw((s) => !s)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-600"
            >
              {showPw ? t("login.hidePw") : t("login.showPw")}
            </button>
          </div>

          {/* 옵션 */}
          <div className="flex items-center justify-between mb-6">
            <label className="inline-flex items-center">
              <input
                type="checkbox"
                className="form-checkbox h-4 w-4 text-indigo-600"
              />
              <span className="ml-2 text-sm text-gray-600">
                {t("login.remember")}
              </span>
            </label>
            <Link
              to="/signup"
              className="text-sm text-indigo-600 hover:underline"
            >
              {t("login.signup")}
            </Link>
          </div>

          {/* 로그인 버튼 */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-lg font-semibold transition ${
              loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-indigo-900 text-white hover:bg-indigo-800"
            }`}
          >
            {loading ? t("login.loading") : t("login.submit")}
          </button>

          {/* 소셜 로그인 */}
          <div className="mt-5">
            <div className="text-center text-sm text-gray-400">
              {t("login.or")}
            </div>
            <div className="mt-4 flex gap-3">
              <button
                type="button"
                className="w-1/2 py-2 rounded-lg border flex items-center justify-center gap-2"
              >
                <span className="text-sm">{t("login.kakao")}</span>
              </button>
              <button
                type="button"
                className="w-1/2 py-2 rounded-lg border flex items-center justify-center gap-2"
              >
                <span className="text-sm">{t("login.naver")}</span>
              </button>
            </div>
          </div>
        </form>

        {/* 푸터 */}
        <div className="px-6 py-4 text-xs text-center text-gray-500 bg-gray-50">
          <Link to="/terms" className="hover:underline mr-4">
            {t("login.terms")}
          </Link>
          <Link to="/privacy" className="hover:underline">
            {t("login.privacy")}
          </Link>
        </div>
      </div>
    </div>
  );
}
