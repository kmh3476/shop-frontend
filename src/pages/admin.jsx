import { useEffect, useState } from "react";
import axios from "axios";

function Admin() {
    const [products, setProducts] = useState([]);
    const [form, setForm] = useState({ name: "", price: "", description: "" });

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        const res = await axios.get("http://localhost:4000/products");
        setProducts(res.data);
    };

    const addProduct = async (e) => {
        e.preventDefault();
        await axios.post("http://localhost:4000/products", {
            name: form.name,
            price: parseInt(form.price),
            description: form.description,
        });
        setForm({ name: "", price: "", description: "" });
        fetchProducts();
    };

    return (
        <div style={{ padding: "20px" }}>
            <h1>⚙ 관리자 상품 관리</h1>

            {/* 상품 등록 폼 */}
            <form onSubmit={addProduct} style={{ marginBottom: "20px" }}>
                <input
                    type="text"
                    placeholder="상품명"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
                <input
                    type="number"
                    placeholder="가격"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                />
                <input
                    type="text"
                    placeholder="설명"
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
                <button type="submit">등록</button>
            </form>

            {/* 상품 목록 */}
            <h2>📦 상품 목록</h2>
            <ul>
                {products.map((p) => (
                    <li key={p._id}>
                        <strong>{p.name}</strong> - {p.price}원 <br />
                        {p.description}
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default Admin;
