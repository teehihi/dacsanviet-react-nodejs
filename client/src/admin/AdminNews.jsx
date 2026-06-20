import { Edit3, Newspaper, Search, Star, Trash2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { api } from '../api.js';
import { plainDate, statusTone } from './adminUtils.js';

const empty = { title: '', slug: '', excerpt: '', body: '', imageUrl: '', published: true };

export default function AdminNews() {
  const [posts, setPosts] = useState([]);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('');
  const [form, setForm] = useState(empty);
  const [editing, setEditing] = useState(null);

  async function load() {
    setPosts(await api('/admin/posts'));
  }

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => posts.filter((post) => {
    const needle = query.toLowerCase();
    const matchQuery = !needle || [post.title, post.excerpt, post.body].some((value) => String(value || '').toLowerCase().includes(needle));
    const matchStatus = !status || String(post.published) === status;
    return matchQuery && matchStatus;
  }), [posts, query, status]);

  function openForm(post = null) {
    setEditing(post || {});
    setForm(post ? {
      title: post.title || '',
      slug: post.slug || '',
      excerpt: post.excerpt || '',
      body: post.body || '',
      imageUrl: post.imageUrl || '',
      published: Boolean(post.published),
    } : empty);
  }

  async function submit(e) {
    e.preventDefault();
    await api(editing?.id ? `/admin/posts/${editing.id}` : '/admin/posts', {
      method: editing?.id ? 'PATCH' : 'POST',
      body: JSON.stringify(form),
    });
    setEditing(null);
    load();
  }

  async function remove(post) {
    if (!window.confirm(`Xóa bài viết "${post.title}"?`)) return;
    await api(`/admin/posts/${post.id}`, { method: 'DELETE' });
    load();
  }

  return (
    <section className="admin-page">
      <header className="admin-page-head">
        <div><h1>Quản Lý Tin Tức</h1><p>Tạo, chỉnh sửa và quản lý các bài viết tin tức</p></div>
        <button className="admin-primary" onClick={() => openForm()}><Newspaper size={18} />Thêm bài viết</button>
      </header>
      <div className="admin-filterbar">
        <label><Search size={20} /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Tìm theo tiêu đề, nội dung..." /></label>
        <select value={status} onChange={(e) => setStatus(e.target.value)}><option value="">Tất cả trạng thái</option><option value="true">Đã xuất bản</option><option value="false">Bản nháp</option></select>
        <button className="admin-primary">Tìm kiếm</button>
      </div>
      <section className="admin-card no-padding">
        <div className="admin-card-head padded"><h2>Danh sách bài viết</h2><span>{filtered.length} bài</span></div>
        <div className="admin-data-table">
          <div className="admin-table-head news">
            <span></span><span>Hình ảnh</span><span>Tiêu đề</span><span>Danh mục</span><span>Trạng thái</span><span>Ngày tạo</span><span>Thao tác</span>
          </div>
          {filtered.map((post) => (
            <div className="admin-table-row news" key={post.id}>
              <input type="checkbox" aria-label={post.title} />
              <img src={post.imageUrl || '/assets/dacsanvietLogo.png'} alt={post.title} />
              <span><b>{post.title}</b><small>{post.excerpt || 'Chưa có mô tả ngắn'}</small></span>
              <em className="admin-badge muted">Tin Tức</em>
              <em className={`admin-badge ${statusTone(post.published)}`}>{post.published ? 'Đã xuất bản' : 'Bản nháp'}</em>
              <span>{plainDate(post.createdAt)}</span>
              <div className="admin-row-actions"><button onClick={() => openForm(post)}><Edit3 size={16} /></button><button><Star size={16} /></button><button onClick={() => remove(post)}><Trash2 size={16} /></button></div>
            </div>
          ))}
        </div>
      </section>
      {editing && (
        <div className="admin-modal-backdrop">
          <form className="admin-modal wide" onSubmit={submit}>
            <header><h2>{editing.id ? 'Chỉnh Sửa Bài Viết' : 'Thêm Bài Viết Mới'}</h2><button type="button" onClick={() => setEditing(null)}>x</button></header>
            <div className="admin-form-grid">
              <label className="span-2">Tiêu đề bài viết *<input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required /></label>
              <label>URL Slug<input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="url-slug-bai-viet" /></label>
              <label>Trạng thái<select value={String(form.published)} onChange={(e) => setForm({ ...form, published: e.target.value === 'true' })}><option value="true">Xuất bản</option><option value="false">Bản nháp</option></select></label>
              <label className="span-2">Tóm tắt<textarea value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} /></label>
              <label className="span-2">URL hình đại diện<input value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} /></label>
              <label className="span-2">Nội dung bài viết<textarea rows="10" value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} /></label>
            </div>
            <footer><button type="button" className="admin-secondary" onClick={() => setEditing(null)}>Hủy</button><button className="admin-primary">Lưu bài viết</button></footer>
          </form>
        </div>
      )}
    </section>
  );
}
