import { useEffect, useState } from "react";

export default function HomeBanner() {
  const [banner, setBanner] = useState(null);

  useEffect(() => {
    async function fetchBanner() {
      const res = await fetch("http://localhost:1337/api/homepages?populate=*");
      const data = await res.json();
      setBanner(data.data[0]?.attributes);
    }
    fetchBanner();
  }, []);

  if (!banner) return <p>로딩 중...</p>;

  return (
    <section style={{ textAlign: "center", padding: "40px" }}>
      <h1>{banner.title}</h1>
      <h3>{banner.subtitle}</h3>
      <img
        src={`http://localhost:1337${banner.bannerImage.data.attributes.url}`}
        alt="배너 이미지"
        style={{ width: "100%", borderRadius: "12px" }}
      />
    </section>
  );
}
