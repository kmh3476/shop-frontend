// 📁 src/pages/Page.jsx
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { fetchPageBySlug } from "../utils/api";

export default function Page() {
  const { slug } = useParams();
  const [page, setPage] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPage() {
      const data = await fetchPageBySlug(slug);
      setPage(data);
      setLoading(false);
    }
    loadPage();
  }, [slug]);

  if (loading) return <div className="p-10 text-center">로딩 중...</div>;
  if (!page) return <div className="p-10 text-center">페이지를 찾을 수 없습니다.</div>;

  const { attributes } = page;
  const sections = attributes.sections || [];

  return (
    <div>
      <h1 className="text-3xl font-bold text-center my-10">{attributes.title}</h1>

      {sections.map((section, index) => {
        const type = section.__component;

        switch (type) {
          case "sections.hero":
            return (
              <div key={index} className="relative h-[400px] flex items-center justify-center text-white bg-gray-800">
                {section.backgroundImage?.data && (
                  <img
                    src={`http://localhost:1337${section.backgroundImage.data.attributes.url}`}
                    alt=""
                    className="absolute inset-0 w-full h-full object-cover opacity-70"
                  />
                )}
                <div className="relative text-center z-10">
                  <h2 className="text-4xl font-bold mb-2">{section.title}</h2>
                  <p className="text-xl">{section.subtitle}</p>
                </div>
              </div>
            );

          case "sections.text":
            return (
              <div key={index} className="max-w-3xl mx-auto my-12 px-6">
                <h2 className="text-2xl font-semibold mb-4">{section.heading}</h2>
                <div>{section.body}</div>
              </div>
            );

          case "sections.gallery":
            return (
              <div key={index} className="grid grid-cols-2 md:grid-cols-3 gap-4 p-6">
                {section.images?.data?.map((img, i) => (
                  <img
                    key={i}
                    src={`http://localhost:1337${img.attributes.url}`}
                    alt=""
                    className="rounded-lg shadow-md"
                  />
                ))}
              </div>
            );

          default:
            return (
              <div key={index} className="p-10 text-center bg-gray-100 text-gray-500">
                알 수 없는 섹션 타입: {type}
              </div>
            );
        }
      })}
    </div>
  );
}
