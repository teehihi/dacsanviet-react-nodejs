import { Download, Eye, FileText, Package, ShoppingBag, Star, Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import { api, money } from '../api.js';

function Stat({ label, value, icon: Icon }) {
  return <article className="admin-metric-card"><div><span>{label}</span><strong>{value}</strong><small>Tổng hợp từ dữ liệu hiện tại</small></div><i className="metric-icon blue"><Icon size={24} /></i></article>;
}

function Donut() {
  return (
    <div className="admin-donut">
      <i style={{ '--value': '45%' }} />
      <ul><li>Đặc Sản</li><li>Khuyến Mãi</li><li>Tin Tức</li><li>Công Thức</li></ul>
    </div>
  );
}

export default function AdminReports() {
  const [dashboard, setDashboard] = useState(null);
  useEffect(() => { api('/admin/dashboard').then(setDashboard); }, []);
  const metrics = dashboard?.metrics || {};
  const postStats = dashboard?.postStats || {};

  return (
    <section className="admin-page">
      <header className="admin-page-head">
        <div><h1>Thống Kê & Báo Cáo</h1><p>Tổng quan hiệu suất cửa hàng và các chỉ số quan trọng</p></div>
        <div className="admin-actions"><button className="admin-select-btn">30 Ngày Qua</button><button className="admin-primary"><Download size={18} />Xuất Báo Cáo</button></div>
      </header>
      <div className="admin-metric-grid">
        <Stat label="Tổng doanh thu" value={money(metrics.revenue)} icon={ShoppingBag} />
        <Stat label="Tổng đơn hàng" value={metrics.orders || 0} icon={Package} />
        <Stat label="Giá trị đơn TB" value={money(metrics.averageOrder)} icon={Star} />
        <Stat label="Khách hàng mới" value={metrics.customers || 0} icon={Users} />
      </div>
      <h2 className="admin-section-title">Thống Kê Tin Tức</h2>
      <div className="admin-metric-grid">
        <Stat label="Tổng bài viết" value={postStats.total || 0} icon={FileText} />
        <Stat label="Đã xuất bản" value={postStats.published || 0} icon={Eye} />
        <Stat label="Bản nháp" value={postStats.drafts || 0} icon={FileText} />
        <Stat label="Sản phẩm" value={metrics.products || 0} icon={Package} />
      </div>
      <div className="admin-dashboard-grid">
        <section className="admin-card admin-card-large"><div className="admin-card-head"><h2>Lượt Xem Tin Tức Theo Tháng</h2><span>Xu hướng 12 tháng qua</span></div><div className="admin-placeholder-chart">Chưa có bảng view tracking, sẵn sàng nối khi bổ sung schema.</div></section>
        <section className="admin-card"><div className="admin-card-head"><h2>Bài Viết Theo Danh Mục</h2></div><Donut /></section>
      </div>
      <section className="admin-card"><div className="admin-card-head"><h2>Bài Viết Được Xem Nhiều Nhất</h2><span>Top 10 bài viết có lượt xem cao nhất</span></div><p className="admin-empty">Chưa có dữ liệu lượt xem</p></section>
    </section>
  );
}
