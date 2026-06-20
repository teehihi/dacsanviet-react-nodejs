import { CalendarDays, DollarSign, Download, PackageCheck, ShoppingBag, TrendingUp, Users } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, money } from '../api.js';
import { formatDate, orderStatusLabels, statusTone } from './adminUtils.js';

function MetricCard({ label, value, hint, icon: Icon, tone = 'green' }) {
  return (
    <article className="admin-metric-card">
      <div>
        <span>{label}</span>
        <strong>{value}</strong>
        {hint && <small>{hint}</small>}
      </div>
      <i className={`metric-icon ${tone}`}><Icon size={24} /></i>
    </article>
  );
}

function RevenueChart({ data = [] }) {
  const points = useMemo(() => {
    const max = Math.max(...data.map((item) => item.revenue), 1);
    return data.map((item, index) => {
      const x = 26 + (index * 728) / Math.max(data.length - 1, 1);
      const y = 170 - (item.revenue / max) * 120;
      return { ...item, x, y };
    });
  }, [data]);
  const path = points.map((point, index) => `${index ? 'L' : 'M'} ${point.x} ${point.y}`).join(' ');

  return (
    <div className="admin-chart">
      <svg viewBox="0 0 780 220" role="img" aria-label="Xu hướng doanh thu">
        {[0, 1, 2, 3].map((line) => <line key={line} x1="26" x2="754" y1={50 + line * 40} y2={50 + line * 40} />)}
        <path d={path || 'M 26 170 L 754 170'} />
        {points.map((point) => <circle key={point.date} cx={point.x} cy={point.y} r="3.5" />)}
      </svg>
    </div>
  );
}

export default function AdminDashboard() {
  const [dashboard, setDashboard] = useState(null);

  useEffect(() => {
    api('/admin/dashboard').then(setDashboard);
  }, []);

  const metrics = dashboard?.metrics || {};
  const topProducts = dashboard?.topProducts || [];
  const recentOrders = dashboard?.recentOrders || [];

  return (
    <section className="admin-page">
      <header className="admin-page-head">
        <div>
          <h1>Tổng Quan Dashboard</h1>
          <p>Tổng quan hiệu suất cửa hàng và các chỉ số quan trọng</p>
        </div>
        <div className="admin-actions">
          <button className="admin-select-btn"><CalendarDays size={18} />30 Ngày Qua</button>
          <button className="admin-select-btn"><PackageCheck size={18} />Nhà Phân Phối</button>
          <button className="admin-primary"><Download size={18} />Xuất Báo Cáo</button>
        </div>
      </header>

      <div className="admin-metric-grid">
        <MetricCard label="Tổng doanh thu" value={money(metrics.revenue)} hint="Theo toàn bộ đơn hàng" icon={DollarSign} tone="green" />
        <MetricCard label="Tổng đơn hàng" value={metrics.orders || 0} hint="Đơn hàng trong hệ thống" icon={ShoppingBag} tone="blue" />
        <MetricCard label="Giá trị đơn TB" value={money(metrics.averageOrder)} hint="Trung bình mỗi đơn" icon={TrendingUp} tone="orange" />
        <MetricCard label="Khách hàng mới" value={metrics.customers || 0} hint="Tài khoản khách hàng" icon={Users} tone="pink" />
      </div>

      <div className="admin-dashboard-grid">
        <section className="admin-card admin-card-large">
          <div className="admin-card-head">
            <h2>Xu Hướng Doanh Thu</h2>
            <div className="admin-segmented"><button>7N</button><button>30N</button><button>90N</button></div>
          </div>
          <RevenueChart data={dashboard?.revenueTrend || []} />
        </section>

        <section className="admin-card">
          <div className="admin-card-head">
            <h2>Sản Phẩm Bán Chạy</h2>
          </div>
          <div className="admin-top-list">
            {topProducts.map((product) => (
              <article key={product.id}>
                <img src={product.image || '/assets/dacsanvietLogo.png'} alt={product.name} />
                <div>
                  <strong>{product.name}</strong>
                  <span>{product.category || 'Đặc sản Việt'}</span>
                </div>
                <b>{money(product.price)}</b>
                <small>{product.sold} đã bán</small>
              </article>
            ))}
          </div>
        </section>
      </div>

      <section className="admin-card">
        <div className="admin-card-head">
          <h2>Đơn Hàng Gần Đây</h2>
          <Link to="/admin/orders" className="admin-link-btn">Xem Tất Cả</Link>
        </div>
        <div className="admin-data-table compact">
          <div className="admin-table-head six">
            <span>Mã đơn</span><span>Khách hàng</span><span>Ngày</span><span>Tổng tiền</span><span>Trạng thái</span><span>Thanh toán</span>
          </div>
          {recentOrders.length ? recentOrders.map((order) => (
            <div className="admin-table-row six" key={order.id}>
              <strong>{order.code}</strong>
              <span>{order.address?.fullName || 'Khách lẻ'}</span>
              <span>{formatDate(order.createdAt)}</span>
              <b>{money(order.total)}</b>
              <em className={`admin-badge ${statusTone(order.status)}`}>{orderStatusLabels[order.status] || order.status}</em>
              <em className={`admin-badge ${statusTone(order.payment?.status)}`}>{order.payment?.status === 'PAID' ? 'Đã Thanh Toán' : 'Chờ Thanh Toán'}</em>
            </div>
          )) : <p className="admin-empty">Không có đơn hàng nào gần đây</p>}
        </div>
      </section>
    </section>
  );
}
