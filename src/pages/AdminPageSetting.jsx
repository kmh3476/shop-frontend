import { useEffect, useState } from "react";
import axios from "axios";
import { Button, Input, Table, Space, message, Upload, Switch } from "antd";
import { UploadOutlined } from "@ant-design/icons";

/** ✅ 관리자용 페이지 설정 (PageSetting CRUD + 다국어 확장) */
const AdminPageSetting = () => {
  const [pages, setPages] = useState([]);
  const [newPage, setNewPage] = useState({
    name: "",
    label: "",
    order: 0,
    image: "",
    categoryKey: "default", // ✅ 추가
    isActive: true, // ✅ 추가
    description: "", // ✅ 추가
    i18nLabels: { ko: "", en: "", th: "" }, // ✅ 추가
  });
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const apiUrl =
    import.meta.env.VITE_API_URL || "https://shop-backend-1-dfsl.onrender.com";

  const api = axios.create({ baseURL: apiUrl });

  const getToken = () =>
    localStorage.getItem("token") || sessionStorage.getItem("token");
  const getRefreshToken = () =>
    localStorage.getItem("refreshToken") || sessionStorage.getItem("refreshToken");

  /** ✅ 인터셉터 */
  useEffect(() => {
    const reqInterceptor = api.interceptors.request.use((config) => {
      const token = getToken();
      if (token) config.headers.Authorization = `Bearer ${token}`;
      return config;
    });

    const resInterceptor = api.interceptors.response.use(
      (res) => res,
      async (err) => {
        const original = err.config;
        if (
          err.response?.status === 401 &&
          !original._retry &&
          getRefreshToken()
        ) {
          if (original.url.includes("/api/pages")) {
            console.warn("⏳ 토큰 만료 감지, 자동 재발급 시도 중...");
          }
          original._retry = true;
          try {
            if (refreshing) {
              await new Promise((r) => setTimeout(r, 1000));
              const token = getToken();
              if (token) {
                original.headers.Authorization = `Bearer ${token}`;
                return api(original);
              }
            }

            setRefreshing(true);
            const res = await axios.post(`${apiUrl}/api/auth/refresh`, {
              token: getRefreshToken(),
            });

            const newAccess = res.data?.token;
            if (newAccess) {
              localStorage.setItem("token", newAccess);
              original.headers.Authorization = `Bearer ${newAccess}`;
              console.log("🔁 Access token 재발급 완료 → 요청 재시도");
              return api(original);
            } else throw new Error("갱신된 access token이 없습니다.");
          } catch (refreshErr) {
            console.error("❌ 토큰 갱신 실패:", refreshErr);
            message.error("세션이 만료되었습니다. 다시 로그인해주세요.");
            localStorage.removeItem("token");
            localStorage.removeItem("refreshToken");
            setTimeout(() => (window.location.href = "/admin-login"), 1000);
          } finally {
            setRefreshing(false);
          }
        }
        return Promise.reject(err);
      }
    );

    return () => {
      api.interceptors.request.eject(reqInterceptor);
      api.interceptors.response.eject(resInterceptor);
    };
  }, []);

  /** ✅ 페이지 목록 불러오기 */
  const fetchPages = async () => {
    try {
      const res = await api.get("/api/pages");
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

  /** ✅ Cloudinary 업로드 */
  const handleImageUpload = async ({ file }) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", import.meta.env.VITE_CLOUDINARY_PRESET);
    try {
      const res = await axios.post(
        `https://api.cloudinary.com/v1_1/${
          import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
        }/upload`,
        formData
      );
      const imageUrl = res.data.secure_url;
      setNewPage((p) => ({ ...p, image: imageUrl }));
      message.success("탭 이미지 업로드 완료");
    } catch (err) {
      console.error("❌ Cloudinary 업로드 실패:", err);
      message.error("이미지 업로드 실패");
    }
  };

  /** ✅ 새 페이지 추가 */
  const handleAdd = async () => {
    if (!newPage.name || !newPage.label) {
      message.warning("이름(name)과 표시명(label)을 모두 입력해주세요.");
      return;
    }
    try {
      setLoading(true);
      await api.post("/api/pages", newPage);
      message.success("새 페이지가 추가되었습니다.");
      setNewPage({
        name: "",
        label: "",
        order: 0,
        image: "",
        categoryKey: "default",
        isActive: true,
        description: "",
        i18nLabels: { ko: "", en: "", th: "" },
      });
      fetchPages();
    } catch (err) {
      console.error("❌ 새 페이지 추가 실패:", err);
      if (err.response?.status === 401) {
        message.warning("세션이 만료되었습니다. 다시 로그인해주세요.");
      } else {
        message.error(err.response?.data?.message || "페이지 추가 실패");
      }
    } finally {
      setLoading(false);
    }
  };

  /** ✅ 페이지 삭제 */
  const handleDelete = async (id) => {
    if (!window.confirm("정말 이 탭을 삭제하시겠습니까?")) return;
    try {
      await api.delete(`/api/pages/${id}`);
      message.success("페이지가 삭제되었습니다.");
      fetchPages();
    } catch (err) {
      console.error("❌ 페이지 삭제 실패:", err);
      message.error("페이지 삭제 중 오류가 발생했습니다.");
    }
  };

  /** ✅ 순서 변경 */
  const movePage = async (id, dir) => {
    const index = pages.findIndex((p) => p._id === id);
    if (index === -1) return;
    const newPages = [...pages];
    if (dir === "up" && index > 0)
      [newPages[index - 1], newPages[index]] = [newPages[index], newPages[index - 1]];
    else if (dir === "down" && index < newPages.length - 1)
      [newPages[index + 1], newPages[index]] = [newPages[index], newPages[index + 1]];
    else return;

    const updated = newPages.map((p, i) => ({ ...p, order: i + 1 }));
    setPages(updated);
    try {
      await Promise.all(
        updated.map((p) => api.put(`/api/pages/${p._id}`, { order: p.order }))
      );
      message.success("순서가 업데이트되었습니다.");
      fetchPages();
    } catch (err) {
      console.error("❌ 순서 업데이트 실패:", err);
      message.error("순서 변경 중 오류가 발생했습니다.");
    }
  };

  /** ✅ 테이블 컬럼 */
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
    { title: "Key", dataIndex: "categoryKey" }, // ✅ 추가
    {
      title: "활성",
      dataIndex: "isActive",
      render: (_, record) => (
        <Switch
          checked={record.isActive}
          onChange={async (checked) => {
            await api.put(`/api/pages/${record._id}`, { isActive: checked });
            fetchPages();
          }}
        />
      ),
    },
    {
      title: "Order",
      dataIndex: "order",
      sorter: (a, b) => a.order - b.order,
    },
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
    <div className="p-6 max-w-6xl mx-auto bg-white rounded-xl shadow">
      <h2 className="text-2xl font-bold mb-4">🗂 페이지(탭) 설정</h2>

      <Space direction="horizontal" wrap>
        <Input
          placeholder="이름(name)"
          value={newPage.name}
          onChange={(e) => setNewPage({ ...newPage, name: e.target.value })}
          style={{ width: 160 }}
        />
        <Input
          placeholder="표시명(label)"
          value={newPage.label}
          onChange={(e) => setNewPage({ ...newPage, label: e.target.value })}
          style={{ width: 160 }}
        />
        <Input
          placeholder="Category Key (예: featured, top, bottom, coordi)"
          value={newPage.categoryKey}
          onChange={(e) =>
            setNewPage({ ...newPage, categoryKey: e.target.value })
          }
          style={{ width: 220 }}
        />
        <Input
          type="number"
          placeholder="순서(order)"
          value={newPage.order}
          onChange={(e) =>
            setNewPage({ ...newPage, order: Number(e.target.value) })
          }
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

      {/* ✅ 추가: 다국어 입력 */}
      <div className="mt-4 grid grid-cols-3 gap-3">
        <Input
          placeholder="🇰🇷 한국어 라벨"
          value={newPage.i18nLabels.ko}
          onChange={(e) =>
            setNewPage({
              ...newPage,
              i18nLabels: { ...newPage.i18nLabels, ko: e.target.value },
            })
          }
        />
        <Input
          placeholder="🇺🇸 English Label"
          value={newPage.i18nLabels.en}
          onChange={(e) =>
            setNewPage({
              ...newPage,
              i18nLabels: { ...newPage.i18nLabels, en: e.target.value },
            })
          }
        />
        <Input
          placeholder="🇹🇭 Thai Label"
          value={newPage.i18nLabels.th}
          onChange={(e) =>
            setNewPage({
              ...newPage,
              i18nLabels: { ...newPage.i18nLabels, th: e.target.value },
            })
          }
        />
      </div>

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
