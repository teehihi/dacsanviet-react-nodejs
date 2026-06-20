import { Download, Edit3, PackagePlus, Search, Trash2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { api, money } from '../api.js';
import { makeCsv, statusTone } from './adminUtils.js';

const empty = {
  name: '',
  regularPrice: 0,
  salePrice: '',
  stockQuantity: 0,
  featured: false,
  status: 'ACTIVE',
  shortDescription: '',
  description: '',
  sku: '',
  categoryId: '',
  imageUrl: '',
};

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(empty);
  const [editing, setEditing] = useState(null);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('');
  const [status, setStatus] = useState('');
  const [showForm, setShowForm] = useState(false);

  async function load() {
    const [productData, categoryData] = await Promise.all([api('/admin/products'), api('/admin/categories')]);
    setProducts(productData);
    setCategories(categoryData);
  }

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => products.filter((product) => {
    const keyword = query.toLowerCase();
    const matchQuery = !keyword || [product.name, product.sku, product.category?.name].some((value) => String(value || '').toLowerCase().includes(keyword));
    const matchCategory = !category || Number(product.categoryId) === Number(category);
    const matchStatus = !status || product.status === status;
    return matchQuery && matchCategory && matchStatus;
  }), [products, query, category, status]);

  function openForm(product = null) {
    setEditing(product);
    setForm(product ? {
      name: product.name || '',
      regularPrice: Number(product.regularPrice || 0),
      salePrice: product.salePrice ? Number(product.salePrice) : '',
      stockQuantity: product.stockQuantity || 0,
      featured: Boolean(product.featured),
      status: product.status || 'ACTIVE',
      shortDescription: product.shortDescription || '',
      description: product.description || '',
      sku: product.sku || '',
      categoryId: product.categoryId || '',
      imageUrl: product.images?.[0]?.url || '',
    } : empty);
    setShowForm(true);
  }

  async function submit(e) {
    e.preventDefault();
    const payload = {
      ...form,
      regularPrice: Number(form.regularPrice || 0),
      salePrice: form.salePrice ? Number(form.salePrice) : null,
      stockQuantity: Number(form.stockQuantity || 0),
      categoryId: form.categoryId ? Number(form.categoryId) : null,
      images: form.imageUrl ? [{ url: form.imageUrl, alt: form.name, sortOrder: 0 }] : [],
    };
    delete payload.imageUrl;
    await api(editing ? `/admin/products/${editing.id}` : '/admin/products', {
      method: editing ? 'PATCH' : 'POST',
      body: JSON.stringify(payload),
    });
    setShowForm(false);
    setEditing(null);
    setForm(empty);
    load();
  }

  async function archive(product) {
    if (!window.confirm(`Ẩn sản phẩm "${product.name}"?`)) return;
    await api(`/admin/products/${product.id}`, { method: 'DELETE' });
    load();
  }

  return (
    <section className="admin-page">
      <header className="admin-page-head">
        <div>
          <h1>Quản Lý Sản Phẩm</h1>
          <p>Quản lý toàn bộ danh mục đặc sản Việt Nam</p>
        </div>
        <div className="admin-actions">
          <button className="admin-select-btn" onClick={() => makeCsv([['Tên', 'SKU', 'Danh mục', 'Giá', 'Tồn kho'], ...filtered.map((item) => [item.name, item.sku, item.category?.name, item.salePrice || item.regularPrice, item.stockQuantity])], 'san-pham.csv')}>
            <Download size={18} />Xuất CSV
          </button>
          <button className="admin-primary" onClick={() => openForm()}><PackagePlus size={18} />Thêm Sản Phẩm</button>
        </div>
      </header>

      <div className="admin-filterbar">
        <label><Search size={20} /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Tìm theo tên, SKU, hoặc danh mục..." /></label>
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="">Tất Cả Danh Mục</option>
          {categories.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
        </select>
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">Tất Cả Trạng Thái</option>
          <option value="ACTIVE">Còn hàng</option>
          <option value="DRAFT">Bản nháp</option>
          <option value="ARCHIVED">Đã ẩn</option>
        </select>
      </div>

      <section className="admin-card no-padding">
        <div className="admin-data-table">
          <div className="admin-table-head product">
            <span></span><span>Tên sản phẩm</span><span>Danh mục</span><span>Giá</span><span>Tồn kho</span><span>Trạng thái</span><span>Thao tác</span>
          </div>
          {filtered.map((product) => (
            <div className="admin-table-row product" key={product.id}>
              <input type="checkbox" aria-label={product.name} />
              <div className="admin-product-cell">
                <img src={product.images?.[0]?.url || '/assets/dacsanvietLogo.png'} alt={product.name} />
                <div><strong>{product.name}</strong><span>SKU: {product.sku || product.id}</span></div>
              </div>
              <span>{product.category?.name || 'Chưa phân loại'}</span>
              <b>{money(product.salePrice || product.regularPrice)}</b>
              <span>{product.stockQuantity} đơn vị</span>
              <em className={`admin-badge ${statusTone(product.status)}`}>{product.status === 'ACTIVE' ? 'Còn Hàng' : product.status === 'DRAFT' ? 'Bản Nháp' : 'Đã Ẩn'}</em>
              <div className="admin-row-actions">
                <button onClick={() => openForm(product)}><Edit3 size={16} /></button>
                <button onClick={() => archive(product)}><Trash2 size={16} /></button>
              </div>
            </div>
          ))}
        </div>
        <footer className="admin-table-foot">Hiển thị {filtered.length} trong tổng số {products.length} sản phẩm</footer>
      </section>

      {showForm && (
        <div className="admin-modal-backdrop">
          <form className="admin-modal wide" onSubmit={submit}>
            <header><h2>{editing ? 'Chỉnh Sửa Sản Phẩm' : 'Thêm Sản Phẩm'}</h2><button type="button" onClick={() => setShowForm(false)}>x</button></header>
            <div className="admin-form-grid">
              <label>Tên sản phẩm *<input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></label>
              <label>SKU<input value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} /></label>
              <label>Danh mục<select value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })}><option value="">Chọn danh mục</option>{categories.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
              <label>Trạng thái<select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}><option value="ACTIVE">Kích hoạt</option><option value="DRAFT">Bản nháp</option><option value="ARCHIVED">Đã ẩn</option></select></label>
              <label>Giá (VNĐ) *<input type="number" value={form.regularPrice} onChange={(e) => setForm({ ...form, regularPrice: e.target.value })} required /></label>
              <label>Giá giảm<input type="number" value={form.salePrice} onChange={(e) => setForm({ ...form, salePrice: e.target.value })} /></label>
              <label>Số lượng kho<input type="number" value={form.stockQuantity} onChange={(e) => setForm({ ...form, stockQuantity: e.target.value })} /></label>
              <label>URL hình chính<input value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} placeholder="/assets/..." /></label>
              <label className="span-2">Mô tả ngắn<textarea value={form.shortDescription} onChange={(e) => setForm({ ...form, shortDescription: e.target.value })} /></label>
              <label className="span-2">Mô tả sản phẩm<textarea rows="7" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></label>
            </div>
            <footer><button type="button" className="admin-secondary" onClick={() => setShowForm(false)}>Hủy</button><button className="admin-primary">{editing ? 'Cập nhật sản phẩm' : 'Tạo sản phẩm'}</button></footer>
          </form>
        </div>
      )}
    </section>
  );
}
