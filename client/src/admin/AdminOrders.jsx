import { useEffect, useState } from 'react';
import { api, money } from '../api.js';

const statuses = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPING', 'COMPLETED', 'CANCELLED'];

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  async function load() {
    setOrders(await api('/admin/orders'));
  }
  useEffect(() => { load(); }, []);

  async function update(id, status) {
    await api(`/admin/orders/${id}`, { method: 'PATCH', body: JSON.stringify({ status }) });
    load();
  }

  return (
    <section className="admin-page">
      <h1>Đơn hàng</h1>
      <div className="admin-table">
        {orders.map((order) => (
          <div className="admin-order" key={order.id}>
            <div>
              <strong>{order.code}</strong>
              <span>{order.address.fullName} - {order.address.phone}</span>
            </div>
            <span>{money(order.total)}</span>
            <select value={order.status} onChange={(e) => update(order.id, e.target.value)}>
              {statuses.map((status) => <option key={status}>{status}</option>)}
            </select>
          </div>
        ))}
      </div>
    </section>
  );
}
