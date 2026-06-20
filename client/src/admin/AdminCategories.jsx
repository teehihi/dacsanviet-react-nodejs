import { Edit3, FolderPlus, Search, Trash2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { api } from '../api.js';
import { plainDate, statusTone } from './adminUtils.js';

const empty = { name: '', description: '', parentId: '' };

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [query, setQuery] = useState('');
  const [form, setForm] = useState(empty);
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);

  async function load() {
    setCategories(await api('/admin/categories'));
  }

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => categories.filter((item) => {
    const needle = query.toLowerCase();
    return !needle || [item.name, item.description].some((value) => String(value || '').toLowerCase().includes(needle));
  }), [categories, query]);

  function openForm(category = null) {
    setEditing(category);
    setForm(category ? { name: category.name, description: category.description || '', parentId: category.parentId || '' } : empty);
    setShowForm(true);
  }

  async function submit(e) {
    e.preventDefault();
    const payload = { ...form, parentId: form.parentId ? Number(form.parentId) : null };
    await api(editing ? `/admin/categories/${editing.id}` : '/admin/categories', {
      method: editing ? 'PATCH' : 'POST',
      body: JSON.stringify(payload),
    });
    setShowForm(false);
    load();
  }

  async function remove(category) {
    if (!window.confirm(`Xóa danh mục "${category.name}"?`)) return;
    await api(`/admin/categories/${category.id}`, { method: 'DELETE' });
    load();
  }

  return (
    <section className="admin-page">
      <header className="admin-page-head">
        <div><h1>Quản Lý Danh Mục</h1><p>Quản lý danh mục sản phẩm</p></div>
        <button className="admin-primary" onClick={() => openForm()}><FolderPlus size={18} />Thêm Danh Mục</button>
      </header>
      <div className="admin-filterbar">
        <label><Search size={20} /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Tìm kiếm danh mục..." /></label>
        <select><option>Tất Cả Trạng Thái</option></select>
      </div>
      <section className="admin-card no-padding">
        <div className="admin-data-table">
          <div className="admin-table-head category">
            <span>ID</span><span>Tên danh mục</span><span>Mô tả</span><span>Số sản phẩm</span><span>Trạng thái</span><span>Ngày tạo</span><span>Thao tác</span>
          </div>
          {filtered.map((item) => (
            <div className="admin-table-row category" key={item.id}>
              <strong>{item.id}</strong>
              <span><b>{item.name}</b></span>
              <span>{item.description || 'Chưa có mô tả'}</span>
              <em className="admin-badge info">{item.productCount || 0} sản phẩm</em>
              <em className={`admin-badge ${statusTone(true)}`}>Hoạt động</em>
              <span>{plainDate(item.createdAt)}</span>
              <div className="admin-row-actions">
                <button onClick={() => openForm(item)}><Edit3 size={16} /></button>
                <button onClick={() => remove(item)}><Trash2 size={16} /></button>
              </div>
            </div>
          ))}
        </div>
        <footer className="admin-table-foot">Hiển thị {filtered.length} trong tổng số {categories.length} danh mục</footer>
      </section>
      {showForm && (
        <div className="admin-modal-backdrop">
          <form className="admin-modal" onSubmit={submit}>
            <header><h2>{editing ? 'Chỉnh Sửa Danh Mục' : 'Thêm Danh Mục Mới'}</h2><button type="button" onClick={() => setShowForm(false)}>x</button></header>
            <div className="admin-form-grid one">
              <label>Tên danh mục *<input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></label>
              <label>Mô tả<textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></label>
              <label>Danh mục cha<select value={form.parentId} onChange={(e) => setForm({ ...form, parentId: e.target.value })}><option value="">-- Không có --</option>{categories.filter((item) => item.id !== editing?.id).map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
            </div>
            <footer><button type="button" className="admin-secondary" onClick={() => setShowForm(false)}>Hủy</button><button className="admin-primary">{editing ? 'Cập nhật' : 'Tạo danh mục'}</button></footer>
          </form>
        </div>
      )}
    </section>
  );
}
