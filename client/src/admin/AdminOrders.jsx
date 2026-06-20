import { Download, Edit3, Eye, Search, ShoppingBag } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { api, money } from '../api.js';
import { formatDate, makeCsv, orderStatusLabels, paymentStatusLabels, statusTone } from './adminUtils.js';

const statuses = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPING', 'COMPLETED', 'CANCELLED'];
const paymentStatuses = ['UNPAID', 'PENDING', 'PAID', 'FAILED'];

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('');
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ status: 'PENDING', paymentStatus: 'UNPAID' });

  async function load() {
    setOrders(await api('/admin/orders'));
  }

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => orders.filter((order) => {
    const needle = query.toLowerCase();
    const matchQuery = !needle || [order.code, order.address?.fullName, order.address?.phone].some((value) => String(value || '').toLowerCase().includes(needle));
    const matchStatus = !status || order.status === status;
    return matchQuery && matchStatus;
  }), [orders, query, status]);

  function openModal(order) {
    setEditing(order);
    setForm({ status: order.status, paymentStatus: order.payment?.status || 'UNPAID' });
  }

  async function submit(e) {
    e.preventDefault();
    await api(`/admin/orders/${editing.id}`, { method: 'PATCH', body: JSON.stringify(form) });
    setEditing(null);
    load();
  }

  return (
    <section className="admin-page">
      <header className="admin-page-head">
        <div>
          <h1>Quản Lý Đơn Hàng</h1>
          <p>Theo dõi và quản lý đơn hàng và vận chuyển</p>
        </div>
        <div className="admin-actions">
          <button className="admin-select-btn" onClick={() => makeCsv([['Mã đơn', 'Khách hàng', 'Ngày', 'Tổng tiền', 'Trạng thái'], ...filtered.map((item) => [item.code, item.address?.fullName, item.createdAt, item.total, item.status])], 'don-hang.csv')}>
            <Download size={18} />Xuất CSV
          </button>
          <button className="admin-primary"><ShoppingBag size={18} />Tạo Đơn Hàng</button>
        </div>
      </header>

      <section className="admin-card no-padding">
        <div className="admin-filterbar attached">
          <label><Search size={20} /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Tìm theo mã đơn, tên, số điện thoại..." /></label>
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">Tất Cả Trạng Thái</option>
            {statuses.map((item) => <option key={item} value={item}>{orderStatusLabels[item]}</option>)}
          </select>
          <button className="admin-select-btn">Áp Dụng</button>
        </div>
        <div className="admin-data-table">
          <div className="admin-table-head order">
            <span>Mã đơn</span><span>Khách hàng</span><span>Ngày</span><span>Tổng tiền</span><span>Trạng thái</span><span>Thanh toán</span><span>Thao tác</span>
          </div>
          {filtered.map((order) => (
            <div className="admin-table-row order" key={order.id}>
              <strong>{order.code}</strong>
              <span><b>{order.address?.fullName || 'Khách lẻ'}</b><small>{order.address?.email || order.address?.phone}</small></span>
              <span>{formatDate(order.createdAt)}</span>
              <b>{money(order.total)}</b>
              <em className={`admin-badge ${statusTone(order.status)}`}>{orderStatusLabels[order.status]}</em>
              <em className={`admin-badge ${statusTone(order.payment?.status)}`}>{paymentStatusLabels[order.payment?.status] || 'N/A'}</em>
              <div className="admin-row-actions">
                <button title="Xem nhanh"><Eye size={16} /></button>
                <button title="Cập nhật" onClick={() => openModal(order)}><Edit3 size={16} /></button>
              </div>
            </div>
          ))}
        </div>
        <footer className="admin-table-foot">Hiển thị {filtered.length} trong tổng số {orders.length} đơn hàng</footer>
      </section>

      {editing && (
        <div className="admin-modal-backdrop">
          <form className="admin-modal" onSubmit={submit}>
            <header><h2>Cập Nhật Đơn Hàng</h2><button type="button" onClick={() => setEditing(null)}>x</button></header>
            <section className="admin-info-box">
              <h3>Thông Tin Khách Hàng</h3>
              <p><span>Tên khách hàng:</span><b>{editing.address?.fullName}</b></p>
              <p><span>Email:</span><b>{editing.address?.email || 'N/A'}</b></p>
              <p><span>Số điện thoại:</span><b>{editing.address?.phone}</b></p>
              <p><span>Địa chỉ giao hàng:</span><b>{[editing.address?.line1, editing.address?.ward, editing.address?.district, editing.address?.province].filter(Boolean).join(', ')}</b></p>
            </section>
            <div className="admin-form-grid">
              <label>Trạng thái đơn hàng<select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>{statuses.map((item) => <option key={item} value={item}>{orderStatusLabels[item]}</option>)}</select></label>
              <label>Trạng thái thanh toán<select value={form.paymentStatus} onChange={(e) => setForm({ ...form, paymentStatus: e.target.value })}>{paymentStatuses.map((item) => <option key={item} value={item}>{paymentStatusLabels[item]}</option>)}</select></label>
              <label className="span-2">Ghi chú<textarea placeholder="Thêm ghi chú cho đơn hàng..." /></label>
            </div>
            <footer><button type="button" className="admin-secondary" onClick={() => setEditing(null)}>Hủy</button><button className="admin-primary">Lưu Thay Đổi</button></footer>
          </form>
        </div>
      )}
    </section>
  );
}
