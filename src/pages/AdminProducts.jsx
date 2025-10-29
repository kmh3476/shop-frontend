// src/pages/AdminProducts.jsx
import { useEffect, useState } from "react";
import axios from "axios";
import { Table, Button, Space, Popconfirm, message } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import AdminProductForm from "./AdminProductForm";

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [editingProduct, setEditingProduct] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);

  // 상품 목록 불러오기
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/api/products?populate=categoryPage");
      setProducts(res.data);
    } catch (err) {
      console.error(err);
      message.error("상품을 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // 삭제
  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/products/${id}`);
      message.success("상품이 삭제되었습니다");
      fetchProducts();
    } catch (err) {
      console.error(err);
      message.error("삭제 실패");
    }
  };

  // 폼 저장 후 목록 갱신
  const handleSave = () => {
    setShowForm(false);
    setEditingProduct(null);
    fetchProducts();
  };

  const columns = [
    {
      title: "이미지",
      dataIndex: "image",
      render: (img) =>
        img ? (
          <img
            src={img}
            alt="상품 이미지"
            className="w-16 h-16 object-cover rounded-lg"
          />
        ) : (
          "없음"
        ),
    },
    { title: "상품명", dataIndex: "name" },
    { title: "가격", dataIndex: "price", render: (p) => `${p.toLocaleString()}원` },
    {
      title: "페이지(탭)",
      dataIndex: ["categoryPage", "label"],
      render: (label) => label || "미지정",
    },
    {
      title: "관리",
      render: (_, record) => (
        <Space>
          <Button
            icon={<EditOutlined />}
            onClick={() => {
              setEditingProduct(record);
              setShowForm(true);
            }}
          >
            수정
          </Button>
          <Popconfirm
            title="삭제하시겠습니까?"
            onConfirm={() => handleDelete(record._id)}
          >
            <Button danger icon={<DeleteOutlined />}>
              삭제
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-6">
      {showForm ? (
        <div>
          <Button onClick={() => setShowForm(false)} className="mb-4">
            ← 목록으로 돌아가기
          </Button>
          <AdminProductForm
            existingProduct={editingProduct}
            onSave={handleSave}
          />
        </div>
      ) : (
        <>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">상품 관리</h2>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setShowForm(true)}
            >
              상품 추가
            </Button>
          </div>
          <Table
            dataSource={products}
            columns={columns}
            rowKey="_id"
            loading={loading}
            pagination={{ pageSize: 10 }}
          />
        </>
      )}
    </div>
  );
};

export default AdminProducts;
