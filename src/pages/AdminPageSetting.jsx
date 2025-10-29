import { useEffect, useState } from "react";
import axios from "axios";
import { Button, Input, Table, Space, message } from "antd";

const AdminPageSetting = () => {
  const [pages, setPages] = useState([]);
  const [newPage, setNewPage] = useState({ name: "", label: "", order: 0 });
  const [loading, setLoading] = useState(false);

  // ✅ 로컬스토리지나 context에서 관리자 토큰 가져오기
  const token = localStorage.getItem("token");

  // ✅ 페이지 목록 불러오기
  const fetchPages = async () => {
    try {
      const res = await axios.get("/api/pages");
      setPages(res.data);
    } catch (err) {
      console.error("❌ 페이지 목록 불러오기 실패:", err);
      message.error("페이지 목록을 불러오지 못했습니다.");
    }
  };

  useEffect(() => {
    fetchPages();
  }, []);

  // ✅ 새 페이지 추가
  const handleAdd = async () => {
    if (!newPage.name || !newPage.label) {
      message.warning("이름(name)과 표시명(label)을 모두 입력해주세요.");
      return;
    }

    try {
      setLoading(true);
      await axios.post("/api/pages", newPage, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      message.success("새 페이지가 추가되었습니다.");
      setNewPage({ name: "", label: "", order: 0 });
      fetchPages();
    } catch (err) {
      console.error("❌ 새 페이지 추가 실패:", err);
      if (err.response?.status === 401)
        message.error("로그인이 필요하거나 관리자 권한이 없습니다.");
      else if (err.response?.data?.message)
        message.error(err.response.data.message);
      else message.error("페이지 추가 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  // ✅ 페이지 삭제
  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/pages/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      message.success("페이지가 삭제되었습니다.");
      fetchPages();
    } catch (err) {
      console.error("❌ 페이지 삭제 실패:", err);
      if (err.response?.status === 401)
        message.error("관리자 권한이 없습니다.");
      else message.error("페이지 삭제 중 오류가 발생했습니다.");
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">페이지(탭) 설정</h2>
      <Space>
        <Input
          placeholder="이름(name)"
          value={newPage.name}
          onChange={(e) => setNewPage({ ...newPage, name: e.target.value })}
        />
        <Input
          placeholder="표시명(label)"
          value={newPage.label}
          onChange={(e) => setNewPage({ ...newPage, label: e.target.value })}
        />
        <Input
          type="number"
          placeholder="순서(order)"
          value={newPage.order}
          onChange={(e) =>
            setNewPage({ ...newPage, order: Number(e.target.value) })
          }
        />
        <Button onClick={handleAdd} type="primary" loading={loading}>
          추가
        </Button>
      </Space>

      <Table
        dataSource={pages}
        columns={[
          { title: "Name", dataIndex: "name" },
          { title: "Label", dataIndex: "label" },
          { title: "Order", dataIndex: "order" },
          {
            title: "삭제",
            render: (_, record) => (
              <Button danger onClick={() => handleDelete(record._id)}>
                삭제
              </Button>
            ),
          },
        ]}
        rowKey="_id"
        className="mt-6"
      />
    </div>
  );
};

export default AdminPageSetting;
