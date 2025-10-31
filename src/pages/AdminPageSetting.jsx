import { useEffect, useState } from "react";
import axios from "axios";
import { Button, Input, Table, Space, message, Upload } from "antd";
import { UploadOutlined } from "@ant-design/icons";

const AdminPageSetting = () => {
  const [pages, setPages] = useState([]);
  const [newPage, setNewPage] = useState({ name: "", label: "", order: 0, image: "" });
  const [loading, setLoading] = useState(false);
  const token = localStorage.getItem("token");

  // ✅ 페이지 목록 불러오기
  const fetchPages = async () => {
    try {
      const res = await axios.get("/api/pages");
      const sorted = res.data.sort((a, b) => a.order - b.order);
      setPages(sorted);
    } catch (err) {
      console.error("❌ 페이지 목록 불러오기 실패:", err);
      message.error("페이지 목록을 불러오지 못했습니다.");
    }
  };

  useEffect(() => {
    fetchPages();
  }, []);

  // ✅ Cloudinary 업로드
  const handleImageUpload = async ({ file }) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", import.meta.env.VITE_CLOUDINARY_PRESET);
    try {
      const res = await axios.post(
        `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/upload`,
        formData
      );
      const imageUrl = res.data.secure_url;
      setNewPage((prev) => ({ ...prev, image: imageUrl }));
      message.success("탭 이미지 업로드 완료");
    } catch (err) {
      console.error(err);
      message.error("이미지 업로드 실패");
    }
  };

  // ✅ 새 페이지 추가
  const handleAdd = async () => {
    if (!newPage.name || !newPage.label) {
      message.warning("이름(name)과 표시명(label)을 모두 입력해주세요.");
      return;
    }

    try {
      setLoading(true);
      await axios.post("/api/pages", newPage, {
        headers: { Authorization: `Bearer ${token}` },
      });
      message.success("새 페이지가 추가되었습니다.");
      setNewPage({ name: "", label: "", order: 0, image: "" });
      fetchPages();
    } catch (err) {
      console.error("❌ 새 페이지 추가 실패:", err);
      if (err.response?.status === 401)
        message.error("로그인이 필요하거나 관리자 권한이 없습니다.");
      else message.error(err.response?.data?.message || "페이지 추가 실패");
    } finally {
      setLoading(false);
    }
  };

  // ✅ 페이지 삭제
  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/pages/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      message.success("페이지가 삭제되었습니다.");
      fetchPages();
    } catch (err) {
      console.error("❌ 페이지 삭제 실패:", err);
      message.error("페이지 삭제 중 오류가 발생했습니다.");
    }
  };

  // ✅ 순서 변경 (up/down)
  const movePage = async (id, direction) => {
    const index = pages.findIndex((p) => p._id === id);
    if (index === -1) return;

    const newPages = [...pages];
    if (direction === "up" && index > 0) {
      [newPages[index - 1], newPages[index]] = [newPages[index], newPages[index - 1]];
    } else if (direction === "down" && index < newPages.length - 1) {
      [newPages[index + 1], newPages[index]] = [newPages[index], newPages[index + 1]];
    } else return;

    const updated = newPages.map((p, i) => ({ ...p, order: i + 1 }));
    setPages(updated);

    try {
      await Promise.all(
        updated.map((p) =>
          axios.put(`/api/pages/${p._id}`, { order: p.order }, {
            headers: { Authorization: `Bearer ${token}` },
          })
        )
      );
      message.success("순서가 업데이트되었습니다.");
      fetchPages();
    } catch (err) {
      console.error("❌ 순서 업데이트 실패:", err);
      message.error("순서 변경 중 오류가 발생했습니다.");
    }
  };

  // ✅ 테이블 컬럼
  const columns = [
    {
      title: "이미지",
      dataIndex: "image",
      render: (img) =>
        img ? (
          <img
            src={img}
            alt="page"
            style={{
              width: 80,
              height: 50,
              objectFit: "cover",
              borderRadius: 8,
              border: "1px solid #ddd",
            }}
          />
        ) : (
          <span style={{ color: "#999" }}>없음</span>
        ),
    },
    { title: "Name", dataIndex: "name" },
    { title: "Label", dataIndex: "label" },
    { title: "Order", dataIndex: "order", sorter: (a, b) => a.order - b.order },
    {
      title: "순서",
      render: (_, record) => (
        <Space>
          <Button size="small" onClick={() => movePage(record._id, "up")}>
            ▲
          </Button>
          <Button size="small" onClick={() => movePage(record._id, "down")}>
            ▼
          </Button>
        </Space>
      ),
    },
    {
      title: "삭제",
      render: (_, record) => (
        <Button danger onClick={() => handleDelete(record._id)}>
          삭제
        </Button>
      ),
    },
  ];

  return (
    <div className="p-6 max-w-5xl mx-auto bg-white rounded-xl shadow">
      <h2 className="text-2xl font-bold mb-4">🗂 페이지(탭) 설정</h2>
      <Space direction="horizontal" wrap>
        <Input
          placeholder="이름(name)"
          value={newPage.name}
          onChange={(e) => setNewPage({ ...newPage, name: e.target.value })}
          style={{ width: 180 }}
        />
        <Input
          placeholder="표시명(label)"
          value={newPage.label}
          onChange={(e) => setNewPage({ ...newPage, label: e.target.value })}
          style={{ width: 180 }}
        />
        <Input
          type="number"
          placeholder="순서(order)"
          value={newPage.order}
          onChange={(e) => setNewPage({ ...newPage, order: Number(e.target.value) })}
          style={{ width: 120 }}
        />
        <Upload
          showUploadList={false}
          customRequest={handleImageUpload}
          accept="image/*"
        >
          <Button icon={<UploadOutlined />}>이미지 업로드</Button>
        </Upload>
        <Button onClick={handleAdd} type="primary" loading={loading}>
          ➕ 추가
        </Button>
      </Space>

      {newPage.image && (
        <img
          src={newPage.image}
          alt="미리보기"
          style={{
            width: 100,
            height: 60,
            objectFit: "cover",
            borderRadius: 6,
            marginTop: 10,
            border: "1px solid #ccc",
          }}
        />
      )}

      <Table
        dataSource={pages}
        columns={columns}
        rowKey="_id"
        pagination={false}
        className="mt-6"
      />
    </div>
  );
};

export default AdminPageSetting;
