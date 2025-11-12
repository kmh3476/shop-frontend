import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  useLocation,
  useNavigate,
  Navigate,
} from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import CleanLayout from "./layouts/CleanLayout";

import Admin from "./pages/Admin";
import ProductList from "./pages/ProductList";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import Signup from "./pages/Signup";
import FindId from "./pages/FindId";
import ForgotPassword from "./pages/ForgotPassword";
import Support from "./pages/Support";
import AdminSupport from "./pages/AdminSupport";
import ProductSupport from "./pages/ProductSupport";
import AdminProducts from "./pages/AdminProducts";  // ✅ 관리자 상품 관리 페이지
import AdminProductEdit from "./pages/AdminProductEdit";  // ✅ 관리자 상품 수정 페이지

import { useState, useEffect } from "react";
import { useAuth } from "./context/AuthContext";
import { Mail } from "lucide-react";
import MailModal from "./components/MailModal";
import { SiteSettingsProvider } from "./context/SiteSettingsContext";
import { EditModeProvider } from "./context/EditModeContext";
import AdminToolbar from "./components/AdminToolbar";
import Page from "./pages/Page";
import "./i18n";
import { useTranslation } from "react-i18next";
import LanguageSelector from "./components/LanguageSelector";

/* -------------------- ✅ 로그인 페이지 -------------------- */
function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { t } = useTranslation(); // ✅ 추가됨
  const [loginInput, setLoginInput] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const API_URL = `${import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "")}/api/auth/login`;

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!loginInput || !password)
      return setError(t("auth.missingCredentials")); // ✅ 다국어 적용

    try {
      setLoading(true);

      const payload = loginInput.includes("@")
        ? { email: loginInput, password }
        : { userId: loginInput, password };

      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || t("auth.loginFailed")); // ✅

      if (data.token && data.user) {
        login(data.user, data.token);
        alert(t("auth.loginSuccess")); // ✅
        navigate("/products");
      } else throw new Error(t("auth.invalidResponse")); // ✅
    } catch (err) {
  console.error("로그인 오류:", err);
  const msg = err.message;

  // ✅ 한국어 원문을 번역 키로 매핑
  const translated =
    msg.includes("존재하지 않는 계정") ? t("auth.noSuchAccount") :
    msg.includes("비밀번호가 틀립니다") ? t("auth.wrongPassword") :
    t("auth.loginFailed");

  setError(translated);
}
 finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 text-gray-900 font-['Pretendard'] px-6">
      <div className="bg-white rounded-2xl shadow-lg p-10 w-full max-w-md">
        <h2 className="text-3xl font-bold mb-6 text-center">
          {t("auth.loginTitle")}
        </h2>
        {error && (
          <div className="mb-4 text-sm text-red-600 bg-red-50 p-3 rounded">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="text"
            placeholder={t("auth.inputIdOrEmail")} // ✅
            value={loginInput}
            onChange={(e) => setLoginInput(e.target.value)}
            className="border border-gray-300 rounded-lg p-3 focus:outline-none focus:border-gray-600"
          />
          <input
            type="password"
            placeholder={t("auth.inputPassword")} // ✅
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border border-gray-300 rounded-lg p-3 focus:outline-none focus:border-gray-600"
          />
          <button
            type="submit"
            disabled={loading}
            className={`bg-black text-white py-3 rounded-lg mt-2 hover:bg-gray-800 transition ${
              loading ? "opacity-70" : ""
            }`}
          >
            {loading ? t("button.loggingIn") : t("button.login")} {/* ✅ */}
          </button>
        </form>

        <div className="flex justify-between mt-4 text-sm text-gray-500">
          <Link to="/find-id" className="hover:text-black">
            {t("auth.findId")}
          </Link>
          <Link to="/forgot-password" className="hover:text-black">
            {t("auth.findPassword")}
          </Link>
        </div>

        <p className="mt-4 text-center text-gray-500">
          {t("auth.noAccount")}{" "}
          <Link to="/signup" className="text-black font-semibold">
            {t("auth.signup")}
          </Link>
        </p>
      </div>
    </div>
  );
}
/* -------------------- ✅ 관리자 보호 라우트 -------------------- */
function AdminRoute({ children }) {
  const { user } = useAuth();
  const { t } = useTranslation(); // ✅ 다국어 훅 추가

  if (!user) return <Navigate to="/login" replace />;
  if (!user.isAdmin)
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-center text-gray-700">
        <h2 className="text-2xl font-bold mb-4">🚫 {t("error.accessDeniedTitle")}</h2>
        <p>{t("error.accessDeniedMessage")}</p>
        <Link to="/" className="text-blue-500 underline mt-4">
          {t("button.goHome")}
        </Link>
      </div>
    );
  return children;
}

/* -------------------- ✅ 네비게이션 -------------------- */
function Navigation() {
  const location = useLocation();
  const isHome = location.pathname === "/";
  const [isOpen, setIsOpen] = useState(false);
  const [showMailModal, setShowMailModal] = useState(false);
  const { user, logout } = useAuth();
  const { t } = useTranslation(); // ✅ 다국어 적용
  const [panelWidth, setPanelWidth] = useState("400px");
  const [panelHeight, setPanelHeight] = useState("100vh");

  useEffect(() => {
    const updatePanelSize = () => {
      const width = window.innerWidth;
      setPanelWidth(width <= 1600 ? "400px" : "400px");
      setPanelHeight("400vh");
    };
    updatePanelSize();
    window.addEventListener("resize", updatePanelSize);
    document.body.style.overflow = isOpen ? "hidden" : "auto";
    return () => {
      document.body.style.overflow = "auto";
      window.removeEventListener("resize", updatePanelSize);
    };
  }, [isOpen]);

  const isActive = (path) => location.pathname.startsWith(path);

  return (
    <>
      {/* 🔹 햄버거 버튼 */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: "fixed",
          top: "30px",
          right: "30px",
          zIndex: 300,
          backgroundColor: isHome
            ? "rgba(0,0,0,0.8)"
            : "rgba(255,255,255,0.9)",
          borderRadius: "30%",
          padding: "18px",
          width: "120px",
          height: "120px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "18px",
          boxShadow: "0 6px 18px rgba(0,0,0,0.4)",
          cursor: "pointer",
          transition: "all 0.3s ease",
        }}
      >
        <div
          style={{
            width: "80px",
            height: "10px",
            backgroundColor: isHome ? "white" : "#333",
            transform: isOpen ? "rotate(45deg) translate(20px, 18px)" : "none",
            transition: "transform 0.3s ease",
          }}
        />
        <div
          style={{
            width: "80px",
            height: "10px",
            backgroundColor: isHome ? "white" : "#333",
            opacity: isOpen ? 0 : 1,
            transition: "opacity 0.3s ease",
          }}
        />
        <div
          style={{
            width: "80px",
            height: "10px",
            backgroundColor: isHome ? "white" : "#333",
            transform: isOpen
              ? "rotate(-45deg) translate(20px, -18px)"
              : "none",
            transition: "transform 0.3s ease",
          }}
        />
      </div>

      {/* 🔹 메뉴 패널 */}
      <div
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          width: panelWidth,
          height: panelHeight,
          backgroundColor: "white",
          zIndex: 250,
          transform: isOpen ? "translateX(0)" : "translateX(100%)",
          transition:
            "transform 0.4s ease-in-out, width 0.3s ease, height 0.3s ease",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "flex-start",
          paddingTop: "120px",
          overflowY: "auto",
          boxShadow: isOpen ? "-8px 0 20px rgba(0,0,0,0.1)" : "none",
        }}
      >
        {/* 사용자 정보 */}
        <div
          style={{
            backgroundColor: "black",
            color: "white",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: "24px",
            fontSize: "28px",
            fontWeight: "600",
            padding: "20px 0",
            width: "100%",
          }}
        >
          {user ? (
            <>
              <span>
                {user.nickname || user.userId} {t("nav.greeting")}
              </span>
              <span>|</span>
              <button
                onClick={() => {
                  logout();
                  setIsOpen(false);
                }}
                style={{
                  color: "white",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                {t("button.logout")}
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                onClick={() => setIsOpen(false)}
                style={{ color: "white" }}
              >
                {t("button.login")}
              </Link>
              <span>|</span>
              <Link
                to="/signup"
                onClick={() => setIsOpen(false)}
                style={{ color: "white" }}
              >
                {t("button.signup")}
              </Link>
            </>
          )}
        </div>

        {/* ✅ 메일함 아이콘 */}
        {!!user?.userId && isOpen && (
          <Mail
            style={{
              position: "absolute",
              top: "35px",
              right: "300px",
              width: "55px",
              height: "55px",
              color: "#000",
              zIndex: 9999,
              cursor: "pointer",
            }}
            onClick={() => setShowMailModal(true)}
          />
        )}

        {/* 메뉴 항목 */}
        <nav style={{ marginTop: "60px", width: "80%" }}>
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {[...(user?.isAdmin
              ? [
                  { path: "/admin", label: t("nav.adminHome") },
                  { path: "/admin/support", label: t("nav.adminSupport") },
                ]
              : []),
              { path: "/products", label: t("nav.products") },
              { path: "/cart", label: t("nav.cart") },
              { path: "/support", label: t("nav.support") },
            ].map((item) => (
              <li
                key={item.path}
                style={{
                  marginBottom: "40px",
                  fontSize: "30px",
                  fontWeight: isActive(item.path) ? "900" : "700",
                  textAlign: "center",
                }}
              >
                <Link
                  to={item.path}
                  onClick={() => setIsOpen(false)}
                  style={{
                    color: isActive(item.path) ? "#000" : "#444",
                    textDecoration: isActive(item.path)
                      ? "underline"
                      : "none",
                  }}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      {/* ✅ 메일 모달 */}
      {showMailModal && <MailModal onClose={() => setShowMailModal(false)} />}
    </>
  );
}
/* -------------------- ✅ 라우팅 -------------------- */
function InnerApp() {
  const { user } = useAuth();
  const { t } = useTranslation();

  useEffect(() => {
    const logEntry = {
      text: "App.jsx loaded",
      filePath: import.meta.url,
      componentName: "App",
      updatedAt: new Date().toISOString(),
      triggeredBy: user?.email || "unknown",
    };
    const prevLogs = JSON.parse(localStorage.getItem("editLogs") || "[]");
    localStorage.setItem("editLogs", JSON.stringify([...prevLogs, logEntry]));
  }, [user]);

  return (
    <SiteSettingsProvider>
      <Router>
        {/* ✅ 언어 선택 (전역 노출) */}
        <LanguageSelector />

        {/* ✅ 전역 관리자 툴바 */}
        <AdminToolbar />

        <Routes>
          {/* 홈 페이지 */}
          <Route path="/" element={<><MainLayout /><Navigation /></>} />

          {/* 일반 페이지 */}
          <Route
            element={
              <>
                <CleanLayout />
                <Navigation />
              </>
            }
          >
            <Route path="/products" element={<ProductList />} />
            <Route path="/products/:id" element={<ProductDetail />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/support" element={<Support />} />
            <Route path="/product-support" element={<ProductSupport />} />

            {/* 관리자 페이지 */}
            <Route
              path="/admin"
              element={
                <AdminRoute>
                  <Admin />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/support"
              element={
                <AdminRoute>
                  <AdminSupport />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/product-support"
              element={
                <AdminRoute>
                  <AdminSupport />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/products"
              element={
                <AdminRoute>
                  <AdminProducts />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/products/:id/edit"
              element={
                <AdminRoute>
                  <AdminProductEdit />
                </AdminRoute>
              }
            />

            {/* 인증 관련 */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/find-id" element={<FindId />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
          </Route>

          {/* 404 페이지 */}
          <Route
            path="*"
            element={
              <div style={{ padding: "40px", textAlign: "center" }}>
                <h2>🚫 {t("error.pageNotFound")}</h2>
                <Link
                  to="/"
                  style={{
                    marginTop: "10px",
                    display: "inline-block",
                    color: "#2563eb",
                    textDecoration: "underline",
                  }}
                >
                  {t("button.goHome")}
                </Link>
              </div>
            }
          />
        </Routes>
      </Router>
    </SiteSettingsProvider>
  );
}

/* -------------------- ✅ 전체 앱 구조 -------------------- */
function App() {
  return (
    <EditModeProvider>
      <InnerApp />
    </EditModeProvider>
  );
}

export default App;
