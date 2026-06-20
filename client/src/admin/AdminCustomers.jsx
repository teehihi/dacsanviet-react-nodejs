import { Download, Edit3, Eye, Search, Trash2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { api, money } from '../api.js';
import { makeCsv, statusTone } from './adminUtils.js';

export default function AdminCustomers() {
  const [customers, setCustomers] = useState([]);
  const [query, setQuery] = useState('');

  useEffect(() => { api('/admin/users').then(setCustomers); }, []);

  const filtered = useMemo(() => customers.filter((customer) => {
    const needle = query.toLowerCase();
    return !needle || [customer.name, customer.email, customer.phone].some((value) => String(value || '').toLowerCase().includes(needle));
  }), [customers, query]);

  return (
    <section className="admin-page">
      <header className="admin-page-head">
        <div><h1>Quản Lý Khách Hàng</h1><p>Quản lý cơ sở khách hàng, xem lịch sử và chỉnh sửa thông tin</p></div>
        <div className="admin-actions">
          <button className="admin-select-btn" onClick={() => makeCsv([['Tên', 'Email', 'SĐT', 'Tổng đơn', 'Tổng chi'], ...filtered.map((item) => [item.name, item.email, item.phone, item.orderCount, item.totalSpent])], 'khach-hang.csv')}>
            <Download size={18} />Xuất CSV
          </button>
          <button className="admin-primary">+ Thêm Khách Hàng</button>
        </div>
      </header>
      <section className="admin-card no-padding">
        <div className="admin-filterbar attached">
          <label><Search size={20} /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Tìm theo tên, email, hoặc số điện thoại..." /></label>
          <select><option>Tất Cả Trạng Thái</option></select>
          <select><option>Tất Cả Thời Gian</option></select>
        </div>
        <div className="admin-data-table">
          <div className="admin-table-head customer">
            <span>Khách hàng</span><span>Thông tin liên hệ</span><span>Tổng đơn</span><span>Tổng chi tiêu</span><span>Trạng thái</span><span>Thao tác</span>
          </div>
          {filtered.map((customer) => (
            <div className="admin-table-row customer" key={customer.id}>
              <div className="admin-customer-cell"><i>{(customer.name || customer.email || '?').slice(0, 1).toUpperCase()}</i><span><b>{customer.name || 'Khách hàng'}</b><small>ID: {customer.id}</small></span></div>
              <span><b>{customer.email}</b><small>{customer.phone || 'Chưa có SĐT'}</small></span>
              <b>{customer.orderCount || 0} orders</b>
              <b>{money(customer.totalSpent)}</b>
              <em className={`admin-badge ${statusTone(true)}`}>Active</em>
              <div className="admin-row-actions"><button><Eye size={16} /></button><button><Edit3 size={16} /></button><button><Trash2 size={16} /></button></div>
            </div>
          ))}
        </div>
        <footer className="admin-table-foot">Hiển thị {filtered.length} trong tổng số {customers.length} khách hàng</footer>
      </section>
    </section>
  );
}
