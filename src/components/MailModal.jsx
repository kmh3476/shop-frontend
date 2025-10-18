// 📁 src/components/MailModal.jsx
import { useEffect, useState } from "react";
import { X, Trash2, MailOpen } from "lucide-react";

export default function MailModal({ onClose }) {
  const [replies, setReplies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedMail, setSelectedMail] = useState(null); // ✅ 추가: 선택된 메일 상태

  const API_URL = "https://shop-backend-1-dfsl.onrender.com/api/support/replies";
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
        console.log("📬 메일함 응답:", data);

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
      onClick={onClose}
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
        onClick={(e) => e.stopPropagation()}
      >
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
                onClick={() => setSelectedMail(reply)} // ✅ 추가: 클릭 시 상세 보기
                style={{
                  border: "1px solid #e5e7eb",
                  borderRadius: "12px",
                  padding: "15px",
                  marginBottom: "15px",
                  backgroundColor: "#fafafa",
                  position: "relative",
                  cursor: "pointer", // ✅ 클릭 가능 표시
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

                <button
                  onClick={(e) => {
                    e.stopPropagation(); // ✅ 클릭 시 상세 보기로 안 넘어가게
                    handleDelete(reply._id);
                  }}
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

        {/* ✅ 추가: 선택된 메일 상세 보기 모달 */}
        {selectedMail && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100vw",
              height: "100vh",
              background: "rgba(0,0,0,0.7)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 10000,
            }}
            onClick={() => setSelectedMail(null)}
          >
            <div
              style={{
                background: "white",
                borderRadius: "20px",
                width: "90%",
                maxWidth: "600px",
                padding: "40px 30px",
                position: "relative",
                boxShadow: "0 10px 40px rgba(0,0,0,0.4)",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setSelectedMail(null)}
                style={{
                  position: "absolute",
                  top: "20px",
                  right: "20px",
                  border: "none",
                  background: "transparent",
                  cursor: "pointer",
                }}
                title="닫기"
              >
                <X size={28} />
              </button>

              <h3
                style={{
                  fontSize: "22px",
                  fontWeight: "700",
                  marginBottom: "16px",
                  borderBottom: "1px solid #ddd",
                  paddingBottom: "8px",
                }}
              >
                {selectedMail.inquiryTitle || "제목 없음"}
              </h3>

              <p
                style={{
                  fontSize: "16px",
                  color: "#444",
                  whiteSpace: "pre-line",
                  lineHeight: "1.6",
                }}
              >
                {selectedMail.message}
              </p>

              <p
                style={{
                  fontSize: "14px",
                  color: "#777",
                  marginTop: "20px",
                  textAlign: "right",
                }}
              >
                📅 {new Date(selectedMail.createdAt).toLocaleString()}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
