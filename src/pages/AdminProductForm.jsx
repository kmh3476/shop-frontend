import { useEffect, useState } from "react";
import axios from "axios";
import { Input, Button, Select, Upload, message } from "antd";
import { UploadOutlined } from "@ant-design/icons";

/**
 * ✅ 수정 사항
 * - props.selectedPage 추가 (현재 선택된 탭 ObjectId 자동 전달)
 * - useEffect로 selectedPage가 있으면 categoryPage 자동 세팅
 * - 기존 Select는 그대로 두되, selectedPage가 있으면 자동 선택됨
 * - 나머지 로직, 스타일, 구조 전부 동일
 */

const AdminProductForm = ({ existingProduct, onSave, selectedPage }) => {
  const [product, setProduct] = useState(
    existingProduct || {
      name: "",
      description: "",
      price: "",
      image: "",
      categoryPage: "",
    }
  );

  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(false);

  // ✅ 탭 목록 불러오기
  useEffect(() => {
    axios
      .get("/api/pages")
      .then((res) => setPages(res.data))
      .catch((err) => console.error("❌ 페이지 목록 로드 실패:", err));
  }, []);

  // ✅ selectedPage가 있을 경우 자동 적용
  useEffect(() => {
    if (selectedPage && !existingProduct) {
      setProduct((prev) => ({
        ...prev,
        categoryPage: selectedPage,
      }));
    }
  }, [selectedPage, existingProduct]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProduct((prev) => ({ ...prev, [name]: value }));
  };

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
      setProduct((prev) => ({ ...prev, image: res.data.secure_url }));
      message.success("이미지 업로드 완료");
    } catch (err) {
      console.error("❌ 업로드 오류:", err);
      message.error("이미지 업로드 실패");
    }
  };

  // ✅ 상품 저장
  const handleSubmit = async () => {
    if (!product.name || !product.price || !product.categoryPage) {
      message.warning("상품명, 가격, 탭을 모두 입력하세요");
      return;
    }

    setLoading(true);
    try {
      if (existingProduct) {
        await axios.put(`/api/products/${existingProduct._id}`, product);
        message.success("상품이 수정되었습니다");
      } else {
        await axios.post("/api/products", product);
        message.success("상품이 등록되었습니다");
      }
      onSave?.();
    } catch (err) {
      console.error("❌ 저장 실패:", err);
      message.error("저장 실패");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto bg-white rounded-2xl shadow">
      <h2 className="text-xl font-bold mb-4">
        {existingProduct ? "상품 수정" : "상품 등록"}
      </h2>

      <div className="space-y-3">
        <Input
          placeholder="상품명"
          name="name"
          value={product.name}
          onChange={handleChange}
        />
        <Input.TextArea
          placeholder="상품 설명"
          name="description"
          rows={3}
          value={product.description}
          onChange={handleChange}
        />
        <Input
          placeholder="가격"
          name="price"
          type="number"
          value={product.price}
          onChange={handleChange}
        />

        {/* ✅ 탭 선택 (selectedPage 있으면 자동 선택) */}
        <Select
          placeholder="상품을 보여줄 페이지(탭) 선택"
          value={product.categoryPage}
          onChange={(value) => setProduct({ ...product, categoryPage: value })}
          className="w-full"
          disabled={!!selectedPage} // 자동 선택 시 수정 불가
        >
          {pages.map((page) => (
            <Select.Option key={page._id} value={page._id}>
              {page.label}
            </Select.Option>
          ))}
        </Select>

        {/* ✅ 이미지 업로드 */}
        <Upload
          showUploadList={false}
          customRequest={handleImageUpload}
          accept="image/*"
        >
          <Button icon={<UploadOutlined />}>이미지 업로드</Button>
        </Upload>

        {product.image && (
          <img
            src={product.image}
            alt="미리보기"
            className="w-40 h-40 object-cover rounded-lg mt-2"
          />
        )}

        <Button
          type="primary"
          block
          onClick={handleSubmit}
          loading={loading}
          className="mt-4"
        >
          {existingProduct ? "수정하기" : "등록하기"}
        </Button>
      </div>
    </div>
  );
};

export default AdminProductForm;
