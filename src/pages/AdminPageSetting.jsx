import { useEffect, useState } from "react";
import axios from "axios";
import { Button, Input, Table, Space } from "antd";

const AdminPageSetting = () => {
  const [pages, setPages] = useState([]);
  const [newPage, setNewPage] = useState({ name: "", label: "", order: 0 });

  const fetchPages = () =>
    axios.get("/api/pages").then((res) => setPages(res.data));

  useEffect(() => {
    fetchPages();
  }, []);

  const handleAdd = () => {
    axios.post("/api/pages", newPage).then(() => {
      setNewPage({ name: "", label: "", order: 0 });
      fetchPages();
    });
  };

  const handleDelete = (id) => {
    axios.delete(`/api/pages/${id}`).then(fetchPages);
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
          onChange={(e) => setNewPage({ ...newPage, order: e.target.value })}
        />
        <Button onClick={handleAdd} type="primary">
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
