// 📁 src/pages/AdminProducts.jsx
import { useEffect, useState } from "react";
import axios from "axios";
import { Table, Button, Space, Popconfirm, message } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import AdminProductForm from "./AdminProductForm";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [editingProduct, setEditingProduct] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { i18n } = useTranslation();
  const currentLang = (i18n.language || "ko").split("-")[0];

  // ✅ 언어별 상품명 가져오기 (i18nNames → ko/en/th → name 순으로 fallback)
 const getProductName = (product) => {
   if (product.i18nNames && typeof product.i18nNames === "object") {
     return (
       product.i18nNames[currentLang] ||
       product.i18nNames.ko ||
       product.name ||
       "이름 없음"
     );
   }
   return product.name || "이름 없음";
 };

  // ✅ 상품 목록 불러오기
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

  // ✅ 삭제
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

  // ✅ 폼 저장 후 목록 갱신
  const handleSave = () => {
    setShowForm(false);
    setEditingProduct(null);
    fetchProducts();
  };

  // ✅ 테이블 컬럼 정의
  const columns = [
    {
      title: "이미지",
         // ✅ record에서 mainImage 또는 images[0] 사용
   render: (_, record) => {
     const img = record.mainImage || (record.images && record.images[0]);
     return img ? (
       <img
         src={img}
         alt="상품 이미지"
         className="w-16 h-16 object-cover rounded-lg"
       />
     ) : (
       "없음"
     );
   },
    },

     {
   title: "상품명",
   render: (_, record) => getProductName(record),
 },

    {
      title: "가격",
      dataIndex: "price",
      render: (p) =>
        typeof p === "number" ? `${p.toLocaleString()}원` : "가격 없음",
    },
    {
      title: "페이지(탭)",
      dataIndex: ["categoryPage", "label"],
      render: (label) => label || "미지정",
    },
    {
      title: "관리",
      render: (_, record) => (
        <Space>
          {/* ✅ 수정 버튼 - AdminProductEdit.jsx 페이지로 이동 */}
          <Button
            icon={<EditOutlined />}
            onClick={() => navigate(`/admin/products/${record._id}/edit`)}
          >
            수정
          </Button>

          {/* ✅ 삭제 버튼 */}
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

  // ✅ 렌더링
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

          {/* ✅ 상품 테이블 */}
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
