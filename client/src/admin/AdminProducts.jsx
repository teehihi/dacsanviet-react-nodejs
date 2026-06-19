import { useEffect, useState } from 'react';
import { api, money } from '../api.js';

const empty = { name: '', regularPrice: 0, salePrice: '', stockQuantity: 0, featured: false, status: 'ACTIVE', shortDescription: '' };

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(empty);

  async function load() {
    setProducts(await api('/admin/products'));
    setCategories(await api('/admin/categories'));
  }

  useEffect(() => { load(); }, []);

  async function submit(e) {
    e.preventDefault();
    await api('/admin/products', {
      method: 'POST',
      body: JSON.stringify({
        ...form,
        salePrice: form.salePrice ? Number(form.salePrice) : null,
        categoryId: form.categoryId ? Number(form.categoryId) : null,
      }),
    });
    setForm(empty);
    load();
  }

  return (
    <section className="admin-page">
      <h1>Quản lý sản phẩm</h1>
      <form className="admin-form" onSubmit={submit}>
        <input placeholder="Tên sản phẩm" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        <input type="number" placeholder="Giá gốc" value={form.regularPrice} onChange={(e) => setForm({ ...form, regularPrice: Number(e.target.value) })} />
        <input type="number" placeholder="Giá sale" value={form.salePrice} onChange={(e) => setForm({ ...form, salePrice: e.target.value })} />
        <select value={form.categoryId || ''} onChange={(e) => setForm({ ...form, categoryId: e.target.value })}>
          <option value="">Danh mục</option>
          {categories.map((item) => <option value={item.id} key={item.id}>{item.name}</option>)}
        </select>
        <textarea placeholder="Mô tả ngắn" value={form.shortDescription} onChange={(e) => setForm({ ...form, shortDescription: e.target.value })} />
        <button className="btn btn-primary">Thêm sản phẩm</button>
      </form>
      <div className="admin-table">
        {products.map((product) => (
          <div className="admin-row" key={product.id}>
            <img src={product.images?.[0]?.url || '/assets/dacsanvietLogo.png'} alt={product.name} />
            <strong>{product.name}</strong>
            <span>{product.category?.name}</span>
            <span>{money(product.salePrice || product.regularPrice)}</span>
            <span>{product.status}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
