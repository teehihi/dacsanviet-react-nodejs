import { useEffect, useState } from 'react';
import { api, money } from '../api.js';

export default function AdminDashboard() {
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    api('/admin/products').then(setProducts);
    api('/admin/orders').then(setOrders);
  }, []);

  const revenue = orders.reduce((sum, order) => sum + Number(order.total || 0), 0);
  return (
    <section className="admin-page">
      <h1>Tổng quan</h1>
      <div className="metric-grid">
        <div><span>Sản phẩm</span><strong>{products.length}</strong></div>
        <div><span>Đơn hàng</span><strong>{orders.length}</strong></div>
        <div><span>Doanh thu demo</span><strong>{money(revenue)}</strong></div>
      </div>
    </section>
  );
}
