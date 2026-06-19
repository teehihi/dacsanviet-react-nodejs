import { Link } from 'react-router-dom';
import { money } from '../api.js';
import { useCart } from '../context/CartContext.jsx';

export default function CartPage() {
  const { items, total, updateQuantity, removeItem } = useCart();
  return (
    <section className="container page">
      <h1>Giỏ hàng</h1>
      {!items.length ? <div className="empty-state">Giỏ hàng đang trống. <Link to="/san-pham">Tiếp tục mua sắm</Link></div> : (
        <div className="cart-layout">
          <div className="cart-list">
            {items.map((item) => (
              <div className="cart-item" key={item.key}>
                <img src={item.image || '/assets/dacsanvietLogo.png'} alt={item.name} />
                <div>
                  <strong>{item.name}</strong>
                  {item.variantName && <span>{item.variantName}</span>}
                  <span>{money(item.price)}</span>
                </div>
                <input type="number" min="1" value={item.quantity} onChange={(e) => updateQuantity(item.key, Number(e.target.value))} />
                <button onClick={() => removeItem(item.key)}>Xóa</button>
              </div>
            ))}
          </div>
          <aside className="summary">
            <h2>Tổng giỏ hàng</h2>
            <p>Tạm tính <strong>{money(total)}</strong></p>
            <p>Phí vận chuyển <strong>{total >= 300000 ? 'Miễn phí' : money(30000)}</strong></p>
            <Link className="btn btn-primary" to="/thanh-toan">Tiến hành thanh toán</Link>
          </aside>
        </div>
      )}
    </section>
  );
}
