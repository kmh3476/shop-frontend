// src/components/AuthForm.jsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginUser, registerUser } from "../api/auth";
import InputField from "./InputField";

export default function AuthForm({ mode }) {
  const navigate = useNavigate();
  const isLogin = mode === "login";

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isLogin) {
        await loginUser(formData.email, formData.password);
        navigate("/");
      } else {
        if (formData.password !== formData.confirmPassword) {
          setError("비밀번호가 일치하지 않습니다.");
          setLoading(false);
          return;
        }
        await registerUser(formData.email, formData.password);
        navigate("/login");
      }
    } catch (err) {
      setError(err.response?.data?.message || "오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white/10 backdrop-blur-md p-8 rounded-2xl w-full max-w-sm shadow-lg"
    >
      <h2 className="text-2xl font-semibold text-center mb-6">
        {isLogin ? "로그인" : "회원가입"}
      </h2>

      <InputField
        label="이메일"
        name="email"
        type="email"
        value={formData.email}
        onChange={handleChange}
        required
      />
      <InputField
        label="비밀번호"
        name="password"
        type="password"
        value={formData.password}
        onChange={handleChange}
        required
      />

      {!isLogin && (
        <InputField
          label="비밀번호 확인"
          name="confirmPassword"
          type="password"
          value={formData.confirmPassword}
          onChange={handleChange}
          required
        />
      )}

      {error && <p className="text-red-400 text-sm mt-2">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full mt-6 bg-white text-black font-semibold py-2 rounded-xl hover:bg-gray-200 transition disabled:opacity-50"
      >
        {loading ? "처리 중..." : isLogin ? "로그인" : "회원가입"}
      </button>

      <div className="text-sm text-center mt-4">
        {isLogin ? (
          <>
            계정이 없나요?{" "}
            <Link to="/register" className="text-blue-300 hover:underline">
              회원가입
            </Link>
          </>
        ) : (
          <>
            이미 계정이 있나요?{" "}
            <Link to="/login" className="text-blue-300 hover:underline">
              로그인
            </Link>
          </>
        )}
      </div>
    </form>
  );
}
