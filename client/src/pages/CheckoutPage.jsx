import { useState } from 'react';
import { Link } from 'react-router-dom';
import { api, money } from '../api.js';
import { useCart } from '../context/CartContext.jsx';

export default function CheckoutPage() {
  const { items, total, clear } = useCart();
  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [form, setForm] = useState({ fullName: '', phone: '', email: '', line1: '', ward: '', district: '', province: '', note: '' });
  const [order, setOrder] = useState(null);

  async function submit(e) {
    e.preventDefault();
    const created = await api('/orders', {
      method: 'POST',
      body: JSON.stringify({
        customer: form,
        paymentMethod,
        items: items.map((item) => ({ productId: item.productId, variantId: item.variantId || null, quantity: item.quantity })),
      }),
    });
    clear();
    setOrder(created);
  }

  if (order) {
    return (
      <section className="container page success-box">
        <h1>Đặt hàng thành công</h1>
        <p>Mã đơn hàng: <strong>{order.code}</strong></p>
        <p>Tổng thanh toán: <strong>{money(order.total)}</strong></p>
        {order.payment?.method === 'QR_TRANSFER' && <p>Nội dung chuyển khoản: <strong>{order.payment.qrContent}</strong></p>}
        <Link className="btn btn-primary" to="/san-pham">Tiếp tục mua sắm</Link>
      </section>
    );
  }

  if (!items.length) return <section className="container page"><div className="empty-state">Không có sản phẩm để thanh toán.</div></section>;

  return (
    <section className="container page checkout-layout">
      <form className="checkout-form" onSubmit={submit}>
        <h1>Thông tin thanh toán</h1>
        {Object.entries({ fullName: 'Họ tên', phone: 'Số điện thoại', email: 'Email', line1: 'Địa chỉ', ward: 'Phường/Xã', district: 'Quận/Huyện', province: 'Tỉnh/Thành', note: 'Ghi chú' }).map(([key, label]) => (
          <label key={key}>{label}<input required={['fullName', 'phone', 'line1'].includes(key)} value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })} /></label>
        ))}
        <label>Thanh toán
          <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
            <option value="COD">Thanh toán khi nhận hàng</option>
            <option value="QR_TRANSFER">Chuyển khoản QR demo</option>
          </select>
        </label>
        <button className="btn btn-primary" type="submit">Đặt hàng</button>
      </form>
      <aside className="summary">
        <h2>Đơn hàng của bạn</h2>
        {items.map((item) => <p key={item.key}>{item.name} x {item.quantity}<strong>{money(item.price * item.quantity)}</strong></p>)}
        <p>Phí vận chuyển <strong>{total >= 300000 ? 'Miễn phí' : money(30000)}</strong></p>
        <p>Tổng cộng <strong>{money(total + (total >= 300000 ? 0 : 30000))}</strong></p>
      </aside>
    </section>
  );
}
