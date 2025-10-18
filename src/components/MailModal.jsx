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
        if (!token) {
          setError("로그인이 필요합니다.");
          setLoading(false);
          return;
        }

        const res = await fetch(API_URL, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();
        console.log("📬 메일함 응답:", data); // ✅ 콘솔에 응답 출력 (디버깅용)

        if (!res.ok) {
          throw new Error(data.message || "메일을 불러올 수 없습니다.");
        }

        setReplies(data.replies || []);
      } catch (err) {
        console.error("메일 로드 중 오류:", err);
        setError(err.message || "서버 오류가 발생했습니다.");
      } finally {
        setLoading(false);
      }
    }

    fetchReplies();
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
      onClick={onClose} // ✅ 배경 클릭 시 닫기
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
        onClick={(e) => e.stopPropagation()} // ✅ 내부 클릭 시 닫히지 않게
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
            color: "#666",
          }}
          title="닫기"
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

        {/* 로딩 / 에러 / 데이터 표시 */}
        {loading ? (
          <p style={{ textAlign: "center", color: "#777" }}>불러오는 중...</p>
        ) : error ? (
          <p style={{ textAlign: "center", color: "red" }}>❌ {error}</p>
        ) : replies.length === 0 ? (
          <p style={{ textAlign: "center", color: "#555" }}>
            받은 답장이 없습니다.
          </p>
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
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    marginBottom: "8px",
                  }}
                >
                  <MailOpen size={20} color="#555" />
                  <h3
                    style={{
                      fontSize: "18px",
                      fontWeight: "600",
                      margin: 0,
                    }}
                  >
                    {reply.inquiryTitle || "제목 없음"}
                  </h3>
                </div>

                <p
                  style={{
                    fontSize: "15px",
                    color: "#444",
                    marginTop: "4px",
                    whiteSpace: "pre-line",
                  }}
                >
                  {reply.message}
                </p>

                <p
                  style={{
                    fontSize: "13px",
                    color: "#777",
                    marginTop: "8px",
                  }}
                >
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
