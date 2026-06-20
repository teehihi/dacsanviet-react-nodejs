import { Edit3, Plus, Search, Tag, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';

const seedPromotions = [
  { id: 1, code: 'DACVIET10', type: 'Phần Trăm (%)', value: 10, minOrder: 100000, limit: 200, active: true },
  { id: 2, code: 'FREESHIP', type: 'Giảm cố định', value: 30000, minOrder: 250000, limit: 100, active: true },
];

export default function AdminPromotions() {
  const [promotions, setPromotions] = useState(seedPromotions);
  const [query, setQuery] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ code: '', type: 'Phần Trăm (%)', value: '', minOrder: 0, limit: '', active: true });
  const filtered = useMemo(() => promotions.filter((item) => item.code.toLowerCase().includes(query.toLowerCase())), [promotions, query]);

  function submit(e) {
    e.preventDefault();
    setPromotions([{ ...form, id: Date.now(), value: Number(form.value), minOrder: Number(form.minOrder), limit: Number(form.limit || 0) }, ...promotions]);
    setShowForm(false);
  }

  return (
    <section className="admin-page">
      <header className="admin-page-head">
        <div><h1>Quản Lý Khuyến Mãi</h1><p>Quản lý mã giảm giá cho cửa hàng. Dữ liệu sẽ chuyển sang DB khi bổ sung bảng coupons/promotions.</p></div>
        <button className="admin-primary" onClick={() => setShowForm(true)}><Plus size={18} />Thêm Khuyến Mãi</button>
      </header>
      <section className="admin-card no-padding">
        <div className="admin-filterbar attached"><label><Search size={20} /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Tìm theo mã khuyến mãi..." /></label></div>
        <div className="admin-data-table">
          <div className="admin-table-head promotion"><span>Mã</span><span>Loại giảm</span><span>Giá trị</span><span>Đơn tối thiểu</span><span>Giới hạn</span><span>Trạng thái</span><span>Thao tác</span></div>
          {filtered.map((item) => (
            <div className="admin-table-row promotion" key={item.id}>
              <strong><Tag size={16} />{item.code}</strong><span>{item.type}</span><b>{item.type.includes('%') ? `${item.value}%` : `${item.value.toLocaleString('vi-VN')} đ`}</b><span>{item.minOrder.toLocaleString('vi-VN')} đ</span><span>{item.limit || 'Không giới hạn'}</span><em className="admin-badge success">Đang chạy</em><div className="admin-row-actions"><button><Edit3 size={16} /></button><button onClick={() => setPromotions(promotions.filter((promo) => promo.id !== item.id))}><Trash2 size={16} /></button></div>
            </div>
          ))}
        </div>
      </section>
      {showForm && (
        <div className="admin-modal-backdrop">
          <form className="admin-modal" onSubmit={submit}>
            <header><h2>Thêm Khuyến Mãi</h2><button type="button" onClick={() => setShowForm(false)}>x</button></header>
            <div className="admin-form-grid">
              <label>Mã khuyến mãi *<input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} placeholder="VD: SUMMER2026" required /></label>
              <label>Loại giảm giá<select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}><option>Phần Trăm (%)</option><option>Giảm cố định</option></select></label>
              <label>Giá trị giảm *<input type="number" value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} required /></label>
              <label>Đơn tối thiểu<input type="number" value={form.minOrder} onChange={(e) => setForm({ ...form, minOrder: e.target.value })} /></label>
              <label>Giới hạn sử dụng<input type="number" value={form.limit} onChange={(e) => setForm({ ...form, limit: e.target.value })} placeholder="Không giới hạn" /></label>
              <label className="admin-check"><input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} />Kích hoạt ngay</label>
            </div>
            <footer><button type="button" className="admin-secondary" onClick={() => setShowForm(false)}>Hủy</button><button className="admin-primary">Lưu</button></footer>
          </form>
        </div>
      )}
    </section>
  );
}
