export async function fetchPage(slug) {
  const res = await fetch(`http://localhost:1337/api/pages?filters[slug][$eq]=${slug}&populate=*`);
  const data = await res.json();
  return data.data?.[0]?.attributes;
}
