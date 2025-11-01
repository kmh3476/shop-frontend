// 📁 src/components/MailModal.jsx
import { useEffect, useState } from "react";
import { X, Trash2, MailOpen, CheckSquare, Square } from "lucide-react";

export default function MailModal({ onClose }) {
  const [replies, setReplies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedMail, setSelectedMail] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]); // ✅ 선택된 메일 ID 저장

  const API_URL = "https://shop-backend-1-dfsl.onrender.com/api/support/replies";
  const token = localStorage.getItem("token");

  // ✅ 로그인 확인 및 토큰 검증
  useEffect(() => {
    if (!token) {
      setError("로그인이 필요합니다.");
      setLoading(false);
    }
  }, [token]);

  // ✅ 메일 목록 불러오기
  useEffect(() => {
    async function fetchReplies() {
      try {
        if (!token) return;

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

    if (token) fetchReplies();
  }, [token]);

  // ✅ 개별 삭제
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
      setSelectedIds((prev) => prev.filter((sid) => sid !== id));
    } catch (err) {
      alert(err.message);
    }
  }

  // ✅ 여러 개 삭제
  async function handleBulkDelete() {
    if (selectedIds.length === 0) return alert("삭제할 메일을 선택하세요.");
    if (!window.confirm(`${selectedIds.length}개의 메일을 삭제하시겠습니까?`))
      return;

    // 순차 삭제
    for (const id of selectedIds) {
      await handleDelete(id);
    }
    setSelectedIds([]);
  }

  // ✅ 개별 선택 토글
  const toggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((sid) => sid !== id) : [...prev, id]
    );
  };

  // ✅ 전체 선택/해제
  const toggleSelectAll = () => {
    if (selectedIds.length === replies.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(replies.map((r) => r._id));
    }
  };

  // ✅ 렌더링
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
          maxWidth: "650px",
          maxHeight: "85vh",
          overflowY: "auto",
          position: "relative",
          padding: "30px 20px",
          boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
        }}
        onClick={(e) => e.stopPropagation()}
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

        {/* 타이틀 */}
        <h2
          style={{
            textAlign: "center",
            fontSize: "24px",
            fontWeight: "700",
            marginBottom: "10px",
          }}
        >
          📬 관리자 답장함
        </h2>

        {/* ✅ 전체선택 / 선택삭제 버튼 */}
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
            gap: "12px",
            marginBottom: "15px",
          }}
        >
          <button
            onClick={toggleSelectAll}
            style={{
              background: "#f3f3f3",
              border: "1px solid #ccc",
              borderRadius: "6px",
              padding: "6px 10px",
              cursor: "pointer",
            }}
          >
            {selectedIds.length === replies.length ? "선택 해제" : "전체 선택"}
          </button>
          <button
            onClick={handleBulkDelete}
            style={{
              background: "#ff4d4f",
              color: "white",
              border: "none",
              borderRadius: "6px",
              padding: "6px 10px",
              cursor: "pointer",
            }}
          >
            선택 삭제
          </button>
        </div>

        {/* ✅ 로딩/에러/데이터 표시 */}
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
                onClick={() => setSelectedMail(reply)}
                style={{
                  border: "1px solid #e5e7eb",
                  borderRadius: "12px",
                  padding: "15px",
                  marginBottom: "15px",
                  backgroundColor: "#fafafa",
                  position: "relative",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "10px",
                }}
              >
                {/* ✅ 체크박스 */}
                <div onClick={(e) => e.stopPropagation()}>
                  {selectedIds.includes(reply._id) ? (
                    <CheckSquare
                      color="#007bff"
                      onClick={() => toggleSelect(reply._id)}
                      style={{ cursor: "pointer" }}
                    />
                  ) : (
                    <Square
                      color="#aaa"
                      onClick={() => toggleSelect(reply._id)}
                      style={{ cursor: "pointer" }}
                    />
                  )}
                </div>

                {/* ✅ 메일 내용 */}
                <div style={{ flexGrow: 1 }}>
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
                </div>

                {/* ✅ 삭제 버튼 */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(reply._id);
                  }}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    marginLeft: "auto",
                  }}
                  title="삭제"
                >
                  <Trash2 size={20} color="#999" />
                </button>
              </li>
            ))}
          </ul>
        )}

        {/* ✅ 선택된 메일 상세 보기 모달 */}
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
              {/* 닫기 버튼 */}
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

              {/* 내가 쓴 문의 */}
              <div
                style={{
                  marginBottom: "25px",
                  background: "#f9f9f9",
                  padding: "15px",
                  borderRadius: "10px",
                  border: "1px solid #eee",
                }}
              >
                <p style={{ fontWeight: "600", color: "#333", marginBottom: "6px" }}>
                  ✉️ 내가 보낸 문의
                </p>
                <p
                  style={{
                    fontSize: "15px",
                    color: "#444",
                    whiteSpace: "pre-line",
                    lineHeight: "1.6",
                  }}
                >
                  {selectedMail.inquiryMessage || "내용을 불러올 수 없습니다."}
                </p>
              </div>

              {/* 관리자 답장 */}
              <div
                style={{
                  background: "#fff5e6",
                  padding: "15px",
                  borderRadius: "10px",
                  border: "1px solid #f0c36d",
                }}
              >
                <p
                  style={{
                    fontWeight: "600",
                    color: "#c27800",
                    marginBottom: "6px",
                  }}
                >
                  🧑‍💼 관리자 답장
                </p>
                <p
                  style={{
                    fontSize: "15px",
                    color: "#555",
                    whiteSpace: "pre-line",
                    lineHeight: "1.6",
                  }}
                >
                  {selectedMail.adminReply}
                </p>
              </div>

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
