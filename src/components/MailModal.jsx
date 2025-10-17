// 📁 src/components/MailModal.jsx
import { useEffect, useState } from "react";
import { X, Trash2, MailOpen } from "lucide-react";

export default function MailModal({ onClose }) {
  const [replies, setReplies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const API_URL = "https://shop-backend-1-dfsl.onrender.com/api/support/replies"; // ✅ 관리자 답장 불러오는 API

  const token = localStorage.getItem("token");

  useEffect(() => {
    async function fetchReplies() {
      try {
        const res = await fetch(API_URL, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();

        if (!res.ok) throw new Error(data.message || "메일을 불러올 수 없습니다.");
        setReplies(data.replies || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    if (token) fetchReplies();
  }, [token]);

  async function handleDelete(id) {
    if (!window.confirm("정말 이 메일을 삭제하시겠습니까?")) return;

    try {
      const res = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "삭제 실패");

      setReplies((prev) => prev.filter((r) => r._id !== id));
    } catch (err) {
      alert(err.message);
    }
  }

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        background: "rgba(0,0,0,0.6)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
      }}
    >
      <div
        style={{
          background: "white",
          borderRadius: "20px",
          width: "90%",
          maxWidth: "600px",
          maxHeight: "80vh",
          overflowY: "auto",
          position: "relative",
          padding: "30px 20px",
          boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
        }}
      >
        {/* 닫기 버튼 */}
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: "20px",
            right: "20px",
            border: "none",
            background: "transparent",
            cursor: "pointer",
          }}
        >
          <X size={26} />
        </button>

        <h2
          style={{
            textAlign: "center",
            fontSize: "24px",
            fontWeight: "700",
            marginBottom: "20px",
          }}
        >
          📬 관리자 답장함
        </h2>

        {loading ? (
          <p className="text-center text-gray-500">불러오는 중...</p>
        ) : error ? (
          <p className="text-center text-red-600">{error}</p>
        ) : replies.length === 0 ? (
          <p className="text-center text-gray-500">받은 답장이 없습니다.</p>
        ) : (
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {replies.map((reply) => (
              <li
                key={reply._id}
                style={{
                  border: "1px solid #e5e7eb",
                  borderRadius: "12px",
                  padding: "15px",
                  marginBottom: "15px",
                  backgroundColor: "#fafafa",
                  position: "relative",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <MailOpen size={20} color="#555" />
                  <h3 style={{ fontSize: "18px", fontWeight: "600", margin: 0 }}>
                    {reply.inquiryTitle || "제목 없음"}
                  </h3>
                </div>
                <p
                  style={{
                    fontSize: "15px",
                    color: "#444",
                    marginTop: "8px",
                    whiteSpace: "pre-line",
                  }}
                >
                  {reply.message}
                </p>
                <p style={{ fontSize: "13px", color: "#777", marginTop: "5px" }}>
                  📅 {new Date(reply.createdAt).toLocaleString()}
                </p>

                {/* 삭제 버튼 */}
                <button
                  onClick={() => handleDelete(reply._id)}
                  style={{
                    position: "absolute",
                    top: "10px",
                    right: "10px",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                  }}
                  title="삭제"
                >
                  <Trash2 size={20} color="#999" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
